import { create } from 'zustand';
import {
  FriendEntry,
  IncomingFriendRequest,
  buildDemoIncomingFriendRequest,
  isValidFriendUsernameFormat,
  lookupFriendDisplayName,
  normalizeFriendUsername,
} from '../data/friends';
import { mockUser, Pull, PullRarityTier, UserState } from '../data/mockUser';
import { HomeNicheCategory, Pack, PackSubfilter } from '../data/mockPacks';
import { SHOW_DEMO_INCOMING_FRIEND_REQUEST } from '../config/app';
import { claimFirstTimePack, loadClaimedFirstTimePacks } from '../lib/firstTimePack';

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
  /** Pending inbound friend requests (local / demo until API). */
  incomingFriendRequests: IncomingFriendRequest[];
  /** Home view mode: discovery lobby vs full catalog floor. */
  homeViewMode: 'discover' | 'browse';
  /** Home: onboarding / micro / premium tab. */
  homeNiche: HomeNicheCategory;
  /** Home: tag/cohort filter within the selected niche. */
  packSubfilter: PackSubfilter;
  sortOrder: 'recommended' | 'price_asc' | 'price_desc' | 'newest' | 'best_value' | 'popular';
  modals: ModalState;
  selectedPack: Pack | null;
  /** Pull ids waiting for ship vs convert (batch session). */
  pendingFulfillmentPullIds: string[];
  /**
   * Pack IDs the user has already opened that are marked `isFirstTimePack`.
   * Checked in `openPack()` to enforce the 1-per-account rule.
   * In production this must also be enforced server-side.
   */
  usedFirstTimePackIds: string[];
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
  openPack: (
    pack: Pack,
    options?: { keepPackModalOnInsufficient?: boolean },
  ) => boolean;
  /** Clears "resume open after credits" when user dismisses buy flow without purchasing. */
  clearResumePackOpen: () => void;
  applyPackOpenResult: (
    result: { result: string; creditsWon: number; tier: PullRarityTier },
    options?: { persistToVault?: boolean },
  ) => void;
  /** After Won Prizes: add credits (convert) or mark shipped — no credits. */
  finalizePullFulfillment: (pullIds: string[], choice: 'convert' | 'ship') => void;
  /**
   * Records that the user has consumed a first-time pack.
   * Called inside `openPack` automatically — no need to call manually.
   */
  markFirstTimePackUsed: (packId: string) => void;
  /**
   * Load persisted first-time pack claims (AsyncStorage + Supabase) into in-memory state.
   * Call once on app startup / after sign-in (see GuestHydration in RootNavigator).
   */
  hydrateFirstTimePacks: () => Promise<void>;
  /** Adds a friend by unique username + display name (caller resolves name from lookup). */
  addFriend: (username: string, displayName: string) => AddFriendResult;
  acceptIncomingFriendRequest: (username: string) => void;
  declineIncomingFriendRequest: (username: string) => void;
  addIncomingFriendRequest: (req: Omit<IncomingFriendRequest, 'id'> & { id?: string }) => void;
  /** When Clerk profile onboarding is done — updates local `user` for Account / Friends. */
  setUserFromClerkProfile: (p: { id: string; displayName: string; username: string }) => void;
}

function initialIncomingFriendRequests(): IncomingFriendRequest[] {
  if (!SHOW_DEMO_INCOMING_FRIEND_REQUEST) return [];
  return [buildDemoIncomingFriendRequest()];
}

export const useAppStore = create<AppStore>((set, get) => ({
  user: mockUser,
  friends: [],
  incomingFriendRequests: initialIncomingFriendRequests(),
  homeViewMode: 'discover',
  homeNiche: 'onboarding',
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
  usedFirstTimePackIds: [],

  markFirstTimePackUsed: (packId) =>
    set((state) => ({
      usedFirstTimePackIds: state.usedFirstTimePackIds.includes(packId)
        ? state.usedFirstTimePackIds
        : [...state.usedFirstTimePackIds, packId],
    })),

  hydrateFirstTimePacks: async () => {
    const { user } = get();
    if (!user.id) return;
    const claimed = await loadClaimedFirstTimePacks(user.id);
    if (claimed.length === 0) return;
    set((state) => ({
      usedFirstTimePackIds: [...new Set([...state.usedFirstTimePackIds, ...claimed])],
    }));
  },

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

  clearResumePackOpen: () => set({ resumePackOpenAfterCredits: false }),

  /**
   * Single-pack opens only (MVP). Credits + XP apply immediately when the user
   * commits to opening; the modal animation only reveals the pull result.
   * Multi-open / quantity pricing is not implemented in MVP (single open only).
   */
  openPack: (pack, options) => {
    const keepPack = options?.keepPackModalOnInsufficient ?? false;
    const { user, usedFirstTimePackIds } = get();

    // --- First-time pack guard ---
    // Layer 1 (fast, in-memory): block immediately if already claimed this session.
    if (pack.isFirstTimePack && usedFirstTimePackIds.includes(pack.id)) {
      return false;
    }

    const grants = user.freePackGrants ?? 0;
    const firstTimeUpdate = pack.isFirstTimePack
      ? { usedFirstTimePackIds: [...usedFirstTimePackIds, pack.id] }
      : {};

    // Layer 2 (persistent, async): write claim to AsyncStorage + Supabase BEFORE the
    // open completes. If the server rejects (duplicate row), we undo the open.
    // This fires for every first-time pack attempt — not just when the modal opens —
    // so a direct API replay is blocked at the DB unique-constraint level.
    if (pack.isFirstTimePack) {
      void claimFirstTimePack(user.id, pack.id).then((result) => {
        if (!result.allowed) {
          // Server says already claimed — undo the open and close the modal.
          set((state) => ({
            usedFirstTimePackIds: state.usedFirstTimePackIds.includes(pack.id)
              ? state.usedFirstTimePackIds
              : [...state.usedFirstTimePackIds, pack.id],
            modals: { ...state.modals, packOpening: false, wonPrizes: false },
            pendingFulfillmentPullIds: state.pendingFulfillmentPullIds,
          }));
        }
      });
    }

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
        ...firstTimeUpdate,
      }));
      return true;
    }
    if (user.credits < pack.creditPrice) {
      set((state) => ({
        selectedPack: pack,
        resumePackOpenAfterCredits: true,
        modals: {
          ...state.modals,
          insufficientCredits: true,
          // From pack reveal "open another", keep this modal open so backing out of buy credits isn't a dead end.
          packOpening: keepPack ? true : false,
        },
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
      ...firstTimeUpdate,
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
    set((state) => ({
      friends: [entry, ...state.friends],
      incomingFriendRequests: state.incomingFriendRequests.filter((r) => r.username !== u),
    }));
    return { ok: true };
  },

  acceptIncomingFriendRequest: (usernameRaw) => {
    const u = normalizeFriendUsername(usernameRaw);
    const req = get().incomingFriendRequests.find((r) => r.username === u);
    if (!req) return;
    const res = get().addFriend(req.username, req.displayName);
    if (!res.ok) return;
    set((state) => ({
      incomingFriendRequests: state.incomingFriendRequests.filter((r) => r.username !== u),
    }));
  },

  declineIncomingFriendRequest: (usernameRaw) => {
    const u = normalizeFriendUsername(usernameRaw);
    set((state) => ({
      incomingFriendRequests: state.incomingFriendRequests.filter((r) => r.username !== u),
    }));
  },

  addIncomingFriendRequest: partial => {
    const username = normalizeFriendUsername(partial.username);
    if (!isValidFriendUsernameFormat(username)) return;
    const { friends, incomingFriendRequests, user } = get();
    if (friends.some((f) => f.username === username)) return;
    if (incomingFriendRequests.some((r) => r.username === username)) return;
    if (username === normalizeFriendUsername(user.username)) return;
    const entry: IncomingFriendRequest = {
      id:
        partial.id ??
        `ifr_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      username,
      displayName:
        partial.displayName.trim() ||
        lookupFriendDisplayName(username) ||
        `User ${username.slice(-4)}`,
      requestedAt: partial.requestedAt ?? Date.now(),
    };
    set({ incomingFriendRequests: [entry, ...incomingFriendRequests] });
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
