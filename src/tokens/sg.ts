/**
 * N2 “Midnight Tokyo” product tokens.
 *
 * Values in the core palette and 13 / 10 / 6 radius system mirror
 * `docs/design-system-n2.md` C-3 verbatim. Compatibility aliases keep older
 * components coherent while T4 removes their historical naming.
 */

const primitive = {
  night: '#000000',
  surface: '#101013',
  surface2: '#17171C',
  line: '#27272E',
  text: '#F0EEE8',
  muted: '#8E8C85',
  gold: '#D4AF37',
  goldHi: '#E8CE7E',
  neon: '#FF4A38',
  success: '#6FBF8F',
  error: '#E5484D',
  warning: '#FFB224',
} as const;

const semantic = {
  bg: primitive.night,
  surface: primitive.surface,
  surface2: primitive.surface2,
  surfaceRaised: primitive.surface2,
  bayShell: primitive.surface,
  bayGlass: 'rgba(16,16,19,0.72)',
  surfaceTransparent: 'rgba(16,16,19,0)',
  line: primitive.line,
  lineStrong: primitive.muted,
  text: primitive.text,
  muted: primitive.muted,
  chrome: primitive.muted,
  gold: primitive.gold,
  goldHi: primitive.goldHi,
  accentText: primitive.goldHi,
  onGold: primitive.night,
  value: primitive.gold,
  valueHi: primitive.goldHi,
  onValue: primitive.night,
  neon: primitive.neon,
  neonGlow: 'rgba(255,74,56,0.32)',
  success: primitive.success,
  error: primitive.error,
  warning: primitive.warning,
  ticket: primitive.text,
  ticketInk: primitive.night,
  /** Compatibility names: these now describe restrained neutral/value emphasis, not a second accent hue. */
  cobaltWashSoft: 'rgba(240,238,232,0.04)',
  cobaltWash: 'rgba(240,238,232,0.07)',
  cobaltWashStrong: 'rgba(240,238,232,0.10)',
  cobaltBorder: 'rgba(240,238,232,0.18)',
  cobaltBorderStrong: 'rgba(240,238,232,0.28)',
  mintWash: 'rgba(111,191,143,0.12)',
  mintBorder: 'rgba(111,191,143,0.34)',
  vermilionWash: 'rgba(255,74,56,0.12)',
  neonBorder: 'rgba(255,74,56,0.36)',
  warningWash: 'rgba(255,178,36,0.12)',
  warningBorder: 'rgba(255,178,36,0.34)',
  ivoryLight: 'rgba(240,238,232,0.72)',
  ivoryLightSoft: 'rgba(240,238,232,0.58)',
  cobaltLight: 'rgba(240,238,232,0.36)',
  cobaltLightStrong: 'rgba(240,238,232,0.48)',
  backdropRail: 'rgba(240,238,232,0.05)',
  backdropGrid: 'rgba(240,238,232,0.025)',
  modalScrim: 'rgba(0,0,0,0.60)',
  functionalScrim: 'rgba(0,0,0,0.72)',
  exhibitScrim: 'rgba(0,0,0,0.28)',
  onPrimarySoft: 'rgba(0,0,0,0.66)',
  cardShine: 'rgba(240,238,232,0.10)',
} as const;

const component = {
  screen: {
    background: semantic.bg,
    rail: semantic.line,
  },
  panel: {
    background: semantic.surface,
    border: semantic.line,
    radius: 13,
  },
  buttonPrimary: {
    background: semantic.value,
    foreground: semantic.onValue,
    border: semantic.valueHi,
    radius: 10,
    height: 54,
  },
  ticket: {
    background: semantic.ticket,
    foreground: semantic.ticketInk,
    radius: 6,
  },
  dock: {
    background: 'rgba(16,16,19,0.94)',
    active: semantic.text,
    inactive: semantic.muted,
  },
} as const;

export const sg = {
  ...semantic,
  primitive,
  component,

  radius: { panel: 13, btn: 10, tag: 6, pill: 999 } as const,
  /** One focal object per screen. */
  shadowHero: {
    shadowColor: primitive.night,
    shadowOpacity: 0.65,
    shadowRadius: 48,
    shadowOffset: { width: 0, height: 20 },
    elevation: 12,
  },
  glowNeon: {
    shadowColor: semantic.neon,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  glowCobalt: {
    shadowColor: semantic.gold,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  glowValue: {
    shadowColor: semantic.value,
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },

  font: {
    /** Editorial authority for one focal heading; body/UI remains a warm grotesk. */
    display: 'Fraunces_500Medium',
    body: 'SchibstedGrotesk_400Regular',
    bodyMedium: 'SchibstedGrotesk_500Medium',
    bodyBold: 'SchibstedGrotesk_700Bold',
    data: 'SplineSansMono_400Regular',
    dataBold: 'SplineSansMono_600SemiBold',
    /** Natural-language labels stay human; IDs, odds and Points use `data`. */
    label: 'SchibstedGrotesk_500Medium',
    japanese: 'ZenKakuGothicNew_500Medium',
    /** The bilingual layer stays restrained and ships one CJK weight. */
    japaneseBold: 'ZenKakuGothicNew_500Medium',
  },
  type: {
    hero: { fontSize: 36, lineHeight: 40, letterSpacing: -0.6 },
    title: { fontSize: 26, lineHeight: 30, letterSpacing: -0.35 },
    section: { fontSize: 21, lineHeight: 26, letterSpacing: -0.15 },
    label: { fontSize: 11, lineHeight: 16, letterSpacing: 0.1 },
    body: { fontSize: 15, lineHeight: 24, letterSpacing: 0 },
    caption: { fontSize: 13, lineHeight: 18, letterSpacing: 0 },
    data: { fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  },
  numeric: ['tabular-nums'] as const,
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64 } as const,
} as const;

export type TokyoNightTerminalTheme = typeof sg;
