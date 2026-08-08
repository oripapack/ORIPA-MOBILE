import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export const NOTIFICATIONS_STORAGE_KEY = '@pullhub_notifications_v1';

export type NotificationToggleKey = 'order' | 'drops' | 'promos' | 'social';

export type NotificationToggles = Record<NotificationToggleKey, boolean>;

type State = {
  hydrated: boolean;
  toggles: NotificationToggles;
};

type Actions = {
  hydrate: () => Promise<void>;
  setToggle: (key: NotificationToggleKey, value: boolean) => Promise<void>;
};

const DEFAULTS: NotificationToggles = {
  order: true,
  drops: true,
  promos: false,
  social: true,
};

export const useNotificationPreferencesStore = create<State & Actions>((set, get) => ({
  hydrated: false,
  toggles: { ...DEFAULTS },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (!raw) {
        set({ hydrated: true });
        return;
      }
      const parsed = JSON.parse(raw) as Partial<NotificationToggles>;
      set({
        hydrated: true,
        toggles: {
          order: typeof parsed.order === 'boolean' ? parsed.order : DEFAULTS.order,
          drops: typeof parsed.drops === 'boolean' ? parsed.drops : DEFAULTS.drops,
          promos: typeof parsed.promos === 'boolean' ? parsed.promos : DEFAULTS.promos,
          social: typeof parsed.social === 'boolean' ? parsed.social : DEFAULTS.social,
        },
      });
    } catch {
      set({ hydrated: true });
    }
  },

  setToggle: async (key, value) => {
    const toggles = { ...get().toggles, [key]: value };
    set({ toggles });
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(toggles));
    } catch {
      /* ignore */
    }
  },
}));
