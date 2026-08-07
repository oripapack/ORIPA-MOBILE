import { useCallback } from 'react';
import { isClerkEnabled } from '../config/clerk';
import { canOpenPackWithoutSignIn } from '../config/demo';
import { useGuestBrowseStore } from '../store/guestBrowseStore';

/**
 * Gate protected actions behind sign-in.
 * Pack opens can bypass auth only when `canOpenPackWithoutSignIn` is true in development.
 */
export function useRequireAuth() {
  const hydrated = useGuestBrowseStore((s) => s.hydrated);
  const clerkSignedIn = useGuestBrowseStore((s) => s.clerkSignedIn);
  const forceAuthWall = useGuestBrowseStore((s) => s.forceAuthWall);

  const requireAuth = useCallback(
    (fn: () => void, options?: { allowUnauthenticatedPackOpen?: boolean }) => {
      if (!isClerkEnabled) {
        fn();
        return;
      }
      if (!hydrated) return;
      if (clerkSignedIn) {
        fn();
        return;
      }
      // Development-only: allow animation review without a persistent account.
      if (options?.allowUnauthenticatedPackOpen && canOpenPackWithoutSignIn) {
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
