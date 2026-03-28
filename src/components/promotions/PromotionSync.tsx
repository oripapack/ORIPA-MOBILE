import { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { usePromotionStore } from '../../store/promotionStore';
import { useGuestBrowseStore } from '../../store/guestBrowseStore';
import { isClerkEnabled } from '../../config/clerk';

/**
 * Applies signup bonus, referral capture, and queued referrer rewards after hydration.
 * Referrer queue is stored locally (same device / account switch); production should use a server ledger.
 */
export function PromotionSync() {
  const clerkSignedIn = useGuestBrowseStore((s) => s.clerkSignedIn);
  const user = useAppStore((s) => s.user);
  const hydrated = usePromotionStore((s) => s.hydrated);
  const syncSessionRewards = usePromotionStore((s) => s.syncSessionRewards);

  useEffect(() => {
    if (!hydrated) return;
    if (isClerkEnabled && !clerkSignedIn) return;
    syncSessionRewards(user.id, user.username);
  }, [hydrated, clerkSignedIn, user.id, user.username, syncSessionRewards]);

  return null;
}
