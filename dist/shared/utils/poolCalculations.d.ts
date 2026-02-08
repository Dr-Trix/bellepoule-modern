/**
 * BellePoule Modern - Pool Calculation Utilities
 * Based on the original BellePoule pool ranking algorithm
 * Licensed under GPL-3.0
 */
import { Fencer, Match, Pool, PoolRanking, PoolStats } from '../types';
/**
 * Génère l'ordre des matchs dans une poule selon la méthode FIE officielle
 * Utilise les tableaux d'ordre standard selon le nombre de tireurs
 */
export declare function generatePoolMatchOrder(fencerCount: number): [number, number][];
/**
 * Calcule les statistiques d'un tireur dans une poule
 */
export declare function calculateFencerPoolStats(fencer: Fencer, matches: Match[]): PoolStats;
/**
 * Calcule le classement d'une poule selon les règles FIE
 * Ordre de priorité:
 * 1. Ratio V/M (victoires / matchs)
 * 2. Indice (TD - TR)
 * 3. Touches données (TD)
 * 4. Confrontation directe (si 2 tireurs à égalité)
 */
export declare function calculatePoolRanking(pool: Pool): PoolRanking[];
/**
 * Distribue les tireurs dans les poules selon la méthode serpentine
 * en respectant les critères de séparation (club, ligue, nation)
 */
export declare function distributeFencersToPoolsSerpentine(fencers: Fencer[], poolCount: number, separation: {
    byClub: boolean;
    byLeague: boolean;
    byNation: boolean;
}): Fencer[][];
/**
 * Vérifie si une poule est complète et valide
 */
export declare function validatePool(pool: Pool): {
    valid: boolean;
    errors: string[];
};
/**
 * Calcule le nombre optimal de poules selon le nombre de tireurs
 */
export declare function calculateOptimalPoolCount(fencerCount: number, minPoolSize?: number, maxPoolSize?: number): number;
/**
 * Calcule le nombre de matchs dans une poule
 */
export declare function calculatePoolMatchCount(fencerCount: number): number;
/**
 * Formate le ratio V/M pour l'affichage
 */
export declare function formatRatio(ratio: number): string;
/**
 * Formate l'indice pour l'affichage
 */
export declare function formatIndex(index: number): string;
/**
 * Calcule les points Quest pour une victoire selon l'écart de score
 * @param winnerScore Score du vainqueur
 * @param loserScore Score du perdant
 * @returns Nombre de points Quest (1 à 4)
 */
export declare function calculateQuestPoints(winnerScore: number, loserScore: number): number;
/**
 * Calcule les statistiques Quest d'un tireur
 */
export declare function calculateFencerQuestStats(fencer: Fencer, matches: Match[]): {
    questPoints: number;
    v4: number;
    v3: number;
    v2: number;
    v1: number;
};
/**
 * Calcule le classement d'une poule selon les règles Quest (Sabre Laser)
 * Ordre de priorité:
 * 1. Points Quest (total)
 * 2. Touches données (TD)
 * 3. Nombre de victoires
 * 4. Nombre de victoires à 4 points, puis 3, puis 2, puis 1
 */
export declare function calculatePoolRankingQuest(pool: Pool): PoolRanking[];
/**
 * Calcule le classement général Quest à partir de toutes les poules
 */
export declare function calculateOverallRankingQuest(pools: Pool[]): PoolRanking[];
/**
 * Calcule le classement général à partir de toutes les poules
 * Combine les classements de chaque poule selon les règles FIE
 */
export declare function calculateOverallRanking(pools: Pool[]): PoolRanking[];
//# sourceMappingURL=poolCalculations.d.ts.map