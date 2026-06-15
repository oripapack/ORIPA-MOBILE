'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { setClerkSupabaseTokenGetter } from '../../../shared/api/clerkSupabaseToken';
import { usePullStore } from '@/store/usePullStore';

/** Registers Clerk JWT for Supabase Edge / RLS and hydrates credits on sign-in. */
export function ClerkSupabaseBridge() {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const hydrateCredits = usePullStore((s) => s.hydrateCredits);
  const reset = usePullStore((s) => s.reset);

  useEffect(() => {
    setClerkSupabaseTokenGetter(async () => {
      const sessionToken = await getToken();
      if (sessionToken) return sessionToken;
      return getToken({ template: 'supabase' });
    });
    return () => setClerkSupabaseTokenGetter(null);
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && userId) {
      void hydrateCredits(userId);
      return;
    }
    reset();
  }, [isLoaded, isSignedIn, userId, hydrateCredits, reset]);

  return null;
}
