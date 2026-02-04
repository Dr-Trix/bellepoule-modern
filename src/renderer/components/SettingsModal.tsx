/**
 * BellePoule Modern - Settings Modal Component
 * Licensed under GPL-3.0
 */

import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSelector from './LanguageSelector';

interface SettingsModalProps {
  onClose: () => void;
  onSave: (settings: any) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onSave }) => {
  const { t, language, changeLanguage } = useTranslation();
  const [settings, setSettings] = useState({
    language: language,
    // Ajouter d'autres paramètres ici
  });

  const handleLanguageChange = (newLanguage: 'fr' | 'en' | 'br') => {
    setSettings(prev => ({ ...prev, language: newLanguage }));
  };

  const handleSave = () => {
    // Appliquer le changement de langue seulement à la sauvegarde
    if (settings.language !== language) {
      changeLanguage(settings.language);
    }
    onSave(settings);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2 className="modal-title">{t('settings.title')}</h2>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <LanguageSelector 
              showLabel={true} 
              value={settings.language}
              onLanguageChange={handleLanguageChange}
            />
          </div>
          
          {/* Ajouter d'autres paramètres ici */}
          <div className="form-group">
            <label>{t('settings.theme')}</label>
            <select className="form-select">
              <option>Default</option>
              <option>Dark</option>
              <option>Light</option>
            </select>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            {t('actions.cancel')}
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            {t('settings.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;