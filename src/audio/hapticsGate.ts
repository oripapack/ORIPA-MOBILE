import { Platform } from 'react-native';
import { usePreferencesStore } from '../store/preferencesStore';

/** Sync read for imperative haptic sites (pack open, friends, etc.). */
export function areHapticsEnabled(): boolean {
  return usePreferencesStore.getState().hapticsEnabled;
}

/** Future SFX callers should gate on this (no audio layer yet). */
export function areSoundEnabled(): boolean {
  return usePreferencesStore.getState().soundEnabled;
}

/** Run a haptic only when the preference is on and not on web. */
export function runHapticIfEnabled(fn: () => Promise<unknown>): void {
  if (Platform.OS === 'web') return;
  if (!areHapticsEnabled()) return;
  void Promise.resolve(fn()).catch(() => {});
}
