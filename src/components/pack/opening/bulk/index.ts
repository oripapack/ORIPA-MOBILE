import type { PackCategory } from '../../../../data/mockPacks';
import type { PackOpenQuantity } from '../../../../store/useAppStore';
import type { PackRollResult } from '../types';
import { buildBulkOpenViewModel } from './bulkOpenViewModel';

export type { BulkOpenViewModel, BulkPullItem } from './bulkOpenTypes';
export { buildBulkOpenViewModel, sortBulkRestItems } from './bulkOpenViewModel';
export { BulkOpenCinematic } from './BulkOpenCinematic';
export type { BulkOpenCinematicProps } from './BulkOpenCinematic';
export { BulkResultsScreen } from './BulkResultsScreen';
export type { BulkResultsScreenProps } from './BulkResultsScreen';
export {
  bestRollFromResults,
  compareRolls,
  selectBestHit,
  type BestHitSelection,
} from '../generatePackRoll';

/** Convenience: rolls + session metadata → view model for bulk cinematic/results. */
export function createBulkOpenViewModel(
  rolls: PackRollResult[],
  quantity: PackOpenQuantity,
  sessionId: number,
  category: PackCategory,
) {
  return buildBulkOpenViewModel(rolls, quantity, sessionId, category);
}
