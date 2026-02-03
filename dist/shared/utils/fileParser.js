"use strict";
/**
 * BellePoule Modern - FFE File Parser
 * Parse FFE format files (.fff, .csv) for fencer import
 * Licensed under GPL-3.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFFEFile = parseFFEFile;
exports.parseXMLFile = parseXMLFile;
exports.parseRankingFile = parseRankingFile;
const types_1 = require("../types");
/**
 * Parse un fichier FFE (.fff ou CSV)
 * Format FFE typique: NOM;PRENOM;SEXE;DATE_NAISSANCE;NATION;LIGUE;CLUB;LICENCE;CLASSEMENT
 */
function parseFFEFile(content) {
    const result = {
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
    console.log(`Première ligne: ${lines[0]}`);
    console.log(`Analyse de la première ligne avec séparateur "${separator}":`, parseLine(lines[0], separator));
    // Vérifier si la première ligne est un en-tête
    const firstLineLower = lines[0].toLowerCase();
    const firstLineParts = parseLine(lines[0], separator);
    // Détection plus robuste d'en-tête
    const hasHeader = 
    // Vérification par mots-clés
    firstLineLower.includes('nom') ||
        firstLineLower.includes('name') ||
        firstLineLower.includes('prenom') ||
        firstLineLower.includes('prénom') ||
        firstLineLower.includes('firstname') ||
        firstLineLower.includes('lastname') ||
        // Vérification par structure (tous les champs sont des mots)
        firstLineParts.every(part => /^[a-zA-ZÀ-ÿ\s]+$/.test(part)) ||
        // Vérification par nombre de champs (typiquement 8-10 champs pour en-tête)
        (firstLineParts.length >= 8 && firstLineParts.length <= 10);
    const startIndex = hasHeader ? 1 : 0;
    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line)
            continue;
        // Parser la ligne avec le séparateur détecté
        const parts = parseLine(line, separator);
        console.log(`Ligne ${i + 1}: ${parts.length} colonnes - ${parts.slice(0, 3).join(' | ')}`);
        try {
            const fencer = parseFFELine(parts, i + 1);
            if (fencer) {
                result.fencers.push(fencer);
            }
        }
        catch (error) {
            result.warnings.push(`Ligne ${i + 1}: ${error}`);
        }
    }
    result.success = result.fencers.length > 0;
    return result;
}
/**
 * Détecte le séparateur le plus probable dans le fichier
 */
function detectSeparator(lines) {
    const separators = [';', ',', '\t', '|'];
    const scores = {};
    // Analyser les premières lignes (max 10)
    const linesToCheck = lines.slice(0, Math.min(10, lines.length));
    for (const sep of separators) {
        scores[sep] = 0;
        const counts = [];
        const partCounts = [];
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
            const standardBonus = sep === ';' ? 1 : 0;
            scores[sep] = partsScore + consistencyScore + presenceScore + standardBonus;
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
function parseLine(line, separator) {
    // D'abord, essayer le parsing simple (sans guillemets)
    if (!line.includes('"') && !line.includes("'")) {
        const parts = line.split(separator).map(p => p.trim());
        return parts;
    }
    // Parsing avancé avec gestion des guillemets
    const parts = [];
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
            }
            else {
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
function parseFFELine(parts, lineNumber) {
    // Format minimal: NOM, PRENOM
    if (parts.length < 2) {
        throw new Error('Format invalide - au moins NOM et PRENOM requis');
    }
    // Nettoyer et valider les noms
    const lastName = (parts[0] || '').trim().toUpperCase();
    const firstName = (parts[1] || '').trim();
    if (!lastName || !firstName) {
        throw new Error(`NOM ou PRENOM manquant - Nom: "${lastName}", Prénom: "${firstName}"`);
    }
    // Détecter le sexe avec plus de flexibilité
    let gender = types_1.Gender.MIXED;
    const genderField = (parts[2] || '').toString().toUpperCase().trim();
    if (genderField && genderField !== '') {
        if (['M', 'H', 'HOMME', 'MALE', 'MASCULIN', 'HOM'].includes(genderField)) {
            gender = types_1.Gender.MALE;
        }
        else if (['F', 'FEMME', 'FEMALE', 'FEMININ', 'DAME', 'FILLE', 'D'].includes(genderField)) {
            gender = types_1.Gender.FEMALE;
        }
        else {
            console.warn(`Ligne ${lineNumber}: Sexe non reconnu "${genderField}", mixte par défaut`);
        }
    }
    // Date de naissance avec plus de formats supportés
    let birthDate;
    const dateField = (parts[3] || '').trim();
    if (dateField) {
        const dateStr = dateField;
        // Essayer différents formats de date
        // Format: JJ/MM/AAAA ou JJ-MM-AAAA
        let dateMatch = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
        if (dateMatch) {
            const day = parseInt(dateMatch[1]);
            const month = parseInt(dateMatch[2]) - 1;
            let year = parseInt(dateMatch[3]);
            if (year < 100)
                year += year > 50 ? 1900 : 2000;
            birthDate = new Date(year, month, day);
        }
        else {
            // Format: AAAA-MM-DD (ISO)
            dateMatch = dateStr.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
            if (dateMatch) {
                const year = parseInt(dateMatch[1]);
                const month = parseInt(dateMatch[2]) - 1;
                const day = parseInt(dateMatch[3]);
                birthDate = new Date(year, month, day);
            }
            else {
                console.warn(`Ligne ${lineNumber}: Date non reconnue "${dateStr}"`);
            }
        }
    }
    // Nettoyer les autres champs
    const nationality = (parts[4] || '').trim() || 'FRA';
    const league = (parts[5] || '').trim() || undefined;
    const club = (parts[6] || '').trim() || undefined;
    const license = (parts[7] || '').trim() || undefined;
    // Gérer le classement avec validation
    let ranking;
    const rankingField = (parts[8] || '').trim();
    if (rankingField) {
        const parsedRanking = parseInt(rankingField);
        if (!isNaN(parsedRanking) && parsedRanking > 0) {
            ranking = parsedRanking;
        }
        else {
            console.warn(`Ligne ${lineNumber}: Classement non valide "${rankingField}"`);
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
        status: types_1.FencerStatus.NOT_CHECKED_IN,
    };
}
/**
 * Parse un fichier XML BellePoule
 */
function parseXMLFile(content) {
    const result = {
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
            const getName = (attr) => {
                const m = tag.match(new RegExp(`${attr}="([^"]*)"`));
                return m ? m[1] : '';
            };
            const lastName = getName('Nom');
            const firstName = getName('Prenom');
            if (lastName && firstName) {
                const genderStr = getName('Sexe');
                let gender = types_1.Gender.MIXED;
                if (genderStr === 'M')
                    gender = types_1.Gender.MALE;
                else if (genderStr === 'F')
                    gender = types_1.Gender.FEMALE;
                result.fencers.push({
                    lastName: lastName.toUpperCase(),
                    firstName,
                    gender,
                    nationality: getName('Nation') || 'FRA',
                    league: getName('Ligue') || undefined,
                    club: getName('Club') || undefined,
                    license: getName('Licence') || undefined,
                    ranking: parseInt(getName('Classement')) || undefined,
                    status: types_1.FencerStatus.NOT_CHECKED_IN,
                });
            }
        }
        result.success = result.fencers.length > 0;
    }
    catch (error) {
        result.errors.push(`Erreur de parsing XML: ${error}`);
    }
    return result;
}
/**
 * Parse un fichier de classement FFE
 */
function parseRankingFile(content) {
    const rankings = new Map();
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
//# sourceMappingURL=fileParser.js.map