import { create } from 'zustand';
import {
  FriendEntry,
  isValidFriendUsernameFormat,
  normalizeFriendUsername,
} from '../data/friends';
import { mockUser, Pull, PullRarityTier, UserState } from '../data/mockUser';
import { HomeNicheCategory, Pack, PackSubfilter } from '../data/mockPacks';

interface ModalState {
  insufficientCredits: boolean;
  /**
   * Reserved for future multi-pack / quantity picker (e.g. open 1 vs 5 vs 10).
   * MVP: single pack only — see `openPack` and `PackOpeningModal`.
   */
  quantitySheet: boolean;
  packOpening: boolean;
  /** Ship vs convert — shown right after pack opening (see `WonPrizesModal`). */
  wonPrizes: boolean;
}

type AddFriendResult =
  | { ok: true }
  | { ok: false; reason: 'duplicate' | 'self' | 'invalid' };

interface AppStore {
  user: UserState;
  /** Added via friend ID lookup / QR (MVP local list). */
  friends: FriendEntry[];
  /** Home view mode: discovery lobby vs full catalog floor. */
  homeViewMode: 'discover' | 'browse';
  /** Home: Pokémon / Yu-Gi-Oh! / One Piece / Sports tab. */
  homeNiche: HomeNicheCategory;
  /** Home: tag/cohort filter within the selected niche. */
  packSubfilter: PackSubfilter;
  sortOrder: 'recommended' | 'price_asc' | 'price_desc' | 'newest' | 'best_value' | 'popular';
  modals: ModalState;
  selectedPack: Pack | null;
  /** Pull ids waiting for ship vs convert (batch session). */
  pendingFulfillmentPullIds: string[];
  /** Prevents double-applying pull rewards (e.g. React Strict Mode / effect re-runs). */
  _packOpenRewardApplied: boolean;
  /** Increments on every successful `openPack` so pack UI re-rolls even when `selectedPack` is the same reference. */
  packOpenSessionId: number;
  /**
   * User tried to open a pack but lacked credits — after buying credits we should return them to the flow
   * (navigate back + reopen pack modal) instead of leaving them on a dead screen.
   */
  resumePackOpenAfterCredits: boolean;

  // Actions
  addCredits: (amount: number) => void;
  addFreePackGrants: (count: number) => void;
  setHomeViewMode: (mode: 'discover' | 'browse') => void;
  setHomeNiche: (niche: HomeNicheCategory) => void;
  setPackSubfilter: (sub: PackSubfilter) => void;
  setSortOrder: (order: AppStore['sortOrder']) => void;
  openModal: (modal: keyof ModalState) => void;
  closeModal: (modal: keyof ModalState) => void;
  setSelectedPack: (pack: Pack | null) => void;
  openPack: (pack: Pack) => boolean; // returns false if not enough credits
  applyPackOpenResult: (
    result: { result: string; creditsWon: number; tier: PullRarityTier },
    options?: { persistToVault?: boolean },
  ) => void;
  /** After Won Prizes: add credits (convert) or mark shipped — no credits. */
  finalizePullFulfillment: (pullIds: string[], choice: 'convert' | 'ship') => void;
  /** Adds a friend by unique username + display name (caller resolves name from lookup). */
  addFriend: (username: string, displayName: string) => AddFriendResult;
  /** When Clerk profile onboarding is done — updates local `user` for Account / Friends. */
  setUserFromClerkProfile: (p: { id: string; displayName: string; username: string }) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  user: mockUser,
  friends: [],
  homeViewMode: 'discover',
  homeNiche: 'pokemon',
  packSubfilter: 'all',
  sortOrder: 'recommended',
  modals: {
    insufficientCredits: false,
    quantitySheet: false,
    packOpening: false,
    wonPrizes: false,
  },
  selectedPack: null,
  pendingFulfillmentPullIds: [],
  _packOpenRewardApplied: false,
  packOpenSessionId: 0,
  resumePackOpenAfterCredits: false,

  addCredits: (amount) =>
    set((state) => ({
      user: { ...state.user, credits: state.user.credits + amount },
    })),

  addFreePackGrants: (count) =>
    set((state) => ({
      user: {
        ...state.user,
        freePackGrants: Math.max(0, (state.user.freePackGrants ?? 0) + count),
      },
    })),

  setHomeViewMode: (mode) => set({ homeViewMode: mode }),

  setHomeNiche: (niche) => set({ homeNiche: niche, packSubfilter: 'all' }),

  setPackSubfilter: (sub) => set({ packSubfilter: sub }),

  setSortOrder: (order) => set({ sortOrder: order }),

  openModal: (modal) =>
    set((state) => ({ modals: { ...state.modals, [modal]: true } })),

  closeModal: (modal) =>
    set((state) => ({ modals: { ...state.modals, [modal]: false } })),

  setSelectedPack: (pack) => set({ selectedPack: pack }),

  /**
   * Single-pack opens only (MVP). Credits + XP apply immediately when the user
   * commits to opening; the modal animation only reveals the pull result.
   * Multi-open / quantity pricing is not implemented in MVP (single open only).
   */
  openPack: (pack) => {
    const { user } = get();
    const grants = user.freePackGrants ?? 0;
    if (grants > 0) {
      set((state) => ({
        selectedPack: pack,
        resumePackOpenAfterCredits: false,
        modals: { ...state.modals, packOpening: true },
        _packOpenRewardApplied: false,
        packOpenSessionId: state.packOpenSessionId + 1,
        user: {
          ...state.user,
          freePackGrants: grants - 1,
        },
      }));
      return true;
    }
    if (user.credits < pack.creditPrice) {
      set((state) => ({
        selectedPack: pack,
        resumePackOpenAfterCredits: true,
        // Close pack opening so the insufficient-credits modal can appear above the app (not hidden under it).
        modals: { ...state.modals, insufficientCredits: true, packOpening: false },
      }));
      return false;
    }
    set((state) => ({
      selectedPack: pack,
      resumePackOpenAfterCredits: false,
      modals: { ...state.modals, packOpening: true },
      _packOpenRewardApplied: false,
      packOpenSessionId: state.packOpenSessionId + 1,
      user: {
        ...state.user,
        credits: state.user.credits - pack.creditPrice,
        xp: state.user.xp + Math.floor(pack.creditPrice * 0.1),
      },
    }));
    return true;
  },

  /**
   * Called when the reveal finishes: records pull as **pending** (no wallet credits yet).
   * User must complete **Won Prizes** (ship vs convert) before credits are applied.
   */
  applyPackOpenResult: (result, options) => {
    const { selectedPack, _packOpenRewardApplied } = get();
    if (!selectedPack || _packOpenRewardApplied) return;

    const persistToVault = options?.persistToVault !== false;

    set((state) => {
      if (!persistToVault) {
        return { _packOpenRewardApplied: true };
      }

      /** Must match on-screen `creditsWon` from the opening reveal (full roll, not capped to pack price). */
      const convertCreditValue = result.creditsWon;

      const pull: Pull = {
        id: `pull_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        packId: selectedPack.id,
        packTitle: selectedPack.title,
        result: result.result,
        creditsWon: result.creditsWon,
        timestamp: new Date(),
        fulfillment: 'pending',
        convertCreditValue,
        tier: result.tier,
      };

      return {
        _packOpenRewardApplied: true,
        pendingFulfillmentPullIds: [pull.id, ...state.pendingFulfillmentPullIds],
        user: {
          ...state.user,
          pullHistory: [pull, ...state.user.pullHistory],
        },
      };
    });
  },

  addFriend: (usernameRaw, displayName) => {
    const { user, friends } = get();
    const u = normalizeFriendUsername(usernameRaw);
    if (!isValidFriendUsernameFormat(u)) return { ok: false, reason: 'invalid' };
    if (u === normalizeFriendUsername(user.username)) return { ok: false, reason: 'self' };
    if (friends.some((f) => f.username === u)) return { ok: false, reason: 'duplicate' };

    const entry: FriendEntry = {
      username: u,
      displayName: displayName.trim() || `Friend ${u.slice(-4)}`,
      addedAt: Date.now(),
    };
    set({ friends: [entry, ...friends] });
    return { ok: true };
  },

  setUserFromClerkProfile: (p) =>
    set((state) => ({
      user: {
        ...state.user,
        id: p.id,
        displayName: p.displayName,
        username: p.username,
        isVerified: true,
        freePackGrants: state.user.freePackGrants ?? 0,
      },
    })),

  finalizePullFulfillment: (pullIds, choice) => {
    set((state) => {
      const idSet = new Set(pullIds);
      const pulls = state.user.pullHistory.filter((p) => idSet.has(p.id) && p.fulfillment === 'pending');
      if (pulls.length === 0) return state;

      const creditsToAdd =
        choice === 'convert'
          ? pulls.reduce((sum, p) => sum + (p.creditsWon ?? p.convertCreditValue ?? 0), 0)
          : 0;
      const nextFulfillment = choice === 'convert' ? 'converted' : 'shipped';

      return {
        pendingFulfillmentPullIds: state.pendingFulfillmentPullIds.filter((id) => !idSet.has(id)),
        modals: { ...state.modals, wonPrizes: false },
        user: {
          ...state.user,
          credits: state.user.credits + creditsToAdd,
          pullHistory: state.user.pullHistory.map((p) =>
            idSet.has(p.id) && p.fulfillment === 'pending' ? { ...p, fulfillment: nextFulfillment } : p,
          ),
        },
      };
    });
  },
}));
