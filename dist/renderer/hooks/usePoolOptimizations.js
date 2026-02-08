"use strict";
/**
 * BellePoule Modern - Optimized Pool Hooks
 * Memoized calculations for pool performance
 * Licensed under GPL-3.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePoolGridData = exports.useFencerDisplay = exports.useScoreEditing = exports.useOrderedMatches = exports.usePoolCalculations = void 0;
const react_1 = require("react");
const types_1 = require("../../shared/types");
const poolCalculations_1 = require("../../shared/utils/poolCalculations");
// ============================================================================
// Pool Calculation Hooks
// ============================================================================
const usePoolCalculations = (pool, weapon) => {
    const isLaserSabre = weapon === types_1.Weapon.LASER;
    // Memoized fencer calculations
    const fencerStats = (0, react_1.useMemo)(() => {
        const stats = new Map();
        // Initialize all fencers with zero stats
        pool.fencers.forEach(fencer => {
            stats.set(fencer.id, {
                victories: 0,
                defeats: 0,
                touchesScored: 0,
                touchesReceived: 0,
                matchesPlayed: 0
            });
        });
        // Calculate stats from matches
        pool.matches.forEach(match => {
            if (match.status !== types_1.MatchStatus.FINISHED || !match.fencerA || !match.fencerB) {
                return;
            }
            const fencerAId = match.fencerA.id;
            const fencerBId = match.fencerB.id;
            const statA = stats.get(fencerAId);
            const statB = stats.get(fencerBId);
            if (!statA || !statB)
                return;
            const scoreA = match.scoreA?.value ?? 0;
            const scoreB = match.scoreB?.value ?? 0;
            // Update stats
            statA.matchesPlayed++;
            statB.matchesPlayed++;
            statA.touchesScored += scoreA;
            statA.touchesReceived += scoreB;
            statB.touchesScored += scoreB;
            statB.touchesReceived += scoreA;
            // Determine winner (considering victory overrides for laser sabre)
            const winnerA = match.scoreA?.isVictory || (scoreA > scoreB && !isLaserSabre);
            const winnerB = match.scoreB?.isVictory || (scoreB > scoreA && !isLaserSabre);
            if (winnerA) {
                statA.victories++;
                statB.defeats++;
            }
            else if (winnerB) {
                statB.victories++;
                statA.defeats++;
            }
        });
        return stats;
    }, [pool.fencers, pool.matches, isLaserSabre]);
    // Memoized pool ranking
    const poolRanking = (0, react_1.useMemo)(() => {
        return (0, poolCalculations_1.calculatePoolRanking)(pool);
    }, [pool.fencers, fencerStats, isLaserSabre]);
    // Memoized match categories
    const matchCategories = (0, react_1.useMemo)(() => {
        const pending = pool.matches
            .map((m, idx) => ({ match: m, index: idx }))
            .filter(({ match }) => match.status !== types_1.MatchStatus.FINISHED);
        const finished = pool.matches
            .map((m, idx) => ({ match: m, index: idx }))
            .filter(({ match }) => match.status === types_1.MatchStatus.FINISHED);
        return { pending, finished };
    }, [pool.matches]);
    return {
        fencerStats,
        poolRanking,
        matchCategories,
        isLaserSabre
    };
};
exports.usePoolCalculations = usePoolCalculations;
// ============================================================================
// Match Ordering Hook
// ============================================================================
const useOrderedMatches = (pool) => {
    const orderedMatches = (0, react_1.useMemo)(() => {
        const pending = pool.matches
            .map((m, idx) => ({ match: m, index: idx }))
            .filter(({ match }) => match.status !== types_1.MatchStatus.FINISHED);
        const finished = pool.matches
            .map((m, idx) => ({ match: m, index: idx }))
            .filter(({ match }) => match.status === types_1.MatchStatus.FINISHED);
        if (pending.length === 0)
            return { pending: [], finished };
        // Smart ordering algorithm to prevent fencers from fighting twice in a row
        const ordered = [];
        const remaining = [...pending];
        let lastFencerIds = new Set();
        while (remaining.length > 0) {
            let bestMatch = null;
            let bestScore = -1;
            for (const candidate of remaining) {
                const fencerAId = candidate.match.fencerA?.id;
                const fencerBId = candidate.match.fencerB?.id;
                let score = 0;
                // Prefer matches with fencers who haven't fought recently
                if (fencerAId && !lastFencerIds.has(fencerAId))
                    score += 2;
                if (fencerBId && !lastFencerIds.has(fencerBId))
                    score += 2;
                // Prefer matches with higher-numbered fencers (to finish their matches earlier)
                if (fencerAId) {
                    const fencerA = pool.fencers.find(f => f.id === fencerAId);
                    if (fencerA)
                        score += fencerA.ref * 0.1;
                }
                if (fencerBId) {
                    const fencerB = pool.fencers.find(f => f.id === fencerBId);
                    if (fencerB)
                        score += fencerB.ref * 0.1;
                }
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = candidate;
                }
            }
            if (bestMatch) {
                ordered.push(bestMatch);
                remaining.splice(remaining.indexOf(bestMatch), 1);
                // Update last fencers set
                lastFencerIds.clear();
                if (bestMatch.match.fencerA)
                    lastFencerIds.add(bestMatch.match.fencerA.id);
                if (bestMatch.match.fencerB)
                    lastFencerIds.add(bestMatch.match.fencerB.id);
            }
            else {
                // Fallback: add remaining matches in order
                ordered.push(...remaining);
                break;
            }
        }
        return { pending: ordered, finished };
    }, [pool.matches, pool.fencers]);
    return orderedMatches;
};
exports.useOrderedMatches = useOrderedMatches;
// ============================================================================
// Score Editing Hook
// ============================================================================
const useScoreEditing = () => {
    const [editingMatch, setEditingMatch] = (0, react_1.useState)(null);
    const [editScoreA, setEditScoreA] = (0, react_1.useState)('');
    const [editScoreB, setEditScoreB] = (0, react_1.useState)('');
    const [victoryA, setVictoryA] = (0, react_1.useState)(false);
    const [victoryB, setVictoryB] = (0, react_1.useState)(false);
    const startEditing = (0, react_1.useCallback)((match) => {
        setEditingMatch(match.number);
        setEditScoreA(match.scoreA?.value?.toString() ?? '');
        setEditScoreB(match.scoreB?.value?.toString() ?? '');
        setVictoryA(match.scoreA?.isVictory ?? false);
        setVictoryB(match.scoreB?.isVictory ?? false);
    }, []);
    const cancelEditing = (0, react_1.useCallback)(() => {
        setEditingMatch(null);
        setEditScoreA('');
        setEditScoreB('');
        setVictoryA(false);
        setVictoryB(false);
    }, []);
    const clearEditing = (0, react_1.useCallback)(() => {
        setEditingMatch(null);
    }, []);
    return {
        editingMatch,
        editScoreA,
        editScoreB,
        victoryA,
        victoryB,
        setEditScoreA,
        setEditScoreB,
        setVictoryA,
        setVictoryB,
        startEditing,
        cancelEditing,
        clearEditing
    };
};
exports.useScoreEditing = useScoreEditing;
// ============================================================================
// Fencer Display Hook
// ============================================================================
const useFencerDisplay = (fencers) => {
    const fencerById = (0, react_1.useMemo)(() => {
        const map = new Map();
        fencers.forEach(fencer => map.set(fencer.id, fencer));
        return map;
    }, [fencers]);
    const getFencerDisplay = (0, react_1.useCallback)((fencer) => {
        if (!fencer)
            return '';
        return `${fencer.ref}. ${fencer.firstName} ${fencer.lastName}`;
    }, []);
    const getFencerShortDisplay = (0, react_1.useCallback)((fencer) => {
        if (!fencer)
            return '';
        return `${fencer.firstName[0]}. ${fencer.lastName}`;
    }, []);
    return {
        fencerById,
        getFencerDisplay,
        getFencerShortDisplay
    };
};
exports.useFencerDisplay = useFencerDisplay;
// ============================================================================
// Pool Grid Data Hook
// ============================================================================
const usePoolGridData = (pool, poolRanking) => {
    const gridData = (0, react_1.useMemo)(() => {
        // Create grid data structure for efficient rendering
        const gridSize = pool.fencers.length;
        const grid = [];
        // Initialize empty grid
        for (let i = 0; i < gridSize; i++) {
            grid[i] = [];
            for (let j = 0; j < gridSize; j++) {
                grid[i][j] = {
                    fencerA: pool.fencers[i],
                    fencerB: pool.fencers[j],
                    match: null,
                    score: '',
                    winner: null
                };
            }
        }
        // Fill with match data
        pool.matches.forEach(match => {
            if (!match.fencerA || !match.fencerB)
                return;
            const indexA = pool.fencers.findIndex(f => f.id === match.fencerA.id);
            const indexB = pool.fencers.findIndex(f => f.id === match.fencerB.id);
            if (indexA !== -1 && indexB !== -1) {
                const scoreA = match.scoreA?.value ?? 0;
                const scoreB = match.scoreB?.value ?? 0;
                const victoryA = match.scoreA?.isVictory;
                const victoryB = match.scoreB?.isVictory;
                let winner = null;
                if (victoryA)
                    winner = 'A';
                else if (victoryB)
                    winner = 'B';
                else if (scoreA > scoreB)
                    winner = 'A';
                else if (scoreB > scoreA)
                    winner = 'B';
                grid[indexA][indexB] = {
                    fencerA: pool.fencers[indexA],
                    fencerB: pool.fencers[indexB],
                    match,
                    score: `${scoreA}-${scoreB}`,
                    winner
                };
            }
        });
        return { grid, gridSize };
    }, [pool.fencers, pool.matches]);
    return gridData;
};
exports.usePoolGridData = usePoolGridData;
//# sourceMappingURL=usePoolOptimizations.js.map