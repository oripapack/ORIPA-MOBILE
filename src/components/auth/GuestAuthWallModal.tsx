import React from 'react';
import { useGuestBrowseStore } from '../../store/guestBrowseStore';
import { AuthSheetModal } from './AuthSheetModal';

/** Guest tapped “Sign in” (or any `forceAuthWall`) — slide-up auth, app shell stays underneath. */
export function GuestAuthWallModal() {
  const authWallForced = useGuestBrowseStore((s) => s.authWallForced);
  const clearAuthWall = useGuestBrowseStore((s) => s.clearAuthWall);

  return (
    <AuthSheetModal visible={authWallForced} initialEmailMode="signin" onRequestClose={clearAuthWall} />
  );
}
