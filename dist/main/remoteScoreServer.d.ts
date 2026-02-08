/**
 * BellePoule Modern - Remote Score Entry Server
 * Web server for referees to enter scores remotely
 * Licensed under GPL-3.0
 */
import { RemoteSession, RemoteReferee, Arena, ArenaMatch } from '../shared/types/remote';
import { DatabaseManager } from '../database';
export declare class RemoteScoreServer {
    private app;
    private server;
    private io;
    private port;
    private db;
    private session;
    private connectedReferees;
    private arenas;
    private arenaTimers;
    constructor(db: DatabaseManager, port?: number);
    private setupMiddleware;
    private setupRoutes;
    private setupSocketHandlers;
    private handleDisconnect;
    private handleArenaControl;
    private handleClientMessage;
    private handleRefereeLogin;
    private handleScoreUpdate;
    private handleMatchComplete;
    private handleHeartbeat;
    private handleRefereeDisconnection;
    private createSession;
    private updateMatchScore;
    private broadcastMessage;
    private generateRefereeCode;
    private initializeArenas;
    getArena(arenaId: string): Arena | null;
    getAllArenas(): Arena[];
    updateArena(arenaId: string, update: Partial<Arena>): void;
    assignMatchToArena(arenaId: string, match: ArenaMatch): void;
    startArenaMatch(arenaId: string): void;
    pauseArenaMatch(arenaId: string): void;
    updateArenaScore(arenaId: string, scoreA: number, scoreB: number): void;
    finishArenaMatch(arenaId: string): void;
    private startArenaTimer;
    private stopArenaTimer;
    private broadcastArenaUpdate;
    private loadNextMatch;
    start(): void;
    stop(): void;
    getSession(): RemoteSession | null;
    getConnectedReferees(): RemoteReferee[];
}
//# sourceMappingURL=remoteScoreServer.d.ts.map