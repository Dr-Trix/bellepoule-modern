/**
 * BellePoule Modern - FFE/TXT File Parser
 * Parse FFE and simple TXT format files for fencer import
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
 * Parse un fichier FFE (.fff ou CSV) ou TXT simple
 * Formats supportés:
 * - Standard FFE: NOM;PRENOM;SEXE;DATE_NAISSANCE;NATION;LIGUE;CLUB;LICENCE;CLASSEMENT
 * - Format mixte: NOM,PRENOM,DATE,SEXE,NATION;LIGUE;CLUB;LICENCE;CLASSEMENT
 * - Format TXT simple: NOM PRENOM ou NOM;PRENOM ou autres variations
 */
/**
 * Parse un fichier texte simple (format flexible)
 */
export function parseSimpleTXTFile(content: string): ImportResult {
  const result: ImportResult = {
    success: false,
    fencers: [],
    errors: [],
    warnings: [],
  };

  // Nettoyer le contenu
  let cleanContent = content;
  if (cleanContent.charCodeAt(0) === 0xfeff) {
    cleanContent = cleanContent.slice(1);
  }
  cleanContent = cleanContent.replace(/^\uFFFE/, '').replace(/^\uFEFF/, '');

  const lines = cleanContent.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    result.errors.push('Le fichier est vide');
    return result;
  }

  console.log(`Parsing TXT file with ${lines.length} lines`);

  // Pour chaque ligne, essayer de parser un tireur
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Ignorer les lignes qui semblent être des en-têtes
    if (
      i === 0 &&
      (line.toLowerCase().includes('nom') ||
        line.toLowerCase().includes('name') ||
        line.toLowerCase().includes('prénom') ||
        line.toLowerCase().includes('prenom') ||
        line.toLowerCase().includes('sexe') ||
        line.toLowerCase().includes('sex') ||
        line.toLowerCase().includes('club') ||
        line.toLowerCase().includes('ligue'))
    ) {
      console.log(`Skipping header line: ${line}`);
      continue;
    }

    try {
      const fencer = parseTXTLine(line, i + 1);
      if (fencer) {
        result.fencers.push(fencer);
      }
    } catch (error) {
      console.error(`Error parsing line ${i + 1}: ${line}`, error);
      result.errors.push(
        `Ligne ${i + 1}: ${error instanceof Error ? error.message : 'Erreur de parsing'}`
      );
    }
  }

  result.success = result.fencers.length > 0;

  if (result.fencers.length === 0) {
    result.warnings.push('Aucun tireur trouvé dans le fichier. Vérifiez le format.');
  }

  console.log(`Parsed ${result.fencers.length} fencers from TXT file`);
  return result;
}

/**
 * Parse une ligne de fichier TXT simple
 */
function parseTXTLine(line: string, lineNumber: number): Partial<Fencer> | null {
  // Essayer différents séparateurs
  const separators = [';', ',', '\t', '|', ' '];
  let bestParts: string[] = [];
  let bestScore = -1;

  for (const sep of separators) {
    const parts = line
      .split(sep)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    // Évaluer la qualité du parsing
    let score = 0;

    // Plus on a de parties, mieux c'est (jusqu'à 10)
    score += Math.min(parts.length, 10);

    // Bonus si on a au moins un nom et un prénom
    if (parts.length >= 2) {
      score += 5;
    }

    // Bonus si les noms ont l'air corrects (lettres seulement)
    let nameCount = 0;
    for (let i = 0; i < Math.min(3, parts.length); i++) {
      if (/^[a-zA-ZÀ-ÿ\s\-]+$/.test(parts[i])) {
        nameCount++;
      }
    }
    score += nameCount * 2;

    // Pénalité si trop de parties vides
    const emptyCount = parts.filter(p => !p).length;
    score -= emptyCount * 3;

    if (score > bestScore) {
      bestScore = score;
      bestParts = parts;
    }
  }

  if (bestParts.length < 2) {
    console.warn(`Line ${lineNumber}: Not enough parts to extract name (${bestParts.length})`);
    return null;
  }

  const lastName = bestParts[0]?.toUpperCase().trim();
  const firstName = bestParts[1]?.trim();

  if (!lastName || !firstName) {
    console.warn(`Line ${lineNumber}: Missing name or first name`);
    return null;
  }

  // Extraire les autres informations si disponibles
  let gender = Gender.MIXED;
  let nationality = '';
  let club = '';
  let birthDate: Date | undefined;
  let ranking: number | undefined;

  // Essayer de détecter le sexe
  for (let i = 2; i < bestParts.length; i++) {
    const part = bestParts[i].toLowerCase();
    if (['m', 'h', 'homme', 'male', 'masculin'].includes(part)) {
      gender = Gender.MALE;
      break;
    } else if (['f', 'femme', 'female', 'féminin'].includes(part)) {
      gender = Gender.FEMALE;
      break;
    }
  }

  // Créer l'objet Fencer avec les informations disponibles
  const fencer: Partial<Fencer> = {
    lastName,
    firstName,
    gender,
    nationality: nationality || 'FRA', // Default France if not specified
    club: club || undefined,
    birthDate,
    ranking,
    status: FencerStatus.NOT_CHECKED_IN,
  };

  console.log(`Parsed fencer: ${firstName} ${lastName} (${gender})`);

  return fencer;
}

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
  if (cleanContent.charCodeAt(0) === 0xfeff) {
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
      ['fff', 'utf8', 'utf-8', 'x', '-', 'nom', 'prenom', 'sexe', 'club', 'classement'].some(
        keyword => firstLineParts.some(part => part.toLowerCase().includes(keyword))
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
    if (
      /^[\t\s\-]+$/g.test(line) ||
      line.toLowerCase().includes('fff') ||
      line.toLowerCase().includes('utf8') ||
      line.split(/[;\t,]/).filter(p => p.trim()).length < 2
    ) {
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
    return (
      trimmed &&
      !trimmed.toLowerCase().includes('fff') &&
      !trimmed.toLowerCase().includes('utf8') &&
      !trimmed.toLowerCase().includes('nom') &&
      !trimmed.toLowerCase().includes('classem') &&
      !trimmed.includes('✓') &&
      // Ignorer les lignes qui ne contiennent que des points-virgules et des chiffres (dates)
      !/^[\d\/;]+$/.test(trimmed)
    );
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
        console.log(
          'Format FFF standard détecté: NOM,Prénom,Naissance,Sexe,Nationalité;?,?,?;Licence,Ligue,Club,Classement,?;'
        );
        return {
          type: 'mixed',
          primarySeparator: ';',
          secondarySeparator: ',',
        };
      }
    }

    // Format FFF caractéristique: 5+ virgules et 3+ points-virgules
    if (commaCount >= 4 && semicolonCount >= 3 && parts.length >= 4) {
      console.log('Format FFF standard détecté: structure en sections avec points-virgules');
      return {
        type: 'mixed',
        primarySeparator: ';',
        secondarySeparator: ',',
      };
    }

    // Cas spécial : tout dans une colonne avec virgules
    if (commaCount >= 3 && commaCount <= 6 && semicolonCount <= 1) {
      console.log(
        'Format FFF compact détecté: toutes les infos dans une colonne séparées par virgules'
      );
      return {
        type: 'mixed',
        primarySeparator: ',', // Utiliser les virgules comme séparateur principal
        secondarySeparator: ',',
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
          secondarySeparator: ',',
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
      secondarySeparator: ',',
    };
  }

  // Détecter si le format utilise des virgules dans une structure tabulaire
  if (dataLine.includes(',') && dataLine.includes('\t')) {
    console.log(
      'Format mixte détecté: virgules dans les données, tabulations comme séparateurs de tableaux'
    );
    return {
      type: 'mixed',
      primarySeparator: '\t',
      secondarySeparator: ',',
    };
  }

  // Format standard avec un seul séparateur
  const separator = detectSeparator(lines);
  console.log(`Format standard détecté avec séparateur: "${separator}"`);
  return {
    type: 'standard',
    primarySeparator: separator,
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

    // Format FFF standard : NOM,Prénom,Naissance,Sexe,Nationalité;?,?,?;Licence,Ligue,Club,Classement,?;
    // Structure: 3 sections séparées par ; (la 4ème peut être vide à cause du ; final)
    const mainParts = line.split(';').map(p => p.trim());

    // Filtrer les parties vides à la fin (causées par le ; final)
    while (mainParts.length > 0 && mainParts[mainParts.length - 1] === '') {
      mainParts.pop();
    }

    // Format FFF avec 3 sections: personalInfo;unknown;clubInfo
    if (mainParts.length >= 3) {
      // Section 0: NOM,Prénom,Naissance,Sexe,Nationalité
      const personalInfo = parseLine(mainParts[0], ',');

      // Section 1: ?,?,? (champs inconnus)
      const unknownFields = mainParts[1] ? parseLine(mainParts[1], ',') : [];

      // Section 2: Licence,Ligue,Club,Classement,?
      const clubInfo = mainParts[2] ? parseLine(mainParts[2], ',') : [];

      // Vérifier si on a les bonnes colonnes (NOM, PRENOM, NAISSANCE, SEXE, NATIONALITÉ)
      if (personalInfo.length >= 5) {
        // Format FFF standard: 5 colonnes dans personalInfo
        const result = [
          ...personalInfo.slice(0, 5), // NOM, PRENOM, NAISSANCE, SEXE, NATIONALITÉ (indices 0-4)
          ...unknownFields, // Champs inconnus (?, ?, ?)
          ...clubInfo, // LICENCE, LIGUE, CLUB, CLASSEMENT, ?
        ];

        // S'assurer qu'on a bien le bon nombre de champs
        while (result.length < 13) {
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
          middlePart, // Champ vide (ligue)
          ...clubInfo, // LICENCE, RÉGION, CLUB, etc.
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
          ...personalInfo, // NOM, PRENOM, DATE, SEXE, NATION
          ...otherParts, // Les autres champs (club, classement, etc.)
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
    if (
      (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))
    ) {
      cleaned = cleaned.slice(1, -1);
    }
    return cleaned;
  });
}

function parseFFELine(
  parts: string[],
  lineNumber: number,
  formatType: 'standard' | 'mixed' = 'mixed'
): Partial<Fencer> | null {
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
    // Format FFF standard: NOM,Prénom,Naissance,Sexe,Nationalité;?,?,?;Licence,Ligue,Club,Classement,?;
    // Structure: [0-4] Personal info, [5-7] Unknown, [8-12] Club info
    if (parts.length >= 13) {
      nationality = (parts[4] || '').trim() || 'FRA';

      // Champs inconnus (indices 5, 6, 7) - ignorés pour l'instant
      // const unknown1 = (parts[5] || '').trim();
      // const unknown2 = (parts[6] || '').trim();
      // const unknown3 = (parts[7] || '').trim();

      // Section club (indices 8-12): Licence,Ligue,Club,Classement,?
      license = (parts[8] || '').trim() || undefined;
      league = (parts[9] || '').trim() || undefined;
      club = (parts[10] || '').trim() || undefined;

      // Le classement est à l'indice 11
      const rankingField = (parts[11] || '').trim();
      if (rankingField) {
        const parsedRanking = parseInt(rankingField);
        if (!isNaN(parsedRanking) && parsedRanking > 0) {
          ranking = parsedRanking;
        } else {
          console.warn(`Ligne ${lineNumber}: Classement non valide "${rankingField}"`);
        }
      }
    } else if (parts.length >= 9) {
      // Ancien format avec sections mal alignées - fallback
      nationality = (parts[4] || '').trim() || 'FRA';

      // Essayer d'extraire les infos club des champs disponibles
      license = (parts[7] || '').trim() || undefined;
      league = (parts[8] || '').trim() || undefined;
      club = (parts[9] || '').trim() || undefined;

      // Classement potentiellement à l'indice 10
      const rankingField = (parts[10] || '').trim();
      if (rankingField) {
        const parsedRanking = parseInt(rankingField);
        if (!isNaN(parsedRanking) && parsedRanking > 0) {
          ranking = parsedRanking;
        }
      }
    } else {
      // Format minimal - seulement les infos personnelles
      nationality = (parts[4] || '').trim() || 'FRA';
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

/**
 * Importe un classement depuis un fichier FFF
 * Met à jour UNIQUEMENT les tireurs présents dans la liste d'appel existante
 *
 * Format attendu:
 * - FFF standard: NOM,Prénom,Naissance,Sexe,Nationalité;?,?,?;Licence,Ligue,Club,Classement,?
 * - Format simple: NOM;PRENOM;...;CLASSEMENT
 *
 * @param content Contenu du fichier FFF
 * @param existingFencers Liste des tireurs existants (liste d'appel)
 * @returns Résultat de l'import avec statistiques
 */
export interface RankingImportResult {
  updated: number;
  notFound: number;
  errors: string[];
  details: Array<{
    lastName: string;
    firstName: string;
    club?: string;
    ranking: number;
    matched: boolean;
    fencerId?: string;
  }>;
}

export function importRankingFromFFF(
  content: string,
  existingFencers: Fencer[]
): RankingImportResult {
  const result: RankingImportResult = {
    updated: 0,
    notFound: 0,
    errors: [],
    details: [],
  };

  // Nettoyer le contenu
  let cleanContent = content;
  if (cleanContent.charCodeAt(0) === 0xfeff) {
    cleanContent = cleanContent.slice(1);
  }
  cleanContent = cleanContent.replace(/^\uFFFE/, '').replace(/^\uFEFF/, '');

  const lines = cleanContent.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    result.errors.push('Le fichier est vide');
    return result;
  }

  console.log(`Importing ranking from FFF file with ${lines.length} lines`);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Ignorer les lignes d'en-tête
    if (
      i === 0 &&
      (line.toLowerCase().includes('nom') ||
        line.toLowerCase().includes('classement') ||
        line.toLowerCase().includes('fff') ||
        line.toLowerCase().includes('utf'))
    ) {
      continue;
    }

    try {
      const rankingInfo = parseRankingLineFFF(line, i + 1);
      if (!rankingInfo) continue;

      // Chercher le tireur correspondant dans la liste existante
      const matchedFencer = findMatchingFencer(rankingInfo, existingFencers);

      if (matchedFencer) {
        // Mettre à jour le classement
        matchedFencer.ranking = rankingInfo.ranking;
        matchedFencer.updatedAt = new Date();
        result.updated++;
      } else {
        result.notFound++;
      }

      result.details.push({
        lastName: rankingInfo.lastName,
        firstName: rankingInfo.firstName,
        club: rankingInfo.club,
        ranking: rankingInfo.ranking,
        matched: !!matchedFencer,
        fencerId: matchedFencer?.id,
      });
    } catch (error) {
      console.error(`Error parsing line ${i + 1}: ${line}`, error);
      result.errors.push(
        `Ligne ${i + 1}: ${error instanceof Error ? error.message : 'Erreur de parsing'}`
      );
    }
  }

  console.log(`Ranking import complete: ${result.updated} updated, ${result.notFound} not found`);
  return result;
}

/**
 * Parse une ligne FFF pour extraire nom, prénom, club et classement
 */
interface RankingInfo {
  lastName: string;
  firstName: string;
  club?: string;
  ranking: number;
}

function parseRankingLineFFF(line: string, lineNumber: number): RankingInfo | null {
  // Essayer différents formats FFF

  // Format 1: FFF standard avec sections (NOM,Prénom,...;...;Licence,Ligue,Club,Classement,?)
  if (line.includes(';')) {
    const mainParts = line.split(';').map(p => p.trim());

    // Section 0: NOM,Prénom,Naissance,Sexe,Nationalité
    if (mainParts[0] && mainParts[0].includes(',')) {
      const personalInfo = mainParts[0].split(',').map(p => p.trim());
      const lastName = personalInfo[0] || '';
      const firstName = personalInfo[1] || '';

      // Section 2: Licence,Ligue,Club,Classement,?
      if (mainParts.length >= 3) {
        const clubInfo = mainParts[2].split(',').map(p => p.trim());
        const club = clubInfo[2] || undefined;
        const rankingStr = clubInfo[3] || '';
        const ranking = parseInt(rankingStr);

        if (lastName && !isNaN(ranking) && ranking > 0) {
          return { lastName, firstName, club, ranking };
        }
      }
    }

    // Format alternatif: NOM;PRENOM;...;CLASSEMENT
    const parts = line.split(';').map(p => p.trim());
    if (parts.length >= 2) {
      const lastName = parts[0];
      const firstName = parts[1];

      // Chercher le classement (dernier champ numérique)
      for (let i = parts.length - 1; i >= 0; i--) {
        const ranking = parseInt(parts[i]);
        if (!isNaN(ranking) && ranking > 0 && ranking < 10000) {
          return { lastName, firstName, ranking };
        }
      }
    }
  }

  // Format 2: Tout séparé par virgules
  if (line.includes(',')) {
    const parts = line.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      const lastName = parts[0];
      const firstName = parts[1];

      // Chercher le classement dans les champs suivants
      for (let i = 2; i < parts.length; i++) {
        const ranking = parseInt(parts[i]);
        if (!isNaN(ranking) && ranking > 0 && ranking < 10000) {
          return { lastName, firstName, ranking };
        }
      }
    }
  }

  return null;
}

/**
 * Trouve un tireur correspondant dans la liste existante
 * Utilise une logique de matching fuzzy sur le nom et le club
 */
function findMatchingFencer(rankingInfo: RankingInfo, existingFencers: Fencer[]): Fencer | null {
  const searchLastName = normalizeName(rankingInfo.lastName);
  const searchFirstName = normalizeName(rankingInfo.firstName);
  const searchClub = rankingInfo.club ? normalizeName(rankingInfo.club) : undefined;

  let bestMatch: Fencer | null = null;
  let bestScore = 0;

  for (const fencer of existingFencers) {
    const fencerLastName = normalizeName(fencer.lastName);
    const fencerFirstName = normalizeName(fencer.firstName);
    const fencerClub = fencer.club ? normalizeName(fencer.club) : undefined;

    // Score de matching
    let score = 0;

    // Nom exact
    if (fencerLastName === searchLastName) {
      score += 10;
    } else if (fencerLastName.includes(searchLastName) || searchLastName.includes(fencerLastName)) {
      score += 5;
    }

    // Prénom exact ou partiel
    if (fencerFirstName === searchFirstName) {
      score += 8;
    } else if (
      fencerFirstName.includes(searchFirstName) ||
      searchFirstName.includes(fencerFirstName)
    ) {
      score += 4;
    }

    // Club (bonus)
    if (searchClub && fencerClub) {
      if (fencerClub === searchClub) {
        score += 3;
      } else if (fencerClub.includes(searchClub) || searchClub.includes(fencerClub)) {
        score += 1;
      }
    }

    // Minimum de score pour considérer comme match
    if (score >= 15 && score > bestScore) {
      bestScore = score;
      bestMatch = fencer;
    }
  }

  return bestMatch;
}

/**
 * Normalise un nom pour la comparaison
 */
function normalizeName(name: string): string {
  return name
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/\s+/g, ' ')
    .trim();
}
