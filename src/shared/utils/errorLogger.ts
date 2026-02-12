/**
 * BellePoule Modern - Error Logging Utility
 * Centralized error tracking and logging
 * Licensed under GPL-3.0
 */

export interface ErrorLogEntry {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  component?: string;
  context?: Record<string, unknown>;
  userAgent?: string;
  url?: string;
}

const STORAGE_KEY = 'bellepoule-error-logs';
const MAX_LOGS = 100;

/**
 * Generate unique ID for log entry
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all error logs from localStorage
 */
export function getErrorLogs(): ErrorLogEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const logs = JSON.parse(stored);
      return logs.map((log: ErrorLogEntry) => ({
        ...log,
        timestamp: new Date(log.timestamp),
      }));
    }
  } catch (error) {
    console.error('Failed to load error logs:', error);
  }
  return [];
}

/**
 * Save error logs to localStorage
 */
function saveErrorLogs(logs: ErrorLogEntry[]): void {
  try {
    // Keep only last MAX_LOGS entries
    const trimmed = logs.slice(-MAX_LOGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save error logs:', error);
  }
}

/**
 * Log an error
 */
export function logError(
  error: Error | string,
  component?: string,
  context?: Record<string, unknown>
): void {
  const entry: ErrorLogEntry = {
    id: generateId(),
    timestamp: new Date(),
    level: 'error',
    message: typeof error === 'string' ? error : error.message,
    stack: typeof error === 'string' ? undefined : error.stack,
    component,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  const logs = getErrorLogs();
  logs.push(entry);
  saveErrorLogs(logs);

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[ErrorLogger]', entry);
  }

  // Send to external service if configured
  sendToErrorService(entry);
}

/**
 * Log a warning
 */
export function logWarning(
  message: string,
  component?: string,
  context?: Record<string, unknown>
): void {
  const entry: ErrorLogEntry = {
    id: generateId(),
    timestamp: new Date(),
    level: 'warn',
    message,
    component,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  const logs = getErrorLogs();
  logs.push(entry);
  saveErrorLogs(logs);

  if (process.env.NODE_ENV === 'development') {
    console.warn('[ErrorLogger]', entry);
  }
}

/**
 * Log info
 */
export function logInfo(
  message: string,
  component?: string,
  context?: Record<string, unknown>
): void {
  const entry: ErrorLogEntry = {
    id: generateId(),
    timestamp: new Date(),
    level: 'info',
    message,
    component,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  const logs = getErrorLogs();
  logs.push(entry);
  saveErrorLogs(logs);
}

/**
 * Clear all error logs
 */
export function clearErrorLogs(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get error statistics
 */
export function getErrorStats(): {
  total: number;
  errors: number;
  warnings: number;
  infos: number;
  recent: ErrorLogEntry[];
} {
  const logs = getErrorLogs();
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return {
    total: logs.length,
    errors: logs.filter(l => l.level === 'error').length,
    warnings: logs.filter(l => l.level === 'warn').length,
    infos: logs.filter(l => l.level === 'info').length,
    recent: logs.filter(l => l.timestamp > twentyFourHoursAgo),
  };
}

/**
 * Export logs as JSON
 */
export function exportLogs(): string {
  return JSON.stringify(getErrorLogs(), null, 2);
}

/**
 * Send to external error reporting service
 * (Placeholder for future integration with Sentry, etc.)
 */
function sendToErrorService(entry: ErrorLogEntry): void {
  // TODO: Integrate with Sentry or similar service
  // Example:
  // if (window.Sentry) {
  //   window.Sentry.captureException(entry.message, {
  //     extra: entry.context,
  //     tags: { component: entry.component }
  //   });
  // }
}

/**
 * Global error handler
 */
export function setupGlobalErrorHandler(): void {
  window.onerror = (message, source, lineno, colno, error) => {
    logError(error || String(message), 'Global', {
      source,
      lineno,
      colno,
    });
    return false;
  };

  window.onunhandledrejection = event => {
    logError(event.reason, 'UnhandledPromise', {
      type: 'unhandledrejection',
    });
  };
}

/**
 * Log component lifecycle errors
 */
export function logComponentError(
  component: string,
  phase: 'mount' | 'update' | 'render' | 'unmount',
  error: Error
): void {
  logError(error, component, {
    phase,
    type: 'component-error',
  });
}
