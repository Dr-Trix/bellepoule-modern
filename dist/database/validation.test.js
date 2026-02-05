"use strict";
/**
 * BellePoule Modern - Validation Tests
 * Tests for database input validation functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const validation_1 = require("./validation");
const types_1 = require("../shared/types");
// ============================================================================
// validateId Tests
// ============================================================================
(0, vitest_1.describe)('validateId', () => {
    (0, vitest_1.it)('should accept valid IDs', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateId)('abc123')).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validateId)('uuid-1234-5678')).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validateId)('a')).not.toThrow();
    });
    (0, vitest_1.it)('should reject empty string', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateId)('')).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateId)('   ')).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should reject null/undefined', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateId)(null)).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateId)(undefined)).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should reject non-string values', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateId)(123)).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateId)({})).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should reject IDs longer than 255 characters', () => {
        const longId = 'a'.repeat(256);
        (0, vitest_1.expect)(() => (0, validation_1.validateId)(longId)).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should accept ID at exactly 255 characters', () => {
        const maxId = 'a'.repeat(255);
        (0, vitest_1.expect)(() => (0, validation_1.validateId)(maxId)).not.toThrow();
    });
    (0, vitest_1.it)('should include field name in error', () => {
        try {
            (0, validation_1.validateId)('', 'customField');
        }
        catch (e) {
            (0, vitest_1.expect)(e.field).toBe('customField');
        }
    });
});
// ============================================================================
// validateRequiredString Tests
// ============================================================================
(0, vitest_1.describe)('validateRequiredString', () => {
    (0, vitest_1.it)('should accept valid strings', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateRequiredString)('hello', 'field')).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validateRequiredString)('a', 'field')).not.toThrow();
    });
    (0, vitest_1.it)('should reject empty strings', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateRequiredString)('', 'field')).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateRequiredString)('   ', 'field')).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should reject strings exceeding maxLength', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateRequiredString)('hello', 'field', 3)).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateRequiredString)('abc', 'field', 3)).not.toThrow();
    });
    (0, vitest_1.it)('should use default maxLength of 255', () => {
        const longString = 'a'.repeat(256);
        (0, vitest_1.expect)(() => (0, validation_1.validateRequiredString)(longString, 'field')).toThrow(validation_1.ValidationError);
    });
});
// ============================================================================
// validateOptionalString Tests
// ============================================================================
(0, vitest_1.describe)('validateOptionalString', () => {
    (0, vitest_1.it)('should accept undefined', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateOptionalString)(undefined, 'field')).not.toThrow();
    });
    (0, vitest_1.it)('should accept null (treated as undefined)', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateOptionalString)(null, 'field')).not.toThrow();
    });
    (0, vitest_1.it)('should accept valid strings', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateOptionalString)('hello', 'field')).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validateOptionalString)('', 'field')).not.toThrow();
    });
    (0, vitest_1.it)('should reject non-string values', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateOptionalString)(123, 'field')).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should reject strings exceeding maxLength', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateOptionalString)('hello', 'field', 3)).toThrow(validation_1.ValidationError);
    });
});
// ============================================================================
// validateNumber Tests
// ============================================================================
(0, vitest_1.describe)('validateNumber', () => {
    (0, vitest_1.it)('should accept valid numbers', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateNumber)(0, 'field')).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validateNumber)(100, 'field')).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validateNumber)(3.14, 'field')).not.toThrow();
    });
    (0, vitest_1.it)('should reject NaN', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateNumber)(NaN, 'field')).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should reject non-number values', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateNumber)('5', 'field')).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateNumber)(null, 'field')).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should validate minimum value', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateNumber)(-1, 'field', 0)).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateNumber)(0, 'field', 0)).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validateNumber)(5, 'field', 10)).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should validate maximum value', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateNumber)(10, 'field', 0, 5)).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateNumber)(5, 'field', 0, 5)).not.toThrow();
    });
});
// ============================================================================
// validateOptionalNumber Tests
// ============================================================================
(0, vitest_1.describe)('validateOptionalNumber', () => {
    (0, vitest_1.it)('should accept undefined', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateOptionalNumber)(undefined, 'field')).not.toThrow();
    });
    (0, vitest_1.it)('should accept null (treated as undefined)', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateOptionalNumber)(null, 'field')).not.toThrow();
    });
    (0, vitest_1.it)('should validate provided numbers', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateOptionalNumber)(5, 'field', 0, 10)).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validateOptionalNumber)(15, 'field', 0, 10)).toThrow(validation_1.ValidationError);
    });
});
// ============================================================================
// validateDate Tests
// ============================================================================
(0, vitest_1.describe)('validateDate', () => {
    (0, vitest_1.it)('should accept valid Date objects', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateDate)(new Date(), 'field')).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validateDate)(new Date('2024-01-15'), 'field')).not.toThrow();
    });
    (0, vitest_1.it)('should reject invalid Date objects', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateDate)(new Date('invalid'), 'field')).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should reject non-Date values', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateDate)('2024-01-15', 'field')).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateDate)(1234567890, 'field')).toThrow(validation_1.ValidationError);
    });
});
// ============================================================================
// validateOptionalDate Tests
// ============================================================================
(0, vitest_1.describe)('validateOptionalDate', () => {
    (0, vitest_1.it)('should accept undefined', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateOptionalDate)(undefined, 'field')).not.toThrow();
    });
    (0, vitest_1.it)('should accept null (treated as undefined)', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateOptionalDate)(null, 'field')).not.toThrow();
    });
    (0, vitest_1.it)('should validate provided dates', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateOptionalDate)(new Date(), 'field')).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validateOptionalDate)(new Date('invalid'), 'field')).toThrow(validation_1.ValidationError);
    });
});
// ============================================================================
// validateEnum Tests
// ============================================================================
(0, vitest_1.describe)('validateEnum', () => {
    const validValues = ['A', 'B', 'C'];
    (0, vitest_1.it)('should accept valid enum values', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateEnum)('A', 'field', validValues)).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validateEnum)('B', 'field', validValues)).not.toThrow();
    });
    (0, vitest_1.it)('should reject invalid enum values', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateEnum)('D', 'field', validValues)).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateEnum)('a', 'field', validValues)).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should include valid values in error message', () => {
        try {
            (0, validation_1.validateEnum)('X', 'field', validValues);
        }
        catch (e) {
            (0, vitest_1.expect)(e.message).toContain('A, B, C');
        }
    });
});
// ============================================================================
// validateOptionalEnum Tests
// ============================================================================
(0, vitest_1.describe)('validateOptionalEnum', () => {
    const validValues = ['X', 'Y', 'Z'];
    (0, vitest_1.it)('should accept undefined', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateOptionalEnum)(undefined, 'field', validValues)).not.toThrow();
    });
    (0, vitest_1.it)('should validate provided values', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateOptionalEnum)('X', 'field', validValues)).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validateOptionalEnum)('W', 'field', validValues)).toThrow(validation_1.ValidationError);
    });
});
// ============================================================================
// validateArray Tests
// ============================================================================
(0, vitest_1.describe)('validateArray', () => {
    (0, vitest_1.it)('should accept valid arrays', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateArray)([], 'field')).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validateArray)([1, 2, 3], 'field')).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validateArray)(['a', 'b'], 'field')).not.toThrow();
    });
    (0, vitest_1.it)('should reject non-array values', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateArray)('array', 'field')).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateArray)({}, 'field')).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateArray)(null, 'field')).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should validate maxLength', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateArray)([1, 2, 3], 'field', 5)).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validateArray)([1, 2, 3], 'field', 2)).toThrow(validation_1.ValidationError);
    });
});
// ============================================================================
// validateCompetitionData Tests
// ============================================================================
(0, vitest_1.describe)('validateCompetitionData', () => {
    const validCompetition = {
        title: 'Test Competition',
        date: new Date(),
        weapon: types_1.Weapon.EPEE,
        gender: types_1.Gender.MALE,
        category: types_1.Category.SENIOR,
    };
    (0, vitest_1.it)('should accept valid competition data', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateCompetitionData)(validCompetition)).not.toThrow();
    });
    (0, vitest_1.it)('should reject missing title', () => {
        const data = { ...validCompetition, title: undefined };
        (0, vitest_1.expect)(() => (0, validation_1.validateCompetitionData)(data)).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should reject invalid weapon', () => {
        const data = { ...validCompetition, weapon: 'SWORD' };
        (0, vitest_1.expect)(() => (0, validation_1.validateCompetitionData)(data)).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should reject invalid date', () => {
        const data = { ...validCompetition, date: 'not-a-date' };
        (0, vitest_1.expect)(() => (0, validation_1.validateCompetitionData)(data)).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should validate optional URL format', () => {
        const withValidUrl = { ...validCompetition, organizerUrl: 'https://example.com' };
        (0, vitest_1.expect)(() => (0, validation_1.validateCompetitionData)(withValidUrl)).not.toThrow();
        const withInvalidUrl = { ...validCompetition, organizerUrl: 'not-a-url' };
        (0, vitest_1.expect)(() => (0, validation_1.validateCompetitionData)(withInvalidUrl)).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should validate color format', () => {
        const withValidColor = { ...validCompetition, color: '#FF0000' };
        (0, vitest_1.expect)(() => (0, validation_1.validateCompetitionData)(withValidColor)).not.toThrow();
        const withInvalidColor = { ...validCompetition, color: 'red' };
        (0, vitest_1.expect)(() => (0, validation_1.validateCompetitionData)(withInvalidColor)).toThrow(validation_1.ValidationError);
        const withShortHex = { ...validCompetition, color: '#F00' };
        (0, vitest_1.expect)(() => (0, validation_1.validateCompetitionData)(withShortHex)).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should validate nested settings', () => {
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
        (0, vitest_1.expect)(() => (0, validation_1.validateCompetitionData)(withValidSettings)).not.toThrow();
    });
});
// ============================================================================
// validateCompetitionSettings Tests
// ============================================================================
(0, vitest_1.describe)('validateCompetitionSettings', () => {
    const validSettings = {
        defaultPoolMaxScore: 5,
        defaultTableMaxScore: 15,
        poolRounds: 1,
        defaultRanking: 9999,
        minTeamSize: 3,
    };
    (0, vitest_1.it)('should accept valid settings', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateCompetitionSettings)(validSettings)).not.toThrow();
    });
    (0, vitest_1.it)('should reject pool max score outside range', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateCompetitionSettings)({ ...validSettings, defaultPoolMaxScore: 0 })).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateCompetitionSettings)({ ...validSettings, defaultPoolMaxScore: 51 })).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should warn about pool max score above 15', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateCompetitionSettings)({ ...validSettings, defaultPoolMaxScore: 20 })).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should reject invalid pool rounds', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateCompetitionSettings)({ ...validSettings, poolRounds: 0 })).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateCompetitionSettings)({ ...validSettings, poolRounds: 6 })).toThrow(validation_1.ValidationError);
    });
});
// ============================================================================
// validateFencerData Tests
// ============================================================================
(0, vitest_1.describe)('validateFencerData', () => {
    const validFencer = {
        ref: 1,
        lastName: 'DUPONT',
        firstName: 'Jean',
        gender: types_1.Gender.MALE,
        status: types_1.FencerStatus.CHECKED_IN,
        nationality: 'FRA',
    };
    (0, vitest_1.it)('should accept valid fencer data', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateFencerData)(validFencer)).not.toThrow();
    });
    (0, vitest_1.it)('should reject invalid ref number', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateFencerData)({ ...validFencer, ref: 0 })).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateFencerData)({ ...validFencer, ref: 10000 })).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should reject empty lastName', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateFencerData)({ ...validFencer, lastName: '' })).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should reject invalid gender', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateFencerData)({ ...validFencer, gender: 'OTHER' })).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should reject invalid nationality format', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateFencerData)({ ...validFencer, nationality: 'France' })).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateFencerData)({ ...validFencer, nationality: 'FRAN' })).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateFencerData)({ ...validFencer, nationality: 'F' })).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should accept 2 and 3 letter nationality codes', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateFencerData)({ ...validFencer, nationality: 'FR' })).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validateFencerData)({ ...validFencer, nationality: 'FRA' })).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validateFencerData)({ ...validFencer, nationality: 'USA' })).not.toThrow();
    });
    (0, vitest_1.it)('should reject future birth dates', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        (0, vitest_1.expect)(() => (0, validation_1.validateFencerData)({ ...validFencer, birthDate: futureDate })).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should accept past birth dates', () => {
        const pastDate = new Date('2000-01-15');
        (0, vitest_1.expect)(() => (0, validation_1.validateFencerData)({ ...validFencer, birthDate: pastDate })).not.toThrow();
    });
    (0, vitest_1.it)('should validate optional ranking', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateFencerData)({ ...validFencer, ranking: 100 })).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validateFencerData)({ ...validFencer, ranking: 0 })).toThrow(validation_1.ValidationError);
    });
});
// ============================================================================
// validateMatchData Tests
// ============================================================================
(0, vitest_1.describe)('validateMatchData', () => {
    const validMatch = {
        number: 1,
        status: types_1.MatchStatus.NOT_STARTED,
        maxScore: 5,
    };
    (0, vitest_1.it)('should accept valid match data', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateMatchData)(validMatch)).not.toThrow();
    });
    (0, vitest_1.it)('should reject invalid match number', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateMatchData)({ ...validMatch, number: 0 })).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateMatchData)({ ...validMatch, number: -1 })).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should reject invalid status', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateMatchData)({ ...validMatch, status: 'INVALID' })).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should reject invalid max score', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateMatchData)({ ...validMatch, maxScore: 0 })).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateMatchData)({ ...validMatch, maxScore: 51 })).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should validate time consistency', () => {
        const start = new Date('2024-01-15T10:00:00');
        const end = new Date('2024-01-15T09:00:00'); // Before start
        (0, vitest_1.expect)(() => (0, validation_1.validateMatchData)({
            ...validMatch,
            startTime: start,
            endTime: end,
        })).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should accept valid time range', () => {
        const start = new Date('2024-01-15T10:00:00');
        const end = new Date('2024-01-15T10:15:00');
        (0, vitest_1.expect)(() => (0, validation_1.validateMatchData)({
            ...validMatch,
            startTime: start,
            endTime: end,
        })).not.toThrow();
    });
    (0, vitest_1.it)('should validate strip number', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateMatchData)({ ...validMatch, strip: 0 })).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateMatchData)({ ...validMatch, strip: 100 })).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateMatchData)({ ...validMatch, strip: 5 })).not.toThrow();
    });
});
// ============================================================================
// validatePoolData Tests
// ============================================================================
(0, vitest_1.describe)('validatePoolData', () => {
    const validPool = {
        number: 1,
        phaseId: 'phase-123',
    };
    (0, vitest_1.it)('should accept valid pool data', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validatePoolData)(validPool)).not.toThrow();
    });
    (0, vitest_1.it)('should reject invalid pool number', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validatePoolData)({ ...validPool, number: 0 })).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should reject empty phaseId', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validatePoolData)({ ...validPool, phaseId: '' })).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should validate fencers array', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validatePoolData)({
            ...validPool,
            fencers: [{ id: 'fencer-1' }],
        })).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validatePoolData)({
            ...validPool,
            fencers: [null],
        })).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validatePoolData)({
            ...validPool,
            fencers: [{ id: '' }],
        })).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should limit fencers array to 20', () => {
        const tooManyFencers = Array.from({ length: 21 }, (_, i) => ({ id: `f-${i}` }));
        (0, vitest_1.expect)(() => (0, validation_1.validatePoolData)({
            ...validPool,
            fencers: tooManyFencers,
        })).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should validate matches array', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validatePoolData)({
            ...validPool,
            matches: [{ id: 'match-1' }],
        })).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validatePoolData)({
            ...validPool,
            matches: [{ id: '' }],
        })).toThrow(validation_1.ValidationError);
    });
});
// ============================================================================
// validateSessionState Tests
// ============================================================================
(0, vitest_1.describe)('validateSessionState', () => {
    (0, vitest_1.it)('should accept valid session state', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateSessionState)({})).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validateSessionState)({ currentPhase: 0 })).not.toThrow();
    });
    (0, vitest_1.it)('should reject non-object values', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateSessionState)(null)).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateSessionState)('state')).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateSessionState)(undefined)).toThrow(validation_1.ValidationError);
    });
    (0, vitest_1.it)('should validate currentPhase', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateSessionState)({ currentPhase: -1 })).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateSessionState)({ currentPhase: 0 })).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validateSessionState)({ currentPhase: 5 })).not.toThrow();
    });
    (0, vitest_1.it)('should validate selectedPool', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateSessionState)({ selectedPool: '' })).toThrow(validation_1.ValidationError);
        (0, vitest_1.expect)(() => (0, validation_1.validateSessionState)({ selectedPool: 'pool-1' })).not.toThrow();
    });
    (0, vitest_1.it)('should validate uiState', () => {
        (0, vitest_1.expect)(() => (0, validation_1.validateSessionState)({ uiState: {} })).not.toThrow();
        (0, vitest_1.expect)(() => (0, validation_1.validateSessionState)({ uiState: 'invalid' })).toThrow(validation_1.ValidationError);
    });
});
// ============================================================================
// sanitizeString Tests
// ============================================================================
(0, vitest_1.describe)('sanitizeString', () => {
    (0, vitest_1.it)('should trim whitespace', () => {
        (0, vitest_1.expect)((0, validation_1.sanitizeString)('  hello  ')).toBe('hello');
        (0, vitest_1.expect)((0, validation_1.sanitizeString)('\thello\n')).toBe('hello');
    });
    (0, vitest_1.it)('should remove HTML-like characters', () => {
        (0, vitest_1.expect)((0, validation_1.sanitizeString)('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
        (0, vitest_1.expect)((0, validation_1.sanitizeString)('Hello <b>World</b>')).toBe('Hello bWorld/b');
    });
    (0, vitest_1.it)('should handle empty string', () => {
        (0, vitest_1.expect)((0, validation_1.sanitizeString)('')).toBe('');
        (0, vitest_1.expect)((0, validation_1.sanitizeString)('   ')).toBe('');
    });
    (0, vitest_1.it)('should preserve normal text', () => {
        (0, vitest_1.expect)((0, validation_1.sanitizeString)('Hello World')).toBe('Hello World');
        (0, vitest_1.expect)((0, validation_1.sanitizeString)('Jean-Pierre')).toBe('Jean-Pierre');
        (0, vitest_1.expect)((0, validation_1.sanitizeString)("O'Brien")).toBe("O'Brien");
    });
});
// ============================================================================
// sanitizeId Tests
// ============================================================================
(0, vitest_1.describe)('sanitizeId', () => {
    (0, vitest_1.it)('should keep alphanumeric characters', () => {
        (0, vitest_1.expect)((0, validation_1.sanitizeId)('abc123')).toBe('abc123');
        (0, vitest_1.expect)((0, validation_1.sanitizeId)('ABC')).toBe('ABC');
    });
    (0, vitest_1.it)('should keep hyphens and underscores', () => {
        (0, vitest_1.expect)((0, validation_1.sanitizeId)('uuid-1234-5678')).toBe('uuid-1234-5678');
        (0, vitest_1.expect)((0, validation_1.sanitizeId)('id_value_123')).toBe('id_value_123');
    });
    (0, vitest_1.it)('should remove special characters', () => {
        (0, vitest_1.expect)((0, validation_1.sanitizeId)('id@domain.com')).toBe('iddomaincom');
        (0, vitest_1.expect)((0, validation_1.sanitizeId)('hello world')).toBe('helloworld');
        (0, vitest_1.expect)((0, validation_1.sanitizeId)('test!@#$%')).toBe('test');
    });
    (0, vitest_1.it)('should trim whitespace', () => {
        (0, vitest_1.expect)((0, validation_1.sanitizeId)('  abc  ')).toBe('abc');
    });
    (0, vitest_1.it)('should handle empty string', () => {
        (0, vitest_1.expect)((0, validation_1.sanitizeId)('')).toBe('');
    });
});
// ============================================================================
// ValidationError Tests
// ============================================================================
(0, vitest_1.describe)('ValidationError', () => {
    (0, vitest_1.it)('should have correct name', () => {
        const error = new validation_1.ValidationError('test message');
        (0, vitest_1.expect)(error.name).toBe('ValidationError');
    });
    (0, vitest_1.it)('should store field name', () => {
        const error = new validation_1.ValidationError('test message', 'testField');
        (0, vitest_1.expect)(error.field).toBe('testField');
    });
    (0, vitest_1.it)('should be instanceof Error', () => {
        const error = new validation_1.ValidationError('test');
        (0, vitest_1.expect)(error instanceof Error).toBe(true);
    });
    (0, vitest_1.it)('should have correct message', () => {
        const error = new validation_1.ValidationError('Invalid value');
        (0, vitest_1.expect)(error.message).toBe('Invalid value');
    });
});
//# sourceMappingURL=validation.test.js.map