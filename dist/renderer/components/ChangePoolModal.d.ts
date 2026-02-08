/**
 * BellePoule Modern - Change Pool Modal Component
 * Allows moving a fencer from one pool to another
 * Licensed under GPL-3.0
 */
import React from 'react';
import { Fencer, Pool } from '../../shared/types';
interface ChangePoolModalProps {
    fencer: Fencer;
    currentPool: Pool;
    allPools: Pool[];
    onMove: (fencerId: string, fromPoolIndex: number, toPoolIndex: number) => void;
    onClose: () => void;
}
declare const ChangePoolModal: React.FC<ChangePoolModalProps>;
export default ChangePoolModal;
//# sourceMappingURL=ChangePoolModal.d.ts.map