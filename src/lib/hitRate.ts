import type { Pull } from '../data/mockUser';

/** Aligns with social “hit” badge threshold in `pullToSocialEvent`. */
export const HIT_CREDITS_THRESHOLD = 300;

export function isPullHit(pull: Pull): boolean {
  return pull.creditsWon >= HIT_CREDITS_THRESHOLD;
}

/** Newest first, up to `limit` pulls. */
export function lastPullsSorted(pulls: Pull[], limit: number): Pull[] {
  return [...pulls]
    .sort((a, b) => {
      const ta = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
      const tb = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
      return tb - ta;
    })
    .slice(0, limit);
}

export type HitResultSlot = { hit: boolean };

export function buildHitRateWindow(pulls: Pull[], windowSize: number): {
  pct: number;
  slots: HitResultSlot[];
  tracked: number;
} {
  const recent = lastPullsSorted(pulls, windowSize);
  const tracked = recent.length;
  if (tracked === 0) {
    return { pct: 0, slots: [], tracked: 0 };
  }
  const hits = recent.filter(isPullHit).length;
  const pct = Math.round((hits / tracked) * 100);
  const slots: HitResultSlot[] = recent.map((p) => ({ hit: isPullHit(p) }));
  return { pct, slots, tracked };
}
