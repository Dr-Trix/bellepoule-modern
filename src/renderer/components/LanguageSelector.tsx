/**
 * BellePoule Modern - Language Selector Component
 * Licensed under GPL-3.0
 */

import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface LanguageSelectorProps {
  className?: string;
  showLabel?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '', showLabel = true }) => {
  const { language, changeLanguage, availableLanguages, isLoading } = useTranslation();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value as 'fr' | 'en' | 'br';
    changeLanguage(newLanguage);
  };

  if (isLoading) {
    return (
      <div className={`language-selector ${className}`}>
        {showLabel && <span>Chargement...</span>}
      </div>
    );
  }

  return (
    <div className={`language-selector ${className}`}>
      {showLabel && (
        <label htmlFor="language-select">
          Langue :
        </label>
      )}
      <select
        id="language-select"
        value={language}
        onChange={handleLanguageChange}
        className="form-select"
        style={{ minWidth: '120px' }}
      >
        {availableLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;