/**
 * BellePoule Modern - Preload Script
 * Exposes safe APIs to the renderer process with type safety
 * Licensed under GPL-3.0
 */
import type { ElectronAPI } from '../shared/types/preload';
declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
//# sourceMappingURL=preload.d.ts.map