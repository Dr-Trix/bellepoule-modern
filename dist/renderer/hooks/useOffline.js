"use strict";
/**
 * BellePoule Modern - Offline Hook
 * React hook for offline-first functionality
 * Licensed under GPL-3.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOffline = void 0;
const react_1 = require("react");
const offlineSync_1 = require("../services/offlineSync");
const offlineStorage_1 = require("../services/offlineStorage");
const useOffline = (competitionId) => {
    const [isOnline, setIsOnline] = (0, react_1.useState)(true);
    const [isSyncing, setIsSyncing] = (0, react_1.useState)(false);
    const [syncStatus, setSyncStatus] = (0, react_1.useState)({
        pendingActions: 0,
        conflicts: 0,
        lastSync: null
    });
    const [cacheData, setCacheData] = (0, react_1.useState)({
        competitions: [],
        fencers: [],
        pools: [],
        matches: []
    });
    // Update status
    const updateStatus = (0, react_1.useCallback)(async () => {
        setIsOnline(offlineSync_1.offlineSync.isCurrentlyOnline());
        setIsSyncing(offlineSync_1.offlineSync.isCurrentlySyncing());
        const status = await offlineStorage_1.offlineStorage.getSyncStatus();
        setSyncStatus(status);
    }, []);
    // Load cached data
    const loadCacheData = (0, react_1.useCallback)(async () => {
        try {
            const data = await Promise.all([
                competitionId ? offlineStorage_1.offlineStorage.getCachedCompetition(competitionId) : null,
                offlineStorage_1.offlineStorage.getCachedFencers(competitionId),
                offlineStorage_1.offlineStorage.getCachedPools(competitionId),
                offlineStorage_1.offlineStorage.getCachedMatches(competitionId)
            ]);
            setCacheData({
                competitions: data[0] ? [data[0]] : [],
                fencers: data[1],
                pools: data[2],
                matches: data[3]
            });
        }
        catch (error) {
            console.error('[useOffline] Failed to load cache data:', error);
        }
    }, [competitionId]);
    // Initialize
    (0, react_1.useEffect)(() => {
        updateStatus();
        loadCacheData();
        // Set up periodic updates
        const interval = setInterval(updateStatus, 5000);
        // Listen for sync completion
        offlineSync_1.offlineSync.onSyncComplete(() => {
            updateStatus();
            loadCacheData();
        });
        // Network event listeners
        const handleOnline = () => {
            setIsOnline(true);
            updateStatus();
        };
        const handleOffline = () => {
            setIsOnline(false);
            updateStatus();
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            clearInterval(interval);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [updateStatus, loadCacheData]);
    // Manual sync
    const sync = (0, react_1.useCallback)(async () => {
        if (!isOnline)
            return;
        await offlineSync_1.offlineSync.triggerSync();
        await loadCacheData();
    }, [isOnline, loadCacheData]);
    // Refresh cache
    const refreshCache = (0, react_1.useCallback)(async (compId) => {
        if (!isOnline)
            return;
        await offlineSync_1.offlineSync.refreshCache(compId);
        await loadCacheData();
    }, [isOnline, loadCacheData]);
    return {
        isOnline,
        isSyncing,
        pendingActions: syncStatus.pendingActions,
        conflicts: syncStatus.conflicts,
        lastSync: syncStatus.lastSync,
        sync,
        refreshCache,
        cacheData
    };
};
exports.useOffline = useOffline;
//# sourceMappingURL=useOffline.js.map