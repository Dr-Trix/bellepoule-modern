/**
 * BellePoule Modern - Offline Integration Test
 * Test the offline-first architecture functionality
 * Licensed under GPL-3.0
 */
export declare class OfflineTestSuite {
    private testResults;
    runAllTests(): Promise<{
        passed: number;
        failed: number;
        results: {
            test: string;
            status: 'pass' | 'fail';
            error?: string;
        }[];
    }>;
    private testDatabaseInit;
    private testDataCaching;
    private testPendingActions;
    private testConflictHandling;
    private testSyncStatus;
    private testStorageInfo;
    private testCacheCleanup;
    private addTestResult;
    simulateOfflineScenario(): Promise<boolean>;
    performanceTest(): Promise<{
        cacheTime: number;
        syncTime: number;
    }>;
}
export declare const offlineTestSuite: OfflineTestSuite;
//# sourceMappingURL=offlineTest.d.ts.map