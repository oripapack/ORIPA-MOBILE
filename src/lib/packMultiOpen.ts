import type { PackOpenQuantity } from '../store/useAppStore';

export const PACK_OPEN_QUANTITIES: readonly PackOpenQuantity[] = [1, 10, 100];

export function packOpenTotalCredits(unitPrice: number, quantity: PackOpenQuantity): number {
  return unitPrice * quantity;
}
