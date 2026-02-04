/**
 * BellePoule Modern - Internationalization Hook
 * Licensed under GPL-3.0
 */

import { useState, useEffect } from 'react';

export type Language = 'fr' | 'en' | 'br';
export type TranslationKey = string;

interface Translations {
  [key: string]: {
    [key: string]: string | any;
  };
}

const getFallbackTranslations = (language: Language): Translations => {
  // Traductions inline en cas de problème de chargement
  const fallbackTranslations: Record<Language, Translations> = {
    fr: {
      app: { title: "BellePoule Modern" },
      menu: {
        new_competition: "Nouvelle compétition",
        import: "Importer",
        export: "Exporter",
        competition_properties: "Propriétés de la compétition",
        report_issue: "Signaler un problème",
        quit: "Quitter"
      },
      competition: {
        new: "Nouvelle compétition",
        title: "Titre",
        date: "Date",
        location: "Lieu",
        organizer: "Organisateur",
        weapon: "Arme",
        gender: "Genre",
        category: "Catégorie"
      },
      actions: {
        create: "Créer",
        save: "Enregistrer",
        cancel: "Annuler",
        delete: "Supprimer",
        edit: "Modifier",
        add: "Ajouter",
        check_in: "Pointer",
        uncheck: "Dépointer",
        check_in_all: "Tout pointer",
        uncheck_all: "Tout dépointer"
      },
      fencer: {
        add: "Ajouter un tireur",
        first_name: "Prénom",
        last_name: "Nom",
        club: "Club",
        nationality: "Nationalité",
        license: "Licence",
        ranking: "Classement",
        points: "tireurs"
      },
      status: {
        checked_in: "Pointé",
        not_checked_in: "Non pointé",
        qualified: "Qualifié",
        eliminated: "Éliminé",
        abandoned: "Abandonné",
        excluded: "Exclu",
        forfeit: "Forfait"
      },
      messages: {
        confirm_delete_fencer: "Êtes-vous sûr de vouloir supprimer ce tireur ?",
        confirm_abandon: "Confirmer l'abandon de {{name}} ?",
        confirm_forfait: "Confirmer le forfait de {{name}} ?",
        confirm_reactivate: "Réactiver {{name}} ?"
      }
    },
    en: {
      app: { title: "BellePoule Modern" },
      menu: {
        new_competition: "New competition",
        import: "Import",
        export: "Export",
        competition_properties: "Competition properties",
        report_issue: "Report issue",
        quit: "Quit"
      },
      competition: {
        new: "New competition",
        title: "Title",
        date: "Date",
        location: "Location",
        organizer: "Organizer",
        weapon: "Weapon",
        gender: "Gender",
        category: "Category"
      },
      actions: {
        create: "Create",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        add: "Add",
        check_in: "Check in",
        uncheck: "Uncheck",
        check_in_all: "Check in all",
        uncheck_all: "Uncheck all"
      },
      fencer: {
        add: "Add fencer",
        first_name: "First name",
        last_name: "Last name",
        club: "Club",
        nationality: "Nationality",
        license: "License",
        ranking: "Ranking",
        points: "fencers"
      },
      status: {
        checked_in: "Checked in",
        not_checked_in: "Not checked in",
        qualified: "Qualified",
        eliminated: "Eliminated",
        abandoned: "Abandoned",
        excluded: "Excluded",
        forfeit: "Forfeit"
      },
      messages: {
        confirm_delete_fencer: "Are you sure you want to delete this fencer?",
        confirm_abandon: "Confirm abandon of {{name}}?",
        confirm_forfait: "Confirm forfeit of {{name}}?",
        confirm_reactivate: "Reactivate {{name}}?"
      }
    },
    br: {
      app: { title: "BellePoule Modern" },
      menu: {
        new_competition: "Nevezompetañ",
        import: "Importañ",
        export: "Ezporñ",
        competition_properties: "Perzhioùioù ar c'hoarzh",
        report_issue: "Danebenn ur pediñ",
        quit: "Kuitaat"
      },
      competition: {
        new: "Nevezompetañ",
        title: "Titl",
        date: "Deizad",
        location: "Lec'h",
        organizer: "Aozour",
        weapon: "Armo",
        gender: "Reizh",
        category: "Rummad"
      },
      actions: {
        create: "Krouiñ",
        save: "Enrollañ",
        cancel: "Nullañ",
        delete: "Dilemel",
        edit: "Embann",
        add: "Ouzhpennañ",
        check_in: "Boukañ",
        uncheck: "Digoumanañ",
        check_in_all: "Boukañ pep tra",
        uncheck_all: "Digoumanañ pep tra"
      },
      fencer: {
        add: "Ouzhpennañ ur c'hoarzer",
        first_name: "Anv-bihan",
        last_name: "Anv-familh",
        club: "Kleub",
        nationality: "Broadeliz",
        license: "Aotre",
        ranking: "Renk",
        points: "c'hoarzerien"
      },
      status: {
        checked_in: "Bouket",
        not_checked_in: "N'eo ket bouket",
        qualified: "Qualifiad",
        eliminated: "Dilemet",
        abandoned: "Dilezet",
        excluded: "Skarzhet",
        forfeit: "Dilez"
      },
      messages: {
        confirm_delete_fencer: "Ha sur oc'h da zilemel ar c'hoarzer-mañ ?",
        confirm_abandon: "Kadarnaat dilez {{name}} ?",
        confirm_forfait: "Kadarnaat forfeit {{name}} ?",
        confirm_reactivate: "Adunvan {{name}} ?"
      }
    }
  };
  
  return fallbackTranslations[language] || fallbackTranslations.fr;
};

const loadTranslations = async (language: Language): Promise<Translations> => {
  try {
    // Essayer de charger depuis les fichiers copiés par webpack
    const response = await fetch(`./locales/${language}.json`);
    if (response.ok) {
      const translations = await response.json();
      console.log(`✅ Loaded translations for ${language} from ./locales/${language}.json`);
      return translations;
    }
  } catch (error) {
    console.warn(`⚠️ Failed to load translations for ${language} from file:`, error);
  }
  
  // Fallback vers les traductions inline
  console.log(`📦 Using fallback translations for ${language}`);
  return getFallbackTranslations(language);
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
      console.warn(`Translation not found for key: ${key} (language: ${language})`, {
        availableKeys: Object.keys(translations),
        translations: translations
      });
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
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'br', name: 'Breton', flag: '🇫🇷' }
    ] as const
  };
};