"use strict";
/**
 * BellePoule Modern - Internationalization Hook
 * Licensed under GPL-3.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTranslation = void 0;
const react_1 = require("react");
const getFallbackTranslations = (language) => {
    // Traductions inline en cas de problème de chargement
    const fallbackTranslations = {
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
            settings: {
                title: "Paramètres",
                language: "Langue",
                theme: "Thème",
                save: "Enregistrer les paramètres"
            },
            messages: {
                no_competitions: "Aucune compétition",
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
            settings: {
                title: "Settings",
                language: "Language",
                theme: "Theme",
                save: "Save Settings"
            },
            messages: {
                no_competitions: "No competitions",
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
            settings: {
                title: "Arventennoù",
                language: "Yezh",
                theme: "Tem",
                save: "Enrollañ an arventennoù"
            },
            messages: {
                no_competitions: "Hini kenstrrenn",
                confirm_delete_fencer: "Ha sur oc'h da zilemel ar c'hoarzer-mañ ?",
                confirm_abandon: "Kadarnaat dilez {{name}} ?",
                confirm_forfait: "Kadarnaat forfeit {{name}} ?",
                confirm_reactivate: "Adunvan {{name}} ?"
            }
        }
    };
    return fallbackTranslations[language] || fallbackTranslations.fr;
};
const loadTranslations = async (language) => {
    try {
        // Essayer de charger depuis les fichiers copiés par webpack
        const response = await fetch(`./locales/${language}.json`);
        if (response.ok) {
            const translations = await response.json();
            console.log(`✅ Loaded translations for ${language} from ./locales/${language}.json`);
            return translations;
        }
    }
    catch (error) {
        console.warn(`⚠️ Failed to load translations for ${language} from file:`, error);
    }
    // Fallback vers les traductions inline
    console.log(`📦 Using fallback translations for ${language}`);
    return getFallbackTranslations(language);
};
const applyTheme = (theme) => {
    // Supprimer toutes les classes de thème
    document.body.classList.remove('theme-dark', 'theme-light', 'theme-default');
    // Ajouter la nouvelle classe de thème
    if (theme !== 'default') {
        document.body.classList.add(`theme-${theme}`);
    }
    console.log(`🎨 Applied theme: ${theme}`);
};
const useTranslation = () => {
    const [language, setLanguage] = (0, react_1.useState)('fr');
    const [theme, setTheme] = (0, react_1.useState)('default');
    const [translations, setTranslations] = (0, react_1.useState)({});
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const initializeTranslations = async () => {
            // Forcer le français par défaut
            console.log('🔍 Initializing translations...');
            // Charger la langue sauvegardée
            const savedLanguage = localStorage.getItem('bellepoule-language');
            const initialLanguage = savedLanguage || 'fr';
            // Charger le thème sauvegardé
            const savedTheme = localStorage.getItem('bellepoule-theme');
            const initialTheme = savedTheme || 'default';
            console.log(`🌍 Saved language: ${savedLanguage}, Initial language: ${initialLanguage}`);
            console.log(`🎨 Saved theme: ${savedTheme}, Initial theme: ${initialTheme}`);
            setLanguage(initialLanguage);
            setTheme(initialTheme);
            // Appliquer le thème
            applyTheme(initialTheme);
            // Charger les traductions
            const loadedTranslations = await loadTranslations(initialLanguage);
            console.log(`📦 Loaded ${Object.keys(loadedTranslations).length} translation keys`);
            setTranslations(loadedTranslations);
            setIsLoading(false);
        };
        initializeTranslations();
    }, []);
    const changeLanguage = async (newLanguage) => {
        console.log(`🌍 Changing language from ${language} to ${newLanguage}`);
        setIsLoading(true);
        try {
            const loadedTranslations = await loadTranslations(newLanguage);
            console.log(`📦 Loaded ${Object.keys(loadedTranslations).length} translation keys for ${newLanguage}`);
            setLanguage(newLanguage);
            setTranslations(loadedTranslations);
            localStorage.setItem('bellepoule-language', newLanguage);
            console.log(`✅ Language changed successfully to ${newLanguage}`);
        }
        catch (error) {
            console.error('Failed to change language:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const changeTheme = (newTheme) => {
        console.log(`🎨 Changing theme from ${theme} to ${newTheme}`);
        setTheme(newTheme);
        applyTheme(newTheme);
        localStorage.setItem('bellepoule-theme', newTheme);
        console.log(`✅ Theme changed successfully to ${newTheme}`);
    };
    const t = (key, params) => {
        const keys = key.split('.');
        let value = translations;
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
        theme,
        changeLanguage,
        changeTheme,
        t,
        isLoading,
        availableLanguages: [
            { code: 'fr', name: 'Français', flag: '🇫🇷' },
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'br', name: 'Breton', flag: '🇫🇷' }
        ],
        availableThemes: [
            { code: 'default', name: 'Default' },
            { code: 'light', name: 'Light' },
            { code: 'dark', name: 'Dark' }
        ]
    };
};
exports.useTranslation = useTranslation;
//# sourceMappingURL=useTranslation.js.map