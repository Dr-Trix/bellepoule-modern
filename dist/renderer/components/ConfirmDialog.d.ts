/**
 * BellePoule Modern - Confirm Dialog Component
 * Remplace window.confirm() natif pour éviter les problèmes de focus dans Electron
 * Licensed under GPL-3.0
 */
import React from 'react';
interface ConfirmOptions {
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
}
interface ConfirmContextType {
    confirm: (messageOrOptions: string | ConfirmOptions) => Promise<boolean>;
}
export declare const ConfirmProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useConfirm: () => ConfirmContextType;
export default ConfirmProvider;
//# sourceMappingURL=ConfirmDialog.d.ts.map