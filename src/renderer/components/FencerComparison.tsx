/**
 * BellePoule Modern - Fencer Comparison Component
 * Licensed under GPL-3.0
 */

import React, { useState, useMemo } from 'react';
import { Fencer, Match, Pool } from '../../shared/types';
import { useTranslation } from '../hooks/useTranslation';

interface FencerComparisonProps {
  fencers: Fencer[];
  pools: Pool[];
  tableauMatches: Match[];
  onClose: () => void;
}

interface ComparisonStats {
  fencer1: Fencer;
  fencer2: Fencer;
  poolMatches: Array<{
    poolId: string;
    score1: number;
    score2: number;
    winner: string;
  }>;
  tableauMatches: Array<{
    round: string;
    score1: number;
    score2: number;
    winner: string;
  }>;
  totalMatches: number;
  wins1: number;
  wins2: number;
  avgScore1: number;
  avgScore2: number;
}

export const FencerComparison: React.FC<FencerComparisonProps> = ({
  fencers,
  pools,
  tableauMatches,
  onClose
}) => {
  const { t } = useTranslation();
  const [fencer1Id, setFencer1Id] = useState<string>('');
  const [fencer2Id, setFencer2Id] = useState<string>('');

  const comparison = useMemo<ComparisonStats | null>(() => {
    if (!fencer1Id || !fencer2Id || fencer1Id === fencer2Id) return null;

    const fencer1 = fencers.find(f => f.id === fencer1Id);
    const fencer2 = fencers.find(f => f.id === fencer2Id);
    if (!fencer1 || !fencer2) return null;

    const poolMatches: ComparisonStats['poolMatches'] = [];
    const tableauMatchesList: ComparisonStats['tableauMatches'] = [];
    let wins1 = 0;
    let wins2 = 0;
    let totalScore1 = 0;
    let totalScore2 = 0;

    // Chercher les matchs de poule
    pools.forEach(pool => {
      pool.matches.forEach(match => {
        if ((match.fencer1Id === fencer1Id && match.fencer2Id === fencer2Id) ||
            (match.fencer1Id === fencer2Id && match.fencer2Id === fencer1Id)) {
          const isFencer1First = match.fencer1Id === fencer1Id;
          const score1 = isFencer1First ? (match.score1 || 0) : (match.score2 || 0);
          const score2 = isFencer1First ? (match.score2 || 0) : (match.score1 || 0);
          const winner = match.winnerId === fencer1Id ? fencer1.lastName : fencer2.lastName;
          
          if (match.winnerId === fencer1Id) wins1++;
          else if (match.winnerId === fencer2Id) wins2++;
          
          totalScore1 += score1;
          totalScore2 += score2;
          
          poolMatches.push({
            poolId: pool.id,
            score1,
            score2,
            winner
          });
        }
      });
    });

    // Chercher les matchs de tableau
    tableauMatches.forEach(match => {
      if ((match.fencer1Id === fencer1Id && match.fencer2Id === fencer2Id) ||
          (match.fencer1Id === fencer2Id && match.fencer2Id === fencer1Id)) {
        const isFencer1First = match.fencer1Id === fencer1Id;
        const score1 = isFencer1First ? (match.score1 || 0) : (match.score2 || 0);
        const score2 = isFencer1First ? (match.score2 || 0) : (match.score1 || 0);
        const winner = match.winnerId === fencer1Id ? fencer1.lastName : fencer2.lastName;
        
        if (match.winnerId === fencer1Id) wins1++;
        else if (match.winnerId === fencer2Id) wins2++;
        
        totalScore1 += score1;
        totalScore2 += score2;
        
        tableauMatchesList.push({
          round: match.round || 'Tour',
          score1,
          score2,
          winner
        });
      }
    });

    const totalMatches = poolMatches.length + tableauMatchesList.length;

    return {
      fencer1,
      fencer2,
      poolMatches,
      tableauMatches: tableauMatchesList,
      totalMatches,
      wins1,
      wins2,
      avgScore1: totalMatches > 0 ? totalScore1 / totalMatches : 0,
      avgScore2: totalMatches > 0 ? totalScore2 / totalMatches : 0
    };
  }, [fencer1Id, fencer2Id, fencers, pools, tableauMatches]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">⚔️ Comparaison Head-to-Head</h2>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal__body">
          {/* Sélection des tireurs */}
          <div className="comparison__selectors">
            <div className="form-group">
              <label className="form-label">Tireur 1</label>
              <select 
                className="form-control"
                value={fencer1Id}
                onChange={(e) => setFencer1Id(e.target.value)}
              >
                <option value="">Sélectionner un tireur</option>
                {fencers.map(fencer => (
                  <option key={fencer.id} value={fencer.id}>
                    {fencer.lastName} {fencer.firstName} ({fencer.club})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="comparison__vs">VS</div>
            
            <div className="form-group">
              <label className="form-label">Tireur 2</label>
              <select 
                className="form-control"
                value={fencer2Id}
                onChange={(e) => setFencer2Id(e.target.value)}
              >
                <option value="">Sélectionner un tireur</option>
                {fencers.map(fencer => (
                  <option key={fencer.id} value={fencer.id}>
                    {fencer.lastName} {fencer.firstName} ({fencer.club})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Résultats de la comparaison */}
          {comparison && (
            <div className="comparison__results">
              {/* Cartes des tireurs */}
              <div className="comparison__cards">
                <div className={`comparison__card ${comparison.wins1 > comparison.wins2 ? 'comparison__card--winner' : ''}`}>
                  <h3>{comparison.fencer1.lastName} {comparison.fencer1.firstName}</h3>
                  <p className="text-muted">{comparison.fencer1.club}</p>
                  <div className="comparison__stat">
                    <span className="comparison__stat-value comparison__stat-value--large">{comparison.wins1}</span>
                    <span className="comparison__stat-label">Victoires</span>
                  </div>
                  <div className="comparison__stat">
                    <span className="comparison__stat-value">{comparison.avgScore1.toFixed(1)}</span>
                    <span className="comparison__stat-label">Score moyen</span>
                  </div>
                </div>
                
                <div className="comparison__divider">
                  <div className="comparison__total-matches">
                    {comparison.totalMatches} match{comparison.totalMatches > 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className={`comparison__card ${comparison.wins2 > comparison.wins1 ? 'comparison__card--winner' : ''}`}>
                  <h3>{comparison.fencer2.lastName} {comparison.fencer2.firstName}</h3>
                  <p className="text-muted">{comparison.fencer2.club}</p>
                  <div className="comparison__stat">
                    <span className="comparison__stat-value comparison__stat-value--large">{comparison.wins2}</span>
                    <span className="comparison__stat-label">Victoires</span>
                  </div>
                  <div className="comparison__stat">
                    <span className="stat-value">{comparison.avgScore2.toFixed(1)}</span>
                    <span className="comparison__stat-label">Score moyen</span>
                  </div>
                </div>
              </div>

              {/* Historique des matchs */}
              {comparison.totalMatches > 0 && (
                <div className="comparison__history">
                  <h4>📜 Historique des confrontations</h4>
                  
                  {comparison.poolMatches.length > 0 && (
                    <div className="comparison__section">
                      <h5>Matchs de poule</h5>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Poule</th>
                            <th>Score {comparison.fencer1.lastName}</th>
                            <th>Score {comparison.fencer2.lastName}</th>
                            <th>Vainqueur</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparison.poolMatches.map((match, idx) => (
                            <tr key={idx}>
                              <td>Poule {match.poolId.slice(-4)}</td>
                              <td className={match.score1 > match.score2 ? 'text-success font-bold' : ''}>
                                {match.score1}
                              </td>
                              <td className={match.score2 > match.score1 ? 'text-success font-bold' : ''}>
                                {match.score2}
                              </td>
                              <td>{match.winner}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {comparison.tableauMatches.length > 0 && (
                    <div className="comparison__section">
                      <h5>Matchs de tableau</h5>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Tour</th>
                            <th>Score {comparison.fencer1.lastName}</th>
                            <th>Score {comparison.fencer2.lastName}</th>
                            <th>Vainqueur</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparison.tableauMatches.map((match, idx) => (
                            <tr key={idx}>
                              <td>{match.round}</td>
                              <td className={match.score1 > match.score2 ? 'text-success font-bold' : ''}>
                                {match.score1}
                              </td>
                              <td className={match.score2 > match.score1 ? 'text-success font-bold' : ''}>
                                {match.score2}
                              </td>
                              <td>{match.winner}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              
              {comparison.totalMatches === 0 && (
                <div className="alert alert--info">
                  Ces deux tireurs ne se sont jamais affrontés dans cette compétition.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
