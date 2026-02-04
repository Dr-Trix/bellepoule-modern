"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * BellePoule Modern - Import Modal Component
 * Licensed under GPL-3.0
 */
const react_1 = __importStar(require("react"));
const fileParser_1 = require("../../shared/utils/fileParser");
const ImportModal = ({ format, filepath, content, onImport, onClose, }) => {
    const [result, setResult] = (0, react_1.useState)(null);
    const [selectedFencers, setSelectedFencers] = (0, react_1.useState)(new Set());
    react_1.default.useEffect(() => {
        // Parser le fichier selon le format
        let parseResult;
        if (format === 'xml') {
            parseResult = (0, fileParser_1.parseXMLFile)(content);
        }
        else {
            parseResult = (0, fileParser_1.parseFFEFile)(content);
        }
        setResult(parseResult);
        // Sélectionner tous les tireurs par défaut
        setSelectedFencers(new Set(parseResult.fencers.map((_, i) => i)));
    }, [format, content]);
    const toggleFencer = (index) => {
        const newSelected = new Set(selectedFencers);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        }
        else {
            newSelected.add(index);
        }
        setSelectedFencers(newSelected);
    };
    const toggleAll = () => {
        if (result) {
            if (selectedFencers.size === result.fencers.length) {
                setSelectedFencers(new Set());
            }
            else {
                setSelectedFencers(new Set(result.fencers.map((_, i) => i)));
            }
        }
    };
    const handleImport = () => {
        if (result) {
            const fencersToImport = result.fencers.filter((_, i) => selectedFencers.has(i));
            onImport(fencersToImport);
            onClose();
        }
    };
    const filename = filepath.split(/[/\\]/).pop() || filepath;
    return ((0, jsx_runtime_1.jsx)("div", { className: "modal-overlay", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "modal", onClick: e => e.stopPropagation(), style: { maxWidth: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "modal-header", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Importer des tireurs" }), (0, jsx_runtime_1.jsx)("button", { className: "btn-close", onClick: onClose, children: "\u00D7" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "modal-body", style: { flex: 1, overflow: 'auto' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '1rem', padding: '0.75rem', background: '#f3f4f6', borderRadius: '6px' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Fichier:" }), " ", filename, (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsx)("strong", { children: "Format:" }), " ", format.toUpperCase()] }), result && result.errors && result.errors.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '6px', color: '#dc2626' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Erreurs:" }), (0, jsx_runtime_1.jsx)("ul", { style: { margin: '0.5rem 0 0 1rem', padding: 0 }, children: result.errors.map((err, i) => (0, jsx_runtime_1.jsx)("li", { children: err }, i)) })] })), result && result.warnings && result.warnings.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '1rem', padding: '0.75rem', background: '#fef3c7', borderRadius: '6px', color: '#d97706' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Avertissements:" }), (0, jsx_runtime_1.jsx)("ul", { style: { margin: '0.5rem 0 0 1rem', padding: 0, maxHeight: '100px', overflow: 'auto' }, children: result.warnings.map((warn, i) => (0, jsx_runtime_1.jsx)("li", { children: warn }, i)) })] })), result && result.fencers.length > 0 ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }, children: [(0, jsx_runtime_1.jsxs)("span", { children: [(0, jsx_runtime_1.jsx)("strong", { children: result.fencers.length }), " tireurs trouv\u00E9s"] }), (0, jsx_runtime_1.jsx)("button", { onClick: toggleAll, style: {
                                                padding: '0.25rem 0.75rem',
                                                fontSize: '0.875rem',
                                                background: '#e5e7eb',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }, children: selectedFencers.size === result.fencers.length ? 'Désélectionner tout' : 'Sélectionner tout' })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        maxHeight: '300px',
                                        overflow: 'auto'
                                    }, children: (0, jsx_runtime_1.jsxs)("table", { style: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }, children: [(0, jsx_runtime_1.jsx)("thead", { style: { position: 'sticky', top: 0, background: '#f9fafb' }, children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { style: { padding: '0.5rem', textAlign: 'center', width: '40px' }, children: "\u2713" }), (0, jsx_runtime_1.jsx)("th", { style: { padding: '0.5rem', textAlign: 'left' }, children: "Nom" }), (0, jsx_runtime_1.jsx)("th", { style: { padding: '0.5rem', textAlign: 'left' }, children: "Pr\u00E9nom" }), (0, jsx_runtime_1.jsx)("th", { style: { padding: '0.5rem', textAlign: 'center' }, children: "Sexe" }), (0, jsx_runtime_1.jsx)("th", { style: { padding: '0.5rem', textAlign: 'left' }, children: "Club" }), (0, jsx_runtime_1.jsx)("th", { style: { padding: '0.5rem', textAlign: 'center' }, children: "Classement" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: result.fencers.map((fencer, index) => ((0, jsx_runtime_1.jsxs)("tr", { onClick: () => toggleFencer(index), style: {
                                                        cursor: 'pointer',
                                                        background: selectedFencers.has(index) ? '#dbeafe' : 'transparent',
                                                        borderBottom: '1px solid #e5e7eb'
                                                    }, children: [(0, jsx_runtime_1.jsx)("td", { style: { padding: '0.5rem', textAlign: 'center' }, children: (0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: selectedFencers.has(index), onChange: () => toggleFencer(index) }) }), (0, jsx_runtime_1.jsx)("td", { style: { padding: '0.5rem' }, children: fencer.lastName }), (0, jsx_runtime_1.jsx)("td", { style: { padding: '0.5rem' }, children: fencer.firstName }), (0, jsx_runtime_1.jsx)("td", { style: { padding: '0.5rem', textAlign: 'center' }, children: fencer.gender }), (0, jsx_runtime_1.jsx)("td", { style: { padding: '0.5rem' }, children: fencer.club || '-' }), (0, jsx_runtime_1.jsx)("td", { style: { padding: '0.5rem', textAlign: 'center' }, children: fencer.ranking || '-' })] }, index))) })] }) })] })) : result ? ((0, jsx_runtime_1.jsx)("div", { style: { textAlign: 'center', padding: '2rem', color: '#6b7280' }, children: "Aucun tireur trouv\u00E9 dans ce fichier" })) : ((0, jsx_runtime_1.jsx)("div", { style: { textAlign: 'center', padding: '2rem' }, children: "Chargement..." }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "modal-footer", children: [(0, jsx_runtime_1.jsx)("button", { className: "btn btn-secondary", onClick: onClose, children: "Annuler" }), (0, jsx_runtime_1.jsxs)("button", { className: "btn btn-primary", onClick: handleImport, disabled: selectedFencers.size === 0, children: ["Importer ", selectedFencers.size, " tireur", selectedFencers.size > 1 ? 's' : ''] })] })] }) }));
};
exports.default = ImportModal;
//# sourceMappingURL=ImportModal.js.map