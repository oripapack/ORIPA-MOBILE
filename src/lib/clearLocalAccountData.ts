import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGuestBrowseStore } from '../store/guestBrowseStore';
import { useCoachStore } from '../store/coachStore';
import { useAppStore } from '../store/useAppStore';
import { mockUser } from '../data/mockUser';
import { DEV_STARTER_CREDITS, SHOW_DEMO_INCOMING_FRIEND_REQUEST } from '../config/app';
import { createInitialFriendVaultShop } from '../lib/friendVaultShop';
import { userWithSyncedProgression } from './collectorProgression';
import { buildDemoIncomingFriendRequest } from '../data/friends';
import { currentQuestWeekKey } from './collectorGamePersistence';
import { initialQuestProgress } from '../data/collectorQuests';
import { SHIPPING_ADDRESS_STORAGE_KEY } from './shippingAddress';

/** Matches `useWelcomeBannerDismissed`. */
const WELCOME_BANNER_DISMISSED_KEY = '@pullhub_welcome_banner_dismissed_v1';
/** Matches `SimulationDisclosure`. */
const SIMULATION_DISCLOSURE_ACK_KEY = 'pullhub_simulation_disclosure_ack_v1';

/**
 * Clears device-local account / session data after account deletion or guest wipe.
 * Keeps language/region (`@pullhub_locale_v1`), sound/haptics (`@pullhub_preferences_v1`),
 * and notification toggles (`@pullhub_notifications_v1`).
 */
export async function clearLocalAccountData(): Promise<void> {
  await useGuestBrowseStore.getState().resetLocalOnboardingFlags();
  await useCoachStore.getState().resetCoachFlagsForTesting();

  const resetUser = userWithSyncedProgression(
    { ...mockUser, credits: Math.max(mockUser.credits, DEV_STARTER_CREDITS), pullHistory: [] },
    mockUser.xp,
  );

  useAppStore.setState({
    user: resetUser,
    friends: [],
    incomingFriendRequests: SHOW_DEMO_INCOMING_FRIEND_REQUEST
      ? [buildDemoIncomingFriendRequest()]
      : [],
    pendingFulfillmentPullIds: [],
    usedFirstTimePackIds: [],
    friendVaultShopByUser: createInitialFriendVaultShop(),
    selectedPack: null,
    _packOpenRewardApplied: false,
    packOpenInFlight: false,
    pendingServerPull: null,
    pendingBulkServerPull: null,
    vaultItemIdByPullId: {},
    resumePackOpenAfterCredits: false,
    modals: {
      insufficientCredits: false,
      quantitySheet: false,
      packOpening: false,
      wonPrizes: false,
    },
    collectorStreakDays: 0,
    collectorStreakBest: 0,
    collectorStreakLastYmd: null,
    collectorQuestWeekKey: currentQuestWeekKey(),
    collectorLastDailyYmd: null,
    collectorQuestProgress: initialQuestProgress(),
  });

  try {
    await AsyncStorage.multiRemove([
      WELCOME_BANNER_DISMISSED_KEY,
      SIMULATION_DISCLOSURE_ACK_KEY,
      SHIPPING_ADDRESS_STORAGE_KEY,
    ]);
  } catch {
    /* ignore */
  }
}
