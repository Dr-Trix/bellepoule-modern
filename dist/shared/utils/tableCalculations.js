"use strict";
/**
 * BellePoule Modern - Direct Elimination Table Utilities
 * Based on the original BellePoule tableau algorithm
 * Licensed under GPL-3.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTableSize = calculateTableSize;
exports.calculateByeCount = calculateByeCount;
exports.getSeedPosition = getSeedPosition;
exports.generateSeedingChart = generateSeedingChart;
exports.placeFencersInTable = placeFencersInTable;
exports.createDirectEliminationTable = createDirectEliminationTable;
exports.updateTableAfterMatch = updateTableAfterMatch;
exports.calculateTableRanking = calculateTableRanking;
exports.getRoundName = getRoundName;
exports.findNodeById = findNodeById;
exports.findNodeByMatch = findNodeByMatch;
exports.getMatchesInRound = getMatchesInRound;
exports.countRemainingMatches = countRemainingMatches;
exports.canTableStart = canTableStart;
const types_1 = require("../types");
const uuid_1 = require("uuid");
// ============================================================================
// Table Size Calculation
// ============================================================================
/**
 * Calcule la taille du tableau (puissance de 2 supérieure ou égale)
 */
function calculateTableSize(fencerCount) {
    let size = 2;
    while (size < fencerCount) {
        size *= 2;
    }
    return size;
}
/**
 * Calcule le nombre d'exempts (byes) nécessaires
 */
function calculateByeCount(fencerCount, tableSize) {
    return tableSize - fencerCount;
}
// ============================================================================
// Seeding and Placement
// ============================================================================
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
function getSeedPosition(seed, tableSize) {
    if (seed === 1)
        return 0;
    if (seed === 2)
        return tableSize - 1;
    const rounds = Math.log2(tableSize);
    let position = 0;
    let range = tableSize;
    for (let round = 0; round < rounds; round++) {
        range = range / 2;
        const bit = (seed - 1) >> (rounds - 1 - round) & 1;
        if (bit === 1) {
            position += range;
        }
    }
    return position;
}
/**
 * Génère le tableau de placement complet pour une taille donnée
 */
function generateSeedingChart(tableSize) {
    const chart = [];
    for (let seed = 1; seed <= tableSize; seed++) {
        chart[getSeedPosition(seed, tableSize)] = seed;
    }
    return chart;
}
/**
 * Place les tireurs dans le tableau selon leur classement
 */
function placeFencersInTable(fencers, tableSize) {
    const placements = new Array(tableSize).fill(null);
    const seedingChart = generateSeedingChart(tableSize);
    // Trier les tireurs par classement général (après poules)
    const sortedFencers = [...fencers].sort((a, b) => (a.poolStats?.overallRank ?? 999) - (b.poolStats?.overallRank ?? 999));
    // Placer chaque tireur selon son seed
    for (let i = 0; i < sortedFencers.length; i++) {
        const position = seedingChart.indexOf(i + 1);
        if (position !== -1) {
            placements[position] = sortedFencers[i];
        }
    }
    return placements;
}
// ============================================================================
// Table Generation
// ============================================================================
/**
 * Crée la structure complète d'un tableau à élimination directe
 */
function createDirectEliminationTable(fencers, maxScore, name = 'Tableau principal', firstPlace = 1) {
    const tableSize = calculateTableSize(fencers.length);
    const placements = placeFencersInTable(fencers, tableSize);
    const now = new Date();
    const tableId = (0, uuid_1.v4)();
    const nodes = [];
    const rounds = Math.log2(tableSize);
    // Créer tous les noeuds du tableau
    // Premier tour (feuilles)
    for (let i = 0; i < tableSize / 2; i++) {
        const fencerA = placements[i * 2];
        const fencerB = placements[i * 2 + 1];
        const isBye = !fencerA || !fencerB;
        const node = {
            id: (0, uuid_1.v4)(),
            position: i,
            round: tableSize / 2,
            fencerA: fencerA ?? undefined,
            fencerB: fencerB ?? undefined,
            isBye,
            createdAt: now,
            updatedAt: now,
        };
        // Si bye, le tireur présent gagne automatiquement
        if (isBye && (fencerA || fencerB)) {
            node.winner = fencerA ?? fencerB ?? undefined;
        }
        // Créer le match si les deux tireurs sont présents
        if (fencerA && fencerB) {
            node.match = createTableMatch(fencerA, fencerB, i + 1, maxScore, tableSize / 2);
        }
        nodes.push(node);
    }
    // Créer les tours suivants (jusqu'à la finale)
    let currentRound = tableSize / 4;
    let previousRoundStart = 0;
    while (currentRound >= 1) {
        const matchesInRound = currentRound;
        const roundStart = nodes.length;
        for (let i = 0; i < matchesInRound; i++) {
            const parentAIndex = previousRoundStart + i * 2;
            const parentBIndex = previousRoundStart + i * 2 + 1;
            const parentA = nodes[parentAIndex];
            const parentB = nodes[parentBIndex];
            const node = {
                id: (0, uuid_1.v4)(),
                position: i,
                round: currentRound,
                parentA: parentA.id,
                parentB: parentB.id,
                isBye: false,
                createdAt: now,
                updatedAt: now,
            };
            // Si les parents ont des gagnants (byes), les propager
            if (parentA.winner) {
                node.fencerA = parentA.winner;
            }
            if (parentB.winner) {
                node.fencerB = parentB.winner;
            }
            // Si les deux tireurs sont connus, créer le match
            if (node.fencerA && node.fencerB) {
                node.match = createTableMatch(node.fencerA, node.fencerB, nodes.length + 1, maxScore, currentRound);
            }
            nodes.push(node);
        }
        previousRoundStart = roundStart;
        currentRound = currentRound / 2;
    }
    return {
        id: tableId,
        competitionId: '',
        name,
        size: tableSize,
        maxScore,
        nodes,
        isComplete: false,
        ranking: [],
        firstPlace,
        createdAt: now,
        updatedAt: now,
    };
}
/**
 * Crée un match de tableau
 */
function createTableMatch(fencerA, fencerB, matchNumber, maxScore, round) {
    const now = new Date();
    return {
        id: (0, uuid_1.v4)(),
        number: matchNumber,
        fencerA,
        fencerB,
        scoreA: null,
        scoreB: null,
        maxScore,
        status: types_1.MatchStatus.NOT_STARTED,
        round,
        createdAt: now,
        updatedAt: now,
    };
}
// ============================================================================
// Table Updates
// ============================================================================
/**
 * Met à jour le tableau après qu'un match soit terminé
 */
function updateTableAfterMatch(table, matchId, winner) {
    const updatedNodes = table.nodes.map(node => {
        if (node.match?.id === matchId) {
            return { ...node, winner };
        }
        return node;
    });
    // Propager le gagnant vers le tour suivant
    const nodeWithMatch = updatedNodes.find(n => n.match?.id === matchId);
    if (nodeWithMatch) {
        const nextNode = updatedNodes.find(n => n.parentA === nodeWithMatch.id || n.parentB === nodeWithMatch.id);
        if (nextNode) {
            const isFromA = nextNode.parentA === nodeWithMatch.id;
            if (isFromA) {
                nextNode.fencerA = winner;
            }
            else {
                nextNode.fencerB = winner;
            }
            // Créer le match si les deux tireurs sont maintenant connus
            if (nextNode.fencerA && nextNode.fencerB && !nextNode.match) {
                nextNode.match = createTableMatch(nextNode.fencerA, nextNode.fencerB, getNextMatchNumber(updatedNodes), table.maxScore, nextNode.round);
            }
        }
    }
    // Vérifier si le tableau est complet
    const isComplete = updatedNodes
        .filter(n => n.round === 1)
        .every(n => n.winner);
    return {
        ...table,
        nodes: updatedNodes,
        isComplete,
        updatedAt: new Date(),
    };
}
/**
 * Obtient le prochain numéro de match disponible
 */
function getNextMatchNumber(nodes) {
    const maxNumber = nodes
        .filter(n => n.match)
        .reduce((max, n) => Math.max(max, n.match?.number ?? 0), 0);
    return maxNumber + 1;
}
// ============================================================================
// Table Ranking
// ============================================================================
/**
 * Calcule le classement final d'un tableau
 */
function calculateTableRanking(table) {
    const rankings = [];
    const firstPlace = table.firstPlace;
    // Finale (place 1 et 2)
    const finale = table.nodes.find(n => n.round === 1);
    if (finale?.winner) {
        rankings.push({
            fencer: finale.winner,
            rank: firstPlace,
            eliminatedAt: 1,
        });
        const loser = finale.fencerA?.id === finale.winner.id
            ? finale.fencerB
            : finale.fencerA;
        if (loser) {
            rankings.push({
                fencer: loser,
                rank: firstPlace + 1,
                eliminatedAt: 1,
            });
        }
    }
    // Parcourir les autres tours
    let currentPlace = firstPlace + 2;
    let round = 2;
    while (round <= table.size / 2) {
        const roundNodes = table.nodes.filter(n => n.round === round);
        const losers = [];
        for (const node of roundNodes) {
            if (node.winner) {
                const loser = node.fencerA?.id === node.winner.id
                    ? node.fencerB
                    : node.fencerA;
                if (loser) {
                    losers.push(loser);
                }
            }
        }
        // Les perdants de ce tour partagent les places ex aequo
        for (const loser of losers) {
            rankings.push({
                fencer: loser,
                rank: currentPlace,
                eliminatedAt: round,
            });
        }
        currentPlace += losers.length;
        round *= 2;
    }
    return rankings;
}
// ============================================================================
// Round Names
// ============================================================================
/**
 * Retourne le nom d'un tour de tableau
 */
function getRoundName(round, locale = 'fr') {
    const names = {
        fr: {
            1: 'Finale',
            2: 'Demi-finales',
            4: 'Quarts de finale',
            8: '8èmes de finale',
            16: '16èmes de finale',
            32: '32èmes de finale',
            64: '64èmes de finale',
            128: '128èmes de finale',
        },
        en: {
            1: 'Final',
            2: 'Semi-finals',
            4: 'Quarter-finals',
            8: 'Round of 16',
            16: 'Round of 32',
            32: 'Round of 64',
            64: 'Round of 128',
            128: 'Round of 256',
        },
    };
    return names[locale]?.[round] ?? `Tableau de ${round * 2}`;
}
// ============================================================================
// Utility Functions
// ============================================================================
/**
 * Trouve un noeud par son ID
 */
function findNodeById(table, nodeId) {
    return table.nodes.find(n => n.id === nodeId);
}
/**
 * Trouve un noeud par son match
 */
function findNodeByMatch(table, matchId) {
    return table.nodes.find(n => n.match?.id === matchId);
}
/**
 * Obtient tous les matchs d'un tour
 */
function getMatchesInRound(table, round) {
    return table.nodes
        .filter(n => n.round === round && n.match)
        .map(n => n.match);
}
/**
 * Compte les matchs restants dans un tableau
 */
function countRemainingMatches(table) {
    return table.nodes.filter(n => n.match && n.match.status !== types_1.MatchStatus.FINISHED).length;
}
/**
 * Vérifie si un tableau peut démarrer (premier tour complet)
 */
function canTableStart(table) {
    const firstRound = table.size / 2;
    const firstRoundNodes = table.nodes.filter(n => n.round === firstRound);
    return firstRoundNodes.every(n => n.isBye || (n.fencerA && n.fencerB));
}
//# sourceMappingURL=tableCalculations.js.map