import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { MembershipTierId } from '../data/membershipPlans';

const STORAGE_KEY = '@pullhub_membership_sim_v1';

function isTier(x: unknown): x is MembershipTierId {
  return x === 'silver' || x === 'gold' || x === 'black';
}

type State = {
  /** MVP: simulated paid tier for demos (no IAP). Persisted on device. */
  simulatedTier: MembershipTierId | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setSimulatedTier: (tier: MembershipTierId | null) => void;
};

export const useMembershipSimulationStore = create<State>((set) => ({
  simulatedTier: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { tier?: unknown };
        if (parsed.tier === null || parsed.tier === undefined) {
          set({ simulatedTier: null, hydrated: true });
          return;
        }
        if (isTier(parsed.tier)) {
          set({ simulatedTier: parsed.tier, hydrated: true });
          return;
        }
      }
    } catch {
      /* ignore */
    }
    set({ hydrated: true });
  },

  setSimulatedTier: (tier) => {
    set({ simulatedTier: tier });
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ tier }));
  },
}));
