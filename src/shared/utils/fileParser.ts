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
 * Formats supportés:
 * - Standard FFE: NOM;PRENOM;SEXE;DATE_NAISSANCE;NATION;LIGUE;CLUB;LICENCE;CLASSEMENT
 * - Format mixte: NOM,PRENOM,DATE,SEXE,NATION;LIGUE;CLUB;LICENCE;CLASSEMENT
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

  // Détecter le format et le(s) séparateur(s)
  const formatInfo = detectFormat(lines);
  console.log(`Format détecté: ${formatInfo.type}`);
  console.log(`Séparateur principal: "${formatInfo.primarySeparator}"`);
  console.log(`Première ligne: ${lines[0]}`);

  // Vérifier si la première ligne est un en-tête
  const firstLineLower = lines[0].toLowerCase();
  const firstLineParts = parseLine(lines[0], formatInfo.primarySeparator);
  
  // Détection plus robuste d'en-tête
  const hasHeader = 
    // Vérification par mots-clés classiques
    firstLineLower.includes('nom') || 
    firstLineLower.includes('name') ||
    firstLineLower.includes('prenom') ||
    firstLineLower.includes('prénom') ||
    firstLineLower.includes('firstname') ||
    firstLineLower.includes('lastname') ||
    // Vérification format FFF spécial (commence par FFF, UTF8, etc.)
    firstLineLower.includes('fff') ||
    firstLineLower.includes('utf8') ||
    (firstLineParts.length >= 3 && 
     ['fff', 'utf8', 'utf-8', 'x', '-', 'nom', 'prenom', 'sexe', 'club', 'classement'].some(keyword => 
       firstLineParts.some(part => part.toLowerCase().includes(keyword))
     )) ||
    // Vérification par structure (tous les champs sont des mots)
    firstLineParts.every(part => /^[a-zA-ZÀ-ÿ\s\-]+$/.test(part)) ||
    // Vérification par nombre de champs (typiquement 8-10 champs pour en-tête)
    (firstLineParts.length >= 8 && firstLineParts.length <= 10);

  const startIndex = hasHeader ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Ignorer les lignes qui ne contiennent que des séparateurs ou des métadonnées
    if (/^[\t\s\-]+$/g.test(line) || 
        line.toLowerCase().includes('fff') ||
        line.toLowerCase().includes('utf8') ||
        line.split(/[;\t,]/).filter(p => p.trim()).length < 2) {
      continue;
    }

    // Parser la ligne avec le format détecté
    const parts = parseLineWithFormat(line, formatInfo);
    
    console.log(`Ligne ${i + 1}: ${parts.length} colonnes - ${parts.slice(0, 3).join(' | ')}`);
    
    try {
      const fencer = parseFFELine(parts, i + 1, formatInfo.type);
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

interface FormatInfo {
  type: 'standard' | 'mixed';
  primarySeparator: string;
  secondarySeparator?: string;
}

/**
  * Détecte le format du fichier FFE
  */
function detectFormat(lines: string[]): FormatInfo {
  // Ignorer les lignes d'en-tête pour l'analyse de format
  const dataLines = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed && 
           !trimmed.toLowerCase().includes('fff') && 
           !trimmed.toLowerCase().includes('utf8') &&
           !trimmed.toLowerCase().includes('nom') &&
           !trimmed.toLowerCase().includes('classem') &&
           !trimmed.includes('✓') &&
           // Ignorer les lignes qui ne contiennent que des points-virgules et des chiffres (dates)
           !(/^[\d\/;]+$/.test(trimmed));
  });
  
  if (dataLines.length === 0) {
    // Fallback : utiliser première ligne
    dataLines.push(lines[0]);
  }
  
  const dataLine = dataLines[0];
  
  // Détecter le nouveau format FFF standard : NOM,Prénom,Naissance,Sexe,Nationalité;?,?,?;Licence,Ligue,Club,Classement,?;
  if (dataLine.includes(',') && dataLine.includes(';')) {
    const parts = dataLine.split(';');
    const commaCount = (dataLine.match(/,/g) || []).length;
    const semicolonCount = (dataLine.match(/;/g) || []).length;
    
    // Format FFF standard: 4 virgules dans première section (NOM,Prénom,Naissance,Sexe,Nationalité)
    // et 4+ sections séparées par points-virgules
    if (parts.length >= 4 && commaCount >= 3 && semicolonCount >= 3) {
      // Vérifier si la première section a exactement 4 virgules (5 champs)
      const firstSectionCommas = (parts[0].match(/,/g) || []).length;
      if (firstSectionCommas === 4) {
        console.log('Format FFF standard détecté: NOM,Prénom,Naissance,Sexe,Nationalité;?,?,?;Licence,Ligue,Club,Classement,?;');
        return {
          type: 'mixed',
          primarySeparator: ';',
          secondarySeparator: ','
        };
      }
    }
    
    // Format FFF caractéristique: 5+ virgules et 3+ points-virgules
    if (commaCount >= 4 && semicolonCount >= 3 && parts.length >= 4) {
      console.log('Format FFF standard détecté: structure en sections avec points-virgules');
      return {
        type: 'mixed',
        primarySeparator: ';',
        secondarySeparator: ','
      };
    }
    
    // Cas spécial : tout dans une colonne avec virgules
    if (commaCount >= 3 && commaCount <= 6 && semicolonCount <= 1) {
      console.log('Format FFF compact détecté: toutes les infos dans une colonne séparées par virgules');
      return {
        type: 'mixed',
        primarySeparator: ',',  // Utiliser les virgules comme séparateur principal
        secondarySeparator: ','
      };
    }
  }
  
  // Détecter si c'est un fichier FFF standard avec première virgule = séparateur NOM/PRÉNOM
  // Format caractéristique: NOM,PRENOM,DATE,SEXE,NATION;LIGUE;CLUB;LICENCE;...
  if (dataLine.includes(',') && dataLine.includes(';')) {
    // Vérifier si la structure correspond au format FFF standard
    const parts = dataLine.split(';');
    if (parts.length >= 2 && parts[0].includes(',')) {
      // Vérifier si on a le bon nombre de virgules dans la première section
      const firstSectionCommas = (parts[0].match(/,/g) || []).length;
      // Format FFF typique: NOM,PRENOM,DATE,SEXE,NATION (4 virgules)
      if (firstSectionCommas >= 3 && firstSectionCommas <= 5) {
        console.log('Format FFF détecté: première virgule = séparateur NOM/PRÉNOM');
        return {
          type: 'mixed',
          primarySeparator: ';',
          secondarySeparator: ','
        };
      }
    }
  }
  
  // Détecter si c'est le format où seule la première partie utilise des virgules
  const parts = dataLine.split(';');
  if (parts.length >= 2 && parts[0].includes(',')) {
    console.log('Format mixte détecté: virgules dans première section, points-virgules ensuite');
    return {
      type: 'mixed',
      primarySeparator: ';',
      secondarySeparator: ','
    };
  }
  
  // Détecter si le format utilise des virgules dans une structure tabulaire
  if (dataLine.includes(',') && dataLine.includes('\t')) {
    console.log('Format mixte détecté: virgules dans les données, tabulations comme séparateurs de tableaux');
    return {
      type: 'mixed',
      primarySeparator: '\t',
      secondarySeparator: ','
    };
  }
  
  // Format standard avec un seul séparateur
  const separator = detectSeparator(lines);
  console.log(`Format standard détecté avec séparateur: "${separator}"`);
  return {
    type: 'standard',
    primarySeparator: separator
  };
}

/**
 * Parse une ligne en fonction du format détecté
 */
function parseLineWithFormat(line: string, formatInfo: FormatInfo): string[] {
  if (formatInfo.type === 'mixed' && formatInfo.secondarySeparator) {
    // Cas spécial: tout est séparé par virgules (format FFF compact)
    if (formatInfo.primarySeparator === ',' && formatInfo.secondarySeparator === ',') {
      // Parser directement avec les virgules comme séparateurs
      const parts = parseLine(line, ',');
      console.log(`Format FFF compact: ${parts.length} colonnes détectées`);
      return parts;
    }
    
    // Nouveau format FFF standard : NOM,Prénom,Naissance,Sexe,Nationalité;?,?,?;Licence,Ligue,Club,Classement,?;
    const mainParts = line.split(';').map(p => p.trim());
    
    if (mainParts.length >= 4) {
      // La première partie contient les infos personnelles séparées par virgules
      const personalInfo = parseLine(mainParts[0], ',');
      
      // Les parties 2 et 3 sont souvent vides (champs manquants ?)
      const emptyPart1 = mainParts[1] || '';
      const emptyPart2 = mainParts[2] || '';
      
      // La quatrième partie contient licence, ligue, club, classement séparées par virgules
      const clubInfo = mainParts[3] ? parseLine(mainParts[3], ',') : [];
      
      // Vérifier si on a les bonnes colonnes (NOM, PRENOM, NAISSANCE, SEXE, NATIONALITÉ)
      if (personalInfo.length >= 5) {
        // Format FFF standard: 5 colonnes dans personalInfo
        const result = [
          ...personalInfo.slice(0, 5), // NOM, PRENOM, NAISSANCE, SEXE, NATIONALITÉ
          emptyPart1,                           // Champ vide (?)
          emptyPart2,                           // Champ vide (?)
          ...clubInfo                           // LICENCE, LIGUE, CLUB, CLASSEMENT, ?
        ];
        
        // S'assurer qu'on a bien le bon nombre de champs
        while (result.length < 10) {
          result.push('');
        }
        
        return result;
      }
    }
    
    if (mainParts.length >= 3) {
      // Format mixte spécial: NOM,PRENOM,DATE,SEXE,NATION;[vide];[vide];LICENCE,RÉGION,CLUB,...
      const firstSection = mainParts[0];
      const personalInfo = parseLine(firstSection, ',');
      
      // La deuxième partie est souvent vide (champ manquant)
      const middlePart = mainParts[1] || '';
      // La troisième partie contient licence, région, club séparées par virgules
      const clubInfo = mainParts[2] ? parseLine(mainParts[2], ',') : [];
      
      // Vérifier si on a les bonnes colonnes (NOM, PRENOM, DATE, SEXE, NATION)
      if (personalInfo.length >= 5) {
        // Format FFF normal: 5 colonnes dans personalInfo
        const result = [
          ...personalInfo.slice(0, 5), // NOM, PRENOM, DATE, SEXE, NATION
          middlePart,                           // Champ vide (ligue)
          ...clubInfo                           // LICENCE, RÉGION, CLUB, etc.
        ];
        
        // S'assurer qu'on a bien le bon nombre de champs
        while (result.length < 9) {
          result.push('');
        }
        
        return result;
      }
    } else if (formatInfo.primarySeparator === '\t' && formatInfo.secondarySeparator === ',') {
      // Format spécial : tabulations pour séparer les colonnes, virgules dans la première colonne
      const tabParts = line.split('\t').map(p => p.trim());
      
      if (tabParts.length >= 1 && tabParts[0].includes(',')) {
        // La première colonne contient les infos séparées par virgules
        // IMPORTANT: Dans le format FFF, la première virgule sépare NOM et PRENOM
        const firstSection = tabParts[0];
        let personalInfo: string[];
        
        if (firstSection.includes(',')) {
          const firstCommaIndex = firstSection.indexOf(',');
          const lastName = firstSection.substring(0, firstCommaIndex).trim();
          const restForFirstName = firstSection.substring(firstCommaIndex + 1).trim();
          const remainingParts = parseLine(restForFirstName, ',');
          personalInfo = [lastName, ...remainingParts];
        } else {
          personalInfo = parseLine(firstSection, ',');
        }
        
        // Les autres colonnes sont déjà correctement séparées par tabulations
        const otherParts = tabParts.slice(1);
        
        const result = [
          ...personalInfo,  // NOM, PRENOM, DATE, SEXE, NATION
          ...otherParts     // Les autres champs (club, classement, etc.)
        ];
        
        // S'assurer qu'on a bien le bon nombre de champs
        while (result.length < 9) {
          result.push('');
        }
        
        return result;
      }
    }
    
    // Format standard
    return parseLine(line, formatInfo.primarySeparator);
  }
  
  // Fallback - parser avec le séparateur principal
  return parseLine(line, formatInfo.primarySeparator);
}

/**
 * Détecte le séparateur le plus probable dans le fichier
 */
function detectSeparator(lines: string[]): string {
  const separators = [';', ',', '\t', '|'];
  const scores: { [key: string]: number } = {};
  
  // Analyser les premières lignes (max 10)
  const linesToCheck = lines.slice(0, Math.min(10, lines.length));
  
  for (const sep of separators) {
    scores[sep] = 0;
    const counts: number[] = [];
    const partCounts: number[] = [];
    
    for (const line of linesToCheck) {
      const parts = line.split(sep);
      const count = parts.length - 1;
      counts.push(count);
      partCounts.push(parts.length);
    }
    
    // Calculer le score basé sur plusieurs facteurs
    if (counts.length > 0) {
      // Facteur 1: Nombre moyen de colonnes (plus c'est mieux, jusqu'à un point)
      const avgParts = partCounts.reduce((a, b) => a + b, 0) / partCounts.length;
      const partsScore = Math.min(avgParts / 5, 3); // Max 3 points pour 5+ colonnes
      
      // Facteur 2: Consistance du nombre de séparateurs
      const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
      const variance = counts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / counts.length;
      const consistencyScore = Math.max(0, 2 - variance); // Max 2 points pour 0 variance
      
      // Facteur 3: Présence minimale (au moins 1 séparateur par ligne)
      const minCount = Math.min(...counts);
      const presenceScore = minCount >= 1 ? 2 : 0;
      
      // Facteur 4: Bonus pour le point-virgule (format FFE standard)
      const standardBonus = sep === ';' ? 2 : 0; // Augmenté de 1 à 2
      
      // Facteur 5: Pénalité si le séparateur crée trop de colonnes vides
      const emptyPartsCount = linesToCheck.reduce((sum, line) => {
        const parts = line.split(sep);
        const emptyCount = parts.filter(p => !p.trim()).length;
        return sum + emptyCount;
      }, 0);
      const emptyPenalty = Math.min(emptyPartsCount / linesToCheck.length / 2, 2);
      
      scores[sep] = partsScore + consistencyScore + presenceScore + standardBonus - emptyPenalty;
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
  
  console.log('Scores de séparateurs:', scores);
  
  // Si aucun bon séparateur trouvé, essayer point-virgule par défaut (FFE)
  return bestScore > 0 ? bestSep : ';';
}

/**
 * Parse une ligne en gérant les guillemets et les échappements
 */
function parseLine(line: string, separator: string): string[] {
  // D'abord, essayer le parsing simple (sans guillemets)
  if (!line.includes('"') && !line.includes("'")) {
    const parts = line.split(separator).map(p => p.trim());
    return parts;
  }
  
  // Parsing avancé avec gestion des guillemets
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    // Gérer les guillemets ouvrants
    if (!inQuotes && (char === '"' || char === "'")) {
      inQuotes = true;
      quoteChar = char;
      i++;
      continue;
    }
    
    // Gérer les guillemets fermants
    if (inQuotes && char === quoteChar) {
      // Vérifier si ce n'est pas un guillemet échappé
      if (nextChar === quoteChar) {
        // Guillemet échappé, ajouter un seul guillemet
        current += char;
        i += 2;
        continue;
      } else {
        // Fermeture normale des guillemets
        inQuotes = false;
        quoteChar = '';
        i++;
        continue;
      }
    }
    
    // Gérer le séparateur uniquement en dehors des guillemets
    if (!inQuotes && line.slice(i, i + separator.length) === separator) {
      parts.push(current.trim());
      current = '';
      i += separator.length;
      continue;
    }
    
    // Ajouter le caractère courant
    current += char;
    i++;
  }
  
  // Ajouter le dernier élément
  parts.push(current.trim());
  
  // Nettoyer les guillemets et espaces
  return parts.map(p => {
    let cleaned = p.trim();
    // Supprimer les guillemets entourant le champ
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1);
    }
    return cleaned;
  });
}

function parseFFELine(parts: string[], lineNumber: number, formatType: 'standard' | 'mixed' = 'mixed'): Partial<Fencer> | null {
  // Format minimal: NOM, PRENOM
  if (parts.length < 2) {
    throw new Error('Format invalide - au moins NOM et PRENOM requis');
  }

  // Nettoyer et valider les noms
  let lastName: string;
  let firstName: string;
  let genderField: string;
  let dateField: string;
  
  if (formatType === 'mixed') {
    // Format mixte: NOM, PRENOM, DATE, SEXE, NATION, ...
    // Dans le cas FFF où tout est séparé par virgules, les parties sont déjà correctes
    lastName = (parts[0] || '').trim().toUpperCase();
    firstName = (parts[1] || '').trim();
    dateField = (parts[2] || '').trim();
    genderField = (parts[3] || '').toString().toUpperCase().trim();
  } else {
    // Format standard: NOM, PRENOM, SEXE, DATE, NATION, ...
    lastName = (parts[0] || '').trim().toUpperCase();
    firstName = (parts[1] || '').trim();
    genderField = (parts[2] || '').toString().toUpperCase().trim();
    dateField = (parts[3] || '').trim();
  }

  if (!lastName || !firstName) {
    throw new Error(`NOM ou PRENOM manquant - Nom: "${lastName}", Prénom: "${firstName}"`);
  }

  // Détecter le sexe avec plus de flexibilité
  let gender: Gender = Gender.MIXED;
  
  if (genderField && genderField !== '') {
    if (['M', 'H', 'HOMME', 'MALE', 'MASCULIN', 'HOM'].includes(genderField)) {
      gender = Gender.MALE;
    } else if (['F', 'FEMME', 'FEMALE', 'FEMININ', 'DAME', 'FILLE', 'D'].includes(genderField)) {
      gender = Gender.FEMALE;
    } else {
      console.warn(`Ligne ${lineNumber}: Sexe non reconnu "${genderField}", mixte par défaut`);
    }
  }

  // Date de naissance avec plus de formats supportés
  let birthDate: Date | undefined;
  if (dateField) {
    const dateStr = dateField;
    
    // Essayer différents formats de date
    // Format: JJ/MM/AAAA ou JJ-MM-AAAA
    let dateMatch = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]) - 1;
      let year = parseInt(dateMatch[3]);
      if (year < 100) year += year > 50 ? 1900 : 2000;
      birthDate = new Date(year, month, day);
    } else {
      // Format: AAAA-MM-DD (ISO)
      dateMatch = dateStr.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
      if (dateMatch) {
        const year = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]) - 1;
        const day = parseInt(dateMatch[3]);
        birthDate = new Date(year, month, day);
      } else {
        console.warn(`Ligne ${lineNumber}: Date non reconnue "${dateStr}"`);
      }
    }
  }

  // Nettoyer les autres champs en fonction du format
  let nationality: string;
  let league: string | undefined;
  let club: string | undefined;
  let license: string | undefined;
  let ranking: number | undefined;
  
  if (formatType === 'mixed') {
    // Nouveau format FFF standard: NOM,Prénom,Naissance,Sexe,Nationalité;?,?,?;Licence,Ligue,Club,Classement,?;
    if (parts.length >= 9) {
      nationality = (parts[4] || '').trim() || 'FRA';
      
      // Les champs 5 et 6 sont souvent vides (?)
      // Les champs 7+ contiennent les infos club séparées par virgules
      const licensePart = (parts[7] || '').trim();
      const leaguePart = (parts[8] || '').trim();
      const clubPart = (parts[9] || '').trim();
      
      // Extraire la licence du premier élément si elle contient des virgules
      if (licensePart) {
        const licenseParts = licensePart.split(',').map(p => p.trim());
        license = licenseParts[0] || undefined;
        league = licenseParts[1] || leaguePart || undefined;
        club = licenseParts[2] || clubPart || undefined;
      } else {
        license = undefined;
        league = leaguePart || undefined;
        club = clubPart || undefined;
      }
      
      // Le champ 10 contient le classement dans ce format
      const rankingField = (parts[10] || '').trim();
      if (rankingField) {
        const parsedRanking = parseInt(rankingField);
        if (!isNaN(parsedRanking) && parsedRanking > 0) {
          ranking = parsedRanking;
        } else {
          console.warn(`Ligne ${lineNumber}: Classement non valide "${rankingField}"`);
        }
      }
    } else {
      // Format mixte spécial: NOM,PRENOM,DATE,SEXE,NATION;[vide];LICENCE,RÉGION,CLUB,...
      nationality = (parts[4] || '').trim() || 'FRA';
      
      // Le champ 5 est souvent vide (,,)
      // Les champs 6+ contiennent les infos club séparées par virgules
      const licensePart = (parts[6] || '').trim();
      const leaguePart = (parts[7] || '').trim();
      const clubPart = (parts[8] || '').trim();
      
      // Extraire la licence du premier élément si elle contient des virgules
      if (licensePart) {
        const licenseParts = licensePart.split(',').map(p => p.trim());
        license = licenseParts[0] || undefined;
        league = licenseParts[1] || leaguePart || undefined;
        club = licenseParts[2] || clubPart || undefined;
      } else {
        license = undefined;
        league = leaguePart || undefined;
        club = clubPart || undefined;
      }
    }
  } else {
    // Format standard: NOM, PRENOM, SEXE, DATE, NATION, LIGUE, CLUB, LICENCE
    nationality = (parts[4] || '').trim() || 'FRA';
    league = (parts[5] || '').trim() || undefined;
    club = (parts[6] || '').trim() || undefined;
    license = (parts[7] || '').trim() || undefined;
  }
  
  // Pour l'ancien format, gérer le classement avec validation
  if (formatType === 'standard' || (formatType === 'mixed' && parts.length < 9)) {
    const rankingField = (parts[8] || '').trim();
    if (rankingField) {
      const parsedRanking = parseInt(rankingField);
      if (!isNaN(parsedRanking) && parsedRanking > 0) {
        ranking = parsedRanking;
      } else {
        console.warn(`Ligne ${lineNumber}: Classement non valide "${rankingField}"`);
      }
    }
  }

  return {
    lastName,
    firstName,
    gender,
    birthDate,
    nationality,
    league,
    club,
    license,
    ranking,
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
