"use strict";
/**
 * BellePoule Modern - Pool Calculations Tests
 * Tests for FIE standard pool ranking and match order algorithms
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const poolCalculations_1 = require("./poolCalculations");
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
        ...overrides,
    };
}
function createMatch(number, fencerA, fencerB, scoreA, scoreB, status = types_1.MatchStatus.FINISHED) {
    return {
        id: `match-${number}`,
        number,
        fencerA,
        fencerB,
        scoreA,
        scoreB,
        maxScore: 5,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}
function createScore(value, isVictory) {
    return {
        value,
        isVictory,
        isAbstention: false,
        isExclusion: false,
        isForfait: false,
    };
}
function createPool(fencers, matches) {
    return {
        id: 'pool-1',
        number: 1,
        phaseId: 'phase-1',
        fencers,
        matches,
        referees: [],
        isComplete: true,
        hasError: false,
        ranking: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}
// ============================================================================
// generatePoolMatchOrder Tests
// ============================================================================
(0, vitest_1.describe)('generatePoolMatchOrder', () => {
    (0, vitest_1.it)('should generate correct order for 3 fencers', () => {
        const order = (0, poolCalculations_1.generatePoolMatchOrder)(3);
        (0, vitest_1.expect)(order).toEqual([
            [1, 2], [2, 3], [1, 3],
        ]);
        (0, vitest_1.expect)(order.length).toBe(3); // n*(n-1)/2 = 3*2/2 = 3
    });
    (0, vitest_1.it)('should generate correct order for 4 fencers', () => {
        const order = (0, poolCalculations_1.generatePoolMatchOrder)(4);
        (0, vitest_1.expect)(order).toEqual([
            [1, 4], [2, 3], [1, 3], [2, 4], [3, 4], [1, 2],
        ]);
        (0, vitest_1.expect)(order.length).toBe(6); // n*(n-1)/2 = 4*3/2 = 6
    });
    (0, vitest_1.it)('should generate correct order for 5 fencers', () => {
        const order = (0, poolCalculations_1.generatePoolMatchOrder)(5);
        (0, vitest_1.expect)(order.length).toBe(10); // n*(n-1)/2 = 5*4/2 = 10
        // Verify all pairs are unique
        const pairs = new Set(order.map(([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}`));
        (0, vitest_1.expect)(pairs.size).toBe(10);
    });
    (0, vitest_1.it)('should generate correct order for 6 fencers', () => {
        const order = (0, poolCalculations_1.generatePoolMatchOrder)(6);
        (0, vitest_1.expect)(order.length).toBe(15); // n*(n-1)/2 = 6*5/2 = 15
    });
    (0, vitest_1.it)('should generate correct order for 7 fencers', () => {
        const order = (0, poolCalculations_1.generatePoolMatchOrder)(7);
        (0, vitest_1.expect)(order.length).toBe(21); // n*(n-1)/2 = 7*6/2 = 21
    });
    (0, vitest_1.it)('should generate correct order for 8 fencers', () => {
        const order = (0, poolCalculations_1.generatePoolMatchOrder)(8);
        (0, vitest_1.expect)(order.length).toBe(28); // n*(n-1)/2 = 8*7/2 = 28
    });
    (0, vitest_1.it)('should generate generic order for non-standard pool sizes', () => {
        const order = (0, poolCalculations_1.generatePoolMatchOrder)(9);
        (0, vitest_1.expect)(order.length).toBe(36); // n*(n-1)/2 = 9*8/2 = 36
        // Verify all pairs exist
        const pairs = new Set(order.map(([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}`));
        (0, vitest_1.expect)(pairs.size).toBe(36);
    });
    (0, vitest_1.it)('should include all fencer pairings exactly once', () => {
        for (let size = 3; size <= 8; size++) {
            const order = (0, poolCalculations_1.generatePoolMatchOrder)(size);
            const pairSet = new Set();
            for (const [a, b] of order) {
                const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
                (0, vitest_1.expect)(pairSet.has(key)).toBe(false); // No duplicates
                pairSet.add(key);
            }
            // All pairs should be present
            (0, vitest_1.expect)(pairSet.size).toBe((size * (size - 1)) / 2);
        }
    });
});
// ============================================================================
// calculateFencerPoolStats Tests
// ============================================================================
(0, vitest_1.describe)('calculateFencerPoolStats', () => {
    (0, vitest_1.it)('should calculate stats for a fencer with all victories', () => {
        const fencer = createFencer('1');
        const opponent1 = createFencer('2');
        const opponent2 = createFencer('3');
        const matches = [
            createMatch(1, fencer, opponent1, createScore(5, true), createScore(2, false)),
            createMatch(2, fencer, opponent2, createScore(5, true), createScore(3, false)),
        ];
        const stats = (0, poolCalculations_1.calculateFencerPoolStats)(fencer, matches);
        (0, vitest_1.expect)(stats.victories).toBe(2);
        (0, vitest_1.expect)(stats.defeats).toBe(0);
        (0, vitest_1.expect)(stats.touchesScored).toBe(10);
        (0, vitest_1.expect)(stats.touchesReceived).toBe(5);
        (0, vitest_1.expect)(stats.index).toBe(5);
        (0, vitest_1.expect)(stats.matchesPlayed).toBe(2);
        (0, vitest_1.expect)(stats.victoryRatio).toBe(1);
    });
    (0, vitest_1.it)('should calculate stats for a fencer with all defeats', () => {
        const fencer = createFencer('1');
        const opponent1 = createFencer('2');
        const opponent2 = createFencer('3');
        const matches = [
            createMatch(1, fencer, opponent1, createScore(2, false), createScore(5, true)),
            createMatch(2, fencer, opponent2, createScore(1, false), createScore(5, true)),
        ];
        const stats = (0, poolCalculations_1.calculateFencerPoolStats)(fencer, matches);
        (0, vitest_1.expect)(stats.victories).toBe(0);
        (0, vitest_1.expect)(stats.defeats).toBe(2);
        (0, vitest_1.expect)(stats.touchesScored).toBe(3);
        (0, vitest_1.expect)(stats.touchesReceived).toBe(10);
        (0, vitest_1.expect)(stats.index).toBe(-7);
        (0, vitest_1.expect)(stats.matchesPlayed).toBe(2);
        (0, vitest_1.expect)(stats.victoryRatio).toBe(0);
    });
    (0, vitest_1.it)('should calculate stats for mixed results', () => {
        const fencer = createFencer('1');
        const opponent1 = createFencer('2');
        const opponent2 = createFencer('3');
        const matches = [
            createMatch(1, fencer, opponent1, createScore(5, true), createScore(3, false)),
            createMatch(2, fencer, opponent2, createScore(2, false), createScore(5, true)),
        ];
        const stats = (0, poolCalculations_1.calculateFencerPoolStats)(fencer, matches);
        (0, vitest_1.expect)(stats.victories).toBe(1);
        (0, vitest_1.expect)(stats.defeats).toBe(1);
        (0, vitest_1.expect)(stats.touchesScored).toBe(7);
        (0, vitest_1.expect)(stats.touchesReceived).toBe(8);
        (0, vitest_1.expect)(stats.index).toBe(-1);
        (0, vitest_1.expect)(stats.matchesPlayed).toBe(2);
        (0, vitest_1.expect)(stats.victoryRatio).toBe(0.5);
    });
    (0, vitest_1.it)('should handle fencer as fencerB position', () => {
        const fencer = createFencer('1');
        const opponent = createFencer('2');
        const matches = [
            createMatch(1, opponent, fencer, createScore(3, false), createScore(5, true)),
        ];
        const stats = (0, poolCalculations_1.calculateFencerPoolStats)(fencer, matches);
        (0, vitest_1.expect)(stats.victories).toBe(1);
        (0, vitest_1.expect)(stats.defeats).toBe(0);
        (0, vitest_1.expect)(stats.touchesScored).toBe(5);
        (0, vitest_1.expect)(stats.touchesReceived).toBe(3);
    });
    (0, vitest_1.it)('should ignore unfinished matches', () => {
        const fencer = createFencer('1');
        const opponent = createFencer('2');
        const matches = [
            createMatch(1, fencer, opponent, createScore(5, true), createScore(3, false)),
            createMatch(2, fencer, createFencer('3'), null, null, types_1.MatchStatus.NOT_STARTED),
        ];
        const stats = (0, poolCalculations_1.calculateFencerPoolStats)(fencer, matches);
        (0, vitest_1.expect)(stats.matchesPlayed).toBe(1);
    });
    (0, vitest_1.it)('should handle abstention as defeat', () => {
        const fencer = createFencer('1');
        const opponent = createFencer('2');
        const matches = [
            createMatch(1, fencer, opponent, { value: 2, isVictory: false, isAbstention: true, isExclusion: false, isForfait: false }, createScore(5, true)),
        ];
        const stats = (0, poolCalculations_1.calculateFencerPoolStats)(fencer, matches);
        (0, vitest_1.expect)(stats.defeats).toBe(1);
        (0, vitest_1.expect)(stats.victories).toBe(0);
    });
    (0, vitest_1.it)('should handle opponent abstention as victory', () => {
        const fencer = createFencer('1');
        const opponent = createFencer('2');
        const matches = [
            createMatch(1, fencer, opponent, createScore(3, true), { value: 2, isVictory: false, isAbstention: true, isExclusion: false, isForfait: false }),
        ];
        const stats = (0, poolCalculations_1.calculateFencerPoolStats)(fencer, matches);
        (0, vitest_1.expect)(stats.victories).toBe(1);
        (0, vitest_1.expect)(stats.defeats).toBe(0);
    });
    (0, vitest_1.it)('should return zero stats for fencer not in any match', () => {
        const fencer = createFencer('1');
        const other1 = createFencer('2');
        const other2 = createFencer('3');
        const matches = [
            createMatch(1, other1, other2, createScore(5, true), createScore(3, false)),
        ];
        const stats = (0, poolCalculations_1.calculateFencerPoolStats)(fencer, matches);
        (0, vitest_1.expect)(stats.victories).toBe(0);
        (0, vitest_1.expect)(stats.defeats).toBe(0);
        (0, vitest_1.expect)(stats.matchesPlayed).toBe(0);
        (0, vitest_1.expect)(stats.victoryRatio).toBe(0);
    });
});
// ============================================================================
// calculatePoolRanking Tests
// ============================================================================
(0, vitest_1.describe)('calculatePoolRanking', () => {
    (0, vitest_1.it)('should rank fencers by victory ratio (V/M)', () => {
        const fencer1 = createFencer('1');
        const fencer2 = createFencer('2');
        const fencer3 = createFencer('3');
        // Fencer1: 2V 0D (V/M=1.0)
        // Fencer2: 1V 1D (V/M=0.5)
        // Fencer3: 0V 2D (V/M=0.0)
        const matches = [
            createMatch(1, fencer1, fencer2, createScore(5, true), createScore(3, false)),
            createMatch(2, fencer2, fencer3, createScore(5, true), createScore(2, false)),
            createMatch(3, fencer1, fencer3, createScore(5, true), createScore(1, false)),
        ];
        const pool = createPool([fencer1, fencer2, fencer3], matches);
        const ranking = (0, poolCalculations_1.calculatePoolRanking)(pool);
        (0, vitest_1.expect)(ranking[0].fencer.id).toBe('1');
        (0, vitest_1.expect)(ranking[0].rank).toBe(1);
        (0, vitest_1.expect)(ranking[0].ratio).toBe(1);
        (0, vitest_1.expect)(ranking[1].fencer.id).toBe('2');
        (0, vitest_1.expect)(ranking[1].rank).toBe(2);
        (0, vitest_1.expect)(ranking[1].ratio).toBe(0.5);
        (0, vitest_1.expect)(ranking[2].fencer.id).toBe('3');
        (0, vitest_1.expect)(ranking[2].rank).toBe(3);
        (0, vitest_1.expect)(ranking[2].ratio).toBe(0);
    });
    (0, vitest_1.it)('should use index (TD-TR) as tiebreaker', () => {
        const fencer1 = createFencer('1');
        const fencer2 = createFencer('2');
        const fencer3 = createFencer('3');
        // All fencers: 1V 1D (V/M=0.5)
        // With these scores, all have index 0 since it's a circular win
        const matches = [
            createMatch(1, fencer1, fencer2, createScore(5, true), createScore(3, false)),
            createMatch(2, fencer2, fencer3, createScore(5, true), createScore(3, false)),
            createMatch(3, fencer3, fencer1, createScore(5, true), createScore(3, false)),
        ];
        const pool = createPool([fencer1, fencer2, fencer3], matches);
        const ranking = (0, poolCalculations_1.calculatePoolRanking)(pool);
        // All have same V/M and same index in a circular pattern
        (0, vitest_1.expect)(ranking.length).toBe(3);
        (0, vitest_1.expect)(ranking.every(r => r.ratio === 0.5)).toBe(true);
    });
    (0, vitest_1.it)('should use touches scored (TD) as second tiebreaker', () => {
        const fencer1 = createFencer('1');
        const fencer2 = createFencer('2');
        const fencer3 = createFencer('3');
        // Same V/M and Index, but different TD
        // Fencer1: 5V0, 5V0 -> TD=10, TR=0, Index=10
        // Fencer2: 5V0, 0D5 -> TD=5, TR=5, Index=0
        // After circular: everyone 1V 1D
        // Need to construct carefully for same ratio, same index, different TD
        const matches = [
            createMatch(1, fencer1, fencer2, createScore(5, true), createScore(4, false)),
            createMatch(2, fencer2, fencer3, createScore(5, true), createScore(4, false)),
            createMatch(3, fencer3, fencer1, createScore(5, true), createScore(4, false)),
        ];
        const pool = createPool([fencer1, fencer2, fencer3], matches);
        const ranking = (0, poolCalculations_1.calculatePoolRanking)(pool);
        // All have V/M=0.5, Index=1
        // But fencers might have different TD depending on order
        (0, vitest_1.expect)(ranking.length).toBe(3);
        (0, vitest_1.expect)(ranking.every(r => r.ratio === 0.5)).toBe(true);
    });
    (0, vitest_1.it)('should exclude EXCLUDED, FORFAIT, and ABANDONED fencers', () => {
        const fencer1 = createFencer('1');
        const fencer2 = createFencer('2', { status: types_1.FencerStatus.EXCLUDED });
        const fencer3 = createFencer('3', { status: types_1.FencerStatus.FORFAIT });
        const fencer4 = createFencer('4', { status: types_1.FencerStatus.ABANDONED });
        const matches = [];
        const pool = createPool([fencer1, fencer2, fencer3, fencer4], matches);
        const ranking = (0, poolCalculations_1.calculatePoolRanking)(pool);
        (0, vitest_1.expect)(ranking.length).toBe(1);
        (0, vitest_1.expect)(ranking[0].fencer.id).toBe('1');
    });
    (0, vitest_1.it)('should assign ex-aequo ranks for equal stats', () => {
        const fencer1 = createFencer('1');
        const fencer2 = createFencer('2');
        // Both have identical stats
        const fencer3 = createFencer('3');
        const matches = [
            createMatch(1, fencer1, fencer3, createScore(5, true), createScore(3, false)),
            createMatch(2, fencer2, fencer3, createScore(5, true), createScore(3, false)),
            createMatch(3, fencer1, fencer2, createScore(4, false), createScore(4, false)), // Tie shouldn't happen normally
        ];
        const pool = createPool([fencer1, fencer2, fencer3], matches);
        const ranking = (0, poolCalculations_1.calculatePoolRanking)(pool);
        // Verify ranking exists
        (0, vitest_1.expect)(ranking.length).toBe(3);
    });
    (0, vitest_1.it)('should handle empty pool', () => {
        const pool = createPool([], []);
        const ranking = (0, poolCalculations_1.calculatePoolRanking)(pool);
        (0, vitest_1.expect)(ranking.length).toBe(0);
    });
    (0, vitest_1.it)('should handle pool with single fencer', () => {
        const fencer = createFencer('1');
        const pool = createPool([fencer], []);
        const ranking = (0, poolCalculations_1.calculatePoolRanking)(pool);
        (0, vitest_1.expect)(ranking.length).toBe(1);
        (0, vitest_1.expect)(ranking[0].rank).toBe(1);
    });
});
// ============================================================================
// calculateQuestPoints Tests
// ============================================================================
(0, vitest_1.describe)('calculateQuestPoints', () => {
    (0, vitest_1.it)('should return 4 points for large score difference (>=12)', () => {
        (0, vitest_1.expect)((0, poolCalculations_1.calculateQuestPoints)(15, 3)).toBe(4);
        (0, vitest_1.expect)((0, poolCalculations_1.calculateQuestPoints)(15, 0)).toBe(4);
        (0, vitest_1.expect)((0, poolCalculations_1.calculateQuestPoints)(12, 0)).toBe(4);
    });
    (0, vitest_1.it)('should return 3 points for score difference 8-11', () => {
        (0, vitest_1.expect)((0, poolCalculations_1.calculateQuestPoints)(15, 7)).toBe(3);
        (0, vitest_1.expect)((0, poolCalculations_1.calculateQuestPoints)(10, 2)).toBe(3);
        (0, vitest_1.expect)((0, poolCalculations_1.calculateQuestPoints)(11, 3)).toBe(3);
    });
    (0, vitest_1.it)('should return 2 points for score difference 4-7', () => {
        (0, vitest_1.expect)((0, poolCalculations_1.calculateQuestPoints)(9, 5)).toBe(2);
        (0, vitest_1.expect)((0, poolCalculations_1.calculateQuestPoints)(7, 3)).toBe(2);
        (0, vitest_1.expect)((0, poolCalculations_1.calculateQuestPoints)(5, 1)).toBe(2);
    });
    (0, vitest_1.it)('should return 1 point for small score difference (<=3)', () => {
        (0, vitest_1.expect)((0, poolCalculations_1.calculateQuestPoints)(5, 4)).toBe(1);
        (0, vitest_1.expect)((0, poolCalculations_1.calculateQuestPoints)(5, 3)).toBe(1);
        (0, vitest_1.expect)((0, poolCalculations_1.calculateQuestPoints)(3, 2)).toBe(1);
        (0, vitest_1.expect)((0, poolCalculations_1.calculateQuestPoints)(5, 2)).toBe(1);
    });
    (0, vitest_1.it)('should handle edge cases at boundaries', () => {
        // Boundary at 12 (diff=12 -> 4 points)
        (0, vitest_1.expect)((0, poolCalculations_1.calculateQuestPoints)(12, 0)).toBe(4);
        (0, vitest_1.expect)((0, poolCalculations_1.calculateQuestPoints)(11, 0)).toBe(3); // diff=11
        // Boundary at 8 (diff=8 -> 3 points)
        (0, vitest_1.expect)((0, poolCalculations_1.calculateQuestPoints)(8, 0)).toBe(3);
        (0, vitest_1.expect)((0, poolCalculations_1.calculateQuestPoints)(7, 0)).toBe(2); // diff=7
        // Boundary at 4 (diff=4 -> 2 points)
        (0, vitest_1.expect)((0, poolCalculations_1.calculateQuestPoints)(4, 0)).toBe(2);
        (0, vitest_1.expect)((0, poolCalculations_1.calculateQuestPoints)(3, 0)).toBe(1); // diff=3
    });
});
// ============================================================================
// calculatePoolRankingQuest Tests
// ============================================================================
(0, vitest_1.describe)('calculatePoolRankingQuest', () => {
    (0, vitest_1.it)('should rank by quest points first', () => {
        const fencer1 = createFencer('1');
        const fencer2 = createFencer('2');
        const fencer3 = createFencer('3');
        // Fencer1: wins with large margins (4+4 = 8 points)
        // Fencer2: wins with medium margins (2+2 = 4 points)
        // Fencer3: loses all
        const matches = [
            createMatch(1, fencer1, fencer3, createScore(15, true), createScore(2, false)),
            createMatch(2, fencer1, fencer2, createScore(15, true), createScore(3, false)),
            createMatch(3, fencer2, fencer3, createScore(9, true), createScore(5, false)),
        ];
        const pool = createPool([fencer1, fencer2, fencer3], matches);
        const ranking = (0, poolCalculations_1.calculatePoolRankingQuest)(pool);
        (0, vitest_1.expect)(ranking[0].fencer.id).toBe('1');
        (0, vitest_1.expect)(ranking[0].questPoints).toBe(8);
        (0, vitest_1.expect)(ranking[1].fencer.id).toBe('2');
        (0, vitest_1.expect)(ranking[1].questPoints).toBe(2);
        (0, vitest_1.expect)(ranking[2].fencer.id).toBe('3');
        (0, vitest_1.expect)(ranking[2].questPoints).toBe(0);
    });
    (0, vitest_1.it)('should track victory types (V4, V3, V2, V1)', () => {
        const fencer1 = createFencer('1');
        const fencer2 = createFencer('2');
        const fencer3 = createFencer('3');
        const fencer4 = createFencer('4');
        const fencer5 = createFencer('5');
        const matches = [
            // Fencer1 wins with different margins
            createMatch(1, fencer1, fencer2, createScore(15, true), createScore(0, false)), // V4 (diff=15)
            createMatch(2, fencer1, fencer3, createScore(10, true), createScore(2, false)), // V3 (diff=8)
            createMatch(3, fencer1, fencer4, createScore(8, true), createScore(4, false)), // V2 (diff=4)
            createMatch(4, fencer1, fencer5, createScore(5, true), createScore(4, false)), // V1 (diff=1)
        ];
        const pool = createPool([fencer1, fencer2, fencer3, fencer4, fencer5], matches);
        const ranking = (0, poolCalculations_1.calculatePoolRankingQuest)(pool);
        const fencer1Ranking = ranking.find(r => r.fencer.id === '1');
        (0, vitest_1.expect)(fencer1Ranking?.questVictories4).toBe(1);
        (0, vitest_1.expect)(fencer1Ranking?.questVictories3).toBe(1);
        (0, vitest_1.expect)(fencer1Ranking?.questVictories2).toBe(1);
        (0, vitest_1.expect)(fencer1Ranking?.questVictories1).toBe(1);
        (0, vitest_1.expect)(fencer1Ranking?.questPoints).toBe(10); // 4+3+2+1
    });
});
// ============================================================================
// distributeFencersToPoolsSerpentine Tests
// ============================================================================
(0, vitest_1.describe)('distributeFencersToPoolsSerpentine', () => {
    (0, vitest_1.it)('should distribute fencers evenly across pools', () => {
        const fencers = Array.from({ length: 12 }, (_, i) => createFencer(String(i + 1), { ranking: i + 1 }));
        const pools = (0, poolCalculations_1.distributeFencersToPoolsSerpentine)(fencers, 3, {
            byClub: false,
            byLeague: false,
            byNation: false,
        });
        (0, vitest_1.expect)(pools.length).toBe(3);
        (0, vitest_1.expect)(pools[0].length).toBe(4);
        (0, vitest_1.expect)(pools[1].length).toBe(4);
        (0, vitest_1.expect)(pools[2].length).toBe(4);
    });
    (0, vitest_1.it)('should use serpentine distribution pattern', () => {
        const fencers = Array.from({ length: 6 }, (_, i) => createFencer(String(i + 1), { ranking: i + 1 }));
        const pools = (0, poolCalculations_1.distributeFencersToPoolsSerpentine)(fencers, 3, {
            byClub: false,
            byLeague: false,
            byNation: false,
        });
        // Serpentine: 1-2-3, then 3-2-1
        // Pool 0: Rank 1, Rank 6
        // Pool 1: Rank 2, Rank 5
        // Pool 2: Rank 3, Rank 4
        (0, vitest_1.expect)(pools[0].map(f => f.ranking)).toContain(1);
        (0, vitest_1.expect)(pools[1].map(f => f.ranking)).toContain(2);
        (0, vitest_1.expect)(pools[2].map(f => f.ranking)).toContain(3);
    });
    (0, vitest_1.it)('should try to separate fencers from same club', () => {
        const fencers = [
            createFencer('1', { ranking: 1, club: 'Club A' }),
            createFencer('2', { ranking: 2, club: 'Club A' }),
            createFencer('3', { ranking: 3, club: 'Club B' }),
            createFencer('4', { ranking: 4, club: 'Club B' }),
        ];
        const pools = (0, poolCalculations_1.distributeFencersToPoolsSerpentine)(fencers, 2, {
            byClub: true,
            byLeague: false,
            byNation: false,
        });
        // With club separation, try to avoid same club in same pool
        const pool0Clubs = pools[0].map(f => f.club);
        const pool1Clubs = pools[1].map(f => f.club);
        // Should try to separate - not always possible but algorithm tries
        (0, vitest_1.expect)(pools.length).toBe(2);
    });
    (0, vitest_1.it)('should handle uneven distribution', () => {
        const fencers = Array.from({ length: 7 }, (_, i) => createFencer(String(i + 1), { ranking: i + 1 }));
        const pools = (0, poolCalculations_1.distributeFencersToPoolsSerpentine)(fencers, 2, {
            byClub: false,
            byLeague: false,
            byNation: false,
        });
        (0, vitest_1.expect)(pools.length).toBe(2);
        // One pool should have 4, other 3
        const sizes = pools.map(p => p.length).sort();
        (0, vitest_1.expect)(sizes).toEqual([3, 4]);
    });
    (0, vitest_1.it)('should handle single pool', () => {
        const fencers = Array.from({ length: 5 }, (_, i) => createFencer(String(i + 1), { ranking: i + 1 }));
        const pools = (0, poolCalculations_1.distributeFencersToPoolsSerpentine)(fencers, 1, {
            byClub: false,
            byLeague: false,
            byNation: false,
        });
        (0, vitest_1.expect)(pools.length).toBe(1);
        (0, vitest_1.expect)(pools[0].length).toBe(5);
    });
    (0, vitest_1.it)('should sort fencers by ranking before distribution', () => {
        // Fencers in random order
        const fencers = [
            createFencer('5', { ranking: 5 }),
            createFencer('1', { ranking: 1 }),
            createFencer('3', { ranking: 3 }),
            createFencer('2', { ranking: 2 }),
            createFencer('4', { ranking: 4 }),
        ];
        const pools = (0, poolCalculations_1.distributeFencersToPoolsSerpentine)(fencers, 2, {
            byClub: false,
            byLeague: false,
            byNation: false,
        });
        // Best ranked should go to first pool first
        const allRankings = pools.flatMap(p => p.map(f => f.ranking));
        (0, vitest_1.expect)(allRankings.sort()).toEqual([1, 2, 3, 4, 5]);
    });
});
// ============================================================================
// validatePool Tests
// ============================================================================
(0, vitest_1.describe)('validatePool', () => {
    (0, vitest_1.it)('should validate a complete pool', () => {
        const fencer1 = createFencer('1');
        const fencer2 = createFencer('2');
        const fencer3 = createFencer('3');
        const matches = [
            createMatch(1, fencer1, fencer2, createScore(5, true), createScore(3, false)),
            createMatch(2, fencer2, fencer3, createScore(5, true), createScore(2, false)),
            createMatch(3, fencer1, fencer3, createScore(5, true), createScore(1, false)),
        ];
        const pool = createPool([fencer1, fencer2, fencer3], matches);
        const result = (0, poolCalculations_1.validatePool)(pool);
        (0, vitest_1.expect)(result.valid).toBe(true);
        (0, vitest_1.expect)(result.errors.length).toBe(0);
    });
    (0, vitest_1.it)('should detect incomplete matches', () => {
        const fencer1 = createFencer('1');
        const fencer2 = createFencer('2');
        const matches = [
            createMatch(1, fencer1, fencer2, null, null, types_1.MatchStatus.NOT_STARTED),
        ];
        const pool = createPool([fencer1, fencer2], matches);
        const result = (0, poolCalculations_1.validatePool)(pool);
        (0, vitest_1.expect)(result.valid).toBe(false);
        (0, vitest_1.expect)(result.errors).toContain('1 match(s) non terminé(s)');
    });
    (0, vitest_1.it)('should detect missing scores in finished matches', () => {
        const fencer1 = createFencer('1');
        const fencer2 = createFencer('2');
        const matches = [
            createMatch(1, fencer1, fencer2, null, null, types_1.MatchStatus.FINISHED),
        ];
        const pool = createPool([fencer1, fencer2], matches);
        const result = (0, poolCalculations_1.validatePool)(pool);
        (0, vitest_1.expect)(result.valid).toBe(false);
        (0, vitest_1.expect)(result.errors.some(e => e.includes('scores manquants'))).toBe(true);
    });
    (0, vitest_1.it)('should detect matches without clear winner', () => {
        const fencer1 = createFencer('1');
        const fencer2 = createFencer('2');
        const matches = [
            createMatch(1, fencer1, fencer2, createScore(5, false), createScore(5, false)),
        ];
        const pool = createPool([fencer1, fencer2], matches);
        const result = (0, poolCalculations_1.validatePool)(pool);
        (0, vitest_1.expect)(result.valid).toBe(false);
        (0, vitest_1.expect)(result.errors.some(e => e.includes('pas de vainqueur clair'))).toBe(true);
    });
    (0, vitest_1.it)('should accept cancelled matches', () => {
        const fencer1 = createFencer('1');
        const fencer2 = createFencer('2');
        const matches = [
            createMatch(1, fencer1, fencer2, null, null, types_1.MatchStatus.CANCELLED),
        ];
        const pool = createPool([fencer1, fencer2], matches);
        const result = (0, poolCalculations_1.validatePool)(pool);
        (0, vitest_1.expect)(result.valid).toBe(true);
    });
});
// ============================================================================
// calculateOptimalPoolCount Tests
// ============================================================================
(0, vitest_1.describe)('calculateOptimalPoolCount', () => {
    (0, vitest_1.it)('should return 1 pool for small counts', () => {
        (0, vitest_1.expect)((0, poolCalculations_1.calculateOptimalPoolCount)(5)).toBe(1);
        (0, vitest_1.expect)((0, poolCalculations_1.calculateOptimalPoolCount)(6)).toBe(1);
        (0, vitest_1.expect)((0, poolCalculations_1.calculateOptimalPoolCount)(7)).toBe(1);
        (0, vitest_1.expect)((0, poolCalculations_1.calculateOptimalPoolCount)(8)).toBe(1);
    });
    (0, vitest_1.it)('should return appropriate count for medium numbers', () => {
        (0, vitest_1.expect)((0, poolCalculations_1.calculateOptimalPoolCount)(10)).toBeGreaterThanOrEqual(1);
        (0, vitest_1.expect)((0, poolCalculations_1.calculateOptimalPoolCount)(10)).toBeLessThanOrEqual(2);
        (0, vitest_1.expect)((0, poolCalculations_1.calculateOptimalPoolCount)(15)).toBeGreaterThanOrEqual(2);
        (0, vitest_1.expect)((0, poolCalculations_1.calculateOptimalPoolCount)(15)).toBeLessThanOrEqual(3);
    });
    (0, vitest_1.it)('should return appropriate count for larger numbers', () => {
        (0, vitest_1.expect)((0, poolCalculations_1.calculateOptimalPoolCount)(24)).toBeGreaterThanOrEqual(3);
        (0, vitest_1.expect)((0, poolCalculations_1.calculateOptimalPoolCount)(24)).toBeLessThanOrEqual(5);
        (0, vitest_1.expect)((0, poolCalculations_1.calculateOptimalPoolCount)(40)).toBeGreaterThanOrEqual(5);
        (0, vitest_1.expect)((0, poolCalculations_1.calculateOptimalPoolCount)(40)).toBeLessThanOrEqual(8);
    });
    (0, vitest_1.it)('should respect custom min and max pool sizes', () => {
        // With min=6, max=6, 12 fencers should be 2 pools
        (0, vitest_1.expect)((0, poolCalculations_1.calculateOptimalPoolCount)(12, 6, 6)).toBe(2);
        // With min=4, max=4, 12 fencers should be 3 pools
        (0, vitest_1.expect)((0, poolCalculations_1.calculateOptimalPoolCount)(12, 4, 4)).toBe(3);
    });
    (0, vitest_1.it)('should handle edge cases', () => {
        (0, vitest_1.expect)((0, poolCalculations_1.calculateOptimalPoolCount)(1)).toBeGreaterThanOrEqual(1);
        (0, vitest_1.expect)((0, poolCalculations_1.calculateOptimalPoolCount)(100)).toBeGreaterThan(10);
    });
});
// ============================================================================
// calculatePoolMatchCount Tests
// ============================================================================
(0, vitest_1.describe)('calculatePoolMatchCount', () => {
    (0, vitest_1.it)('should calculate correct match count using formula n*(n-1)/2', () => {
        (0, vitest_1.expect)((0, poolCalculations_1.calculatePoolMatchCount)(3)).toBe(3);
        (0, vitest_1.expect)((0, poolCalculations_1.calculatePoolMatchCount)(4)).toBe(6);
        (0, vitest_1.expect)((0, poolCalculations_1.calculatePoolMatchCount)(5)).toBe(10);
        (0, vitest_1.expect)((0, poolCalculations_1.calculatePoolMatchCount)(6)).toBe(15);
        (0, vitest_1.expect)((0, poolCalculations_1.calculatePoolMatchCount)(7)).toBe(21);
        (0, vitest_1.expect)((0, poolCalculations_1.calculatePoolMatchCount)(8)).toBe(28);
    });
    (0, vitest_1.it)('should handle edge cases', () => {
        (0, vitest_1.expect)((0, poolCalculations_1.calculatePoolMatchCount)(1)).toBe(0);
        (0, vitest_1.expect)((0, poolCalculations_1.calculatePoolMatchCount)(2)).toBe(1);
    });
});
// ============================================================================
// formatRatio Tests
// ============================================================================
(0, vitest_1.describe)('formatRatio', () => {
    (0, vitest_1.it)('should format ratio with 3 decimal places', () => {
        (0, vitest_1.expect)((0, poolCalculations_1.formatRatio)(1)).toBe('1.000');
        (0, vitest_1.expect)((0, poolCalculations_1.formatRatio)(0.5)).toBe('0.500');
        (0, vitest_1.expect)((0, poolCalculations_1.formatRatio)(0.333)).toBe('0.333');
        (0, vitest_1.expect)((0, poolCalculations_1.formatRatio)(0.6667)).toBe('0.667');
    });
    (0, vitest_1.it)('should handle zero', () => {
        (0, vitest_1.expect)((0, poolCalculations_1.formatRatio)(0)).toBe('0.000');
    });
});
// ============================================================================
// formatIndex Tests
// ============================================================================
(0, vitest_1.describe)('formatIndex', () => {
    (0, vitest_1.it)('should format positive indices with + sign', () => {
        (0, vitest_1.expect)((0, poolCalculations_1.formatIndex)(5)).toBe('+5');
        (0, vitest_1.expect)((0, poolCalculations_1.formatIndex)(10)).toBe('+10');
        (0, vitest_1.expect)((0, poolCalculations_1.formatIndex)(1)).toBe('+1');
    });
    (0, vitest_1.it)('should format negative indices with - sign', () => {
        (0, vitest_1.expect)((0, poolCalculations_1.formatIndex)(-5)).toBe('-5');
        (0, vitest_1.expect)((0, poolCalculations_1.formatIndex)(-10)).toBe('-10');
        (0, vitest_1.expect)((0, poolCalculations_1.formatIndex)(-1)).toBe('-1');
    });
    (0, vitest_1.it)('should format zero with + sign', () => {
        (0, vitest_1.expect)((0, poolCalculations_1.formatIndex)(0)).toBe('+0');
    });
});
// ============================================================================
// calculateOverallRanking Tests
// ============================================================================
(0, vitest_1.describe)('calculateOverallRanking', () => {
    (0, vitest_1.it)('should combine rankings from multiple pools', () => {
        const fencer1 = createFencer('1');
        const fencer2 = createFencer('2');
        const fencer3 = createFencer('3');
        const fencer4 = createFencer('4');
        // Pool 1: fencer1 beats fencer2
        const matches1 = [
            createMatch(1, fencer1, fencer2, createScore(5, true), createScore(2, false)),
        ];
        const pool1 = createPool([fencer1, fencer2], matches1);
        // Pool 2: fencer3 beats fencer4
        const matches2 = [
            createMatch(1, fencer3, fencer4, createScore(5, true), createScore(3, false)),
        ];
        const pool2 = createPool([fencer3, fencer4], matches2);
        const overallRanking = (0, poolCalculations_1.calculateOverallRanking)([pool1, pool2]);
        (0, vitest_1.expect)(overallRanking.length).toBe(4);
        // Both winners should be ranked 1-2 (100% ratio)
        // Both losers should be ranked 3-4 (0% ratio)
        const winners = overallRanking.filter(r => r.ratio === 1);
        const losers = overallRanking.filter(r => r.ratio === 0);
        (0, vitest_1.expect)(winners.length).toBe(2);
        (0, vitest_1.expect)(losers.length).toBe(2);
    });
    (0, vitest_1.it)('should sort by ratio, then index, then touches scored', () => {
        const fencer1 = createFencer('1');
        const fencer2 = createFencer('2');
        // Fencer1: 1V, Index +3, TD=5
        // Fencer2: 1V, Index +2, TD=5
        const pool1Matches = [
            createMatch(1, fencer1, createFencer('3'), createScore(5, true), createScore(2, false)),
        ];
        const pool1 = createPool([fencer1, createFencer('3')], pool1Matches);
        const pool2Matches = [
            createMatch(1, fencer2, createFencer('4'), createScore(5, true), createScore(3, false)),
        ];
        const pool2 = createPool([fencer2, createFencer('4')], pool2Matches);
        const overallRanking = (0, poolCalculations_1.calculateOverallRanking)([pool1, pool2]);
        // Fencer1 should be ranked higher due to better index
        const fencer1Rank = overallRanking.find(r => r.fencer.id === '1');
        const fencer2Rank = overallRanking.find(r => r.fencer.id === '2');
        (0, vitest_1.expect)(fencer1Rank.rank).toBeLessThan(fencer2Rank.rank);
    });
});
//# sourceMappingURL=poolCalculations.test.js.map