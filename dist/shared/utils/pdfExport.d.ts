/**
 * BellePoule Modern - PDF Export Service
 * Exports pools to PDF format with matches list
 * Licensed under GPL-3.0
 */
import { Pool } from '../types';
interface PoolExportOptions {
    title?: string;
    includeFinishedMatches?: boolean;
    includePendingMatches?: boolean;
    includePoolStats?: boolean;
}
export declare class PDFExporter {
    private doc;
    private currentY;
    constructor();
    /**
     * Exporte une poule complète en PDF
     */
    exportPool(pool: Pool, options?: PoolExportOptions): Promise<void>;
    /**
     * Exporte plusieurs poules dans un seul PDF
     */
    exportMultiplePools(pools: Pool[], title?: string): Promise<void>;
    private addPoolSummary;
    private addFencersTable;
    private addMatchesTable;
    private addPoolGrid;
    private findMatchBetweenFencers;
    private addPoolStats;
}
/**
 * Fonction utilitaire pour exporter une poule rapidement
 */
export declare function exportPoolToPDF(pool: Pool, options?: PoolExportOptions): Promise<void>;
/**
 * Fonction utilitaire pour exporter plusieurs poules
 */
export declare function exportMultiplePoolsToPDF(pools: Pool[], title?: string): Promise<void>;
export {};
//# sourceMappingURL=pdfExport.d.ts.map