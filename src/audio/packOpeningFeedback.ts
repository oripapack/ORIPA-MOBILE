import * as Haptics from 'expo-haptics';
import type { N2Tier } from '../lib/n2Rarity';
import { runHapticIfEnabled } from './hapticsGate';

/** @deprecated Prefer N2Tier from lib/n2Rarity */
export type RarityTier = N2Tier;

/** Modal / rip starts — light tick. */
export function hapticPackEnter() {
  runHapticIfEnabled(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

/** Pre-reveal “whoosh” moment. */
export function hapticPackReveal() {
  runHapticIfEnabled(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

/** Card shown — tier-based punch. */
export function hapticPackResult(tier: N2Tier) {
  if (tier === 'mythic' || tier === 'legendary') {
    runHapticIfEnabled(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    );
    return;
  }
  if (tier === 'epic') {
    runHapticIfEnabled(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
    return;
  }
  runHapticIfEnabled(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}
