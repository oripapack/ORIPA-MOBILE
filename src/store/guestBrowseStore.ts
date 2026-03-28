import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { isClerkEnabled } from '../config/clerk';

const GUEST_KEY = '@pullhub_guest_browse_v1';
const PROMO_KEY = '@pullhub_welcome_promo_seen_v1';
const ONBOARDING_SHEET_KEY = '@pullhub_onboarding_sheet_v1';
const FIRST_PACK_PROMPT_KEY = '@pullhub_first_pack_signup_prompt_v1';

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
  /** Sliding onboarding sheet dismissed (swipe / CTA). */
  onboardingSheetDismissed: boolean;
  /** First-pack conversion modal: transient visibility. */
  signupPromptVisible: boolean;
  /** After first-pack prompt was shown or dismissed — don’t repeat. */
  firstPackSignupPromptHandled: boolean;
};

type Actions = {
  hydrate: () => Promise<void>;
  setGuestBrowseEnabled: (v: boolean) => Promise<void>;
  forceAuthWall: () => void;
  clearAuthWall: () => void;
  markWelcomePromoSeen: () => Promise<void>;
  setClerkSession: (signedIn: boolean) => void;
  dismissOnboardingSheet: () => Promise<void>;
  showSignupPrompt: () => void;
  hideSignupPrompt: (markHandled?: boolean) => Promise<void>;
};

export const useGuestBrowseStore = create<State & Actions>((set, get) => ({
  hydrated: false,
  guestBrowseEnabled: false,
  authWallForced: false,
  welcomePromoSeen: false,
  clerkSignedIn: false,
  onboardingSheetDismissed: false,
  signupPromptVisible: false,
  firstPackSignupPromptHandled: false,

  hydrate: async () => {
    if (!isClerkEnabled) {
      set({
        hydrated: true,
        clerkSignedIn: true,
        guestBrowseEnabled: false,
        authWallForced: false,
        onboardingSheetDismissed: true,
        firstPackSignupPromptHandled: true,
      });
      return;
    }
    try {
      const [g, p, sheet, firstPrompt] = await Promise.all([
        AsyncStorage.getItem(GUEST_KEY),
        AsyncStorage.getItem(PROMO_KEY),
        AsyncStorage.getItem(ONBOARDING_SHEET_KEY),
        AsyncStorage.getItem(FIRST_PACK_PROMPT_KEY),
      ]);
      const guestOn = g === '1';
      set({
        hydrated: true,
        guestBrowseEnabled: guestOn,
        welcomePromoSeen: p === '1',
        onboardingSheetDismissed: sheet === '1' || guestOn,
        firstPackSignupPromptHandled: firstPrompt === '1',
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
      if (signedIn) {
        next.authWallForced = false;
      }
      if (prev === true && signedIn === false) {
        next.guestBrowseEnabled = false;
        next.authWallForced = false;
        next.signupPromptVisible = false;
        void AsyncStorage.setItem(GUEST_KEY, '0');
      }
      return next;
    });
  },

  dismissOnboardingSheet: async () => {
    set({ onboardingSheetDismissed: true });
    try {
      await AsyncStorage.setItem(ONBOARDING_SHEET_KEY, '1');
    } catch {
      /* ignore */
    }
  },

  showSignupPrompt: () => {
    const { firstPackSignupPromptHandled } = get();
    if (firstPackSignupPromptHandled) return;
    set({ signupPromptVisible: true });
  },

  hideSignupPrompt: async (markHandled = true) => {
    set({ signupPromptVisible: false });
    if (!markHandled) return;
    set({ firstPackSignupPromptHandled: true });
    try {
      await AsyncStorage.setItem(FIRST_PACK_PROMPT_KEY, '1');
    } catch {
      /* ignore */
    }
  },
}));
