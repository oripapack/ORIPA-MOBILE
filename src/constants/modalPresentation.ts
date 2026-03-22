import { Platform } from 'react-native';

/**
 * iOS: `Modal` + `transparent` with the default `pageSheet` presentation logs:
 * "Modal with 'pageSheet' presentation style and 'transparent' value is not supported."
 * Using `overFullScreen` fixes presentation and avoids the warning.
 *
 * Spread onto any `Modal` that sets `transparent` (dimmed overlays, bottom sheets, etc.).
 */
export const transparentModalIOSProps =
  Platform.OS === 'ios' ? { presentationStyle: 'overFullScreen' as const } : {};
