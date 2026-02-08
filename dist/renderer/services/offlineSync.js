"use strict";
/**
 * BellePoule Modern - Offline Sync Manager
 * Handles synchronization between local and remote data
 * Licensed under GPL-3.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.offlineSync = exports.OfflineSyncManager = void 0;
const offlineStorage_1 = require("./offlineStorage");
class OfflineSyncManager {
    constructor() {
        this.isOnline = true;
        this.syncInProgress = false;
        this.syncCallbacks = [];
        this.initializeNetworkDetection();
        this.initializePeriodicSync();
    }
    // Network detection
    initializeNetworkDetection() {
        if (typeof window !== 'undefined') {
            this.isOnline = navigator.onLine;
            window.addEventListener('online', () => {
                this.isOnline = true;
                console.log('[Sync] Network connection restored');
                this.triggerSync();
            });
            window.addEventListener('offline', () => {
                this.isOnline = false;
                console.log('[Sync] Network connection lost');
            });
        }
    }
    // Periodic sync when online
    initializePeriodicSync() {
        setInterval(() => {
            if (this.isOnline && !this.syncInProgress) {
                this.checkAndSync();
            }
        }, 30000); // Check every 30 seconds
    }
    // Public sync methods
    async triggerSync() {
        if (!this.isOnline) {
            return {
                success: false,
                synced: 0,
                failed: 0,
                conflicts: 0,
                errors: ['Device is offline']
            };
        }
        if (this.syncInProgress) {
            return {
                success: false,
                synced: 0,
                failed: 0,
                conflicts: 0,
                errors: ['Sync already in progress']
            };
        }
        this.syncInProgress = true;
        console.log('[Sync] Starting synchronization...');
        try {
            const result = await this.performSync();
            this.notifySyncCallbacks(result);
            return result;
        }
        catch (error) {
            const result = {
                success: false,
                synced: 0,
                failed: 0,
                conflicts: 0,
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
            this.notifySyncCallbacks(result);
            return result;
        }
        finally {
            this.syncInProgress = false;
        }
    }
    // Check if sync is needed and perform it
    async checkAndSync() {
        const pendingActions = await offlineStorage_1.offlineStorage.getPendingActions();
        if (pendingActions.length > 0) {
            await this.triggerSync();
        }
    }
    // Core sync implementation
    async performSync() {
        const pendingActions = await offlineStorage_1.offlineStorage.getPendingActions();
        const result = {
            success: true,
            synced: 0,
            failed: 0,
            conflicts: 0,
            errors: []
        };
        console.log(`[Sync] Processing ${pendingActions.length} pending actions`);
        for (const action of pendingActions) {
            try {
                await this.processAction(action);
                await offlineStorage_1.offlineStorage.removePendingAction(action.id);
                result.synced++;
                console.log(`[Sync] Successfully processed action: ${action.type}`);
            }
            catch (error) {
                console.error(`[Sync] Failed to process action:`, action, error);
                if (error instanceof ConflictError) {
                    await this.handleConflict(action, error.conflictData);
                    result.conflicts++;
                }
                else {
                    await offlineStorage_1.offlineStorage.incrementRetryCount(action.id);
                    result.failed++;
                    result.errors.push(`Action ${action.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
        }
        // Update last sync timestamp
        await offlineStorage_1.offlineStorage.updateLastSync();
        console.log(`[Sync] Sync completed: ${result.synced} synced, ${result.failed} failed, ${result.conflicts} conflicts`);
        return result;
    }
    // Process individual action
    async processAction(action) {
        const maxRetries = 3;
        if (action.retryCount && action.retryCount >= maxRetries) {
            throw new Error(`Max retries exceeded for action ${action.id}`);
        }
        switch (action.type) {
            case 'UPDATE_MATCH':
                await this.updateMatch(action.data);
                break;
            case 'UPDATE_FENCER':
                await this.updateFencer(action.data);
                break;
            case 'CREATE_POOL':
                await this.createPool(action.data);
                break;
            case 'DELETE_POOL':
                await this.deletePool(action.data);
                break;
            default:
                throw new Error(`Unknown action type: ${action.type}`);
        }
    }
    // Action implementations
    async updateMatch(data) {
        const response = await fetch(`/api/matches/${data.matchId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data.updates)
        });
        if (!response.ok) {
            if (response.status === 409) {
                // Conflict - server has newer version
                const serverData = await response.json();
                throw new ConflictError('Server has newer version', serverData);
            }
            throw new Error(`Update failed: ${response.statusText}`);
        }
    }
    async updateFencer(data) {
        const response = await fetch(`/api/fencers/${data.fencerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data.updates)
        });
        if (!response.ok) {
            if (response.status === 409) {
                const serverData = await response.json();
                throw new ConflictError('Server has newer version', serverData);
            }
            throw new Error(`Update failed: ${response.statusText}`);
        }
    }
    async createPool(data) {
        const response = await fetch('/api/pools', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`Create failed: ${response.statusText}`);
        }
    }
    async deletePool(data) {
        const response = await fetch(`/api/pools/${data.poolId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`Delete failed: ${response.statusText}`);
        }
    }
    // Conflict handling
    async handleConflict(action, conflictData) {
        const conflict = {
            id: '', // Will be generated by storage manager
            entityType: this.getEntityTypeFromAction(action.type),
            entityId: this.getEntityIdFromAction(action.data),
            localVersion: action.data,
            remoteVersion: conflictData,
            timestamp: Date.now()
        };
        await offlineStorage_1.offlineStorage.addConflict(conflict);
        console.log('[Sync] Conflict detected and stored:', conflict);
    }
    getEntityTypeFromAction(actionType) {
        if (actionType.includes('MATCH'))
            return 'match';
        if (actionType.includes('FENCER'))
            return 'fencer';
        if (actionType.includes('POOL'))
            return 'pool';
        return 'match'; // fallback
    }
    getEntityIdFromAction(actionData) {
        return actionData.matchId || actionData.fencerId || actionData.poolId || '';
    }
    // Cache management
    async refreshCache(competitionId) {
        if (!this.isOnline) {
            console.log('[Sync] Skipping cache refresh - offline');
            return;
        }
        try {
            console.log('[Sync] Refreshing cache for competition:', competitionId);
            // Fetch latest data
            const [competition, fencers, pools, matches] = await Promise.all([
                this.fetchCompetition(competitionId),
                this.fetchFencers(competitionId),
                this.fetchPools(competitionId),
                this.fetchMatches(competitionId)
            ]);
            // Update local cache
            await Promise.all([
                offlineStorage_1.offlineStorage.cacheCompetition(competition),
                offlineStorage_1.offlineStorage.cacheFencers(fencers),
                offlineStorage_1.offlineStorage.cachePools(pools),
                offlineStorage_1.offlineStorage.cacheMatches(matches)
            ]);
            console.log('[Sync] Cache refreshed successfully');
        }
        catch (error) {
            console.error('[Sync] Failed to refresh cache:', error);
        }
    }
    // Data fetching methods
    async fetchCompetition(id) {
        const response = await fetch(`/api/competitions/${id}`);
        if (!response.ok)
            throw new Error(`Failed to fetch competition: ${response.statusText}`);
        return response.json();
    }
    async fetchFencers(competitionId) {
        const response = await fetch(`/api/competitions/${competitionId}/fencers`);
        if (!response.ok)
            throw new Error(`Failed to fetch fencers: ${response.statusText}`);
        return response.json();
    }
    async fetchPools(competitionId) {
        const response = await fetch(`/api/competitions/${competitionId}/pools`);
        if (!response.ok)
            throw new Error(`Failed to fetch pools: ${response.statusText}`);
        return response.json();
    }
    async fetchMatches(competitionId) {
        const response = await fetch(`/api/competitions/${competitionId}/matches`);
        if (!response.ok)
            throw new Error(`Failed to fetch matches: ${response.statusText}`);
        return response.json();
    }
    // Callback management
    onSyncComplete(callback) {
        this.syncCallbacks.push(callback);
    }
    removeSyncCallback(callback) {
        this.syncCallbacks = this.syncCallbacks.filter(cb => cb !== callback);
    }
    notifySyncCallbacks(result) {
        this.syncCallbacks.forEach(callback => {
            try {
                callback(result);
            }
            catch (error) {
                console.error('[Sync] Error in sync callback:', error);
            }
        });
    }
    // Status methods
    isCurrentlyOnline() {
        return this.isOnline;
    }
    isCurrentlySyncing() {
        return this.syncInProgress;
    }
    async getSyncStatus() {
        return offlineStorage_1.offlineStorage.getSyncStatus();
    }
    // Conflict resolution
    async resolveConflict(conflictId, resolution) {
        const conflicts = await offlineStorage_1.offlineStorage.getConflicts();
        const conflict = conflicts.find(c => c.id === conflictId);
        if (!conflict) {
            throw new Error(`Conflict not found: ${conflictId}`);
        }
        try {
            if (resolution === 'local') {
                // Apply local version to server
                await this.forceUpdateToServer(conflict);
            }
            else {
                // Accept remote version (just mark conflict as resolved)
                await this.acceptRemoteVersion(conflict);
            }
            await offlineStorage_1.offlineStorage.resolveConflict(conflictId, resolution);
            console.log(`[Sync] Conflict ${conflictId} resolved with ${resolution} version`);
        }
        catch (error) {
            console.error(`[Sync] Failed to resolve conflict ${conflictId}:`, error);
            throw error;
        }
    }
    async forceUpdateToServer(conflict) {
        // Implementation depends on entity type
        const { entityType, entityId, localVersion } = conflict;
        let url = '';
        switch (entityType) {
            case 'match':
                url = `/api/matches/${entityId}/force-update`;
                break;
            case 'fencer':
                url = `/api/fencers/${entityId}/force-update`;
                break;
            case 'pool':
                url = `/api/pools/${entityId}/force-update`;
                break;
        }
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(localVersion)
        });
        if (!response.ok) {
            throw new Error(`Force update failed: ${response.statusText}`);
        }
    }
    async acceptRemoteVersion(conflict) {
        // Update local cache with remote version
        // Implementation depends on what needs to be updated
        console.log(`[Sync] Accepting remote version for ${conflict.entityType} ${conflict.entityId}`);
    }
}
exports.OfflineSyncManager = OfflineSyncManager;
// Custom error for conflicts
class ConflictError extends Error {
    constructor(message, conflictData) {
        super(message);
        this.name = 'ConflictError';
        this.conflictData = conflictData;
    }
}
// Singleton instance
exports.offlineSync = new OfflineSyncManager();
//# sourceMappingURL=offlineSync.js.map