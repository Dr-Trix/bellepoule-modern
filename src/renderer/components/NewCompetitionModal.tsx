/**
 * BellePoule Modern - New Competition Modal
 * Licensed under GPL-3.0
 */

import React, { useState } from 'react';
import { Competition, Weapon, Gender, Category } from '../../shared/types';

interface NewCompetitionModalProps {
  onClose: () => void;
  onCreate: (data: Partial<Competition>) => void;
}

const NewCompetitionModal: React.FC<NewCompetitionModalProps> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weapon, setWeapon] = useState<Weapon>(Weapon.EPEE);
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [category, setCategory] = useState<Category>(Category.SENIOR);
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onCreate({
      title: title || `Compétition du ${new Date(date).toLocaleDateString('fr-FR')}`,
      date: new Date(date),
      weapon,
      gender,
      category,
      location,
      color: getRandomColor(),
    });
  };

  const getRandomColor = () => {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Nouvelle compétition</h2>
          <button 
            className="btn btn-icon btn-secondary" 
            onClick={onClose}
            style={{ padding: '0.25rem' }}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Titre de la compétition</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Championnat Régional"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Arme</label>
                <select
                  className="form-input form-select"
                  value={weapon}
                  onChange={(e) => setWeapon(e.target.value as Weapon)}
                >
                  <option value={Weapon.EPEE}>Épée</option>
                  <option value={Weapon.FOIL}>Fleuret</option>
                  <option value={Weapon.SABRE}>Sabre</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Genre</label>
                <select
                  className="form-input form-select"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                >
                  <option value={Gender.MALE}>Hommes</option>
                  <option value={Gender.FEMALE}>Dames</option>
                  <option value={Gender.MIXED}>Mixte</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Catégorie</label>
                <select
                  className="form-input form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                >
                  <option value={Category.U11}>U11 (Poussins)</option>
                  <option value={Category.U13}>U13 (Benjamins)</option>
                  <option value={Category.U15}>U15 (Minimes)</option>
                  <option value={Category.U17}>U17 (Cadets)</option>
                  <option value={Category.U20}>U20 (Juniors)</option>
                  <option value={Category.SENIOR}>Seniors</option>
                  <option value={Category.VETERAN}>Vétérans</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Lieu (optionnel)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Gymnase Jean Moulin, Paris"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Créer la compétition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCompetitionModal;
