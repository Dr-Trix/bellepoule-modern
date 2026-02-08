"use strict";
/**
 * BellePoule Modern - Table/Bracket Calculations Tests
 * Tests for FIE seeding and direct elimination bracket algorithms
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const tableCalculations_1 = require("./tableCalculations");
const types_1 = require("../types");
// ============================================================================
// Test Helpers
// ============================================================================
function createFencer(id, overrides = {}) {
    return {
        id,
        ref: parseInt(id) || 1,
        lastName: `FENCER${id}`,
        firstName: `Test${id}`,
        gender: types_1.Gender.MALE,
        nationality: 'FRA',
        status: types_1.FencerStatus.CHECKED_IN,
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
function createFencerWithRank(rank) {
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
(0, vitest_1.describe)('calculateTableSize', () => {
    (0, vitest_1.it)('should return power of 2 for exact powers', () => {
        (0, vitest_1.expect)((0, tableCalculations_1.calculateTableSize)(2)).toBe(2);
        (0, vitest_1.expect)((0, tableCalculations_1.calculateTableSize)(4)).toBe(4);
        (0, vitest_1.expect)((0, tableCalculations_1.calculateTableSize)(8)).toBe(8);
        (0, vitest_1.expect)((0, tableCalculations_1.calculateTableSize)(16)).toBe(16);
        (0, vitest_1.expect)((0, tableCalculations_1.calculateTableSize)(32)).toBe(32);
        (0, vitest_1.expect)((0, tableCalculations_1.calculateTableSize)(64)).toBe(64);
    });
    (0, vitest_1.it)('should return next power of 2 for non-powers', () => {
        (0, vitest_1.expect)((0, tableCalculations_1.calculateTableSize)(3)).toBe(4);
        (0, vitest_1.expect)((0, tableCalculations_1.calculateTableSize)(5)).toBe(8);
        (0, vitest_1.expect)((0, tableCalculations_1.calculateTableSize)(6)).toBe(8);
        (0, vitest_1.expect)((0, tableCalculations_1.calculateTableSize)(7)).toBe(8);
        (0, vitest_1.expect)((0, tableCalculations_1.calculateTableSize)(9)).toBe(16);
        (0, vitest_1.expect)((0, tableCalculations_1.calculateTableSize)(15)).toBe(16);
        (0, vitest_1.expect)((0, tableCalculations_1.calculateTableSize)(17)).toBe(32);
    });
    (0, vitest_1.it)('should handle edge cases', () => {
        (0, vitest_1.expect)((0, tableCalculations_1.calculateTableSize)(1)).toBe(2);
    });
});
// ============================================================================
// calculateByeCount Tests
// ============================================================================
(0, vitest_1.describe)('calculateByeCount', () => {
    (0, vitest_1.it)('should calculate correct bye count', () => {
        (0, vitest_1.expect)((0, tableCalculations_1.calculateByeCount)(8, 8)).toBe(0);
        (0, vitest_1.expect)((0, tableCalculations_1.calculateByeCount)(7, 8)).toBe(1);
        (0, vitest_1.expect)((0, tableCalculations_1.calculateByeCount)(6, 8)).toBe(2);
        (0, vitest_1.expect)((0, tableCalculations_1.calculateByeCount)(5, 8)).toBe(3);
        (0, vitest_1.expect)((0, tableCalculations_1.calculateByeCount)(16, 16)).toBe(0);
        (0, vitest_1.expect)((0, tableCalculations_1.calculateByeCount)(12, 16)).toBe(4);
        (0, vitest_1.expect)((0, tableCalculations_1.calculateByeCount)(10, 16)).toBe(6);
    });
    (0, vitest_1.it)('should return zero for exact fit', () => {
        (0, vitest_1.expect)((0, tableCalculations_1.calculateByeCount)(4, 4)).toBe(0);
        (0, vitest_1.expect)((0, tableCalculations_1.calculateByeCount)(8, 8)).toBe(0);
        (0, vitest_1.expect)((0, tableCalculations_1.calculateByeCount)(16, 16)).toBe(0);
    });
    (0, vitest_1.it)('should handle maximum byes', () => {
        (0, vitest_1.expect)((0, tableCalculations_1.calculateByeCount)(1, 2)).toBe(1);
        (0, vitest_1.expect)((0, tableCalculations_1.calculateByeCount)(1, 8)).toBe(7);
    });
});
// ============================================================================
// getSeedPosition Tests
// ============================================================================
(0, vitest_1.describe)('getSeedPosition', () => {
    (0, vitest_1.it)('should place seed 1 at position 0', () => {
        (0, vitest_1.expect)((0, tableCalculations_1.getSeedPosition)(1, 8)).toBe(0);
        (0, vitest_1.expect)((0, tableCalculations_1.getSeedPosition)(1, 16)).toBe(0);
        (0, vitest_1.expect)((0, tableCalculations_1.getSeedPosition)(1, 32)).toBe(0);
    });
    (0, vitest_1.it)('should return valid positions within table size', () => {
        for (const size of [4, 8, 16, 32]) {
            for (let seed = 1; seed <= size; seed++) {
                const pos = (0, tableCalculations_1.getSeedPosition)(seed, size);
                (0, vitest_1.expect)(pos).toBeGreaterThanOrEqual(0);
                (0, vitest_1.expect)(pos).toBeLessThan(size);
            }
        }
    });
});
// ============================================================================
// generateSeedingChart Tests
// ============================================================================
(0, vitest_1.describe)('generateSeedingChart', () => {
    (0, vitest_1.it)('should generate chart with correct length', () => {
        (0, vitest_1.expect)((0, tableCalculations_1.generateSeedingChart)(4).length).toBe(4);
        (0, vitest_1.expect)((0, tableCalculations_1.generateSeedingChart)(8).length).toBe(8);
        (0, vitest_1.expect)((0, tableCalculations_1.generateSeedingChart)(16).length).toBe(16);
        (0, vitest_1.expect)((0, tableCalculations_1.generateSeedingChart)(32).length).toBe(32);
    });
    (0, vitest_1.it)('should place seed 1 at position 0', () => {
        for (const size of [4, 8, 16, 32]) {
            const chart = (0, tableCalculations_1.generateSeedingChart)(size);
            (0, vitest_1.expect)(chart[0]).toBe(1);
        }
    });
});
// ============================================================================
// placeFencersInTable Tests
// ============================================================================
(0, vitest_1.describe)('placeFencersInTable', () => {
    (0, vitest_1.it)('should place fencers according to their overall rank', () => {
        const fencers = [
            createFencerWithRank(3),
            createFencerWithRank(1),
            createFencerWithRank(2),
            createFencerWithRank(4),
        ];
        const placements = (0, tableCalculations_1.placeFencersInTable)(fencers, 4);
        (0, vitest_1.expect)(placements.length).toBe(4);
        const seed1Pos = (0, tableCalculations_1.getSeedPosition)(1, 4);
        (0, vitest_1.expect)(placements[seed1Pos]?.poolStats?.overallRank).toBe(1);
    });
    (0, vitest_1.it)('should handle byes (null positions)', () => {
        const fencers = [
            createFencerWithRank(1),
            createFencerWithRank(2),
            createFencerWithRank(3),
        ];
        const placements = (0, tableCalculations_1.placeFencersInTable)(fencers, 4);
        (0, vitest_1.expect)(placements.length).toBe(4);
        // Top seed should be at position 0
        (0, vitest_1.expect)(placements[0]?.poolStats?.overallRank).toBe(1);
    });
    (0, vitest_1.it)('should place fencers in correct positions for larger table', () => {
        const fencers = Array.from({ length: 6 }, (_, i) => createFencerWithRank(i + 1));
        const placements = (0, tableCalculations_1.placeFencersInTable)(fencers, 8);
        (0, vitest_1.expect)(placements.length).toBe(8);
        // Top seed should be at position 0
        (0, vitest_1.expect)(placements[0]?.poolStats?.overallRank).toBe(1);
    });
});
// ============================================================================
// createDirectEliminationTable Tests
// ============================================================================
(0, vitest_1.describe)('createDirectEliminationTable', () => {
    (0, vitest_1.it)('should create table with correct size', () => {
        const fencers = Array.from({ length: 8 }, (_, i) => createFencerWithRank(i + 1));
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        (0, vitest_1.expect)(table.size).toBe(8);
        (0, vitest_1.expect)(table.maxScore).toBe(15);
        (0, vitest_1.expect)(table.isComplete).toBe(false);
    });
    (0, vitest_1.it)('should create correct number of nodes', () => {
        const fencers = Array.from({ length: 8 }, (_, i) => createFencerWithRank(i + 1));
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        // For 8 fencers: 4 first round + 2 semis + 1 final = 7 nodes
        (0, vitest_1.expect)(table.nodes.length).toBe(7);
    });
    (0, vitest_1.it)('should create first round nodes', () => {
        const fencers = Array.from({ length: 8 }, (_, i) => createFencerWithRank(i + 1));
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        // First round = size/2 = 4
        const firstRound = table.size / 2;
        const firstRoundNodes = table.nodes.filter(n => n.round === firstRound);
        (0, vitest_1.expect)(firstRoundNodes.length).toBe(4);
    });
    (0, vitest_1.it)('should handle byes correctly', () => {
        const fencers = Array.from({ length: 6 }, (_, i) => createFencerWithRank(i + 1));
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        (0, vitest_1.expect)(table.size).toBe(8);
        // Verify bye nodes exist
        const byeNodes = table.nodes.filter(n => n.isBye);
        (0, vitest_1.expect)(byeNodes.length).toBe(2);
    });
    (0, vitest_1.it)('should propagate bye winners to next round', () => {
        const fencers = Array.from({ length: 6 }, (_, i) => createFencerWithRank(i + 1));
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        const semiFinals = table.nodes.filter(n => n.round === 2);
        (0, vitest_1.expect)(semiFinals.length).toBe(2);
        const semisWithFencers = semiFinals.filter(n => n.fencerA || n.fencerB);
        (0, vitest_1.expect)(semisWithFencers.length).toBeGreaterThanOrEqual(1);
    });
    (0, vitest_1.it)('should create table with custom name and firstPlace', () => {
        const fencers = Array.from({ length: 4 }, (_, i) => createFencerWithRank(i + 1));
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 10, 'Petite finale', 3);
        (0, vitest_1.expect)(table.name).toBe('Petite finale');
        (0, vitest_1.expect)(table.firstPlace).toBe(3);
    });
    (0, vitest_1.it)('should create table for 2 fencers (final only)', () => {
        const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        (0, vitest_1.expect)(table.size).toBe(2);
        (0, vitest_1.expect)(table.nodes.length).toBe(1);
        (0, vitest_1.expect)(table.nodes[0].round).toBe(1);
        (0, vitest_1.expect)(table.nodes[0].match).toBeDefined();
    });
});
// ============================================================================
// updateTableAfterMatch Tests
// ============================================================================
(0, vitest_1.describe)('updateTableAfterMatch', () => {
    (0, vitest_1.it)('should update winner in the node', () => {
        const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        const nodeWithMatch = table.nodes.find(n => n.match);
        (0, vitest_1.expect)(nodeWithMatch).toBeDefined();
        const firstMatch = nodeWithMatch.match;
        const winner = nodeWithMatch.fencerA;
        const updatedTable = (0, tableCalculations_1.updateTableAfterMatch)(table, firstMatch.id, winner);
        const updatedNode = updatedTable.nodes.find(n => n.match?.id === firstMatch.id);
        (0, vitest_1.expect)(updatedNode?.winner).toBe(winner);
    });
    (0, vitest_1.it)('should mark table complete when final is decided', () => {
        const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        const finalNode = table.nodes.find(n => n.round === 1);
        (0, vitest_1.expect)(finalNode?.match).toBeDefined();
        const winner = fencers[0];
        const updatedTable = (0, tableCalculations_1.updateTableAfterMatch)(table, finalNode.match.id, winner);
        (0, vitest_1.expect)(updatedTable.isComplete).toBe(true);
    });
});
// ============================================================================
// calculateTableRanking Tests
// ============================================================================
(0, vitest_1.describe)('calculateTableRanking', () => {
    (0, vitest_1.it)('should rank winner as 1st place', () => {
        const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        const finalNode = table.nodes.find(n => n.round === 1);
        (0, vitest_1.expect)(finalNode?.match).toBeDefined();
        const winner = fencers[0];
        const updatedTable = (0, tableCalculations_1.updateTableAfterMatch)(table, finalNode.match.id, winner);
        const ranking = (0, tableCalculations_1.calculateTableRanking)(updatedTable);
        (0, vitest_1.expect)(ranking.length).toBe(2);
        (0, vitest_1.expect)(ranking[0].fencer).toBe(winner);
        (0, vitest_1.expect)(ranking[0].rank).toBe(1);
    });
    (0, vitest_1.it)('should rank finalist as 2nd place', () => {
        const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        const finalNode = table.nodes.find(n => n.round === 1);
        const winner = fencers[0];
        const loser = fencers[1];
        const updatedTable = (0, tableCalculations_1.updateTableAfterMatch)(table, finalNode.match.id, winner);
        const ranking = (0, tableCalculations_1.calculateTableRanking)(updatedTable);
        (0, vitest_1.expect)(ranking[1].fencer).toBe(loser);
        (0, vitest_1.expect)(ranking[1].rank).toBe(2);
    });
    (0, vitest_1.it)('should use firstPlace offset for secondary tables', () => {
        const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15, 'Table 5-8', 5);
        const finalNode = table.nodes.find(n => n.round === 1);
        const winner = fencers[0];
        const updatedTable = (0, tableCalculations_1.updateTableAfterMatch)(table, finalNode.match.id, winner);
        const ranking = (0, tableCalculations_1.calculateTableRanking)(updatedTable);
        (0, vitest_1.expect)(ranking[0].rank).toBe(5);
        (0, vitest_1.expect)(ranking[1].rank).toBe(6);
    });
});
// ============================================================================
// getRoundName Tests
// ============================================================================
(0, vitest_1.describe)('getRoundName', () => {
    (0, vitest_1.it)('should return correct French names', () => {
        (0, vitest_1.expect)((0, tableCalculations_1.getRoundName)(1, 'fr')).toBe('Finale');
        (0, vitest_1.expect)((0, tableCalculations_1.getRoundName)(2, 'fr')).toBe('Demi-finales');
        (0, vitest_1.expect)((0, tableCalculations_1.getRoundName)(4, 'fr')).toBe('Quarts de finale');
        (0, vitest_1.expect)((0, tableCalculations_1.getRoundName)(8, 'fr')).toBe('8èmes de finale');
        (0, vitest_1.expect)((0, tableCalculations_1.getRoundName)(16, 'fr')).toBe('16èmes de finale');
    });
    (0, vitest_1.it)('should return correct English names', () => {
        (0, vitest_1.expect)((0, tableCalculations_1.getRoundName)(1, 'en')).toBe('Final');
        (0, vitest_1.expect)((0, tableCalculations_1.getRoundName)(2, 'en')).toBe('Semi-finals');
        (0, vitest_1.expect)((0, tableCalculations_1.getRoundName)(4, 'en')).toBe('Quarter-finals');
        (0, vitest_1.expect)((0, tableCalculations_1.getRoundName)(8, 'en')).toBe('Round of 16');
    });
    (0, vitest_1.it)('should default to French', () => {
        (0, vitest_1.expect)((0, tableCalculations_1.getRoundName)(1)).toBe('Finale');
        (0, vitest_1.expect)((0, tableCalculations_1.getRoundName)(2)).toBe('Demi-finales');
    });
    (0, vitest_1.it)('should return generic name for unknown rounds', () => {
        (0, vitest_1.expect)((0, tableCalculations_1.getRoundName)(256, 'fr')).toBe('Tableau de 512');
    });
});
// ============================================================================
// findNodeById Tests
// ============================================================================
(0, vitest_1.describe)('findNodeById', () => {
    (0, vitest_1.it)('should find node by ID', () => {
        const fencers = Array.from({ length: 4 }, (_, i) => createFencerWithRank(i + 1));
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        const nodeId = table.nodes[0].id;
        const found = (0, tableCalculations_1.findNodeById)(table, nodeId);
        (0, vitest_1.expect)(found).toBe(table.nodes[0]);
    });
    (0, vitest_1.it)('should return undefined for non-existent ID', () => {
        const fencers = Array.from({ length: 4 }, (_, i) => createFencerWithRank(i + 1));
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        const found = (0, tableCalculations_1.findNodeById)(table, 'non-existent-id');
        (0, vitest_1.expect)(found).toBeUndefined();
    });
});
// ============================================================================
// findNodeByMatch Tests
// ============================================================================
(0, vitest_1.describe)('findNodeByMatch', () => {
    (0, vitest_1.it)('should find node by match ID', () => {
        const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        const nodeWithMatch = table.nodes.find(n => n.match);
        (0, vitest_1.expect)(nodeWithMatch).toBeDefined();
        const matchId = nodeWithMatch.match.id;
        const found = (0, tableCalculations_1.findNodeByMatch)(table, matchId);
        (0, vitest_1.expect)(found).toBe(nodeWithMatch);
    });
    (0, vitest_1.it)('should return undefined for non-existent match ID', () => {
        const fencers = Array.from({ length: 4 }, (_, i) => createFencerWithRank(i + 1));
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        const found = (0, tableCalculations_1.findNodeByMatch)(table, 'non-existent-match-id');
        (0, vitest_1.expect)(found).toBeUndefined();
    });
});
// ============================================================================
// getMatchesInRound Tests
// ============================================================================
(0, vitest_1.describe)('getMatchesInRound', () => {
    (0, vitest_1.it)('should return matches from final when available', () => {
        const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        const matches = (0, tableCalculations_1.getMatchesInRound)(table, 1);
        (0, vitest_1.expect)(matches.length).toBe(1);
    });
    (0, vitest_1.it)('should return empty for rounds without matches', () => {
        const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        // Round 4 doesn't exist in a 2-person table
        const matches = (0, tableCalculations_1.getMatchesInRound)(table, 4);
        (0, vitest_1.expect)(matches.length).toBe(0);
    });
});
// ============================================================================
// countRemainingMatches Tests
// ============================================================================
(0, vitest_1.describe)('countRemainingMatches', () => {
    (0, vitest_1.it)('should count matches in new table', () => {
        const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        const remaining = (0, tableCalculations_1.countRemainingMatches)(table);
        (0, vitest_1.expect)(remaining).toBe(1);
    });
    (0, vitest_1.it)('should decrease count after matches are finished', () => {
        const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        const initialCount = (0, tableCalculations_1.countRemainingMatches)(table);
        (0, vitest_1.expect)(initialCount).toBe(1);
        const finalNode = table.nodes.find(n => n.round === 1 && n.match);
        if (finalNode?.match) {
            finalNode.match.status = types_1.MatchStatus.FINISHED;
        }
        const afterFinished = (0, tableCalculations_1.countRemainingMatches)(table);
        (0, vitest_1.expect)(afterFinished).toBe(0);
    });
});
// ============================================================================
// canTableStart Tests
// ============================================================================
(0, vitest_1.describe)('canTableStart', () => {
    (0, vitest_1.it)('should return true when first round is ready', () => {
        const fencers = Array.from({ length: 8 }, (_, i) => createFencerWithRank(i + 1));
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        (0, vitest_1.expect)((0, tableCalculations_1.canTableStart)(table)).toBe(true);
    });
    (0, vitest_1.it)('should return true when byes are present but ready', () => {
        const fencers = Array.from({ length: 6 }, (_, i) => createFencerWithRank(i + 1));
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        (0, vitest_1.expect)((0, tableCalculations_1.canTableStart)(table)).toBe(true);
    });
    (0, vitest_1.it)('should return true for minimal table', () => {
        const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        (0, vitest_1.expect)((0, tableCalculations_1.canTableStart)(table)).toBe(true);
    });
});
// ============================================================================
// Integration Tests
// ============================================================================
(0, vitest_1.describe)('Table integration tests', () => {
    (0, vitest_1.it)('should correctly play through complete 2-person bracket', () => {
        const fencers = [createFencerWithRank(1), createFencerWithRank(2)];
        let table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        (0, vitest_1.expect)(table.size).toBe(2);
        (0, vitest_1.expect)(table.nodes.length).toBe(1);
        const finale = table.nodes.find(n => n.round === 1);
        (0, vitest_1.expect)(finale.match).toBeDefined();
        (0, vitest_1.expect)(finale.fencerA).toBeDefined();
        (0, vitest_1.expect)(finale.fencerB).toBeDefined();
        table = (0, tableCalculations_1.updateTableAfterMatch)(table, finale.match.id, finale.fencerA);
        (0, vitest_1.expect)(table.isComplete).toBe(true);
        const ranking = (0, tableCalculations_1.calculateTableRanking)(table);
        (0, vitest_1.expect)(ranking.length).toBe(2);
        (0, vitest_1.expect)(ranking[0].rank).toBe(1);
        (0, vitest_1.expect)(ranking[1].rank).toBe(2);
    });
    (0, vitest_1.it)('should create table with byes for 6 fencers', () => {
        const fencers = Array.from({ length: 6 }, (_, i) => createFencerWithRank(i + 1));
        const table = (0, tableCalculations_1.createDirectEliminationTable)(fencers, 15);
        (0, vitest_1.expect)(table.size).toBe(8);
        const byeNodes = table.nodes.filter(n => n.isBye);
        (0, vitest_1.expect)(byeNodes.length).toBe(2);
        (0, vitest_1.expect)((0, tableCalculations_1.canTableStart)(table)).toBe(true);
    });
});
//# sourceMappingURL=tableCalculations.test.js.map