/**
 * BellePoule Modern - Touch-Optimized Tablet Interface for Referees
 * Enhanced remote scoring interface with touch optimization
 * Licensed under GPL-3.0
 */
import React from 'react';
import { Fencer, Match } from '../../shared/types';
interface TouchOptimizedRefereeProps {
    match: Match;
    fencerA: Fencer;
    fencerB: Fencer;
    maxScore: number;
    onScoreUpdate: (scoreA: number, scoreB: number) => void;
    onMatchEnd: () => void;
    onVoiceCommand?: (command: string) => void;
}
export declare const TouchOptimizedReferee: React.FC<TouchOptimizedRefereeProps>;
export {};
//# sourceMappingURL=TouchOptimizedReferee.d.ts.map