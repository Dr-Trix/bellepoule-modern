/**
 * BellePoule Modern - Internationalization Hook
 * Licensed under GPL-3.0
 */

import { useState, useEffect } from 'react';

export type Language = 'fr' | 'en';
export type TranslationKey = string;

interface Translations {
  [key: string]: {
    [key: string]: string | any;
  };
}

const loadTranslations = async (language: Language): Promise<Translations> => {
  try {
    const response = await fetch(`./locales/${language}.json`);
    const translations = await response.json();
    return translations;
  } catch (error) {
    console.error(`Failed to load translations for ${language}:`, error);
    return {};
  }
};

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>('fr');
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeTranslations = async () => {
      // Charger la langue sauvegardée
      const savedLanguage = localStorage.getItem('bellepoule-language') as Language;
      const initialLanguage = savedLanguage || 'fr';
      
      setLanguage(initialLanguage);
      
      // Charger les traductions
      const loadedTranslations = await loadTranslations(initialLanguage);
      setTranslations(loadedTranslations);
      setIsLoading(false);
    };

    initializeTranslations();
  }, []);

  const changeLanguage = async (newLanguage: Language) => {
    setIsLoading(true);
    
    try {
      const loadedTranslations = await loadTranslations(newLanguage);
      setLanguage(newLanguage);
      setTranslations(loadedTranslations);
      localStorage.setItem('bellepoule-language', newLanguage);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const t = (key: TranslationKey, params?: { [key: string]: string | number }): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }
    
    // Remplacer les paramètres
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return String(params[paramKey] || match);
      });
    }
    
    return value;
  };

  return {
    language,
    changeLanguage,
    t,
    isLoading,
    availableLanguages: [
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'en', name: 'English', flag: '🇺🇸' }
    ] as const
  };
};