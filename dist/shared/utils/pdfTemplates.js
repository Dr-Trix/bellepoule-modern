"use strict";
/**
 * BellePoule Modern - Simple PDF Template System
 * Gestion des modèles PDF personnalisables pour les compétitions
 * Licensed under GPL-3.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimplePdfTemplateManager = exports.TEMPLATES = void 0;
exports.exportPoolWithTemplate = exportPoolWithTemplate;
exports.getAvailableTemplates = getAvailableTemplates;
const jspdf_1 = __importDefault(require("jspdf"));
const jspdf_autotable_1 = __importDefault(require("jspdf-autotable"));
const types_1 = require("../types");
const pdfExport_1 = require("./pdfExport");
// Templates prédéfinis
exports.TEMPLATES = {
    classic: {
        id: 'classic',
        name: 'Classique',
        description: 'Template traditionnel avec design sobre',
        colors: {
            primary: '#000000',
            secondary: '#666666',
            accent: '#0066cc',
            text: '#000000',
            background: '#ffffff',
            borders: '#000000'
        },
        fonts: {
            title: { size: 18, family: 'helvetica' },
            header: { size: 14, family: 'helvetica' },
            body: { size: 10, family: 'helvetica' }
        },
        branding: {
            organizationName: 'BellePoule Modern',
            footerText: 'Généré avec BellePoule Modern'
        }
    },
    modern: {
        id: 'modern',
        name: 'Moderne',
        description: 'Design contemporain avec couleurs vives',
        colors: {
            primary: '#2c3e50',
            secondary: '#34495e',
            accent: '#3498db',
            text: '#2c3e50',
            background: '#f8f9fa',
            borders: '#dee2e6'
        },
        fonts: {
            title: { size: 20, family: 'helvetica' },
            header: { size: 14, family: 'helvetica' },
            body: { size: 11, family: 'helvetica' }
        },
        branding: {
            organizationName: 'BellePoule Modern',
            footerText: 'Généré avec BellePoule Modern'
        }
    },
    tournament: {
        id: 'tournament',
        name: 'Tournoi',
        description: 'Template professionnel pour compétitions',
        colors: {
            primary: '#1a1a1a',
            secondary: '#4a4a4a',
            accent: '#ff6b35',
            text: '#1a1a1a',
            background: '#ffffff',
            borders: '#cccccc'
        },
        fonts: {
            title: { size: 22, family: 'helvetica' },
            header: { size: 16, family: 'helvetica' },
            body: { size: 11, family: 'helvetica' }
        },
        branding: {
            organizationName: 'Compétition d\'Escrime',
            footerText: 'Résultats Officiels'
        }
    }
};
/**
 * Gestionnaire simple de templates PDF
 */
class SimplePdfTemplateManager {
    constructor(templateId = 'classic') {
        this.currentTemplate = exports.TEMPLATES[templateId] || exports.TEMPLATES.classic;
    }
    setTemplate(templateId) {
        const template = exports.TEMPLATES[templateId];
        if (template) {
            this.currentTemplate = template;
        }
    }
    getTemplate() {
        return this.currentTemplate;
    }
    /**
     * Applique le style du template au document PDF
     */
    applyTemplateStyles(doc) {
        const { colors, fonts } = this.currentTemplate;
        // Couleurs par défaut
        doc.setTextColor(colors.text);
        doc.setDrawColor(colors.borders);
        doc.setFillColor(colors.background);
    }
    /**
     * Génère un header avec le template
     */
    generateHeader(doc, pool, title) {
        const { colors, fonts, branding } = this.currentTemplate;
        let currentY = pdfExport_1.DIMENSIONS.PAGE_MARGIN;
        // Titre principal
        doc.setFontSize(fonts.title.size);
        doc.setFont(fonts.title.family, 'bold');
        doc.setTextColor(colors.primary);
        doc.text(title || `Poule ${pool.number}`, pdfExport_1.DIMENSIONS.PAGE_WIDTH / 2, currentY, { align: 'center' });
        currentY += fonts.title.size + 5;
        // Informations de la poule
        doc.setFontSize(fonts.body.size);
        doc.setFont(fonts.body.family, 'normal');
        doc.setTextColor(colors.secondary);
        const completedMatches = pool.matches.filter(m => m.status === types_1.MatchStatus.FINISHED).length;
        const info = `Tireurs: ${pool.fencers.length} | Matchs: ${pool.matches.length} | Terminés: ${completedMatches}/${pool.matches.length}`;
        doc.text(info, pdfExport_1.DIMENSIONS.PAGE_WIDTH / 2, currentY, { align: 'center' });
        currentY += 10;
        // Nom de l'organisation
        if (branding.organizationName) {
            doc.setFontSize(fonts.header.size);
            doc.setFont(fonts.header.family, 'bold');
            doc.setTextColor(colors.accent);
            doc.text(branding.organizationName, pdfExport_1.DIMENSIONS.PAGE_WIDTH / 2, currentY, { align: 'center' });
            currentY += fonts.header.size + 8;
        }
        return currentY;
    }
    /**
     * Génère un footer avec le template
     */
    generateFooter(doc) {
        const { colors, fonts, branding } = this.currentTemplate;
        if (branding.footerText) {
            const pageHeight = doc.internal.pageSize.height;
            doc.setFontSize(fonts.body.size - 2);
            doc.setFont(fonts.body.family, 'italic');
            doc.setTextColor(colors.secondary);
            doc.text(branding.footerText, pdfExport_1.DIMENSIONS.PAGE_WIDTH / 2, pageHeight - 10, { align: 'center' });
        }
    }
    /**
     * Applique le style pour les tableaux
     */
    getTableStyles() {
        const { colors, fonts } = this.currentTemplate;
        return {
            theme: 'plain',
            styles: {
                fontSize: fonts.body.size,
                cellPadding: 3,
                lineColor: colors.borders,
                textColor: colors.text
            },
            headStyles: {
                fillColor: colors.primary,
                textColor: '#ffffff',
                fontStyle: 'bold',
                fontSize: fonts.header.size
            },
            alternateRowStyles: {
                fillColor: colors.background === '#ffffff' ? '#f5f5f5' : colors.background
            },
            columnStyles: {
                0: { cellWidth: 25, halign: 'center' }, // Piste
                1: { cellWidth: 25, halign: 'center' }, // Heure
                2: { cellWidth: 35, halign: 'center' }, // Score V
                3: { cellWidth: 35, halign: 'center' }, // Tireur V
                4: { cellWidth: 20, halign: 'center' }, // VS
                5: { cellWidth: 35, halign: 'center' }, // Score P
                6: { cellWidth: 35, halign: 'center' }, // Tireur P
                7: { cellWidth: 30, halign: 'center' } // Status
            }
        };
    }
    /**
     * Applique le style pour le cadre de piste
     */
    generatePisteFrame(doc, pool, currentY) {
        const { colors, fonts } = this.currentTemplate;
        // Configuration du cadre
        const frameX = 30;
        const frameY = currentY;
        const frameWidth = pdfExport_1.DIMENSIONS.PAGE_WIDTH - 60;
        const frameHeight = 25;
        // Fond avec couleur du template
        doc.setFillColor(colors.background);
        doc.roundedRect(frameX, frameY, frameWidth, frameHeight, 3, 3, 'F');
        // Bordure avec couleur primaire
        doc.setDrawColor(colors.primary);
        doc.setLineWidth(0.5);
        doc.roundedRect(frameX, frameY, frameWidth, frameHeight, 3, 3, 'S');
        // Texte "PISTE N°"
        doc.setFontSize(fonts.header.size);
        doc.setFont(fonts.header.family, 'bold');
        doc.setTextColor(colors.primary);
        doc.text('PISTE N°', frameX + 10, frameY + 17);
        // Numéro de la piste
        doc.setFontSize(fonts.title.size);
        doc.setFont(fonts.title.family, 'bold');
        doc.setTextColor(colors.accent);
        doc.text(pool.strip?.toString() || '?', frameX + 55, frameY + 17);
        // Heure de début
        doc.setFontSize(fonts.body.size);
        doc.setFont(fonts.body.family, 'normal');
        doc.setTextColor(colors.text);
        const startTime = pool.startTime || new Date();
        const timeStr = startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        doc.text(`Début: ${timeStr}`, frameX + 100, frameY + 17);
    }
    /**
     * Exporte une poule avec le template actuel
     */
    async exportPoolWithTemplate(pool, options = {}) {
        try {
            // Création du document
            const doc = new jspdf_1.default({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });
            // Appliquer le style du template
            this.applyTemplateStyles(doc);
            // Générer le header
            let currentY = this.generateHeader(doc, pool, options.title);
            // Ajouter le cadre de piste
            this.generatePisteFrame(doc, pool, currentY);
            currentY += 35;
            // Préparer les données pour le tableau
            const tableData = this.prepareMatchTableData(pool.matches);
            // Créer le tableau avec les styles du template
            (0, jspdf_autotable_1.default)(doc, {
                head: [['Piste', 'Heure', 'Score V', 'Tireur V', '', 'Score P', 'Tireur P', 'Status']],
                body: tableData,
                startY: currentY,
                ...this.getTableStyles()
            });
            // Générer le footer
            this.generateFooter(doc);
            // Télécharger le fichier
            const filename = options.filename || `poule-${pool.number}-${this.currentTemplate.id}-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);
        }
        catch (error) {
            console.error('Erreur lors de l\'export avec template:', error);
            throw new Error(`Échec de l'export: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Prépare les données pour le tableau de matchs
     */
    prepareMatchTableData(matches) {
        return matches.map(match => {
            const time = match.startTime?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) || '--:--';
            let scoreV = '';
            let scoreP = '';
            let status = '';
            if (match.status === types_1.MatchStatus.FINISHED && match.scoreA && match.scoreB) {
                scoreV = match.scoreA.value?.toString() || '';
                scoreP = match.scoreB.value?.toString() || '';
                status = 'Terminé';
            }
            else if (match.status === types_1.MatchStatus.IN_PROGRESS) {
                status = 'En cours';
            }
            else {
                status = 'En attente';
            }
            return [
                match.strip?.toString() || '--',
                time,
                scoreV,
                match.fencerA?.lastName || '--',
                'vs',
                scoreP,
                match.fencerB?.lastName || '--',
                status
            ];
        });
    }
}
exports.SimplePdfTemplateManager = SimplePdfTemplateManager;
/**
 * Fonction utilitaire pour exporter avec template
 */
async function exportPoolWithTemplate(pool, templateId = 'classic', options) {
    const manager = new SimplePdfTemplateManager(templateId);
    await manager.exportPoolWithTemplate(pool, options);
}
/**
 * Fonction utilitaire pour obtenir la liste des templates disponibles
 */
function getAvailableTemplates() {
    return Object.values(exports.TEMPLATES);
}
//# sourceMappingURL=pdfTemplates.js.map