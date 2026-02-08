/**
 * BellePoule Modern - Tableau View Component
 * Direct Elimination Table
 * Licensed under GPL-3.0
 */
import React from 'react';
import { Fencer, PoolRanking } from '../../shared/types';
export interface TableauMatch {
    id: string;
    round: number;
    position: number;
    fencerA: Fencer | null;
    fencerB: Fencer | null;
    scoreA: number | null;
    scoreB: number | null;
    winner: Fencer | null;
    isBye: boolean;
}
export interface FinalResult {
    rank: number;
    fencer: Fencer;
    eliminatedAt: string;
}
interface TableauViewProps {
    ranking: PoolRanking[];
    matches: TableauMatch[];
    onMatchesChange: (matches: TableauMatch[]) => void;
    maxScore?: number;
    onComplete?: (results: FinalResult[]) => void;
    thirdPlaceMatch?: boolean;
}
declare const TableauView: React.FC<TableauViewProps>;
export default TableauView;
//# sourceMappingURL=TableauView.d.ts.map