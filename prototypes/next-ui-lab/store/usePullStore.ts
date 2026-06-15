import { create } from 'zustand';
import {
  executePullLive,
  newClientSeed,
  newIdempotencyKey,
  type PackRollResult,
} from '@/lib/executePull';
import { packVersionIdForOpeningPackId } from '@/lib/catalogLive';
import { fetchUserCreditBalance } from '@/lib/userCredits';

type OpenPackInput = {
  packId: string;
  creditPrice: number;
};

type PullStore = {
  credits: number | null;
  creditsLoading: boolean;
  isOpening: boolean;
  openError: string | null;
  lastPull: PackRollResult | null;
  hydrateCredits: (userId: string) => Promise<void>;
  reset: () => void;
  clearOpenError: () => void;
  openPack: (input: OpenPackInput) => Promise<
    | { ok: true; roll: PackRollResult; balanceAfter: number | null }
    | { ok: false; code: string; message: string }
  >;
};

export const usePullStore = create<PullStore>((set, get) => ({
  credits: null,
  creditsLoading: false,
  isOpening: false,
  openError: null,
  lastPull: null,

  hydrateCredits: async (userId) => {
    set({ creditsLoading: true });
    const balance = await fetchUserCreditBalance(userId);
    set({
      creditsLoading: false,
      credits: balance ?? get().credits,
    });
  },

  reset: () =>
    set({
      credits: null,
      creditsLoading: false,
      isOpening: false,
      openError: null,
      lastPull: null,
    }),

  clearOpenError: () => set({ openError: null }),

  openPack: async ({ packId, creditPrice }) => {
    const packVersionId = packVersionIdForOpeningPackId(packId);
    if (!packVersionId) {
      const message = 'This pack is not live on the server yet. Try the Welcome Pack.';
      set({ openError: message });
      return { ok: false, code: 'PACK_NOT_LIVE', message };
    }

    set({ isOpening: true, openError: null });

    const pullResult = await executePullLive({
      clientSeed: newClientSeed(),
      packVersionId,
      idempotencyKey: newIdempotencyKey(),
      packCreditPrice: creditPrice,
    });

    set({ isOpening: false });

    if (!pullResult.ok) {
      set({ openError: pullResult.message });
      return pullResult;
    }

    const balanceAfter =
      pullResult.response.balance_after ?? get().credits ?? null;

    set({
      lastPull: pullResult.roll,
      credits: balanceAfter,
      openError: null,
    });

    return {
      ok: true,
      roll: pullResult.roll,
      balanceAfter,
    };
  },
}));
