import { create } from 'zustand';
import { mockUser, UserState } from '../data/mockUser';
import { Pack, PackCategory } from '../data/mockPacks';

interface ModalState {
  insufficientCredits: boolean;
  buyCredits: boolean;
  quantitySheet: boolean;
}

interface AppStore {
  user: UserState;
  selectedCategory: PackCategory | 'all';
  sortOrder: 'recommended' | 'price_asc' | 'price_desc' | 'newest' | 'best_value' | 'popular';
  modals: ModalState;
  selectedPack: Pack | null;

  // Actions
  addCredits: (amount: number) => void;
  setCategory: (cat: PackCategory | 'all') => void;
  setSortOrder: (order: AppStore['sortOrder']) => void;
  openModal: (modal: keyof ModalState) => void;
  closeModal: (modal: keyof ModalState) => void;
  setSelectedPack: (pack: Pack | null) => void;
  openPack: (pack: Pack) => boolean; // returns false if not enough credits
}

export const useAppStore = create<AppStore>((set, get) => ({
  user: mockUser,
  selectedCategory: 'all',
  sortOrder: 'recommended',
  modals: {
    insufficientCredits: false,
    buyCredits: false,
    quantitySheet: false,
  },
  selectedPack: null,

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

  openPack: (pack) => {
    const { user } = get();
    if (user.credits < pack.creditPrice) {
      set((state) => ({
        selectedPack: pack,
        modals: { ...state.modals, insufficientCredits: true },
      }));
      return false;
    }
    set((state) => ({
      user: {
        ...state.user,
        credits: state.user.credits - pack.creditPrice,
        xp: state.user.xp + Math.floor(pack.creditPrice * 0.1),
      },
    }));
    return true;
  },
}));
