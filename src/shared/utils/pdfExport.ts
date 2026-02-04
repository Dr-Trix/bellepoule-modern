/**
 * BellePoule Modern - PDF Export Service
 * Exports pools to PDF format with matches list
 * Licensed under GPL-3.0
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Pool, Match, MatchStatus, Fencer } from '../types';

interface PoolExportOptions {
  title?: string;
  includeFinishedMatches?: boolean;
  includePendingMatches?: boolean;
  includePoolStats?: boolean;
}

export class PDFExporter {
  private doc: jsPDF;
  private currentY: number = 20;

  constructor() {
    this.doc = new jsPDF();
  }

  /**
   * Exporte une poule complète en PDF
   */
  exportPool(pool: Pool, options: PoolExportOptions = {}): void {
    const {
      title = `Poule ${pool.number}`,
      includeFinishedMatches = true,
      includePendingMatches = true,
      includePoolStats = true
    } = options;

    this.doc = new jsPDF();
    this.currentY = 20;

    // Titre
    this.doc.setFontSize(18);
    this.doc.text(title, 105, this.currentY, { align: 'center' });
    this.currentY += 15;

    // Informations de la poule
    this.doc.setFontSize(12);
    this.doc.text(`Nombre de tireurs: ${pool.fencers.length}`, 20, this.currentY);
    this.currentY += 7;
    this.doc.text(`Nombre de matchs: ${pool.matches.length}`, 20, this.currentY);
    this.currentY += 7;

    const finishedMatches = pool.matches.filter(m => m.status === MatchStatus.FINISHED).length;
    const pendingMatches = pool.matches.length - finishedMatches;
    this.doc.text(`Matchs terminés: ${finishedMatches}/${pool.matches.length}`, 20, this.currentY);
    this.currentY += 15;

    // Tableau des tireurs
    this.addFencersTable(pool.fencers);

    // Nouvelle page pour les matchs
    this.doc.addPage();
    this.currentY = 20;

    this.doc.setFontSize(16);
    this.doc.text('Liste des Matchs', 105, this.currentY, { align: 'center' });
    this.currentY += 15;

    // Tableau des matchs
    this.addMatchesTable(pool.matches, {
      includeFinished: includeFinishedMatches,
      includePending: includePendingMatches
    });

    // Statistiques de la poule
    if (includePoolStats && pool.ranking.length > 0) {
      this.doc.addPage();
      this.currentY = 20;
      this.addPoolStats(pool);
    }

    // Télécharger le PDF
    const filename = `poule-${pool.number}-${new Date().toISOString().split('T')[0]}.pdf`;
    this.doc.save(filename);
  }

  /**
   * Exporte plusieurs poules dans un seul PDF
   */
  exportMultiplePools(pools: Pool[], title: string = 'Export des Poules'): void {
    this.doc = new jsPDF();
    this.currentY = 20;

    // Page de titre
    this.doc.setFontSize(20);
    this.doc.text(title, 105, this.currentY, { align: 'center' });
    this.currentY += 15;

    this.doc.setFontSize(12);
    this.doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, this.currentY, { align: 'center' });
    this.doc.text(`Nombre de poules: ${pools.length}`, 105, this.currentY + 7, { align: 'center' });

    // Exporter chaque poule sur des pages séparées
    pools.forEach((pool, index) => {
      if (index > 0) {
        this.doc.addPage();
      }
      
      this.currentY = 20;
      this.addPoolSummary(pool);
      this.addFencersTable(pool.fencers);
      this.addMatchesTable(pool.matches, {
        includeFinished: true,
        includePending: true
      });
    });

    const filename = `poules-multiples-${new Date().toISOString().split('T')[0]}.pdf`;
    this.doc.save(filename);
  }

  private addPoolSummary(pool: Pool): void {
    this.doc.setFontSize(16);
    this.doc.text(`Poule ${pool.number}`, 20, this.currentY);
    this.currentY += 10;

    this.doc.setFontSize(10);
    this.doc.text(`Tireurs: ${pool.fencers.length} | Matchs: ${pool.matches.length}`, 20, this.currentY);
    
    const finishedMatches = pool.matches.filter(m => m.status === MatchStatus.FINISHED).length;
    this.doc.text(`Terminés: ${finishedMatches}/${pool.matches.length}`, 20, this.currentY + 5);
    this.currentY += 15;
  }

  private addFencersTable(fencers: Fencer[]): void {
    const tableData = fencers.map((fencer, index) => [
      (index + 1).toString(),
      fencer.lastName,
      fencer.firstName || '',
      fencer.club || '',
      fencer.ranking?.toString() || ''
    ]);

    autoTable(this.doc, {
      head: [['N°', 'Nom', 'Prénom', 'Club', 'Classement']],
      body: tableData,
      startY: this.currentY,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 }
      }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  private addMatchesTable(matches: Match[], options: { includeFinished: boolean; includePending: boolean }): void {
    const filteredMatches = matches.filter(match => {
      if (match.status === MatchStatus.FINISHED && !options.includeFinished) return false;
      if (match.status !== MatchStatus.FINISHED && !options.includePending) return false;
      return true;
    });

    if (filteredMatches.length === 0) {
      this.doc.setFontSize(10);
      this.doc.text('Aucun match à afficher', 20, this.currentY);
      return;
    }

    const tableData = filteredMatches.map((match, index) => {
      const status = match.status === MatchStatus.FINISHED ? 'Terminé' : 'À jouer';
      const scoreA = match.status === MatchStatus.FINISHED 
        ? `${match.scoreA?.isVictory ? 'V' : ''}${match.scoreA?.value || 0}`
        : '-';
      const scoreB = match.status === MatchStatus.FINISHED
        ? `${match.scoreB?.isVictory ? 'V' : ''}${match.scoreB?.value || 0}`
        : '-';

      return [
        (index + 1).toString(),
        `${match.fencerA?.lastName || 'N/A'} ${match.fencerA?.firstName?.charAt(0) || ''}.`,
        scoreA,
        scoreB,
        `${match.fencerB?.firstName?.charAt(0) || ''}. ${match.fencerB?.lastName || 'N/A'}`,
        status
      ];
    });

    autoTable(this.doc, {
      head: [['N°', 'Tireur A', 'Score A', 'Score B', 'Tireur B', 'Statut']],
      body: tableData,
      startY: this.currentY,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 45 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 45 },
        5: { cellWidth: 25 }
      }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  private addPoolStats(pool: Pool): void {
    this.doc.setFontSize(16);
    this.doc.text('Classement de la Poule', 105, this.currentY, { align: 'center' });
    this.currentY += 15;

    const tableData = pool.ranking.map(entry => [
      entry.rank.toString(),
      entry.fencer.lastName,
      entry.fencer.firstName || '',
      entry.victories.toString(),
      entry.defeats.toString(),
      entry.touchesScored.toString(),
      entry.touchesReceived.toString(),
      (entry.touchesScored - entry.touchesReceived).toString(),
      entry.ratio.toFixed(2)
    ]);

    autoTable(this.doc, {
      head: [['Rg', 'Nom', 'Prénom', 'V', 'D', 'TD', 'TR', 'Ind', 'V/M']],
      body: tableData,
      startY: this.currentY,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 10, halign: 'center' },
        4: { cellWidth: 10, halign: 'center' },
        5: { cellWidth: 10, halign: 'center' },
        6: { cellWidth: 10, halign: 'center' },
        7: { cellWidth: 10, halign: 'center' },
        8: { cellWidth: 15, halign: 'center' }
      }
    });
  }
}

/**
 * Fonction utilitaire pour exporter une poule rapidement
 */
export function exportPoolToPDF(pool: Pool, options?: PoolExportOptions): void {
  const exporter = new PDFExporter();
  exporter.exportPool(pool, options);
}

/**
 * Fonction utilitaire pour exporter plusieurs poules
 */
export function exportMultiplePoolsToPDF(pools: Pool[], title?: string): void {
  const exporter = new PDFExporter();
  exporter.exportMultiplePools(pools, title);
}