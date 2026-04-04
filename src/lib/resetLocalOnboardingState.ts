import AsyncStorage from '@react-native-async-storage/async-storage';
import { DevSettings } from 'react-native';
import { useGuestBrowseStore } from '../store/guestBrowseStore';
import { useCoachStore } from '../store/coachStore';

/** Matches `useWelcomeBannerDismissed`. */
const WELCOME_BANNER_DISMISSED_KEY = '@pullhub_welcome_banner_dismissed_v1';
/** Matches `SimulationDisclosure`. */
const SIMULATION_DISCLOSURE_ACK_KEY = 'pullhub_simulation_disclosure_ack_v1';

/**
 * Clears device-local onboarding / coach / first-run UI flags so you can re-test flows without a new account.
 * Does **not** sign out of Clerk or call your backend — only AsyncStorage + in-memory stores.
 * Reloads the JS bundle in `__DEV__` so hooks (e.g. welcome banner) re-read storage.
 */
export async function resetLocalOnboardingStateAndReload(): Promise<void> {
  await useGuestBrowseStore.getState().resetLocalOnboardingFlags();
  await useCoachStore.getState().resetCoachFlagsForTesting();
  try {
    await Promise.all([
      AsyncStorage.removeItem(WELCOME_BANNER_DISMISSED_KEY),
      AsyncStorage.removeItem(SIMULATION_DISCLOSURE_ACK_KEY),
    ]);
  } catch {
    /* ignore */
  }
  if (__DEV__) {
    DevSettings.reload();
  }
}
