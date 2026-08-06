import type { PackOpenQuantity } from '../store/useAppStore';

/** V1: single open or ×10 bulk. ×100 rush removed. */
export const PACK_OPEN_QUANTITIES: readonly PackOpenQuantity[] = [1, 10];

export function packOpenTotalCredits(unitPrice: number, quantity: PackOpenQuantity): number {
  return unitPrice * quantity;
}
