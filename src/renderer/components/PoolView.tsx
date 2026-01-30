/**
 * BellePoule Modern - Pool View Component
 * Licensed under GPL-3.0
 */

import React, { useState } from 'react';
import { Pool, Fencer, MatchStatus, Score, Weapon } from '../../shared/types';
import { formatRatio, formatIndex } from '../../shared/utils/poolCalculations';

interface PoolViewProps {
  pool: Pool;
  maxScore?: number;
  weapon?: Weapon;
  onScoreUpdate: (matchIndex: number, scoreA: number, scoreB: number, winnerOverride?: 'A' | 'B') => void;
}

const PoolView: React.FC<PoolViewProps> = ({ pool, maxScore = 5, weapon, onScoreUpdate }) => {
  const [editingMatch, setEditingMatch] = useState<number | null>(null);
  const [editScoreA, setEditScoreA] = useState('');
  const [editScoreB, setEditScoreB] = useState('');
  const [victoryA, setVictoryA] = useState(false);
  const [victoryB, setVictoryB] = useState(false);

  const isLaserSabre = weapon === Weapon.LASER;
  const fencers = pool.fencers;

  const getScore = (fencerA: Fencer, fencerB: Fencer): Score | null => {
    const match = pool.matches.find(
      m => (m.fencerA?.id === fencerA.id && m.fencerB?.id === fencerB.id) ||
           (m.fencerA?.id === fencerB.id && m.fencerB?.id === fencerA.id)
    );
    if (!match || match.status !== MatchStatus.FINISHED) return null;
    return match.fencerA?.id === fencerA.id ? match.scoreA : match.scoreB;
  };

  const getMatchIndex = (fencerA: Fencer, fencerB: Fencer): number => {
    return pool.matches.findIndex(
      m => (m.fencerA?.id === fencerA.id && m.fencerB?.id === fencerB.id) ||
           (m.fencerA?.id === fencerB.id && m.fencerB?.id === fencerA.id)
    );
  };

  const handleCellClick = (rowFencer: Fencer, colFencer: Fencer) => {
    if (rowFencer.id === colFencer.id) return;
    const matchIndex = getMatchIndex(rowFencer, colFencer);
    if (matchIndex === -1) return;
    
    const match = pool.matches[matchIndex];
    const isRowA = match.fencerA?.id === rowFencer.id;
    
    setEditingMatch(matchIndex);
    setEditScoreA(isRowA ? (match.scoreA?.value?.toString() || '') : (match.scoreB?.value?.toString() || ''));
    setEditScoreB(isRowA ? (match.scoreB?.value?.toString() || '') : (match.scoreA?.value?.toString() || ''));
    setVictoryA(false);
    setVictoryB(false);
  };

  const handleScoreSubmit = () => {
    if (editingMatch === null) return;
    
    const scoreA = parseInt(editScoreA, 10) || 0;
    const scoreB = parseInt(editScoreB, 10) || 0;
    
    if (scoreA === scoreB) {
      if (isLaserSabre && (victoryA || victoryB)) {
        onScoreUpdate(editingMatch, scoreA, scoreB, victoryA ? 'A' : 'B');
      } else if (isLaserSabre) {
        alert('Match nul : cliquez sur V pour attribuer la victoire');
        return;
      } else {
        alert('Match nul impossible en escrime !');
        return;
      }
    } else {
      onScoreUpdate(editingMatch, scoreA, scoreB);
    }
    
    setEditingMatch(null);
    setEditScoreA('');
    setEditScoreB('');
    setVictoryA(false);
    setVictoryB(false);
  };

  const calculateFencerStats = (fencer: Fencer) => {
    let v = 0, d = 0, td = 0, tr = 0;
    for (const match of pool.matches) {
      if (match.status !== MatchStatus.FINISHED) continue;
      if (match.fencerA?.id === fencer.id) {
        if (match.scoreA?.isVictory) v++; else d++;
        td += match.scoreA?.value || 0;
        tr += match.scoreB?.value || 0;
      } else if (match.fencerB?.id === fencer.id) {
        if (match.scoreB?.isVictory) v++; else d++;
        td += match.scoreB?.value || 0;
        tr += match.scoreA?.value || 0;
      }
    }
    return { v, d, td, tr, index: td - tr, ratio: (v + d) > 0 ? v / (v + d) : 0 };
  };

  return (
    <div className="card">
      <div className="card-header">
        <span>Poule {pool.number}</span>
        <span className={`badge ${pool.isComplete ? 'badge-success' : 'badge-warning'}`}>
          {pool.isComplete ? 'Terminée' : `${pool.matches.filter(m => m.status === MatchStatus.FINISHED).length}/${pool.matches.length}`}
        </span>
      </div>
      <div className="card-body" style={{ overflowX: 'auto' }}>
        <div className="pool-grid">
          <div className="pool-row">
            <div className="pool-cell pool-cell-header pool-cell-name"></div>
            {fencers.map((_, i) => <div key={i} className="pool-cell pool-cell-header">{i + 1}</div>)}
            <div className="pool-cell pool-cell-header">V</div>
            <div className="pool-cell pool-cell-header">V/M</div>
            <div className="pool-cell pool-cell-header">TD</div>
            <div className="pool-cell pool-cell-header">TR</div>
            <div className="pool-cell pool-cell-header">Ind</div>
            <div className="pool-cell pool-cell-header">Rg</div>
          </div>
          
          {fencers.map((rowFencer, rowIndex) => {
            const stats = calculateFencerStats(rowFencer);
            const rankEntry = pool.ranking.find(r => r.fencer.id === rowFencer.id);
            
            return (
              <div key={rowFencer.id} className="pool-row">
                <div className="pool-cell pool-cell-header pool-cell-name" title={`${rowFencer.firstName} ${rowFencer.lastName}`}>
                  <span style={{ fontWeight: 500 }}>{rowIndex + 1}.</span>
                  <span className="truncate" style={{ marginLeft: '0.5rem' }}>{rowFencer.lastName}</span>
                </div>
                
                {fencers.map((colFencer, colIndex) => {
                  if (rowIndex === colIndex) {
                    return <div key={colIndex} className="pool-cell pool-cell-diagonal"></div>;
                  }
                  const score = getScore(rowFencer, colFencer);
                  const cellClass = score ? (score.isVictory ? 'pool-cell-victory' : 'pool-cell-defeat') : 'pool-cell-editable';
                  
                  return (
                    <div key={colIndex} className={`pool-cell ${cellClass}`} onClick={() => handleCellClick(rowFencer, colFencer)} style={{ cursor: 'pointer' }}>
                      {score ? <span>{score.isVictory ? 'V' : ''}{score.value}</span> : <span style={{ color: '#9CA3AF' }}>-</span>}
                    </div>
                  );
                })}
                
                <div className="pool-cell" style={{ fontWeight: 600 }}>{stats.v}</div>
                <div className="pool-cell text-sm">{formatRatio(stats.ratio)}</div>
                <div className="pool-cell">{stats.td}</div>
                <div className="pool-cell">{stats.tr}</div>
                <div className="pool-cell" style={{ color: stats.index >= 0 ? '#059669' : '#DC2626' }}>{formatIndex(stats.index)}</div>
                <div className="pool-cell" style={{ fontWeight: 600 }}>{rankEntry?.rank || '-'}</div>
              </div>
            );
          })}
        </div>
        
        {editingMatch !== null && (
          <div className="modal-overlay" onClick={() => setEditingMatch(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '350px' }}>
              <div className="modal-header"><h3 className="modal-title">Entrer le score</h3></div>
              <div className="modal-body">
                <p className="text-sm text-muted mb-4">{pool.matches[editingMatch].fencerA?.lastName} vs {pool.matches[editingMatch].fencerB?.lastName}</p>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="text-sm mb-2">{pool.matches[editingMatch].fencerA?.lastName}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {isLaserSabre && (
                        <button type="button" onClick={() => { setVictoryA(!victoryA); setVictoryB(false); }}
                          style={{ padding: '0.5rem', background: victoryA ? '#22c55e' : '#e5e7eb', color: victoryA ? 'white' : '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>V</button>
                      )}
                      <input type="number" className="form-input" style={{ width: '70px', textAlign: 'center', fontSize: '1.5rem' }} value={editScoreA} onChange={(e) => setEditScoreA(e.target.value)} min="0" max={maxScore} autoFocus />
                    </div>
                  </div>
                  <span style={{ fontSize: '1.5rem' }}>-</span>
                  <div style={{ textAlign: 'center' }}>
                    <div className="text-sm mb-2">{pool.matches[editingMatch].fencerB?.lastName}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <input type="number" className="form-input" style={{ width: '70px', textAlign: 'center', fontSize: '1.5rem' }} value={editScoreB} onChange={(e) => setEditScoreB(e.target.value)} min="0" max={maxScore} />
                      {isLaserSabre && (
                        <button type="button" onClick={() => { setVictoryB(!victoryB); setVictoryA(false); }}
                          style={{ padding: '0.5rem', background: victoryB ? '#22c55e' : '#e5e7eb', color: victoryB ? 'white' : '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>V</button>
                      )}
                    </div>
                  </div>
                </div>
                {isLaserSabre && <p className="text-sm text-muted mt-3" style={{ textAlign: 'center' }}>💡 Égalité? Cliquez V pour attribuer la victoire</p>}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditingMatch(null)}>Annuler</button>
                <button className="btn btn-primary" onClick={handleScoreSubmit}>Valider</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoolView;
