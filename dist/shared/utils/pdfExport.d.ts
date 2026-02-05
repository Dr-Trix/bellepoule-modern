/**
 * BellePoule Modern - Optimized PDF Export Service
 * Optimized exports with improved performance and maintainability
 * Licensed under GPL-3.0
 */
import { Pool } from '../types';
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
}
/**
 * Fonction utilitaire pour exporter une poule avec optimisations
 */
export declare function exportOptimizedPoolToPDF(pool: Pool, options?: PoolExportOptions): Promise<void>;
export {};
//# sourceMappingURL=pdfExport.d.ts.map