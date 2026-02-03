"use strict";
/**
 * BellePoule Modern - Electron Main Process
 * Licensed under GPL-3.0
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const database_1 = require("../database");
const remoteScoreServer_1 = require("./remoteScoreServer");
// Database instance
const db = new database_1.DatabaseManager();
// Remote score server
let remoteScoreServer = null;
// Main window reference
let mainWindow = null;
// ============================================================================
// Version Information
// ============================================================================
function getVersionInfo() {
    try {
        const versionPaths = [
            path.join(electron_1.app.getAppPath(), 'version.json'),
            path.join(electron_1.app.getAppPath(), '..', 'version.json'),
            path.join(__dirname, '..', '..', 'version.json'),
            path.join(process.cwd(), 'version.json'),
        ];
        for (const versionPath of versionPaths) {
            if (fs.existsSync(versionPath)) {
                const content = fs.readFileSync(versionPath, 'utf-8');
                return JSON.parse(content);
            }
        }
    }
    catch (e) {
        console.error('Failed to read version.json:', e);
    }
    // Fallback: lire depuis package.json
    try {
        const pkgPath = path.join(electron_1.app.getAppPath(), 'package.json');
        if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
            const match = pkg.version.match(/(\d+\.\d+\.\d+)(?:-build\.(\d+))?/);
            if (match) {
                return {
                    version: match[1],
                    build: parseInt(match[2]) || 0,
                    date: new Date().toISOString()
                };
            }
        }
    }
    catch (e) {
        console.error('Failed to read package.json:', e);
    }
    return { version: '1.0.0', build: 0, date: 'Unknown' };
}
async function checkForUpdates() {
    try {
        const https = await Promise.resolve().then(() => __importStar(require('https')));
        return new Promise((resolve) => {
            const options = {
                hostname: 'api.github.com',
                path: '/repos/klinnex/bellepoule-modern/releases/tags/latest',
                method: 'GET',
                headers: {
                    'User-Agent': 'BellePoule-Modern',
                    'Accept': 'application/vnd.github.v3+json'
                }
            };
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        const release = JSON.parse(data);
                        const currentInfo = getVersionInfo();
                        // Extraire le numéro de build depuis le nom de la release
                        // Format: "🚀 BellePoule Modern v1.0.0 Build #52"
                        const buildMatch = release.name?.match(/Build #(\d+)/);
                        const latestBuild = buildMatch ? parseInt(buildMatch[1]) : 0;
                        const versionMatch = release.name?.match(/v(\d+\.\d+\.\d+)/);
                        const latestVersion = versionMatch ? versionMatch[1] : currentInfo.version;
                        const hasUpdate = latestBuild > currentInfo.build;
                        resolve({
                            hasUpdate,
                            currentBuild: currentInfo.build,
                            latestBuild,
                            latestVersion,
                            downloadUrl: release.html_url || 'https://github.com/klinnex/bellepoule-modern/releases/latest',
                            releaseNotes: release.body || ''
                        });
                    }
                    catch (e) {
                        console.error('Failed to parse release info:', e);
                        resolve(null);
                    }
                });
            });
            req.on('error', (e) => {
                console.error('Failed to check for updates:', e);
                resolve(null);
            });
            req.setTimeout(10000, () => {
                req.destroy();
                resolve(null);
            });
            req.end();
        });
    }
    catch (e) {
        console.error('Update check error:', e);
        return null;
    }
}
async function showUpdateDialog(updateInfo) {
    const response = await electron_1.dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Mise à jour disponible',
        message: `Une nouvelle version est disponible !`,
        detail: `Version actuelle : Build #${updateInfo.currentBuild}\nNouvelle version : Build #${updateInfo.latestBuild} (v${updateInfo.latestVersion})\n\nVoulez-vous télécharger la mise à jour ?`,
        buttons: ['Télécharger', 'Plus tard'],
        defaultId: 0,
        cancelId: 1,
        icon: path.join(__dirname, '../../resources/icons/icon.png'),
    });
    if (response.response === 0) {
        electron_1.shell.openExternal(updateInfo.downloadUrl);
    }
}
// ============================================================================
// Window Creation
// ============================================================================
function createWindow() {
    const versionInfo = getVersionInfo();
    mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        title: `BellePoule Modern v${versionInfo.version} (Build #${versionInfo.build})`,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        icon: path.join(__dirname, '../../resources/icons/icon.png'),
    });
    // Load the renderer
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    // Create application menu
    createMenu();
}
// ============================================================================
// Application Menu
// ============================================================================
function createMenu() {
    const template = [
        {
            label: 'Fichier',
            submenu: [
                {
                    label: 'Nouvelle compétition',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => mainWindow?.webContents.send('menu:new-competition'),
                },
                {
                    label: 'Ouvrir...',
                    accelerator: 'CmdOrCtrl+O',
                    click: handleOpenFile,
                },
                { type: 'separator' },
                {
                    label: 'Enregistrer',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => mainWindow?.webContents.send('menu:save'),
                },
                {
                    label: 'Enregistrer sous...',
                    accelerator: 'CmdOrCtrl+Shift+S',
                    click: handleSaveAs,
                },
                { type: 'separator' },
                {
                    label: 'Exporter',
                    submenu: [
                        { label: 'Exporter en XML (BellePoule)', click: () => handleExport('xml') },
                        { label: 'Exporter en CSV', click: () => handleExport('csv') },
                        { label: 'Exporter en PDF', click: () => handleExport('pdf') },
                    ],
                },
                {
                    label: 'Importer',
                    submenu: [
                        { label: 'Importer XML (BellePoule)', click: () => handleImport('xml') },
                        { label: 'Importer liste FFE (.fff)', click: () => handleImport('fff') },
                        { label: 'Importer classement FFE', click: () => handleImport('ranking') },
                    ],
                },
                { type: 'separator' },
                {
                    label: 'Quitter',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
                    click: () => electron_1.app.quit(),
                },
            ],
        },
        {
            label: 'Édition',
            submenu: [
                { role: 'undo', label: 'Annuler' },
                { role: 'redo', label: 'Rétablir' },
                { type: 'separator' },
                { role: 'cut', label: 'Couper' },
                { role: 'copy', label: 'Copier' },
                { role: 'paste', label: 'Coller' },
                { role: 'selectAll', label: 'Tout sélectionner' },
            ],
        },
        {
            label: 'Compétition',
            submenu: [
                {
                    label: 'Propriétés',
                    click: () => mainWindow?.webContents.send('menu:competition-properties'),
                },
                { type: 'separator' },
                {
                    label: 'Ajouter un tireur',
                    accelerator: 'CmdOrCtrl+T',
                    click: () => mainWindow?.webContents.send('menu:add-fencer'),
                },
                {
                    label: 'Ajouter un arbitre',
                    click: () => mainWindow?.webContents.send('menu:add-referee'),
                },
                { type: 'separator' },
                {
                    label: '⚡ Démarrer saisie distante',
                    click: () => startRemoteScoreServer(),
                },
                {
                    label: '🛑 Arrêter saisie distante',
                    click: () => stopRemoteScoreServer(),
                },
                { type: 'separator' },
                {
                    label: 'Tour suivant',
                    accelerator: 'CmdOrCtrl+Right',
                    click: () => mainWindow?.webContents.send('menu:next-phase'),
                },
            ],
        },
        {
            label: 'Affichage',
            submenu: [
                { role: 'reload', label: 'Recharger' },
                { role: 'forceReload', label: 'Forcer le rechargement' },
                { role: 'toggleDevTools', label: 'Outils de développement' },
                { type: 'separator' },
                { role: 'resetZoom', label: 'Réinitialiser le zoom' },
                { role: 'zoomIn', label: 'Zoom avant' },
                { role: 'zoomOut', label: 'Zoom arrière' },
                { type: 'separator' },
                { role: 'togglefullscreen', label: 'Plein écran' },
            ],
        },
        {
            label: 'Aide',
            submenu: [
                {
                    label: 'À propos de BellePoule Modern',
                    accelerator: 'F1',
                    click: showAbout,
                },
                {
                    label: '🔄 Vérifier les mises à jour...',
                    click: async () => {
                        const updateInfo = await checkForUpdates();
                        if (updateInfo) {
                            if (updateInfo.hasUpdate) {
                                showUpdateDialog(updateInfo);
                            }
                            else {
                                electron_1.dialog.showMessageBox(mainWindow, {
                                    type: 'info',
                                    title: 'Mises à jour',
                                    message: 'Vous utilisez la dernière version !',
                                    detail: `Version actuelle : Build #${updateInfo.currentBuild}`,
                                    buttons: ['OK'],
                                });
                            }
                        }
                        else {
                            electron_1.dialog.showMessageBox(mainWindow, {
                                type: 'warning',
                                title: 'Mises à jour',
                                message: 'Impossible de vérifier les mises à jour',
                                detail: 'Vérifiez votre connexion internet et réessayez.',
                                buttons: ['OK'],
                            });
                        }
                    },
                },
                { type: 'separator' },
                {
                    label: 'Documentation',
                    click: () => {
                        const { shell } = require('electron');
                        shell.openExternal('https://github.com/klinnex/bellepoule-modern/wiki');
                    },
                },
                {
                    label: '📝 Signaler un bug / Suggestion',
                    accelerator: 'CmdOrCtrl+Shift+I',
                    click: () => {
                        mainWindow?.webContents.send('menu:report-issue');
                    },
                },
                { type: 'separator' },
                {
                    label: 'GitHub',
                    click: () => {
                        const { shell } = require('electron');
                        shell.openExternal('https://github.com/klinnex/bellepoule-modern');
                    },
                },
            ],
        },
    ];
    const menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
}
// ============================================================================
// Remote Score Server
// ============================================================================
function startRemoteScoreServer() {
    if (remoteScoreServer) {
        electron_1.dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Saisie distante',
            message: 'Le serveur de saisie distante est déjà démarré',
            buttons: ['OK'],
        });
        return;
    }
    try {
        remoteScoreServer = new remoteScoreServer_1.RemoteScoreServer(db, 3001);
        remoteScoreServer.start();
        electron_1.dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Saisie distante démarrée',
            message: 'Les arbitres peuvent maintenant se connecter sur http://localhost:3001',
            detail: 'Partagez cette URL avec les arbitres munis de tablettes.',
            buttons: ['OK'],
        });
        // Stocker la référence globale pour le serveur distant
        global.mainWindow = mainWindow;
    }
    catch (error) {
        electron_1.dialog.showErrorBox('Erreur', `Impossible de démarrer le serveur distant: ${error}`);
    }
}
function stopRemoteScoreServer() {
    if (!remoteScoreServer) {
        electron_1.dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Saisie distante',
            message: 'Le serveur de saisie distante n\'est pas démarré',
            buttons: ['OK'],
        });
        return;
    }
    try {
        remoteScoreServer.stop();
        remoteScoreServer = null;
        electron_1.dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Saisie distante arrêtée',
            message: 'Le serveur de saisie distante a été arrêté',
            buttons: ['OK'],
        });
    }
    catch (error) {
        electron_1.dialog.showErrorBox('Erreur', `Impossible d'arrêter le serveur distant: ${error}`);
    }
}
// ============================================================================
// File Handlers
// ============================================================================
async function handleOpenFile() {
    const result = await electron_1.dialog.showOpenDialog(mainWindow, {
        title: 'Ouvrir une compétition',
        filters: [
            { name: 'BellePoule Modern', extensions: ['bpm', 'db'] },
            { name: 'BellePoule Classic', extensions: ['cotcot', 'cocot'] },
            { name: 'Tous les fichiers', extensions: ['*'] },
        ],
        properties: ['openFile'],
    });
    if (!result.canceled && result.filePaths.length > 0) {
        const filepath = result.filePaths[0];
        try {
            db.importFromFile(filepath);
            mainWindow?.webContents.send('file:opened', filepath);
        }
        catch (error) {
            electron_1.dialog.showErrorBox('Erreur', `Impossible d'ouvrir le fichier: ${error}`);
        }
    }
}
async function handleSaveAs() {
    const result = await electron_1.dialog.showSaveDialog(mainWindow, {
        title: 'Enregistrer la compétition',
        defaultPath: 'competition.bpm',
        filters: [
            { name: 'BellePoule Modern', extensions: ['bpm'] },
        ],
    });
    if (!result.canceled && result.filePath) {
        try {
            db.exportToFile(result.filePath);
            mainWindow?.webContents.send('file:saved', result.filePath);
        }
        catch (error) {
            electron_1.dialog.showErrorBox('Erreur', `Impossible d'enregistrer: ${error}`);
        }
    }
}
async function handleExport(format) {
    mainWindow?.webContents.send('menu:export', format);
}
async function handleImport(format) {
    let filters = [];
    let title = 'Importer';
    switch (format) {
        case 'xml':
            title = 'Importer un fichier XML BellePoule';
            filters = [{ name: 'XML BellePoule', extensions: ['xml', 'cotcot'] }];
            break;
        case 'fff':
            title = 'Importer une liste FFE';
            filters = [{ name: 'Fichier FFE', extensions: ['fff', 'csv', 'txt'] }];
            break;
        case 'ranking':
            title = 'Importer un classement FFE';
            filters = [{ name: 'Fichier classement', extensions: ['csv', 'txt', 'xlsx'] }];
            break;
        default:
            filters = [{ name: 'Tous les fichiers', extensions: ['*'] }];
    }
    const result = await electron_1.dialog.showOpenDialog(mainWindow, {
        title,
        filters,
        properties: ['openFile'],
    });
    if (!result.canceled && result.filePaths.length > 0) {
        const filepath = result.filePaths[0];
        try {
            // Lire le contenu du fichier
            const content = fs.readFileSync(filepath, 'utf-8');
            // Envoyer au renderer pour traitement
            mainWindow?.webContents.send('menu:import', format, filepath, content);
        }
        catch (error) {
            electron_1.dialog.showErrorBox('Erreur d\'import', `Impossible de lire le fichier: ${error}`);
        }
    }
}
function showAbout() {
    const versionInfo = getVersionInfo();
    const buildDate = new Date(versionInfo.date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    electron_1.dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'À propos de BellePoule Modern',
        message: `BellePoule Modern v${versionInfo.version}`,
        detail: `Build #${versionInfo.build}
Date: ${buildDate}

Logiciel de gestion de compétitions d'escrime.

Réécriture moderne du logiciel BellePoule original créé par Yannick Le Roux.

Licence: GPL-3.0
© 2024-2026 BellePoule Modern Contributors

Pour signaler un bug, mentionnez:
  Version: ${versionInfo.version}
  Build: #${versionInfo.build}`,
    });
}
// ============================================================================
// IPC Handlers - Database Operations
// ============================================================================
// Competition handlers
electron_1.ipcMain.handle('db:createCompetition', async (_, data) => {
    return db.createCompetition(data);
});
electron_1.ipcMain.handle('db:getCompetition', async (_, id) => {
    return db.getCompetition(id);
});
electron_1.ipcMain.handle('db:getAllCompetitions', async () => {
    return db.getAllCompetitions();
});
electron_1.ipcMain.handle('db:deleteCompetition', async (_, id) => {
    return db.deleteCompetition(id);
});
electron_1.ipcMain.handle('db:updateCompetition', async (_, id, updates) => {
    return db.updateCompetition(id, updates);
});
// Fencer handlers
electron_1.ipcMain.handle('db:addFencer', async (_, competitionId, fencer) => {
    return db.addFencer(competitionId, fencer);
});
electron_1.ipcMain.handle('db:getFencer', async (_, id) => {
    return db.getFencer(id);
});
electron_1.ipcMain.handle('db:getFencersByCompetition', async (_, competitionId) => {
    return db.getFencersByCompetition(competitionId);
});
electron_1.ipcMain.handle('db:updateFencer', async (_, id, updates) => {
    return db.updateFencer(id, updates);
});
electron_1.ipcMain.handle('db:deleteFencer', async (_, id) => {
    return db.deleteFencer(id);
});
// Match handlers
electron_1.ipcMain.handle('db:createMatch', async (_, match, poolId) => {
    return db.createMatch(match, poolId);
});
electron_1.ipcMain.handle('db:getMatch', async (_, id) => {
    return db.getMatch(id);
});
electron_1.ipcMain.handle('db:getMatchesByPool', async (_, poolId) => {
    return db.getMatchesByPool(poolId);
});
electron_1.ipcMain.handle('db:updateMatch', async (_, id, updates) => {
    return db.updateMatch(id, updates);
});
// Session State handlers
electron_1.ipcMain.handle('db:saveSessionState', async (_, competitionId, state) => {
    return db.saveSessionState(competitionId, state);
});
electron_1.ipcMain.handle('db:getSessionState', async (_, competitionId) => {
    return db.getSessionState(competitionId);
});
electron_1.ipcMain.handle('db:clearSessionState', async (_, competitionId) => {
    return db.clearSessionState(competitionId);
});
// Pool handlers - not used in current version
// ipcMain.handle('db:createPool', async (_, phaseId, number) => {
//   return db.createPool(phaseId, number);
// });
// ipcMain.handle('db:addFencerToPool', async (_, poolId, fencerId, position) => {
//   return db.addFencerToPool(poolId, fencerId, position);
// });
// ipcMain.handle('db:getPoolFencers', async (_, poolId) => {
//   return db.getPoolFencers(poolId);
// });
// File handlers
electron_1.ipcMain.handle('file:export', async (_, filepath) => {
    db.exportToFile(filepath);
});
electron_1.ipcMain.handle('file:import', async (_, filepath) => {
    await db.importFromFile(filepath);
});
// Dialog handlers
electron_1.ipcMain.handle('dialog:openFile', async (_, options) => {
    return electron_1.dialog.showOpenDialog(mainWindow, options);
});
electron_1.ipcMain.handle('dialog:saveFile', async (_, options) => {
    return electron_1.dialog.showSaveDialog(mainWindow, options);
});
// Shell handlers
electron_1.ipcMain.handle('shell:openExternal', async (_, url) => {
    await electron_1.shell.openExternal(url);
});
// App info handlers
electron_1.ipcMain.handle('app:getVersionInfo', async () => {
    return getVersionInfo();
});
// ============================================================================
// App Lifecycle
// ============================================================================
electron_1.app.whenReady().then(async () => {
    // Initialize database
    await db.open();
    createWindow();
    // Check for updates after window is ready (avec délai pour ne pas bloquer le démarrage)
    setTimeout(async () => {
        try {
            const updateInfo = await checkForUpdates();
            if (updateInfo && updateInfo.hasUpdate) {
                showUpdateDialog(updateInfo);
            }
        }
        catch (e) {
            console.error('Update check failed:', e);
        }
    }, 3000); // Attendre 3 secondes après le démarrage
    // Autosave every 2 minutes
    let autosaveInterval = null;
    const startAutosave = () => {
        if (autosaveInterval)
            clearInterval(autosaveInterval);
        autosaveInterval = setInterval(() => {
            try {
                db.forceSave();
                console.log('Autosave completed at', new Date().toISOString());
                mainWindow?.webContents.send('autosave:completed');
            }
            catch (error) {
                console.error('Autosave failed:', error);
                mainWindow?.webContents.send('autosave:failed');
            }
        }, 2 * 60 * 1000); // 2 minutes
    };
    startAutosave();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    db.forceSave(); // Save before closing
    db.close();
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('before-quit', () => {
    db.forceSave(); // Save before quitting
    db.close();
});
// Handle uncaught exceptions - save before crash
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    try {
        db.forceSave(); // Try to save data before showing error
    }
    catch (e) {
        console.error('Failed to save on crash:', e);
    }
    electron_1.dialog.showErrorBox('Erreur', `Une erreur inattendue s'est produite: ${error.message}`);
});
//# sourceMappingURL=main.js.map