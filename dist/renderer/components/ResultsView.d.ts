/**
 * BellePoule Modern - Results View Component
 * Final competition results display
 * Licensed under GPL-3.0
 */
import React from 'react';
import { Fencer, PoolRanking, Competition } from '../../shared/types';
interface FinalResult {
    rank: number;
    fencer: Fencer;
    eliminatedAt?: string;
    questPoints?: number;
}
interface ResultsViewProps {
    competition: Competition;
    poolRanking: PoolRanking[];
    finalResults: FinalResult[];
}
declare const ResultsView: React.FC<ResultsViewProps>;
export default ResultsView;
//# sourceMappingURL=ResultsView.d.ts.map