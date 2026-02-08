/**
 * BellePoule Modern - Remote Score Management Component
 * Interface for managing remote score entry
 * Licensed under GPL-3.0
 */

import React, { useState, useEffect } from 'react';
import { Competition } from '../../shared/types';
import { useToast } from './Toast';
import { electronAPI } from '../../shared/types/preload';

interface RemoteScoreManagerProps {
  competition: Competition;
  isRemoteActive: boolean;
}

interface RemoteSession {
  competitionId: string;
  strips: Array<{
    number: number;
    status: 'available' | 'occupied' | 'maintenance';
    currentMatch?: any;
    assignedReferee?: string;
  }>;
  referees: Array<{
    id: string;
    name: string;
    code: string;
    isActive: boolean;
    currentMatch?: string;
    lastActivity: Date;
  }>;
  activeMatches: any[];
  isRunning: boolean;
  startTime?: Date;
}

const RemoteScoreManager: React.FC<RemoteScoreManagerProps> = ({ 
  competition, 
  isRemoteActive 
}) => {
  const { showToast } = useToast();
  const [session, setSession] = useState<RemoteSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refereeName, setRefereeName] = useState('');
  const [stripCount, setStripCount] = useState(4);
  const [serverUrl, setServerUrl] = useState<string>('http://localhost:3001');

  useEffect(() => {
    // Vérifier si le serveur distant est déjà actif
    checkRemoteStatus();
  }, []);

  const checkRemoteStatus = async () => {
    try {
      const result = await electronAPI.remote.getServerInfo();
      if (result.success) {
        setIsRemoteActive(true);
        setServerUrl(result.serverInfo.url);
      }
    } catch (error) {
      console.error('Error checking remote status:', error);
    }
  };

  const handleStartRemote = async () => {
    try {
      const result = await electronAPI.remote.startServer();
      if (result.success) {
        setIsRemoteActive(true);
        setServerUrl(result.serverInfo.url);
        showToast('Saisie distante démarrée avec succès', 'success');
        console.log('Serveur distant démarré sur:', result.serverInfo.url);
      } else {
        showToast(`Erreur: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error starting remote server:', error);
      showToast('Erreur lors du démarrage du serveur distant', 'error');
    }
  };

  const handleStopRemote = async () => {
    try {
      const result = await electronAPI.remote.stopServer();
      if (result.success) {
        setIsRemoteActive(false);
        setServerUrl('');
        showToast('Saisie distante arrêtée avec succès', 'success');
        console.log('Serveur distant arrêté');
      } else {
        showToast(`Erreur: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error stopping remote server:', error);
      showToast('Erreur lors de l\'arrêt du serveur distant', 'error');
    }
  };

  const checkSessionStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/session');
      if (response.ok) {
        const sessionData = await response.json();
        setSession(sessionData);
      }
    } catch (error) {
      console.error('Failed to check session status:', error);
    }
  };

  const handleStartSession = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitionId: competition.id,
          strips: stripCount
        })
      });

      if (response.ok) {
        const sessionData = await response.json();
        setSession(sessionData);
        showToast('Session de saisie distante démarrée', 'success');
      } else {
        const error = await response.json();
        showToast(`Erreur: ${error.error}`, 'error');
      }
    } catch (error) {
      showToast('Impossible de démarrer la session distante', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopSession = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/session/stop', {
        method: 'POST'
      });

      if (response.ok) {
        setSession(null);
        showToast('Session de saisie distante arrêtée', 'success');
      }
    } catch (error) {
      showToast('Impossible d\'arrêter la session distante', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReferee = async () => {
    if (!refereeName.trim()) {
      showToast('Veuillez entrer un nom d\'arbitre', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/referees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: refereeName })
      });

      if (response.ok) {
        const referee = await response.json();
        showToast(`Arbitre ${referee.name} ajouté avec le code ${referee.code}`, 'success');
        setRefereeName('');
        checkSessionStatus();
      }
    } catch (error) {
      showToast('Impossible d\'ajouter l\'arbitre', 'error');
    }
  };

  const generateMatchesForRemote = () => {
    const matches: Match[] = [];
    
    // Générer les matchs de poules
    // Note: À adapter selon la structure réelle de la compétition
    // competition.pools?.forEach(pool => {
    //   pool.matches.forEach(match => {
    //     if (match.status !== MatchStatus.FINISHED) {
    //       matches.push(match);
    //     }
    //   });
    // });

    // Générer les matchs de tableau
    // competition.tableau?.matches.forEach(match => {
    //   if (match.status !== MatchStatus.FINISHED) {
    //     matches.push(match);
    //   }
    // });

    return matches;
  };

  const assignMatchesToStrips = () => {
    if (!session) return;
    
    const matches = generateMatchesForRemote();
    const availableStrips = session.strips.filter(strip => strip.status === 'available');
    
    // Logique simple d'assignation des matchs aux pistes
    matches.slice(0, availableStrips.length).forEach((match, index) => {
      if (index < availableStrips.length) {
        // Assigner le match à la piste
        console.log(`Assigning match ${match.id} to strip ${availableStrips[index].number}`);
      }
    });
  };

  if (!isRemoteActive) {
    return (
      <div className="remote-score-manager">
        <div className="remote-status inactive">
          <h3>🔴 Saisie distante inactive</h3>
          <p>
            La saisie distante permet aux arbitres de saisir les scores depuis une tablette.
            Les arbitres se connectent via un navigateur web sur le réseau local.
          </p>
          <button 
            className="btn-primary" 
            onClick={handleStartRemote}
          >
            ⚡ Démarrer la saisie distante
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="remote-score-manager">
      <div className="remote-header">
        <div className="remote-status active">
          <h3>🟢 Saisie distante active</h3>
          <p>Les arbitres peuvent se connecter sur: <strong>{serverUrl}</strong></p>
        </div>
        <button 
          className="btn-secondary" 
          onClick={handleStopRemote}
        >
          🛑 Arrêter
        </button>
      </div>

      {!session ? (
        <div className="session-setup">
          <h4>Configuration de la session</h4>
          <div className="setup-form">
            <div className="form-group">
              <label>Nombre de pistes:</label>
              <input 
                type="number" 
                min="1" 
                max="20" 
                value={stripCount}
                onChange={(e) => setStripCount(parseInt(e.target.value) || 1)}
              />
            </div>
            <button 
              className="btn-primary"
              onClick={handleStartSession}
              disabled={isLoading}
            >
              {isLoading ? 'Démarrage...' : 'Démarrer la session'}
            </button>
          </div>
        </div>
      ) : (
        <div className="session-active">
          <div className="session-info">
            <h4>Session active</h4>
            <p>Démarrée: {session.startTime ? new Date(session.startTime).toLocaleString() : 'Inconnue'}</p>
            <p>Pistes: {session.strips.length}</p>
            <p>Arbitres: {session.referees.length}</p>
          </div>

          <div className="referee-management">
            <h5>Ajouter un arbitre</h5>
            <div className="add-referee">
              <input 
                type="text" 
                placeholder="Nom de l'arbitre"
                value={refereeName}
                onChange={(e) => setRefereeName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddReferee()}
              />
              <button 
                className="btn-primary"
                onClick={handleAddReferee}
              >
                Ajouter
              </button>
            </div>
          </div>

          <div className="referees-list">
            <h5>Arbitres ({session.referees.length})</h5>
            {session.referees.length === 0 ? (
              <p className="no-referees">Aucun arbitre ajouté</p>
            ) : (
              <div className="referee-grid">
                {session.referees.map(referee => (
                  <div key={referee.id} className={`referee-card ${referee.isActive ? 'active' : 'inactive'}`}>
                    <h6>{referee.name}</h6>
                    <p><strong>Code:</strong> {referee.code}</p>
                    <p><strong>Statut:</strong> {referee.isActive ? '🟢 Connecté' : '🔴 Déconnecté'}</p>
                    {referee.currentMatch && (
                      <p><strong>Match actuel:</strong> {referee.currentMatch}</p>
                    )}
                    <p><small>Dernière activité: {new Date(referee.lastActivity).toLocaleTimeString()}</small></p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="strips-status">
            <h5>État des pistes</h5>
            <div className="strip-grid">
              {session.strips.map(strip => (
                <div key={strip.number} className={`strip-card ${strip.status}`}>
                  <h6>Piste {strip.number}</h6>
                  <p><strong>Statut:</strong> {
                    strip.status === 'available' ? '✅ Disponible' :
                    strip.status === 'occupied' ? '🔄 Occupée' : '🔧 Maintenance'
                  }</p>
                  {strip.currentMatch && (
                    <p><strong>Match:</strong> {strip.currentMatch}</p>
                  )}
                  {strip.assignedReferee && (
                    <p><strong>Arbitre:</strong> {strip.assignedReferee}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="session-actions">
            <button 
              className="btn-secondary"
              onClick={assignMatchesToStrips}
            >
              📋 Assigner les matchs
            </button>
            <button 
              className="btn-danger"
              onClick={handleStopSession}
              disabled={isLoading}
            >
              🛑 Arrêter la session
            </button>
          </div>
        </div>
      )}

      <div className="remote-instructions">
        <h5>Instructions pour les arbitres</h5>
        <ol>
          <li>Ouvrir un navigateur web sur la tablette</li>
          <li>Aller à l'adresse: <strong>{serverUrl}</strong></li>
          <li>Entrer le code d'accès fourni par l'organisateur</li>
          <li>Saisir les scores du match en cours</li>
          <li>Cliquer sur "Match suivant" pour passer au match suivant</li>
        </ol>
      </div>
    </div>
  );
};

export default RemoteScoreManager;