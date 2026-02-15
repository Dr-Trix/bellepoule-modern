/**
 * BellePoule Modern - Pool Ranking View Component
 * Shows ranking after pools with export/print functionality
 * Licensed under GPL-3.0
 */

import React, { useMemo, useState, useCallback } from 'react';
import { PoolRanking, Pool, Weapon } from '../../shared/types';
import {
  formatRatio,
  formatIndex,
  calculateOverallRankingQuest,
  calculateOverallRanking,
  calculatePoolRanking,
  calculatePoolRankingQuest,
} from '../../shared/utils/poolCalculations';
import { useToast } from './Toast';

interface PoolRankingViewProps {
  pools: Pool[];
  weapon?: Weapon;
  onGoToTableau?: () => void;
  onGoToResults?: () => void;
  hasDirectElimination?: boolean;
  onExport?: (format: 'csv' | 'xml' | 'pdf') => void;
  onPoolsChange?: (pools: Pool[]) => void;
}

const PoolRankingView: React.FC<PoolRankingViewProps> = ({
  pools,
  weapon,
  onGoToTableau,
  onGoToResults,
  hasDirectElimination = true,
  onExport,
  onPoolsChange,
}) => {
  const { showToast } = useToast();
  const isLaserSabre = weapon === 'L';
  const [recalcKey, setRecalcKey] = useState(0);

  // Recalculer les classements de toutes les poules
  const handleRecalculate = useCallback(() => {
    // Recalculer le classement de chaque poule
    const updatedPools = pools.map(pool => {
      const newRanking = isLaserSabre
        ? calculatePoolRankingQuest(pool)
        : calculatePoolRanking(pool);
      return {
        ...pool,
        ranking: newRanking,
      };
    });

    // Mettre à jour les pools si callback fourni
    if (onPoolsChange) {
      onPoolsChange(updatedPools);
    }

    // Forcer le recalcul du classement général
    setRecalcKey(prev => prev + 1);

    showToast('Classement recalculé avec succès !', 'success');
  }, [pools, isLaserSabre, onPoolsChange, showToast]);

  // Calculer le classement général selon le type d'arme
  const overallRanking = useMemo(() => {
    // Utiliser recalcKey pour forcer le recalcul
    const _ = recalcKey;
    return isLaserSabre ? calculateOverallRankingQuest(pools) : calculateOverallRanking(pools);
  }, [pools, isLaserSabre, recalcKey]);

  const handleExport = (format: 'csv' | 'xml' | 'pdf') => {
    if (onExport) {
      onExport(format);
    } else {
      showToast(`Export ${format.toUpperCase()} non implémenté`, 'warning');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const generateCSV = () => {
    const headers = ['Rg', 'Nom', 'Prénom', 'Club', 'V', 'M', 'V/M', 'TD', 'TR', 'Indice'];
    if (isLaserSabre) {
      headers.push('Quest');
    }

    const rows = overallRanking.map(r => [
      r.rank,
      r.fencer.lastName,
      r.fencer.firstName,
      r.fencer.club || '',
      r.victories,
      r.victories + r.defeats,
      formatRatio(r.ratio),
      r.touchesScored,
      r.touchesReceived,
      formatIndex(r.index),
      ...(isLaserSabre ? [r.questPoints || 0] : []),
    ]);

    return [headers, ...rows].map(row => row.join(';')).join('\n');
  };

  return (
    <div className="content" style={{ padding: '1rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Classement après poules</h2>
          <p className="text-sm text-muted">
            {pools.length} poule{pools.length > 1 ? 's' : ''} • {overallRanking.length} tireur
            {overallRanking.length > 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary"
            onClick={handleRecalculate}
            title="Recalculer le classement"
          >
            🔄 Recalculer
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => handleExport('csv')}
            title="Exporter en CSV"
          >
            📄 CSV
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => handleExport('xml')}
            title="Exporter en XML (BellePoule)"
          >
            📋 XML
          </button>
          <button className="btn btn-secondary" onClick={handlePrint} title="Imprimer">
            📄 CSV
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => handleExport('xml')}
            title="Exporter en XML (BellePoule)"
          >
            📋 XML
          </button>
          <button className="btn btn-secondary" onClick={handlePrint} title="Imprimer">
            🖨️ Imprimer
          </button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>Rg</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Club</th>
              <th style={{ width: '40px' }}>V</th>
              <th style={{ width: '40px' }}>M</th>
              <th style={{ width: '60px' }}>V/M</th>
              <th style={{ width: '50px' }}>TD</th>
              <th style={{ width: '50px' }}>TR</th>
              <th style={{ width: '60px' }}>Indice</th>
              {isLaserSabre && <th style={{ width: '70px', color: '#7c3aed' }}>Quest</th>}
            </tr>
          </thead>
          <tbody>
            {overallRanking.map(ranking => (
              <tr key={ranking.fencer.id}>
                <td style={{ fontWeight: '600' }}>{ranking.rank}</td>
                <td className="font-medium">{ranking.fencer.lastName}</td>
                <td>{ranking.fencer.firstName}</td>
                <td className="text-sm text-muted">{ranking.fencer.club || '-'}</td>
                <td style={{ textAlign: 'center', fontWeight: '600' }}>{ranking.victories}</td>
                <td style={{ textAlign: 'center' }}>{ranking.victories + ranking.defeats}</td>
                <td style={{ textAlign: 'center' }}>{formatRatio(ranking.ratio)}</td>
                <td style={{ textAlign: 'center' }}>{ranking.touchesScored}</td>
                <td style={{ textAlign: 'center' }}>{ranking.touchesReceived}</td>
                <td
                  style={{
                    textAlign: 'center',
                    color: ranking.index >= 0 ? '#059669' : '#DC2626',
                    fontWeight: '600',
                  }}
                >
                  {formatIndex(ranking.index)}
                </td>
                {isLaserSabre && (
                  <td style={{ textAlign: 'center', fontWeight: '600', color: '#7c3aed' }}>
                    {ranking.questPoints || 0}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '2rem',
        }}
      >
        <div className="text-sm text-muted">
          <strong>Légende :</strong> V = Victoires, M = Matchs, V/M = Ratio Victoires/Matchs, TD =
          Touches Données, TR = Touches Reçues, Indice = TD - TR
          {isLaserSabre && ', Quest = Points Quest (Sabre Laser)'}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {hasDirectElimination ? (
            <button className="btn btn-primary" onClick={onGoToTableau}>
              Passer au tableau →
            </button>
          ) : (
            <button className="btn btn-primary" onClick={onGoToResults}>
              Voir les résultats →
            </button>
          )}
        </div>
      </div>

      {/* CSS pour l'impression */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            .btn, .text-muted, .text-sm {
              display: none !important;
            }
            .card {
              border: none !important;
              box-shadow: none !important;
            }
            table {
              font-size: 12pt !important;
            }
            th, td {
              padding: 4px !important;
            }
          }
        `,
        }}
      />
    </div>
  );
};

export default PoolRankingView;
