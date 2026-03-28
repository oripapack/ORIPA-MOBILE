import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { usePromotionStore } from '../store/promotionStore';

/**
 * Captures `pullhub.com?r=username` (or app scheme with `r` query) and stores pending referral.
 */
export function useReferralLinkListener() {
  const setPending = usePromotionStore((s) => s.setPendingReferralUsername);

  useEffect(() => {
    const parse = (url: string | null) => {
      if (!url) return;
      try {
        const parsed = Linking.parse(url);
        const r = parsed.queryParams?.r;
        const param = Array.isArray(r) ? r[0] : r;
        if (typeof param === 'string' && param.trim().length > 0) {
          setPending(param.trim());
        }
      } catch {
        /* ignore malformed */
      }
    };

    void Linking.getInitialURL().then(parse);
    const sub = Linking.addEventListener('url', ({ url }) => parse(url));
    return () => sub.remove();
  }, [setPending]);
}
