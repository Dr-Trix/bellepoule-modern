/**
 * BellePoule Modern - Competition View Component
 * Licensed under GPL-3.0
 */

import React, { useState, useEffect } from 'react';
import { Competition, Fencer, FencerStatus, Pool, Match, MatchStatus, PoolRanking, Weapon } from '../../shared/types';
import FencerList from './FencerList';
import PoolView from './PoolView';
import TableauView, { TableauMatch, FinalResult } from './TableauView';
import ResultsView from './ResultsView';
import AddFencerModal from './AddFencerModal';
import CompetitionPropertiesModal from './CompetitionPropertiesModal';
import ImportModal from './ImportModal';
import ChangePoolModal from './ChangePoolModal';
import { useToast } from './Toast';
import { 
  distributeFencersToPoolsSerpentine, 
  calculateOptimalPoolCount,
  generatePoolMatchOrder,
  calculatePoolRanking,
  calculatePoolRankingQuest,
  calculateOverallRanking,
  calculateOverallRankingQuest
} from '../../shared/utils/poolCalculations';

interface CompetitionViewProps {
  competition: Competition;
  onUpdate: (competition: Competition) => void;
}

type Phase = 'checkin' | 'pools' | 'tableau' | 'results';

const CompetitionView: React.FC<CompetitionViewProps> = ({ competition, onUpdate }) => {
  const { showToast } = useToast();
  const [currentPhase, setCurrentPhase] = useState<Phase>('checkin');
  const [currentPoolRound, setCurrentPoolRound] = useState(1);
  const [fencers, setFencers] = useState<Fencer[]>(competition.fencers || []);
  const [pools, setPools] = useState<Pool[]>([]);
  const [poolHistory, setPoolHistory] = useState<Pool[][]>([]); // Historique des tours de poules
  const [overallRanking, setOverallRanking] = useState<PoolRanking[]>([]);
  const [tableauMatches, setTableauMatches] = useState<TableauMatch[]>([]);
  const [finalResults, setFinalResults] = useState<FinalResult[]>([]);
  const [showAddFencerModal, setShowAddFencerModal] = useState(false);
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);
  const [importData, setImportData] = useState<{ format: string; filepath: string; content: string } | null>(null);
  const [changePoolData, setChangePoolData] = useState<{ fencer: Fencer; poolIndex: number } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Récupérer les settings avec valeurs par défaut
  const poolRounds = competition.settings?.poolRounds ?? 1;
  const hasDirectElimination = competition.settings?.hasDirectElimination ?? true;
  const poolMaxScore = competition.settings?.defaultPoolMaxScore ?? 21;
  const tableMaxScore = competition.settings?.defaultTableMaxScore ?? 0;
  const isLaserSabre = competition.weapon === Weapon.LASER;

  // Fonction helper pour calculer le classement selon le type de compétition
  const computePoolRanking = (pool: Pool) => {
    return isLaserSabre ? calculatePoolRankingQuest(pool) : calculatePoolRanking(pool);
  };

  const computeOverallRanking = (poolsList: Pool[]) => {
    return isLaserSabre ? calculateOverallRankingQuest(poolsList) : calculateOverallRanking(poolsList);
  };

  // Sauvegarder l'état de session
  const saveState = async () => {
    if (!window.electronAPI?.db?.saveSessionState) return;
    
    const state = {
      currentPhase,
      currentPoolRound,
      pools,
      poolHistory,
      overallRanking,
      tableauMatches,
      finalResults,
    };
    
    try {
      await window.electronAPI.db.saveSessionState(competition.id, state);
    } catch (e) {
      console.error('Failed to save session state:', e);
    }
  };

  // Restaurer l'état de session
  const restoreState = async () => {
    if (!window.electronAPI?.db?.getSessionState) {
      setIsLoaded(true);
      return;
    }
    
    try {
      const state = await window.electronAPI.db.getSessionState(competition.id);
      if (state) {
        setCurrentPhase(state.currentPhase || 'checkin');
        setCurrentPoolRound(state.currentPoolRound || 1);
        setPools(state.pools || []);
        setPoolHistory(state.poolHistory || []);
        setOverallRanking(state.overallRanking || []);
        setTableauMatches(state.tableauMatches || []);
        setFinalResults(state.finalResults || []);
        console.log('Session state restored');
      }
    } catch (e) {
      console.error('Failed to restore session state:', e);
    }
    setIsLoaded(true);
  };

  // Sauvegarder à chaque changement important
  useEffect(() => {
    if (isLoaded) {
      saveState();
    }
  }, [currentPhase, currentPoolRound, pools, tableauMatches, finalResults, overallRanking]);

  // Restaurer au chargement
  useEffect(() => {
    restoreState();
  }, [competition.id]);

  useEffect(() => {
    loadFencers();
    
    // Listen for menu events
    if (window.electronAPI?.onMenuCompetitionProperties) {
      window.electronAPI.onMenuCompetitionProperties(() => {
        setShowPropertiesModal(true);
      });
    }
    
    if (window.electronAPI?.onMenuImport) {
      window.electronAPI.onMenuImport((format: string, filepath: string, content: string) => {
        setImportData({ format, filepath, content });
      });
    }
    
    return () => {
      if (window.electronAPI?.removeAllListeners) {
        window.electronAPI.removeAllListeners('menu:competition-properties');
        window.electronAPI.removeAllListeners('menu:import');
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

  const handleImportFencers = async (importedFencers: Partial<Fencer>[]) => {
    try {
      if (window.electronAPI) {
        const newFencers: Fencer[] = [];
        for (const fencerData of importedFencers) {
          const newFencer = await window.electronAPI.db.addFencer(competition.id, fencerData);
          newFencers.push(newFencer);
        }
        const allFencers = [...fencers, ...newFencers];
        setFencers(allFencers);
        onUpdate({ ...competition, fencers: allFencers });
      }
    } catch (error) {
      console.error('Failed to import fencers:', error);
    }
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

  const handleDeleteFencer = async (id: string) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.db.deleteFencer(id);
        const updatedFencers = fencers.filter(f => f.id !== id);
        setFencers(updatedFencers);
        onUpdate({ ...competition, fencers: updatedFencers });
      }
    } catch (error) {
      console.error('Failed to delete fencer:', error);
    }
  };

  const handleCheckInAll = () => {
    const notCheckedInFencers = fencers.filter(f => f.status === FencerStatus.NOT_CHECKED_IN);
    const updatedFencers = fencers.map(fencer => 
      fencer.status === FencerStatus.NOT_CHECKED_IN 
        ? { ...fencer, status: FencerStatus.CHECKED_IN }
        : fencer
    );
    setFencers(updatedFencers);
    onUpdate({ ...competition, fencers: updatedFencers } as any);
    
    // Update database
    notCheckedInFencers.forEach(async (fencer) => {
      try {
        if (window.electronAPI) {
          await window.electronAPI.db.updateFencer(fencer.id, { status: FencerStatus.CHECKED_IN });
        }
      } catch (error) {
        console.error('Failed to check in fencer:', error);
      }
    });
  };

  const handleUncheckAll = () => {
    const checkedInFencers = fencers.filter(f => f.status === FencerStatus.CHECKED_IN);
    const updatedFencers = fencers.map(fencer => 
      fencer.status === FencerStatus.CHECKED_IN 
        ? { ...fencer, status: FencerStatus.NOT_CHECKED_IN }
        : fencer
    );
    setFencers(updatedFencers);
    onUpdate({ ...competition, fencers: updatedFencers } as any);
    
    // Update database
    checkedInFencers.forEach(async (fencer) => {
      try {
        if (window.electronAPI) {
          await window.electronAPI.db.updateFencer(fencer.id, { status: FencerStatus.NOT_CHECKED_IN });
        }
      } catch (error) {
        console.error('Failed to uncheck fencer:', error);
      }
    });
  };

  const getCheckedInFencers = () => fencers.filter(f => f.status === FencerStatus.CHECKED_IN);

  const handleGeneratePools = () => {
    const checkedIn = getCheckedInFencers();
    if (checkedIn.length < 4) {
      showToast('Il faut au moins 4 tireurs pointés pour créer les poules.', 'warning');
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
        maxScore: poolMaxScore,
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

  const handleScoreUpdate = async (poolIndex: number, matchIndex: number, scoreA: number, scoreB: number, winnerOverride?: 'A' | 'B') => {
    const updatedPools = [...pools];
    const pool = updatedPools[poolIndex];
    const match = pool.matches[matchIndex];

    // Déterminer le vainqueur : soit par score, soit par override (sabre laser)
    let isVictoryA: boolean;
    if (winnerOverride) {
      isVictoryA = winnerOverride === 'A';
    } else {
      isVictoryA = scoreA > scoreB;
    }
    
    match.scoreA = { value: scoreA, isVictory: isVictoryA, isAbstention: false, isExclusion: false, isForfait: false };
    match.scoreB = { value: scoreB, isVictory: !isVictoryA, isAbstention: false, isExclusion: false, isForfait: false };
    match.status = MatchStatus.FINISHED;

    pool.isComplete = pool.matches.every(m => m.status === MatchStatus.FINISHED);
    if (pool.isComplete) {
      pool.ranking = computePoolRanking(pool);
    }

    setPools(updatedPools);
    
    // Save to database
    try {
      if (window.electronAPI) {
        await window.electronAPI.db.updatePool(pool);
      }
    } catch (error) {
      console.error('Failed to save pool score:', error);
    }
  };

  const handleMoveFencer = (fencerId: string, fromPoolIndex: number, toPoolIndex: number) => {
    const updatedPools = [...pools];
    const fromPool = updatedPools[fromPoolIndex];
    const toPool = updatedPools[toPoolIndex];
    
    // Trouver le tireur à déplacer
    const fencerIndex = fromPool.fencers.findIndex(f => f.id === fencerId);
    if (fencerIndex === -1) return;
    
    const fencer = fromPool.fencers[fencerIndex];
    
    // Retirer le tireur de la poule source
    fromPool.fencers.splice(fencerIndex, 1);
    
    // Ajouter le tireur à la poule destination
    toPool.fencers.push(fencer);
    
    // Régénérer les matches pour les deux poules
    const regeneratePoolMatches = (pool: Pool): Pool => {
      const matchOrder = generatePoolMatchOrder(pool.fencers.length);
      const now = new Date();
      const newMatches: Match[] = matchOrder.map(([a, b], matchIndex) => ({
        id: `${pool.id}-match-${matchIndex}`,
        number: matchIndex + 1,
        fencerA: pool.fencers[a - 1],
        fencerB: pool.fencers[b - 1],
        scoreA: null,
        scoreB: null,
        maxScore: poolMaxScore,
        status: MatchStatus.NOT_STARTED,
        poolId: pool.id,
        createdAt: now,
        updatedAt: now,
      }));
      
      return {
        ...pool,
        matches: newMatches,
        isComplete: false,
        ranking: [],
      };
    };
    
    updatedPools[fromPoolIndex] = regeneratePoolMatches(fromPool);
    updatedPools[toPoolIndex] = regeneratePoolMatches(toPool);
    
    setPools(updatedPools);
  };

  const handleGoToTableau = () => {
    // Calculer le classement général à partir de toutes les poules
    const ranking = computeOverallRanking(pools);
    setOverallRanking(ranking);
    // Réinitialiser le tableau pour qu'il soit régénéré avec le nouveau classement
    setTableauMatches([]);
    setCurrentPhase('tableau');
  };

  const handleNextPoolRound = () => {
    // Sauvegarder les poules actuelles dans l'historique
    setPoolHistory(prev => [...prev, pools]);
    
    // Calculer le classement actuel pour redistribuer
    const ranking = computeOverallRanking(pools);
    const rankedFencers = ranking.map(r => r.fencer);
    
    // Générer les nouvelles poules basées sur le classement
    const poolCount = calculateOptimalPoolCount(rankedFencers.length, 5, 7);
    const distribution = distributeFencersToPoolsSerpentine(rankedFencers, poolCount,
      { byClub: true, byLeague: true, byNation: false });

    const now = new Date();
    const generatedPools: Pool[] = distribution.map((poolFencers, index) => {
      const matchOrder = generatePoolMatchOrder(poolFencers.length);
      const matches: Match[] = matchOrder.map(([a, b], matchIndex) => ({
        id: `match-r${currentPoolRound + 1}-${index}-${matchIndex}`,
        number: matchIndex + 1,
        fencerA: poolFencers[a - 1],
        fencerB: poolFencers[b - 1],
        scoreA: null,
        scoreB: null,
        maxScore: poolMaxScore,
        status: MatchStatus.NOT_STARTED,
        poolId: `pool-r${currentPoolRound + 1}-${index}`,
        createdAt: now,
        updatedAt: now,
      }));

      return {
        id: `pool-r${currentPoolRound + 1}-${index}`,
        number: index + 1,
        fencers: poolFencers,
        matches,
        referees: [],
        isComplete: false,
        hasError: false,
        ranking: [],
        phaseId: `phase-pools-r${currentPoolRound + 1}`,
        createdAt: now,
        updatedAt: now,
      };
    });

    setPools(generatedPools);
    setCurrentPoolRound(prev => prev + 1);
  };

  const handleGoToResults = () => {
    // Calculer le classement final basé sur les poules
    const ranking = computeOverallRanking(pools);
    setOverallRanking(ranking);
    
    // Convertir en résultats finaux (sans élimination directe)
    const results: FinalResult[] = ranking.map((r, index) => ({
      rank: index + 1,
      fencer: r.fencer,
      eliminatedAt: 'Poules',
    }));
    
    setFinalResults(results);
    setCurrentPhase('results');
  };

  // Phases dynamiques selon les settings
  const phases = [
    { id: 'checkin', label: 'Appel', icon: '📋' },
    { id: 'pools', label: poolRounds > 1 ? `Poules (${currentPoolRound}/${poolRounds})` : 'Poules', icon: '🎯' },
    ...(hasDirectElimination ? [{ id: 'tableau', label: 'Tableau', icon: '🏆' }] : []),
    { id: 'results', label: 'Résultats', icon: '📊' },
  ];

  // Déterminer si on peut passer à la phase suivante
  const canAdvanceFromPools = pools.length > 0 && pools.every(p => p.isComplete);
  const isLastPoolRound = currentPoolRound >= poolRounds;

  // Déterminer l'action du bouton après les poules
  const getPoolsNextAction = () => {
    if (!canAdvanceFromPools) return null;
    
    if (!isLastPoolRound) {
      return {
        label: `Tour ${currentPoolRound + 1} de poules →`,
        action: handleNextPoolRound,
      };
    }
    
    if (hasDirectElimination) {
      return {
        label: 'Passer au tableau →',
        action: handleGoToTableau,
      };
    }
    
    return {
      label: 'Voir les résultats →',
      action: handleGoToResults,
    };
  };

  const poolsNextAction = getPoolsNextAction();

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
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.2)' }}>{fencers.length} tireurs</span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.2)' }}>{getCheckedInFencers().length} pointés</span>
          <button 
            onClick={() => setShowPropertiesModal(true)}
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              border: 'none', 
              color: 'white', 
              padding: '0.5rem 1rem', 
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            ⚙️ Propriétés
          </button>
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
          {currentPhase === 'pools' && poolsNextAction && (
            <button className="btn btn-primary" onClick={poolsNextAction.action}>
              {poolsNextAction.label}
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {currentPhase === 'checkin' && (
          <FencerList 
            fencers={fencers} 
            onCheckIn={handleCheckInFencer} 
            onAddFencer={() => setShowAddFencerModal(true)}
            onEditFencer={handleUpdateFencer}
            onDeleteFencer={handleDeleteFencer}
            onCheckInAll={handleCheckInAll}
            onUncheckAll={handleUncheckAll}
          />
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
                  <PoolView 
                    key={pool.id} 
                    pool={pool} 
                    weapon={competition.weapon}
                    maxScore={poolMaxScore}
                    onScoreUpdate={(matchIndex, scoreA, scoreB, winnerOverride) => handleScoreUpdate(poolIndex, matchIndex, scoreA, scoreB, winnerOverride)}
                    onFencerChangePool={pools.length > 1 ? (fencer) => setChangePoolData({ fencer, poolIndex }) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentPhase === 'tableau' && (
          <TableauView 
            ranking={overallRanking}
            matches={tableauMatches}
            onMatchesChange={setTableauMatches}
            maxScore={tableMaxScore}
            onComplete={(results) => {
              setFinalResults(results);
              setCurrentPhase('results');
            }}
          />
        )}

        {currentPhase === 'results' && (
          <ResultsView 
            competition={competition}
            poolRanking={overallRanking}
            finalResults={finalResults}
          />
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
      
      {importData && (
        <ImportModal
          format={importData.format}
          filepath={importData.filepath}
          content={importData.content}
          onImport={handleImportFencers}
          onClose={() => setImportData(null)}
        />
      )}

      {changePoolData && (
        <ChangePoolModal
          fencer={changePoolData.fencer}
          currentPool={pools[changePoolData.poolIndex]}
          allPools={pools}
          onMove={handleMoveFencer}
          onClose={() => setChangePoolData(null)}
        />
      )}
    </div>
  );
};

export default CompetitionView;
