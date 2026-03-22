import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Bump if you need to show the welcome promo again after a copy change. */
const STORAGE_KEY = '@pullhub_welcome_banner_dismissed_v1';

/**
 * New-user welcome hero on Home: show until dismissed or “Browse Packs” (dismisses hero; catalog stays below).
 */
export function useWelcomeBannerDismissed() {
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (!cancelled) setDismissed(v === '1');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEY, '1');
    setDismissed(true);
  }, []);

  return {
    /** `null` while reading storage — avoid flashing the banner. */
    loading: dismissed === null,
    /** After first dismiss / browse, stays true. */
    isDismissed: dismissed === true,
    dismiss,
  };
}
