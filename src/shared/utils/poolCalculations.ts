/**
 * BellePoule Modern - Pool Calculation Utilities
 * Based on the original BellePoule pool ranking algorithm
 * Licensed under GPL-3.0
 */

import {
  Fencer,
  FencerStatus,
  Match,
  MatchStatus,
  Pool,
  PoolRanking,
  PoolStats,
  Score,
} from '../types';

// ============================================================================
// Pool Match Order Generator
// ============================================================================

/**
 * Génère l'ordre des matchs dans une poule selon la méthode FIE officielle
 * Utilise les tableaux d'ordre standard selon le nombre de tireurs
 */
export function generatePoolMatchOrder(fencerCount: number): [number, number][] {
  const orders: { [key: number]: [number, number][] } = {
    3: [
      [1, 2], [2, 3], [1, 3],
    ],
    4: [
      [1, 4], [2, 3], [1, 3], [2, 4], [3, 4], [1, 2],
    ],
    5: [
      [1, 2], [3, 4], [5, 1], [2, 3], [5, 4],
      [1, 3], [2, 5], [4, 1], [3, 5], [4, 2],
    ],
    6: [
      [1, 2], [4, 5], [2, 3], [5, 6], [3, 1], [6, 4],
      [2, 5], [1, 4], [5, 3], [2, 6], [4, 3], [1, 5],
      [3, 6], [4, 2], [6, 1],
    ],
    7: [
      [1, 4], [2, 5], [3, 6], [7, 1], [5, 4], [6, 2],
      [3, 7], [6, 1], [4, 2], [5, 3], [7, 6], [1, 2],
      [4, 3], [5, 7], [6, 4], [2, 3], [1, 5], [7, 4],
      [3, 1], [2, 7], [6, 5],
    ],
    8: [
      [1, 2], [5, 6], [3, 4], [7, 8], [1, 5], [2, 6],
      [4, 8], [3, 7], [1, 3], [2, 4], [5, 7], [6, 8],
      [1, 4], [2, 3], [5, 8], [6, 7], [1, 6], [2, 5],
      [3, 8], [4, 7], [1, 7], [2, 8], [3, 5], [4, 6],
      [1, 8], [2, 7], [3, 6], [4, 5],
    ],
  };

  return orders[fencerCount] || generateGenericMatchOrder(fencerCount);
}

/**
 * Génère un ordre de matchs générique pour des poules de taille non standard
 */
function generateGenericMatchOrder(fencerCount: number): [number, number][] {
  const matches: [number, number][] = [];
  for (let i = 1; i <= fencerCount; i++) {
    for (let j = i + 1; j <= fencerCount; j++) {
      matches.push([i, j]);
    }
  }
  return matches;
}

// ============================================================================
// Pool Score Processing
// ============================================================================

/**
 * Calcule les statistiques d'un tireur dans une poule
 */
export function calculateFencerPoolStats(
  fencer: Fencer,
  matches: Match[],
): PoolStats {
  let victories = 0;
  let defeats = 0;
  let touchesScored = 0;
  let touchesReceived = 0;
  let matchesPlayed = 0;

  for (const match of matches) {
    // Vérifier si le tireur est dans ce match
    const isA = match.fencerA?.id === fencer.id;
    const isB = match.fencerB?.id === fencer.id;

    if (!isA && !isB) continue;
    if (match.status !== MatchStatus.FINISHED) continue;

    const myScore = isA ? match.scoreA : match.scoreB;
    const oppScore = isA ? match.scoreB : match.scoreA;

    if (!myScore || !oppScore) continue;

    matchesPlayed++;

    // Gestion des cas spéciaux
    if (myScore.isAbstention || myScore.isExclusion || myScore.isForfait) {
      defeats++;
      touchesReceived += oppScore.value ?? 0;
      touchesScored += myScore.value ?? 0;
    } else if (oppScore.isAbstention || oppScore.isExclusion || oppScore.isForfait) {
      victories++;
      touchesScored += myScore.value ?? 0;
      touchesReceived += oppScore.value ?? 0;
    } else if (myScore.isVictory) {
      victories++;
      touchesScored += myScore.value ?? 0;
      touchesReceived += oppScore.value ?? 0;
    } else {
      defeats++;
      touchesScored += myScore.value ?? 0;
      touchesReceived += oppScore.value ?? 0;
    }
  }

  const index = touchesScored - touchesReceived;
  const victoryRatio = matchesPlayed > 0 ? victories / matchesPlayed : 0;

  return {
    victories,
    defeats,
    touchesScored,
    touchesReceived,
    index,
    matchesPlayed,
    victoryRatio,
  };
}

/**
 * Calcule le classement d'une poule selon les règles FIE
 * Ordre de priorité:
 * 1. Ratio V/M (victoires / matchs)
 * 2. Indice (TD - TR)
 * 3. Touches données (TD)
 * 4. Confrontation directe (si 2 tireurs à égalité)
 */
export function calculatePoolRanking(pool: Pool): PoolRanking[] {
  const rankings: PoolRanking[] = [];

  // Calculer les stats pour chaque tireur
  for (const fencer of pool.fencers) {
    if (fencer.status === FencerStatus.EXCLUDED || 
        fencer.status === FencerStatus.FORFAIT ||
        fencer.status === FencerStatus.ABANDONED) {
      continue;
    }

    const stats = calculateFencerPoolStats(fencer, pool.matches);

    rankings.push({
      fencer,
      rank: 0,
      victories: stats.victories,
      defeats: stats.defeats,
      touchesScored: stats.touchesScored,
      touchesReceived: stats.touchesReceived,
      index: stats.index,
      ratio: stats.victoryRatio,
    });
  }

  // Trier selon les règles FIE
  rankings.sort((a, b) => {
    // 1. Ratio V/M (décroissant)
    if (Math.abs(a.ratio - b.ratio) > 0.0001) {
      return b.ratio - a.ratio;
    }

    // 2. Indice (décroissant)
    if (a.index !== b.index) {
      return b.index - a.index;
    }

    // 3. Touches données (décroissant)
    if (a.touchesScored !== b.touchesScored) {
      return b.touchesScored - a.touchesScored;
    }

    // 4. Confrontation directe
    const directMatch = pool.matches.find(
      m =>
        (m.fencerA?.id === a.fencer.id && m.fencerB?.id === b.fencer.id) ||
        (m.fencerA?.id === b.fencer.id && m.fencerB?.id === a.fencer.id)
    );

    if (directMatch && directMatch.status === MatchStatus.FINISHED) {
      const aIsFirst = directMatch.fencerA?.id === a.fencer.id;
      const aScore = aIsFirst ? directMatch.scoreA : directMatch.scoreB;
      
      if (aScore?.isVictory) {
        return -1;
      } else {
        return 1;
      }
    }

    // En cas d'égalité parfaite, trier par classement initial
    return (a.fencer.ranking ?? 9999) - (b.fencer.ranking ?? 9999);
  });

  // Assigner les rangs
  let currentRank = 1;
  for (let i = 0; i < rankings.length; i++) {
    if (i > 0) {
      const prev = rankings[i - 1];
      const curr = rankings[i];

      // Vérifier si vraiment à égalité
      const sameRatio = Math.abs(prev.ratio - curr.ratio) < 0.0001;
      const sameIndex = prev.index === curr.index;
      const sameTD = prev.touchesScored === curr.touchesScored;

      if (sameRatio && sameIndex && sameTD) {
        // Même rang (ex aequo)
        rankings[i].rank = rankings[i - 1].rank;
      } else {
        rankings[i].rank = currentRank;
      }
    } else {
      rankings[i].rank = currentRank;
    }
    currentRank++;
  }

  return rankings;
}

// ============================================================================
// Pool Distribution Algorithm
// ============================================================================

/**
 * Distribue les tireurs dans les poules selon la méthode serpentine
 * en respectant les critères de séparation (club, ligue, nation)
 */
export function distributeFencersToPoolsSerpentine(
  fencers: Fencer[],
  poolCount: number,
  separation: {
    byClub: boolean;
    byLeague: boolean;
    byNation: boolean;
  }
): Fencer[][] {
  const pools: Fencer[][] = Array.from({ length: poolCount }, () => []);
  
  // Trier les tireurs par classement
  const sortedFencers = [...fencers].sort((a, b) => 
    (a.ranking ?? 99999) - (b.ranking ?? 99999)
  );

  // Distribution en serpentine avec respect des séparations
  let direction = 1;
  let poolIndex = 0;

  for (const fencer of sortedFencers) {
    // Trouver la meilleure poule pour ce tireur
    const bestPool = findBestPoolForFencer(
      fencer,
      pools,
      poolIndex,
      poolCount,
      direction,
      separation
    );

    pools[bestPool].push(fencer);

    // Avancer dans la serpentine
    poolIndex += direction;
    if (poolIndex >= poolCount) {
      direction = -1;
      poolIndex = poolCount - 1;
    } else if (poolIndex < 0) {
      direction = 1;
      poolIndex = 0;
    }
  }

  return pools;
}

/**
 * Trouve la meilleure poule pour un tireur en respectant les séparations
 */
function findBestPoolForFencer(
  fencer: Fencer,
  pools: Fencer[][],
  startIndex: number,
  poolCount: number,
  direction: number,
  separation: { byClub: boolean; byLeague: boolean; byNation: boolean }
): number {
  let bestPool = startIndex;
  let bestScore = -Infinity;

  for (let offset = 0; offset < poolCount; offset++) {
    const index = (startIndex + offset * direction + poolCount) % poolCount;
    const pool = pools[index];

    let score = 0;

    // Pénaliser les poules plus grandes
    score -= pool.length * 10;

    // Pénaliser les conflits de séparation
    if (separation.byClub && pool.some(f => f.club === fencer.club)) {
      score -= 100;
    }
    if (separation.byLeague && pool.some(f => f.league === fencer.league)) {
      score -= 50;
    }
    if (separation.byNation && pool.some(f => f.nationality === fencer.nationality)) {
      score -= 25;
    }

    if (score > bestScore) {
      bestScore = score;
      bestPool = index;
    }
  }

  return bestPool;
}

// ============================================================================
// Pool Validation
// ============================================================================

/**
 * Vérifie si une poule est complète et valide
 */
export function validatePool(pool: Pool): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Vérifier que tous les matchs sont terminés
  const incompleteMatches = pool.matches.filter(
    m => m.status !== MatchStatus.FINISHED && m.status !== MatchStatus.CANCELLED
  );
  if (incompleteMatches.length > 0) {
    errors.push(`${incompleteMatches.length} match(s) non terminé(s)`);
  }

  // Vérifier la cohérence des scores
  for (const match of pool.matches) {
    if (match.status !== MatchStatus.FINISHED) continue;

    if (!match.scoreA || !match.scoreB) {
      errors.push(`Match ${match.number}: scores manquants`);
      continue;
    }

    // Vérifier qu'il y a un gagnant et un perdant
    const aWins = match.scoreA.isVictory;
    const bWins = match.scoreB.isVictory;

    if (aWins === bWins && !match.scoreA.isAbstention && !match.scoreB.isAbstention) {
      errors.push(`Match ${match.number}: pas de vainqueur clair`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calcule le nombre optimal de poules selon le nombre de tireurs
 */
export function calculateOptimalPoolCount(
  fencerCount: number,
  minPoolSize: number = 5,
  maxPoolSize: number = 8
): number {
  // Objectif: avoir des poules de taille similaire entre min et max
  for (let poolCount = Math.ceil(fencerCount / maxPoolSize); 
       poolCount <= Math.ceil(fencerCount / minPoolSize); 
       poolCount++) {
    const avgSize = fencerCount / poolCount;
    if (avgSize >= minPoolSize && avgSize <= maxPoolSize) {
      return poolCount;
    }
  }

  // Fallback
  return Math.ceil(fencerCount / 6);
}

/**
 * Calcule le nombre de matchs dans une poule
 */
export function calculatePoolMatchCount(fencerCount: number): number {
  return (fencerCount * (fencerCount - 1)) / 2;
}

/**
 * Formate le ratio V/M pour l'affichage
 */
export function formatRatio(ratio: number): string {
  return ratio.toFixed(3);
}

/**
 * Formate l'indice pour l'affichage
 */
export function formatIndex(index: number): string {
  return index >= 0 ? `+${index}` : `${index}`;
}

/**
 * Calcule le classement général à partir de toutes les poules
 * Combine les classements de chaque poule selon les règles FIE
 */
export function calculateOverallRanking(pools: Pool[]): PoolRanking[] {
  // Collecter tous les classements de poules
  const allRankings: PoolRanking[] = [];
  
  pools.forEach(pool => {
    if (pool.ranking && pool.ranking.length > 0) {
      allRankings.push(...pool.ranking);
    } else {
      // Calculer le classement si pas déjà fait
      const ranking = calculatePoolRanking(pool);
      allRankings.push(...ranking);
    }
  });

  // Trier selon les règles FIE:
  // 1. Ratio V/M (décroissant)
  // 2. Indice TD-TR (décroissant)
  // 3. Touches données TD (décroissant)
  allRankings.sort((a, b) => {
    // 1. Ratio
    if (Math.abs(a.ratio - b.ratio) > 0.0001) {
      return b.ratio - a.ratio;
    }
    // 2. Indice
    if (a.index !== b.index) {
      return b.index - a.index;
    }
    // 3. Touches données
    if (a.touchesScored !== b.touchesScored) {
      return b.touchesScored - a.touchesScored;
    }
    // 4. Égalité parfaite - garder l'ordre
    return 0;
  });

  // Assigner les rangs
  allRankings.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  return allRankings;
}
