/**
 * BellePoule Modern - Competition View Component
 * Licensed under GPL-3.0
 */

import React, { useState, useEffect } from 'react';
import { Competition, Fencer, FencerStatus, Pool, Match, MatchStatus } from '../../shared/types';
import FencerList from './FencerList';
import PoolView from './PoolView';
import AddFencerModal from './AddFencerModal';
import CompetitionPropertiesModal from './CompetitionPropertiesModal';
import { 
  distributeFencersToPoolsSerpentine, 
  calculateOptimalPoolCount,
  generatePoolMatchOrder,
  calculatePoolRanking 
} from '../../shared/utils/poolCalculations';

interface CompetitionViewProps {
  competition: Competition;
  onUpdate: (competition: Competition) => void;
}

type Phase = 'checkin' | 'pools' | 'tableau' | 'results';

const CompetitionView: React.FC<CompetitionViewProps> = ({ competition, onUpdate }) => {
  const [currentPhase, setCurrentPhase] = useState<Phase>('checkin');
  const [fencers, setFencers] = useState<Fencer[]>(competition.fencers || []);
  const [pools, setPools] = useState<Pool[]>([]);
  const [showAddFencerModal, setShowAddFencerModal] = useState(false);
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);

  useEffect(() => {
    loadFencers();
    
    // Listen for menu events
    if (window.electronAPI?.onMenuCompetitionProperties) {
      window.electronAPI.onMenuCompetitionProperties(() => {
        setShowPropertiesModal(true);
      });
    }
    
    return () => {
      if (window.electronAPI?.removeAllListeners) {
        window.electronAPI.removeAllListeners('menu:competition-properties');
      }
    };
  }, [competition.id]);

  const loadFencers = async () => {
    try {
      if (window.electronAPI) {
        const loadedFencers = await window.electronAPI.db.getFencersByCompetition(competition.id);
        setFencers(loadedFencers);
      }
    } catch (error) {
      console.error('Failed to load fencers:', error);
    }
  };

  const handleUpdateCompetition = async (updates: Partial<Competition>) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.db.updateCompetition(competition.id, updates);
        onUpdate({ ...competition, ...updates });
      }
    } catch (error) {
      console.error('Failed to update competition:', error);
    }
  };

  const handleAddFencer = async (fencerData: Partial<Fencer>) => {
    try {
      if (window.electronAPI) {
        const newFencer = await window.electronAPI.db.addFencer(competition.id, fencerData);
        setFencers([...fencers, newFencer]);
        onUpdate({ ...competition, fencers: [...fencers, newFencer] });
      }
    } catch (error) {
      console.error('Failed to add fencer:', error);
    }
    setShowAddFencerModal(false);
  };

  const handleUpdateFencer = async (id: string, updates: Partial<Fencer>) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.db.updateFencer(id, updates);
        const updatedFencers = fencers.map(f => f.id === id ? { ...f, ...updates } : f);
        setFencers(updatedFencers);
        onUpdate({ ...competition, fencers: updatedFencers });
      }
    } catch (error) {
      console.error('Failed to update fencer:', error);
    }
  };

  const handleCheckInFencer = (id: string) => {
    const fencer = fencers.find(f => f.id === id);
    if (fencer) {
      const newStatus = fencer.status === FencerStatus.CHECKED_IN 
        ? FencerStatus.NOT_CHECKED_IN 
        : FencerStatus.CHECKED_IN;
      handleUpdateFencer(id, { status: newStatus });
    }
  };

  const getCheckedInFencers = () => fencers.filter(f => f.status === FencerStatus.CHECKED_IN);

  const handleGeneratePools = () => {
    const checkedIn = getCheckedInFencers();
    if (checkedIn.length < 4) {
      alert('Il faut au moins 4 tireurs pointés pour créer les poules.');
      return;
    }

    const poolCount = calculateOptimalPoolCount(checkedIn.length, 5, 7);
    const distribution = distributeFencersToPoolsSerpentine(checkedIn, poolCount,
      { byClub: true, byLeague: true, byNation: false });

    const generatedPools: Pool[] = distribution.map((poolFencers, index) => {
      const matchOrder = generatePoolMatchOrder(poolFencers.length);
      const matches: Match[] = matchOrder.map(([a, b], matchIndex) => ({
        id: `match-${index}-${matchIndex}`,
        number: matchIndex + 1,
        fencerA: poolFencers[a - 1],
        fencerB: poolFencers[b - 1],
        scoreA: null,
        scoreB: null,
        maxScore: 5,
        status: MatchStatus.NOT_STARTED,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      return {
        id: `pool-${index}`,
        number: index + 1,
        phaseId: 'phase-pools',
        fencers: poolFencers,
        matches,
        referees: [],
        isComplete: false,
        hasError: false,
        ranking: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    setPools(generatedPools);
    setCurrentPhase('pools');
  };

  const handleScoreUpdate = (poolIndex: number, matchIndex: number, scoreA: number, scoreB: number) => {
    const updatedPools = [...pools];
    const pool = updatedPools[poolIndex];
    const match = pool.matches[matchIndex];

    const isVictoryA = scoreA > scoreB;
    match.scoreA = { value: scoreA, isVictory: isVictoryA, isAbstention: false, isExclusion: false, isForfait: false };
    match.scoreB = { value: scoreB, isVictory: !isVictoryA, isAbstention: false, isExclusion: false, isForfait: false };
    match.status = MatchStatus.FINISHED;

    pool.isComplete = pool.matches.every(m => m.status === MatchStatus.FINISHED);
    if (pool.isComplete) {
      pool.ranking = calculatePoolRanking(pool);
    }

    setPools(updatedPools);
  };

  const phases = [
    { id: 'checkin', label: 'Appel', icon: '📋' },
    { id: 'pools', label: 'Poules', icon: '🎯' },
    { id: 'tableau', label: 'Tableau', icon: '🏆' },
    { id: 'results', label: 'Résultats', icon: '📊' },
  ];

  return (
    <div style={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '1rem', background: competition.color, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>{competition.title}</h1>
          <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>
            {new Date(competition.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {competition.location && ` • ${competition.location}`}
          </p>
        </div>
        <div className="flex gap-2">
          <span className="badge" style={{ background: 'rgba(255,255,255,0.2)' }}>{fencers.length} tireurs</span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.2)' }}>{getCheckedInFencers().length} pointés</span>
        </div>
      </div>

      <div className="phase-nav">
        {phases.map((phase, index) => (
          <React.Fragment key={phase.id}>
            <div className={`phase-step ${currentPhase === phase.id ? 'phase-step-active' : ''}`} onClick={() => setCurrentPhase(phase.id as Phase)}>
              <span className="phase-step-number">{phase.icon}</span>
              <span>{phase.label}</span>
            </div>
            {index < phases.length - 1 && <div style={{ display: 'flex', alignItems: 'center', color: '#9CA3AF' }}>→</div>}
          </React.Fragment>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          {currentPhase === 'checkin' && (
            <button className="btn btn-primary" onClick={handleGeneratePools} disabled={getCheckedInFencers().length < 4}>
              Générer les poules →
            </button>
          )}
          {currentPhase === 'pools' && pools.length > 0 && pools.every(p => p.isComplete) && (
            <button className="btn btn-primary" onClick={() => setCurrentPhase('tableau')}>
              Passer au tableau →
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {currentPhase === 'checkin' && (
          <FencerList fencers={fencers} onCheckIn={handleCheckInFencer} onAddFencer={() => setShowAddFencerModal(true)} />
        )}

        {currentPhase === 'pools' && (
          <div className="content">
            {pools.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🎯</div>
                <h2 className="empty-state-title">Pas de poules</h2>
                <p className="empty-state-description">Retournez à l'appel pour générer les poules</p>
                <button className="btn btn-primary" onClick={() => setCurrentPhase('checkin')}>Retour à l'appel</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
                {pools.map((pool, poolIndex) => (
                  <PoolView key={pool.id} pool={pool} onScoreUpdate={(matchIndex, scoreA, scoreB) => handleScoreUpdate(poolIndex, matchIndex, scoreA, scoreB)} />
                ))}
              </div>
            )}
          </div>
        )}

        {currentPhase === 'tableau' && (
          <div className="content">
            <div className="empty-state">
              <div className="empty-state-icon">🏆</div>
              <h2 className="empty-state-title">Tableau à élimination directe</h2>
              <p className="empty-state-description">Le tableau sera généré automatiquement à partir du classement des poules</p>
            </div>
          </div>
        )}

        {currentPhase === 'results' && (
          <div className="content">
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <h2 className="empty-state-title">Résultats finaux</h2>
              <p className="empty-state-description">Les résultats seront affichés une fois la compétition terminée</p>
            </div>
          </div>
        )}
      </div>

      {showAddFencerModal && <AddFencerModal onClose={() => setShowAddFencerModal(false)} onAdd={handleAddFencer} />}
      
      {showPropertiesModal && (
        <CompetitionPropertiesModal
          competition={competition}
          onSave={handleUpdateCompetition}
          onClose={() => setShowPropertiesModal(false)}
        />
      )}
    </div>
  );
};

export default CompetitionView;
