import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { Pull } from '../data/mockUser';

export type VaultStatusFilter =
  | 'all'
  | 'vaulted'
  | 'pending'
  | 'shipped'
  | 'converted';

export type VaultSortOption =
  | 'newest'
  | 'oldest'
  | 'value_high'
  | 'value_low';

export const VAULT_STATUS_FILTERS: VaultStatusFilter[] = [
  'all',
  'vaulted',
  'pending',
  'shipped',
  'converted',
];

export const VAULT_SORT_OPTIONS: VaultSortOption[] = [
  'newest',
  'oldest',
  'value_high',
  'value_low',
];

function pullValue(pull: Pull): number {
  return pull.creditsWon ?? pull.convertCreditValue ?? 0;
}

function matchesFilter(pull: Pull, filter: VaultStatusFilter): boolean {
  const f = pull.fulfillment;
  switch (filter) {
    case 'all':
      return true;
    case 'vaulted':
      return f === 'vaulted';
    case 'pending':
      return f === 'pending';
    case 'shipped':
      return f === 'shipped';
    case 'converted':
      return f === 'converted';
    default:
      return true;
  }
}

export function filterAndSortVaultPulls(
  pullHistory: Pull[],
  filter: VaultStatusFilter,
  sort: VaultSortOption,
): Pull[] {
  const list = pullHistory.filter((p) => matchesFilter(p, filter));
  const sorted = [...list];
  switch (sort) {
    case 'oldest':
      sorted.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      break;
    case 'value_high':
      sorted.sort((a, b) => pullValue(b) - pullValue(a));
      break;
    case 'value_low':
      sorted.sort((a, b) => pullValue(a) - pullValue(b));
      break;
    case 'newest':
    default:
      sorted.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      break;
  }
  return sorted;
}

/** Inventory for Vault tab — filtered + sorted. */
export function useVaultPullsFiltered(
  filter: VaultStatusFilter,
  sort: VaultSortOption,
) {
  const pullHistory = useAppStore((s) => s.user.pullHistory);
  return useMemo(
    () => filterAndSortVaultPulls(pullHistory, filter, sort),
    [pullHistory, filter, sort],
  );
}

/** @deprecated Prefer useVaultPullsFiltered — keeps newest-first, excludes conversions. */
export function useVaultPullsSorted() {
  return useVaultPullsFiltered('all', 'newest').filter(
    (p) => p.fulfillment !== 'converted',
  );
}
