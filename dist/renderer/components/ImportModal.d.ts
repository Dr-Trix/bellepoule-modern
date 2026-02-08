/**
 * BellePoule Modern - Import Modal Component
 * Licensed under GPL-3.0
 */
import React from 'react';
import { Fencer } from '../../shared/types';
interface ImportModalProps {
    format: string;
    filepath: string;
    content: string;
    onImport: (fencers: Partial<Fencer>[]) => void;
    onClose: () => void;
}
declare const ImportModal: React.FC<ImportModalProps>;
export default ImportModal;
//# sourceMappingURL=ImportModal.d.ts.map