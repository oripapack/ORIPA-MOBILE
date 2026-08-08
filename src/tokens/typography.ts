import { Platform, TextStyle } from 'react-native';
import { sg } from './sg';

/** Compatibility typography map. New components should consume `sg.font`. */
export const brandFont = {
  thin: sg.font.body,
  extraLight: sg.font.body,
  light: sg.font.body,
  regular: sg.font.body,
  medium: sg.font.bodyMedium,
  semibold: sg.font.bodyBold,
  bold: sg.font.bodyBold,
  extraBold: sg.font.display,
  black: sg.font.display,
} as const;

export const fontFamily = {
  regular: brandFont.regular,
  medium: brandFont.medium,
  bold: brandFont.bold,
  heavy: brandFont.black,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 28,
  hero: 36,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
  black: '900' as const,
};

export const brandType: Record<keyof typeof fontWeight, Pick<TextStyle, 'fontFamily'>> = {
  regular: { fontFamily: brandFont.regular },
  medium: { fontFamily: brandFont.medium },
  semibold: { fontFamily: brandFont.semibold },
  bold: { fontFamily: brandFont.bold },
  heavy: { fontFamily: brandFont.extraBold },
  black: { fontFamily: brandFont.black },
};

export const lineHeight = { tight: 1.2, normal: 1.4, relaxed: 1.6 };

export const fontFamilySystem = {
  regular: Platform.select({ ios: 'System', android: 'sans-serif' }),
  medium: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  bold: Platform.select({ ios: 'System', android: 'sans-serif' }),
  heavy: Platform.select({ ios: 'System', android: 'sans-serif' }),
};
