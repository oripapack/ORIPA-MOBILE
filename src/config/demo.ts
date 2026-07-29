import { Platform } from 'react-native';

/**
 * When true, Open Pack does not require Clerk sign-in.
 * - Web: always (so demos aren't blocked by OAuth white-screen)
 * - Native: only in __DEV__
 *
 * Guests still don't persist pulls to vault; signup prompt can still show after.
 */
export const canOpenPackWithoutSignIn = Platform.OS === 'web' || __DEV__;
