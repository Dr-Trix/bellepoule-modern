/**
 * BellePoule Modern - Edit Fencer Modal Component
 * Licensed under GPL-3.0
 */
import React from 'react';
import { Fencer } from '../../shared/types';
interface EditFencerModalProps {
    fencer: Fencer;
    onSave: (id: string, updates: Partial<Fencer>) => void;
    onClose: () => void;
}
declare const EditFencerModal: React.FC<EditFencerModalProps>;
export default EditFencerModal;
//# sourceMappingURL=EditFencerModal.d.ts.map