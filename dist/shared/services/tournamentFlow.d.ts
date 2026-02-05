/**
 * BellePoule Modern - Tournament Flow Management
 * Intelligent scheduling system for tournament optimization
 * Licensed under GPL-3.0
 */
import { Competition, Pool, Match } from '../types';
export interface Arena {
    id: string;
    name: string;
    available: boolean;
    usageCount?: number;
}
export interface ArenaSettings {
    maxConcurrentMatches: number;
    minRestTime: number;
    maxWaitTime: number;
    balanceStripUsage: boolean;
    optimizeFencerRest: boolean;
}
export interface ScheduledMatch {
    match: Match;
    arenaId: string;
    scheduledTime: Date;
    estimatedDuration: number;
    priority: number;
}
export interface FlowOptimizationResult {
    schedule: ScheduledMatch[];
    metrics: {
        averageWaitTime: number;
        totalDuration: number;
        arenaUtilization: Record<string, number>;
        fencerRestViolations: number;
    };
}
export declare class TournamentFlowManager {
    private config;
    private historicalData;
    constructor(config: ArenaSettings);
    /**
     * Optimize tournament flow for all remaining matches
     */
    optimizeTournamentFlow(competition: Competition, pools: Pool[], arenas: Arena[], currentTime?: Date): Promise<FlowOptimizationResult>;
    /**
     * Get all unscheduled matches from pools
     */
    private getUnscheduledMatches;
    /**
     * Create optimal schedule using heuristic algorithms
     */
    private createOptimalSchedule;
    /**
     * Prioritize matches for optimal tournament flow
     */
    private prioritizeMatches;
    /**
     * Calculate match priority score
     */
    private calculateMatchPriority;
    /**
     * Find the best time slot for a match
     */
    private findBestTimeSlot;
    /**
     * Estimate match duration based on historical data and default values
     */
    private estimateMatchDuration;
    /**
     * Get earliest start time respecting fencer rest periods
     */
    private getEarliestStartAfterRest;
    /**
     * Calculate priority for a specific arena slot
     */
    private calculateArenaSlotPriority;
    /**
     * Evaluate the quality of a time slot for a match
     */
    private evaluateSlotQuality;
    /**
     * Update fencer availability tracking
     */
    private updateFencerAvailability;
    /**
     * Calculate schedule metrics
     */
    private calculateScheduleMetrics;
    /**
     * Update historical data with completed match
     */
    updateHistoricalData(match: Match): void;
    /**
     * Calculate actual match duration from timestamps
     */
    private calculateActualDuration;
    /**
     * Update fencer's average match duration
     */
    private updateFencerAverage;
    /**
     * Get real-time flow recommendations
     */
    getFlowRecommendations(currentSchedule: ScheduledMatch[], arenas: Arena[], currentTime?: Date): string[];
    /**
     * Calculate current arena usage
     */
    private calculateCurrentArenaUsage;
    /**
     * Generate predictive insights
     */
    generatePredictiveInsights(competition: Competition, pools: Pool[], schedule: ScheduledMatch[]): {
        estimatedFinishTime: Date;
        bottlenecks: string[];
        recommendations: string[];
    };
}
export declare const DEFAULT_TOURNAMENT_CONFIG: ArenaSettings;
//# sourceMappingURL=tournamentFlow.d.ts.map