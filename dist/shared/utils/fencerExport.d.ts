/**
 * BellePoule Modern - Export des tireurs aux formats TXT et FFF
 * Licensed under GPL-3.0
 */
import { Fencer } from '../types';
/**
 * Exporte la liste des tireurs au format FFF (FFE - Federation Francaise d'Escrime)
 * Format: NOM;PRENOM;SEXE;DATE_NAISSANCE;NATION;LIGUE;CLUB;LICENCE;CLASSEMENT
 */
export declare function exportFencersToFFF(fencers: Fencer[]): string;
/**
 * Exporte la liste des tireurs au format TXT (texte lisible)
 * Format tabulaire avec colonnes alignees
 */
export declare function exportFencersToTXT(fencers: Fencer[], title?: string): string;
//# sourceMappingURL=fencerExport.d.ts.map