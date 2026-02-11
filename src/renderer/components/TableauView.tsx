/**
 * BellePoule Modern - Tableau View Component
 * Direct Elimination Table
 * Licensed under GPL-3.0
 */

import React, { useState, useEffect } from 'react';
import { Fencer, PoolRanking } from '../../shared/types';
import { useToast } from './Toast';
import { useModalResize } from '../hooks/useModalResize';

export interface TableauMatch {
  id: string;
  round: number;
  position: number;
  fencerA: Fencer | null;
  fencerB: Fencer | null;
  scoreA: number | null;
  scoreB: number | null;
  winner: Fencer | null;
  isBye: boolean;
}

export interface FinalResult {
  rank: number;
  fencer: Fencer;
  eliminatedAt: string;
  questPoints?: number;
}

interface TableauViewProps {
  ranking: PoolRanking[];
  matches: TableauMatch[];
  onMatchesChange: (matches: TableauMatch[]) => void;
  maxScore?: number;
  onComplete?: (results: FinalResult[]) => void;
  thirdPlaceMatch?: boolean;
}

const TableauView: React.FC<TableauViewProps> = ({ 
  ranking, 
  matches, 
  onMatchesChange, 
  maxScore = 15, 
  onComplete,
  thirdPlaceMatch = false
}) => {
  const { showToast } = useToast();
  const [tableauSize, setTableauSize] = useState<number>(0);
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [editScoreA, setEditScoreA] = useState<string>('');
  const [editScoreB, setEditScoreB] = useState<string>('');
  const [victoryA, setVictoryA] = useState(false);
  const [victoryB, setVictoryB] = useState(false);
  const isUnlimitedScore = maxScore === 999;

  const { modalRef, dimensions } = useModalResize({
    defaultWidth: 600,
    defaultHeight: 400,
    minWidth: 400,
    minHeight: 300
  });

  useEffect(() => {
    if (ranking.length > 0) {
      // Vérifier si le tableau existant correspond au classement actuel
      const expectedSize = getTableauSize(ranking.length);
      const currentSize = matches.length > 0 ? Math.max(...matches.map(m => m.round)) : 0;

      // Vérifier si le match de 3ème place est cohérent avec le paramètre
      const hasThirdPlace = matches.some(m => m.round === 3);
      const thirdPlaceMismatch = thirdPlaceMatch !== hasThirdPlace;

      // Régénérer si pas de matches, taille incorrecte, ou changement de petite finale
      if (matches.length === 0 || currentSize !== expectedSize || thirdPlaceMismatch) {
        generateTableau();
      } else {
        setTableauSize(currentSize);
      }
    }
  }, [ranking.length, thirdPlaceMatch]); // Dépend du nombre de tireurs et du match pour la 3ème place

  const getTableauSize = (fencerCount: number): number => {
    const sizes = [4, 8, 16, 32, 64, 128, 256];
    for (const size of sizes) {
      if (fencerCount <= size) return size;
    }
    return 256;
  };

  const generateTableau = () => {
    const qualifiedFencers = ranking.slice(0, Math.min(ranking.length, 64));
    const size = getTableauSize(qualifiedFencers.length);
    setTableauSize(size);

    // Debug pour comprendre les exemptions
    console.log('=== DEBUG TABLEAU ===');
    console.log('Participants qualifiés:', qualifiedFencers.length);
    console.log('Taille du tableau:', size);
    console.log('Liste des qualifiés:', qualifiedFencers.map(r => r.fencer.lastName));

    const seeding = generateFIESeeding(size);
    const newMatches: TableauMatch[] = [];

// Premier tour
    for (let i = 0; i < size / 2; i++) {
      const seedA = seeding[i * 2];
      const seedB = seeding[i * 2 + 1];
      
      const fencerA = seedA <= qualifiedFencers.length ? qualifiedFencers[seedA - 1].fencer : null;
      const fencerB = seedB <= qualifiedFencers.length ? qualifiedFencers[seedB - 1].fencer : null;
      
      const isBye = !fencerA || !fencerB;
      const winner = isBye ? (fencerA || fencerB) : null;

      // Debug pour chaque match
      if (isBye) {
        console.log(`Match ${i}: BYE - seedA=${seedA}, seedB=${seedB}, fencerA=${fencerA?.lastName || 'null'}, fencerB=${fencerB?.lastName || 'null'}`);
      }

      newMatches.push({
        id: `${size}-${i}`,
        round: size,
        position: i,
        fencerA,
        fencerB,
        scoreA: isBye ? null : null,
        scoreB: isBye ? null : null,
        winner,
        isBye,
      });
    }

    // Générer les rounds suivants
    let currentRound = size / 2;
    while (currentRound >= 2) {
      for (let i = 0; i < currentRound / 2; i++) {
        newMatches.push({
          id: `${currentRound}-${i}`,
          round: currentRound,
          position: i,
          fencerA: null,
          fencerB: null,
          scoreA: null,
          scoreB: null,
          winner: null,
          isBye: false,
        });
      }
      currentRound = currentRound / 2;
    }

    // Ajouter le match pour la 3ème place si demandé
    if (thirdPlaceMatch && size >= 4) {
      newMatches.push({
        id: '3-0',
        round: 3,
        position: 0,
        fencerA: null,
        fencerB: null,
        scoreA: null,
        scoreB: null,
        winner: null,
        isBye: false,
      });
    }

    // Propager les byes
    propagateWinners(newMatches, size);
    onMatchesChange(newMatches);
  };

  const generateFIESeeding = (size: number): number[] => {
    if (size === 4) return [1, 4, 3, 2];
    if (size === 8) return [1, 8, 5, 4, 3, 6, 7, 2];
    if (size === 16) return [1, 16, 9, 8, 5, 12, 13, 4, 3, 14, 11, 6, 7, 10, 15, 2];
    if (size === 32) {
      return [1, 32, 17, 16, 9, 24, 25, 8, 5, 28, 21, 12, 13, 20, 29, 4,
              3, 30, 19, 14, 11, 22, 27, 6, 7, 26, 23, 10, 15, 18, 31, 2];
    }
    if (size === 64) {
      return [
        1, 64, 33, 32, 17, 48, 49, 16, 9, 56, 41, 24, 25, 40, 57, 8,
        5, 60, 37, 28, 21, 44, 53, 12, 13, 52, 45, 20, 29, 36, 61, 4,
        3, 62, 35, 30, 19, 46, 51, 14, 11, 54, 43, 22, 27, 38, 59, 6,
        7, 58, 39, 26, 23, 42, 55, 10, 15, 50, 47, 18, 31, 34, 63, 2
      ];
    }
    return Array.from({ length: size }, (_, i) => i + 1);
  };

  const propagateWinners = (matchList: TableauMatch[], size: number) => {
    let currentRound = size;

    while (currentRound > 2) {
      const nextRound = currentRound / 2;
      const currentMatches = matchList.filter(m => m.round === currentRound);
      const nextMatches = matchList.filter(m => m.round === nextRound);

      // Première passe : propager tous les gagnants (y compris les exempts)
      currentMatches.forEach((match, idx) => {
        if (match.winner) {
          const nextMatchIdx = Math.floor(idx / 2);
          const nextMatch = nextMatches[nextMatchIdx];
          if (nextMatch) {
            if (idx % 2 === 0) {
              nextMatch.fencerA = match.winner;
            } else {
              nextMatch.fencerB = match.winner;
            }
          }
        }
      });

      // Deuxième passe : vérifier les exempts au tour suivant
      nextMatches.forEach((nextMatch, nextIdx) => {
        // Ne pas modifier les matchs déjà joués
        if (nextMatch.scoreA !== null && nextMatch.scoreB !== null) return;

        const feederA = currentMatches[nextIdx * 2];
        const feederB = currentMatches[nextIdx * 2 + 1];

        // Vérifier si les deux matchs sources sont résolus
        const feederAResolved = !feederA || feederA.winner !== null ||
          (feederA.isBye && !feederA.fencerA && !feederA.fencerB);
        const feederBResolved = !feederB || feederB.winner !== null ||
          (feederB.isBye && !feederB.fencerA && !feederB.fencerB);

        if (feederAResolved && feederBResolved) {
          if (nextMatch.fencerA && !nextMatch.fencerB) {
            nextMatch.winner = nextMatch.fencerA;
            nextMatch.isBye = true;
          } else if (!nextMatch.fencerA && nextMatch.fencerB) {
            nextMatch.winner = nextMatch.fencerB;
            nextMatch.isBye = true;
          } else if (nextMatch.fencerA && nextMatch.fencerB) {
            nextMatch.isBye = false;
            nextMatch.winner = null;
          }
        }
      });

      currentRound = nextRound;
    }

    // Gérer le match de 3ème place si activé
    if (thirdPlaceMatch && size >= 4) {
      const thirdPlaceMatchEntry = matchList.find(m => m.round === 3);
      const semiFinalMatches = matchList.filter(m => m.round === 4);

      if (thirdPlaceMatchEntry && semiFinalMatches.length === 2) {
        // Assigner les perdants des demi-finales au match de 3ème place
        const losers: Fencer[] = [];

        semiFinalMatches.forEach(semiFinal => {
          if (semiFinal.winner) {
            const loser = semiFinal.fencerA?.id === semiFinal.winner.id
              ? semiFinal.fencerB
              : semiFinal.fencerA;
            if (loser) losers.push(loser);
          }
        });

        if (losers.length === 2) {
          thirdPlaceMatchEntry.fencerA = losers[0];
          thirdPlaceMatchEntry.fencerB = losers[1];
        }
      }
    }
  };

  const getRoundName = (round: number): string => {
    if (round === 2) return 'Finale';
    if (round === 3) return 'Petite finale';
    if (round === 4) return 'Demi-finales';
    if (round === 8) return 'Quarts de finale';
    if (round === 16) return 'Tableau de 16';
    if (round === 32) return 'Tableau de 32';
    if (round === 64) return 'Tableau de 64';
    return `Tableau de ${round}`;
  };

  const handleAutoFillScores = () => {
    const confirmed = window.confirm(
      'Remplir automatiquement tous les scores des matchs non terminés ?\n\nLes scores seront générés aléatoirement pour les tests.'
    );

    if (!confirmed) return;

    // Copier les matchs actuels
    let updatedMatches = [...matches];
    let filledCount = 0;

    // Traiter les matchs par ordre croissant de round (du premier tour à la finale)
    const rounds = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);

    for (const round of rounds) {
      const roundMatches = updatedMatches.filter(m => m.round === round && !m.winner && !m.isBye);

      for (const match of roundMatches) {
        // Générer des scores aléatoires
        let scoreA = Math.floor(Math.random() * (maxScore + 1));
        let scoreB = Math.floor(Math.random() * (maxScore + 1));

        // Éviter les égalités en élimination directe
        if (scoreA === scoreB) {
          if (Math.random() > 0.5) {
            scoreA += 1;
          } else {
            scoreB += 1;
          }
        }

        // Déterminer le vainqueur
        const winner = scoreA > scoreB ? match.fencerA : match.fencerB;

        // Mettre à jour le match
        const matchIndex = updatedMatches.findIndex(m => m.id === match.id);
        if (matchIndex !== -1) {
          updatedMatches[matchIndex] = {
            ...match,
            scoreA,
            scoreB,
            winner
          };
          filledCount++;
        }
      }

      // Propager les vainqueurs au tour suivant
      propagateWinners(updatedMatches, tableauSize);
    }

    onMatchesChange(updatedMatches);
    showToast(`Scores générés pour ${filledCount} match(s)`, 'success');

    // Vérifier si le tableau est complet
    const champion = updatedMatches.find(m => m.round === 2)?.winner;
    if (champion && onComplete) {
      const finalResults = calculateFinalResults(updatedMatches);
      onComplete(finalResults);
    }
  };

  const handleScoreSubmit = () => {
    if (!editingMatch) return;
    
    const scoreA = parseInt(editScoreA) || 0;
    const scoreB = parseInt(editScoreB) || 0;

    // Validation
    if (scoreA === scoreB && !victoryA && !victoryB) {
      showToast('Les scores ne peuvent pas être égaux en élimination directe', 'error');
      return;
    }

    if (!isUnlimitedScore && maxScore > 0) {
      if (scoreA > maxScore || scoreB > maxScore) {
        showToast(`Le score ne peut pas dépasser ${maxScore}`, 'error');
        return;
      }
    }

    // Déterminer le vainqueur
    let winner: Fencer | null = null;
    if (victoryA) {
      winner = matches.find(m => m.id === editingMatch)?.fencerA || null;
    } else if (victoryB) {
      winner = matches.find(m => m.id === editingMatch)?.fencerB || null;
    } else if (scoreA > scoreB) {
      winner = matches.find(m => m.id === editingMatch)?.fencerA || null;
    } else if (scoreB > scoreA) {
      winner = matches.find(m => m.id === editingMatch)?.fencerB || null;
    }

    const updatedMatches = matches.map(match => {
      if (match.id === editingMatch) {
        return {
          ...match,
          scoreA,
          scoreB,
          winner
        };
      }
      return match;
    });

    // Propager les gagnants avant de sauvegarder
    propagateWinners(updatedMatches, tableauSize);
    onMatchesChange([...updatedMatches]);

    setShowScoreModal(false);
    setEditingMatch(null);
    setEditScoreA('');
    setEditScoreB('');
    setVictoryA(false);
    setVictoryB(false);
  };

  const openScoreModal = (match: TableauMatch) => {
    setEditingMatch(match.id);
    setEditScoreA(match.scoreA?.toString() || '');
    setEditScoreB(match.scoreB?.toString() || '');
    setVictoryA(false);
    setVictoryB(false);
    setShowScoreModal(true);
  };

  const handleSpecialStatus = (status: 'abandon' | 'forfait' | 'exclusion') => {
    if (!editingMatch) return;

    const match = matches.find(m => m.id === editingMatch);
    if (!match) return;

    let winner: Fencer | null = null;
    
    if (status === 'abandon' || status === 'forfait') {
      // Le match est annulé, pas de vainqueur
      winner = null;
    } else if (status === 'exclusion') {
      // Pour l'exclusion, l'adversaire gagne
      winner = match.fencerA && match.fencerB ? match.fencerB : match.fencerA || match.fencerB;
    }

    const updatedMatches = matches.map(m => {
      if (m.id === editingMatch) {
        return {
          ...m,
          winner,
          // On pourrait ajouter des champs pour les statuts spéciaux ici
        };
      }
      return m;
    });

    // Propager les gagnants avant de sauvegarder
    propagateWinners(updatedMatches, tableauSize);
    onMatchesChange([...updatedMatches]);

    setShowScoreModal(false);
    setEditingMatch(null);
    setEditScoreA('');
    setEditScoreB('');
    setVictoryA(false);
    setVictoryB(false);
  };

  const calculateFinalResults = (matchList: TableauMatch[]): FinalResult[] => {
    const results: FinalResult[] = [];
    const processed = new Set<string>();

    // Champion (gagnant de la finale)
    const finalMatch = matchList.find(m => m.round === 2);
    if (finalMatch?.winner) {
      results.push({ rank: 1, fencer: finalMatch.winner, eliminatedAt: 'Vainqueur' });
      processed.add(finalMatch.winner.id);

      // 2ème (perdant de la finale)
      const loser = finalMatch.fencerA?.id === finalMatch.winner.id ? finalMatch.fencerB : finalMatch.fencerA;
      if (loser) {
        results.push({ rank: 2, fencer: loser, eliminatedAt: 'Finale' });
        processed.add(loser.id);
      }
    }

    // Match pour la 3ème place (existe si présent)
    const thirdPlaceMatch = matchList.find(m => m.round === 3);
    if (thirdPlaceMatch?.winner) {
      results.push({ rank: 3, fencer: thirdPlaceMatch.winner, eliminatedAt: '3ème place' });
      processed.add(thirdPlaceMatch.winner.id);

      // 4ème place (perdant du match pour la 3ème place)
      const fourthPlace = thirdPlaceMatch.fencerA?.id === thirdPlaceMatch.winner.id ? thirdPlaceMatch.fencerB : thirdPlaceMatch.fencerA;
      if (fourthPlace) {
        results.push({ rank: 4, fencer: fourthPlace, eliminatedAt: '3ème place' });
        processed.add(fourthPlace.id);
      }
    }

    // Parcourir les autres tours
    const rounds = [4, 8, 16, 32, 64].filter(r => r <= tableauSize && r !== 3);
    let currentRank = (thirdPlaceMatch ? 5 : 3);

    for (const round of rounds) {
      const roundMatches = matchList.filter(m => m.round === round && m.winner);
      const losers: Fencer[] = [];

      for (const match of roundMatches) {
        const loser = match.fencerA?.id === match.winner?.id ? match.fencerB : match.fencerA;
        if (loser && !processed.has(loser.id)) {
          losers.push(loser);
          processed.add(loser.id);
        }
      }

      // Tous les perdants d'un même tour ont le même rang
      for (const loser of losers) {
        results.push({ rank: currentRank, fencer: loser, eliminatedAt: getRoundName(round) });
      }
      if (losers.length > 0) {
        currentRank += losers.length;
      }
    }

    return results.sort((a, b) => a.rank - b.rank);
  };

  const renderMatch = (match: TableauMatch) => {
    const canEdit = !!(match.fencerA && match.fencerB && !match.isBye);
    const hasScore = match.scoreA !== null && match.scoreB !== null;

    return (
      <div
        key={match.id}
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          padding: '0.5rem',
          margin: '0.25rem 0',
          background: match.winner ? '#f0fdf4' : 'white',
          minWidth: '180px',
          cursor: canEdit ? 'pointer' : 'default',
        }}
        onClick={() => { if (canEdit) openScoreModal(match); }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0.25rem',
          background: match.winner === match.fencerA ? '#dcfce7' : 'transparent',
          borderRadius: '2px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: match.winner === match.fencerA ? '600' : '400' }}>
              {match.fencerA ? `${match.fencerA.lastName} ${match.fencerA.firstName.charAt(0)}.` : '-'}
            </span>
            {match.fencerA && (
              <span style={{ fontSize: '0.625rem', color: '#6b7280' }}>
                {match.fencerA.birthDate && `${match.fencerA.birthDate.getFullYear()}`}
                {match.fencerA.ranking && ` • #${match.fencerA.ranking}`}
              </span>
            )}
          </div>
          <span style={{ fontWeight: '600' }}>{match.scoreA !== null ? match.scoreA : ''}</span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0.25rem',
          background: match.winner === match.fencerB ? '#dcfce7' : 'transparent',
          borderRadius: '2px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: match.winner === match.fencerB ? '600' : '400' }}>
              {match.fencerB ? `${match.fencerB.lastName} ${match.fencerB.firstName.charAt(0)}.` : '-'}
            </span>
            {match.fencerB && (
              <span style={{ fontSize: '0.625rem', color: '#6b7280' }}>
                {match.fencerB.birthDate && `${match.fencerB.birthDate.getFullYear()}`}
                {match.fencerB.ranking && ` • #${match.fencerB.ranking}`}
              </span>
            )}
          </div>
          <span style={{ fontWeight: '600' }}>{match.scoreB !== null ? match.scoreB : ''}</span>
        </div>
        {match.isBye && (
          <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center', marginTop: '0.25rem' }}>
            Exempt
          </div>
        )}
        {canEdit && !hasScore && (
          <div
            style={{
              width: '100%',
              marginTop: '0.5rem',
              padding: '0.25rem',
              fontSize: '0.75rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              textAlign: 'center',
            }}
          >
            Saisir score
          </div>
        )}
        {canEdit && hasScore && (
          <div
            style={{
              width: '100%',
              marginTop: '0.5rem',
              padding: '0.25rem',
              fontSize: '0.75rem',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              textAlign: 'center',
            }}
          >
            Modifier score
          </div>
        )}
      </div>
    );
  };

  const renderRound = (round: number) => {
    const roundMatches = matches.filter(m => m.round === round);
    return (
      <div key={round} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', minWidth: '200px' }}>
        <div style={{ textAlign: 'center', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
          {getRoundName(round)}
        </div>
        {roundMatches.map(match => renderMatch(match))}
      </div>
    );
  };

  if (ranking.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🏆</div>
        <h2 className="empty-state-title">Tableau à élimination directe</h2>
        <p className="empty-state-description">Terminez d'abord les poules pour générer le tableau</p>
      </div>
    );
  }

  const finalMatch = matches.find(m => m.round === 2);
  const champion = finalMatch?.winner;

  const rounds: number[] = [];
  let r = tableauSize;
  while (r >= 2) {
    rounds.push(r);
    if (r === 4 && thirdPlaceMatch) {
      rounds.push(3);
    }
    r = r / 2;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
          Tableau de {tableauSize} - {ranking.length} qualifiés
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={handleAutoFillScores}
            style={{
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            🎲 Remplir auto
          </button>
          {champion && (
            <div style={{ 
              background: '#fef3c7', 
              padding: '0.5rem 1rem', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>🏆</span>
              <span style={{ fontWeight: '600' }}>
                {champion.lastName} {champion.firstName}
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        overflowX: 'auto', 
        padding: '1rem',
        background: '#f9fafb',
        borderRadius: '8px',
      }}>
        {rounds.map(round => renderRound(round))}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Classement après poules
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '0.5rem',
          maxHeight: '200px',
          overflowY: 'auto',
        }}>
          {ranking.slice(0, tableauSize).map((r, idx) => (
            <div key={r.fencer.id} style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              padding: '0.25rem 0.5rem',
              background: idx < 8 ? '#dbeafe' : 'white',
              borderRadius: '4px',
              fontSize: '0.875rem',
            }}>
              <span style={{ fontWeight: '600', minWidth: '24px' }}>{idx + 1}.</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                <span>{r.fencer.lastName} {r.fencer.firstName}</span>
                <span style={{ fontSize: '0.625rem', color: '#6b7280' }}>
                  {r.fencer.birthDate && `${r.fencer.birthDate.getFullYear()}`}
                  {r.fencer.ranking && ` • #${r.fencer.ranking}`}
                </span>
              </div>
              <span style={{ marginLeft: 'auto', color: '#6b7280' }}>
                {(r.ratio * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Score Modal */}
      {(() => {
        if (!showScoreModal || !editingMatch) return null;
        
        const match = matches.find(m => m.id === editingMatch);
        if (!match) return null;

        const scoreModal = (
          <div className="modal-overlay" onClick={() => setShowScoreModal(false)}>
            <div 
              ref={modalRef}
              className="modal resizable" 
              style={{
                maxWidth: '600px',
                width: '90%'
              }}
              onClick={(e) => e.stopPropagation()} 
            >
              <div className="modal-header" style={{ cursor: 'move' }}>
                <h3 className="modal-title">{getRoundName(match.round)} - Saisie rapide</h3>
              </div>
              <div className="modal-body" style={{ padding: '1.5rem' }}>
                {/* Ligne unique avec les deux tireurs côte à côte */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  {/* Tireur A */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-end',
                    flex: 1,
                    minWidth: '120px'
                  }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, textAlign: 'right' }}>
                      {match.fencerA?.lastName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'right' }}>
                      {match.fencerA?.firstName} {match.fencerA?.club && `(${match.fencerA.club})`}
                    </div>
                  </div>

                  {/* Input Score A */}
                  <input 
                    type="number" 
                    className="form-input" 
                    style={{ 
                      width: '80px',
                      textAlign: 'center', 
                      fontSize: '2rem', 
                      padding: '0.5rem',
                      borderColor: (parseInt(editScoreA, 10) || 0) > (isUnlimitedScore ? 999 : maxScore) ? '#ef4444' : undefined,
                      borderWidth: (parseInt(editScoreA, 10) || 0) > (isUnlimitedScore ? 999 : maxScore) ? '2px' : undefined
                    }} 
                    value={editScoreA} 
                    onChange={(e) => setEditScoreA(e.target.value)} 
                    min="0" 
                    max={isUnlimitedScore ? undefined : maxScore}
                    autoFocus 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleScoreSubmit();
                      } else if (e.key === 'Tab' && !e.shiftKey) {
                        e.preventDefault();
                        const modalBody = e.currentTarget.closest('.modal-body');
                        if (modalBody) {
                          const inputs = modalBody.querySelectorAll('input[type="number"]');
                          if (inputs.length > 1) {
                            const nextInput = inputs[1] as HTMLInputElement;
                            nextInput.focus();
                            nextInput.select();
                          }
                        }
                      }
                    }}
                  />

                  {/* Séparateur */}
                  <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9ca3af' }}>:</span>

                  {/* Input Score B */}
                  <input 
                    type="number" 
                    className="form-input" 
                    style={{ 
                      width: '80px',
                      textAlign: 'center', 
                      fontSize: '2rem', 
                      padding: '0.5rem',
                      borderColor: (parseInt(editScoreB, 10) || 0) > (isUnlimitedScore ? 999 : maxScore) ? '#ef4444' : undefined,
                      borderWidth: (parseInt(editScoreB, 10) || 0) > (isUnlimitedScore ? 999 : maxScore) ? '2px' : undefined
                    }} 
                    value={editScoreB} 
                    onChange={(e) => setEditScoreB(e.target.value)} 
                    min="0" 
                    max={isUnlimitedScore ? undefined : maxScore}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleScoreSubmit();
                      } else if (e.key === 'Tab' && e.shiftKey) {
                        e.preventDefault();
                        const modalBody = e.currentTarget.closest('.modal-body');
                        if (modalBody) {
                          const inputs = modalBody.querySelectorAll('input[type="number"]');
                          if (inputs.length > 0) {
                            const prevInput = inputs[0] as HTMLInputElement;
                            prevInput.focus();
                            prevInput.select();
                          }
                        }
                      }
                    }}
                  />

                  {/* Tireur B */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-start',
                    flex: 1,
                    minWidth: '120px'
                  }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, textAlign: 'left' }}>
                      {match.fencerB?.lastName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'left' }}>
                      {match.fencerB?.firstName} {match.fencerB?.club && `(${match.fencerB.club})`}
                    </div>
                  </div>
                </div>

                {/* Info score max */}
                {!isUnlimitedScore && maxScore > 0 && (
                  <p className="text-sm text-muted" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    💡 Score maximum : {maxScore} touches
                  </p>
                )}

                {/* Boutons spéciaux sur une ligne */}
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  justifyContent: 'center',
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '1rem',
                  marginTop: '0.5rem'
                }}>
                  <button 
                    className="btn btn-warning" 
                    onClick={() => handleSpecialStatus('abandon')}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                  >
                    🚴 Abandon
                  </button>
                  <button 
                    className="btn btn-warning" 
                    onClick={() => handleSpecialStatus('forfait')}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                  >
                    📋 Forfait
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleSpecialStatus('exclusion')}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                  >
                    🚫 Exclusion
                  </button>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowScoreModal(false)}>Annuler</button>
                <button className="btn btn-primary" onClick={handleScoreSubmit}>Valider</button>
              </div>
            </div>
          </div>
        );

        return scoreModal;
      })()}

    </div>
  );
};

export default TableauView;

