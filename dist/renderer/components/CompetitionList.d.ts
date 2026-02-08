/**
 * BellePoule Modern - Competition List Component
 * Licensed under GPL-3.0
 */
import React from 'react';
import { Competition } from '../../shared/types';
interface CompetitionListProps {
    competitions: Competition[];
    isLoading: boolean;
    onSelect: (competition: Competition) => void;
    onDelete: (id: string) => void;
    onNewCompetition: () => void;
}
declare const CompetitionList: React.FC<CompetitionListProps>;
export default CompetitionList;
//# sourceMappingURL=CompetitionList.d.ts.map