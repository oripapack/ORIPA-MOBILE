import { useCallback } from 'react';
import { isClerkEnabled } from '../config/clerk';
import { useGuestBrowseStore } from '../store/guestBrowseStore';

/**
 * When Clerk is on and the user is not signed in (guest or auth wall), runs `forceAuthWall`
 * so they return to the welcome / sign-in screen. When Clerk is off, always runs the action.
 */
export function useRequireAuth() {
  const hydrated = useGuestBrowseStore((s) => s.hydrated);
  const clerkSignedIn = useGuestBrowseStore((s) => s.clerkSignedIn);
  const forceAuthWall = useGuestBrowseStore((s) => s.forceAuthWall);

  const requireAuth = useCallback(
    (fn: () => void) => {
      if (!isClerkEnabled) {
        fn();
        return;
      }
      if (!hydrated) return;
      if (clerkSignedIn) {
        fn();
        return;
      }
      forceAuthWall();
    },
    [hydrated, clerkSignedIn, forceAuthWall],
  );

  const canUseAccountFeatures = !isClerkEnabled || clerkSignedIn;

  return { requireAuth, canUseAccountFeatures };
}
