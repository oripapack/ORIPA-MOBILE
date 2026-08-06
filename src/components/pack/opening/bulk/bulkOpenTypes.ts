import type { RarityTier } from '../../../../audio/packOpeningFeedback';
import type { PackOpenQuantity } from '../../../../store/useAppStore';
import type { PackRollResult, RevealCard } from '../types';

/** One pull in a bulk session — roll + display card + stable index in the batch. */
export type BulkPullItem = {
  index: number;
  roll: PackRollResult;
  card: RevealCard;
};

/** View model for bulk cinematic + results (×10 Fast). */
export type BulkOpenViewModel = {
  quantity: Extract<PackOpenQuantity, 10>;
  best: BulkPullItem;
  bestIndex: number;
  /** All pulls except best, sorted by tier desc → credits desc → index asc. */
  rest: BulkPullItem[];
  totalCredits: number;
  tierCounts: Partial<Record<RarityTier, number>>;
};
