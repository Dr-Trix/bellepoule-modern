"use strict";
/**
 * BellePoule Modern - Offline Storage Manager
 * IndexedDB wrapper for offline-first architecture
 * Licensed under GPL-3.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.offlineStorage = exports.OfflineStorageManager = void 0;
class OfflineStorageManager {
    constructor() {
        this.dbName = 'BellePouleOffline';
        this.dbVersion = 1;
        this.db = null;
    }
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            request.onerror = () => {
                console.error('[OfflineStorage] Failed to open database:', request.error);
                reject(request.error);
            };
            request.onsuccess = () => {
                this.db = request.result;
                console.log('[OfflineStorage] Database initialized');
                resolve();
            };
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // Store for cached competitions
                if (!db.objectStoreNames.contains('competitions')) {
                    db.createObjectStore('competitions', { keyPath: 'id' });
                }
                // Store for cached fencers
                if (!db.objectStoreNames.contains('fencers')) {
                    db.createObjectStore('fencers', { keyPath: 'id' });
                }
                // Store for cached pools
                if (!db.objectStoreNames.contains('pools')) {
                    db.createObjectStore('pools', { keyPath: 'id' });
                }
                // Store for cached matches
                if (!db.objectStoreNames.contains('matches')) {
                    db.createObjectStore('matches', { keyPath: 'id' });
                }
                // Store for pending actions to sync
                if (!db.objectStoreNames.contains('pendingActions')) {
                    const store = db.createObjectStore('pendingActions', { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
                // Store for sync conflicts
                if (!db.objectStoreNames.contains('conflicts')) {
                    const store = db.createObjectStore('conflicts', { keyPath: 'id' });
                    store.createIndex('resolved', 'resolved', { unique: false });
                }
            };
        });
    }
    // Cache management methods
    async cacheCompetition(competition) {
        await this.ensureDB();
        return this.store('competitions', competition);
    }
    async cacheFencers(fencers) {
        await this.ensureDB();
        const tx = this.db.transaction(['fencers'], 'readwrite');
        await Promise.all(fencers.map(fencer => this.storeInTransaction(tx, 'fencers', fencer)));
    }
    async cachePools(pools) {
        await this.ensureDB();
        const tx = this.db.transaction(['pools'], 'readwrite');
        await Promise.all(pools.map(pool => this.storeInTransaction(tx, 'pools', pool)));
    }
    async cacheMatches(matches) {
        await this.ensureDB();
        const tx = this.db.transaction(['matches'], 'readwrite');
        await Promise.all(matches.map(match => this.storeInTransaction(tx, 'matches', match)));
    }
    // Retrieve cached data
    async getCachedCompetition(id) {
        await this.ensureDB();
        return this.get('competitions', id);
    }
    async getCachedFencers(competitionId) {
        await this.ensureDB();
        const fencers = await this.getAll('fencers');
        // For now, return all fencers - filtering would be done at competition level
        return fencers;
    }
    async getCachedPools(competitionId) {
        await this.ensureDB();
        const pools = await this.getAll('pools');
        // For now, return all pools - filtering would be done at competition level
        return pools;
    }
    async getCachedMatches(competitionId) {
        await this.ensureDB();
        const matches = await this.getAll('matches');
        // For now, return all matches - filtering would be done at competition level
        return matches;
    }
    // Pending actions management
    async addPendingAction(action) {
        await this.ensureDB();
        const pendingAction = {
            ...action,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            retryCount: 0
        };
        await this.store('pendingActions', pendingAction);
        console.log('[OfflineStorage] Added pending action:', pendingAction);
        return pendingAction.id;
    }
    async getPendingActions() {
        await this.ensureDB();
        const actions = await this.getAll('pendingActions');
        return actions.sort((a, b) => a.timestamp - b.timestamp);
    }
    async removePendingAction(id) {
        await this.ensureDB();
        return this.delete('pendingActions', id);
    }
    async incrementRetryCount(id) {
        await this.ensureDB();
        const action = await this.get('pendingActions', id);
        if (action) {
            action.retryCount = (action.retryCount || 0) + 1;
            await this.store('pendingActions', action);
        }
    }
    // Conflict management
    async addConflict(conflict) {
        await this.ensureDB();
        const syncConflict = {
            ...conflict,
            id: crypto.randomUUID(),
            timestamp: Date.now()
        };
        await this.store('conflicts', syncConflict);
        return syncConflict.id;
    }
    async getConflicts() {
        await this.ensureDB();
        const conflicts = await this.getAll('conflicts');
        return conflicts.filter((c) => !c.resolved);
    }
    async resolveConflict(id, resolution) {
        await this.ensureDB();
        const conflict = await this.get('conflicts', id);
        if (conflict) {
            conflict.resolved = true;
            await this.store('conflicts', conflict);
        }
    }
    // Sync status methods
    async getSyncStatus() {
        await this.ensureDB();
        const [pendingActions, conflicts] = await Promise.all([
            this.getPendingActions(),
            this.getConflicts()
        ]);
        return {
            pendingActions: pendingActions.length,
            conflicts: conflicts.length,
            lastSync: await this.getLastSyncTimestamp()
        };
    }
    // Cache cleanup
    async clearCache(olderThan = 7 * 24 * 60 * 60 * 1000) {
        await this.ensureDB();
        const cutoffTime = Date.now() - olderThan;
        const stores = ['competitions', 'fencers', 'pools', 'matches'];
        for (const storeName of stores) {
            const items = await this.getAll(storeName);
            const oldItems = items.filter((item) => item.updatedAt && new Date(item.updatedAt).getTime() < cutoffTime);
            const tx = this.db.transaction([storeName], 'readwrite');
            await Promise.all(oldItems.map((item) => this.deleteInTransaction(tx, storeName, item.id)));
        }
    }
    async getStorageInfo() {
        await this.ensureDB();
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            const breakdown = {};
            const stores = ['competitions', 'fencers', 'pools', 'matches', 'pendingActions', 'conflicts'];
            for (const storeName of stores) {
                const items = await this.getAll(storeName);
                breakdown[storeName] = items.length;
            }
            return {
                used: estimate.usage || 0,
                available: estimate.quota ? estimate.quota - (estimate.usage || 0) : 0,
                breakdown
            };
        }
        return { used: 0, available: 0, breakdown: {} };
    }
    // Private helper methods
    async ensureDB() {
        if (!this.db) {
            await this.init();
        }
    }
    async store(storeName, data) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([storeName], 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.put(data);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    async storeInTransaction(tx, storeName, data) {
        return new Promise((resolve, reject) => {
            const store = tx.objectStore(storeName);
            const request = store.put(data);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    async get(storeName, id) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([storeName], 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }
    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([storeName], 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }
    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([storeName], 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    async deleteInTransaction(tx, storeName, id) {
        return new Promise((resolve, reject) => {
            const store = tx.objectStore(storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    async getLastSyncTimestamp() {
        // This would typically be stored in localStorage or another store
        const lastSync = localStorage.getItem('bellepoule-lastSync');
        return lastSync ? parseInt(lastSync, 10) : null;
    }
    async updateLastSync() {
        localStorage.setItem('bellepoule-lastSync', Date.now().toString());
    }
}
exports.OfflineStorageManager = OfflineStorageManager;
// Singleton instance
exports.offlineStorage = new OfflineStorageManager();
//# sourceMappingURL=offlineStorage.js.map