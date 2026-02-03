/**
 * BellePoule Modern - Fencer List Component
 * Licensed under GPL-3.0
 */

import React, { useState } from 'react';
import { Fencer, FencerStatus } from '../../shared/types';
import EditFencerModal from './EditFencerModal';

interface FencerListProps {
  fencers: Fencer[];
  onCheckIn: (id: string) => void;
  onAddFencer: () => void;
  onEditFencer?: (id: string, updates: Partial<Fencer>) => void;
  onDeleteFencer?: (id: string) => void;
  onCheckInAll?: () => void;
  onUncheckAll?: () => void;
  onSetFencerStatus?: (id: string, status: FencerStatus) => void;
}

const statusLabels: Record<FencerStatus, { label: string; color: string }> = {
  [FencerStatus.CHECKED_IN]: { label: 'Présent', color: 'badge-success' },
  [FencerStatus.NOT_CHECKED_IN]: { label: 'Non pointé', color: 'badge-warning' },
  [FencerStatus.QUALIFIED]: { label: 'Qualifié', color: 'badge-success' },
  [FencerStatus.ELIMINATED]: { label: 'Éliminé', color: 'badge-danger' },
  [FencerStatus.ABANDONED]: { label: 'Abandon', color: 'badge-danger' },
  [FencerStatus.EXCLUDED]: { label: 'Exclu', color: 'badge-danger' },
  [FencerStatus.FORFAIT]: { label: 'Forfait', color: 'badge-danger' },
};

const FencerList: React.FC<FencerListProps> = ({ fencers, onCheckIn, onAddFencer, onEditFencer, onDeleteFencer, onCheckInAll, onUncheckAll, onSetFencerStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'club' | 'ranking'>('ranking');
  const [editingFencer, setEditingFencer] = useState<Fencer | null>(null);

  const filteredFencers = fencers
    .filter(f => {
      const search = searchTerm.toLowerCase();
      return (
        f.lastName.toLowerCase().includes(search) ||
        f.firstName.toLowerCase().includes(search) ||
        f.club?.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.lastName.localeCompare(b.lastName);
        case 'club': return (a.club || '').localeCompare(b.club || '');
        case 'ranking': return (a.ranking ?? 99999) - (b.ranking ?? 99999);
        default: return 0;
      }
    });

  const checkedInCount = fencers.filter(f => f.status === FencerStatus.CHECKED_IN).length;
  const notCheckedInCount = fencers.filter(f => f.status === FencerStatus.NOT_CHECKED_IN).length;

  const handleEditSave = (id: string, updates: Partial<Fencer>) => {
    if (onEditFencer) {
      onEditFencer(id, updates);
    }
    setEditingFencer(null);
  };

  const handleDeleteFencer = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce tireur ? Cette action est irréversible.')) {
      try {
        if (onDeleteFencer) {
          onDeleteFencer(id);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du tireur:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        alert(`Erreur de suppression: ${errorMessage}`);
      }
    }
  };

  const handleSetFencerStatus = (id: string, status: FencerStatus, confirmationMessage?: string) => {
    if (confirmationMessage) {
      if (window.confirm(confirmationMessage)) {
        if (onSetFencerStatus) {
          onSetFencerStatus(id, status);
        }
      }
    } else {
      if (onSetFencerStatus) {
        onSetFencerStatus(id, status);
      }
    }
  };

  return (
    <div className="content">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Liste des tireurs</h2>
          <p className="text-sm text-muted">{checkedInCount} / {fencers.length} tireurs pointés</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {notCheckedInCount > 0 && onCheckInAll && (
            <button 
              className="btn btn-secondary" 
              onClick={onCheckInAll}
              title={`Pointer les ${notCheckedInCount} tireurs non pointés`}
            >
              ✓ Pointer tous
            </button>
          )}
          {checkedInCount > 0 && onUncheckAll && (
            <button 
              className="btn btn-secondary" 
              onClick={onUncheckAll}
              title={`Annuler le pointage des ${checkedInCount} tireurs pointés`}
            >
              ✗ Annuler tous
            </button>
          )}
          <button className="btn btn-primary" onClick={onAddFencer}>+ Ajouter un tireur</button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body flex gap-4">
          <input type="text" className="form-input" style={{ flex: 1 }}
            placeholder="Rechercher..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
          <select className="form-input form-select" style={{ width: '200px' }}
            value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="ranking">Par classement</option>
            <option value="name">Par nom</option>
            <option value="club">Par club</option>
          </select>
        </div>
      </div>

      {filteredFencers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🤺</div>
          <h2 className="empty-state-title">Aucun tireur</h2>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>N°</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Club</th>
                <th>Classement</th>
                <th>Statut</th>
                <th style={{ width: '250px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFencers.map((fencer) => (
                <tr key={fencer.id}>
                  <td className="text-muted">{fencer.ref}</td>
                  <td className="font-medium">{fencer.lastName}</td>
                  <td>{fencer.firstName}</td>
                  <td className="text-sm text-muted">{fencer.club || '-'}</td>
                  <td className="text-sm">{fencer.ranking ? `#${fencer.ranking}` : '-'}</td>
                  <td><span className={`badge ${statusLabels[fencer.status].color}`}>
                    {statusLabels[fencer.status].label}
                  </span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => setEditingFencer(fencer)}
                        title="Modifier"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        ✏️
                      </button>
                      <button 
                        className={`btn btn-sm ${fencer.status === FencerStatus.CHECKED_IN ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => onCheckIn(fencer.id)}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        {fencer.status === FencerStatus.CHECKED_IN ? 'Annuler' : 'Pointer'}
                      </button>
                      {onSetFencerStatus && fencer.status === FencerStatus.CHECKED_IN && (
                        <>
                          <button 
                            className="btn btn-sm btn-warning"
                            onClick={() => handleSetFencerStatus(
                              fencer.id, 
                              FencerStatus.ABANDONED, 
                              `${fencer.lastName} ${fencer.firstName} abandonne la compétition. Tous ses matchs restants seront perdus par forfait. Confirmer ?`
                            )}
                            title="Abandonner"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          >
                            🚶
                          </button>
                          <button 
                            className="btn btn-sm btn-warning"
                            onClick={() => handleSetFencerStatus(
                              fencer.id, 
                              FencerStatus.FORFAIT, 
                              `${fencer.lastName} ${fencer.firstName} déclare forfait pour la compétition. Tous ses matchs restants seront perdus. Confirmer ?`
                            )}
                            title="Forfait"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          >
                            📋
                          </button>
                        </>
                      )}
                      {onSetFencerStatus && (fencer.status === FencerStatus.ABANDONED || fencer.status === FencerStatus.FORFAIT) && (
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => handleSetFencerStatus(
                            fencer.id, 
                            FencerStatus.CHECKED_IN, 
                            `Réactiver ${fencer.lastName} ${fencer.firstName} ? Les matchs déjà terminés resteront inchangés.`
                          )}
                          title="Réactiver"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                        >
                          ✅
                        </button>
                      )}
                      {onDeleteFencer && (
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteFencer(fencer.id)}
                          title="Supprimer"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingFencer && (
        <EditFencerModal
          fencer={editingFencer}
          onSave={handleEditSave}
          onClose={() => setEditingFencer(null)}
        />
      )}
    </div>
  );
};

export default FencerList;
