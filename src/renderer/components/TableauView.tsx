/**
 * BellePoule Modern - Tableau View Component
 * Direct Elimination Table
 * Licensed under GPL-3.0
 */

import React, { useState, useEffect } from 'react';
import { Fencer, Match, MatchStatus, PoolRanking } from '../../shared/types';

interface TableauMatch {
  id: string;
  round: number;        // 64, 32, 16, 8, 4, 2 (finale)
  position: number;     // Position dans le round
  fencerA: Fencer | null;
  fencerB: Fencer | null;
  scoreA: number | null;
  scoreB: number | null;
  winner: Fencer | null;
  isBye: boolean;
}

interface TableauViewProps {
  ranking: PoolRanking[];
  maxScore?: number;
  onComplete?: (results: Fencer[]) => void;
}

const TableauView: React.FC<TableauViewProps> = ({ ranking, maxScore = 15, onComplete }) => {
  const [matches, setMatches] = useState<TableauMatch[]>([]);
  const [tableauSize, setTableauSize] = useState<number>(0);
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [tempScoreA, setTempScoreA] = useState<string>('');
  const [tempScoreB, setTempScoreB] = useState<string>('');

  useEffect(() => {
    if (ranking.length > 0) {
      generateTableau();
    }
  }, [ranking]);

  const getTableauSize = (fencerCount: number): number => {
    // Trouve la puissance de 2 supérieure ou égale
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

    // Générer le placement avec seeding FIE
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

    // Générer les rounds suivants (vides pour l'instant)
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

    // Propager les byes
    propagateWinners(newMatches);
    setMatches(newMatches);
  };

  const generateFIESeeding = (size: number): number[] => {
    // Placement FIE standard
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
    // Fallback: ordre séquentiel
    return Array.from({ length: size }, (_, i) => i + 1);
  };

  const propagateWinners = (matchList: TableauMatch[]) => {
    // Propager les gagnants vers les rounds suivants
    let currentRound = tableauSize || getTableauSize(ranking.length);
    
    while (currentRound > 2) {
      const nextRound = currentRound / 2;
      const currentMatches = matchList.filter(m => m.round === currentRound);
      const nextMatches = matchList.filter(m => m.round === nextRound);

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
            // Check if next match is now a bye
            if (nextMatch.fencerA && !nextMatch.fencerB) {
              nextMatch.winner = nextMatch.fencerA;
              nextMatch.isBye = true;
            } else if (!nextMatch.fencerA && nextMatch.fencerB) {
              nextMatch.winner = nextMatch.fencerB;
              nextMatch.isBye = true;
            }
          }
        }
      });
      currentRound = nextRound;
    }
  };

  const handleScoreSubmit = (matchId: string) => {
    const scoreA = parseInt(tempScoreA) || 0;
    const scoreB = parseInt(tempScoreB) || 0;

    if (scoreA === scoreB) {
      alert('Les scores ne peuvent pas être égaux en élimination directe');
      return;
    }

    setMatches(prevMatches => {
      const newMatches = prevMatches.map(m => {
        if (m.id === matchId) {
          const winner = scoreA > scoreB ? m.fencerA : m.fencerB;
          return { ...m, scoreA, scoreB, winner };
        }
        return m;
      });

      // Propager le gagnant
      const match = newMatches.find(m => m.id === matchId);
      if (match && match.winner) {
        const nextRound = match.round / 2;
        const nextPosition = Math.floor(match.position / 2);
        const nextMatch = newMatches.find(m => m.round === nextRound && m.position === nextPosition);
        
        if (nextMatch) {
          if (match.position % 2 === 0) {
            nextMatch.fencerA = match.winner;
          } else {
            nextMatch.fencerB = match.winner;
          }
        }
      }

      return newMatches;
    });

    setEditingMatch(null);
    setTempScoreA('');
    setTempScoreB('');
  };

  const getRoundName = (round: number): string => {
    if (round === 2) return 'Finale';
    if (round === 4) return 'Demi-finales';
    if (round === 8) return 'Quarts';
    if (round === 16) return '8èmes';
    if (round === 32) return '16èmes';
    if (round === 64) return '32èmes';
    return `Tableau de ${round}`;
  };

  const renderMatch = (match: TableauMatch) => {
    const isEditing = editingMatch === match.id;
    const canEdit = match.fencerA && match.fencerB && !match.winner && !match.isBye;

    return (
      <div 
        key={match.id} 
        className={`tableau-match ${match.winner ? 'completed' : ''} ${match.isBye ? 'bye' : ''}`}
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          padding: '0.5rem',
          margin: '0.25rem 0',
          background: match.winner ? '#f0fdf4' : 'white',
          minWidth: '180px',
        }}
      >
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '0.25rem',
            background: match.winner === match.fencerA ? '#dcfce7' : 'transparent',
            borderRadius: '2px',
          }}
        >
          <span style={{ fontSize: '0.875rem', fontWeight: match.winner === match.fencerA ? '600' : '400' }}>
            {match.fencerA ? `${match.fencerA.lastName} ${match.fencerA.firstName.charAt(0)}.` : '-'}
          </span>
          {isEditing ? (
            <input
              type="number"
              value={tempScoreA}
              onChange={e => setTempScoreA(e.target.value)}
              style={{ width: '40px', textAlign: 'center' }}
              min="0"
              max={maxScore}
            />
          ) : (
            <span style={{ fontWeight: '600' }}>{match.scoreA !== null ? match.scoreA : ''}</span>
          )}
        </div>
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '0.25rem',
            background: match.winner === match.fencerB ? '#dcfce7' : 'transparent',
            borderRadius: '2px',
          }}
        >
          <span style={{ fontSize: '0.875rem', fontWeight: match.winner === match.fencerB ? '600' : '400' }}>
            {match.fencerB ? `${match.fencerB.lastName} ${match.fencerB.firstName.charAt(0)}.` : '-'}
          </span>
          {isEditing ? (
            <input
              type="number"
              value={tempScoreB}
              onChange={e => setTempScoreB(e.target.value)}
              style={{ width: '40px', textAlign: 'center' }}
              min="0"
              max={maxScore}
            />
          ) : (
            <span style={{ fontWeight: '600' }}>{match.scoreB !== null ? match.scoreB : ''}</span>
          )}
        </div>
        {match.isBye && (
          <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center', marginTop: '0.25rem' }}>
            Exempt
          </div>
        )}
        {canEdit && !isEditing && (
          <button
            onClick={() => {
              setEditingMatch(match.id);
              setTempScoreA('');
              setTempScoreB('');
            }}
            style={{
              width: '100%',
              marginTop: '0.5rem',
              padding: '0.25rem',
              fontSize: '0.75rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Saisir score
          </button>
        )}
        {isEditing && (
          <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => handleScoreSubmit(match.id)}
              style={{
                flex: 1,
                padding: '0.25rem',
                fontSize: '0.75rem',
                background: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              ✓
            </button>
            <button
              onClick={() => setEditingMatch(null)}
              style={{
                flex: 1,
                padding: '0.25rem',
                fontSize: '0.75rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
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

  // Trouver le gagnant final
  const finalMatch = matches.find(m => m.round === 2);
  const champion = finalMatch?.winner;

  if (ranking.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🏆</div>
        <h2 className="empty-state-title">Tableau à élimination directe</h2>
        <p className="empty-state-description">Terminez d'abord les poules pour générer le tableau</p>
      </div>
    );
  }

  // Déterminer les rounds à afficher
  const rounds: number[] = [];
  let r = tableauSize;
  while (r >= 2) {
    rounds.push(r);
    r = r / 2;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
          Tableau de {tableauSize} - {ranking.length} qualifiés
        </h2>
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

      {/* Classement après poules */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Classement après poules (entrée dans le tableau)
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
              <span>{r.fencer.lastName} {r.fencer.firstName}</span>
              <span style={{ marginLeft: 'auto', color: '#6b7280' }}>
                {(r.ratio * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableauView;
