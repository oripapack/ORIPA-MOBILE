import { useEffect, useState } from 'react';
import type { Pack } from '../data/mockPacks';
import {
  EMPTY_PACK_ODDS,
  UNAVAILABLE_PACK_ODDS,
  getStaticFallbackPackOdds,
  type PackOdds,
} from '../data/packOdds';
import { resolvePackOdds } from '../lib/packOddsLoader';

/** Loads pack odds from Supabase pool weights when live; static N2 fallback otherwise. */
export function usePackOdds(pack: Pack | undefined): { odds: PackOdds; loading: boolean } {
  const [odds, setOdds] = useState<PackOdds>(
    pack ? (__DEV__ ? getStaticFallbackPackOdds() : UNAVAILABLE_PACK_ODDS) : EMPTY_PACK_ODDS,
  );
  const [loading, setLoading] = useState(Boolean(pack?.packVersionId));

  useEffect(() => {
    if (!pack) {
      setOdds(EMPTY_PACK_ODDS);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(Boolean(pack.packVersionId));

    void resolvePackOdds(pack).then((resolved) => {
      if (cancelled) return;
      setOdds(resolved);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [pack?.id, pack?.packVersionId]);

  return { odds, loading };
}
