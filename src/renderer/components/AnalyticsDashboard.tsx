/**
 * BellePoule Modern - Analytics Dashboard Component
 * Real-time performance analytics for coaches
 * Licensed under GPL-3.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Competition, Fencer, Pool, Match, MatchStatus } from '../../shared/types';
import { TableauMatch } from './TableauView';

interface AnalyticsData {
  totalFencers: number;
  completedMatches: number;
  totalMatches: number;
  averageMatchDuration: number;
  fencerPerformance: FencerPerformance[];
  weaponStats: WeaponStats;
  poolProgress: PoolProgress[];
}

interface FencerPerformance {
  fencer: Fencer;
  victoryRate: number;
  averageScore: number;
  touchesScoredPerMatch: number;
  touchesReceivedPerMatch: number;
  currentStreak: number;
  bestStreak: number;
  recentForm: 'excellent' | 'good' | 'average' | 'poor';
}

interface WeaponStats {
  totalMatches: number;
  averageVictoryMargin: number;
  longestMatch: number;
  shortestMatch: number;
  mostTouchingMatch: number;
}

interface PoolProgress {
  poolId: string;
  poolNumber: number;
  completionPercentage: number;
  averageTimeRemaining: number;
  projectedFinishTime: Date;
}

interface AnalyticsDashboardProps {
  competition: Competition;
  pools: Pool[];
  matches: (Match | TableauMatch)[];
  fencers: Fencer[];
  className?: string;
  onClose: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  competition,
  pools,
  matches,
  fencers,
  className = '',
  onClose
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'live' | 'last30min' | 'all'>('live');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const analyticsData = useMemo(() => {
    return calculateAnalytics(competition, pools, matches, fencers, selectedTimeframe);
  }, [competition, pools, matches, fencers, selectedTimeframe]);

  // Auto-refresh for live data
  useEffect(() => {
    if (!autoRefresh || selectedTimeframe !== 'live') return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, selectedTimeframe]);

  const filterMatchesByTimeframe = (matchList: (Match | TableauMatch)[], timeframe: string): (Match | TableauMatch)[] => {
    if (timeframe === 'all') return matchList;
    
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - (timeframe === 'last30min' ? 30 : 5) * 60 * 1000);
    
    return matchList.filter(match => {
      if ('updatedAt' in match && match.updatedAt) {
        return new Date(match.updatedAt) >= cutoffTime;
      }
      // TableauMatch doesn't have updatedAt, include all
      return !('updatedAt' in match);
    });
  };

  const calculateAnalytics = (
    comp: Competition,
    poolList: Pool[],
    matchList: (Match | TableauMatch)[],
    fencerList: Fencer[],
    timeframe: string
  ): AnalyticsData => {
    const filteredMatches = filterMatchesByTimeframe(matchList, timeframe);
    const completedMatches = filteredMatches.filter(match => {
      if ('status' in match) {
        return match.status === MatchStatus.FINISHED;
      } else {
        return match.winner !== null;
      }
    });
    
    return {
      totalFencers: fencerList.length,
      completedMatches: completedMatches.length,
      totalMatches: filteredMatches.length,
      averageMatchDuration: calculateAverageMatchDuration(completedMatches),
      fencerPerformance: calculateFencerPerformance(fencerList, completedMatches),
      weaponStats: calculateWeaponStats(completedMatches),
      poolProgress: calculatePoolProgress(poolList, filteredMatches)
    };
  };

  const calculateAverageMatchDuration = (matches: (Match | TableauMatch)[]): number => {
    if (matches.length === 0) return 0;
    
    const durations = matches.map(match => {
      if ('createdAt' in match && 'updatedAt' in match && match.createdAt && match.updatedAt) {
        return new Date(match.updatedAt).getTime() - new Date(match.createdAt).getTime();
      }
      return 0;
    }).filter(d => d > 0);
    
    return durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  };

  const calculateFencerPerformance = (fencerList: Fencer[], matches: (Match | TableauMatch)[]): FencerPerformance[] => {
    return fencerList.map(fencer => {
      const fencerMatches = matches.filter(m => {
        const isMatch = 'status' in m;
        if (isMatch) {
          return (m.fencerA?.id === fencer.id || m.fencerB?.id === fencer.id) && 
                 m.status === MatchStatus.FINISHED;
        } else {
          // TableauMatch
          return (m.fencerA?.id === fencer.id || m.fencerB?.id === fencer.id) && 
                 m.winner !== null;
        }
      });

      const victories = fencerMatches.filter(m => {
        const isA = m.fencerA?.id === fencer.id;
        if ('status' in m) {
          // Match type
          const score = isA ? m.scoreA : m.scoreB;
          return score?.isVictory;
        } else {
          // TableauMatch type
          return m.winner?.id === fencer.id;
        }
      }).length;

      const totalScored = fencerMatches.reduce((total, match) => {
        const isA = match.fencerA?.id === fencer.id;
        if ('status' in match) {
          const score = isA ? match.scoreA : match.scoreB;
          return total + (score?.value || 0);
        } else {
          return total + (isA ? (match.scoreA || 0) : (match.scoreB || 0));
        }
      }, 0);

      const totalReceived = fencerMatches.reduce((total, match) => {
        const isA = match.fencerA?.id === fencer.id;
        if ('status' in match) {
          const score = isA ? match.scoreB : match.scoreA;
          return total + (score?.value || 0);
        } else {
          return total + (isA ? (match.scoreB || 0) : (match.scoreA || 0));
        }
      }, 0);

      const currentStreak = calculateCurrentStreak(fencer, matches);
      const bestStreak = calculateBestStreak(fencer, matches);
      const recentForm = calculateRecentForm(fencer, matches);

      return {
        fencer,
        victoryRate: fencerMatches.length > 0 ? victories / fencerMatches.length : 0,
        averageScore: fencerMatches.length > 0 ? totalScored / fencerMatches.length : 0,
        touchesScoredPerMatch: fencerMatches.length > 0 ? totalScored / fencerMatches.length : 0,
        touchesReceivedPerMatch: fencerMatches.length > 0 ? totalReceived / fencerMatches.length : 0,
        currentStreak,
        bestStreak,
        recentForm
      };
    }).sort((a, b) => b.victoryRate - a.victoryRate);
  };

  const calculateCurrentStreak = (fencer: Fencer, matches: (Match | TableauMatch)[]): number => {
    const fencerMatches = matches
      .filter(m => (m.fencerA?.id === fencer.id || m.fencerB?.id === fencer.id))
      .sort((a, b) => {
        const dateA = 'updatedAt' in a ? new Date(a.updatedAt || 0).getTime() : 0;
        const dateB = 'updatedAt' in b ? new Date(b.updatedAt || 0).getTime() : 0;
        return dateB - dateA;
      });

    let streak = 0;
    for (const match of fencerMatches) {
      const isA = match.fencerA?.id === fencer.id;
      let isVictory = false;
      
      if ('status' in match) {
        const score = isA ? match.scoreA : match.scoreB;
        isVictory = score?.isVictory || false;
      } else {
        isVictory = match.winner?.id === fencer.id;
      }
      
      if (isVictory) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const calculateBestStreak = (fencer: Fencer, matches: (Match | TableauMatch)[]): number => {
    // Implementation for calculating historical best streak
    // This would require more complex analysis of match history
    return 0; // Placeholder
  };

  const calculateRecentForm = (fencer: Fencer, matches: (Match | TableauMatch)[]): 'excellent' | 'good' | 'average' | 'poor' => {
    const recentMatches = matches
      .filter(m => (m.fencerA?.id === fencer.id || m.fencerB?.id === fencer.id))
      .slice(-5); // Last 5 matches

    if (recentMatches.length === 0) return 'average';

    const victories = recentMatches.filter(m => {
      const isA = m.fencerA?.id === fencer.id;
      if ('status' in m) {
        const score = isA ? m.scoreA : m.scoreB;
        return score?.isVictory;
      } else {
        return m.winner?.id === fencer.id;
      }
    }).length;

    const winRate = victories / recentMatches.length;

    if (winRate >= 0.8) return 'excellent';
    if (winRate >= 0.6) return 'good';
    if (winRate >= 0.4) return 'average';
    return 'poor';
  };

  const calculateWeaponStats = (matches: (Match | TableauMatch)[]): WeaponStats => {
    const margins = matches.map(m => {
      if ('status' in m) {
        if (m.status !== MatchStatus.FINISHED) return 0;
        const margin = Math.abs((m.scoreA?.value || 0) - (m.scoreB?.value || 0));
        return margin;
      } else {
        if (!m.winner) return 0;
        const margin = Math.abs((m.scoreA || 0) - (m.scoreB || 0));
        return margin;
      }
    }).filter(m => m > 0);

    return {
      totalMatches: matches.length,
      averageVictoryMargin: margins.length > 0 ? margins.reduce((a, b) => a + b, 0) / margins.length : 0,
      longestMatch: 0, // Would need duration data
      shortestMatch: 0, // Would need duration data
      mostTouchingMatch: Math.max(...matches.map(m => {
        if ('status' in m) {
          return (m.scoreA?.value || 0) + (m.scoreB?.value || 0);
        } else {
          return (m.scoreA || 0) + (m.scoreB || 0);
        }
      }))
    };
  };

  const calculatePoolProgress = (pools: Pool[], matches: (Match | TableauMatch)[]): PoolProgress[] => {
    return pools.map(pool => {
      // Only use actual Match objects for pool progress, filter out TableauMatch
      const poolMatches = matches.filter((m): m is Match => 
        'status' in m && pools.some(p => p.matches.some(pm => pm.id === m.id))
      );
      
      const completed = poolMatches.filter(m => m.status === MatchStatus.FINISHED).length;
      const completionPercentage = poolMatches.length > 0 ? (completed / poolMatches.length) * 100 : 0;
      
      return {
        poolId: pool.id,
        poolNumber: pool.number || 0,
        completionPercentage,
        averageTimeRemaining: 0, // Complex calculation based on remaining matches
        projectedFinishTime: new Date()
      };
    });
  };

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--xl" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">📊 Analytics Dashboard</h2>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal__body">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ color: 'var(--color-text-light)' }}>{competition.title}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <label htmlFor="autoRefresh" style={{ fontSize: '0.875rem' }}>Auto-refresh</label>
              </div>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as 'live' | 'last30min' | 'all')}
                className="form-control"
                style={{ width: 'auto' }}
              >
                <option value="live">Live</option>
                <option value="last30min">Last 30 min</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="analytics__grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="analytics__card">
              <div className="analytics__card-value">{analyticsData.totalFencers}</div>
              <div className="analytics__card-label">Tireurs</div>
            </div>
            <div className="analytics__card">
              <div className="analytics__card-value">
                {analyticsData.completedMatches}/{analyticsData.totalMatches}
              </div>
              <div className="analytics__card-label">Matchs terminés</div>
            </div>
            <div className="analytics__card">
              <div className="analytics__card-value">
                {formatTime(analyticsData.averageMatchDuration)}
              </div>
              <div className="analytics__card-label">Durée moyenne</div>
            </div>
            <div className="analytics__card">
              <div className="analytics__card-value">
                {lastUpdate.toLocaleTimeString()}
              </div>
              <div className="analytics__card-label">Dernière mise à jour</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Top Performers */}
            <div className="analytics__section">
              <h3>🏆 Top Performers</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {analyticsData.fencerPerformance.slice(0, 5).map((perf, index) => (
                  <div key={perf.fencer.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '0.5rem',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        background: 'var(--color-primary)',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{`${perf.fencer.lastName} ${perf.fencer.firstName?.charAt(0)}.`}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                          Win rate: {(perf.victoryRate * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 500 }}>{perf.averageScore.toFixed(1)}</div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.125rem 0.5rem',
                        borderRadius: '9999px',
                        ...getFormStyle(perf.recentForm)
                      }}>
                        {perf.recentForm}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pool Progress */}
            <div className="analytics__section">
              <h3>📈 Progression des poules</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {analyticsData.poolProgress.map((pool) => (
                  <div key={pool.poolId} style={{ padding: '0.75rem', background: 'var(--color-surface)', borderRadius: 'var(--radius)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 500 }}>Poule {pool.poolNumber}</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
                        {pool.completionPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '8px', 
                      background: 'var(--color-bg)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          background: 'var(--color-primary)',
                          borderRadius: '4px',
                          transition: 'width 0.3s',
                          width: `${pool.completionPercentage}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weapon Statistics */}
          <div className="analytics__section">
            <h3>⚔️ Statistiques par arme</h3>
            <div className="analytics__grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div className="analytics__card">
                <div className="analytics__card-value">{analyticsData.weaponStats.totalMatches}</div>
                <div className="analytics__card-label">Matchs totaux</div>
              </div>
              <div className="analytics__card">
                <div className="analytics__card-value">{analyticsData.weaponStats.averageVictoryMargin.toFixed(1)}</div>
                <div className="analytics__card-label">Marge victoire moy.</div>
              </div>
              <div className="analytics__card">
                <div className="analytics__card-value">{analyticsData.weaponStats.mostTouchingMatch}</div>
                <div className="analytics__card-label">Match le plus disputé</div>
              </div>
              <div className="analytics__card">
                <div className="analytics__card-value">{competition.weapon}</div>
                <div className="analytics__card-label">Arme</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getFormStyle = (form: string): React.CSSProperties => {
  switch (form) {
    case 'excellent': return { background: 'rgba(16, 185, 129, 0.2)', color: '#10B981' };
    case 'good': return { background: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' };
    case 'average': return { background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B' };
    case 'poor': return { background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444' };
    default: return { background: 'var(--color-border)', color: 'var(--color-text-light)' };
  }
};