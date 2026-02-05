/**
 * BellePoule Modern - Offline Sync Manager
 * Handles synchronization between local and remote data
 * Licensed under GPL-3.0
 */
export interface SyncResult {
    success: boolean;
    synced: number;
    failed: number;
    conflicts: number;
    errors: string[];
}
export declare class OfflineSyncManager {
    private isOnline;
    private syncInProgress;
    private syncCallbacks;
    constructor();
    private initializeNetworkDetection;
    private initializePeriodicSync;
    triggerSync(): Promise<SyncResult>;
    private checkAndSync;
    private performSync;
    private processAction;
    private updateMatch;
    private updateFencer;
    private createPool;
    private deletePool;
    private handleConflict;
    private getEntityTypeFromAction;
    private getEntityIdFromAction;
    refreshCache(competitionId: string): Promise<void>;
    private fetchCompetition;
    private fetchFencers;
    private fetchPools;
    private fetchMatches;
    onSyncComplete(callback: (result: SyncResult) => void): void;
    removeSyncCallback(callback: (result: SyncResult) => void): void;
    private notifySyncCallbacks;
    isCurrentlyOnline(): boolean;
    isCurrentlySyncing(): boolean;
    getSyncStatus(): Promise<{
        pendingActions: number;
        conflicts: number;
        lastSync: number | null;
    }>;
    resolveConflict(conflictId: string, resolution: 'local' | 'remote'): Promise<void>;
    private forceUpdateToServer;
    private acceptRemoteVersion;
}
export declare const offlineSync: OfflineSyncManager;
//# sourceMappingURL=offlineSync.d.ts.map