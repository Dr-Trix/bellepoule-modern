/**
 * BellePoule Modern - Export des tireurs aux formats TXT et FFF
 * Licensed under GPL-3.0
 */

import { Fencer, Gender } from '../types';

/**
 * Formate une date au format DD/MM/YYYY pour l'export FFF
 */
function formatDateFFF(date?: Date): string {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Convertit le genre interne vers le format FFF (M/F)
 */
function genderToFFF(gender: Gender): string {
  switch (gender) {
    case Gender.MALE: return 'M';
    case Gender.FEMALE: return 'F';
    default: return '';
  }
}

/**
 * Exporte la liste des tireurs au format FFF (FFE - Federation Francaise d'Escrime)
 * Format: NOM;PRENOM;SEXE;DATE_NAISSANCE;NATION;LIGUE;CLUB;LICENCE;CLASSEMENT
 */
export function exportFencersToFFF(fencers: Fencer[]): string {
  const lines: string[] = [];

  // En-tete standard FFF
  lines.push('NOM;PRENOM;SEXE;DATE_NAISSANCE;NATION;LIGUE;CLUB;LICENCE;CLASSEMENT');

  for (const fencer of fencers) {
    const fields = [
      fencer.lastName.toUpperCase(),
      fencer.firstName,
      genderToFFF(fencer.gender),
      formatDateFFF(fencer.birthDate),
      fencer.nationality || '',
      fencer.league || '',
      fencer.club || '',
      fencer.license || '',
      fencer.ranking != null ? String(fencer.ranking) : '',
    ];
    lines.push(fields.join(';'));
  }

  return lines.join('\n');
}

/**
 * Exporte la liste des tireurs au format TXT (texte lisible)
 * Format tabulaire avec colonnes alignees
 */
export function exportFencersToTXT(fencers: Fencer[], title?: string): string {
  const lines: string[] = [];

  // Titre
  if (title) {
    lines.push(title);
    lines.push('='.repeat(title.length));
    lines.push('');
  }

  lines.push(`Nombre de tireurs : ${fencers.length}`);
  lines.push('');

  if (fencers.length === 0) {
    lines.push('Aucun tireur.');
    return lines.join('\n');
  }

  // En-tete du tableau
  const header = [
    padRight('N\u00b0', 5),
    padRight('Nom', 20),
    padRight('Pr\u00e9nom', 15),
    padRight('Sexe', 6),
    padRight('N\u00e9(e)', 12),
    padRight('Nation', 7),
    padRight('Club', 25),
    padRight('Licence', 12),
    padRight('Classement', 10),
  ].join(' ');

  lines.push(header);
  lines.push('-'.repeat(header.length));

  for (const fencer of fencers) {
    const birthYear = fencer.birthDate
      ? (fencer.birthDate instanceof Date ? fencer.birthDate : new Date(fencer.birthDate)).getFullYear().toString()
      : '-';

    const line = [
      padRight(String(fencer.ref), 5),
      padRight(fencer.lastName.toUpperCase(), 20),
      padRight(fencer.firstName, 15),
      padRight(genderToFFF(fencer.gender) || '-', 6),
      padRight(birthYear, 12),
      padRight(fencer.nationality || '-', 7),
      padRight(fencer.club || '-', 25),
      padRight(fencer.license || '-', 12),
      padRight(fencer.ranking != null ? `#${fencer.ranking}` : '-', 10),
    ].join(' ');

    lines.push(line);
  }

  lines.push('');
  lines.push(`--- Fin de la liste (${fencers.length} tireurs) ---`);

  return lines.join('\n');
}

function padRight(str: string, len: number): string {
  if (str.length >= len) return str.substring(0, len);
  return str + ' '.repeat(len - str.length);
}
