import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const PREFIX = '@pullhub_coach_v1';
const HOME_KEY = `${PREFIX}_home`;
const SHOP_KEY = `${PREFIX}_shop`;

type State = {
  hydrated: boolean;
  homeDismissed: boolean;
  shopDismissed: boolean;
};

type Actions = {
  hydrate: () => Promise<void>;
  dismissHomeCoach: () => Promise<void>;
  dismissShopCoach: () => Promise<void>;
  /** Dev / QA: show Home + Shop coach modals again on this device. */
  resetCoachFlagsForTesting: () => Promise<void>;
};

export const useCoachStore = create<State & Actions>((set) => ({
  hydrated: false,
  homeDismissed: false,
  shopDismissed: false,

  hydrate: async () => {
    try {
      const [h, s] = await Promise.all([AsyncStorage.getItem(HOME_KEY), AsyncStorage.getItem(SHOP_KEY)]);
      set({
        hydrated: true,
        homeDismissed: h === '1',
        shopDismissed: s === '1',
      });
    } catch {
      set({ hydrated: true });
    }
  },

  dismissHomeCoach: async () => {
    set({ homeDismissed: true });
    try {
      await AsyncStorage.setItem(HOME_KEY, '1');
    } catch {
      /* ignore */
    }
  },

  dismissShopCoach: async () => {
    set({ shopDismissed: true });
    try {
      await AsyncStorage.setItem(SHOP_KEY, '1');
    } catch {
      /* ignore */
    }
  },

  resetCoachFlagsForTesting: async () => {
    try {
      await Promise.all([AsyncStorage.removeItem(HOME_KEY), AsyncStorage.removeItem(SHOP_KEY)]);
    } catch {
      /* ignore */
    }
    set({ homeDismissed: false, shopDismissed: false });
  },
}));
