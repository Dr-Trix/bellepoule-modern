/**
 * BellePoule Modern - Toast Notification Component
 * Replaces native alert() to avoid focus issues in Electron
 * Licensed under GPL-3.0
 */
import React from 'react';
type ToastType = 'info' | 'success' | 'warning' | 'error';
interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}
export declare const ToastProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useToast: () => ToastContextType;
export default ToastProvider;
//# sourceMappingURL=Toast.d.ts.map