"use strict";
/**
 * BellePoule Modern - PDF Export Service
 * Exports pools to PDF format with matches list
 * Licensed under GPL-3.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFExporter = void 0;
exports.exportPoolToPDF = exportPoolToPDF;
exports.exportMultiplePoolsToPDF = exportMultiplePoolsToPDF;
const jspdf_1 = __importDefault(require("jspdf"));
const jspdf_autotable_1 = __importDefault(require("jspdf-autotable"));
const types_1 = require("../types");
class PDFExporter {
    constructor() {
        this.currentY = 20;
        this.doc = new jspdf_1.default();
    }
    /**
     * Exporte une poule complète en PDF
     */
    async exportPool(pool, options = {}) {
        try {
            const { title = `Poule ${pool.number}`, includeFinishedMatches = true, includePendingMatches = true, includePoolStats = true } = options;
            this.doc = new jspdf_1.default({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
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
            const finishedMatches = pool.matches.filter(m => m.status === types_1.MatchStatus.FINISHED).length;
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
            // Utiliser la méthode standard avec timeout pour éviter les erreurs de D-Bus
            setTimeout(() => {
                try {
                    this.doc.save(filename);
                }
                catch (saveError) {
                    console.error('Erreur lors de la sauvegarde du PDF:', saveError);
                    // Fallback : ouvrir dans un nouvel onglet
                    const pdfBlob = this.doc.output('blob');
                    const pdfUrl = URL.createObjectURL(pdfBlob);
                    window.open(pdfUrl, '_blank');
                }
            }, 100);
        }
        catch (error) {
            console.error('Erreur détaillée lors de l\'export PDF:', error);
            throw new Error(`Échec de l'export PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Exporte plusieurs poules dans un seul PDF
     */
    async exportMultiplePools(pools, title = 'Export des Poules') {
        try {
            this.doc = new jspdf_1.default({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
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
            // Utiliser la méthode standard avec timeout pour éviter les erreurs de D-Bus
            setTimeout(() => {
                try {
                    this.doc.save(filename);
                }
                catch (saveError) {
                    console.error('Erreur lors de la sauvegarde du PDF multiple:', saveError);
                    // Fallback : ouvrir dans un nouvel onglet
                    const pdfBlob = this.doc.output('blob');
                    const pdfUrl = URL.createObjectURL(pdfBlob);
                    window.open(pdfUrl, '_blank');
                }
            }, 100);
        }
        catch (error) {
            console.error('Erreur détaillée lors de l\'export PDF multiple:', error);
            throw new Error(`Échec de l'export PDF multiple: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    addPoolSummary(pool) {
        this.doc.setFontSize(16);
        this.doc.text(`Poule ${pool.number}`, 20, this.currentY);
        this.currentY += 10;
        this.doc.setFontSize(10);
        this.doc.text(`Tireurs: ${pool.fencers.length} | Matchs: ${pool.matches.length}`, 20, this.currentY);
        const finishedMatches = pool.matches.filter(m => m.status === types_1.MatchStatus.FINISHED).length;
        this.doc.text(`Terminés: ${finishedMatches}/${pool.matches.length}`, 20, this.currentY + 5);
        this.currentY += 15;
    }
    addFencersTable(fencers) {
        const tableData = fencers.map((fencer, index) => [
            (index + 1).toString(),
            fencer.lastName,
            fencer.firstName || '',
            fencer.club || '',
            fencer.ranking?.toString() || ''
        ]);
        (0, jspdf_autotable_1.default)(this.doc, {
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
        this.currentY = this.doc.lastAutoTable.finalY + 10;
    }
    addMatchesTable(matches, options) {
        const filteredMatches = matches.filter(match => {
            if (match.status === types_1.MatchStatus.FINISHED && !options.includeFinished)
                return false;
            if (match.status !== types_1.MatchStatus.FINISHED && !options.includePending)
                return false;
            return true;
        });
        if (filteredMatches.length === 0) {
            this.doc.setFontSize(10);
            this.doc.text('Aucun match à afficher', 20, this.currentY);
            return;
        }
        const tableData = filteredMatches.map((match, index) => {
            const status = match.status === types_1.MatchStatus.FINISHED ? 'Terminé' : 'À jouer';
            const scoreA = match.status === types_1.MatchStatus.FINISHED
                ? `${match.scoreA?.isVictory ? 'V' : ''}${match.scoreA?.value || 0}`
                : '-';
            const scoreB = match.status === types_1.MatchStatus.FINISHED
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
        (0, jspdf_autotable_1.default)(this.doc, {
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
        this.currentY = this.doc.lastAutoTable.finalY + 10;
    }
    addPoolStats(pool) {
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
        (0, jspdf_autotable_1.default)(this.doc, {
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
exports.PDFExporter = PDFExporter;
/**
 * Fonction utilitaire pour exporter une poule rapidement
 */
async function exportPoolToPDF(pool, options) {
    const exporter = new PDFExporter();
    await exporter.exportPool(pool, options);
}
/**
 * Fonction utilitaire pour exporter plusieurs poules
 */
async function exportMultiplePoolsToPDF(pools, title) {
    const exporter = new PDFExporter();
    await exporter.exportMultiplePools(pools, title);
}
//# sourceMappingURL=pdfExport.js.map