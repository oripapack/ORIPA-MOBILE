import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import en from './locales/en.json';
import ja from './locales/ja.json';
import es from './locales/es.json';
import zh from './locales/zh.json';
import ko from './locales/ko.json';
import zht from './locales/zht.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import pl from './locales/pl.json';
import nl from './locales/nl.json';
import tr from './locales/tr.json';
import ar from './locales/ar.json';
import hi from './locales/hi.json';
import vi from './locales/vi.json';
import { LOCALE_STORAGE_KEY } from '../locale/constants';
import { mergeWithEnglish } from './mergeLocales';

const enMap = en as unknown as Record<string, unknown>;

function withEnglishFallback(overlay: Record<string, unknown>): typeof en {
  return mergeWithEnglish(enMap, overlay) as typeof en;
}

/** Hand-maintained locales (merged with English for any missing keys). */
const handMaintained = {
  ja: withEnglishFallback(ja as unknown as Record<string, unknown>),
  es: withEnglishFallback(es as unknown as Record<string, unknown>),
  zh: withEnglishFallback(zh as unknown as Record<string, unknown>),
  ko: withEnglishFallback(ko as unknown as Record<string, unknown>),
  zht: withEnglishFallback(zht as unknown as Record<string, unknown>),
  fr: withEnglishFallback(fr as unknown as Record<string, unknown>),
  de: withEnglishFallback(de as unknown as Record<string, unknown>),
  it: withEnglishFallback(it as unknown as Record<string, unknown>),
  pt: withEnglishFallback(pt as unknown as Record<string, unknown>),
  ru: withEnglishFallback(ru as unknown as Record<string, unknown>),
  pl: withEnglishFallback(pl as unknown as Record<string, unknown>),
  nl: withEnglishFallback(nl as unknown as Record<string, unknown>),
  tr: withEnglishFallback(tr as unknown as Record<string, unknown>),
  ar: withEnglishFallback(ar as unknown as Record<string, unknown>),
  hi: withEnglishFallback(hi as unknown as Record<string, unknown>),
  vi: withEnglishFallback(vi as unknown as Record<string, unknown>),
} as const;

export const SUPPORTED_LANGS = [
  'en',
  'es',
  'fr',
  'de',
  'it',
  'pt',
  'ru',
  'pl',
  'nl',
  'tr',
  'ar',
  'hi',
  'ja',
  'ko',
  'zh',
  'zht',
  'vi',
] as const;
export type AppLanguage = (typeof SUPPORTED_LANGS)[number];

i18n.use(initReactI18next).init({
  react: {
    useSuspense: false,
  },
  resources: {
    en: { translation: en },
    ja: { translation: handMaintained.ja },
    es: { translation: handMaintained.es },
    zh: { translation: handMaintained.zh },
    ko: { translation: handMaintained.ko },
    zht: { translation: handMaintained.zht },
    fr: { translation: handMaintained.fr },
    de: { translation: handMaintained.de },
    it: { translation: handMaintained.it },
    pt: { translation: handMaintained.pt },
    ru: { translation: handMaintained.ru },
    pl: { translation: handMaintained.pl },
    nl: { translation: handMaintained.nl },
    tr: { translation: handMaintained.tr },
    ar: { translation: handMaintained.ar },
    hi: { translation: handMaintained.hi },
    vi: { translation: handMaintained.vi },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

/** Maps BCP-47 tags (from device or storage) to a shipped `AppLanguage`. */
export function migrateLanguageCode(code: string | undefined): AppLanguage {
  if (!code) return 'en';
  const t = code.trim().replace(/_/g, '-');
  const lower = t.toLowerCase();

  if (lower === 'en' || lower.startsWith('en-')) return 'en';
  if (lower === 'zh-tw' || lower === 'zh-hk' || lower === 'zh-hant' || lower === 'zh-mo') return 'zht';
  if (lower.includes('-tw') || lower.includes('-hk') || lower.includes('hant')) return 'zht';
  if (lower === 'zh-cn' || lower === 'zh-hans' || lower === 'zh-sg') return 'zh';
  if (lower.startsWith('zh-hans') || lower.endsWith('-cn')) return 'zh';
  if (lower.startsWith('ja')) return 'ja';
  if (lower.startsWith('ko')) return 'ko';
  if (lower.startsWith('es')) return 'es';
  if (lower.startsWith('fr')) return 'fr';
  if (lower.startsWith('de')) return 'de';
  if (lower.startsWith('it')) return 'it';
  if (lower.startsWith('pt')) return 'pt';
  if (lower.startsWith('ru')) return 'ru';
  if (lower.startsWith('pl')) return 'pl';
  if (lower.startsWith('nl')) return 'nl';
  if (lower.startsWith('tr')) return 'tr';
  if (lower.startsWith('ar')) return 'ar';
  if (lower.startsWith('hi')) return 'hi';
  if (lower.startsWith('vi')) return 'vi';
  if (lower.startsWith('zh')) return 'zh';

  if (SUPPORTED_LANGS.includes(t as AppLanguage)) return t as AppLanguage;
  return 'en';
}

const PICKABLE_REGIONS = new Set(['US', 'CA', 'GB', 'JP', 'AU']);

function regionFromDeviceOrFallback(): string {
  const r = getLocales()[0]?.regionCode;
  if (r && PICKABLE_REGIONS.has(r)) return r;
  return 'US';
}

/**
 * Call once on app launch: restores saved language/region, or on first install
 * picks the closest supported language from the device (same idea as system OAuth UIs).
 */
export async function hydrateLocaleFromStorage(): Promise<void> {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const raw = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);

    if (raw) {
      const parsed = JSON.parse(raw) as { language?: string };
      const lang = migrateLanguageCode(parsed.language);
      await i18n.changeLanguage(lang);
      return;
    }

    const primary = getLocales()[0];
    const tag = primary?.languageTag ?? 'en';
    const lang = migrateLanguageCode(tag);
    const region = regionFromDeviceOrFallback();
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem(LOCALE_STORAGE_KEY, JSON.stringify({ language: lang, region }));
  } catch {
    /* ignore */
  }
}

export async function setAppLanguage(code: AppLanguage): Promise<void> {
  await i18n.changeLanguage(code);
}

export default i18n;
