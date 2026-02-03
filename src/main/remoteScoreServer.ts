/**
 * BellePoule Modern - Remote Score Entry Server
 * Web server for referees to enter scores remotely
 * Licensed under GPL-3.0
 */

import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import path from 'path';
import { 
  RemoteSession, 
  RemoteReferee, 
  RemoteStrip, 
  RemoteMatch,
  RemoteScoreUpdate,
  ClientMessage,
  ServerMessage,
  WebSocketMessage
} from '../shared/types/remote';
import { Competition, Match, Fencer, MatchStatus, Score } from '../shared/types';
import { DatabaseManager } from '../database';

export class RemoteScoreServer {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private port: number;
  private db: DatabaseManager;
  private session: RemoteSession | null = null;
  private connectedReferees: Map<string, RemoteReferee> = new Map();

  constructor(db: DatabaseManager, port: number = 3001) {
    this.db = db;
    this.port = port;
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketHandlers();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../remote')));
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });
  }

  private setupRoutes(): void {
    // Route principale pour les arbitres
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../remote/index.html'));
    });

    // API endpoints
    this.app.get('/api/session', (req, res) => {
      if (!this.session) {
        return res.status(404).json({ error: 'Aucune session active' });
      }
      res.json(this.session);
    });

    this.app.post('/api/session/start', async (req, res) => {
      try {
        const { competitionId, strips } = req.body;
        const competition = this.db.getCompetition(competitionId);
        
        if (!competition) {
          return res.status(404).json({ error: 'Compétition non trouvée' });
        }

        this.session = await this.createSession(competitionId, strips);
        res.json(this.session);
      } catch (error) {
        console.error('Error starting session:', error);
        res.status(500).json({ error: 'Erreur lors du démarrage de la session' });
      }
    });

    this.app.post('/api/session/stop', (req, res) => {
      this.session = null;
      this.connectedReferees.clear();
      res.json({ success: true });
    });

    this.app.get('/api/referees', (req, res) => {
      if (!this.session) {
        return res.status(404).json({ error: 'Aucune session active' });
      }
      res.json(this.session.referees);
    });

    this.app.post('/api/referees', (req, res) => {
      if (!this.session) {
        return res.status(404).json({ error: 'Aucune session active' });
      }

      const referee: RemoteReferee = {
        id: `ref_${Date.now()}`,
        name: req.body.name,
        code: req.body.code || this.generateRefereeCode(),
        isActive: true,
        lastActivity: new Date()
      };

      this.session.referees.push(referee);
      res.json(referee);
    });

    this.app.get('/api/strips', (req, res) => {
      if (!this.session) {
        return res.status(404).json({ error: 'Aucune session active' });
      }
      res.json(this.session.strips);
    });

    this.app.post('/api/matches/:matchId/score', async (req, res) => {
      try {
        const { matchId } = req.params;
        const scoreUpdate: RemoteScoreUpdate = req.body;
        
        // Mettre à jour le match dans la base de données
        await this.updateMatchScore(matchId, scoreUpdate);
        
        // Diffuser la mise à jour à tous les clients connectés
        this.broadcastMessage({
          type: 'score_update',
          data: { matchId, scoreUpdate },
          timestamp: new Date(),
          sender: 'server'
        });

        res.json({ success: true });
      } catch (error) {
        console.error('Error updating score:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du score' });
      }
    });
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('message', async (message: ClientMessage) => {
        await this.handleClientMessage(socket, message);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        this.handleRefereeDisconnection(socket);
      });
    });
  }

  private async handleClientMessage(socket: any, message: ClientMessage): Promise<void> {
    switch (message.type) {
      case 'login':
        await this.handleRefereeLogin(socket, message.data);
        break;
      case 'score_update':
        await this.handleScoreUpdate(socket, message.data);
        break;
      case 'match_complete':
        await this.handleMatchComplete(socket, message.data);
        break;
      case 'heartbeat':
        await this.handleHeartbeat(socket);
        break;
      case 'logout':
        this.handleRefereeDisconnection(socket);
        break;
    }
  }

  private async handleRefereeLogin(socket: any, data: { code: string }): Promise<void> {
    if (!this.session) {
      socket.emit('message', {
        type: 'login_error',
        data: { error: 'Aucune session active' }
      } as ServerMessage);
      return;
    }

    const referee = this.session.referees.find(r => r.code === data.code);
    if (!referee) {
      socket.emit('message', {
        type: 'login_error',
        data: { error: 'Code d\'arbitre invalide' }
      } as ServerMessage);
      return;
    }

    referee.isActive = true;
    referee.lastActivity = new Date();
    this.connectedReferees.set(socket.id, referee);

    socket.emit('message', {
      type: 'login_success',
      data: { referee }
    } as ServerMessage);

    // Notifier les autres clients
    this.broadcastMessage({
      type: 'referee_connected',
      data: { refereeId: referee.id, refereeName: referee.name },
      timestamp: new Date(),
      sender: 'server'
    }, socket.id);

    console.log(`Referee ${referee.name} connected with code ${data.code}`);
  }

  private async handleScoreUpdate(socket: any, data: RemoteScoreUpdate): Promise<void> {
    try {
      const referee = this.connectedReferees.get(socket.id);
      if (!referee) {
        socket.emit('message', {
          type: 'error',
          data: { error: 'Non authentifié' }
        } as ServerMessage);
        return;
      }

      data.refereeId = referee.id;
      await this.updateMatchScore(data.matchId, data);

      // Diffuser la mise à jour
      this.broadcastMessage({
        type: 'score_update_broadcast',
        data: { scoreUpdate: data },
        timestamp: new Date(),
        sender: referee.id
      });
    } catch (error) {
      console.error('Error handling score update:', error);
      socket.emit('message', {
        type: 'error',
        data: { error: 'Erreur lors de la mise à jour du score' }
      } as ServerMessage);
    }
  }

  private async handleMatchComplete(socket: any, data: { matchId: string }): Promise<void> {
    const referee = this.connectedReferees.get(socket.id);
    if (!referee) return;

    // Mettre à jour le statut du match
    referee.currentMatch = undefined;
    referee.lastActivity = new Date();

    // Notifier le système principal
    this.broadcastMessage({
      type: 'match_finished',
      data: { matchId: data.matchId, refereeId: referee.id },
      timestamp: new Date(),
      sender: referee.id
    });
  }

  private async handleHeartbeat(socket: any): Promise<void> {
    const referee = this.connectedReferees.get(socket.id);
    if (referee) {
      referee.lastActivity = new Date();
      socket.emit('message', {
        type: 'session_update',
        data: { timestamp: new Date() }
      } as ServerMessage);
    }
  }

  private handleRefereeDisconnection(socket: any): void {
    const referee = this.connectedReferees.get(socket.id);
    if (referee) {
      referee.isActive = false;
      referee.currentMatch = undefined;
      this.connectedReferees.delete(socket.id);

      this.broadcastMessage({
        type: 'referee_disconnected',
        data: { refereeId: referee.id, refereeName: referee.name },
        timestamp: new Date(),
        sender: 'server'
      });
    }
  }

  private async createSession(competitionId: string, strips: number): Promise<RemoteSession> {
    const competition = this.db.getCompetition(competitionId);
    if (!competition) {
      throw new Error('Compétition non trouvée');
    }

    const session: RemoteSession = {
      competitionId,
      strips: Array.from({ length: strips }, (_, i) => ({
        number: i + 1,
        status: 'available'
      })),
      referees: [],
      activeMatches: [],
      isRunning: true,
      startTime: new Date()
    };

    return session;
  }

  private async updateMatchScore(matchId: string, update: RemoteScoreUpdate): Promise<void> {
    // Mettre à jour le match dans la base de données
    const match = this.db.getMatch(matchId);
    if (!match) {
      throw new Error('Match non trouvé');
    }

    const scoreA: Score = {
      value: update.scoreA,
      isVictory: update.winner === 'A',
      isAbstention: update.specialStatus === 'abandon' && update.winner !== 'A',
      isExclusion: update.specialStatus === 'exclusion' && update.winner !== 'A',
      isForfait: update.specialStatus === 'forfait' && update.winner !== 'A'
    };

    const scoreB: Score = {
      value: update.scoreB,
      isVictory: update.winner === 'B',
      isAbstention: update.specialStatus === 'abandon' && update.winner !== 'B',
      isExclusion: update.specialStatus === 'exclusion' && update.winner !== 'B',
      isForfait: update.specialStatus === 'forfait' && update.winner !== 'B'
    };

    this.db.updateMatch(matchId, {
      scoreA,
      scoreB,
      status: update.status === 'finished' ? MatchStatus.FINISHED : MatchStatus.IN_PROGRESS
    });
  }

  private broadcastMessage(message: WebSocketMessage, excludeSocketId?: string): void {
    this.connectedReferees.forEach((referee, socketId) => {
      if (socketId !== excludeSocketId) {
        const socket = Array.from(this.io.sockets.sockets.values()).find(s => s.id === socketId);
        if (socket) {
          socket.emit('message', message);
        }
      }
    });

    // Envoyer aussi à la fenêtre principale
    if ((global as any).mainWindow) {
      (global as any).mainWindow.webContents.send('remote:websocket_message', message);
    }
  }

  private generateRefereeCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  public start(): void {
    this.server.listen(this.port, () => {
      console.log(`Remote score server started on port ${this.port}`);
      console.log(`Arbitres peuvent se connecter sur: http://localhost:${this.port}`);
    });
  }

  public stop(): void {
    if (this.server) {
      this.server.close();
      console.log('Remote score server stopped');
    }
  }

  public getSession(): RemoteSession | null {
    return this.session;
  }

  public getConnectedReferees(): RemoteReferee[] {
    return Array.from(this.connectedReferees.values());
  }
}