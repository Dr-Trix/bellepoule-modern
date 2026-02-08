"use strict";
/**
 * BellePoule Modern - Event Manager Hook
 * Proper cleanup of event listeners and timers
 * Licensed under GPL-3.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIPCEvents = exports.useAutoSave = exports.useWindowResize = exports.useKeyboardEvents = exports.useEventManager = void 0;
const react_1 = require("react");
const useEventManager = () => {
    const listenersRef = (0, react_1.useRef)([]);
    const timersRef = (0, react_1.useRef)([]);
    const addEventListener = (0, react_1.useCallback)((element, event, handler, options) => {
        element.addEventListener(event, handler, options);
        listenersRef.current.push({ element, event, handler, options });
    }, []);
    const removeEventListener = (0, react_1.useCallback)((element, event, handler, options) => {
        element.removeEventListener(event, handler, options);
        listenersRef.current = listenersRef.current.filter(listener => !(listener.element === element && listener.event === event && listener.handler === handler));
    }, []);
    const setTimeout = (0, react_1.useCallback)((callback, delay) => {
        const id = window.setTimeout(callback, delay);
        timersRef.current.push({ id, type: 'timeout' });
        return id;
    }, []);
    const setInterval = (0, react_1.useCallback)((callback, delay) => {
        const id = window.setInterval(callback, delay);
        timersRef.current.push({ id, type: 'interval' });
        return id;
    }, []);
    const clearTimeout = (0, react_1.useCallback)((id) => {
        window.clearTimeout(id);
        timersRef.current = timersRef.current.filter(timer => timer.id !== id);
    }, []);
    const clearInterval = (0, react_1.useCallback)((id) => {
        window.clearInterval(id);
        timersRef.current = timersRef.current.filter(timer => timer.id !== id);
    }, []);
    const cleanup = (0, react_1.useCallback)(() => {
        // Remove all event listeners
        listenersRef.current.forEach(({ element, event, handler, options }) => {
            try {
                element.removeEventListener(event, handler, options);
            }
            catch (error) {
                console.warn('Error removing event listener:', error);
            }
        });
        listenersRef.current = [];
        // Clear all timers
        timersRef.current.forEach(({ id, type }) => {
            try {
                if (type === 'timeout') {
                    window.clearTimeout(id);
                }
                else {
                    window.clearInterval(id);
                }
            }
            catch (error) {
                console.warn('Error clearing timer:', error);
            }
        });
        timersRef.current = [];
    }, []);
    // Auto cleanup on unmount
    (0, react_1.useEffect)(() => {
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
exports.useEventManager = useEventManager;
// ============================================================================
// Keyboard Event Hook
// ============================================================================
const useKeyboardEvents = (keyMap, dependencies = []) => {
    const { addEventListener, removeEventListener } = (0, exports.useEventManager)();
    (0, react_1.useEffect)(() => {
        const handleKeyDown = (event) => {
            const keyboardEvent = event;
            const key = keyboardEvent.key.toLowerCase();
            const handler = keyMap[key];
            if (handler) {
                keyboardEvent.preventDefault();
                handler();
            }
        };
        addEventListener(window, 'keydown', handleKeyDown);
        return () => {
            removeEventListener(window, 'keydown', handleKeyDown);
        };
    }, [keyMap, dependencies, addEventListener, removeEventListener]);
};
exports.useKeyboardEvents = useKeyboardEvents;
// ============================================================================
// Window Resize Hook
// ============================================================================
const useWindowResize = (handler, debounceMs = 100) => {
    const { addEventListener, removeEventListener, setTimeout: customSetTimeout, clearTimeout: customClearTimeout } = (0, exports.useEventManager)();
    const timeoutRef = (0, react_1.useRef)(0);
    (0, react_1.useEffect)(() => {
        const handleResize = () => {
            if (timeoutRef.current) {
                customClearTimeout(timeoutRef.current);
            }
            timeoutRef.current = customSetTimeout(handler, debounceMs);
        };
        addEventListener(window, 'resize', handleResize);
        return () => {
            removeEventListener(window, 'resize', handleResize);
            if (timeoutRef.current) {
                customClearTimeout(timeoutRef.current);
            }
        };
    }, [handler, debounceMs, addEventListener, removeEventListener, customSetTimeout, customClearTimeout]);
};
exports.useWindowResize = useWindowResize;
// ============================================================================
// Auto-save Hook
// ============================================================================
const useAutoSave = (saveFunction, intervalMs = 120000 // 2 minutes default
) => {
    const { setInterval: customSetInterval, clearInterval: customClearInterval } = (0, exports.useEventManager)();
    const intervalRef = (0, react_1.useRef)(0);
    const startAutoSave = (0, react_1.useCallback)(() => {
        if (intervalRef.current) {
            customClearInterval(intervalRef.current);
        }
        intervalRef.current = customSetInterval(async () => {
            try {
                await saveFunction();
            }
            catch (error) {
                console.error('Auto-save failed:', error);
            }
        }, intervalMs);
    }, [saveFunction, intervalMs, customSetInterval, customClearInterval]);
    const stopAutoSave = (0, react_1.useCallback)(() => {
        if (intervalRef.current) {
            customClearInterval(intervalRef.current);
            intervalRef.current = 0; // Use 0 instead of undefined
        }
    }, [customClearInterval]);
    (0, react_1.useEffect)(() => {
        startAutoSave();
        return stopAutoSave;
    }, [startAutoSave, stopAutoSave]);
    return {
        startAutoSave,
        stopAutoSave
    };
};
exports.useAutoSave = useAutoSave;
// ============================================================================
// IPC Event Hook for Electron
// ============================================================================
const useIPCEvents = (eventHandlers) => {
    const listenersRef = (0, react_1.useRef)([]);
    (0, react_1.useEffect)(() => {
        if (typeof window !== 'undefined' && window.electronAPI) {
            // Register all event handlers
            Object.entries(eventHandlers).forEach(([event, handler]) => {
                const ipcHandler = (...args) => {
                    try {
                        handler(...args);
                    }
                    catch (error) {
                        console.error(`Error in IPC event handler for ${event}:`, error);
                    }
                };
                // Store for cleanup
                listenersRef.current.push({ channel: event, handler: ipcHandler });
                // Register with electronAPI if method exists
                const methodName = `on${event.charAt(0).toUpperCase() + event.slice(1)}`;
                const method = window.electronAPI[methodName];
                if (typeof method === 'function') {
                    method(ipcHandler);
                }
            });
        }
        // Cleanup function
        return () => {
            if (typeof window !== 'undefined' && window.electronAPI) {
                listenersRef.current.forEach(({ channel }) => {
                    try {
                        if (typeof window.electronAPI.removeAllListeners === 'function') {
                            window.electronAPI.removeAllListeners(`menu:${channel}`);
                        }
                    }
                    catch (error) {
                        console.warn('Error removing IPC listener:', error);
                    }
                });
            }
            listenersRef.current = [];
        };
    }, [eventHandlers]);
};
exports.useIPCEvents = useIPCEvents;
//# sourceMappingURL=useEventManager.js.map