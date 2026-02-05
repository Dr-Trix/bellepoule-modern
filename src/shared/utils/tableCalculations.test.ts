/**
 * BellePoule Modern - Table/Bracket Calculations Tests
 * Tests for FIE seeding and direct elimination bracket algorithms
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTableSize,
  calculateByeCount,
  getSeedPosition,
  generateSeedingChart,
  placeFencersInTable,
  createDirectEliminationTable,
  updateTableAfterMatch,
  calculateTableRanking,
  getRoundName,
  findNodeById,
  findNodeByMatch,
  getMatchesInRound,
  countRemainingMatches,
  canTableStart,
} from './tableCalculations';
import {
  Fencer,
  FencerStatus,
  Gender,
  MatchStatus,
} from '../types';

// ============================================================================
// Test Helpers
// ============================================================================

function createFencer(id: string, overrides: Partial<Fencer> = {}): Fencer {
  return {
    id,
    ref: parseInt(id) || 1,
    lastName: `FENCER${id}`,
    firstName: `Test${id}`,
    gender: Gender.MALE,
    nationality: 'FRA',
    status: FencerStatus.CHECKED_IN,
    createdAt: new Date(),
    updatedAt: new Date(),
    poolStats: {
      victories: 0,
      defeats: 0,
      touchesScored: 0,
      touchesReceived: 0,
      index: 0,
      matchesPlayed: 0,
      victoryRatio: 0,
      overallRank: parseInt(id) || 1,
    },
    ...overrides,
  };
}

function createFencerWithRank(rank: number): Fencer {
  return createFencer(String(rank), {
    poolStats: {
      victories: 0,
      defeats: 0,
      touchesScored: 0,
      touchesReceived: 0,
      index: 0,
      matchesPlayed: 0,
      victoryRatio: 0,
      overallRank: rank,
    },
  });
}

// ============================================================================
// calculateTableSize Tests
// ============================================================================

describe('calculateTableSize', () => {
  it('should return power of 2 for exact powers', () => {
    expect(calculateTableSize(2)).toBe(2);
    expect(calculateTableSize(4)).toBe(4);
    expect(calculateTableSize(8)).toBe(8);
    expect(calculateTableSize(16)).toBe(16);
    expect(calculateTableSize(32)).toBe(32);
    expect(calculateTableSize(64)).toBe(64);
  });

  it('should return next power of 2 for non-powers', () => {
    expect(calculateTableSize(3)).toBe(4);
    expect(calculateTableSize(5)).toBe(8);
    expect(calculateTableSize(6)).toBe(8);
    expect(calculateTableSize(7)).toBe(8);
    expect(calculateTableSize(9)).toBe(16);
    expect(calculateTableSize(15)).toBe(16);
    expect(calculateTableSize(17)).toBe(32);
  });

  it('should handle edge cases', () => {
    expect(calculateTableSize(1)).toBe(2);
  });
});

// ============================================================================
// calculateByeCount Tests
// ============================================================================

describe('calculateByeCount', () => {
  it('should calculate correct bye count', () => {
    expect(calculateByeCount(8, 8)).toBe(0);
    expect(calculateByeCount(7, 8)).toBe(1);
    expect(calculateByeCount(6, 8)).toBe(2);
    expect(calculateByeCount(5, 8)).toBe(3);

    expect(calculateByeCount(16, 16)).toBe(0);
    expect(calculateByeCount(12, 16)).toBe(4);
    expect(calculateByeCount(10, 16)).toBe(6);
  });

  it('should return zero for exact fit', () => {
    expect(calculateByeCount(4, 4)).toBe(0);
    expect(calculateByeCount(8, 8)).toBe(0);
    expect(calculateByeCount(16, 16)).toBe(0);
  });

  it('should handle maximum byes', () => {
    expect(calculateByeCount(1, 2)).toBe(1);
    expect(calculateByeCount(1, 8)).toBe(7);
  });
});

// ============================================================================
// getSeedPosition Tests
// ============================================================================

describe('getSeedPosition', () => {
  it('should place seed 1 at position 0', () => {
    expect(getSeedPosition(1, 8)).toBe(0);
    expect(getSeedPosition(1, 16)).toBe(0);
    expect(getSeedPosition(1, 32)).toBe(0);
  });

  it('should return valid positions within table size', () => {
    for (const size of [4, 8, 16, 32]) {
      for (let seed = 1; seed <= size; seed++) {
        const pos = getSeedPosition(seed, size);
        expect(pos).toBeGreaterThanOrEqual(0);
        expect(pos).toBeLessThan(size);
      }
    }
  });
});

// ============================================================================
// generateSeedingChart Tests
// ============================================================================

describe('generateSeedingChart', () => {
  it('should generate chart with correct length', () => {
    expect(generateSeedingChart(4).length).toBe(4);
    expect(generateSeedingChart(8).length).toBe(8);
    expect(generateSeedingChart(16).length).toBe(16);
    expect(generateSeedingChart(32).length).toBe(32);
  });

  it('should place seed 1 at position 0', () => {
    for (const size of [4, 8, 16, 32]) {
      const chart = generateSeedingChart(size);
      expect(chart[0]).toBe(1);
    }
  });
});

// ============================================================================
// placeFencersInTable Tests
// ============================================================================

describe('placeFencersInTable', () => {
  it('should place fencers according to their overall rank', () => {
    const fencers = [
      createFencerWithRank(3),
      createFencerWithRank(1),
      createFencerWithRank(2),
      createFencerWithRank(4),
    ];

    const placements = placeFencersInTable(fencers, 4);

    expect(placements.length).toBe(4);
    const seed1Pos = getSeedPosition(1, 4);
    expect(placements[seed1Pos]?.poolStats?.overallRank).toBe(1);
  });

  it('should handle byes (null positions)', () => {
    const fencers = [
      createFencerWithRank(1),
      createFencerWithRank(2),
      createFencerWithRank(3),
    ];

    const placements = placeFencersInTable(fencers, 4);

    expect(placements.length).toBe(4);
    // Top seed should be at position 0
    expect(placements[0]?.poolStats?.overallRank).toBe(1);
  });

  it('should place fencers in correct positions for larger table', () => {
    const fencers = Array.from({ length: 6 }, (_, i) => createFencerWithRank(i + 1));

    const placements = placeFencersInTable(fencers, 8);

    expect(placements.length).toBe(8);
    // Top seed should be at position 0
    expect(placements[0]?.poolStats?.overallRank).toBe(1);
  });
});

// ============================================================================
// createDirectEliminationTable Tests
// ============================================================================

describe('createDirectEliminationTable', () => {
  it('should create table with correct size', () => {
    const fencers = Array.from({ length: 8 }, (_, i) => createFencerWithRank(i + 1));
    const table = createDirectEliminationTable(fencers, 15);

    expect(table.size).toBe(8);
    expect(table.maxScore).toBe(15);
    expect(table.isComplete).toBe(false);
  });

  it('should create correct number of nodes', () => {
    const fencers = Array.from({ length: 8 }, (_, i) => createFencerWithRank(i + 1));
    const table = createDirectEliminationTable(fencers, 15);

    // For 8 fencers: 4 first round + 2 semis + 1 final = 7 nodes
    expect(table.nodes.length).toBe(7);
  });

  it('should create first round nodes', () => {
    const fencers = Array.from({ length: 8 }, (_, i) => createFencerWithRank(i + 1));
    const table = createDirectEliminationTable(fencers, 15);

    // First round = size/2 = 4
    const firstRound = table.size / 2;
    const firstRoundNodes = table.nodes.filter(n => n.round === firstRound);
    expect(firstRoundNodes.length).toBe(4);
  });

  it('should handle byes correctly', () => {
    const fencers = Array.from({ length: 6 }, (_, i) => createFencerWithRank(i + 1));
    const table = createDirectEliminationTable(fencers, 15);

    expect(table.size).toBe(8);

    // Verify bye nodes exist
    const byeNodes = table.nodes.filter(n => n.isBye);
    expect(byeNodes.length).toBe(2);
  });

  it('should propagate bye winners to next round', () => {
    const fencers = Array.from({ length: 6 }, (_, i) => createFencerWithRank(i + 1));
    const table = createDirectEliminationTable(fencers, 15);

    const semiFinals = table.nodes.filter(n => n.round === 2);
    expect(semiFinals.length).toBe(2);

    const semisWithFencers = semiFinals.filter(n => n.fencerA || n.fencerB);
    expect(semisWithFencers.length).toBeGreaterThanOrEqual(1);
  });

  it('should create table with custom name and firstPlace', () => {
    const fencers = Array.from({ length: 4 }, (_, i) => createFencerWithRank(i + 1));
    const table = createDirectEliminationTable(fencers, 10, 'Petite finale', 3);

    expect(table.name).toBe('Petite finale');
    expect(table.firstPlace).toBe(3);
  });

  it('should create table for 2 fencers (final only)', () => {
    const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
    const table = createDirectEliminationTable(fencers, 15);

    expect(table.size).toBe(2);
    expect(table.nodes.length).toBe(1);
    expect(table.nodes[0].round).toBe(1);
    expect(table.nodes[0].match).toBeDefined();
  });
});

// ============================================================================
// updateTableAfterMatch Tests
// ============================================================================

describe('updateTableAfterMatch', () => {
  it('should update winner in the node', () => {
    const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
    const table = createDirectEliminationTable(fencers, 15);

    const nodeWithMatch = table.nodes.find(n => n.match);
    expect(nodeWithMatch).toBeDefined();

    const firstMatch = nodeWithMatch!.match!;
    const winner = nodeWithMatch!.fencerA!;

    const updatedTable = updateTableAfterMatch(table, firstMatch.id, winner);

    const updatedNode = updatedTable.nodes.find(n => n.match?.id === firstMatch.id);
    expect(updatedNode?.winner).toBe(winner);
  });

  it('should mark table complete when final is decided', () => {
    const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
    const table = createDirectEliminationTable(fencers, 15);

    const finalNode = table.nodes.find(n => n.round === 1);
    expect(finalNode?.match).toBeDefined();

    const winner = fencers[0];
    const updatedTable = updateTableAfterMatch(table, finalNode!.match!.id, winner);

    expect(updatedTable.isComplete).toBe(true);
  });
});

// ============================================================================
// calculateTableRanking Tests
// ============================================================================

describe('calculateTableRanking', () => {
  it('should rank winner as 1st place', () => {
    const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
    const table = createDirectEliminationTable(fencers, 15);

    const finalNode = table.nodes.find(n => n.round === 1);
    expect(finalNode?.match).toBeDefined();

    const winner = fencers[0];
    const updatedTable = updateTableAfterMatch(table, finalNode!.match!.id, winner);

    const ranking = calculateTableRanking(updatedTable);

    expect(ranking.length).toBe(2);
    expect(ranking[0].fencer).toBe(winner);
    expect(ranking[0].rank).toBe(1);
  });

  it('should rank finalist as 2nd place', () => {
    const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
    const table = createDirectEliminationTable(fencers, 15);

    const finalNode = table.nodes.find(n => n.round === 1);
    const winner = fencers[0];
    const loser = fencers[1];
    const updatedTable = updateTableAfterMatch(table, finalNode!.match!.id, winner);

    const ranking = calculateTableRanking(updatedTable);

    expect(ranking[1].fencer).toBe(loser);
    expect(ranking[1].rank).toBe(2);
  });

  it('should use firstPlace offset for secondary tables', () => {
    const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
    const table = createDirectEliminationTable(fencers, 15, 'Table 5-8', 5);

    const finalNode = table.nodes.find(n => n.round === 1);
    const winner = fencers[0];
    const updatedTable = updateTableAfterMatch(table, finalNode!.match!.id, winner);

    const ranking = calculateTableRanking(updatedTable);

    expect(ranking[0].rank).toBe(5);
    expect(ranking[1].rank).toBe(6);
  });
});

// ============================================================================
// getRoundName Tests
// ============================================================================

describe('getRoundName', () => {
  it('should return correct French names', () => {
    expect(getRoundName(1, 'fr')).toBe('Finale');
    expect(getRoundName(2, 'fr')).toBe('Demi-finales');
    expect(getRoundName(4, 'fr')).toBe('Quarts de finale');
    expect(getRoundName(8, 'fr')).toBe('8èmes de finale');
    expect(getRoundName(16, 'fr')).toBe('16èmes de finale');
  });

  it('should return correct English names', () => {
    expect(getRoundName(1, 'en')).toBe('Final');
    expect(getRoundName(2, 'en')).toBe('Semi-finals');
    expect(getRoundName(4, 'en')).toBe('Quarter-finals');
    expect(getRoundName(8, 'en')).toBe('Round of 16');
  });

  it('should default to French', () => {
    expect(getRoundName(1)).toBe('Finale');
    expect(getRoundName(2)).toBe('Demi-finales');
  });

  it('should return generic name for unknown rounds', () => {
    expect(getRoundName(256, 'fr')).toBe('Tableau de 512');
  });
});

// ============================================================================
// findNodeById Tests
// ============================================================================

describe('findNodeById', () => {
  it('should find node by ID', () => {
    const fencers = Array.from({ length: 4 }, (_, i) => createFencerWithRank(i + 1));
    const table = createDirectEliminationTable(fencers, 15);

    const nodeId = table.nodes[0].id;
    const found = findNodeById(table, nodeId);

    expect(found).toBe(table.nodes[0]);
  });

  it('should return undefined for non-existent ID', () => {
    const fencers = Array.from({ length: 4 }, (_, i) => createFencerWithRank(i + 1));
    const table = createDirectEliminationTable(fencers, 15);

    const found = findNodeById(table, 'non-existent-id');

    expect(found).toBeUndefined();
  });
});

// ============================================================================
// findNodeByMatch Tests
// ============================================================================

describe('findNodeByMatch', () => {
  it('should find node by match ID', () => {
    const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
    const table = createDirectEliminationTable(fencers, 15);

    const nodeWithMatch = table.nodes.find(n => n.match);
    expect(nodeWithMatch).toBeDefined();

    const matchId = nodeWithMatch!.match!.id;
    const found = findNodeByMatch(table, matchId);

    expect(found).toBe(nodeWithMatch);
  });

  it('should return undefined for non-existent match ID', () => {
    const fencers = Array.from({ length: 4 }, (_, i) => createFencerWithRank(i + 1));
    const table = createDirectEliminationTable(fencers, 15);

    const found = findNodeByMatch(table, 'non-existent-match-id');

    expect(found).toBeUndefined();
  });
});

// ============================================================================
// getMatchesInRound Tests
// ============================================================================

describe('getMatchesInRound', () => {
  it('should return matches from final when available', () => {
    const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
    const table = createDirectEliminationTable(fencers, 15);

    const matches = getMatchesInRound(table, 1);
    expect(matches.length).toBe(1);
  });

  it('should return empty for rounds without matches', () => {
    const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
    const table = createDirectEliminationTable(fencers, 15);

    // Round 4 doesn't exist in a 2-person table
    const matches = getMatchesInRound(table, 4);
    expect(matches.length).toBe(0);
  });
});

// ============================================================================
// countRemainingMatches Tests
// ============================================================================

describe('countRemainingMatches', () => {
  it('should count matches in new table', () => {
    const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
    const table = createDirectEliminationTable(fencers, 15);

    const remaining = countRemainingMatches(table);
    expect(remaining).toBe(1);
  });

  it('should decrease count after matches are finished', () => {
    const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
    const table = createDirectEliminationTable(fencers, 15);

    const initialCount = countRemainingMatches(table);
    expect(initialCount).toBe(1);

    const finalNode = table.nodes.find(n => n.round === 1 && n.match);
    if (finalNode?.match) {
      finalNode.match.status = MatchStatus.FINISHED;
    }

    const afterFinished = countRemainingMatches(table);
    expect(afterFinished).toBe(0);
  });
});

// ============================================================================
// canTableStart Tests
// ============================================================================

describe('canTableStart', () => {
  it('should return true when first round is ready', () => {
    const fencers = Array.from({ length: 8 }, (_, i) => createFencerWithRank(i + 1));
    const table = createDirectEliminationTable(fencers, 15);

    expect(canTableStart(table)).toBe(true);
  });

  it('should return true when byes are present but ready', () => {
    const fencers = Array.from({ length: 6 }, (_, i) => createFencerWithRank(i + 1));
    const table = createDirectEliminationTable(fencers, 15);

    expect(canTableStart(table)).toBe(true);
  });

  it('should return true for minimal table', () => {
    const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
    const table = createDirectEliminationTable(fencers, 15);

    expect(canTableStart(table)).toBe(true);
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Table integration tests', () => {
  it('should correctly play through complete 2-person bracket', () => {
    const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
    let table = createDirectEliminationTable(fencers, 15);

    expect(table.size).toBe(2);
    expect(table.nodes.length).toBe(1);

    const finale = table.nodes.find(n => n.round === 1)!;
    expect(finale.match).toBeDefined();
    expect(finale.fencerA).toBeDefined();
    expect(finale.fencerB).toBeDefined();

    table = updateTableAfterMatch(table, finale.match!.id, finale.fencerA!);

    expect(table.isComplete).toBe(true);

    const ranking = calculateTableRanking(table);
    expect(ranking.length).toBe(2);
    expect(ranking[0].rank).toBe(1);
    expect(ranking[1].rank).toBe(2);
  });

  it('should create table with byes for 6 fencers', () => {
    const fencers = Array.from({ length: 6 }, (_, i) => createFencerWithRank(i + 1));
    const table = createDirectEliminationTable(fencers, 15);

    expect(table.size).toBe(8);

    const byeNodes = table.nodes.filter(n => n.isBye);
    expect(byeNodes.length).toBe(2);

    expect(canTableStart(table)).toBe(true);
  });
});
