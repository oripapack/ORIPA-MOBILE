import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useGuestBrowseStore } from '../../store/guestBrowseStore';

/** Syncs Clerk session into `guestBrowseStore` for `useRequireAuth` (no `useAuth` in leaf components). */
export function ClerkSessionBridge() {
  const { isLoaded, isSignedIn } = useAuth();
  const setClerkSession = useGuestBrowseStore((s) => s.setClerkSession);

  useEffect(() => {
    if (!isLoaded) return;
    setClerkSession(!!isSignedIn);
  }, [isLoaded, isSignedIn, setClerkSession]);

  return null;
}
