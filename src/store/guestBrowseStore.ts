import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { isClerkEnabled } from '../config/clerk';

const GUEST_KEY = '@pullhub_guest_browse_v1';
const PROMO_KEY = '@pullhub_welcome_promo_seen_v1';

type State = {
  hydrated: boolean;
  /** User chose “browse without signing in” (persisted). */
  guestBrowseEnabled: boolean;
  /** True when a guest tried a protected action — show sign-in again. */
  authWallForced: boolean;
  /** Device has seen the first-time signup promo strip. */
  welcomePromoSeen: boolean;
  /** Mirrored from Clerk session (signed in). When Clerk is off, treated as true. */
  clerkSignedIn: boolean;
};

type Actions = {
  hydrate: () => Promise<void>;
  setGuestBrowseEnabled: (v: boolean) => Promise<void>;
  forceAuthWall: () => void;
  clearAuthWall: () => void;
  markWelcomePromoSeen: () => Promise<void>;
  setClerkSession: (signedIn: boolean) => void;
};

export const useGuestBrowseStore = create<State & Actions>((set, get) => ({
  hydrated: false,
  guestBrowseEnabled: false,
  authWallForced: false,
  welcomePromoSeen: false,
  clerkSignedIn: false,

  hydrate: async () => {
    if (!isClerkEnabled) {
      set({
        hydrated: true,
        clerkSignedIn: true,
        guestBrowseEnabled: false,
        authWallForced: false,
      });
      return;
    }
    try {
      const [g, p] = await Promise.all([
        AsyncStorage.getItem(GUEST_KEY),
        AsyncStorage.getItem(PROMO_KEY),
      ]);
      set({
        hydrated: true,
        guestBrowseEnabled: g === '1',
        welcomePromoSeen: p === '1',
      });
    } catch {
      set({ hydrated: true });
    }
  },

  setGuestBrowseEnabled: async (v) => {
    set({ guestBrowseEnabled: v, authWallForced: false });
    try {
      await AsyncStorage.setItem(GUEST_KEY, v ? '1' : '0');
    } catch {
      /* ignore */
    } 
  },

  forceAuthWall: () => set({ authWallForced: true }),

  clearAuthWall: () => set({ authWallForced: false }),

  markWelcomePromoSeen: async () => {
    set({ welcomePromoSeen: true });
    try {
      await AsyncStorage.setItem(PROMO_KEY, '1');
    } catch {
      /* ignore */
    }
  },

  setClerkSession: (signedIn) => {
    set((state) => {
      const prev = state.clerkSignedIn;
      const next: State = { ...state, clerkSignedIn: signedIn };
      if (prev === true && signedIn === false) {
        next.guestBrowseEnabled = false;
        next.authWallForced = false;
        void AsyncStorage.setItem(GUEST_KEY, '0');
      }
      return next;
    });
  },
}));
