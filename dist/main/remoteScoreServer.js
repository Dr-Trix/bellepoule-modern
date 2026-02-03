"use strict";
/**
 * BellePoule Modern - Remote Score Entry Server
 * Web server for referees to enter scores remotely
 * Licensed under GPL-3.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteScoreServer = void 0;
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const path_1 = __importDefault(require("path"));
const types_1 = require("../shared/types");
class RemoteScoreServer {
    constructor(db, port = 3001) {
        this.session = null;
        this.connectedReferees = new Map();
        this.db = db;
        this.port = port;
        this.app = (0, express_1.default)();
        this.server = (0, http_1.createServer)(this.app);
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
    }
    setupMiddleware() {
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.static(path_1.default.join(__dirname, '../remote')));
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });
    }
    setupRoutes() {
        // Route principale pour les arbitres
        this.app.get('/', (req, res) => {
            res.sendFile(path_1.default.join(__dirname, '../remote/index.html'));
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
            }
            catch (error) {
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
            const referee = {
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
                const scoreUpdate = req.body;
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
            }
            catch (error) {
                console.error('Error updating score:', error);
                res.status(500).json({ error: 'Erreur lors de la mise à jour du score' });
            }
        });
    }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            socket.on('message', async (message) => {
                await this.handleClientMessage(socket, message);
            });
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
                this.handleRefereeDisconnection(socket);
            });
        });
    }
    async handleClientMessage(socket, message) {
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
    async handleRefereeLogin(socket, data) {
        if (!this.session) {
            socket.emit('message', {
                type: 'login_error',
                data: { error: 'Aucune session active' }
            });
            return;
        }
        const referee = this.session.referees.find(r => r.code === data.code);
        if (!referee) {
            socket.emit('message', {
                type: 'login_error',
                data: { error: 'Code d\'arbitre invalide' }
            });
            return;
        }
        referee.isActive = true;
        referee.lastActivity = new Date();
        this.connectedReferees.set(socket.id, referee);
        socket.emit('message', {
            type: 'login_success',
            data: { referee }
        });
        // Notifier les autres clients
        this.broadcastMessage({
            type: 'referee_connected',
            data: { refereeId: referee.id, refereeName: referee.name },
            timestamp: new Date(),
            sender: 'server'
        }, socket.id);
        console.log(`Referee ${referee.name} connected with code ${data.code}`);
    }
    async handleScoreUpdate(socket, data) {
        try {
            const referee = this.connectedReferees.get(socket.id);
            if (!referee) {
                socket.emit('message', {
                    type: 'error',
                    data: { error: 'Non authentifié' }
                });
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
        }
        catch (error) {
            console.error('Error handling score update:', error);
            socket.emit('message', {
                type: 'error',
                data: { error: 'Erreur lors de la mise à jour du score' }
            });
        }
    }
    async handleMatchComplete(socket, data) {
        const referee = this.connectedReferees.get(socket.id);
        if (!referee)
            return;
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
    async handleHeartbeat(socket) {
        const referee = this.connectedReferees.get(socket.id);
        if (referee) {
            referee.lastActivity = new Date();
            socket.emit('message', {
                type: 'session_update',
                data: { timestamp: new Date() }
            });
        }
    }
    handleRefereeDisconnection(socket) {
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
    async createSession(competitionId, strips) {
        const competition = this.db.getCompetition(competitionId);
        if (!competition) {
            throw new Error('Compétition non trouvée');
        }
        const session = {
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
    async updateMatchScore(matchId, update) {
        // Mettre à jour le match dans la base de données
        const match = this.db.getMatch(matchId);
        if (!match) {
            throw new Error('Match non trouvé');
        }
        const scoreA = {
            value: update.scoreA,
            isVictory: update.winner === 'A',
            isAbstention: update.specialStatus === 'abandon' && update.winner !== 'A',
            isExclusion: update.specialStatus === 'exclusion' && update.winner !== 'A',
            isForfait: update.specialStatus === 'forfait' && update.winner !== 'A'
        };
        const scoreB = {
            value: update.scoreB,
            isVictory: update.winner === 'B',
            isAbstention: update.specialStatus === 'abandon' && update.winner !== 'B',
            isExclusion: update.specialStatus === 'exclusion' && update.winner !== 'B',
            isForfait: update.specialStatus === 'forfait' && update.winner !== 'B'
        };
        this.db.updateMatch(matchId, {
            scoreA,
            scoreB,
            status: update.status === 'finished' ? types_1.MatchStatus.FINISHED : types_1.MatchStatus.IN_PROGRESS
        });
    }
    broadcastMessage(message, excludeSocketId) {
        this.connectedReferees.forEach((referee, socketId) => {
            if (socketId !== excludeSocketId) {
                const socket = Array.from(this.io.sockets.sockets.values()).find(s => s.id === socketId);
                if (socket) {
                    socket.emit('message', message);
                }
            }
        });
        // Envoyer aussi à la fenêtre principale
        if (global.mainWindow) {
            global.mainWindow.webContents.send('remote:websocket_message', message);
        }
    }
    generateRefereeCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    start() {
        this.server.listen(this.port, () => {
            console.log(`Remote score server started on port ${this.port}`);
            console.log(`Arbitres peuvent se connecter sur: http://localhost:${this.port}`);
        });
    }
    stop() {
        if (this.server) {
            this.server.close();
            console.log('Remote score server stopped');
        }
    }
    getSession() {
        return this.session;
    }
    getConnectedReferees() {
        return Array.from(this.connectedReferees.values());
    }
}
exports.RemoteScoreServer = RemoteScoreServer;
//# sourceMappingURL=remoteScoreServer.js.map