/**
 * BellePoule Modern - PDF Export Service
 * Export des poules avec grille de scores et matches restants
 * Licensed under GPL-3.0
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Pool, Match, MatchStatus, Fencer, PoolRanking } from '../types';

// Constantes pour A4 portrait
const PAGE = {
  WIDTH: 210,
  HEIGHT: 297,
  MARGIN: 10,
  CONTENT_WIDTH: 190, // 210 - 2*10
} as const;

interface PoolExportOptions {
  title?: string;
  includeFinishedMatches?: boolean;
  includePendingMatches?: boolean;
  includePoolStats?: boolean;
}

/**
 * Calcule le score d'un tireur contre un autre dans la poule
 */
function getScoreForCell(fencer: Fencer, opponent: Fencer, matches: Match[]): { display: string; isVictory: boolean } | null {
  const match = matches.find(m => 
    (m.fencerA?.id === fencer.id && m.fencerB?.id === opponent.id) ||
    (m.fencerB?.id === fencer.id && m.fencerA?.id === opponent.id)
  );
  
  if (!match || match.status !== MatchStatus.FINISHED) {
    return null;
  }
  
  const isFencerA = match.fencerA?.id === fencer.id;
  const score = isFencerA ? match.scoreA : match.scoreB;
  
  if (!score) return null;
  
  return {
    display: `${score.isVictory ? 'V' : ''}${score.value ?? 0}`,
    isVictory: score.isVictory
  };
}

/**
 * Calcule les statistiques d'un tireur
 */
function calculateFencerStats(fencer: Fencer, matches: Match[]): { v: number; d: number; td: number; tr: number; ind: number; ratio: number } {
  let v = 0, d = 0, td = 0, tr = 0;
  
  for (const match of matches) {
    if (match.status !== MatchStatus.FINISHED) continue;
    
    const isFencerA = match.fencerA?.id === fencer.id;
    const isFencerB = match.fencerB?.id === fencer.id;
    
    if (!isFencerA && !isFencerB) continue;
    
    const myScore = isFencerA ? match.scoreA : match.scoreB;
    const oppScore = isFencerA ? match.scoreB : match.scoreA;
    
    if (!myScore || !oppScore) continue;
    
    td += myScore.value ?? 0;
    tr += oppScore.value ?? 0;
    
    if (myScore.isVictory) {
      v++;
    } else {
      d++;
    }
  }
  
  const played = v + d;
  const ratio = played > 0 ? v / played : 0;
  const ind = td - tr;
  
  return { v, d, td, tr, ind, ratio };
}

/**
 * Exporte une poule en PDF avec grille de scores
 */
export async function exportPoolToPDF(pool: Pool, options: PoolExportOptions = {}): Promise<void> {
  const {
    title = `Poule ${pool.number}`,
  } = options;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  let y = PAGE.MARGIN;
  const fencers = pool.fencers;
  const matches = pool.matches;
  
  // === TITRE ===
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, PAGE.WIDTH / 2, y, { align: 'center' });
  y += 8;
  
  // Sous-titre avec stats
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const finishedCount = matches.filter(m => m.status === MatchStatus.FINISHED).length;
  const pendingCount = matches.length - finishedCount;
  doc.text(`${fencers.length} tireurs • ${finishedCount}/${matches.length} matchs joués`, PAGE.WIDTH / 2, y, { align: 'center' });
  y += 10;
  
  // === GRILLE DES SCORES ===
  const gridStartX = PAGE.MARGIN;
  const nameColWidth = 35;
  const numColWidth = 8;
  const scoreColWidth = 10;
  const statsColWidth = 10;
  const cellHeight = 7;
  
  // Calculer la largeur totale nécessaire
  const gridWidth = nameColWidth + numColWidth + (fencers.length * scoreColWidth) + (6 * statsColWidth); // V, D, TD, TR, Ind, Rg
  
  // En-tête de la grille
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  
  // Dessiner l'en-tête
  let x = gridStartX;
  
  // Colonne vide pour les noms
  doc.rect(x, y, nameColWidth, cellHeight);
  x += nameColWidth;
  
  // Colonne numéro
  doc.rect(x, y, numColWidth, cellHeight);
  x += numColWidth;
  
  // Numéros des colonnes (1, 2, 3...)
  for (let i = 0; i < fencers.length; i++) {
    doc.rect(x, y, scoreColWidth, cellHeight);
    doc.text(`${i + 1}`, x + scoreColWidth / 2, y + 5, { align: 'center' });
    x += scoreColWidth;
  }
  
  // En-têtes des stats
  const statsHeaders = ['V', 'V/M', 'TD', 'TR', 'Ind', 'Rg'];
  for (const header of statsHeaders) {
    doc.rect(x, y, statsColWidth, cellHeight);
    doc.text(header, x + statsColWidth / 2, y + 5, { align: 'center' });
    x += statsColWidth;
  }
  
  y += cellHeight;
  
  // Lignes de la grille (une par tireur)
  doc.setFont('helvetica', 'normal');
  
  // Calculer le classement
  const rankings: { fencer: Fencer; stats: ReturnType<typeof calculateFencerStats>; rank: number }[] = fencers.map(f => ({
    fencer: f,
    stats: calculateFencerStats(f, matches),
    rank: 0
  }));
  
  // Trier pour le classement
  rankings.sort((a, b) => {
    if (a.stats.ratio !== b.stats.ratio) return b.stats.ratio - a.stats.ratio;
    if (a.stats.ind !== b.stats.ind) return b.stats.ind - a.stats.ind;
    return b.stats.td - a.stats.td;
  });
  
  // Assigner les rangs
  rankings.forEach((r, idx) => { r.rank = idx + 1; });
  
  // Remettre dans l'ordre original
  const rankMap = new Map(rankings.map(r => [r.fencer.id, r]));
  
  for (let row = 0; row < fencers.length; row++) {
    const fencer = fencers[row];
    const fencerData = rankMap.get(fencer.id)!;
    const stats = fencerData.stats;
    
    x = gridStartX;
    
    // Nom du tireur
    doc.rect(x, y, nameColWidth, cellHeight);
    const displayName = `${fencer.lastName} ${fencer.firstName?.charAt(0) || ''}.`;
    doc.text(displayName.substring(0, 18), x + 1, y + 5);
    x += nameColWidth;
    
    // Numéro de ligne
    doc.rect(x, y, numColWidth, cellHeight);
    doc.text(`${row + 1}`, x + numColWidth / 2, y + 5, { align: 'center' });
    x += numColWidth;
    
    // Scores contre chaque adversaire
    for (let col = 0; col < fencers.length; col++) {
      doc.rect(x, y, scoreColWidth, cellHeight);
      
      if (row === col) {
        // Diagonale - case grise
        doc.setFillColor(200, 200, 200);
        doc.rect(x, y, scoreColWidth, cellHeight, 'F');
        doc.rect(x, y, scoreColWidth, cellHeight, 'S');
      } else {
        const opponent = fencers[col];
        const scoreData = getScoreForCell(fencer, opponent, matches);
        
        if (scoreData) {
          if (scoreData.isVictory) {
            doc.setFillColor(220, 252, 231); // Vert clair
            doc.rect(x, y, scoreColWidth, cellHeight, 'F');
            doc.rect(x, y, scoreColWidth, cellHeight, 'S');
          }
          doc.text(scoreData.display, x + scoreColWidth / 2, y + 5, { align: 'center' });
        }
      }
      x += scoreColWidth;
    }
    
    // Stats
    doc.setFillColor(255, 255, 255);
    
    // V
    doc.rect(x, y, statsColWidth, cellHeight);
    doc.text(`${stats.v}`, x + statsColWidth / 2, y + 5, { align: 'center' });
    x += statsColWidth;
    
    // V/M
    doc.rect(x, y, statsColWidth, cellHeight);
    doc.text(`${(stats.ratio).toFixed(2)}`, x + statsColWidth / 2, y + 5, { align: 'center' });
    x += statsColWidth;
    
    // TD
    doc.rect(x, y, statsColWidth, cellHeight);
    doc.text(`${stats.td}`, x + statsColWidth / 2, y + 5, { align: 'center' });
    x += statsColWidth;
    
    // TR
    doc.rect(x, y, statsColWidth, cellHeight);
    doc.text(`${stats.tr}`, x + statsColWidth / 2, y + 5, { align: 'center' });
    x += statsColWidth;
    
    // Ind
    doc.rect(x, y, statsColWidth, cellHeight);
    const indStr = stats.ind >= 0 ? `+${stats.ind}` : `${stats.ind}`;
    doc.text(indStr, x + statsColWidth / 2, y + 5, { align: 'center' });
    x += statsColWidth;
    
    // Rang
    doc.rect(x, y, statsColWidth, cellHeight);
    doc.setFont('helvetica', 'bold');
    doc.text(`${fencerData.rank}`, x + statsColWidth / 2, y + 5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    x += statsColWidth;
    
    y += cellHeight;
  }
  
  y += 10;
  
  // === MATCHES RESTANTS ===
  const pendingMatches = matches.filter(m => m.status !== MatchStatus.FINISHED);
  
  if (pendingMatches.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Matchs restants (${pendingMatches.length})`, PAGE.MARGIN, y);
    y += 6;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    // Afficher en colonnes multiples
    const colWidth = 60;
    const cols = Math.floor(PAGE.CONTENT_WIDTH / colWidth);
    const rowsPerCol = Math.ceil(pendingMatches.length / cols);
    const lineHeight = 5;
    
    const startY = y;
    
    for (let i = 0; i < pendingMatches.length; i++) {
      const match = pendingMatches[i];
      const col = Math.floor(i / rowsPerCol);
      const row = i % rowsPerCol;
      
      const matchX = PAGE.MARGIN + (col * colWidth);
      const matchY = startY + (row * lineHeight);
      
      // Trouver le numéro du match original
      const matchIndex = matches.indexOf(match) + 1;
      
      const fencerA = match.fencerA?.lastName || '?';
      const fencerB = match.fencerB?.lastName || '?';
      
      doc.text(`${matchIndex}. ${fencerA} - ${fencerB}`, matchX, matchY);
    }
    
    y = startY + (rowsPerCol * lineHeight) + 5;
  }
  
  // === MATCHES TERMINÉS ===
  const finishedMatches = matches.filter(m => m.status === MatchStatus.FINISHED);
  
  if (finishedMatches.length > 0 && y < PAGE.HEIGHT - 50) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Matchs terminés (${finishedMatches.length})`, PAGE.MARGIN, y);
    y += 6;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    // Afficher en colonnes multiples
    const colWidth = 70;
    const cols = Math.floor(PAGE.CONTENT_WIDTH / colWidth);
    const rowsPerCol = Math.ceil(finishedMatches.length / cols);
    const lineHeight = 5;
    
    const startY = y;
    
    for (let i = 0; i < finishedMatches.length; i++) {
      const match = finishedMatches[i];
      const col = Math.floor(i / rowsPerCol);
      const row = i % rowsPerCol;
      
      const matchX = PAGE.MARGIN + (col * colWidth);
      const matchY = startY + (row * lineHeight);
      
      // Trouver le numéro du match original
      const matchIndex = matches.indexOf(match) + 1;
      
      const fencerA = match.fencerA?.lastName || '?';
      const fencerB = match.fencerB?.lastName || '?';
      const scoreA = match.scoreA?.isVictory ? `V${match.scoreA.value}` : `${match.scoreA?.value || 0}`;
      const scoreB = match.scoreB?.isVictory ? `V${match.scoreB.value}` : `${match.scoreB?.value || 0}`;
      
      doc.text(`${matchIndex}. ${fencerA} ${scoreA}-${scoreB} ${fencerB}`, matchX, matchY);
    }
  }
  
  // Télécharger
  const filename = `poule-${pool.number}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

/**
 * Exporte plusieurs poules dans un seul PDF
 */
export async function exportMultiplePoolsToPDF(pools: Pool[], title: string = 'Export des Poules'): Promise<void> {
  if (pools.length === 0) {
    throw new Error('Aucune poule à exporter');
  }
  
  // Pour l'instant, exporter chaque poule séparément
  for (const pool of pools) {
    await exportPoolToPDF(pool, { title: `${title} - Poule ${pool.number}` });
  }
}

// Alias pour compatibilité
export const exportOptimizedPoolToPDF = exportPoolToPDF;
