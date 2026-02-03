/**
 * BellePoule Modern - Type Definitions
 * Based on the original BellePoule C++ codebase
 * Licensed under GPL-3.0
 */
export declare enum Weapon {
    EPEE = "E",
    FOIL = "F",
    SABRE = "S",
    LASER = "L"
}
export declare enum Gender {
    MALE = "M",
    FEMALE = "F",
    MIXED = "X"
}
export declare enum FencerStatus {
    QUALIFIED = "Q",// Qualifié
    ELIMINATED = "E",// Éliminé
    ABANDONED = "A",// Abandon
    EXCLUDED = "X",// Exclu (carton noir)
    NOT_CHECKED_IN = "N",// Non pointé
    CHECKED_IN = "P",// Pointé (présent)
    FORFAIT = "F"
}
export declare enum MatchStatus {
    NOT_STARTED = "not_started",
    IN_PROGRESS = "in_progress",
    FINISHED = "finished",
    CANCELLED = "cancelled"
}
export declare enum PhaseType {
    CHECKIN = "checkin",
    POOL = "pool",
    DIRECT_ELIMINATION = "direct_elimination",
    CLASSIFICATION = "classification"
}
export declare enum Category {
    U11 = "U11",// Poussins
    U13 = "U13",// Benjamins
    U15 = "U15",// Minimes
    U17 = "U17",// Cadets
    U20 = "U20",// Juniors
    SENIOR = "SEN",// Seniors
    V1 = "V1",// Vétérans 1 (40-49)
    V2 = "V2",// Vétérans 2 (50-59)
    V3 = "V3",// Vétérans 3 (60-69)
    V4 = "V4"
}
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Fencer extends BaseEntity {
    ref: number;
    lastName: string;
    firstName: string;
    birthDate?: Date;
    gender: Gender;
    nationality: string;
    league?: string;
    club?: string;
    license?: string;
    ranking?: number;
    status: FencerStatus;
    seedNumber?: number;
    initialRanking?: number;
    finalRanking?: number;
    poolStats?: PoolStats;
}
export interface PoolStats {
    victories: number;
    defeats: number;
    touchesScored: number;
    touchesReceived: number;
    index: number;
    matchesPlayed: number;
    victoryRatio: number;
    poolRank?: number;
    overallRank?: number;
}
export interface Referee extends BaseEntity {
    ref: number;
    lastName: string;
    firstName: string;
    birthDate?: Date;
    gender: Gender;
    nationality: string;
    league?: string;
    license?: string;
    category?: string;
    status: 'available' | 'assigned' | 'unavailable';
}
export interface Score {
    value: number | null;
    isVictory: boolean;
    isAbstention: boolean;
    isExclusion: boolean;
    isForfait: boolean;
}
export interface Match extends BaseEntity {
    number: number;
    fencerA: Fencer | null;
    fencerB: Fencer | null;
    scoreA: Score | null;
    scoreB: Score | null;
    maxScore: number;
    status: MatchStatus;
    referee?: Referee;
    strip?: number;
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    poolId?: string;
    tableId?: string;
    round?: number;
    position?: number;
}
export interface Pool extends BaseEntity {
    number: number;
    phaseId: string;
    fencers: Fencer[];
    matches: Match[];
    referees: Referee[];
    strip?: number;
    startTime?: Date;
    isComplete: boolean;
    hasError: boolean;
    ranking: PoolRanking[];
}
export interface PoolRanking {
    fencer: Fencer;
    rank: number;
    victories: number;
    defeats: number;
    touchesScored: number;
    touchesReceived: number;
    index: number;
    ratio: number;
    questPoints?: number;
    questVictories4?: number;
    questVictories3?: number;
    questVictories2?: number;
    questVictories1?: number;
}
export interface PoolPhase extends BaseEntity {
    competitionId: string;
    phaseNumber: number;
    maxScore: number;
    pools: Pool[];
    config: PoolPhaseConfig;
    qualifiedCount?: number;
    isComplete: boolean;
    ranking: PoolRanking[];
}
export interface PoolPhaseConfig {
    minPoolSize: number;
    maxPoolSize: number;
    balanced: boolean;
    seeding: 'serpentine' | 'sequential' | 'random';
    separation: {
        byClub: boolean;
        byLeague: boolean;
        byNation: boolean;
    };
}
export interface TableNode extends BaseEntity {
    position: number;
    round: number;
    match?: Match;
    winner?: Fencer;
    fencerA?: Fencer;
    fencerB?: Fencer;
    parentA?: string;
    parentB?: string;
    isBye: boolean;
}
export interface DirectEliminationTable extends BaseEntity {
    competitionId: string;
    name: string;
    size: number;
    maxScore: number;
    nodes: TableNode[];
    isComplete: boolean;
    ranking: TableRanking[];
    firstPlace: number;
}
export interface TableRanking {
    fencer: Fencer;
    rank: number;
    eliminatedAt: number;
}
export interface Competition extends BaseEntity {
    title: string;
    shortTitle?: string;
    date: Date;
    location?: string;
    organizer?: string;
    organizerUrl?: string;
    weapon: Weapon;
    gender: Gender;
    category: Category;
    championship?: string;
    color: string;
    checkInTime?: Date;
    scratchTime?: Date;
    startTime?: Date;
    fencers: Fencer[];
    referees: Referee[];
    phases: Phase[];
    currentPhaseIndex: number;
    settings: CompetitionSettings;
    isTeamEvent: boolean;
    status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
}
export interface CompetitionSettings {
    defaultPoolMaxScore: number;
    defaultTableMaxScore: number;
    poolRounds: number;
    hasDirectElimination: boolean;
    manualRanking: boolean;
    defaultRanking: number;
    randomScore: boolean;
    minTeamSize: number;
}
export interface Phase extends BaseEntity {
    competitionId: string;
    type: PhaseType;
    order: number;
    name: string;
    isComplete: boolean;
    nextPhaseId?: string;
    config: PoolPhaseConfig | DirectEliminationConfig | CheckInConfig;
}
export interface DirectEliminationConfig {
    maxScore: number;
    placesToFence: number[];
    thirdPlaceMatch: boolean;
}
export interface CheckInConfig {
    allowLateRegistration: boolean;
    autoQualify: boolean;
}
export interface Strip {
    id: string;
    number: number;
    name?: string;
    isAvailable: boolean;
    currentMatch?: Match;
}
export interface ImportResult {
    success: boolean;
    fencersImported: number;
    refereesImported: number;
    errors: string[];
    warnings: string[];
}
export interface ExportFormat {
    type: 'xml' | 'csv' | 'json' | 'pdf' | 'html';
    includeResults: boolean;
    includeStats: boolean;
}
export interface AppState {
    currentCompetition: Competition | null;
    competitions: Competition[];
    selectedPhase: Phase | null;
    selectedPool: Pool | null;
    selectedTable: DirectEliminationTable | null;
    isLoading: boolean;
    error: string | null;
}
export interface UISettings {
    language: 'fr' | 'en' | 'de' | 'es' | 'nl';
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    showTips: boolean;
    autoSave: boolean;
    autoSaveInterval: number;
}
//# sourceMappingURL=index.d.ts.map