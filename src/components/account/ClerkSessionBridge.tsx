import { useEffect, useRef } from 'react';
import { CommonActions } from '@react-navigation/native';
import { useAuth } from '@clerk/clerk-expo';
import { useGuestBrowseStore } from '../../store/guestBrowseStore';
import { navigationRef } from '../../navigation/navigationRef';

/** Syncs Clerk session into `guestBrowseStore` for `useRequireAuth` (no `useAuth` in leaf components). */
export function ClerkSessionBridge() {
  const { isLoaded, isSignedIn } = useAuth();
  const setClerkSession = useGuestBrowseStore((s) => s.setClerkSession);
  const prevSignedInRef = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    if (!isLoaded) return;
    setClerkSession(!!isSignedIn);
  }, [isLoaded, isSignedIn, setClerkSession]);

  /**
   * After sign-out, drop any stack (e.g. Settings) so the user lands on MainTabs (default tab = Home),
   * not a stale screen behind the guest / auth UI. Deferred one frame so `RootStack` is mounted when
   * replacing Link Phone / onboarding-only trees.
   */
  useEffect(() => {
    if (!isLoaded) return;
    const wasSignedIn = prevSignedInRef.current;
    prevSignedInRef.current = isSignedIn;
    if (wasSignedIn !== true || isSignedIn !== false) return;

    const id = setTimeout(() => {
      try {
        if (navigationRef.isReady()) {
          navigationRef.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            }),
          );
        }
      } catch {
        /* Navigator may not expose MainTabs yet in edge gate layouts */
      }
    }, 0);
    return () => clearTimeout(id);
  }, [isLoaded, isSignedIn]);

  return null;
}
