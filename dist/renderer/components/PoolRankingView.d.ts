/**
 * BellePoule Modern - Pool Ranking View Component
 * Shows ranking after pools with export/print functionality
 * Licensed under GPL-3.0
 */
import React from 'react';
import { Pool, Weapon } from '../../shared/types';
interface PoolRankingViewProps {
    pools: Pool[];
    weapon?: Weapon;
    onGoToTableau?: () => void;
    onGoToResults?: () => void;
    hasDirectElimination?: boolean;
    onExport?: (format: 'csv' | 'xml' | 'pdf') => void;
}
declare const PoolRankingView: React.FC<PoolRankingViewProps>;
export default PoolRankingView;
//# sourceMappingURL=PoolRankingView.d.ts.map