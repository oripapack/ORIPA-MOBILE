import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';

/** Pulls still in the collection (excludes credit conversions only). */
export function useVaultPullsSorted() {
  const pullHistory = useAppStore((s) => s.user.pullHistory);
  return useMemo(() => {
    const list = pullHistory.filter((p) => p.fulfillment !== 'converted');
    return [...list].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [pullHistory]);
}
