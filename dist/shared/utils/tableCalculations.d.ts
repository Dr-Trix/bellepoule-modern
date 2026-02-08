/**
 * BellePoule Modern - Direct Elimination Table Utilities
 * Based on the original BellePoule tableau algorithm
 * Licensed under GPL-3.0
 */
import { DirectEliminationTable, Fencer, Match, TableNode, TableRanking } from '../types';
/**
 * Calcule la taille du tableau (puissance de 2 supérieure ou égale)
 */
export declare function calculateTableSize(fencerCount: number): number;
/**
 * Calcule le nombre d'exempts (byes) nécessaires
 */
export declare function calculateByeCount(fencerCount: number, tableSize: number): number;
/**
 * Génère la position de placement pour un classement donné
 * Utilise l'algorithme standard FIE pour le placement en tableau
 *
 * Pour un tableau de 8:
 * Position 1: Seed 1 vs Seed 8
 * Position 2: Seed 4 vs Seed 5
 * Position 3: Seed 3 vs Seed 6
 * Position 4: Seed 2 vs Seed 7
 */
export declare function getSeedPosition(seed: number, tableSize: number): number;
/**
 * Génère le tableau de placement complet pour une taille donnée
 */
export declare function generateSeedingChart(tableSize: number): number[];
/**
 * Place les tireurs dans le tableau selon leur classement
 */
export declare function placeFencersInTable(fencers: Fencer[], tableSize: number): (Fencer | null)[];
/**
 * Crée la structure complète d'un tableau à élimination directe
 */
export declare function createDirectEliminationTable(fencers: Fencer[], maxScore: number, name?: string, firstPlace?: number): DirectEliminationTable;
/**
 * Met à jour le tableau après qu'un match soit terminé
 */
export declare function updateTableAfterMatch(table: DirectEliminationTable, matchId: string, winner: Fencer): DirectEliminationTable;
/**
 * Calcule le classement final d'un tableau
 */
export declare function calculateTableRanking(table: DirectEliminationTable): TableRanking[];
/**
 * Retourne le nom d'un tour de tableau
 */
export declare function getRoundName(round: number, locale?: string): string;
/**
 * Trouve un noeud par son ID
 */
export declare function findNodeById(table: DirectEliminationTable, nodeId: string): TableNode | undefined;
/**
 * Trouve un noeud par son match
 */
export declare function findNodeByMatch(table: DirectEliminationTable, matchId: string): TableNode | undefined;
/**
 * Obtient tous les matchs d'un tour
 */
export declare function getMatchesInRound(table: DirectEliminationTable, round: number): Match[];
/**
 * Compte les matchs restants dans un tableau
 */
export declare function countRemainingMatches(table: DirectEliminationTable): number;
/**
 * Vérifie si un tableau peut démarrer (premier tour complet)
 */
export declare function canTableStart(table: DirectEliminationTable): boolean;
//# sourceMappingURL=tableCalculations.d.ts.map