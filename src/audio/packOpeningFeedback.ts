import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type RarityTier = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

const runHaptic = (fn: () => Promise<void>) => {
  if (Platform.OS === 'web') return;
  void fn().catch(() => {});
};

/** Modal / rip starts — light tick. */
export function hapticPackEnter() {
  runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

/** Pre-reveal “whoosh” moment. */
export function hapticPackReveal() {
  runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

/** Card shown — tier-based punch. */
export function hapticPackResult(tier: RarityTier) {
  if (tier === 'mythic' || tier === 'legendary') {
    runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    return;
  }
  if (tier === 'epic' || tier === 'rare') {
    runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
    return;
  }
  runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}
