/**
 * BellePoule Modern - File Parser Tests
 * Tests for FFE file parsing and import functionality
 */

import { describe, it, expect } from 'vitest';
import {
  parseFFEFile,
  parseXMLFile,
  parseRankingFile,
} from './fileParser';
import { Gender, FencerStatus } from '../types';

// ============================================================================
// parseFFEFile Tests - Basic Functionality
// ============================================================================

describe('parseFFEFile - Basic functionality', () => {
  it('should parse simple semicolon-separated file', () => {
    const content = `NOM;PRENOM;SEXE;DATE;NATION;LIGUE;CLUB;LICENCE;CLASSEMENT
DUPONT;Jean;M;15/03/1995;FRA;IDF;PARIS UC;123456;50`;

    const result = parseFFEFile(content);

    expect(result.success).toBe(true);
    expect(result.fencers.length).toBe(1);
    expect(result.fencers[0].lastName).toBe('DUPONT');
    expect(result.fencers[0].firstName).toBe('Jean');
  });

  it('should parse multiple fencers', () => {
    const content = `NOM;PRENOM;SEXE;DATE;NATION;LIGUE;CLUB;LICENCE;CLASSEMENT
DUPONT;Jean;M;15/03/1995;FRA;IDF;PARIS UC;123456;50
MARTIN;Sophie;F;20/06/2000;FRA;ARA;LYON ESCRIME;789012;25
BERNARD;Pierre;M;10/01/1998;FRA;PACA;NICE CE;345678;100`;

    const result = parseFFEFile(content);

    expect(result.success).toBe(true);
    expect(result.fencers.length).toBe(3);
  });

  it('should return failure for empty file', () => {
    const result = parseFFEFile('');

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Le fichier est vide');
  });

  it('should handle Windows line endings (CRLF)', () => {
    const content = `NOM;PRENOM;SEXE;DATE;NATION\r\nDUPONT;Jean;M;15/03/1995;FRA\r\nMARTIN;Sophie;F;20/06/2000;FRA`;

    const result = parseFFEFile(content);

    expect(result.success).toBe(true);
    expect(result.fencers.length).toBe(2);
  });
});

// ============================================================================
// parseFFEFile Tests - BOM Handling
// ============================================================================

describe('parseFFEFile - BOM handling', () => {
  it('should handle UTF-8 BOM', () => {
    const content = '\uFEFFNOM;PRENOM;SEXE;DATE;NATION\nDUPONT;Jean;M;15/03/1995;FRA';

    const result = parseFFEFile(content);

    expect(result.success).toBe(true);
  });
});

// ============================================================================
// parseFFEFile Tests - Header Detection
// ============================================================================

describe('parseFFEFile - Header detection', () => {
  it('should skip header with NOM keyword', () => {
    const content = `NOM;PRENOM;SEXE;DATE;NATION
DUPONT;Jean;M;15/03/1995;FRA`;

    const result = parseFFEFile(content);

    expect(result.fencers.length).toBe(1);
    expect(result.fencers[0].lastName).toBe('DUPONT');
  });

  it('should skip header with FFF metadata', () => {
    const content = `FFF;UTF8;VERSION;1.0
DUPONT;Jean;M;15/03/1995;FRA;IDF;PARIS;123;50`;

    const result = parseFFEFile(content);

    expect(result.success).toBe(true);
  });
});

// ============================================================================
// parseFFEFile Tests - Name Handling
// ============================================================================

describe('parseFFEFile - Name handling', () => {
  it('should uppercase last name', () => {
    const content = `NOM;PRENOM;SEXE;DATE;NATION
Dupont;Jean;M;15/03/1995;FRA`;

    const result = parseFFEFile(content);

    expect(result.fencers[0].lastName).toBe('DUPONT');
  });

  it('should preserve first name case', () => {
    const content = `NOM;PRENOM;SEXE;DATE;NATION
DUPONT;Jean-Pierre;M;15/03/1995;FRA`;

    const result = parseFFEFile(content);

    expect(result.fencers[0].firstName).toBe('Jean-Pierre');
  });

  it('should handle compound names', () => {
    const content = `NOM;PRENOM;SEXE;DATE;NATION
DE LA FONTAINE;Marie-Anne;F;20/06/2000;FRA`;

    const result = parseFFEFile(content);

    expect(result.fencers[0].lastName).toBe('DE LA FONTAINE');
  });
});

// ============================================================================
// parseFFEFile Tests - Status Assignment
// ============================================================================

describe('parseFFEFile - Status assignment', () => {
  it('should set status to NOT_CHECKED_IN by default', () => {
    const content = `NOM;PRENOM;SEXE;DATE;NATION
DUPONT;Jean;M;15/03/1995;FRA`;

    const result = parseFFEFile(content);

    expect(result.fencers[0].status).toBe(FencerStatus.NOT_CHECKED_IN);
  });
});

// ============================================================================
// parseFFEFile Tests - Quoted Fields
// ============================================================================

describe('parseFFEFile - Quoted fields handling', () => {
  it('should handle double-quoted fields', () => {
    const content = `NOM;PRENOM;SEXE;DATE;NATION
"DUPONT";"Jean";"M";"15/03/1995";"FRA"`;

    const result = parseFFEFile(content);

    expect(result.success).toBe(true);
    expect(result.fencers[0].lastName).toBe('DUPONT');
  });
});

// ============================================================================
// parseFFEFile Tests - Edge Cases
// ============================================================================

describe('parseFFEFile - Edge cases', () => {
  it('should handle file with only whitespace lines', () => {
    const content = `

   `;

    const result = parseFFEFile(content);

    expect(result.success).toBe(false);
  });

  it('should skip empty lines', () => {
    const content = `NOM;PRENOM;SEXE;DATE;NATION
DUPONT;Jean;M;15/03/1995;FRA

MARTIN;Sophie;F;20/06/2000;FRA`;

    const result = parseFFEFile(content);

    expect(result.fencers.length).toBe(2);
  });

  it('should handle special characters in names', () => {
    const content = `NOM;PRENOM;SEXE;DATE;NATION
MÜLLER;François;M;15/03/1995;FRA
GARCÍA;José;M;20/06/2000;ESP`;

    const result = parseFFEFile(content);

    expect(result.success).toBe(true);
    expect(result.fencers.length).toBe(2);
    expect(result.fencers[0].lastName).toBe('MÜLLER');
    expect(result.fencers[1].lastName).toBe('GARCÍA');
  });
});

// ============================================================================
// parseXMLFile Tests
// ============================================================================

describe('parseXMLFile', () => {
  it('should parse XML with Tireur elements', () => {
    const content = `<?xml version="1.0"?>
<Competition>
  <Tireur Nom="DUPONT" Prenom="Jean" Sexe="M" Nation="FRA" Club="PARIS UC" />
  <Tireur Nom="MARTIN" Prenom="Sophie" Sexe="F" Nation="FRA" Club="LYON CE" />
</Competition>`;

    const result = parseXMLFile(content);

    expect(result.success).toBe(true);
    expect(result.fencers.length).toBe(2);
    expect(result.fencers[0].lastName).toBe('DUPONT');
    expect(result.fencers[0].firstName).toBe('Jean');
  });

  it('should parse gender correctly', () => {
    const content = `<Tireur Nom="DUPONT" Prenom="Jean" Sexe="M" Nation="FRA" />
<Tireur Nom="MARTIN" Prenom="Sophie" Sexe="F" Nation="FRA" />`;

    const result = parseXMLFile(content);

    expect(result.fencers[0].gender).toBe(Gender.MALE);
    expect(result.fencers[1].gender).toBe(Gender.FEMALE);
  });

  it('should extract optional fields', () => {
    const content = `<Tireur Nom="DUPONT" Prenom="Jean" Sexe="M" Nation="FRA" Ligue="IDF" Club="PARIS" Licence="123456" Classement="50" />`;

    const result = parseXMLFile(content);

    expect(result.fencers[0].league).toBe('IDF');
    expect(result.fencers[0].club).toBe('PARIS');
    expect(result.fencers[0].license).toBe('123456');
    expect(result.fencers[0].ranking).toBe(50);
  });

  it('should default nationality to FRA when missing', () => {
    const content = `<Tireur Nom="DUPONT" Prenom="Jean" Sexe="M" />`;

    const result = parseXMLFile(content);

    expect(result.fencers[0].nationality).toBe('FRA');
  });

  it('should skip elements without required fields', () => {
    const content = `<Tireur Nom="DUPONT" Sexe="M" Nation="FRA" />
<Tireur Prenom="Jean" Sexe="M" Nation="FRA" />
<Tireur Nom="VALID" Prenom="Fencer" Sexe="M" Nation="FRA" />`;

    const result = parseXMLFile(content);

    expect(result.fencers.length).toBe(1);
    expect(result.fencers[0].lastName).toBe('VALID');
  });

  it('should return failure for content without Tireur elements', () => {
    const content = `not xml at all`;

    const result = parseXMLFile(content);

    expect(result.success).toBe(false);
    expect(result.fencers.length).toBe(0);
  });

  it('should handle empty XML', () => {
    const content = `<?xml version="1.0"?>
<Competition>
</Competition>`;

    const result = parseXMLFile(content);

    expect(result.success).toBe(false);
    expect(result.fencers.length).toBe(0);
  });

  it('should set status to NOT_CHECKED_IN', () => {
    const content = `<Tireur Nom="DUPONT" Prenom="Jean" Sexe="M" Nation="FRA" />`;

    const result = parseXMLFile(content);

    expect(result.fencers[0].status).toBe(FencerStatus.NOT_CHECKED_IN);
  });
});

// ============================================================================
// parseRankingFile Tests
// ============================================================================

describe('parseRankingFile', () => {
  it('should parse ranking file with RANG;NOM format', () => {
    const content = `1;DUPONT
2;MARTIN
3;BERNARD`;

    const rankings = parseRankingFile(content);

    expect(rankings.get('DUPONT')).toBe(1);
    expect(rankings.get('MARTIN')).toBe(2);
    expect(rankings.get('BERNARD')).toBe(3);
  });

  it('should parse ranking file with NOM;RANG format', () => {
    const content = `DUPONT;50
MARTIN;25
BERNARD;100`;

    const rankings = parseRankingFile(content);

    expect(rankings.get('DUPONT')).toBe(50);
    expect(rankings.get('MARTIN')).toBe(25);
    expect(rankings.get('BERNARD')).toBe(100);
  });

  it('should handle comma separator', () => {
    const content = `1,DUPONT
2,MARTIN`;

    const rankings = parseRankingFile(content);

    expect(rankings.get('DUPONT')).toBe(1);
    expect(rankings.get('MARTIN')).toBe(2);
  });

  it('should handle tab separator', () => {
    const content = `1\tDUPONT
2\tMARTIN`;

    const rankings = parseRankingFile(content);

    expect(rankings.get('DUPONT')).toBe(1);
    expect(rankings.get('MARTIN')).toBe(2);
  });

  it('should uppercase names', () => {
    const content = `1;Dupont
2;Martin`;

    const rankings = parseRankingFile(content);

    expect(rankings.get('DUPONT')).toBe(1);
    expect(rankings.get('MARTIN')).toBe(2);
  });

  it('should ignore invalid rankings', () => {
    const content = `DUPONT;-1
MARTIN;0
BERNARD;10001
VALID;500`;

    const rankings = parseRankingFile(content);

    expect(rankings.get('VALID')).toBe(500);
    expect(rankings.has('DUPONT')).toBe(false);
    expect(rankings.has('MARTIN')).toBe(false);
    expect(rankings.has('BERNARD')).toBe(false);
  });

  it('should return empty map for empty file', () => {
    const rankings = parseRankingFile('');

    expect(rankings.size).toBe(0);
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('File Parser Integration', () => {
  it('should handle real-world FFE file format', () => {
    const content = `NOM;PRENOM;SEXE;DATE_NAISSANCE;NATION;LIGUE;CLUB;LICENCE;CLASSEMENT
DUPONT;Jean;M;15/03/1995;FRA;IDF;PARIS UNIVERSITE CLUB;123456;50
MARTIN;Sophie;F;20/06/2000;FRA;ARA;LYON ESCRIME;789012;25
BERNARD;Pierre;M;10/01/1998;FRA;PACA;NICE CAVIGAL ESCRIME;345678;100`;

    const result = parseFFEFile(content);

    expect(result.success).toBe(true);
    expect(result.fencers.length).toBe(3);

    const names = result.fencers.map(f => f.lastName);
    expect(names).toContain('DUPONT');
    expect(names).toContain('MARTIN');
    expect(names).toContain('BERNARD');

    result.fencers.forEach(f => {
      expect(f.status).toBe(FencerStatus.NOT_CHECKED_IN);
    });
  });
});
