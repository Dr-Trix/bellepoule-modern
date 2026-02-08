/**
 * BellePoule Modern - New Competition Modal
 * Licensed under GPL-3.0
 */
import React from 'react';
import { Competition } from '../../shared/types';
interface NewCompetitionModalProps {
    onClose: () => void;
    onCreate: (data: Partial<Competition>) => void;
}
declare const NewCompetitionModal: React.FC<NewCompetitionModalProps>;
export default NewCompetitionModal;
//# sourceMappingURL=NewCompetitionModal.d.ts.map