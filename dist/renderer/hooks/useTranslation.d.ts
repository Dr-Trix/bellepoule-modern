/**
 * BellePoule Modern - Internationalization Hook
 * Licensed under GPL-3.0
 */
export type Language = 'fr' | 'en' | 'br';
export type TranslationKey = string;
export declare const useTranslation: () => {
    language: Language;
    changeLanguage: (newLanguage: Language) => Promise<void>;
    t: (key: TranslationKey, params?: {
        [key: string]: string | number;
    }) => string;
    isLoading: boolean;
    availableLanguages: readonly [{
        readonly code: "fr";
        readonly name: "Français";
        readonly flag: "🇫🇷";
    }, {
        readonly code: "en";
        readonly name: "English";
        readonly flag: "🇺🇸";
    }, {
        readonly code: "br";
        readonly name: "Breton";
        readonly flag: "🇫🇷";
    }];
};
//# sourceMappingURL=useTranslation.d.ts.map