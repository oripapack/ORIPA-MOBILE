import type { PackCategory } from '../../../../data/mockPacks';
import type { PackOpenQuantity } from '../../../../store/useAppStore';
import { compareRolls, selectBestHit } from '../generatePackRoll';
import { resolveRevealCardForTier } from '../mockRevealCards';
import type { PackRollResult } from '../types';
import type { BulkOpenViewModel, BulkPullItem } from './bulkOpenTypes';

const BULK_QUANTITIES = new Set<PackOpenQuantity>([10]);

function cardSaltForIndex(sessionId: number, index: number): number {
  return sessionId * 9973 + index * 7919 + 1337;
}

function toBulkPullItem(
  roll: PackRollResult,
  index: number,
  sessionId: number,
  category: PackCategory,
): BulkPullItem {
  return {
    index,
    roll,
    card: resolveRevealCardForTier(roll.tier, cardSaltForIndex(sessionId, index), category),
  };
}

/** Sort rest of pool: highest tier/credits first; lower index wins ties. */
export function sortBulkRestItems(items: BulkPullItem[]): BulkPullItem[] {
  return [...items].sort((a, b) =>
    compareRolls(a.roll, a.index, b.roll, b.index),
  );
}

/**
 * Build the bulk open view model from resolved rolls.
 * Throws if quantity is not 10, or rolls length mismatches quantity.
 */
export function buildBulkOpenViewModel(
  rolls: PackRollResult[],
  quantity: PackOpenQuantity,
  sessionId: number,
  category: PackCategory,
): BulkOpenViewModel {
  if (!BULK_QUANTITIES.has(quantity)) {
    throw new Error(`buildBulkOpenViewModel: quantity must be 10, got ${quantity}`);
  }
  if (rolls.length !== quantity) {
    throw new Error(
      `buildBulkOpenViewModel: expected ${quantity} rolls, got ${rolls.length}`,
    );
  }

  const selection = selectBestHit(rolls);
  if (!selection) {
    throw new Error('buildBulkOpenViewModel: rolls array is empty');
  }

  const { bestIndex } = selection;
  const allItems = rolls.map((roll, index) =>
    toBulkPullItem(roll, index, sessionId, category),
  );

  const best = allItems[bestIndex]!;
  const rest = sortBulkRestItems(allItems.filter((item) => item.index !== bestIndex));

  const tierCounts: BulkOpenViewModel['tierCounts'] = {};
  for (const roll of rolls) {
    tierCounts[roll.tier] = (tierCounts[roll.tier] ?? 0) + 1;
  }

  const totalCredits = rolls.reduce((sum, r) => sum + r.creditsWon, 0);

  return {
    quantity: quantity as Extract<PackOpenQuantity, 10>,
    best,
    bestIndex,
    rest,
    totalCredits,
    tierCounts,
  };
}
