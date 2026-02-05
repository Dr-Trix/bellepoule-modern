/**
 * BellePoule Modern - FFE/TXT File Parser
 * Parse FFE and simple TXT format files for fencer import
 * Licensed under GPL-3.0
 */
import { Fencer } from '../types';
export interface ImportResult {
    success: boolean;
    fencers: Partial<Fencer>[];
    errors: string[];
    warnings: string[];
}
/**
 * Parse un fichier FFE (.fff ou CSV) ou TXT simple
 * Formats supportés:
 * - Standard FFE: NOM;PRENOM;SEXE;DATE_NAISSANCE;NATION;LIGUE;CLUB;LICENCE;CLASSEMENT
 * - Format mixte: NOM,PRENOM,DATE,SEXE,NATION;LIGUE;CLUB;LICENCE;CLASSEMENT
 * - Format TXT simple: NOM PRENOM ou NOM;PRENOM ou autres variations
 */
/**
 * Parse un fichier texte simple (format flexible)
 */
export declare function parseSimpleTXTFile(content: string): ImportResult;
export declare function parseFFEFile(content: string): ImportResult;
/**
 * Parse un fichier XML BellePoule
 */
export declare function parseXMLFile(content: string): ImportResult;
/**
 * Parse un fichier de classement FFE
 */
export declare function parseRankingFile(content: string): Map<string, number>;
//# sourceMappingURL=fileParser.d.ts.map