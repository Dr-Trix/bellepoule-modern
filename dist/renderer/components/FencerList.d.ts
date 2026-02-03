/**
 * BellePoule Modern - Fencer List Component
 * Licensed under GPL-3.0
 */
import React from 'react';
import { Fencer } from '../../shared/types';
interface FencerListProps {
    fencers: Fencer[];
    onCheckIn: (id: string) => void;
    onAddFencer: () => void;
    onEditFencer?: (id: string, updates: Partial<Fencer>) => void;
    onDeleteFencer?: (id: string) => void;
    onCheckInAll?: () => void;
    onUncheckAll?: () => void;
}
declare const FencerList: React.FC<FencerListProps>;
export default FencerList;
//# sourceMappingURL=FencerList.d.ts.map