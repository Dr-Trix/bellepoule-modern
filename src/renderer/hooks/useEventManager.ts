/**
 * BellePoule Modern - Event Manager Hook
 * Proper cleanup of event listeners and timers
 * Licensed under GPL-3.0
 */

import { useEffect, useRef, useCallback } from 'react';

// ============================================================================
// Event Listener Management Hook
// ============================================================================

interface EventListener {
  element: EventTarget;
  event: string;
  handler: EventListener;
  options?: boolean | AddEventListenerOptions;
}

export const useEventManager = () => {
  const listenersRef = useRef<EventListener[]>([]);
  const timersRef = useRef<Array<{ id: number; type: 'timeout' | 'interval' }>>([]);

  const addEventListener = useCallback((
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ) => {
    element.addEventListener(event, handler, options);
    listenersRef.current.push({ element, event, handler, options });
  }, []);

  const removeEventListener = useCallback((
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | EventListenerOptions
  ) => {
    element.removeEventListener(event, handler, options);
    listenersRef.current = listenersRef.current.filter(
      listener => !(listener.element === element && listener.event === event && listener.handler === handler)
    );
  }, []);

  const setTimeout = useCallback((callback: () => void, delay: number): number => {
    const id = window.setTimeout(callback, delay);
    timersRef.current.push({ id, type: 'timeout' });
    return id;
  }, []);

  const setInterval = useCallback((callback: () => void, delay: number): number => {
    const id = window.setInterval(callback, delay);
    timersRef.current.push({ id, type: 'interval' });
    return id;
  }, []);

  const clearTimeout = useCallback((id: number) => {
    window.clearTimeout(id);
    timersRef.current = timersRef.current.filter(timer => timer.id !== id);
  }, []);

  const clearInterval = useCallback((id: number) => {
    window.clearInterval(id);
    timersRef.current = timersRef.current.filter(timer => timer.id !== id);
  }, []);

  const cleanup = useCallback(() => {
    // Remove all event listeners
    listenersRef.current.forEach(({ element, event, handler, options }) => {
      try {
        element.removeEventListener(event, handler, options);
      } catch (error) {
        console.warn('Error removing event listener:', error);
      }
    });
    listenersRef.current = [];

    // Clear all timers
    timersRef.current.forEach(({ id, type }) => {
      try {
        if (type === 'timeout') {
          window.clearTimeout(id);
        } else {
          window.clearInterval(id);
        }
      } catch (error) {
        console.warn('Error clearing timer:', error);
      }
    });
    timersRef.current = [];
  }, []);

  // Auto cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    addEventListener,
    removeEventListener,
    setTimeout,
    setInterval,
    clearTimeout,
    clearInterval,
    cleanup
  };
};

// ============================================================================
// Keyboard Event Hook
// ============================================================================

export const useKeyboardEvents = (
  keyMap: Record<string, () => void>,
  dependencies: any[] = []
) => {
  const { addEventListener, removeEventListener } = useEventManager();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const handler = keyMap[key];
      
      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    addEventListener(window, 'keydown', handleKeyDown);

    return () => {
      removeEventListener(window, 'keydown', handleKeyDown);
    };
  }, [keyMap, dependencies, addEventListener, removeEventListener]);
};

// ============================================================================
// Window Resize Hook
// ============================================================================

export const useWindowResize = (
  handler: () => void,
  debounceMs: number = 100
) => {
  const { addEventListener, removeEventListener, setTimeout } = useEventManager();
  const timeoutRef = useRef<number>();

  useEffect(() => {
    const handleResize = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(handler, debounceMs);
    };

    addEventListener(window, 'resize', handleResize);

    return () => {
      removeEventListener(window, 'resize', handleResize);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handler, debounceMs, addEventListener, removeEventListener, setTimeout]);
};

// ============================================================================
// Auto-save Hook
// ============================================================================

export const useAutoSave = (
  saveFunction: () => Promise<void>,
  intervalMs: number = 120000 // 2 minutes default
) => {
  const { setInterval, clearInterval } = useEventManager();
  const intervalRef = useRef<number>();

  const startAutoSave = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      try {
        await saveFunction();
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, intervalMs);
  }, [saveFunction, intervalMs, setInterval, clearInterval]);

  const stopAutoSave = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, [clearInterval]);

  useEffect(() => {
    startAutoSave();
    return stopAutoSave;
  }, [startAutoSave, stopAutoSave]);

  return {
    startAutoSave,
    stopAutoSave
  };
};

// ============================================================================
// IPC Event Hook for Electron
// ============================================================================

export const useIPCEvents = (
  eventHandlers: Record<string, (...args: any[]) => void>
) => {
  const listenersRef = useRef<Array<{ channel: string; handler: Function }>>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      // Register all event handlers
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        const ipcHandler = (...args: any[]) => {
          try {
            handler(...args);
          } catch (error) {
            console.error(`Error in IPC event handler for ${event}:`, error);
          }
        };

        // Store for cleanup
        listenersRef.current.push({ channel: event, handler: ipcHandler });

        // Register with electronAPI if method exists
        const methodName = `on${event.charAt(0).toUpperCase() + event.slice(1)}`;
        if (typeof window.electronAPI[methodName] === 'function') {
          (window.electronAPI as any)[methodName](ipcHandler);
        }
      });
    }

    // Cleanup function
    return () => {
      if (typeof window !== 'undefined' && window.electronAPI) {
        listenersRef.current.forEach(({ channel }) => {
          try {
            if (typeof window.electronAPI.removeAllListeners === 'function') {
              window.electronAPI.removeAllListeners(channel);
            }
          } catch (error) {
            console.warn('Error removing IPC listener:', error);
          }
        });
      }
      listenersRef.current = [];
    };
  }, [eventHandlers]);
};