/**
 * BellePoule Modern - Language Selector Component
 * Licensed under GPL-3.0
 */
import React from 'react';
interface LanguageSelectorProps {
    className?: string;
    showLabel?: boolean;
    onLanguageChange?: (language: 'fr' | 'en' | 'br') => void;
    value?: 'fr' | 'en' | 'br';
}
declare const LanguageSelector: React.FC<LanguageSelectorProps>;
export default LanguageSelector;
//# sourceMappingURL=LanguageSelector.d.ts.map