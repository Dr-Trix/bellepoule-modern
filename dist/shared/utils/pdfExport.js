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
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });
            this.currentY = 20;
            // Titre
            this.doc.setFontSize(18);
            this.doc.text(title, 148, this.currentY, { align: 'center' });
            this.currentY += 12;
            // Informations de la poule (sur une ligne)
            this.doc.setFontSize(10);
            const finishedMatches = pool.matches.filter(m => m.status === types_1.MatchStatus.FINISHED).length;
            this.doc.text(`Tireurs: ${pool.fencers.length} | Matchs: ${pool.matches.length} | Terminés: ${finishedMatches}/${pool.matches.length}`, 148, this.currentY, { align: 'center' });
            this.currentY += 15;
            // Tableau visuel des résultats (avec cases noires diagonales) - en premier car il prend le plus de place
            this.doc.setFontSize(14);
            this.doc.text('Tableau des Confrontations', 148, this.currentY, { align: 'center' });
            this.currentY += 10;
            this.addPoolGrid(pool);
            // Liste des matchs sur la même page si possible, sinon nouvelle page
            if (this.currentY + 80 < 190) { // 190 est la hauteur utile en paysage
                this.doc.setFontSize(14);
                this.doc.text('Liste des Matchs', 148, this.currentY, { align: 'center' });
                this.currentY += 10;
                this.addMatchesTable(pool.matches, {
                    includeFinished: includeFinishedMatches,
                    includePending: includePendingMatches
                });
            }
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
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });
            this.currentY = 20;
            // Page de titre
            this.doc.setFontSize(18);
            this.doc.text(title, 148, this.currentY, { align: 'center' });
            this.currentY += 12;
            this.doc.setFontSize(10);
            this.doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 148, this.currentY, { align: 'center' });
            this.doc.text(`Nombre de poules: ${pools.length}`, 148, this.currentY + 6, { align: 'center' });
            this.currentY += 12;
            // Exporter chaque poule sur des pages séparées
            pools.forEach((pool, index) => {
                if (index > 0) {
                    this.doc.addPage();
                }
                this.currentY = 20;
                this.addPoolSummary(pool);
                this.addFencersTable(pool.fencers);
                this.addPoolGrid(pool);
                this.doc.addPage();
                this.currentY = 20;
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
                `${match.fencerB?.firstName?.charAt(0) || ''}. ${match.fencerB?.lastName || 'N/A'}`
            ];
        });
        (0, jspdf_autotable_1.default)(this.doc, {
            head: [['N°', 'Tireur A', 'Score A', 'Score B', 'Tireur B']],
            body: tableData,
            startY: this.currentY,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 1 },
            columnStyles: {
                0: { cellWidth: 12 },
                1: { cellWidth: 45 },
                2: { cellWidth: 20, halign: 'center' },
                3: { cellWidth: 20, halign: 'center' },
                4: { cellWidth: 45 }
            }
        });
        this.currentY = this.doc.lastAutoTable.finalY + 10;
    }
    addPoolGrid(pool) {
        // @ts-ignore - jsPDF text method expects different types than what we're providing
        this.doc.setFontSize(10);
        this.doc.text(`Poule ${pool.number}`, 148, this.currentY, { align: 'center' });
        this.currentY += 8;
        const fencers = pool.fencers;
        const matches = pool.matches;
        const cellSize = 10;
        const headerHeight = 16;
        const colWidth = 18;
        const rowHeight = 10;
        // Position de départ du tableau
        const tableStartX = 20;
        let tableStartY = this.currentY;
        // Largeur totale du tableau
        const totalWidth = 60 + (fencers.length * colWidth);
        const totalHeight = headerHeight + (fencers.length * rowHeight);
        // Vérifier si le tableau tient sur la page en paysage (hauteur utile ~190mm)
        if (tableStartY + totalHeight > 190) {
            this.doc.addPage();
            this.currentY = 20;
            tableStartY = 20;
        }
        // En-têtes des colonnes
        let currentX = tableStartX;
        // Case vide en haut à gauche
        // @ts-ignore
        this.doc.setFillColor(240);
        this.doc.rect(currentX, tableStartY, 60, headerHeight, 'F');
        this.doc.setDrawColor(0);
        this.doc.rect(currentX, tableStartY, 60, headerHeight, 'S');
        currentX += 60;
        // En-têtes des tireurs (verticaux)
        fencers.forEach((fencer, index) => {
            this.doc.setFillColor(31, 41, 55); // gris foncé
            this.doc.rect(currentX, tableStartY, colWidth, headerHeight, 'F');
            this.doc.setTextColor(255);
            this.doc.setFontSize(8);
            // @ts-ignore
            this.doc.text(String(fencer.ref || (index + 1)), currentX + colWidth / 2, tableStartY + headerHeight / 2 + 1, { align: 'center' });
            this.doc.setTextColor(0);
            currentX += colWidth;
        });
        // Lignes de données
        let currentY = tableStartY + headerHeight;
        // @ts-ignore
        fencers.forEach((fencer, rowIndex) => {
            currentX = tableStartX;
            // Numéro du tireur
            // @ts-ignore
            this.doc.setFillColor(249);
            this.doc.rect(currentX, currentY, 20, rowHeight, 'F');
            this.doc.setDrawColor(0);
            this.doc.rect(currentX, currentY, 20, rowHeight, 'S');
            this.doc.setFontSize(8);
            // @ts-ignore
            this.doc.text(String(fencer.ref || (rowIndex + 1)), currentX + 10, currentY + rowHeight / 2 + 1, { align: 'center' });
            currentX += 20;
            // Nom du tireur
            // @ts-ignore
            this.doc.setFillColor(249);
            this.doc.rect(currentX, currentY, 40, rowHeight, 'F');
            this.doc.setDrawColor(0);
            this.doc.rect(currentX, currentY, 40, rowHeight, 'S');
            this.doc.setFontSize(7);
            const name = `${fencer.firstName || ''} ${fencer.lastName || ''}`.trim();
            const displayName = name.length > 15 ? name.substring(0, 15) + '...' : name;
            // @ts-ignore
            this.doc.text(displayName, currentX + 2, currentY + rowHeight / 2 + 1);
            currentX += 40;
            // Cellules de résultats
            // @ts-ignore
            fencers.forEach((opponent, colIndex) => {
                const isDiagonal = rowIndex === colIndex;
                if (isDiagonal) {
                    // Case noire pour la diagonale
                    // @ts-ignore
                    this.doc.setFillColor(0);
                    this.doc.rect(currentX, currentY, colWidth, rowHeight, 'F');
                }
                else {
                    // Trouver le match entre ces deux tireurs
                    const match = this.findMatchBetweenFencers(matches, fencer.id, opponent.id);
                    if (match && match.status === types_1.MatchStatus.FINISHED) {
                        const scoreA = match.scoreA?.value ?? 0;
                        const scoreB = match.scoreB?.value ?? 0;
                        const victoryA = match.scoreA?.isVictory || false;
                        const victoryB = match.scoreB?.isVictory || false;
                        // Afficher le score ou V pour victoire
                        let displayText = '';
                        if (victoryA && match.fencerA?.id === fencer.id) {
                            displayText = 'V';
                            this.doc.setFillColor(220, 252, 231); // vert clair
                        }
                        else if (victoryB && match.fencerB?.id === fencer.id) {
                            displayText = 'V';
                            this.doc.setFillColor(220, 252, 231); // vert clair
                        }
                        else if (scoreA > 0 || scoreB > 0) {
                            // Afficher le score du tireur actuel
                            const fencerScore = match.fencerA?.id === fencer.id ? scoreA : scoreB;
                            const opponentScore = match.fencerA?.id === fencer.id ? scoreB : scoreA;
                            displayText = `${fencerScore}-${opponentScore}`;
                            this.doc.setFillColor(254, 243, 199); // jaune clair
                        }
                        else {
                            // @ts-ignore
                            this.doc.setFillColor(250);
                        }
                        // @ts-ignore
                        this.doc.rect(currentX, currentY, colWidth, rowHeight, 'F');
                        this.doc.setDrawColor(0);
                        this.doc.rect(currentX, currentY, colWidth, rowHeight, 'S');
                        // @ts-ignore
                        this.doc.setFontSize(8);
                        this.doc.setTextColor(0);
                        // @ts-ignore
                        this.doc.text(displayText, currentX + colWidth / 2, currentY + rowHeight / 2 + 1, { align: 'center' });
                    }
                    else {
                        // Match non joué
                        // @ts-ignore
                        this.doc.setFillColor(250);
                        this.doc.rect(currentX, currentY, colWidth, rowHeight, 'F');
                        this.doc.setDrawColor(0);
                        this.doc.rect(currentX, currentY, colWidth, rowHeight, 'S');
                        // @ts-ignore
                        this.doc.setFontSize(8);
                        this.doc.setTextColor(150);
                        // @ts-ignore
                        this.doc.text('-', currentX + colWidth / 2, currentY + rowHeight / 2 + 1, { align: 'center' });
                    }
                }
                currentX += colWidth;
            });
            currentY += rowHeight;
        });
        this.currentY = currentY + 15;
    }
    findMatchBetweenFencers(matches, fencerAId, fencerBId) {
        return matches.find(match => (match.fencerA?.id === fencerAId && match.fencerB?.id === fencerBId) ||
            (match.fencerB?.id === fencerAId && match.fencerA?.id === fencerBId)) || null;
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