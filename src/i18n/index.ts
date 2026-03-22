import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ja from './locales/ja.json';
import es from './locales/es.json';
import zh from './locales/zh.json';
import ko from './locales/ko.json';
import zht from './locales/zht.json';
import { LOCALE_STORAGE_KEY } from '../locale/constants';

export const SUPPORTED_LANGS = ['en', 'ja', 'es', 'zh', 'zht', 'ko'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGS)[number];

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ja: { translation: ja },
    es: { translation: es },
    zh: { translation: zh },
    ko: { translation: ko },
    zht: { translation: zht },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export function migrateLanguageCode(code: string | undefined): AppLanguage {
  if (!code) return 'en';
  if (code === 'en-US' || code === 'en-GB') return 'en';
  if (code === 'zh-TW' || code === 'zh-HK' || code === 'zh-Hant') return 'zht';
  if (SUPPORTED_LANGS.includes(code as AppLanguage)) return code as AppLanguage;
  return 'en';
}

/** Call once on app launch so UI matches saved language before Account mounts. */
export async function hydrateLocaleFromStorage(): Promise<void> {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const raw = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { language?: string };
    const lang = migrateLanguageCode(parsed.language);
    await i18n.changeLanguage(lang);
  } catch {
    /* ignore */
  }
}

export async function setAppLanguage(code: AppLanguage): Promise<void> {
  await i18n.changeLanguage(code);
}

export default i18n;
