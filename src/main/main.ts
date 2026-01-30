/**
 * BellePoule Modern - Electron Main Process
 * Licensed under GPL-3.0
 */

import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { DatabaseManager } from '../database';
import {
  Competition,
  Fencer,
  FencerStatus,
  Match,
  MatchStatus,
  Pool,
} from '../shared/types';

// Database instance
const db = new DatabaseManager();

// Main window reference
let mainWindow: BrowserWindow | null = null;

// ============================================================================
// Window Creation
// ============================================================================

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'BellePoule Modern',
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
  } else {
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

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
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
          click: () => app.quit(),
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
          click: showAbout,
        },
        {
          label: 'Documentation',
          click: () => {
            const { shell } = require('electron');
            shell.openExternal('https://github.com/klinnex/bellepoule-modern/wiki');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ============================================================================
// File Handlers
// ============================================================================

async function handleOpenFile(): Promise<void> {
  const result = await dialog.showOpenDialog(mainWindow!, {
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
    } catch (error) {
      dialog.showErrorBox('Erreur', `Impossible d'ouvrir le fichier: ${error}`);
    }
  }
}

async function handleSaveAs(): Promise<void> {
  const result = await dialog.showSaveDialog(mainWindow!, {
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
    } catch (error) {
      dialog.showErrorBox('Erreur', `Impossible d'enregistrer: ${error}`);
    }
  }
}

async function handleExport(format: string): Promise<void> {
  mainWindow?.webContents.send('menu:export', format);
}

async function handleImport(format: string): Promise<void> {
  let filters: Electron.FileFilter[] = [];
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

  const result = await dialog.showOpenDialog(mainWindow!, {
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
    } catch (error) {
      dialog.showErrorBox('Erreur d\'import', `Impossible de lire le fichier: ${error}`);
    }
  }
}

function showAbout(): void {
  dialog.showMessageBox(mainWindow!, {
    type: 'info',
    title: 'À propos de BellePoule Modern',
    message: 'BellePoule Modern v1.0.0',
    detail: `Logiciel de gestion de compétitions d'escrime.

Réécriture moderne du logiciel BellePoule original créé par Yannick Le Roux.

Licence: GPL-3.0
© 2024 BellePoule Modern Contributors`,
  });
}

// ============================================================================
// IPC Handlers - Database Operations
// ============================================================================

// Competition handlers
ipcMain.handle('db:createCompetition', async (_, data) => {
  return db.createCompetition(data);
});

ipcMain.handle('db:getCompetition', async (_, id) => {
  return db.getCompetition(id);
});

ipcMain.handle('db:getAllCompetitions', async () => {
  return db.getAllCompetitions();
});

ipcMain.handle('db:deleteCompetition', async (_, id) => {
  return db.deleteCompetition(id);
});

ipcMain.handle('db:updateCompetition', async (_, id, updates) => {
  return db.updateCompetition(id, updates);
});

// Fencer handlers
ipcMain.handle('db:addFencer', async (_, competitionId, fencer) => {
  return db.addFencer(competitionId, fencer);
});

ipcMain.handle('db:getFencer', async (_, id) => {
  return db.getFencer(id);
});

ipcMain.handle('db:getFencersByCompetition', async (_, competitionId) => {
  return db.getFencersByCompetition(competitionId);
});

ipcMain.handle('db:updateFencer', async (_, id, updates) => {
  return db.updateFencer(id, updates);
});

// Match handlers
ipcMain.handle('db:createMatch', async (_, match, poolId) => {
  return db.createMatch(match, poolId);
});

ipcMain.handle('db:getMatch', async (_, id) => {
  return db.getMatch(id);
});

ipcMain.handle('db:getMatchesByPool', async (_, poolId) => {
  return db.getMatchesByPool(poolId);
});

ipcMain.handle('db:updateMatch', async (_, id, updates) => {
  return db.updateMatch(id, updates);
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
ipcMain.handle('file:export', async (_, filepath) => {
  db.exportToFile(filepath);
});

ipcMain.handle('file:import', async (_, filepath) => {
  await db.importFromFile(filepath);
});

// Dialog handlers
ipcMain.handle('dialog:openFile', async (_, options) => {
  return dialog.showOpenDialog(mainWindow!, options);
});

ipcMain.handle('dialog:saveFile', async (_, options) => {
  return dialog.showSaveDialog(mainWindow!, options);
});

// ============================================================================
// App Lifecycle
// ============================================================================

app.whenReady().then(async () => {
  // Initialize database
  await db.open();
  
  createWindow();

  // Autosave every 2 minutes
  let autosaveInterval: NodeJS.Timeout | null = null;
  
  const startAutosave = () => {
    if (autosaveInterval) clearInterval(autosaveInterval);
    autosaveInterval = setInterval(() => {
      try {
        db.forceSave();
        console.log('Autosave completed at', new Date().toISOString());
        mainWindow?.webContents.send('autosave:completed');
      } catch (error) {
        console.error('Autosave failed:', error);
        mainWindow?.webContents.send('autosave:failed');
      }
    }, 2 * 60 * 1000); // 2 minutes
  };
  
  startAutosave();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  db.forceSave(); // Save before closing
  db.close();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  db.forceSave(); // Save before quitting
  db.close();
});

// Handle uncaught exceptions - save before crash
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  try {
    db.forceSave(); // Try to save data before showing error
  } catch (e) {
    console.error('Failed to save on crash:', e);
  }
  dialog.showErrorBox('Erreur', `Une erreur inattendue s'est produite: ${error.message}`);
});
