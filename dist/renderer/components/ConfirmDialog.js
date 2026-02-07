"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useConfirm = exports.ConfirmProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * BellePoule Modern - Confirm Dialog Component
 * Remplace window.confirm() natif pour éviter les problèmes de focus dans Electron
 * Licensed under GPL-3.0
 */
const react_1 = require("react");
const ConfirmContext = (0, react_1.createContext)(null);
const ConfirmProvider = ({ children }) => {
    const [pending, setPending] = (0, react_1.useState)(null);
    const confirmBtnRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (pending && confirmBtnRef.current) {
            confirmBtnRef.current.focus();
        }
    }, [pending]);
    const confirm = (0, react_1.useCallback)((messageOrOptions) => {
        const options = typeof messageOrOptions === 'string'
            ? { message: messageOrOptions }
            : messageOrOptions;
        return new Promise((resolve) => {
            setPending({
                message: options.message,
                confirmLabel: options.confirmLabel || 'OK',
                cancelLabel: options.cancelLabel || 'Annuler',
                resolve,
            });
        });
    }, []);
    const handleConfirm = () => {
        if (pending) {
            pending.resolve(true);
            setPending(null);
        }
    };
    const handleCancel = () => {
        if (pending) {
            pending.resolve(false);
            setPending(null);
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            handleCancel();
        }
    };
    return ((0, jsx_runtime_1.jsxs)(ConfirmContext.Provider, { value: { confirm }, children: [children, pending && ((0, jsx_runtime_1.jsx)("div", { className: "modal-overlay", onClick: handleCancel, onKeyDown: handleKeyDown, style: { zIndex: 11000 }, children: (0, jsx_runtime_1.jsxs)("div", { className: "modal", onClick: (e) => e.stopPropagation(), style: { maxWidth: '420px' }, children: [(0, jsx_runtime_1.jsx)("div", { className: "modal-header", children: (0, jsx_runtime_1.jsx)("h2", { className: "modal-title", children: "Confirmation" }) }), (0, jsx_runtime_1.jsx)("div", { className: "modal-body", children: (0, jsx_runtime_1.jsx)("p", { style: { whiteSpace: 'pre-line', margin: 0 }, children: pending.message }) }), (0, jsx_runtime_1.jsxs)("div", { className: "modal-footer", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "btn btn-secondary", onClick: handleCancel, children: pending.cancelLabel }), (0, jsx_runtime_1.jsx)("button", { ref: confirmBtnRef, type: "button", className: "btn btn-primary", onClick: handleConfirm, children: pending.confirmLabel })] })] }) }))] }));
};
exports.ConfirmProvider = ConfirmProvider;
const useConfirm = () => {
    const context = (0, react_1.useContext)(ConfirmContext);
    if (!context) {
        // Fallback si utilisé en dehors du provider
        return {
            confirm: async (messageOrOptions) => {
                const msg = typeof messageOrOptions === 'string' ? messageOrOptions : messageOrOptions.message;
                return window.confirm(msg);
            }
        };
    }
    return context;
};
exports.useConfirm = useConfirm;
exports.default = exports.ConfirmProvider;
//# sourceMappingURL=ConfirmDialog.js.map