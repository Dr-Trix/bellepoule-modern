import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { PoolState, PoolActions, PoolGenerationConfig, ScoreUpdateDTO } from '../types/pool.types';
import { PoolService } from '../services/poolService';

const service = new PoolService();

export const usePoolStore = create<PoolState & PoolActions>()(
  devtools(
    immer(
      persist(
        (set, get) => ({
          // State
          pools: [],
          currentPool: null,
          overallRanking: [],
          isLoading: false,
          error: null,

          // Actions
          loadPools: async (competitionId: string) => {
            set({ isLoading: true, error: null });
            try {
              const pools = await service.getByCompetition(competitionId);
              set({ pools, isLoading: false });
            } catch (error) {
              set({
                error: error instanceof Error ? error.message : 'Failed to load pools',
                isLoading: false,
              });
            }
          },

          generatePools: async (competitionId: string, config: PoolGenerationConfig) => {
            set({ isLoading: true, error: null });
            try {
              const pools = await service.generatePools(competitionId, config);
              set({ pools, isLoading: false });
            } catch (error) {
              set({
                error: error instanceof Error ? error.message : 'Failed to generate pools',
                isLoading: false,
              });
            }
          },

          updateScore: async (poolId: string, matchId: string, data: ScoreUpdateDTO) => {
            set({ isLoading: true, error: null });
            try {
              await service.updateScore(poolId, matchId, data);
              set(state => {
                const poolIndex = state.pools.findIndex(p => p.id === poolId);
                if (poolIndex !== -1) {
                  const matchIndex = state.pools[poolIndex].matches.findIndex(
                    m => m.id === matchId
                  );
                  if (matchIndex !== -1) {
                    state.pools[poolIndex].matches[matchIndex] = {
                      ...state.pools[poolIndex].matches[matchIndex],
                      ...data,
                    };
                  }
                }
                state.isLoading = false;
              });
            } catch (error) {
              set({
                error: error instanceof Error ? error.message : 'Failed to update score',
                isLoading: false,
              });
            }
          },

          computeRanking: async (competitionId: string) => {
            set({ isLoading: true, error: null });
            try {
              const ranking = await service.computeOverallRanking(competitionId);
              set({ overallRanking: ranking, isLoading: false });
            } catch (error) {
              set({
                error: error instanceof Error ? error.message : 'Failed to compute ranking',
                isLoading: false,
              });
            }
          },

          setCurrentPool: pool => {
            set({ currentPool: pool });
          },

          clearError: () => {
            set({ error: null });
          },
        }),
        {
          name: 'pool-store',
          partialize: state => ({
            pools: state.pools,
            overallRanking: state.overallRanking,
          }),
        }
      )
    ),
    { name: 'PoolStore' }
  )
);
