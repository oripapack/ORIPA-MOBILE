import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export const PREFERENCES_STORAGE_KEY = '@pullhub_preferences_v1';

type PreferencesState = {
  hydrated: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
};

type PreferencesActions = {
  hydrate: () => Promise<void>;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
  setHapticsEnabled: (enabled: boolean) => Promise<void>;
};

type Stored = {
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
};

const DEFAULTS: Omit<PreferencesState, 'hydrated'> = {
  soundEnabled: true,
  hapticsEnabled: true,
};

async function persist(partial: Stored, current: PreferencesState): Promise<void> {
  const next: Stored = {
    soundEnabled: partial.soundEnabled ?? current.soundEnabled,
    hapticsEnabled: partial.hapticsEnabled ?? current.hapticsEnabled,
  };
  await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(next));
}

export const usePreferencesStore = create<PreferencesState & PreferencesActions>((set, get) => ({
  hydrated: false,
  ...DEFAULTS,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (!raw) {
        set({ hydrated: true });
        return;
      }
      const parsed = JSON.parse(raw) as Stored;
      set({
        hydrated: true,
        soundEnabled:
          typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : DEFAULTS.soundEnabled,
        hapticsEnabled:
          typeof parsed.hapticsEnabled === 'boolean'
            ? parsed.hapticsEnabled
            : DEFAULTS.hapticsEnabled,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  setSoundEnabled: async (enabled) => {
    set({ soundEnabled: enabled });
    try {
      await persist({ soundEnabled: enabled }, get());
    } catch {
      /* ignore */
    }
  },

  setHapticsEnabled: async (enabled) => {
    set({ hapticsEnabled: enabled });
    try {
      await persist({ hapticsEnabled: enabled }, get());
    } catch {
      /* ignore */
    }
  },
}));
