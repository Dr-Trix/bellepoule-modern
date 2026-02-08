/**
 * BellePoule Modern - Simple PDF Template System
 * Gestion des modèles PDF personnalisables pour les compétitions
 * Licensed under GPL-3.0
 */
import jsPDF from 'jspdf';
import { Pool } from '../types';
export interface SimplePdfTemplate {
    id: string;
    name: string;
    description: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        text: string;
        background: string;
        borders: string;
    };
    fonts: {
        title: {
            size: number;
            family: string;
        };
        header: {
            size: number;
            family: string;
        };
        body: {
            size: number;
            family: string;
        };
    };
    branding: {
        organizationName: string;
        footerText?: string;
    };
}
export declare const TEMPLATES: Record<string, SimplePdfTemplate>;
/**
 * Gestionnaire simple de templates PDF
 */
export declare class SimplePdfTemplateManager {
    private currentTemplate;
    constructor(templateId?: string);
    setTemplate(templateId: string): void;
    getTemplate(): SimplePdfTemplate;
    /**
     * Applique le style du template au document PDF
     */
    applyTemplateStyles(doc: jsPDF): void;
    /**
     * Génère un header avec le template
     */
    generateHeader(doc: jsPDF, pool: Pool, title?: string): number;
    /**
     * Génère un footer avec le template
     */
    generateFooter(doc: jsPDF): void;
    /**
     * Applique le style pour les tableaux
     */
    getTableStyles(): any;
    /**
     * Applique le style pour le cadre de piste
     */
    generatePisteFrame(doc: jsPDF, pool: Pool, currentY: number): void;
    /**
     * Exporte une poule avec le template actuel
     */
    exportPoolWithTemplate(pool: Pool, options?: {
        title?: string;
        filename?: string;
    }): Promise<void>;
    /**
     * Prépare les données pour le tableau de matchs
     */
    private prepareMatchTableData;
}
/**
 * Fonction utilitaire pour exporter avec template
 */
export declare function exportPoolWithTemplate(pool: Pool, templateId?: string, options?: {
    title?: string;
    filename?: string;
}): Promise<void>;
/**
 * Fonction utilitaire pour obtenir la liste des templates disponibles
 */
export declare function getAvailableTemplates(): SimplePdfTemplate[];
//# sourceMappingURL=pdfTemplates.d.ts.map