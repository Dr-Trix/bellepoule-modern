import { Fencer, Match, PoolStats } from '../types';
/**
 * Calculateur optimisé de statistiques pour les tireurs
 */
export declare class FencerStatsCalculator {
    /**
     * Calcule les statistiques d'un tireur dans une poule (version optimisée)
     */
    static calculateFencerPoolStats(fencer: Fencer, matches: Match[]): PoolStats;
    /**
     * Calcule les statistiques de plusieurs tireurs en lot (optimisé)
     */
    static calculateStatsBatch(fencers: Fencer[], matches: Match[]): Map<string, PoolStats>;
    /**
     * Calcule les statistiques Quest d'un tireur (version optimisée)
     */
    static calculateFencerQuestStats(fencer: Fencer, matches: Match[]): {
        questPoints: number;
        v4: number;
        v3: number;
        v2: number;
        v1: number;
    };
    /**
     * Calcule les points Quest selon l'écart de score
     */
    private static calculateQuestPoints;
}
//# sourceMappingURL=fencerStatsCalculator.d.ts.map