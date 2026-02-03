/**
 * BellePoule Modern - Competition View Component
 * Licensed under GPL-3.0
 */
import React from 'react';
import { Competition } from '../../shared/types';
interface CompetitionViewProps {
    competition: Competition;
    onUpdate: (competition: Competition) => void;
}
declare const CompetitionView: React.FC<CompetitionViewProps>;
export default CompetitionView;
//# sourceMappingURL=CompetitionView.d.ts.map