/**
 * BellePoule Modern - Remote Score Entry Server
 * Web server for referees to enter scores remotely
 * Licensed under GPL-3.0
 */
import { RemoteSession, RemoteReferee } from '../shared/types/remote';
import { DatabaseManager } from '../database';
export declare class RemoteScoreServer {
    private app;
    private server;
    private io;
    private port;
    private db;
    private session;
    private connectedReferees;
    constructor(db: DatabaseManager, port?: number);
    private setupMiddleware;
    private setupRoutes;
    private setupSocketHandlers;
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
    start(): void;
    stop(): void;
    getSession(): RemoteSession | null;
    getConnectedReferees(): RemoteReferee[];
}
//# sourceMappingURL=remoteScoreServer.d.ts.map