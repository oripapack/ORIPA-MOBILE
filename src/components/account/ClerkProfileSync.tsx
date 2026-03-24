import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { useAppStore } from '../../store/useAppStore';
import { getAppProfileFromClerkUser } from '../../lib/clerkProfile';

/**
 * Keeps Zustand `user` (display name, username, friend code) aligned with Clerk after profile onboarding.
 */
export function ClerkProfileSync() {
  const { user, isLoaded } = useUser();
  const setUserFromClerkProfile = useAppStore((s) => s.setUserFromClerkProfile);

  useEffect(() => {
    if (!isLoaded || !user) return;
    const profile = getAppProfileFromClerkUser(user);
    if (!profile) return;
    setUserFromClerkProfile({
      id: user.id,
      displayName: profile.displayName,
      username: profile.username,
    });
  }, [isLoaded, user, setUserFromClerkProfile]);

  return null;
}
