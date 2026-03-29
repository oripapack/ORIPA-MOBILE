import type { PromotionGrant } from '../../promotions/types';

/** Short human-readable summary for success UI. */
export function formatGrantSummary(grant: PromotionGrant): string {
  const parts: string[] = [];
  if (grant.points && grant.points > 0) {
    parts.push(`${grant.points} points`);
  }
  if (grant.freePacks && grant.freePacks > 0) {
    parts.push(
      grant.freePacks === 1 ? '1 free pack open' : `${grant.freePacks} free pack opens`,
    );
  }
  return parts.length > 0 ? parts.join(' · ') : 'Reward applied';
}
