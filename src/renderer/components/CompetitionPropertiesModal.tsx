/**
 * BellePoule Modern - Competition Properties Modal
 * Licensed under GPL-3.0
 */

import React, { useState, useEffect } from 'react';
import { Competition, Weapon, Gender, Category } from '../../shared/types';

interface CompetitionPropertiesModalProps {
  competition: Competition;
  onSave: (updates: Partial<Competition>) => void;
  onClose: () => void;
}

const CompetitionPropertiesModal: React.FC<CompetitionPropertiesModalProps> = ({
  competition,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(competition.title);
  const [date, setDate] = useState(competition.date.toISOString().split('T')[0]);
  const [location, setLocation] = useState(competition.location || '');
  const [organizer, setOrganizer] = useState(competition.organizer || '');
  const [weapon, setWeapon] = useState<Weapon>(competition.weapon);
  const [gender, setGender] = useState<Gender>(competition.gender);
  const [category, setCategory] = useState<Category>(competition.category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      date: new Date(date),
      location,
      organizer,
      weapon,
      gender,
      category,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Propriétés de la compétition</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="title">Titre</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Lieu</label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="organizer">Organisateur</label>
            <input
              type="text"
              id="organizer"
              value={organizer}
              onChange={e => setOrganizer(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="weapon">Arme</label>
              <select
                id="weapon"
                value={weapon}
                onChange={e => setWeapon(e.target.value as Weapon)}
              >
                <option value="E">Épée</option>
                <option value="F">Fleuret</option>
                <option value="S">Sabre</option>
                <option value="L">Sabre Laser</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="gender">Genre</label>
              <select
                id="gender"
                value={gender}
                onChange={e => setGender(e.target.value as Gender)}
              >
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
                <option value="X">Mixte</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Catégorie</label>
              <select
                id="category"
                value={category}
                onChange={e => setCategory(e.target.value as Category)}
              >
                <option value="U11">U11 (Poussin)</option>
                <option value="U13">U13 (Benjamin)</option>
                <option value="U15">U15 (Minime)</option>
                <option value="U17">U17 (Cadet)</option>
                <option value="U20">U20 (Junior)</option>
                <option value="SEN">Senior</option>
                <option value="V1">Vétéran 1 (40-49)</option>
                <option value="V2">Vétéran 2 (50-59)</option>
                <option value="V3">Vétéran 3 (60-69)</option>
                <option value="V4">Vétéran 4 (70+)</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompetitionPropertiesModal;
