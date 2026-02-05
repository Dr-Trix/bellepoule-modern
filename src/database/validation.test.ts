/**
 * BellePoule Modern - Validation Tests
 * Tests for database input validation functions
 */

import { describe, it, expect } from 'vitest';
import {
  ValidationError,
  validateId,
  validateRequiredString,
  validateOptionalString,
  validateNumber,
  validateOptionalNumber,
  validateDate,
  validateOptionalDate,
  validateEnum,
  validateOptionalEnum,
  validateArray,
  validateCompetitionData,
  validateCompetitionSettings,
  validateFencerData,
  validateMatchData,
  validatePoolData,
  validateSessionState,
  sanitizeString,
  sanitizeId,
} from './validation';
import {
  FencerStatus,
  Gender,
  Weapon,
  Category,
  MatchStatus,
} from '../shared/types';

// ============================================================================
// validateId Tests
// ============================================================================

describe('validateId', () => {
  it('should accept valid IDs', () => {
    expect(() => validateId('abc123')).not.toThrow();
    expect(() => validateId('uuid-1234-5678')).not.toThrow();
    expect(() => validateId('a')).not.toThrow();
  });

  it('should reject empty string', () => {
    expect(() => validateId('')).toThrow(ValidationError);
    expect(() => validateId('   ')).toThrow(ValidationError);
  });

  it('should reject null/undefined', () => {
    expect(() => validateId(null as any)).toThrow(ValidationError);
    expect(() => validateId(undefined as any)).toThrow(ValidationError);
  });

  it('should reject non-string values', () => {
    expect(() => validateId(123 as any)).toThrow(ValidationError);
    expect(() => validateId({} as any)).toThrow(ValidationError);
  });

  it('should reject IDs longer than 255 characters', () => {
    const longId = 'a'.repeat(256);
    expect(() => validateId(longId)).toThrow(ValidationError);
  });

  it('should accept ID at exactly 255 characters', () => {
    const maxId = 'a'.repeat(255);
    expect(() => validateId(maxId)).not.toThrow();
  });

  it('should include field name in error', () => {
    try {
      validateId('', 'customField');
    } catch (e) {
      expect((e as ValidationError).field).toBe('customField');
    }
  });
});

// ============================================================================
// validateRequiredString Tests
// ============================================================================

describe('validateRequiredString', () => {
  it('should accept valid strings', () => {
    expect(() => validateRequiredString('hello', 'field')).not.toThrow();
    expect(() => validateRequiredString('a', 'field')).not.toThrow();
  });

  it('should reject empty strings', () => {
    expect(() => validateRequiredString('', 'field')).toThrow(ValidationError);
    expect(() => validateRequiredString('   ', 'field')).toThrow(ValidationError);
  });

  it('should reject strings exceeding maxLength', () => {
    expect(() => validateRequiredString('hello', 'field', 3)).toThrow(ValidationError);
    expect(() => validateRequiredString('abc', 'field', 3)).not.toThrow();
  });

  it('should use default maxLength of 255', () => {
    const longString = 'a'.repeat(256);
    expect(() => validateRequiredString(longString, 'field')).toThrow(ValidationError);
  });
});

// ============================================================================
// validateOptionalString Tests
// ============================================================================

describe('validateOptionalString', () => {
  it('should accept undefined', () => {
    expect(() => validateOptionalString(undefined, 'field')).not.toThrow();
  });

  it('should accept null (treated as undefined)', () => {
    expect(() => validateOptionalString(null as any, 'field')).not.toThrow();
  });

  it('should accept valid strings', () => {
    expect(() => validateOptionalString('hello', 'field')).not.toThrow();
    expect(() => validateOptionalString('', 'field')).not.toThrow();
  });

  it('should reject non-string values', () => {
    expect(() => validateOptionalString(123 as any, 'field')).toThrow(ValidationError);
  });

  it('should reject strings exceeding maxLength', () => {
    expect(() => validateOptionalString('hello', 'field', 3)).toThrow(ValidationError);
  });
});

// ============================================================================
// validateNumber Tests
// ============================================================================

describe('validateNumber', () => {
  it('should accept valid numbers', () => {
    expect(() => validateNumber(0, 'field')).not.toThrow();
    expect(() => validateNumber(100, 'field')).not.toThrow();
    expect(() => validateNumber(3.14, 'field')).not.toThrow();
  });

  it('should reject NaN', () => {
    expect(() => validateNumber(NaN, 'field')).toThrow(ValidationError);
  });

  it('should reject non-number values', () => {
    expect(() => validateNumber('5' as any, 'field')).toThrow(ValidationError);
    expect(() => validateNumber(null as any, 'field')).toThrow(ValidationError);
  });

  it('should validate minimum value', () => {
    expect(() => validateNumber(-1, 'field', 0)).toThrow(ValidationError);
    expect(() => validateNumber(0, 'field', 0)).not.toThrow();
    expect(() => validateNumber(5, 'field', 10)).toThrow(ValidationError);
  });

  it('should validate maximum value', () => {
    expect(() => validateNumber(10, 'field', 0, 5)).toThrow(ValidationError);
    expect(() => validateNumber(5, 'field', 0, 5)).not.toThrow();
  });
});

// ============================================================================
// validateOptionalNumber Tests
// ============================================================================

describe('validateOptionalNumber', () => {
  it('should accept undefined', () => {
    expect(() => validateOptionalNumber(undefined, 'field')).not.toThrow();
  });

  it('should accept null (treated as undefined)', () => {
    expect(() => validateOptionalNumber(null as any, 'field')).not.toThrow();
  });

  it('should validate provided numbers', () => {
    expect(() => validateOptionalNumber(5, 'field', 0, 10)).not.toThrow();
    expect(() => validateOptionalNumber(15, 'field', 0, 10)).toThrow(ValidationError);
  });
});

// ============================================================================
// validateDate Tests
// ============================================================================

describe('validateDate', () => {
  it('should accept valid Date objects', () => {
    expect(() => validateDate(new Date(), 'field')).not.toThrow();
    expect(() => validateDate(new Date('2024-01-15'), 'field')).not.toThrow();
  });

  it('should reject invalid Date objects', () => {
    expect(() => validateDate(new Date('invalid'), 'field')).toThrow(ValidationError);
  });

  it('should reject non-Date values', () => {
    expect(() => validateDate('2024-01-15' as any, 'field')).toThrow(ValidationError);
    expect(() => validateDate(1234567890 as any, 'field')).toThrow(ValidationError);
  });
});

// ============================================================================
// validateOptionalDate Tests
// ============================================================================

describe('validateOptionalDate', () => {
  it('should accept undefined', () => {
    expect(() => validateOptionalDate(undefined, 'field')).not.toThrow();
  });

  it('should accept null (treated as undefined)', () => {
    expect(() => validateOptionalDate(null as any, 'field')).not.toThrow();
  });

  it('should validate provided dates', () => {
    expect(() => validateOptionalDate(new Date(), 'field')).not.toThrow();
    expect(() => validateOptionalDate(new Date('invalid'), 'field')).toThrow(ValidationError);
  });
});

// ============================================================================
// validateEnum Tests
// ============================================================================

describe('validateEnum', () => {
  const validValues = ['A', 'B', 'C'];

  it('should accept valid enum values', () => {
    expect(() => validateEnum('A', 'field', validValues)).not.toThrow();
    expect(() => validateEnum('B', 'field', validValues)).not.toThrow();
  });

  it('should reject invalid enum values', () => {
    expect(() => validateEnum('D', 'field', validValues)).toThrow(ValidationError);
    expect(() => validateEnum('a', 'field', validValues)).toThrow(ValidationError);
  });

  it('should include valid values in error message', () => {
    try {
      validateEnum('X', 'field', validValues);
    } catch (e) {
      expect((e as Error).message).toContain('A, B, C');
    }
  });
});

// ============================================================================
// validateOptionalEnum Tests
// ============================================================================

describe('validateOptionalEnum', () => {
  const validValues = ['X', 'Y', 'Z'];

  it('should accept undefined', () => {
    expect(() => validateOptionalEnum(undefined, 'field', validValues)).not.toThrow();
  });

  it('should validate provided values', () => {
    expect(() => validateOptionalEnum('X', 'field', validValues)).not.toThrow();
    expect(() => validateOptionalEnum('W', 'field', validValues)).toThrow(ValidationError);
  });
});

// ============================================================================
// validateArray Tests
// ============================================================================

describe('validateArray', () => {
  it('should accept valid arrays', () => {
    expect(() => validateArray([], 'field')).not.toThrow();
    expect(() => validateArray([1, 2, 3], 'field')).not.toThrow();
    expect(() => validateArray(['a', 'b'], 'field')).not.toThrow();
  });

  it('should reject non-array values', () => {
    expect(() => validateArray('array' as any, 'field')).toThrow(ValidationError);
    expect(() => validateArray({} as any, 'field')).toThrow(ValidationError);
    expect(() => validateArray(null as any, 'field')).toThrow(ValidationError);
  });

  it('should validate maxLength', () => {
    expect(() => validateArray([1, 2, 3], 'field', 5)).not.toThrow();
    expect(() => validateArray([1, 2, 3], 'field', 2)).toThrow(ValidationError);
  });
});

// ============================================================================
// validateCompetitionData Tests
// ============================================================================

describe('validateCompetitionData', () => {
  const validCompetition = {
    title: 'Test Competition',
    date: new Date(),
    weapon: Weapon.EPEE,
    gender: Gender.MALE,
    category: Category.SENIOR,
  };

  it('should accept valid competition data', () => {
    expect(() => validateCompetitionData(validCompetition)).not.toThrow();
  });

  it('should reject missing title', () => {
    const data = { ...validCompetition, title: undefined };
    expect(() => validateCompetitionData(data as any)).toThrow(ValidationError);
  });

  it('should reject invalid weapon', () => {
    const data = { ...validCompetition, weapon: 'SWORD' };
    expect(() => validateCompetitionData(data as any)).toThrow(ValidationError);
  });

  it('should reject invalid date', () => {
    const data = { ...validCompetition, date: 'not-a-date' };
    expect(() => validateCompetitionData(data as any)).toThrow(ValidationError);
  });

  it('should validate optional URL format', () => {
    const withValidUrl = { ...validCompetition, organizerUrl: 'https://example.com' };
    expect(() => validateCompetitionData(withValidUrl)).not.toThrow();

    const withInvalidUrl = { ...validCompetition, organizerUrl: 'not-a-url' };
    expect(() => validateCompetitionData(withInvalidUrl)).toThrow(ValidationError);
  });

  it('should validate color format', () => {
    const withValidColor = { ...validCompetition, color: '#FF0000' };
    expect(() => validateCompetitionData(withValidColor)).not.toThrow();

    const withInvalidColor = { ...validCompetition, color: 'red' };
    expect(() => validateCompetitionData(withInvalidColor)).toThrow(ValidationError);

    const withShortHex = { ...validCompetition, color: '#F00' };
    expect(() => validateCompetitionData(withShortHex)).toThrow(ValidationError);
  });

  it('should validate nested settings', () => {
    const withValidSettings = {
      ...validCompetition,
      settings: {
        defaultPoolMaxScore: 5,
        defaultTableMaxScore: 15,
        poolRounds: 1,
        defaultRanking: 9999,
        minTeamSize: 3,
      },
    };
    expect(() => validateCompetitionData(withValidSettings as any)).not.toThrow();
  });
});

// ============================================================================
// validateCompetitionSettings Tests
// ============================================================================

describe('validateCompetitionSettings', () => {
  const validSettings = {
    defaultPoolMaxScore: 5,
    defaultTableMaxScore: 15,
    poolRounds: 1,
    defaultRanking: 9999,
    minTeamSize: 3,
  };

  it('should accept valid settings', () => {
    expect(() => validateCompetitionSettings(validSettings as any)).not.toThrow();
  });

  it('should reject pool max score outside range', () => {
    expect(() => validateCompetitionSettings({ ...validSettings, defaultPoolMaxScore: 0 } as any)).toThrow(ValidationError);
    expect(() => validateCompetitionSettings({ ...validSettings, defaultPoolMaxScore: 51 } as any)).toThrow(ValidationError);
  });

  it('should warn about pool max score above 15', () => {
    expect(() => validateCompetitionSettings({ ...validSettings, defaultPoolMaxScore: 20 } as any)).toThrow(ValidationError);
  });

  it('should reject invalid pool rounds', () => {
    expect(() => validateCompetitionSettings({ ...validSettings, poolRounds: 0 } as any)).toThrow(ValidationError);
    expect(() => validateCompetitionSettings({ ...validSettings, poolRounds: 6 } as any)).toThrow(ValidationError);
  });
});

// ============================================================================
// validateFencerData Tests
// ============================================================================

describe('validateFencerData', () => {
  const validFencer = {
    ref: 1,
    lastName: 'DUPONT',
    firstName: 'Jean',
    gender: Gender.MALE,
    status: FencerStatus.CHECKED_IN,
    nationality: 'FRA',
  };

  it('should accept valid fencer data', () => {
    expect(() => validateFencerData(validFencer)).not.toThrow();
  });

  it('should reject invalid ref number', () => {
    expect(() => validateFencerData({ ...validFencer, ref: 0 })).toThrow(ValidationError);
    expect(() => validateFencerData({ ...validFencer, ref: 10000 })).toThrow(ValidationError);
  });

  it('should reject empty lastName', () => {
    expect(() => validateFencerData({ ...validFencer, lastName: '' })).toThrow(ValidationError);
  });

  it('should reject invalid gender', () => {
    expect(() => validateFencerData({ ...validFencer, gender: 'OTHER' as any })).toThrow(ValidationError);
  });

  it('should reject invalid nationality format', () => {
    expect(() => validateFencerData({ ...validFencer, nationality: 'France' })).toThrow(ValidationError);
    expect(() => validateFencerData({ ...validFencer, nationality: 'FRAN' })).toThrow(ValidationError);
    expect(() => validateFencerData({ ...validFencer, nationality: 'F' })).toThrow(ValidationError);
  });

  it('should accept 2 and 3 letter nationality codes', () => {
    expect(() => validateFencerData({ ...validFencer, nationality: 'FR' })).not.toThrow();
    expect(() => validateFencerData({ ...validFencer, nationality: 'FRA' })).not.toThrow();
    expect(() => validateFencerData({ ...validFencer, nationality: 'USA' })).not.toThrow();
  });

  it('should reject future birth dates', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    expect(() => validateFencerData({ ...validFencer, birthDate: futureDate })).toThrow(ValidationError);
  });

  it('should accept past birth dates', () => {
    const pastDate = new Date('2000-01-15');
    expect(() => validateFencerData({ ...validFencer, birthDate: pastDate })).not.toThrow();
  });

  it('should validate optional ranking', () => {
    expect(() => validateFencerData({ ...validFencer, ranking: 100 })).not.toThrow();
    expect(() => validateFencerData({ ...validFencer, ranking: 0 })).toThrow(ValidationError);
  });
});

// ============================================================================
// validateMatchData Tests
// ============================================================================

describe('validateMatchData', () => {
  const validMatch = {
    number: 1,
    status: MatchStatus.NOT_STARTED,
    maxScore: 5,
  };

  it('should accept valid match data', () => {
    expect(() => validateMatchData(validMatch)).not.toThrow();
  });

  it('should reject invalid match number', () => {
    expect(() => validateMatchData({ ...validMatch, number: 0 })).toThrow(ValidationError);
    expect(() => validateMatchData({ ...validMatch, number: -1 })).toThrow(ValidationError);
  });

  it('should reject invalid status', () => {
    expect(() => validateMatchData({ ...validMatch, status: 'INVALID' as any })).toThrow(ValidationError);
  });

  it('should reject invalid max score', () => {
    expect(() => validateMatchData({ ...validMatch, maxScore: 0 })).toThrow(ValidationError);
    expect(() => validateMatchData({ ...validMatch, maxScore: 51 })).toThrow(ValidationError);
  });

  it('should validate time consistency', () => {
    const start = new Date('2024-01-15T10:00:00');
    const end = new Date('2024-01-15T09:00:00'); // Before start

    expect(() => validateMatchData({
      ...validMatch,
      startTime: start,
      endTime: end,
    })).toThrow(ValidationError);
  });

  it('should accept valid time range', () => {
    const start = new Date('2024-01-15T10:00:00');
    const end = new Date('2024-01-15T10:15:00');

    expect(() => validateMatchData({
      ...validMatch,
      startTime: start,
      endTime: end,
    })).not.toThrow();
  });

  it('should validate strip number', () => {
    expect(() => validateMatchData({ ...validMatch, strip: 0 })).toThrow(ValidationError);
    expect(() => validateMatchData({ ...validMatch, strip: 100 })).toThrow(ValidationError);
    expect(() => validateMatchData({ ...validMatch, strip: 5 })).not.toThrow();
  });
});

// ============================================================================
// validatePoolData Tests
// ============================================================================

describe('validatePoolData', () => {
  const validPool = {
    number: 1,
    phaseId: 'phase-123',
  };

  it('should accept valid pool data', () => {
    expect(() => validatePoolData(validPool)).not.toThrow();
  });

  it('should reject invalid pool number', () => {
    expect(() => validatePoolData({ ...validPool, number: 0 })).toThrow(ValidationError);
  });

  it('should reject empty phaseId', () => {
    expect(() => validatePoolData({ ...validPool, phaseId: '' })).toThrow(ValidationError);
  });

  it('should validate fencers array', () => {
    expect(() => validatePoolData({
      ...validPool,
      fencers: [{ id: 'fencer-1' }],
    } as any)).not.toThrow();

    expect(() => validatePoolData({
      ...validPool,
      fencers: [null],
    } as any)).toThrow(ValidationError);

    expect(() => validatePoolData({
      ...validPool,
      fencers: [{ id: '' }],
    } as any)).toThrow(ValidationError);
  });

  it('should limit fencers array to 20', () => {
    const tooManyFencers = Array.from({ length: 21 }, (_, i) => ({ id: `f-${i}` }));
    expect(() => validatePoolData({
      ...validPool,
      fencers: tooManyFencers,
    } as any)).toThrow(ValidationError);
  });

  it('should validate matches array', () => {
    expect(() => validatePoolData({
      ...validPool,
      matches: [{ id: 'match-1' }],
    } as any)).not.toThrow();

    expect(() => validatePoolData({
      ...validPool,
      matches: [{ id: '' }],
    } as any)).toThrow(ValidationError);
  });
});

// ============================================================================
// validateSessionState Tests
// ============================================================================

describe('validateSessionState', () => {
  it('should accept valid session state', () => {
    expect(() => validateSessionState({})).not.toThrow();
    expect(() => validateSessionState({ currentPhase: 0 })).not.toThrow();
  });

  it('should reject non-object values', () => {
    expect(() => validateSessionState(null)).toThrow(ValidationError);
    expect(() => validateSessionState('state')).toThrow(ValidationError);
    expect(() => validateSessionState(undefined)).toThrow(ValidationError);
  });

  it('should validate currentPhase', () => {
    expect(() => validateSessionState({ currentPhase: -1 })).toThrow(ValidationError);
    expect(() => validateSessionState({ currentPhase: 0 })).not.toThrow();
    expect(() => validateSessionState({ currentPhase: 5 })).not.toThrow();
  });

  it('should validate selectedPool', () => {
    expect(() => validateSessionState({ selectedPool: '' })).toThrow(ValidationError);
    expect(() => validateSessionState({ selectedPool: 'pool-1' })).not.toThrow();
  });

  it('should validate uiState', () => {
    expect(() => validateSessionState({ uiState: {} })).not.toThrow();
    expect(() => validateSessionState({ uiState: 'invalid' })).toThrow(ValidationError);
  });
});

// ============================================================================
// sanitizeString Tests
// ============================================================================

describe('sanitizeString', () => {
  it('should trim whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
    expect(sanitizeString('\thello\n')).toBe('hello');
  });

  it('should remove HTML-like characters', () => {
    expect(sanitizeString('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
    expect(sanitizeString('Hello <b>World</b>')).toBe('Hello bWorld/b');
  });

  it('should handle empty string', () => {
    expect(sanitizeString('')).toBe('');
    expect(sanitizeString('   ')).toBe('');
  });

  it('should preserve normal text', () => {
    expect(sanitizeString('Hello World')).toBe('Hello World');
    expect(sanitizeString('Jean-Pierre')).toBe('Jean-Pierre');
    expect(sanitizeString("O'Brien")).toBe("O'Brien");
  });
});

// ============================================================================
// sanitizeId Tests
// ============================================================================

describe('sanitizeId', () => {
  it('should keep alphanumeric characters', () => {
    expect(sanitizeId('abc123')).toBe('abc123');
    expect(sanitizeId('ABC')).toBe('ABC');
  });

  it('should keep hyphens and underscores', () => {
    expect(sanitizeId('uuid-1234-5678')).toBe('uuid-1234-5678');
    expect(sanitizeId('id_value_123')).toBe('id_value_123');
  });

  it('should remove special characters', () => {
    expect(sanitizeId('id@domain.com')).toBe('iddomaincom');
    expect(sanitizeId('hello world')).toBe('helloworld');
    expect(sanitizeId('test!@#$%')).toBe('test');
  });

  it('should trim whitespace', () => {
    expect(sanitizeId('  abc  ')).toBe('abc');
  });

  it('should handle empty string', () => {
    expect(sanitizeId('')).toBe('');
  });
});

// ============================================================================
// ValidationError Tests
// ============================================================================

describe('ValidationError', () => {
  it('should have correct name', () => {
    const error = new ValidationError('test message');
    expect(error.name).toBe('ValidationError');
  });

  it('should store field name', () => {
    const error = new ValidationError('test message', 'testField');
    expect(error.field).toBe('testField');
  });

  it('should be instanceof Error', () => {
    const error = new ValidationError('test');
    expect(error instanceof Error).toBe(true);
  });

  it('should have correct message', () => {
    const error = new ValidationError('Invalid value');
    expect(error.message).toBe('Invalid value');
  });
});
