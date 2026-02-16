/**
 * BellePoule Modern - Pool View Component
 * With classic grid view and match list view
 * Licensed under GPL-3.0
 */

import React, { useState, useMemo } from 'react';
import { useModalResize } from '../hooks/useModalResize';
import { Pool, Fencer, Match, MatchStatus, Score, Weapon } from '../../shared/types';
import { formatRatio, formatIndex } from '../../shared/utils/poolCalculations';
import { useToast } from './Toast';
import { useConfirm } from './ConfirmDialog';
import { exportPoolToPDF } from '../../shared/utils/pdfExport';

interface PoolViewProps {
  pool: Pool;
  maxScore?: number;
  weapon?: Weapon;
  onScoreUpdate: (
    matchIndex: number,
    scoreA: number,
    scoreB: number,
    winnerOverride?: 'A' | 'B',
    specialStatus?: 'abandon' | 'forfait' | 'exclusion'
  ) => void;
  onFencerChangePool?: (fencer: Fencer) => void;
  onFencerStatusChange?: (fencerId: string, status: 'abandon' | 'forfait' | 'exclusion') => void;
}

type ViewMode = 'grid' | 'matches';

const PoolViewComponent: React.FC<PoolViewProps> = ({
  pool,
  maxScore = 5,
  weapon,
  onScoreUpdate,
  onFencerChangePool,
  onFencerStatusChange,
}) => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [editingMatch, setEditingMatch] = useState<number | null>(null);
  const [editingFromRowA, setEditingFromRowA] = useState<boolean>(true);
  const [editScoreA, setEditScoreA] = useState('');
  const [editScoreB, setEditScoreB] = useState('');
  const [victoryA, setVictoryA] = useState(false);
  const [victoryB, setVictoryB] = useState(false);
  const [matchesUpdateTrigger, setMatchesUpdateTrigger] = useState(0);

  const isLaserSabre = weapon === Weapon.LASER;
  const fencers = pool.fencers;

  // Calculer l'ordre optimal des matches restants
  const orderedMatches = useMemo(() => {
    const pending = pool.matches
      .map((m, idx) => ({ match: m, index: idx }))
      .filter(({ match }) => match.status !== MatchStatus.FINISHED);

    const finished = pool.matches
      .map((m, idx) => ({ match: m, index: idx }))
      .filter(({ match }) => match.status === MatchStatus.FINISHED);

    if (pending.length === 0) return { pending: [], finished };

    // Algorithme pour éviter qu'un tireur combatte 2 fois d'affilée
    const ordered: typeof pending = [];
    const remaining = [...pending];
    let lastFencerIds: Set<string> = new Set();

    // Si des matchs ont déjà été joués, récupérer les derniers combattants
    if (finished.length > 0) {
      const lastMatch = finished[finished.length - 1].match;
      if (lastMatch.fencerA) lastFencerIds.add(lastMatch.fencerA.id);
      if (lastMatch.fencerB) lastFencerIds.add(lastMatch.fencerB.id);
    }

    while (remaining.length > 0) {
      // Chercher un match où aucun des deux tireurs n'a combattu au dernier tour
      let bestIdx = -1;
      let bestScore = -1;

      for (let i = 0; i < remaining.length; i++) {
        const { match } = remaining[i];
        const fencerAId = match.fencerA?.id || '';
        const fencerBId = match.fencerB?.id || '';

        let score = 0;
        if (!lastFencerIds.has(fencerAId)) score++;
        if (!lastFencerIds.has(fencerBId)) score++;

        if (score > bestScore) {
          bestScore = score;
          bestIdx = i;
        }

        // Score parfait (2) = aucun des deux n'a combattu
        if (score === 2) break;
      }

      // Prendre le meilleur match trouvé (ou le premier si aucun idéal)
      const chosenIdx = bestIdx >= 0 ? bestIdx : 0;
      const chosen = remaining.splice(chosenIdx, 1)[0];
      ordered.push(chosen);

      // Mettre à jour les derniers combattants
      lastFencerIds = new Set();
      if (chosen.match.fencerA) lastFencerIds.add(chosen.match.fencerA.id);
      if (chosen.match.fencerB) lastFencerIds.add(chosen.match.fencerB.id);
    }

    return { pending: ordered, finished };
  }, [pool.matches.length, pool.matches.map(m => m.status).join(',')]);

  const getScore = (fencerA: Fencer, fencerB: Fencer): Score | null => {
    const match = pool.matches.find(
      m =>
        (m.fencerA?.id === fencerA.id && m.fencerB?.id === fencerB.id) ||
        (m.fencerA?.id === fencerB.id && m.fencerB?.id === fencerA.id)
    );
    if (!match || match.status !== MatchStatus.FINISHED) return null;
    return match.fencerA?.id === fencerA.id ? match.scoreA : match.scoreB;
  };

  const getMatchIndex = (fencerA: Fencer, fencerB: Fencer): number => {
    return pool.matches.findIndex(
      m =>
        (m.fencerA?.id === fencerA.id && m.fencerB?.id === fencerB.id) ||
        (m.fencerA?.id === fencerB.id && m.fencerB?.id === fencerA.id)
    );
  };

  const { modalRef, dimensions } = useModalResize({
    defaultWidth: 1440, // Doublé de 720 à 1440 (+100%)
    defaultHeight: 400,
    minWidth: 960, // Doublé de 480 à 960 (+100%)
    minHeight: 300,
  });

  const openScoreModal = (matchIndex: number) => {
    const match = pool.matches[matchIndex];
    setEditingMatch(matchIndex);
    setEditScoreA(match.scoreA?.value?.toString() || '');
    setEditScoreB(match.scoreB?.value?.toString() || '');
    setVictoryA(false);
    setVictoryB(false);
  };

  const handleCellClick = (rowFencer: Fencer, colFencer: Fencer) => {
    if (rowFencer.id === colFencer.id) return;
    const matchIndex = getMatchIndex(rowFencer, colFencer);
    if (matchIndex === -1) return;

    const match = pool.matches[matchIndex];
    const isRowA = match.fencerA?.id === rowFencer.id;

    setEditingMatch(matchIndex);
    setEditingFromRowA(isRowA);
    setEditScoreA(
      isRowA ? match.scoreA?.value?.toString() || '' : match.scoreB?.value?.toString() || ''
    );
    setEditScoreB(
      isRowA ? match.scoreB?.value?.toString() || '' : match.scoreA?.value?.toString() || ''
    );
    setVictoryA(false);
    setVictoryB(false);
  };

  const handleScoreSubmit = () => {
    if (editingMatch === null) return;

    const scoreA = parseInt(editScoreA, 10) || 0;
    const scoreB = parseInt(editScoreB, 10) || 0;

    // Valider que les scores ne dépassent pas le maximum
    if (maxScore > 0) {
      if (scoreA > maxScore) {
        showToast(`Le score du tireur A ne peut pas dépasser ${maxScore}`, 'error');
        return;
      }
      if (scoreB > maxScore) {
        showToast(`Le score du tireur B ne peut pas dépasser ${maxScore}`, 'error');
        return;
      }
    }

    // Si on édite depuis la ligne B, inverser les scores pour les enregistrer correctement
    const actualScoreA = editingFromRowA ? scoreA : scoreB;
    const actualScoreB = editingFromRowA ? scoreB : scoreA;

    if (actualScoreA === actualScoreB) {
      if (isLaserSabre && (victoryA || victoryB)) {
        // Déterminer qui gagne selon la perspective
        const winner = editingFromRowA ? (victoryA ? 'A' : 'B') : victoryB ? 'A' : 'B';
        onScoreUpdate(editingMatch, actualScoreA, actualScoreB, winner);
      } else if (isLaserSabre) {
        showToast('Match nul : cliquez sur V pour attribuer la victoire', 'warning');
        return;
      } else {
        showToast('Match nul impossible en escrime !', 'error');
        return;
      }
    } else {
      onScoreUpdate(editingMatch, actualScoreA, actualScoreB);
    }

    // Forcer la mise à jour de l'ordre des matchs
    setMatchesUpdateTrigger(prev => prev + 1);

    // Fermer le modal immédiatement après la mise à jour
    setEditingMatch(null);
    setEditingFromRowA(true);
    setEditScoreA('');
    setEditScoreB('');
    setVictoryA(false);
    setVictoryB(false);
  };

  const handleSpecialStatus = async (status: 'abandon' | 'forfait' | 'exclusion') => {
    if (editingMatch === null) return;

    const match = pool.matches[editingMatch];

    // Déterminer quel tireur abandonne (le premier par défaut, pourrait être paramétrable)
    const statusVerb =
      status === 'abandon' ? 'abandonne' : status === 'forfait' ? 'déclare forfait' : 'est exclu';
    const statusInf =
      status === 'abandon' ? 'abandonner' : status === 'forfait' ? 'déclarer forfait' : 'exclure';
    const isA = await confirm({
      message: `${match.fencerA?.lastName} ${match.fencerA?.firstName?.charAt(0)}. ${statusVerb} ?\n\nCliquez sur Annuler pour ${statusInf} ${match.fencerB?.lastName} ${match.fencerB?.firstName?.charAt(0)}.`,
      confirmLabel: `${match.fencerA?.lastName}`,
      cancelLabel: `${match.fencerB?.lastName}`,
    });

    if (isA) {
      // Tireur A abandonne/forfait/exclu
      onScoreUpdate(editingMatch, 0, match.scoreB?.value || maxScore, 'B', status);
      // Notifier le parent pour mettre à jour tous les matchs de ce tireur
      if (onFencerStatusChange && match.fencerA) {
        onFencerStatusChange(match.fencerA.id, status);
      }
    } else {
      // Tireur B abandonne/forfait/exclu
      onScoreUpdate(editingMatch, match.scoreA?.value || maxScore, 0, 'A', status);
      // Notifier le parent pour mettre à jour tous les matchs de ce tireur
      if (onFencerStatusChange && match.fencerB) {
        onFencerStatusChange(match.fencerB.id, status);
      }
    }

    // Forcer la mise à jour de l'ordre des matchs
    setMatchesUpdateTrigger(prev => prev + 1);

    // Fermer le modal immédiatement après la mise à jour
    setEditingMatch(null);
    setEditingFromRowA(true);
    setEditScoreA('');
    setEditScoreB('');
    setVictoryA(false);
    setVictoryB(false);
  };

  const calculateFencerStats = (fencer: Fencer) => {
    let v = 0,
      d = 0,
      td = 0,
      tr = 0;
    for (const match of pool.matches) {
      if (match.status !== MatchStatus.FINISHED) continue;
      if (match.fencerA?.id === fencer.id) {
        if (match.scoreA?.isVictory) v++;
        else d++;
        td += match.scoreA?.value || 0;
        tr += match.scoreB?.value || 0;
      } else if (match.fencerB?.id === fencer.id) {
        if (match.scoreB?.isVictory) v++;
        else d++;
        td += match.scoreB?.value || 0;
        tr += match.scoreA?.value || 0;
      }
    }
    return { v, d, td, tr, index: td - tr, ratio: v + d > 0 ? v / (v + d) : 0 };
  };

  const finishedCount = pool.matches.filter(m => m.status === MatchStatus.FINISHED).length;
  const totalMatches = pool.matches.length;

  // Export PDF function
  const handleExportPDF = async () => {
    try {
      await exportPoolToPDF(pool, {
        title: `Poule ${pool.number} - ${pool.fencers.length} tireurs`,
        includeFinishedMatches: true,
        includePendingMatches: true,
        includePoolStats: true,
      });
      showToast(`Export PDF de la poule ${pool.number} généré avec succès`, 'success');
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      showToast(
        `Erreur lors de la génération du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        'error'
      );
    }
  };

  // Fonction pour remplir automatiquement tous les scores de la poule (pour les tests)
  const handleAutoFillScores = async () => {
    const confirmed = await confirm({
      message:
        'Remplir automatiquement tous les scores des matchs non terminés ?\n\nLes scores seront générés aléatoirement pour les tests.',
      confirmLabel: 'Remplir',
      cancelLabel: 'Annuler',
    });

    if (!confirmed) return;

    const pendingMatches = pool.matches
      .map((match, index) => ({ match, index }))
      .filter(({ match }) => match.status !== MatchStatus.FINISHED);

    if (pendingMatches.length === 0) {
      showToast('Tous les matchs sont déjà terminés', 'info');
      return;
    }

    for (const { index } of pendingMatches) {
      // Générer des scores aléatoires
      const scoreA = Math.floor(Math.random() * (maxScore + 1));
      const scoreB = Math.floor(Math.random() * (maxScore + 1));

      // Si les scores sont égaux
      if (scoreA === scoreB) {
        if (isLaserSabre) {
          // En sabre laser, désigner un vainqueur aléatoire en cas d'égalité
          const winnerOverride = Math.random() > 0.5 ? 'A' : 'B';
          onScoreUpdate(index, scoreA, scoreB, winnerOverride);
        } else {
          // En escrime classique, éviter l'égalité
          if (scoreA === 0) {
            // Si les deux sont à 0, mettre l'un à 1
            onScoreUpdate(index, 1, 0);
          } else {
            // Sinon, donner la victoire à un des deux aléatoirement
            if (Math.random() > 0.5) {
              onScoreUpdate(index, scoreA + 1, scoreB);
            } else {
              onScoreUpdate(index, scoreA, scoreB + 1);
            }
          }
        }
      } else {
        // Scores différents, pas besoin de traitement spécial
        onScoreUpdate(index, scoreA, scoreB);
      }
    }

    setMatchesUpdateTrigger(prev => prev + 1);
    showToast(`Scores générés pour ${pendingMatches.length} match(s)`, 'success');
  };

  // Render Score Modal
  const renderScoreModal = () => {
    if (editingMatch === null) return null;

    const match = pool.matches[editingMatch];

    return (
      <div
        className="modal-overlay"
        onClick={() => {
          setEditingMatch(null);
          setEditingFromRowA(true);
        }}
      >
        <div
          ref={modalRef}
          className="modal resizable"
          onClick={e => e.stopPropagation()}
          style={{ maxWidth: '900px', width: '95%', minHeight: '400px' }}
        >
          <div className="modal-header" style={{ cursor: 'move' }}>
            <h3 className="modal-title">Saisie rapide du score</h3>
          </div>
          <div className="modal-body" style={{ padding: '2rem' }}>
            {/* Ligne unique avec les deux tireurs côte à côte */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              {/* Tireur A */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  flex: 1,
                  minWidth: '200px',
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 600, textAlign: 'right' }}>
                  {match.fencerA?.lastName}
                </div>
                <div style={{ fontSize: '1rem', color: '#6b7280', textAlign: 'right' }}>
                  {match.fencerA?.firstName} {match.fencerA?.club && `(${match.fencerA.club})`}
                </div>
              </div>

              {/* Bouton Victoire Sabre Laser A */}
              {isLaserSabre && (
                <button
                  type="button"
                  onClick={() => {
                    setVictoryA(!victoryA);
                    setVictoryB(false);
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    background: victoryA ? '#22c55e' : '#e5e7eb',
                    color: victoryA ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1.1rem',
                  }}
                >
                  V
                </button>
              )}

              {/* Input Score A */}
              <input
                type="number"
                className="form-input"
                style={{
                  width: '120px',
                  textAlign: 'center',
                  fontSize: '3rem',
                  padding: '0.75rem',
                  borderColor:
                    (parseInt(editScoreA, 10) || 0) > (maxScore > 0 ? maxScore : 999)
                      ? '#ef4444'
                      : undefined,
                  borderWidth:
                    (parseInt(editScoreA, 10) || 0) > (maxScore > 0 ? maxScore : 999)
                      ? '2px'
                      : undefined,
                }}
                value={editScoreA}
                onChange={e => setEditScoreA(e.target.value)}
                min="0"
                max={maxScore > 0 ? maxScore : undefined}
                autoFocus
                onKeyDown={e => {
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
              <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#9ca3af' }}>:</span>

              {/* Input Score B */}
              <input
                type="number"
                className="form-input"
                style={{
                  width: '120px',
                  textAlign: 'center',
                  fontSize: '3rem',
                  padding: '0.75rem',
                  borderColor:
                    (parseInt(editScoreB, 10) || 0) > (maxScore > 0 ? maxScore : 999)
                      ? '#ef4444'
                      : undefined,
                  borderWidth:
                    (parseInt(editScoreB, 10) || 0) > (maxScore > 0 ? maxScore : 999)
                      ? '2px'
                      : undefined,
                }}
                value={editScoreB}
                onChange={e => setEditScoreB(e.target.value)}
                min="0"
                max={maxScore > 0 ? maxScore : undefined}
                onKeyDown={e => {
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

              {/* Bouton Victoire Sabre Laser B */}
              {isLaserSabre && (
                <button
                  type="button"
                  onClick={() => {
                    setVictoryB(!victoryB);
                    setVictoryA(false);
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    background: victoryB ? '#22c55e' : '#e5e7eb',
                    color: victoryB ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1.1rem',
                  }}
                >
                  V
                </button>
              )}

              {/* Tireur B */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  flex: 1,
                  minWidth: '200px',
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 600, textAlign: 'left' }}>
                  {match.fencerB?.lastName}
                </div>
                <div style={{ fontSize: '1rem', color: '#6b7280', textAlign: 'left' }}>
                  {match.fencerB?.firstName} {match.fencerB?.club && `(${match.fencerB.club})`}
                </div>
              </div>
            </div>

            {/* Info égalité sabre laser */}
            {isLaserSabre && (
              <p
                className="text-sm text-muted"
                style={{ textAlign: 'center', marginBottom: '1rem' }}
              >
                💡 En cas d'égalité, cliquez sur V pour attribuer la victoire
              </p>
            )}

            {/* Boutons spéciaux sur une ligne */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'center',
                borderTop: '1px solid #e5e7eb',
                paddingTop: '1rem',
                marginTop: '0.5rem',
              }}
            >
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
          <div
            className="modal-footer"
            style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}
          >
            <button
              className="btn btn-secondary"
              onClick={() => {
                setEditingMatch(null);
                setEditingFromRowA(true);
              }}
            >
              Annuler
            </button>
            <button className="btn btn-primary" onClick={handleScoreSubmit}>
              Valider
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Grid View
  const renderGridView = () => (
    <div className="pool-grid">
      <div className="pool-row">
        <div className="pool-cell pool-cell-header pool-cell-name"></div>
        {fencers.map((_, i) => (
          <div key={i} className="pool-cell pool-cell-header">
            {i + 1}
          </div>
        ))}
        <div className="pool-cell pool-cell-header">V</div>
        <div className="pool-cell pool-cell-header">V/M</div>
        <div className="pool-cell pool-cell-header">TD</div>
        <div className="pool-cell pool-cell-header">TR</div>
        <div className="pool-cell pool-cell-header">Ind</div>
        {isLaserSabre && (
          <div className="pool-cell pool-cell-header" style={{ color: '#7c3aed' }}>
            Quest
          </div>
        )}
        <div className="pool-cell pool-cell-header">Rg</div>
      </div>

      {fencers.map((rowFencer, rowIndex) => {
        const stats = calculateFencerStats(rowFencer);
        const rankEntry = pool.ranking.find(r => r.fencer.id === rowFencer.id);

        return (
          <div key={rowFencer.id} className="pool-row">
            <div
              className="pool-cell pool-cell-header pool-cell-name"
              title={`${rowFencer.firstName} ${rowFencer.lastName}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <span style={{ fontWeight: 500 }}>{rowIndex + 1}.</span>
              <span className="truncate" style={{ flex: 1 }}>
                {rowFencer.lastName}
                <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.25rem' }}>
                  {rowFencer.firstName}
                </span>
              </span>
              {onFencerChangePool && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onFencerChangePool(rowFencer);
                  }}
                  title="Changer de poule"
                  style={{
                    padding: '0.125rem 0.25rem',
                    fontSize: '0.625rem',
                    background: '#e5e7eb',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    opacity: 0.6,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
                >
                  ↔
                </button>
              )}
            </div>

            {fencers.map((colFencer, colIndex) => {
              if (rowIndex === colIndex) {
                return <div key={colIndex} className="pool-cell pool-cell-diagonal"></div>;
              }
              const score = getScore(rowFencer, colFencer);
              const cellClass = score
                ? score.isVictory
                  ? 'pool-cell-victory'
                  : 'pool-cell-defeat'
                : 'pool-cell-editable';

              return (
                <div
                  key={colIndex}
                  className={`pool-cell ${cellClass}`}
                  onClick={() => handleCellClick(rowFencer, colFencer)}
                  style={{ cursor: 'pointer' }}
                >
                  {score ? (
                    <span>
                      {score.isVictory ? 'V' : ''}
                      {score.value}
                    </span>
                  ) : (
                    <span style={{ color: '#9CA3AF' }}>-</span>
                  )}
                </div>
              );
            })}

            <div className="pool-cell" style={{ fontWeight: 600 }}>
              {stats.v}
            </div>
            <div className="pool-cell text-sm">{formatRatio(stats.ratio)}</div>
            <div className="pool-cell">{stats.td}</div>
            <div className="pool-cell">{stats.tr}</div>
            <div className="pool-cell" style={{ color: stats.index >= 0 ? '#059669' : '#DC2626' }}>
              {formatIndex(stats.index)}
            </div>
            {isLaserSabre && (
              <div className="pool-cell" style={{ fontWeight: 600, color: '#7c3aed' }}>
                {rankEntry?.questPoints ?? '-'}
              </div>
            )}
            <div className="pool-cell" style={{ fontWeight: 600 }}>
              {rankEntry?.rank || '-'}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Composant Prochain Match réutilisable
  const renderNextMatch = () => {
    if (orderedMatches.pending.length === 0) return null;

    const nextMatch = orderedMatches.pending[0];

    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          borderRadius: '8px',
          padding: '1rem',
          marginTop: '1rem',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.8 }}>
            ⚔️ Prochain match
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <span style={{ fontWeight: '600' }}>
              {nextMatch.match.fencerA?.lastName} {nextMatch.match.fencerA?.firstName?.charAt(0)}.
              {nextMatch.match.fencerA?.ranking && ` #${nextMatch.match.fencerA.ranking}`}
            </span>
            <span style={{ opacity: 0.7 }}>vs</span>
            <span style={{ fontWeight: '600' }}>
              {nextMatch.match.fencerB?.lastName} {nextMatch.match.fencerB?.firstName?.charAt(0)}.
              {nextMatch.match.fencerB?.ranking && ` #${nextMatch.match.fencerB.ranking}`}
            </span>
          </div>
          <button
            onClick={() => openScoreModal(nextMatch.index)}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.875rem',
            }}
          >
            Saisir
          </button>
        </div>
      </div>
    );
  };

  // Render Match List View
  const renderMatchListView = () => (
    <div>
      {/* Prochain match en gros */}
      {orderedMatches.pending.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '1rem',
            color: 'white',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              opacity: 0.8,
              marginBottom: '0.5rem',
            }}
          >
            ⚔️ Prochain match
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {orderedMatches.pending[0].match.fencerA?.lastName}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                {orderedMatches.pending[0].match.fencerA?.firstName}
              </div>
            </div>
            <div style={{ padding: '0 1rem', fontSize: '1.25rem', fontWeight: '600' }}>VS</div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {orderedMatches.pending[0].match.fencerB?.lastName}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                {orderedMatches.pending[0].match.fencerB?.firstName}
              </div>
            </div>
          </div>
          <button
            onClick={() => openScoreModal(orderedMatches.pending[0].index)}
            style={{
              marginTop: '1rem',
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '6px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            🎯 Saisir le score
          </button>
        </div>
      )}

      {/* Matches restants */}
      {orderedMatches.pending.length > 1 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4
            style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#6b7280',
            }}
          >
            Matches à venir ({orderedMatches.pending.length - 1})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {orderedMatches.pending.slice(1).map(({ match, index }, i) => (
              <div
                key={index}
                onClick={() => openScoreModal(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: '#f9fafb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: '1px solid #e5e7eb',
                }}
              >
                <span style={{ color: '#9ca3af', fontSize: '0.875rem', minWidth: '30px' }}>
                  #{i + 2}
                </span>
                <span style={{ flex: 1, fontWeight: '500' }}>{match.fencerA?.lastName}</span>
                <span style={{ color: '#9ca3af', padding: '0 0.5rem' }}>vs</span>
                <span style={{ flex: 1, textAlign: 'right', fontWeight: '500' }}>
                  {match.fencerB?.lastName}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matches terminés */}
      {orderedMatches.finished.length > 0 && (
        <div>
          <h4
            style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#6b7280',
            }}
          >
            Matches terminés ({orderedMatches.finished.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {orderedMatches.finished.map(({ match, index }) => (
              <div
                key={index}
                onClick={() => openScoreModal(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: match.scoreA?.isVictory ? '#f0fdf4' : '#fef2f2',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: '1px solid #e5e7eb',
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontWeight: match.scoreA?.isVictory ? '600' : '400',
                    color: match.scoreA?.isVictory ? '#16a34a' : '#6b7280',
                  }}
                >
                  {match.scoreA?.isVictory ? '✓ ' : ''}
                  {match.fencerA?.lastName}
                </span>
                <span
                  style={{
                    padding: '0.25rem 0.75rem',
                    background: 'white',
                    borderRadius: '4px',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  {match.scoreA?.isVictory ? 'V' : ''}
                  {match.scoreA?.value} - {match.scoreB?.isVictory ? 'V' : ''}
                  {match.scoreB?.value}
                </span>
                <span
                  style={{
                    flex: 1,
                    textAlign: 'right',
                    fontWeight: match.scoreB?.isVictory ? '600' : '400',
                    color: match.scoreB?.isVictory ? '#16a34a' : '#6b7280',
                  }}
                >
                  {match.fencerB?.lastName}
                  {match.scoreB?.isVictory ? ' ✓' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Poule terminée */}
      {orderedMatches.pending.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏁</div>
          <div style={{ fontWeight: '600' }}>Poule terminée !</div>
          <div style={{ fontSize: '0.875rem' }}>Tous les matches ont été joués</div>
        </div>
      )}
    </div>
  );

  return (
    <div className="card">
      <div
        className="card-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>Poule {pool.number}</span>
          <span className={`badge ${pool.isComplete ? 'badge-success' : 'badge-warning'}`}>
            {pool.isComplete ? 'Terminée' : `${finishedCount}/${totalMatches}`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleAutoFillScores}
            style={{
              padding: '0.375rem 0.75rem',
              fontSize: '0.75rem',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            title="Remplir automatiquement les scores (test)"
          >
            🎲 Auto
          </button>
          <button
            onClick={handleExportPDF}
            style={{
              padding: '0.375rem 0.75rem',
              fontSize: '0.75rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            title="Exporter la poule en PDF"
          >
            📄 PDF
          </button>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '0.375rem 0.75rem',
                fontSize: '0.75rem',
                background: viewMode === 'grid' ? '#3b82f6' : '#e5e7eb',
                color: viewMode === 'grid' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '4px 0 0 4px',
                cursor: 'pointer',
              }}
            >
              📊 Tableau
            </button>
            <button
              onClick={() => setViewMode('matches')}
              style={{
                padding: '0.375rem 0.75rem',
                fontSize: '0.75rem',
                background: viewMode === 'matches' ? '#3b82f6' : '#e5e7eb',
                color: viewMode === 'matches' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '0 4px 4px 0',
                cursor: 'pointer',
              }}
            >
              ⚔️ Matches
            </button>
          </div>
        </div>
      </div>
      <div className="card-body" style={{ overflowX: 'auto' }}>
        {viewMode === 'grid' ? (
          <>
            {renderGridView()}
            {renderNextMatch()}
          </>
        ) : (
          renderMatchListView()
        )}
        {renderScoreModal()}
      </div>
    </div>
  );
};

const PoolView = React.memo(PoolViewComponent);
export default PoolView;
