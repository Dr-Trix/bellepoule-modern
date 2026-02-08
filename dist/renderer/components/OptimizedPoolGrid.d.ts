/**
 * BellePoule Modern - Optimized Pool Grid Component
 * Efficient rendering of pool results grid
 * Licensed under GPL-3.0
 */
import React from 'react';
import { Fencer, Match } from '../../shared/types';
interface PoolGridProps {
    fencers: Fencer[];
    matches: Match[];
    maxScore: number;
    onMatchClick: (match: Match) => void;
}
export declare const PoolGrid: React.FC<PoolGridProps>;
export {};
//# sourceMappingURL=OptimizedPoolGrid.d.ts.map