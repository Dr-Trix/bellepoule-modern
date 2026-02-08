/**
 * BellePoule Modern - Add Fencer Modal
 * Licensed under GPL-3.0
 */
import React from 'react';
import { Fencer } from '../../shared/types';
interface AddFencerModalProps {
    onClose: () => void;
    onAdd: (fencer: Partial<Fencer>) => void;
}
declare const AddFencerModal: React.FC<AddFencerModalProps>;
export default AddFencerModal;
//# sourceMappingURL=AddFencerModal.d.ts.map