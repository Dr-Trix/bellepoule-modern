"use strict";
/**
 * BellePoule Modern - Preload Script
 * Exposes safe APIs to the renderer process with type safety
 * Licensed under GPL-3.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Input validation functions
const validateCompetitionData = (data) => {
    if (!data.title || typeof data.title !== 'string') {
        throw new Error('Competition title is required and must be a string');
    }
    if (!data.date || !(data.date instanceof Date)) {
        throw new Error('Competition date is required and must be a Date');
    }
    if (!data.weapon || typeof data.weapon !== 'string') {
        throw new Error('Weapon is required and must be a string');
    }
};
const validateFencerData = (fencer) => {
    if (!fencer.lastName || typeof fencer.lastName !== 'string') {
        throw new Error('Fencer last name is required and must be a string');
    }
    if (!fencer.firstName || typeof fencer.firstName !== 'string') {
        throw new Error('Fencer first name is required and must be a string');
    }
    if (typeof fencer.ref !== 'number' || fencer.ref < 0) {
        throw new Error('Fencer reference number is required and must be positive');
    }
};
const validateMatchData = (match) => {
    if (typeof match.number !== 'number' || match.number < 0) {
        throw new Error('Match number is required and must be positive');
    }
    if (typeof match.maxScore !== 'number' || match.maxScore < 0) {
        throw new Error('Match max score is required and must be positive');
    }
};
// Expose protected methods that allow the renderer process
// to use the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // Database operations with validation
    db: {
        // Competitions
        createCompetition: (data) => {
            validateCompetitionData(data);
            return electron_1.ipcRenderer.invoke('db:createCompetition', data);
        },
        getCompetition: (id) => {
            if (!id || typeof id !== 'string') {
                throw new Error('Competition ID is required and must be a string');
            }
            return electron_1.ipcRenderer.invoke('db:getCompetition', id);
        },
        getAllCompetitions: () => electron_1.ipcRenderer.invoke('db:getAllCompetitions'),
        updateCompetition: (id, updates) => {
            if (!id || typeof id !== 'string') {
                throw new Error('Competition ID is required and must be a string');
            }
            return electron_1.ipcRenderer.invoke('db:updateCompetition', id, updates);
        },
        deleteCompetition: (id) => {
            if (!id || typeof id !== 'string') {
                throw new Error('Competition ID is required and must be a string');
            }
            return electron_1.ipcRenderer.invoke('db:deleteCompetition', id);
        },
        // Fencers
        addFencer: (competitionId, fencer) => {
            if (!competitionId || typeof competitionId !== 'string') {
                throw new Error('Competition ID is required and must be a string');
            }
            validateFencerData(fencer);
            return electron_1.ipcRenderer.invoke('db:addFencer', competitionId, fencer);
        },
        getFencer: (id) => {
            if (!id || typeof id !== 'string') {
                throw new Error('Fencer ID is required and must be a string');
            }
            return electron_1.ipcRenderer.invoke('db:getFencer', id);
        },
        getFencersByCompetition: (competitionId) => {
            if (!competitionId || typeof competitionId !== 'string') {
                throw new Error('Competition ID is required and must be a string');
            }
            return electron_1.ipcRenderer.invoke('db:getFencersByCompetition', competitionId);
        },
        updateFencer: (id, updates) => {
            if (!id || typeof id !== 'string') {
                throw new Error('Fencer ID is required and must be a string');
            }
            return electron_1.ipcRenderer.invoke('db:updateFencer', id, updates);
        },
        deleteFencer: (id) => {
            if (!id || typeof id !== 'string') {
                throw new Error('Fencer ID is required and must be a string');
            }
            return electron_1.ipcRenderer.invoke('db:deleteFencer', id);
        },
        // Matches
        createMatch: (match, poolId) => {
            validateMatchData(match);
            return electron_1.ipcRenderer.invoke('db:createMatch', match, poolId);
        },
        getMatch: (id) => {
            if (!id || typeof id !== 'string') {
                throw new Error('Match ID is required and must be a string');
            }
            return electron_1.ipcRenderer.invoke('db:getMatch', id);
        },
        getMatchesByPool: (poolId) => {
            if (!poolId || typeof poolId !== 'string') {
                throw new Error('Pool ID is required and must be a string');
            }
            return electron_1.ipcRenderer.invoke('db:getMatchesByPool', poolId);
        },
        updateMatch: (id, updates) => {
            if (!id || typeof id !== 'string') {
                throw new Error('Match ID is required and must be a string');
            }
            return electron_1.ipcRenderer.invoke('db:updateMatch', id, updates);
        },
        // Pools
        createPool: (phaseId, number) => {
            if (!phaseId || typeof phaseId !== 'string') {
                throw new Error('Phase ID is required and must be a string');
            }
            if (typeof number !== 'number' || number < 0) {
                throw new Error('Pool number is required and must be positive');
            }
            return electron_1.ipcRenderer.invoke('db:createPool', phaseId, number);
        },
        addFencerToPool: (poolId, fencerId, position) => {
            if (!poolId || typeof poolId !== 'string') {
                throw new Error('Pool ID is required and must be a string');
            }
            if (!fencerId || typeof fencerId !== 'string') {
                throw new Error('Fencer ID is required and must be a string');
            }
            if (typeof position !== 'number' || position < 0) {
                throw new Error('Position is required and must be positive');
            }
            return electron_1.ipcRenderer.invoke('db:addFencerToPool', poolId, fencerId, position);
        },
        getPoolFencers: (poolId) => {
            if (!poolId || typeof poolId !== 'string') {
                throw new Error('Pool ID is required and must be a string');
            }
            return electron_1.ipcRenderer.invoke('db:getPoolFencers', poolId);
        },
        updatePool: (pool) => {
            if (!pool || typeof pool !== 'object') {
                throw new Error('Pool is required and must be an object');
            }
            return electron_1.ipcRenderer.invoke('db:updatePool', pool);
        },
        // Session State
        saveSessionState: (competitionId, state) => {
            if (!competitionId || typeof competitionId !== 'string') {
                throw new Error('Competition ID is required and must be a string');
            }
            return electron_1.ipcRenderer.invoke('db:saveSessionState', competitionId, state);
        },
        getSessionState: (competitionId) => {
            if (!competitionId || typeof competitionId !== 'string') {
                throw new Error('Competition ID is required and must be a string');
            }
            return electron_1.ipcRenderer.invoke('db:getSessionState', competitionId);
        },
        clearSessionState: (competitionId) => {
            if (!competitionId || typeof competitionId !== 'string') {
                throw new Error('Competition ID is required and must be a string');
            }
            return electron_1.ipcRenderer.invoke('db:clearSessionState', competitionId);
        },
    },
    // File operations with validation
    file: {
        export: (filepath) => {
            if (!filepath || typeof filepath !== 'string') {
                throw new Error('Filepath is required and must be a string');
            }
            return electron_1.ipcRenderer.invoke('file:export', filepath);
        },
        import: (filepath) => {
            if (!filepath || typeof filepath !== 'string') {
                throw new Error('Filepath is required and must be a string');
            }
            return electron_1.ipcRenderer.invoke('file:import', filepath);
        },
    },
    // Dialog operations with validation
    dialog: {
        openFile: (options) => {
            if (!options || typeof options !== 'object') {
                throw new Error('Dialog options are required');
            }
            return electron_1.ipcRenderer.invoke('dialog:openFile', options);
        },
        saveFile: (options) => {
            if (!options || typeof options !== 'object') {
                throw new Error('Dialog options are required');
            }
            return electron_1.ipcRenderer.invoke('dialog:saveFile', options);
        },
    },
    // Menu event listeners
    onMenuNewCompetition: (callback) => electron_1.ipcRenderer.on('menu:new-competition', callback),
    onMenuSave: (callback) => electron_1.ipcRenderer.on('menu:save', callback),
    onMenuCompetitionProperties: (callback) => electron_1.ipcRenderer.on('menu:competition-properties', callback),
    onMenuAddFencer: (callback) => electron_1.ipcRenderer.on('menu:add-fencer', callback),
    onMenuAddReferee: (callback) => electron_1.ipcRenderer.on('menu:add-referee', callback),
    onMenuNextPhase: (callback) => electron_1.ipcRenderer.on('menu:next-phase', callback),
    onMenuExport: (callback) => electron_1.ipcRenderer.on('menu:export', (_, format) => callback(format)),
    onMenuImport: (callback) => electron_1.ipcRenderer.on('menu:import', (_, format, filepath, content) => callback(format, filepath, content)),
    onMenuReportIssue: (callback) => electron_1.ipcRenderer.on('menu:report-issue', callback),
    onFileOpened: (callback) => electron_1.ipcRenderer.on('file:opened', (_, filepath) => callback(filepath)),
    onFileSaved: (callback) => electron_1.ipcRenderer.on('file:saved', (_, filepath) => callback(filepath)),
    onAutosaveCompleted: (callback) => electron_1.ipcRenderer.on('autosave:completed', callback),
    onAutosaveFailed: (callback) => electron_1.ipcRenderer.on('autosave:failed', callback),
    // Utility functions
    openExternal: (url) => electron_1.ipcRenderer.invoke('shell:openExternal', url),
    getVersionInfo: () => electron_1.ipcRenderer.invoke('app:getVersionInfo'),
    // Remove listeners
    removeAllListeners: (channel) => electron_1.ipcRenderer.removeAllListeners(channel),
});
//# sourceMappingURL=preload.js.map