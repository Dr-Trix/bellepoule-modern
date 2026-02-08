/**
 * BellePoule Modern - Pool View Component
 * With classic grid view and match list view
 * Licensed under GPL-3.0
 */
import React from 'react';
import { Pool, Fencer, Weapon } from '../../shared/types';
interface PoolViewProps {
    pool: Pool;
    maxScore?: number;
    weapon?: Weapon;
    onScoreUpdate: (matchIndex: number, scoreA: number, scoreB: number, winnerOverride?: 'A' | 'B', specialStatus?: 'abandon' | 'forfait' | 'exclusion') => void;
    onFencerChangePool?: (fencer: Fencer) => void;
}
declare const PoolView: React.FC<PoolViewProps>;
export default PoolView;
//# sourceMappingURL=PoolView.d.ts.map