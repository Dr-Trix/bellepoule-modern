/**
 * BellePoule Modern - Main App Component
 * Licensed under GPL-3.0
 */

import React, { useState, useEffect } from 'react';
import { Competition, Fencer, FencerStatus, Pool, Match, PhaseType } from '../shared/types';
import CompetitionList from './components/CompetitionList';
import CompetitionView from './components/CompetitionView';
import NewCompetitionModal from './components/NewCompetitionModal';
import ReportIssueModal from './components/ReportIssueModal';
import UpdateNotification from './components/UpdateNotification';
import { ToastProvider } from './components/Toast';

type View = 'home' | 'competition';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [currentCompetition, setCurrentCompetition] = useState<Competition | null>(null);
  const [showNewCompetitionModal, setShowNewCompetitionModal] = useState(false);
  const [showReportIssueModal, setShowReportIssueModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load competitions on mount
  useEffect(() => {
    loadCompetitions();
    
    // Listen for menu events
    if (window.electronAPI) {
      window.electronAPI.onMenuNewCompetition(() => setShowNewCompetitionModal(true));
      window.electronAPI.onMenuReportIssue(() => setShowReportIssueModal(true));
      
      // Listen for file operations
      window.electronAPI.onFileOpened(async (filepath: string) => {
        console.log('Fichier .BPM ouvert:', filepath);
        // Recharger la liste des compétitions depuis la nouvelle base de données
        await loadCompetitions();
      });
      
      window.electronAPI.onFileSaved(async (filepath: string) => {
        console.log('Fichier sauvegardé:', filepath);
        // Optionnel: afficher une confirmation de sauvegarde
      });
    }
    
    return () => {
      if (window.electronAPI?.removeAllListeners) {
        window.electronAPI.removeAllListeners('menu:new-competition');
        window.electronAPI.removeAllListeners('menu:report-issue');
        window.electronAPI.removeAllListeners('file:opened');
        window.electronAPI.removeAllListeners('file:saved');
      }
    };
  }, []);

  const loadCompetitions = async () => {
    setIsLoading(true);
    try {
      if (window.electronAPI) {
        const comps = await window.electronAPI.db.getAllCompetitions();
        setCompetitions(comps);
      }
    } catch (error) {
      console.error('Failed to load competitions:', error);
    }
    setIsLoading(false);
  };

  const handleCreateCompetition = async (data: Partial<Competition>) => {
    try {
      if (window.electronAPI) {
        // Assurer que le titre est défini
        const competitionData = {
          title: data.title || 'Nouvelle compétition',
          date: data.date || new Date(),
          weapon: data.weapon || 'FOIL',
          gender: data.gender || 'M',
          category: data.category || 'SENIOR',
          ...data
        };
        const newComp = await window.electronAPI.db.createCompetition(competitionData as any);
        setCompetitions([newComp, ...competitions]);
        setCurrentCompetition(newComp);
        setView('competition');
      }
    } catch (error) {
      console.error('Failed to create competition:', error);
    }
    setShowNewCompetitionModal(false);
  };

  const handleSelectCompetition = async (competition: Competition) => {
    try {
      if (window.electronAPI) {
        // Load full competition with fencers
        const comp = await window.electronAPI.db.getCompetition(competition.id);
        if (comp) {
          const fencers = await window.electronAPI.db.getFencersByCompetition(competition.id);
          comp.fencers = fencers;
          setCurrentCompetition(comp);
          setView('competition');
        }
      }
    } catch (error) {
      console.error('Failed to load competition:', error);
    }
  };

  const handleDeleteCompetition = async (id: string) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.db.deleteCompetition(id);
        setCompetitions(competitions.filter(c => c.id !== id));
        if (currentCompetition?.id === id) {
          setCurrentCompetition(null);
          setView('home');
        }
      }
    } catch (error) {
      console.error('Failed to delete competition:', error);
    }
  };

  const handleBack = () => {
    setView('home');
    setCurrentCompetition(null);
    loadCompetitions();
  };

  const handleUpdateCompetition = (updated: Competition) => {
    setCurrentCompetition(updated);
    setCompetitions(competitions.map(c => c.id === updated.id ? updated : c));
  };

  return (
    <ToastProvider>
      <UpdateNotification />
      <div className="app">
      <header className="header">
        <div className="header-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
            <path d="M13 19l6-6" />
            <path d="M16 16l4 4" />
            <path d="M19 21a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
          BellePoule Modern
        </div>
        {view === 'competition' && (
          <button className="btn btn-secondary" onClick={handleBack}>
            ← Retour
          </button>
        )}
        <div className="header-nav">
          <button 
            className="btn btn-primary"
            onClick={() => setShowNewCompetitionModal(true)}
          >
            + Nouvelle compétition
          </button>
        </div>
      </header>

      <main className="main">
        {view === 'home' && (
          <CompetitionList
            competitions={competitions}
            isLoading={isLoading}
            onSelect={handleSelectCompetition}
            onDelete={handleDeleteCompetition}
            onNewCompetition={() => setShowNewCompetitionModal(true)}
          />
        )}

        {view === 'competition' && currentCompetition && (
          <CompetitionView
            competition={currentCompetition}
            onUpdate={handleUpdateCompetition}
          />
        )}
      </main>

      {showNewCompetitionModal && (
        <NewCompetitionModal
          onClose={() => setShowNewCompetitionModal(false)}
          onCreate={handleCreateCompetition}
        />
      )}

      {showReportIssueModal && (
        <ReportIssueModal
          onClose={() => setShowReportIssueModal(false)}
        />
      )}
    </div>
    </ToastProvider>
  );
};

export default App;
