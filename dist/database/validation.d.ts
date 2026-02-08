/**
 * BellePoule Modern - Database Validation Utilities
 * Input validation for database operations
 * Licensed under GPL-3.0
 */
import { Competition, Fencer, Match, Pool, CompetitionSettings } from '../shared/types';
export declare class ValidationError extends Error {
    field?: string | undefined;
    constructor(message: string, field?: string | undefined);
}
export declare const validateId: (id: string, fieldName?: string) => void;
export declare const validateRequiredString: (value: string, fieldName: string, maxLength?: number) => void;
export declare const validateOptionalString: (value: string | undefined, fieldName: string, maxLength?: number) => void;
export declare const validateNumber: (value: number, fieldName: string, min?: number, max?: number) => void;
export declare const validateOptionalNumber: (value: number | undefined, fieldName: string, min?: number, max?: number) => void;
export declare const validateDate: (value: Date, fieldName: string) => void;
export declare const validateOptionalDate: (value: Date | undefined, fieldName: string) => void;
export declare const validateEnum: (value: string, fieldName: string, validValues: string[]) => void;
export declare const validateOptionalEnum: (value: string | undefined, fieldName: string, validValues: string[]) => void;
export declare const validateArray: (value: any[], fieldName: string, maxLength?: number) => void;
export declare const validateCompetitionData: (data: Partial<Competition>) => void;
export declare const validateCompetitionSettings: (settings: CompetitionSettings) => void;
export declare const validateFencerData: (data: Partial<Fencer>) => void;
export declare const validateMatchData: (data: Partial<Match>) => void;
export declare const validatePoolData: (data: Partial<Pool>) => void;
export declare const validateSessionState: (state: any) => void;
export declare const sanitizeString: (value: string) => string;
export declare const sanitizeId: (value: string) => string;
//# sourceMappingURL=validation.d.ts.map