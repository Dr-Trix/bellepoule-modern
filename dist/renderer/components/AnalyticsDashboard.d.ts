/**
 * BellePoule Modern - Analytics Dashboard Component
 * Real-time performance analytics for coaches
 * Licensed under GPL-3.0
 */
import React from 'react';
import { Competition, Fencer, Pool, Match } from '../../shared/types';
interface AnalyticsDashboardProps {
    competition: Competition;
    pools: Pool[];
    matches: Match[];
    fencers: Fencer[];
    className?: string;
}
export declare const AnalyticsDashboard: React.FC<AnalyticsDashboardProps>;
export {};
//# sourceMappingURL=AnalyticsDashboard.d.ts.map