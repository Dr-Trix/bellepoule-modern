/**
 * BellePoule Modern - Offline Hook
 * React hook for offline-first functionality
 * Licensed under GPL-3.0
 */
import { Competition, Fencer, Pool, Match } from '../../shared/types';
export interface UseOfflineResult {
    isOnline: boolean;
    isSyncing: boolean;
    pendingActions: number;
    conflicts: number;
    lastSync: number | null;
    sync: () => Promise<void>;
    refreshCache: (competitionId: string) => Promise<void>;
    cacheData: {
        competitions: Competition[];
        fencers: Fencer[];
        pools: Pool[];
        matches: Match[];
    };
}
export declare const useOffline: (competitionId?: string) => UseOfflineResult;
//# sourceMappingURL=useOffline.d.ts.map