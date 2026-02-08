/**
 * BellePoule Modern - Competition Properties Modal
 * Licensed under GPL-3.0
 */
import React from 'react';
import { Competition } from '../../shared/types';
interface CompetitionPropertiesModalProps {
    competition: Competition;
    onSave: (updates: Partial<Competition>) => void;
    onClose: () => void;
}
declare const CompetitionPropertiesModal: React.FC<CompetitionPropertiesModalProps>;
export default CompetitionPropertiesModal;
//# sourceMappingURL=CompetitionPropertiesModal.d.ts.map