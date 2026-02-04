/**
 * BellePoule Modern - Database Layer (sql.js version)
 * Portable SQLite database using sql.js (pure JavaScript)
 * Licensed under GPL-3.0
 */
import { Competition, Fencer, Pool, Match } from '../shared/types';
export declare class DatabaseManager {
    private db;
    private dbPath;
    constructor(dbPath?: string);
    open(dbPath?: string): Promise<void>;
    close(): void;
    private save;
    forceSave(): void;
    getPath(): string;
    isOpen(): boolean;
    private initializeTables;
    saveSessionState(competitionId: string, state: any): void;
    getSessionState(competitionId: string): any | null;
    clearSessionState(competitionId: string): void;
    createCompetition(comp: Partial<Competition>): Competition;
    getCompetition(id: string): Competition | null;
    getAllCompetitions(): Competition[];
    deleteCompetition(id: string): void;
    updateCompetition(id: string, updates: Partial<Competition>): void;
    addFencer(competitionId: string, fencer: Partial<Fencer>): Fencer;
    getFencer(id: string): Fencer | null;
    getFencersByCompetition(competitionId: string): Fencer[];
    updateFencer(id: string, updates: Partial<Fencer>): void;
    deleteFencer(id: string): void;
    createMatch(match: Partial<Match>, poolId?: string): Match;
    getMatch(id: string): Match | null;
    getMatchesByPool(poolId: string): Match[];
    updateMatch(id: string, updates: Partial<Match>): void;
    updatePool(pool: Pool): void;
    exportToFile(filepath: string): void;
    importFromFile(filepath: string): Promise<void>;
}
export declare const db: DatabaseManager;
//# sourceMappingURL=index.d.ts.map