import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import {
  getReferralGrants,
  getSignupPromotion,
  normalizeReferralUsername,
  redeemPromoCode,
} from '../promotions/engine';
import type { PromotionGrant } from '../promotions/types';
import { useAppStore } from './useAppStore';

const STORAGE_KEY = '@pullhub_promotions_v2';

type Persisted = {
  redeemedKeys: string[];
  signupRewardedUserIds: string[];
  pendingReferralUsername: string | null;
  referrerQueue: Record<string, PromotionGrant>;
};

type State = Persisted & {
  hydrated: boolean;
};

type Actions = {
  hydrate: () => Promise<void>;
  setPendingReferralUsername: (username: string | null) => void;
  /** After sign-in — signup bonus (per user id), referral for new user, consume referrer queue. */
  syncSessionRewards: (userId: string, username: string) => void;
  applyManualPromo: (
    userId: string,
    rawCode: string,
  ) => { ok: true; grant: PromotionGrant; label: string } | { ok: false; reason: string };
};

function redeemKey(userId: string, code: string) {
  return `${userId}:${code}`;
}

function mergeGrant(a: PromotionGrant, b: PromotionGrant): PromotionGrant {
  const points = (a.points ?? 0) + (b.points ?? 0);
  const freePacks = (a.freePacks ?? 0) + (b.freePacks ?? 0);
  const out: PromotionGrant = {};
  if (points > 0) out.points = points;
  if (freePacks > 0) out.freePacks = freePacks;
  return out;
}

function applyGrantToUser(grant: PromotionGrant) {
  if (grant.points && grant.points > 0) {
    useAppStore.getState().addCredits(grant.points);
  }
  if (grant.freePacks && grant.freePacks > 0) {
    useAppStore.getState().addFreePackGrants(grant.freePacks);
  }
}

function persistState(p: Persisted) {
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export const usePromotionStore = create<State & Actions>((set, get) => ({
  hydrated: false,
  redeemedKeys: [],
  signupRewardedUserIds: [],
  pendingReferralUsername: null,
  referrerQueue: {},

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<Persisted>;
        set({
          hydrated: true,
          redeemedKeys: Array.isArray(p.redeemedKeys) ? p.redeemedKeys : [],
          signupRewardedUserIds: Array.isArray(p.signupRewardedUserIds) ? p.signupRewardedUserIds : [],
          pendingReferralUsername: p.pendingReferralUsername ?? null,
          referrerQueue: p.referrerQueue && typeof p.referrerQueue === 'object' ? p.referrerQueue : {},
        });
        return;
      }
    } catch {
      /* ignore */
    }
    set({ hydrated: true });
  },

  setPendingReferralUsername: (username) => {
    const u = username ? normalizeReferralUsername(username) : null;
    const next = u || null;
    const s = get();
    set({ pendingReferralUsername: next });
    persistState({
      redeemedKeys: s.redeemedKeys,
      signupRewardedUserIds: s.signupRewardedUserIds,
      pendingReferralUsername: next,
      referrerQueue: s.referrerQueue,
    });
  },

  syncSessionRewards: (userId, username) => {
    const me = normalizeReferralUsername(username);
    if (!userId || !me) return;

    const state = get();
    let signupRewardedUserIds = [...state.signupRewardedUserIds];
    let pendingReferralUsername = state.pendingReferralUsername;
    let referrerQueue = { ...state.referrerQueue };
    let didChange = false;

    const queued = referrerQueue[me];
    if (queued && (queued.points || queued.freePacks)) {
      applyGrantToUser(queued);
      delete referrerQueue[me];
      didChange = true;
    }

    if (!signupRewardedUserIds.includes(userId)) {
      const signup = getSignupPromotion();
      if (signup.enabled && (signup.grant.points || signup.grant.freePacks)) {
        applyGrantToUser(signup.grant);
      }
      signupRewardedUserIds = [...signupRewardedUserIds, userId];
      didChange = true;
    }

    if (pendingReferralUsername) {
      const ref = normalizeReferralUsername(pendingReferralUsername);
      pendingReferralUsername = null;
      didChange = true;

      if (ref && ref !== me) {
        const { newUser, referrer } = getReferralGrants();
        applyGrantToUser(newUser);
        const prev = referrerQueue[ref];
        referrerQueue[ref] = mergeGrant(prev ?? {}, referrer);
        didChange = true;
      }
    }

    if (didChange) {
      set({ signupRewardedUserIds, pendingReferralUsername, referrerQueue });
      persistState({
        redeemedKeys: state.redeemedKeys,
        signupRewardedUserIds,
        pendingReferralUsername,
        referrerQueue,
      });
    }
  },

  applyManualPromo: (userId, rawCode) => {
    const state = get();
    const redeemed = new Set(
      state.redeemedKeys.filter((k) => k.startsWith(`${userId}:`)).map((k) => k.slice(userId.length + 1)),
    );
    const result = redeemPromoCode(rawCode, redeemed);
    if (!result.ok) {
      return {
        ok: false,
        reason:
          result.reason === 'already_redeemed'
            ? 'already_redeemed'
            : result.reason === 'invalid'
              ? 'invalid'
              : 'inactive',
      };
    }

    applyGrantToUser(result.grant);
    const redeemedKeys = [...state.redeemedKeys, redeemKey(userId, result.code)];
    set({ redeemedKeys });
    persistState({
      redeemedKeys,
      signupRewardedUserIds: state.signupRewardedUserIds,
      pendingReferralUsername: state.pendingReferralUsername,
      referrerQueue: state.referrerQueue,
    });

    return { ok: true, grant: result.grant, label: result.label };
  },
}));
