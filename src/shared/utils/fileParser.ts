/**
 * BellePoule Modern - FFE File Parser
 * Parse FFE format files (.fff, .csv) for fencer import
 * Licensed under GPL-3.0
 */

import { Fencer, FencerStatus, Gender } from '../types';

export interface ImportResult {
  success: boolean;
  fencers: Partial<Fencer>[];
  errors: string[];
  warnings: string[];
}

/**
 * Parse un fichier FFE (.fff ou CSV)
 * Format FFE typique: NOM;PRENOM;SEXE;DATE_NAISSANCE;NATION;LIGUE;CLUB;LICENCE;CLASSEMENT
 */
export function parseFFEFile(content: string): ImportResult {
  const result: ImportResult = {
    success: false,
    fencers: [],
    errors: [],
    warnings: [],
  };

  // Nettoyer le contenu (BOM, caractères spéciaux)
  let cleanContent = content;
  // Supprimer BOM UTF-8
  if (cleanContent.charCodeAt(0) === 0xFEFF) {
    cleanContent = cleanContent.slice(1);
  }
  // Supprimer BOM UTF-16
  cleanContent = cleanContent.replace(/^\uFFFE/, '').replace(/^\uFEFF/, '');

  const lines = cleanContent.split(/\r?\n/).filter(line => line.trim());
  
  if (lines.length === 0) {
    result.errors.push('Le fichier est vide');
    return result;
  }

  // Détecter le séparateur en analysant plusieurs lignes
  const separator = detectSeparator(lines);
  console.log(`Séparateur détecté: "${separator}" (code: ${separator.charCodeAt(0)})`);

  // Vérifier si la première ligne est un en-tête
  const firstLineLower = lines[0].toLowerCase();
  const hasHeader = firstLineLower.includes('nom') || 
                   firstLineLower.includes('name') ||
                   firstLineLower.includes('prenom') ||
                   firstLineLower.includes('prénom') ||
                   firstLineLower.includes('firstname') ||
                   firstLineLower.includes('lastname');

  const startIndex = hasHeader ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parser la ligne avec le séparateur détecté
    const parts = parseLine(line, separator);
    
    console.log(`Ligne ${i + 1}: ${parts.length} colonnes - ${parts.slice(0, 3).join(' | ')}`);
    
    try {
      const fencer = parseFFELine(parts, i + 1);
      if (fencer) {
        result.fencers.push(fencer);
      }
    } catch (error) {
      result.warnings.push(`Ligne ${i + 1}: ${error}`);
    }
  }

  result.success = result.fencers.length > 0;
  return result;
}

/**
 * Détecte le séparateur le plus probable dans le fichier
 */
function detectSeparator(lines: string[]): string {
  const separators = [';', '\t', ',', '|'];
  const scores: { [key: string]: number } = {};
  
  // Analyser les premières lignes (max 10)
  const linesToCheck = lines.slice(0, Math.min(10, lines.length));
  
  for (const sep of separators) {
    scores[sep] = 0;
    const counts: number[] = [];
    
    for (const line of linesToCheck) {
      const count = line.split(sep).length - 1;
      counts.push(count);
    }
    
    // Bon séparateur = même nombre de séparateurs sur chaque ligne ET > 1
    if (counts.length > 0 && counts[0] >= 1) {
      const allSame = counts.every(c => c === counts[0]);
      if (allSame) {
        scores[sep] = counts[0] * 10; // Bonus pour consistance
      } else {
        // Au moins vérifier le minimum
        scores[sep] = Math.min(...counts);
      }
    }
  }
  
  // Trouver le meilleur séparateur
  let bestSep = ';';
  let bestScore = 0;
  
  for (const sep of separators) {
    if (scores[sep] > bestScore) {
      bestScore = scores[sep];
      bestSep = sep;
    }
  }
  
  // Si aucun bon séparateur trouvé, essayer point-virgule par défaut (FFE)
  return bestScore > 0 ? bestSep : ';';
}

/**
 * Parse une ligne en gérant les guillemets
 */
function parseLine(line: string, separator: string): string[] {
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (!inQuotes && (char === '"' || char === "'")) {
      inQuotes = true;
      quoteChar = char;
    } else if (inQuotes && char === quoteChar) {
      inQuotes = false;
      quoteChar = '';
    } else if (!inQuotes && char === separator) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Ajouter le dernier élément
  parts.push(current.trim());
  
  // Nettoyer les guillemets restants
  return parts.map(p => p.replace(/^["']|["']$/g, '').trim());
}

function parseFFELine(parts: string[], lineNumber: number): Partial<Fencer> | null {
  // Format minimal: NOM, PRENOM
  if (parts.length < 2) {
    throw new Error('Format invalide - au moins NOM et PRENOM requis');
  }

  const lastName = parts[0]?.toUpperCase() || '';
  const firstName = parts[1] || '';

  if (!lastName || !firstName) {
    throw new Error('NOM ou PRENOM manquant');
  }

  // Détecter le sexe
  let gender: Gender = Gender.MIXED;
  const genderField = parts[2]?.toUpperCase() || '';
  if (genderField === 'M' || genderField === 'H' || genderField === 'HOMME' || genderField === 'MALE') {
    gender = Gender.MALE;
  } else if (genderField === 'F' || genderField === 'FEMME' || genderField === 'FEMALE' || genderField === 'D' || genderField === 'DAME') {
    gender = Gender.FEMALE;
  }

  // Date de naissance
  let birthDate: Date | undefined;
  if (parts[3]) {
    const dateStr = parts[3];
    // Essayer différents formats de date
    const dateMatch = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]) - 1;
      let year = parseInt(dateMatch[3]);
      if (year < 100) year += year > 50 ? 1900 : 2000;
      birthDate = new Date(year, month, day);
    }
  }

  return {
    lastName,
    firstName,
    gender,
    birthDate,
    nationality: parts[4] || 'FRA',
    league: parts[5] || undefined,
    club: parts[6] || undefined,
    license: parts[7] || undefined,
    ranking: parts[8] ? parseInt(parts[8]) || undefined : undefined,
    status: FencerStatus.NOT_CHECKED_IN,
  };
}

/**
 * Parse un fichier XML BellePoule
 */
export function parseXMLFile(content: string): ImportResult {
  const result: ImportResult = {
    success: false,
    fencers: [],
    errors: [],
    warnings: [],
  };

  try {
    // Parse simple du XML (sans DOMParser côté Node)
    const tireurMatches = content.matchAll(/<Tireur[^>]*>/g);
    
    for (const match of tireurMatches) {
      const tag = match[0];
      
      const getName = (attr: string): string => {
        const m = tag.match(new RegExp(`${attr}="([^"]*)"`));
        return m ? m[1] : '';
      };

      const lastName = getName('Nom');
      const firstName = getName('Prenom');
      
      if (lastName && firstName) {
        const genderStr = getName('Sexe');
        let gender: Gender = Gender.MIXED;
        if (genderStr === 'M') gender = Gender.MALE;
        else if (genderStr === 'F') gender = Gender.FEMALE;

        result.fencers.push({
          lastName: lastName.toUpperCase(),
          firstName,
          gender,
          nationality: getName('Nation') || 'FRA',
          league: getName('Ligue') || undefined,
          club: getName('Club') || undefined,
          license: getName('Licence') || undefined,
          ranking: parseInt(getName('Classement')) || undefined,
          status: FencerStatus.NOT_CHECKED_IN,
        });
      }
    }

    result.success = result.fencers.length > 0;
  } catch (error) {
    result.errors.push(`Erreur de parsing XML: ${error}`);
  }

  return result;
}

/**
 * Parse un fichier de classement FFE
 */
export function parseRankingFile(content: string): Map<string, number> {
  const rankings = new Map<string, number>();
  
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  
  for (const line of lines) {
    // Format: RANG;NOM;PRENOM;... ou NOM;PRENOM;RANG
    const parts = line.split(/[;,\t]/).map(p => p.trim());
    
    // Chercher un numéro de classement
    for (let i = 0; i < parts.length; i++) {
      const rank = parseInt(parts[i]);
      if (!isNaN(rank) && rank > 0 && rank < 10000) {
        // Le nom est probablement avant ou après
        const nameIndex = i === 0 ? 1 : 0;
        if (parts[nameIndex]) {
          const key = parts[nameIndex].toUpperCase();
          rankings.set(key, rank);
        }
        break;
      }
    }
  }
  
  return rankings;
}
