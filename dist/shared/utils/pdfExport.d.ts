/**
 * BellePoule Modern - Optimized PDF Export Service
 * Optimized exports with improved performance and maintainability
 * Licensed under GPL-3.0
 */
import { Pool } from '../types';
declare const DIMENSIONS: {
    readonly PISTE_FRAME: {
        readonly width: 150;
        readonly height: 40;
    };
    readonly COLUMN_WIDTH: 70;
    readonly ROW_HEIGHT: 8;
    readonly MAX_COLUMNS: 4;
    readonly PAGE_WIDTH: 297;
    readonly PAGE_HEIGHT: 210;
    readonly PAGE_MARGIN: 20;
};
declare const PDF_STYLES: {
    readonly PISTE_TITLE: {
        readonly fontSize: 16;
        readonly align: "center";
    };
    readonly MATCH_NUMBER: {
        readonly fontSize: 7;
    };
    readonly MATCH_TEXT: {
        readonly fontSize: 7;
        readonly align: "center";
    };
    readonly TITLE: {
        readonly fontSize: 18;
        readonly align: "center";
    };
    readonly SUBTITLE: {
        readonly fontSize: 12;
        readonly align: "center";
    };
};
interface PoolExportOptions {
    title?: string;
    includeFinishedMatches?: boolean;
    includePendingMatches?: boolean;
    includePoolStats?: boolean;
}
export declare class OptimizedPDFExporter {
    private doc;
    private currentY;
    private readonly startTime;
    constructor();
    /**
     * Applique les styles de base pour les éléments PDF
     */
    private applyPdfStyling;
    /**
     * Calcule la position pour une colonne
     */
    private calculateColumnPosition;
    /**
     * Calcule les dimensions du cadre de piste
     */
    private calculatePisteFrame;
    /**
     * Valide les données de la poule
     */
    private validatePoolData;
    /**
     * Calcule l'affichage d'un match
     */
    private calculateMatchDisplay;
    /**
     * Filtre les matchs selon leur statut
     */
    private filterMatchesByStatus;
    /**
     * Ajoute un cadre de piste optimisé
     */
    private addOptimizedPisteFrame;
    /**
     * Affiche les matchs en colonnes de manière optimisée
     */
    private addOptimizedMatchesInColumns;
    /**
     * Gère les erreurs d'export PDF
     */
    private handlePdfError;
    /**
     * Affiche les métriques de performance
     */
    private logPerformanceMetrics;
    /**
     * Exporte une poule complète en PDF avec optimisations
     */
    exportPool(pool: Pool, options?: PoolExportOptions): Promise<void>;
    /**
     * Exporte plusieurs poules dans un seul PDF
     */
    exportMultiplePools(pools: Pool[], title?: string): Promise<void>;
}
/**
 * Fonction utilitaire pour exporter une poule avec optimisations
 */
export declare function exportOptimizedPoolToPDF(pool: Pool, options?: PoolExportOptions): Promise<void>;
/**
 * Fonction utilitaire pour exporter une poule rapidement (version legacy)
 */
export declare function exportPoolToPDF(pool: Pool, options?: PoolExportOptions): Promise<void>;
/**
 * Fonction utilitaire pour exporter plusieurs poules
 */
export declare function exportMultiplePoolsToPDF(pools: Pool[], title?: string): Promise<void>;
export { DIMENSIONS, PDF_STYLES };
//# sourceMappingURL=pdfExport.d.ts.map