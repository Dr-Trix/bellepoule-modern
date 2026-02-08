/**
 * BellePoule Modern - Remote Score Management Component
 * Interface for managing remote score entry
 * Licensed under GPL-3.0
 */
import React from 'react';
import { Competition } from '../../shared/types';
interface RemoteScoreManagerProps {
    competition: Competition;
    onStartRemote: () => void;
    onStopRemote: () => void;
    isRemoteActive?: boolean;
}
declare const RemoteScoreManager: React.FC<RemoteScoreManagerProps>;
export default RemoteScoreManager;
//# sourceMappingURL=RemoteScoreManager.d.ts.map