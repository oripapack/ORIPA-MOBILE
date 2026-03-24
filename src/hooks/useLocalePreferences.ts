import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LOCALE_STORAGE_KEY } from '../locale/constants';
import i18n, { migrateLanguageCode, setAppLanguage, type AppLanguage } from '../i18n';

/**
 * Every code here is registered in `src/i18n/index.ts` so switching always calls `changeLanguage`.
 * All listed languages have dedicated `src/i18n/locales/*.json` files (merged with English for any missing keys).
 */
export const LANGUAGE_OPTIONS = [
  { code: 'en' as const, label: 'English' },
  { code: 'es' as const, label: 'Español' },
  { code: 'fr' as const, label: 'Français' },
  { code: 'de' as const, label: 'Deutsch' },
  { code: 'it' as const, label: 'Italiano' },
  { code: 'pt' as const, label: 'Português' },
  { code: 'ru' as const, label: 'Русский' },
  { code: 'pl' as const, label: 'Polski' },
  { code: 'nl' as const, label: 'Nederlands' },
  { code: 'tr' as const, label: 'Türkçe' },
  { code: 'ar' as const, label: 'العربية' },
  { code: 'hi' as const, label: 'हिन्दी' },
  { code: 'ja' as const, label: '日本語' },
  { code: 'ko' as const, label: '한국어' },
  { code: 'zh' as const, label: '中文（简体）' },
  { code: 'zht' as const, label: '中文（繁體）' },
  { code: 'vi' as const, label: 'Tiếng Việt' },
] as const;

export const REGION_OPTIONS = [
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'JP', label: 'Japan' },
  { code: 'AU', label: 'Australia' },
] as const;

export type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]['code'];
export type RegionCode = (typeof REGION_OPTIONS)[number]['code'];

type Stored = { language: LanguageCode; region: RegionCode };

const DEFAULTS: Stored = { language: 'en', region: 'US' };

function parseStoredLanguage(raw: string | undefined): LanguageCode {
  const migrated = migrateLanguageCode(raw);
  return migrated;
}

export function useLocalePreferences() {
  const [language, setLanguageState] = useState<LanguageCode>(() =>
    migrateLanguageCode(i18n.language) as LanguageCode,
  );
  const [region, setRegionState] = useState<RegionCode>(DEFAULTS.region);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(LOCALE_STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        try {
          const parsed = JSON.parse(raw) as Partial<Stored>;
          if (parsed.language) {
            const lang = parseStoredLanguage(parsed.language);
            setLanguageState(lang);
          }
          if (parsed.region && REGION_OPTIONS.some((o) => o.code === parsed.region)) {
            setRegionState(parsed.region as RegionCode);
          }
        } catch {
          /* ignore */
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(
    async (next: Partial<Stored>) => {
      const merged: Stored = {
        language: next.language ?? language,
        region: next.region ?? region,
      };
      setLanguageState(merged.language);
      setRegionState(merged.region);
      await AsyncStorage.setItem(LOCALE_STORAGE_KEY, JSON.stringify(merged));
      await setAppLanguage(merged.language as AppLanguage);
    },
    [language, region],
  );

  const saveLocale = useCallback(async (l: LanguageCode, r: RegionCode) => {
    setLanguageState(l);
    setRegionState(r);
    await AsyncStorage.setItem(LOCALE_STORAGE_KEY, JSON.stringify({ language: l, region: r }));
    await setAppLanguage(l as AppLanguage);
  }, []);

  return {
    loading,
    language,
    region,
    setLanguage: (code: LanguageCode) => {
      void persist({ language: code });
    },
    setRegion: (code: RegionCode) => {
      void persist({ region: code });
    },
    saveLocale,
  };
}
