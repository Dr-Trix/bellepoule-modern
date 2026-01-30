/**
 * BellePoule Modern - Competition List Component
 * Licensed under GPL-3.0
 */

import React from 'react';
import { Competition, Weapon, Gender, Category } from '../../shared/types';

interface CompetitionListProps {
  competitions: Competition[];
  isLoading: boolean;
  onSelect: (competition: Competition) => void;
  onDelete: (id: string) => void;
  onNewCompetition: () => void;
}

const weaponLabels: Record<Weapon, string> = {
  [Weapon.EPEE]: 'Épée',
  [Weapon.FOIL]: 'Fleuret',
  [Weapon.SABRE]: 'Sabre',
  [Weapon.LASER]: 'Sabre Laser',
};

const genderLabels: Record<Gender, string> = {
  [Gender.MALE]: 'Hommes',
  [Gender.FEMALE]: 'Dames',
  [Gender.MIXED]: 'Mixte',
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const CompetitionList: React.FC<CompetitionListProps> = ({
  competitions,
  isLoading,
  onSelect,
  onDelete,
  onNewCompetition,
}) => {
  if (isLoading) {
    return (
      <div className="content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="text-muted">Chargement...</div>
      </div>
    );
  }

  if (competitions.length === 0) {
    return (
      <div className="content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="empty-state">
          <div className="empty-state-icon">🤺</div>
          <h2 className="empty-state-title">Aucune compétition</h2>
          <p className="empty-state-description">
            Créez votre première compétition pour commencer
          </p>
          <button className="btn btn-primary btn-lg" onClick={onNewCompetition}>
            + Nouvelle compétition
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <h1 style={{ marginBottom: '1.5rem' }}>Compétitions</h1>
      
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {competitions.map((competition) => (
          <div 
            key={competition.id} 
            className="card"
            style={{ 
              borderLeft: `4px solid ${competition.color}`,
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onClick={() => onSelect(competition)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div className="card-body">
              <div className="flex justify-between items-center mb-2">
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                  {competition.title}
                </h3>
                <span className={`badge badge-${competition.status === 'completed' ? 'success' : competition.status === 'in_progress' ? 'warning' : 'info'}`}>
                  {competition.status === 'completed' ? 'Terminée' : 
                   competition.status === 'in_progress' ? 'En cours' : 'Brouillon'}
                </span>
              </div>
              
              <p className="text-sm text-muted mb-2">
                {formatDate(competition.date)}
              </p>
              
              <div className="flex gap-2 mb-4">
                <span className="badge badge-info">
                  {weaponLabels[competition.weapon]}
                </span>
                <span className="badge badge-info">
                  {genderLabels[competition.gender]}
                </span>
                <span className="badge badge-info">
                  {competition.category}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">
                  {competition.fencers?.length || 0} tireur(s)
                </span>
                <div className="flex gap-2">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Êtes-vous sûr de vouloir supprimer cette compétition ?')) {
                        onDelete(competition.id);
                      }
                    }}
                  >
                    Supprimer
                  </button>
                  <button className="btn btn-primary btn-sm">
                    Ouvrir →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetitionList;
