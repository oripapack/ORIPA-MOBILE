import React, { createContext, useContext, useMemo } from 'react';
import { isClerkEnabled } from '../config/clerk';
import { useGuestBrowseStore } from '../store/guestBrowseStore';

export type GuestModeValue = {
  /** Signed out with Clerk enabled — preview rules apply. */
  isGuest: boolean;
  /** Signed-in users persist pulls / rewards; guests do not. */
  canPersistPulls: boolean;
};

const GuestModeContext = createContext<GuestModeValue>({ isGuest: false, canPersistPulls: true });

export function GuestModeProvider({ children }: { children: React.ReactNode }) {
  const clerkSignedIn = useGuestBrowseStore((s) => s.clerkSignedIn);

  const value = useMemo((): GuestModeValue => {
    const guest = isClerkEnabled && !clerkSignedIn;
    return { isGuest: guest, canPersistPulls: !guest };
  }, [clerkSignedIn]);

  return <GuestModeContext.Provider value={value}>{children}</GuestModeContext.Provider>;
}

export function useGuestMode(): GuestModeValue {
  return useContext(GuestModeContext);
}
