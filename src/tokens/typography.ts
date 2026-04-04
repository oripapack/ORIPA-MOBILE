import { Platform, TextStyle } from 'react-native';

/**
 * Outfit (Google Fonts) — geometric, readable, works for a “arena / collector” brand.
 * Loaded in `App.tsx` via `@expo-google-fonts/outfit` before UI mounts.
 */
export const brandFont = {
  thin: 'Outfit_100Thin',
  extraLight: 'Outfit_200ExtraLight',
  light: 'Outfit_300Light',
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
  extraBold: 'Outfit_800ExtraBold',
  black: 'Outfit_900Black',
} as const;

/** Default body face — same as `brandFont.regular` after fonts load */
export const fontFamily = {
  regular: brandFont.regular,
  medium: brandFont.medium,
  bold: brandFont.bold,
  heavy: brandFont.extraBold,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 28,
  hero: 34,
};

/** Numeric weights kept for rare cases (e.g. third-party). Prefer `brandFont` on Text for RN. */
export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
  black: '900' as const,
};

/** Spread on `Text` / `TextInput` instead of `fontWeight: fontWeight.*` for custom fonts on Android */
export const brandType: Record<keyof typeof fontWeight, Pick<TextStyle, 'fontFamily'>> = {
  regular: { fontFamily: brandFont.regular },
  medium: { fontFamily: brandFont.medium },
  semibold: { fontFamily: brandFont.semibold },
  bold: { fontFamily: brandFont.bold },
  heavy: { fontFamily: brandFont.extraBold },
  black: { fontFamily: brandFont.black },
};

export const lineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
};

/** Tab bar labels etc. still use SF / Roboto metrics — keep system for tiny chrome if needed */
export const fontFamilySystem = {
  regular: Platform.select({ ios: 'System', android: 'sans-serif' }),
  medium: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  bold: Platform.select({ ios: 'System', android: 'sans-serif' }),
  heavy: Platform.select({ ios: 'System', android: 'sans-serif' }),
};
