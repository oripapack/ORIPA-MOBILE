import { create } from 'zustand';
import { mockUser, Pull, PullRarityTier, UserState } from '../data/mockUser';
import { Pack, PackCategory } from '../data/mockPacks';

interface ModalState {
  insufficientCredits: boolean;
  buyCredits: boolean;
  /**
   * Reserved for future multi-pack / quantity picker (e.g. open 1 vs 5 vs 10).
   * MVP: single pack only — see `openPack` and `PackOpeningModal`.
   */
  quantitySheet: boolean;
  packOpening: boolean;
  /** Ship vs convert — shown right after pack opening (see `WonPrizesModal`). */
  wonPrizes: boolean;
}

interface AppStore {
  user: UserState;
  selectedCategory: PackCategory | 'all';
  sortOrder: 'recommended' | 'price_asc' | 'price_desc' | 'newest' | 'best_value' | 'popular';
  modals: ModalState;
  selectedPack: Pack | null;
  /** Pull id waiting for ship vs convert (single-item MVP). */
  pendingFulfillmentPullId: string | null;
  /** Prevents double-applying pull rewards (e.g. React Strict Mode / effect re-runs). */
  _packOpenRewardApplied: boolean;

  // Actions
  addCredits: (amount: number) => void;
  setCategory: (cat: PackCategory | 'all') => void;
  setSortOrder: (order: AppStore['sortOrder']) => void;
  openModal: (modal: keyof ModalState) => void;
  closeModal: (modal: keyof ModalState) => void;
  setSelectedPack: (pack: Pack | null) => void;
  openPack: (pack: Pack) => boolean; // returns false if not enough credits
  applyPackOpenResult: (result: { result: string; creditsWon: number; tier: PullRarityTier }) => void;
  /** After Won Prizes: add credits (convert) or mark shipped — no credits. */
  finalizePullFulfillment: (pullId: string, choice: 'convert' | 'ship') => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  user: mockUser,
  selectedCategory: 'all',
  sortOrder: 'recommended',
  modals: {
    insufficientCredits: false,
    buyCredits: false,
    quantitySheet: false,
    packOpening: false,
    wonPrizes: false,
  },
  selectedPack: null,
  pendingFulfillmentPullId: null,
  _packOpenRewardApplied: false,

  addCredits: (amount) =>
    set((state) => ({
      user: { ...state.user, credits: state.user.credits + amount },
    })),

  setCategory: (cat) => set({ selectedCategory: cat }),

  setSortOrder: (order) => set({ sortOrder: order }),

  openModal: (modal) =>
    set((state) => ({ modals: { ...state.modals, [modal]: true } })),

  closeModal: (modal) =>
    set((state) => ({ modals: { ...state.modals, [modal]: false } })),

  setSelectedPack: (pack) => set({ selectedPack: pack }),

  /**
   * Single-pack opens only (MVP). Credits + XP apply immediately when the user
   * commits to opening; the modal animation only reveals the pull result.
   * TODO: wire `quantitySheet` + quantity pricing when we add multi-open.
   */
  openPack: (pack) => {
    const { user, pendingFulfillmentPullId } = get();
    if (pendingFulfillmentPullId) {
      return false;
    }
    if (user.credits < pack.creditPrice) {
      set((state) => ({
        selectedPack: pack,
        modals: { ...state.modals, insufficientCredits: true },
      }));
      return false;
    }
    set((state) => ({
      selectedPack: pack,
      modals: { ...state.modals, packOpening: true },
      _packOpenRewardApplied: false,
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
  applyPackOpenResult: (result) => {
    const { selectedPack, _packOpenRewardApplied } = get();
    if (!selectedPack || _packOpenRewardApplied) return;

    const convertCreditValue = Math.min(result.creditsWon, selectedPack.creditPrice);

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

    set((state) => ({
      _packOpenRewardApplied: true,
      pendingFulfillmentPullId: pull.id,
      user: {
        ...state.user,
        pullHistory: [pull, ...state.user.pullHistory],
      },
    }));
  },

  finalizePullFulfillment: (pullId, choice) => {
    set((state) => {
      const pull = state.user.pullHistory.find((p) => p.id === pullId);
      if (!pull || pull.fulfillment !== 'pending') return state;

      const creditsToAdd = choice === 'convert' ? (pull.convertCreditValue ?? 0) : 0;
      const nextFulfillment = choice === 'convert' ? 'converted' : 'shipped';

      return {
        pendingFulfillmentPullId: null,
        modals: { ...state.modals, wonPrizes: false },
        user: {
          ...state.user,
          credits: state.user.credits + creditsToAdd,
          pullHistory: state.user.pullHistory.map((p) =>
            p.id === pullId ? { ...p, fulfillment: nextFulfillment } : p,
          ),
        },
      };
    });
  },
}));
