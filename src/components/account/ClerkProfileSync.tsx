import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useAppStore } from '../../store/useAppStore';
import { getAppProfileFromClerkUser } from '../../lib/clerkProfile';
import { setClerkSupabaseTokenGetter } from '../../lib/clerkSupabaseToken';

/**
 * Keeps Zustand `user` aligned with Clerk and registers the session token for Supabase Edge/RLS calls.
 */
export function ClerkProfileSync() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const setUserFromClerkProfile = useAppStore((s) => s.setUserFromClerkProfile);
  const hydrateUserCredits = useAppStore((s) => s.hydrateUserCredits);

  useEffect(() => {
    setClerkSupabaseTokenGetter(async () => {
      const sessionToken = await getToken();
      if (sessionToken) return sessionToken;
      return getToken({ template: 'supabase' });
    });
    return () => setClerkSupabaseTokenGetter(null);
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded || !user) return;
    const profile = getAppProfileFromClerkUser(user);
    if (!profile) return;
    setUserFromClerkProfile({
      id: user.id,
      displayName: profile.displayName,
      username: profile.username,
    });
    void hydrateUserCredits(user.id);
  }, [isLoaded, user, setUserFromClerkProfile, hydrateUserCredits]);

  return null;
}
