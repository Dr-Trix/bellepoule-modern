/**
 * BellePoule Modern - Preload Script
 * Exposes safe APIs to the renderer process
 * Licensed under GPL-3.0
 */

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process
// to use the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  db: {
    // Competitions
    createCompetition: (data: any) => ipcRenderer.invoke('db:createCompetition', data),
    getCompetition: (id: string) => ipcRenderer.invoke('db:getCompetition', id),
    getAllCompetitions: () => ipcRenderer.invoke('db:getAllCompetitions'),
    updateCompetition: (id: string, updates: any) => 
      ipcRenderer.invoke('db:updateCompetition', id, updates),
    deleteCompetition: (id: string) => ipcRenderer.invoke('db:deleteCompetition', id),
    
    // Fencers
    addFencer: (competitionId: string, fencer: any) => 
      ipcRenderer.invoke('db:addFencer', competitionId, fencer),
    getFencer: (id: string) => ipcRenderer.invoke('db:getFencer', id),
    getFencersByCompetition: (competitionId: string) => 
      ipcRenderer.invoke('db:getFencersByCompetition', competitionId),
    updateFencer: (id: string, updates: any) => 
      ipcRenderer.invoke('db:updateFencer', id, updates),
    
    // Matches
    createMatch: (match: any, poolId?: string) => 
      ipcRenderer.invoke('db:createMatch', match, poolId),
    getMatch: (id: string) => ipcRenderer.invoke('db:getMatch', id),
    getMatchesByPool: (poolId: string) => 
      ipcRenderer.invoke('db:getMatchesByPool', poolId),
    updateMatch: (id: string, updates: any) => 
      ipcRenderer.invoke('db:updateMatch', id, updates),
    
    // Pools
    createPool: (phaseId: string, number: number) => 
      ipcRenderer.invoke('db:createPool', phaseId, number),
    addFencerToPool: (poolId: string, fencerId: string, position: number) => 
      ipcRenderer.invoke('db:addFencerToPool', poolId, fencerId, position),
    getPoolFencers: (poolId: string) => 
      ipcRenderer.invoke('db:getPoolFencers', poolId),
  },

  // File operations
  file: {
    export: (filepath: string) => ipcRenderer.invoke('file:export', filepath),
    import: (filepath: string) => ipcRenderer.invoke('file:import', filepath),
  },

  // Dialog operations
  dialog: {
    openFile: (options: any) => ipcRenderer.invoke('dialog:openFile', options),
    saveFile: (options: any) => ipcRenderer.invoke('dialog:saveFile', options),
  },

  // Menu event listeners
  onMenuNewCompetition: (callback: () => void) => 
    ipcRenderer.on('menu:new-competition', callback),
  onMenuSave: (callback: () => void) => 
    ipcRenderer.on('menu:save', callback),
  onMenuCompetitionProperties: (callback: () => void) => 
    ipcRenderer.on('menu:competition-properties', callback),
  onMenuAddFencer: (callback: () => void) => 
    ipcRenderer.on('menu:add-fencer', callback),
  onMenuAddReferee: (callback: () => void) => 
    ipcRenderer.on('menu:add-referee', callback),
  onMenuNextPhase: (callback: () => void) => 
    ipcRenderer.on('menu:next-phase', callback),
  onMenuExport: (callback: (format: string) => void) => 
    ipcRenderer.on('menu:export', (_, format) => callback(format)),
  onMenuImport: (callback: (format: string, filepath: string, content: string) => void) => 
    ipcRenderer.on('menu:import', (_, format, filepath, content) => callback(format, filepath, content)),
  onMenuReportIssue: (callback: () => void) => 
    ipcRenderer.on('menu:report-issue', callback),
  onFileOpened: (callback: (filepath: string) => void) => 
    ipcRenderer.on('file:opened', (_, filepath) => callback(filepath)),
  onFileSaved: (callback: (filepath: string) => void) => 
    ipcRenderer.on('file:saved', (_, filepath) => callback(filepath)),
  onAutosaveCompleted: (callback: () => void) => 
    ipcRenderer.on('autosave:completed', callback),
  onAutosaveFailed: (callback: () => void) => 
    ipcRenderer.on('autosave:failed', callback),

  // Utility functions
  openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
  getVersionInfo: () => ipcRenderer.invoke('app:getVersionInfo'),

  // Remove listeners
  removeAllListeners: (channel: string) => 
    ipcRenderer.removeAllListeners(channel),
});

// Type declarations for the renderer
declare global {
  interface Window {
    electronAPI: {
      db: {
        createCompetition: (data: any) => Promise<any>;
        getCompetition: (id: string) => Promise<any>;
        getAllCompetitions: () => Promise<any[]>;
        updateCompetition: (id: string, updates: any) => Promise<void>;
        deleteCompetition: (id: string) => Promise<void>;
        addFencer: (competitionId: string, fencer: any) => Promise<any>;
        getFencer: (id: string) => Promise<any>;
        getFencersByCompetition: (competitionId: string) => Promise<any[]>;
        updateFencer: (id: string, updates: any) => Promise<void>;
        createMatch: (match: any, poolId?: string) => Promise<any>;
        getMatch: (id: string) => Promise<any>;
        getMatchesByPool: (poolId: string) => Promise<any[]>;
        updateMatch: (id: string, updates: any) => Promise<void>;
        createPool: (phaseId: string, number: number) => Promise<any>;
        addFencerToPool: (poolId: string, fencerId: string, position: number) => Promise<void>;
        getPoolFencers: (poolId: string) => Promise<any[]>;
      };
      file: {
        export: (filepath: string) => Promise<void>;
        import: (filepath: string) => Promise<void>;
      };
      dialog: {
        openFile: (options: any) => Promise<any>;
        saveFile: (options: any) => Promise<any>;
      };
      onMenuNewCompetition: (callback: () => void) => void;
      onMenuSave: (callback: () => void) => void;
      onMenuCompetitionProperties: (callback: () => void) => void;
      onMenuAddFencer: (callback: () => void) => void;
      onMenuAddReferee: (callback: () => void) => void;
      onMenuNextPhase: (callback: () => void) => void;
      onMenuExport: (callback: (format: string) => void) => void;
      onMenuImport: (callback: (format: string, filepath: string, content: string) => void) => void;
      onMenuReportIssue: (callback: () => void) => void;
      onFileOpened: (callback: (filepath: string) => void) => void;
      onFileSaved: (callback: (filepath: string) => void) => void;
      onAutosaveCompleted: (callback: () => void) => void;
      onAutosaveFailed: (callback: () => void) => void;
      openExternal: (url: string) => Promise<void>;
      getVersionInfo: () => Promise<{ version: string; build: number; date: string }>;
      removeAllListeners: (channel: string) => void;
    };
  }
}
