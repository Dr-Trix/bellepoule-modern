/**
 * BellePoule Modern - Offline Storage Manager
 * IndexedDB wrapper for offline-first architecture
 * Licensed under GPL-3.0
 */
import { Competition, Fencer, Pool, Match } from '../../shared/types';
export interface PendingAction {
    id: string;
    type: 'UPDATE_MATCH' | 'UPDATE_FENCER' | 'CREATE_POOL' | 'DELETE_POOL';
    timestamp: number;
    data: any;
    retryCount?: number;
}
export interface SyncConflict {
    id: string;
    entityType: 'match' | 'fencer' | 'pool';
    entityId: string;
    localVersion: any;
    remoteVersion: any;
    timestamp: number;
    resolved?: boolean;
}
export declare class OfflineStorageManager {
    private dbName;
    private dbVersion;
    private db;
    init(): Promise<void>;
    cacheCompetition(competition: Competition): Promise<void>;
    cacheFencers(fencers: Fencer[]): Promise<void>;
    cachePools(pools: Pool[]): Promise<void>;
    cacheMatches(matches: Match[]): Promise<void>;
    getCachedCompetition(id: string): Promise<Competition | null>;
    getCachedFencers(competitionId?: string): Promise<Fencer[]>;
    getCachedPools(competitionId?: string): Promise<Pool[]>;
    getCachedMatches(competitionId?: string): Promise<Match[]>;
    addPendingAction(action: Omit<PendingAction, 'id' | 'timestamp'>): Promise<string>;
    getPendingActions(): Promise<PendingAction[]>;
    removePendingAction(id: string): Promise<void>;
    incrementRetryCount(id: string): Promise<void>;
    addConflict(conflict: Omit<SyncConflict, 'id' | 'timestamp'>): Promise<string>;
    getConflicts(): Promise<SyncConflict[]>;
    resolveConflict(id: string, resolution: 'local' | 'remote'): Promise<void>;
    getSyncStatus(): Promise<{
        pendingActions: number;
        conflicts: number;
        lastSync: number | null;
    }>;
    clearCache(olderThan?: number): Promise<void>;
    getStorageInfo(): Promise<{
        used: number;
        available: number;
        breakdown: Record<string, number>;
    }>;
    private ensureDB;
    private store;
    private storeInTransaction;
    private get;
    private getAll;
    private delete;
    private deleteInTransaction;
    private getLastSyncTimestamp;
    updateLastSync(): Promise<void>;
}
export declare const offlineStorage: OfflineStorageManager;
//# sourceMappingURL=offlineStorage.d.ts.map