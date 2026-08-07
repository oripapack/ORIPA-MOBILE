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
import {
  createInitialFriendVaultShop,
  listingIdForPull,
  removeListingsForPullId,
  type PublicVaultListing,
} from '../lib/friendVaultShop';
import { HomeNicheCategory, Pack, PackSubfilter } from '../data/mockPacks';
import {
  CREDITS_ARE_MOCK,
  DEV_STARTER_CREDITS,
  ENABLE_LOCAL_PACK_SIMULATION,
  SHOW_DEMO_INCOMING_FRIEND_REQUEST,
} from '../config/app';
import type { PackRollResult } from '../components/pack/opening/types';
import {
  executeBulkPullLive,
  executePullLive,
  newBatchIdempotencyKey,
  newClientSeed,
  newIdempotencyKey,
} from '../lib/executePull';
import {
  fetchUserVaultFromServer,
  instantTradeInLive,
  isLiveVaultEnabled,
  mergeVaultItemsIntoPullHistory,
  resolveVaultItemIdForPull,
} from '../data/userVault';
import { isSupabaseConfigured } from '../lib/supabase';
import { fetchUserCreditBalance } from '../lib/userCredits';
import { loadShippingAddress } from '../lib/shippingAddress';
import { requestShipmentLive } from '../lib/requestShipment';
import {
  ensureShippingAddressId,
  isLiveShippingEnabled,
  requestPhysicalFulfillmentLive,
} from '../data/shipping';
import { loadClaimedFirstTimePacks, canClaimFirstTimePack, commitFirstTimePackClaim } from '../lib/firstTimePack';
import { showUserMessage } from '../utils/showUserMessage';
import { userWithSyncedProgression, tierXpBonusForPull } from '../lib/collectorProgression';
import {
  loadCollectorGame,
  saveCollectorGame,
  currentQuestWeekKey,
  localYmd,
  ymdAddDays,
} from '../lib/collectorGamePersistence';
import { COLLECTOR_QUESTS, initialQuestProgress } from '../data/collectorQuests';
import { bumpQuestTrack } from './collectorGameHelpers';

/** Bulk opens: 10 pulls in one session (credits only). x100 removed for V1. */
export type PackOpenQuantity = 1 | 10;

interface ModalState {
  insufficientCredits: boolean;
  /**
   * Reserved for future multi-pack / quantity picker (e.g. open 1 vs 5 vs 10).
   * MVP: single pack only — see `openPack` and `PackOpeningModal`.
   */
  quantitySheet: boolean;
  packOpening: boolean;
  /** Vault vs convert — shown right after pack opening (see `WonPrizesModal`). */
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
  /** Pull ids waiting for Vault vs convert (batch session). */
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
  /** Prevents rapid-tap double charges / double opens (async claim + state commit). */
  packOpenInFlight: boolean;
  /** How many pulls this `packOpening` session represents (1 = 3D reveal; 10 = bulk cinematic). */
  packOpenQuantity: PackOpenQuantity;
  /**
   * User tried to open a pack but lacked credits — after buying credits we should return them to the flow
   * (navigate back + reopen pack modal) instead of leaving them on a dead screen.
   */
  resumePackOpenAfterCredits: boolean;
  /** Quantity the user was trying to open when `resumePackOpenAfterCredits` was set. */
  resumePackOpenQuantity: PackOpenQuantity;
  /** Server-backed pull awaiting reveal animation (from `execute-pull`). */
  pendingServerPull: {
    pullId: string;
    mintStatus: string;
    roll: PackRollResult;
    sessionId: number;
    vaultItemId?: string;
    tradeInValueCredits?: number;
  } | null;
  /** Server-backed ×10 batch awaiting bulk cinematic (ledger debits already applied). */
  pendingBulkServerPull: {
    sessionId: number;
    batchId: string;
    pulls: Array<{
      pullId: string;
      mintStatus: string;
      roll: PackRollResult;
      idempotencyKey: string;
      vaultItemId?: string;
      tradeInValueCredits?: number;
    }>;
    balanceAfter: number;
  } | null;
  /** pull_id → vault_item.id cache from live API. */
  vaultItemIdByPullId: Record<string, string>;

  // Actions
  addCredits: (amount: number) => void;
  /** Admin / dev tools: set the wallet balance directly (e.g. grant "infinite" credits). */
  setCredits: (amount: number) => void;
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
    options?: { keepPackModalOnInsufficient?: boolean; quantity?: PackOpenQuantity },
  ) => Promise<boolean>;
  /** Clears "resume open after credits" when user dismisses buy flow without purchasing. */
  clearResumePackOpen: () => void;
  applyPackOpenResult: (
    result: { result: string; creditsWon: number; tier: PullRarityTier },
    options?: { persistToVault?: boolean },
  ) => void;
  applyBulkPackOpenResults: (
    results: { result: string; creditsWon: number; tier: PullRarityTier }[],
    options?: { persistToVault?: boolean },
  ) => void;
  /**
   * After post-open sheet: items in `convertIds` credit the wallet and leave pull history;
   * items in `vaultIds` become `vaulted` with a hold timer (shipping from Vault later).
   */
  finalizePendingFulfillment: (opts: {
    vaultIds: string[];
    convertIds: string[];
  }) => Promise<boolean>;
  /** User requests physical shipment from Vault (live API when configured). */
  requestVaultShipment: (pullId: string) => Promise<boolean>;
  /** Instant coin conversion for a vaulted item. */
  convertVaultPullToCoins: (pullId: string) => Promise<boolean>;
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
  /** Sync wallet credits from `user_credits` (live backend). */
  hydrateUserCredits: (userId: string) => Promise<void>;
  /** Sync vault inventory from `user_vault_items` (live backend). */
  hydrateUserVault: () => Promise<void>;
  clearPendingServerPull: () => void;
  clearPendingBulkServerPull: () => void;
  /** Adds a friend by unique username + display name (caller resolves name from lookup). */
  addFriend: (username: string, displayName: string) => AddFriendResult;
  acceptIncomingFriendRequest: (username: string) => void;
  declineIncomingFriendRequest: (username: string) => void;
  addIncomingFriendRequest: (req: Omit<IncomingFriendRequest, 'id'> & { id?: string }) => void;
  /** When Clerk profile onboarding is done — updates local `user` for Account / Friends. */
  setUserFromClerkProfile: (p: { id: string; displayName: string; username: string }) => void;

  /**
   * Vault Exchange: active USD listings keyed by seller username (lowercase).
   * Merges demo NPC rows with listings you create from your Vault.
   */
  friendVaultShopByUser: Record<string, PublicVaultListing[]>;
  /** Create a Vault Exchange listing (fixed USD, card checkout — client stub). */
  listVaultPullForSale: (pullId: string, priceUsd: number) => boolean;
  /** Remove listing; pull stays vaulted. */
  unlistVaultPullForSale: (pullId: string) => void;
  /**
   * Buyer completes a Vault Exchange purchase after cash payment (demo: stub confirms payment).
   * Does not spend in-app coins. Returns `ok` | `not_found` | `own_listing`.
   */
  purchaseFriendVaultListing: (
    sellerUsername: string,
    listingId: string,
  ) => 'ok' | 'not_found' | 'own_listing';

  /** Daily streak + weekly/daily quest resets (idempotent same calendar day). */
  collectorStreakDays: number;
  collectorStreakBest: number;
  collectorStreakLastYmd: string | null;
  collectorQuestWeekKey: string;
  collectorLastDailyYmd: string | null;
  collectorQuestProgress: Record<string, { progress: number; claimed: boolean }>;
  collectorGameHydrated: boolean;

  recordCollectorActivity: () => void;
  hydrateCollectorGame: () => Promise<void>;
  grantCollectorXp: (amount: number) => void;
  claimCollectorQuest: (questId: string) => boolean;
}

function initialIncomingFriendRequests(): IncomingFriendRequest[] {
  if (!SHOW_DEMO_INCOMING_FRIEND_REQUEST) return [];
  return [buildDemoIncomingFriendRequest()];
}

const seededUser = userWithSyncedProgression(
  { ...mockUser, credits: Math.max(mockUser.credits, DEV_STARTER_CREDITS) },
  mockUser.xp,
);

export const useAppStore = create<AppStore>((set, get) => {
  const persistCollector = () => {
    const s = get();
    void saveCollectorGame(s.user.id, {
      streakDays: s.collectorStreakDays,
      streakBest: s.collectorStreakBest,
      lastStreakYmd: s.collectorStreakLastYmd,
      questWeekKey: s.collectorQuestWeekKey,
      lastDailyYmd: s.collectorLastDailyYmd,
      questProgress: s.collectorQuestProgress,
    });
  };

  return {
  user: seededUser,
  friends: [],
  incomingFriendRequests: initialIncomingFriendRequests(),
  homeViewMode: 'discover',
  homeNiche: 'all',
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
  packOpenInFlight: false,
  packOpenQuantity: 1,
  resumePackOpenAfterCredits: false,
  resumePackOpenQuantity: 1,
  pendingServerPull: null,
  pendingBulkServerPull: null,
  vaultItemIdByPullId: {},
  usedFirstTimePackIds: [],
  friendVaultShopByUser: createInitialFriendVaultShop(),
  collectorStreakDays: 0,
  collectorStreakBest: 0,
  collectorStreakLastYmd: null,
  collectorQuestWeekKey: currentQuestWeekKey(),
  collectorLastDailyYmd: null,
  collectorQuestProgress: initialQuestProgress(),
  collectorGameHydrated: false,

  hydrateCollectorGame: async () => {
    const { user } = get();
    const loaded = await loadCollectorGame(user.id);
    const week = currentQuestWeekKey();

    if (!loaded) {
      set((state) => ({
        collectorQuestWeekKey: week,
        collectorQuestProgress: initialQuestProgress(),
        collectorGameHydrated: true,
        user: userWithSyncedProgression(state.user, state.user.xp),
      }));
      persistCollector();
      return;
    }

    let questProgress = { ...initialQuestProgress(), ...loaded.questProgress };
    for (const q of COLLECTOR_QUESTS) {
      if (!questProgress[q.id]) questProgress[q.id] = { progress: 0, claimed: false };
    }

    let questWeekKey = loaded.questWeekKey || week;
    if (questWeekKey !== week) {
      questWeekKey = week;
      for (const q of COLLECTOR_QUESTS) {
        if (q.kind === 'weekly') questProgress[q.id] = { progress: 0, claimed: false };
      }
    }

    set({
      collectorStreakDays: loaded.streakDays,
      collectorStreakBest: loaded.streakBest,
      collectorStreakLastYmd: loaded.lastStreakYmd,
      collectorQuestWeekKey: questWeekKey,
      collectorLastDailyYmd: loaded.lastDailyYmd ?? null,
      collectorQuestProgress: questProgress,
      collectorGameHydrated: true,
      user: userWithSyncedProgression(get().user, get().user.xp),
    });
    persistCollector();
  },

  recordCollectorActivity: () => {
    const today = localYmd(new Date());
    const week = currentQuestWeekKey();
    const yesterday = ymdAddDays(today, -1);

    set((state) => {
      let {
        collectorStreakDays: streak,
        collectorStreakBest: best,
        collectorStreakLastYmd: last,
        collectorQuestWeekKey: qwk,
        collectorLastDailyYmd: lastDaily,
        collectorQuestProgress: qp,
        user,
      } = state;

      let questProgress = { ...qp };
      let xpBonus = 0;

      if (qwk !== week) {
        qwk = week;
        for (const q of COLLECTOR_QUESTS) {
          if (q.kind === 'weekly') questProgress[q.id] = { progress: 0, claimed: false };
        }
      }

      if (lastDaily !== today) {
        for (const q of COLLECTOR_QUESTS) {
          if (q.kind === 'daily') questProgress[q.id] = { progress: 0, claimed: false };
        }
        lastDaily = today;
        xpBonus += 12;
      }

      if (last === today) {
        questProgress = bumpQuestTrack(questProgress, 'daily_login', 1);
        const synced = userWithSyncedProgression(user, user.xp + xpBonus);
        return {
          collectorQuestWeekKey: qwk,
          collectorLastDailyYmd: lastDaily,
          collectorQuestProgress: questProgress,
          user: synced,
        };
      }

      if (!last) {
        streak = 1;
      } else if (last === yesterday) {
        streak += 1;
      } else {
        streak = 1;
      }
      last = today;
      best = Math.max(best, streak);
      questProgress = bumpQuestTrack(questProgress, 'daily_login', 1);

      const synced = userWithSyncedProgression(user, user.xp + xpBonus);
      return {
        collectorStreakDays: streak,
        collectorStreakBest: best,
        collectorStreakLastYmd: last,
        collectorQuestWeekKey: qwk,
        collectorLastDailyYmd: lastDaily,
        collectorQuestProgress: questProgress,
        user: synced,
      };
    });
    persistCollector();
  },

  grantCollectorXp: (amount) => {
    const n = Math.floor(amount);
    if (n <= 0) return;
    set((state) => ({
      user: userWithSyncedProgression(state.user, state.user.xp + n),
    }));
  },

  claimCollectorQuest: (questId) => {
    const def = COLLECTOR_QUESTS.find((q) => q.id === questId);
    if (!def) return false;
    const row = get().collectorQuestProgress[questId];
    if (!row || row.claimed || row.progress < def.target) return false;
    let ok = false;
    set((state) => {
      const r = state.collectorQuestProgress[questId];
      if (!r || r.claimed || r.progress < def.target) return state;
      ok = true;
      return {
        collectorQuestProgress: {
          ...state.collectorQuestProgress,
          [questId]: { ...r, claimed: true },
        },
        user: userWithSyncedProgression(state.user, state.user.xp + def.xpReward),
      };
    });
    if (ok) persistCollector();
    return ok;
  },

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

  hydrateUserCredits: async (userId) => {
    if (!userId || CREDITS_ARE_MOCK || !isSupabaseConfigured) return;
    const balance = await fetchUserCreditBalance(userId);
    if (balance == null) return;
    set((state) => ({
      user: {
        ...state.user,
        // Keep local signup promo credits if server row is still 0
        credits: Math.max(state.user.credits, balance),
      },
    }));
  },

  hydrateUserVault: async () => {
    if (!isLiveVaultEnabled()) return;
    const items = await fetchUserVaultFromServer();
    if (!items.length) return;

    const idMap: Record<string, string> = {};
    for (const item of items) {
      idMap[item.pull_id] = item.id;
    }

    set((state) => ({
      vaultItemIdByPullId: { ...state.vaultItemIdByPullId, ...idMap },
      user: {
        ...state.user,
        pullHistory: mergeVaultItemsIntoPullHistory(state.user.pullHistory, items),
      },
    }));
  },

  clearPendingServerPull: () => set({ pendingServerPull: null }),
  clearPendingBulkServerPull: () => set({ pendingBulkServerPull: null }),

  addCredits: (amount) =>
    set((state) => ({
      user: { ...state.user, credits: state.user.credits + amount },
    })),

  setCredits: (amount) =>
    set((state) => ({
      user: { ...state.user, credits: Math.max(0, Math.floor(amount)) },
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

  clearResumePackOpen: () =>
    set({ resumePackOpenAfterCredits: false, resumePackOpenQuantity: 1 }),

  /**
   * Opens one pack (free grant or credits) or a bulk session (×10, credits only).
   * Live packs debit via server ledger (`deduct_user_credits` inside `process_atomic_pull`).
   * Demo/offline packs still deduct client-side credits × quantity.
   */
  openPack: async (pack, options) => {
    const keepPack = options?.keepPackModalOnInsufficient ?? false;
    const quantity: PackOpenQuantity = options?.quantity ?? 1;
    const { user, usedFirstTimePackIds, packOpenInFlight } = get();
    const useLiveEngine =
      !CREDITS_ARE_MOCK && isSupabaseConfigured && Boolean(pack.packVersionId);

    if (packOpenInFlight) return false;
    set({ packOpenInFlight: true });

    const commitFirstTimeIfNeeded = async () => {
      if (!pack.isFirstTimePack) return true;
      const committed = await commitFirstTimePackClaim(user.id, pack.id);
      if (!committed.allowed) return false;
      set((state) => ({
        usedFirstTimePackIds: state.usedFirstTimePackIds.includes(pack.id)
          ? state.usedFirstTimePackIds
          : [...state.usedFirstTimePackIds, pack.id],
      }));
      return true;
    };

    try {
      if (!useLiveEngine && !ENABLE_LOCAL_PACK_SIMULATION) {
        showUserMessage(
          'Pack unavailable',
          'This pack is waiting for its live inventory connection.',
        );
        return false;
      }

      if (pack.isFirstTimePack && !ENABLE_LOCAL_PACK_SIMULATION) {
        showUserMessage(
          'Welcome pack unavailable',
          'The welcome pack is waiting for its live fulfillment connection.',
        );
        return false;
      }

      if (pack.isFirstTimePack && usedFirstTimePackIds.includes(pack.id)) {
        showUserMessage(
          'Welcome pack used',
          'You already opened your welcome pack on this account.',
        );
        return false;
      }

      if (pack.isFirstTimePack && quantity === 1 && ENABLE_LOCAL_PACK_SIMULATION) {
        const eligible = await canClaimFirstTimePack(user.id, pack.id);
        if (!eligible.allowed) {
          showUserMessage(
            'Welcome pack used',
            'You already opened your welcome pack on this account.',
          );
          return false;
        }

        if (!(await commitFirstTimeIfNeeded())) {
          showUserMessage(
            'Welcome pack used',
            'You already opened your welcome pack on this account.',
          );
          return false;
        }

        // Onboarding pack: local reveal (no server credits). New accounts start at 0 on Supabase.
        const nextSessionId = get().packOpenSessionId + 1;
        set((state) => ({
          selectedPack: pack,
          resumePackOpenAfterCredits: false,
          resumePackOpenQuantity: 1,
          packOpenQuantity: 1,
          modals: { ...state.modals, packOpening: true },
          _packOpenRewardApplied: false,
          pendingServerPull: null,
          packOpenSessionId: nextSessionId,
        }));
        return true;
      }

      const grants = user.freePackGrants ?? 0;
      const useFreeGrant = ENABLE_LOCAL_PACK_SIMULATION && quantity === 1 && grants > 0;
      if (useFreeGrant) {
        set((state) => ({
          selectedPack: pack,
          resumePackOpenAfterCredits: false,
          resumePackOpenQuantity: 1,
          packOpenQuantity: 1,
          modals: { ...state.modals, packOpening: true },
          _packOpenRewardApplied: false,
          pendingServerPull: null,
          packOpenSessionId: state.packOpenSessionId + 1,
          user: {
            ...state.user,
            freePackGrants: grants - 1,
          },
        }));
        return true;
      }

      const isInsufficientFunds = (code: string, status?: number) =>
        code === 'INSUFFICIENT_FUNDS' ||
        code === 'INSUFFICIENT_CREDITS' ||
        status === 402;

      const showInsufficientCredits = () => {
        set((state) => ({
          selectedPack: pack,
          resumePackOpenAfterCredits: true,
          resumePackOpenQuantity: quantity,
          modals: {
            ...state.modals,
            insufficientCredits: true,
            packOpening: keepPack ? true : false,
          },
        }));
      };

      // Live ledger: server debits via deduct_user_credits inside process_atomic_pull.
      if (useLiveEngine && pack.packVersionId && (quantity === 1 || quantity === 10)) {
        const totalCost = pack.creditPrice * quantity;
        if (user.credits < totalCost) {
          showInsufficientCredits();
          return false;
        }

        if (quantity === 1) {
          const pullResult = await executePullLive({
            clientSeed: newClientSeed(),
            packVersionId: pack.packVersionId,
            idempotencyKey: newIdempotencyKey(),
            packCreditPrice: pack.creditPrice,
          });

          if (!pullResult.ok) {
            if (isInsufficientFunds(pullResult.code, pullResult.status)) {
              showInsufficientCredits();
              return false;
            }
            if (pullResult.code === 'UNAUTHORIZED') {
              showUserMessage('Sign in required', 'Please sign in to open packs.');
              return false;
            }
            if (pullResult.code === 'DUPLICATE_TRANSACTION') {
              showUserMessage('Already processed', 'This pack open was already recorded.');
              return false;
            }
            const label =
              pullResult.code === 'NETWORK_ERROR' ? 'Connection problem' : 'Pack open failed';
            showUserMessage(label, pullResult.message);
            return false;
          }

          const nextSessionId = get().packOpenSessionId + 1;
          const balanceAfter =
            pullResult.response.balance_after ?? user.credits - pack.creditPrice;
          const vaultItemId =
            pullResult.response.vault_item_id ?? pullResult.response.vault_item?.id;
          const tradeInValueCredits = pullResult.response.vault_item?.trade_in_value_credits;

          set((state) => ({
            selectedPack: pack,
            resumePackOpenAfterCredits: false,
            resumePackOpenQuantity: 1,
            packOpenQuantity: 1,
            modals: { ...state.modals, packOpening: true },
            _packOpenRewardApplied: false,
            packOpenSessionId: nextSessionId,
            pendingBulkServerPull: null,
            pendingServerPull: {
              pullId: pullResult.response.pull_id,
              mintStatus: pullResult.response.mint_status,
              roll: pullResult.roll,
              sessionId: nextSessionId,
              vaultItemId,
              tradeInValueCredits,
            },
            vaultItemIdByPullId: vaultItemId
              ? {
                  ...state.vaultItemIdByPullId,
                  [pullResult.response.pull_id]: vaultItemId,
                }
              : state.vaultItemIdByPullId,
            user: {
              ...state.user,
              credits: balanceAfter,
            },
          }));
          return true;
        }

        const batchKey = newBatchIdempotencyKey();
        const bulkResult = await executeBulkPullLive({
          packVersionId: pack.packVersionId,
          packCreditPrice: pack.creditPrice,
          quantity,
          batchIdempotencyKey: batchKey,
        });

        if (!bulkResult.ok) {
          if (isInsufficientFunds(bulkResult.code, bulkResult.status)) {
            showInsufficientCredits();
            return false;
          }
          if (bulkResult.code === 'UNAUTHORIZED') {
            showUserMessage('Sign in required', 'Please sign in to open packs.');
            return false;
          }
          if (bulkResult.code === 'DUPLICATE_TRANSACTION') {
            showUserMessage('Already processed', 'This bulk open was already recorded.');
            return false;
          }
          const label =
            bulkResult.code === 'NETWORK_ERROR' ? 'Connection problem' : 'Pack open failed';
          showUserMessage(label, bulkResult.message);
          return false;
        }

        const nextSessionId = get().packOpenSessionId + 1;
        const balanceAfter =
          bulkResult.response.balanceAfter ?? user.credits - totalCost;
        const vaultMap: Record<string, string> = {};

        for (const p of bulkResult.response.pulls) {
          if (p.vaultItemId) vaultMap[p.pullId] = p.vaultItemId;
        }

        set((state) => ({
          selectedPack: pack,
          resumePackOpenAfterCredits: false,
          resumePackOpenQuantity: 1,
          packOpenQuantity: quantity,
          modals: { ...state.modals, packOpening: true },
          _packOpenRewardApplied: false,
          packOpenSessionId: nextSessionId,
          pendingServerPull: null,
          pendingBulkServerPull: {
            sessionId: nextSessionId,
            batchId: bulkResult.response.batchId,
            pulls: bulkResult.response.pulls.map((p) => ({
              pullId: p.pullId,
              mintStatus: p.mintStatus,
              roll: p.roll,
              idempotencyKey: p.idempotencyKey,
              vaultItemId: p.vaultItemId,
              tradeInValueCredits: p.tradeInValueCredits,
            })),
            balanceAfter,
          },
          vaultItemIdByPullId: { ...state.vaultItemIdByPullId, ...vaultMap },
          user: {
            ...state.user,
            credits: balanceAfter,
          },
        }));
        return true;
      }

      // Demo / offline: client-side credit deduction × quantity.
      const totalCost = pack.creditPrice * quantity;
      if (user.credits < totalCost) {
        set((state) => ({
          selectedPack: pack,
          resumePackOpenAfterCredits: true,
          resumePackOpenQuantity: quantity,
          modals: {
            ...state.modals,
            insufficientCredits: true,
            packOpening: keepPack ? true : false,
          },
        }));
        return false;
      }

      if (quantity > 1 && pack.remainingInventory < quantity) {
        return false;
      }

      set((state) => ({
        selectedPack: pack,
        resumePackOpenAfterCredits: false,
        resumePackOpenQuantity: 1,
        packOpenQuantity: quantity,
        modals: { ...state.modals, packOpening: true },
        _packOpenRewardApplied: false,
        pendingServerPull: null,
        pendingBulkServerPull: null,
        packOpenSessionId: state.packOpenSessionId + 1,
        user: {
          ...state.user,
          credits: state.user.credits - totalCost,
        },
      }));
      return true;
    } finally {
      set({ packOpenInFlight: false });
    }
  },

  /**
   * Called when the reveal finishes: records pull as **pending** (no wallet credits yet).
   * User must complete post-open fulfillment (Vault vs convert) before credits apply.
   */
  applyPackOpenResult: (result, options) => {
    const { selectedPack, _packOpenRewardApplied, pendingServerPull } = get();
    if (!selectedPack || _packOpenRewardApplied) return;

    const persistToVault = options?.persistToVault !== false;

    set((state) => {
      if (!persistToVault) {
        return { _packOpenRewardApplied: true, pendingServerPull: null };
      }

      /** Must match on-screen `creditsWon` from the opening reveal (full roll, not capped to pack price). */
      const convertCreditValue =
        pendingServerPull?.tradeInValueCredits ?? result.creditsWon;

      const pull: Pull = {
        id:
          pendingServerPull?.pullId ??
          `pull_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        packId: selectedPack.id,
        packTitle: selectedPack.title,
        result: result.result,
        creditsWon: convertCreditValue,
        timestamp: new Date(),
        fulfillment: 'pending',
        convertCreditValue,
        tier: result.tier,
        vaultItemId: pendingServerPull?.vaultItemId,
      };

      const xpGain = 22 + tierXpBonusForPull(result.tier);
      const synced = userWithSyncedProgression(state.user, state.user.xp + xpGain);
      const qp = bumpQuestTrack(state.collectorQuestProgress, 'pack_opens', 1);

      return {
        _packOpenRewardApplied: true,
        pendingServerPull: null,
        pendingFulfillmentPullIds: [pull.id, ...state.pendingFulfillmentPullIds],
        collectorQuestProgress: qp,
        user: {
          ...synced,
          pullHistory: [pull, ...state.user.pullHistory],
        },
      };
    });
    if (persistToVault) persistCollector();
  },

  applyBulkPackOpenResults: (results, options) => {
    const { selectedPack, _packOpenRewardApplied, pendingBulkServerPull } = get();
    if (!selectedPack || _packOpenRewardApplied || results.length === 0) return;

    const persistToVault = options?.persistToVault !== false;

    set((state) => {
      if (!persistToVault) {
        return { _packOpenRewardApplied: true, pendingBulkServerPull: null };
      }

      const baseTime = Date.now();
      const pulls: Pull[] = results.map((result, i) => {
        const serverPull = pendingBulkServerPull?.pulls[i];
        const convertCreditValue = serverPull?.tradeInValueCredits ?? result.creditsWon;
        return {
          id: serverPull?.pullId ?? `pull_${baseTime}_${i}_${Math.random().toString(16).slice(2)}`,
          packId: selectedPack.id,
          packTitle: selectedPack.title,
          result: result.result,
          creditsWon: convertCreditValue,
          timestamp: new Date(),
          fulfillment: 'pending' as const,
          convertCreditValue,
          tier: result.tier,
          vaultItemId: serverPull?.vaultItemId,
        };
      });
      const newIds = pulls.map((p) => p.id);

      const xpGain = results.reduce((sum, r) => sum + 22 + tierXpBonusForPull(r.tier), 0);
      const synced = userWithSyncedProgression(state.user, state.user.xp + xpGain);
      const qp = bumpQuestTrack(state.collectorQuestProgress, 'pack_opens', results.length);

      return {
        _packOpenRewardApplied: true,
        pendingBulkServerPull: null,
        pendingFulfillmentPullIds: [...newIds, ...state.pendingFulfillmentPullIds],
        collectorQuestProgress: qp,
        user: {
          ...synced,
          pullHistory: [...pulls, ...state.user.pullHistory],
        },
      };
    });
    if (persistToVault) persistCollector();
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
      collectorQuestProgress: bumpQuestTrack(state.collectorQuestProgress, 'friends_added', 1),
      user: userWithSyncedProgression(state.user, state.user.xp + 45),
    }));
    persistCollector();
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

  finalizePendingFulfillment: async ({ vaultIds, convertIds }) => {
    const vSet = new Set(vaultIds);
    const cSet = new Set(convertIds);
    const liveVault = isLiveVaultEnabled();
    let liveBalanceAfter: number | undefined;

    if (liveVault && convertIds.length > 0) {
      const { vaultItemIdByPullId, user } = get();
      const index = new Map(Object.entries(vaultItemIdByPullId));

      for (const pullId of convertIds) {
        const pull = user.pullHistory.find((p) => p.id === pullId);
        if (!pull) continue;
        const vaultItemId = resolveVaultItemIdForPull(pull, index);
        if (!vaultItemId) {
          showUserMessage(
            'Trade-in unavailable',
            'Could not find this card in the live vault inventory.',
          );
          return false;
        }

        const tradeIn = await instantTradeInLive({
          vaultItemId,
          idempotencyKey: newIdempotencyKey(),
        });

        if (!tradeIn.ok) {
          showUserMessage('Trade-in failed', tradeIn.message);
          return false;
        }

        liveBalanceAfter = tradeIn.response.balance_after;
      }
    }

    let didUpdate = false;
    set((state) => {
      const pendingPulls = state.user.pullHistory.filter(
        (p) => p.fulfillment === 'pending' && (vSet.has(p.id) || cSet.has(p.id)),
      );
      if (pendingPulls.length === 0) return state;

      const creditsToAdd = liveVault
        ? 0
        : pendingPulls
            .filter((p) => cSet.has(p.id))
            .reduce((sum, p) => sum + (p.creditsWon ?? p.convertCreditValue ?? 0), 0);

      const clearedIds = new Set([...vaultIds, ...convertIds]);
      const xpAdd = vaultIds.length * 28 + convertIds.length * 14;
      let qp = state.collectorQuestProgress;
      if (vaultIds.length) qp = bumpQuestTrack(qp, 'vault_secured', vaultIds.length);
      if (convertIds.length) qp = bumpQuestTrack(qp, 'vault_convert', convertIds.length);
      const synced = userWithSyncedProgression(state.user, state.user.xp + xpAdd);

      didUpdate = true;
      return {
        pendingFulfillmentPullIds: state.pendingFulfillmentPullIds.filter((id) => !clearedIds.has(id)),
        modals: { ...state.modals, wonPrizes: false },
        collectorQuestProgress: qp,
        user: {
          ...synced,
          credits:
            liveBalanceAfter != null
              ? liveBalanceAfter
              : state.user.credits + creditsToAdd,
          pullHistory: state.user.pullHistory.map((p) => {
            if (p.fulfillment !== 'pending') return p;
            if (cSet.has(p.id)) {
              return { ...p, fulfillment: 'converted' as const };
            }
            if (vSet.has(p.id)) {
              return {
                ...p,
                fulfillment: 'vaulted' as const,
                vaultExpiresAt: undefined,
                vaultHoldDays: undefined,
              };
            }
            return p;
          }),
        },
      };
    });
    if (didUpdate) persistCollector();
    return didUpdate;
  },

  requestVaultShipment: async (pullId) => {
    const { user, vaultItemIdByPullId } = get();
    const pull = user.pullHistory.find((p) => p.id === pullId);
    if (!pull || pull.fulfillment !== 'vaulted') return false;

    const liveShipping = isLiveShippingEnabled();

    if (liveShipping) {
      const vaultItemId = resolveVaultItemIdForPull(
        pull,
        new Map(Object.entries(vaultItemIdByPullId)),
      );
      if (!vaultItemId) {
        showUserMessage(
          'Shipment unavailable',
          'Could not find this card in the live vault inventory.',
        );
        return false;
      }

      const addressResult = await ensureShippingAddressId(user.id);
      if (!addressResult.ok) {
        showUserMessage(
          addressResult.code === 'ADDRESS_REQUIRED'
            ? 'Shipping address required'
            : 'Shipment request failed',
          addressResult.message,
        );
        return false;
      }

      const result = await requestPhysicalFulfillmentLive({
        userId: user.id,
        vaultItemIds: [vaultItemId],
        addressId: addressResult.addressId,
        idempotencyKey: newIdempotencyKey(),
      });

      if (!result.ok) {
        if (result.code === 'INSUFFICIENT_FUNDS') {
          showUserMessage('Insufficient Points', result.message);
          return false;
        }
        const label =
          result.code === 'UNAUTHORIZED' ? 'Sign in required' : 'Shipment request failed';
        showUserMessage(label, result.message);
        return false;
      }

      set((state) => {
        const u = normalizeFriendUsername(state.user.username);
        const shop = removeListingsForPullId(state.friendVaultShopByUser, u, pullId);
        return {
          friendVaultShopByUser: shop,
          user: {
            ...state.user,
            credits:
              result.response.balance_after != null
                ? result.response.balance_after
                : state.user.credits,
            pullHistory: state.user.pullHistory.map((p) =>
              p.id === pullId && p.fulfillment === 'vaulted'
                ? {
                    ...p,
                    fulfillment: 'shipped' as const,
                    vaultExpiresAt: undefined,
                    vaultHoldDays: undefined,
                    vaultExchangeListUsd: undefined,
                  }
                : p,
            ),
          },
        };
      });
      return true;
    }

    // Demo / offline: optional legacy edge path, else local state only
    const useLegacyEdge = !CREDITS_ARE_MOCK && isSupabaseConfigured;
    if (useLegacyEdge) {
      const shippingAddress = await loadShippingAddress();
      if (!shippingAddress) {
        showUserMessage(
          'Shipping address required',
          'Add a shipping address in Settings before requesting shipment.',
        );
        return false;
      }

      const result = await requestShipmentLive({ pullId, shippingAddress });
      if (!result.ok) {
        const label =
          result.code === 'NETWORK_ERROR'
            ? 'Connection problem'
            : 'Shipment request failed';
        showUserMessage(label, result.message);
        return false;
      }
    } else {
      const shippingAddress = await loadShippingAddress();
      if (!shippingAddress) {
        showUserMessage(
          'Shipping address required',
          'Add a shipping address in Settings before requesting shipment.',
        );
        return false;
      }
    }

    set((state) => {
      const u = normalizeFriendUsername(state.user.username);
      const shop = removeListingsForPullId(state.friendVaultShopByUser, u, pullId);
      return {
        friendVaultShopByUser: shop,
        user: {
          ...state.user,
          pullHistory: state.user.pullHistory.map((p) =>
            p.id === pullId && p.fulfillment === 'vaulted'
              ? {
                  ...p,
                  fulfillment: 'shipped' as const,
                  vaultExpiresAt: undefined,
                  vaultHoldDays: undefined,
                  vaultExchangeListUsd: undefined,
                }
              : p,
          ),
        },
      };
    });
    return true;
  },

  convertVaultPullToCoins: async (pullId) => {
    const { user, vaultItemIdByPullId } = get();
    const pull = user.pullHistory.find((p) => p.id === pullId);
    if (!pull || pull.fulfillment !== 'vaulted') return false;

    let balanceAfter: number | undefined;

    if (isLiveVaultEnabled()) {
      const vaultItemId = resolveVaultItemIdForPull(
        pull,
        new Map(Object.entries(vaultItemIdByPullId)),
      );
      if (!vaultItemId) {
        showUserMessage(
          'Trade-in unavailable',
          'Could not find this card in the live vault inventory.',
        );
        return false;
      }

      const tradeIn = await instantTradeInLive({
        vaultItemId,
        idempotencyKey: newIdempotencyKey(),
      });

      if (!tradeIn.ok) {
        showUserMessage('Trade-in failed', tradeIn.message);
        return false;
      }

      balanceAfter = tradeIn.response.balance_after;
    }

    let did = false;
    set((state) => {
      const current = state.user.pullHistory.find((p) => p.id === pullId);
      if (!current || current.fulfillment !== 'vaulted') return state;
      const amt = current.creditsWon ?? current.convertCreditValue ?? 0;
      const u = normalizeFriendUsername(state.user.username);
      const shop = removeListingsForPullId(state.friendVaultShopByUser, u, pullId);
      const qp = bumpQuestTrack(state.collectorQuestProgress, 'vault_convert', 1);
      const synced = userWithSyncedProgression(state.user, state.user.xp + 18);
      did = true;
      return {
        friendVaultShopByUser: shop,
        collectorQuestProgress: qp,
        user: {
          ...synced,
          credits: balanceAfter != null ? balanceAfter : state.user.credits + amt,
          pullHistory: state.user.pullHistory.map((p) =>
            p.id === pullId
              ? {
                  ...p,
                  fulfillment: 'converted' as const,
                  vaultExpiresAt: undefined,
                  vaultHoldDays: undefined,
                  vaultExchangeListUsd: undefined,
                }
              : p,
          ),
        },
      };
    });
    if (did) persistCollector();
    return did;
  },

  listVaultPullForSale: (pullId, priceUsd) => {
    const price = Math.floor(priceUsd);
    if (price < 1) return false;
    const pull = get().user.pullHistory.find((p) => p.id === pullId);
    if (!pull || pull.fulfillment !== 'vaulted') return false;
    const u = normalizeFriendUsername(get().user.username);
    const listing: PublicVaultListing = {
      id: listingIdForPull(pullId),
      sellerUsername: u,
      pullId,
      listPriceUsd: price,
      result: pull.result,
      packTitle: pull.packTitle,
      packId: pull.packId,
      tier: pull.tier,
      isDemo: false,
    };
    set((state) => {
      const prev = state.friendVaultShopByUser[u] ?? [];
      const rest = prev.filter((l) => l.pullId !== pullId);
      return {
        user: {
          ...state.user,
          pullHistory: state.user.pullHistory.map((p) =>
            p.id === pullId ? { ...p, vaultExchangeListUsd: price } : p,
          ),
        },
        friendVaultShopByUser: {
          ...state.friendVaultShopByUser,
          [u]: [listing, ...rest],
        },
      };
    });
    return true;
  },

  unlistVaultPullForSale: (pullId) => {
    set((state) => {
      const u = normalizeFriendUsername(state.user.username);
      const shop = removeListingsForPullId(state.friendVaultShopByUser, u, pullId);
      return {
        friendVaultShopByUser: shop,
        user: {
          ...state.user,
          pullHistory: state.user.pullHistory.map((p) =>
            p.id === pullId ? { ...p, vaultExchangeListUsd: undefined } : p,
          ),
        },
      };
    });
  },

  purchaseFriendVaultListing: (sellerUsernameRaw, listingId) => {
    const seller = normalizeFriendUsername(sellerUsernameRaw);
    const me = normalizeFriendUsername(get().user.username);
    const rows = get().friendVaultShopByUser[seller] ?? [];
    const listing = rows.find((l) => l.id === listingId);
    if (!listing) return 'not_found';
    if (seller === me) return 'own_listing';

    const priceUsd = listing.listPriceUsd;
    const notionalCredits = Math.max(100, Math.round(priceUsd * 10));
    const newPull: Pull = {
      id: `pull_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      packId: listing.packId,
      packTitle: listing.packTitle,
      result: listing.result,
      creditsWon: notionalCredits,
      timestamp: new Date(),
      fulfillment: 'vaulted',
      convertCreditValue: notionalCredits,
      tier: listing.tier ?? 'base',
    };

    set((state) => {
      const r = state.friendVaultShopByUser[seller] ?? [];
      const nextRows = r.filter((l) => l.id !== listingId);
      return {
        friendVaultShopByUser: { ...state.friendVaultShopByUser, [seller]: nextRows },
        user: {
          ...state.user,
          pullHistory: [newPull, ...state.user.pullHistory],
        },
      };
    });

    return 'ok';
  },
};
});
