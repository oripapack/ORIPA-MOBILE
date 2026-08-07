/**
 * Tokyo Night Terminal skin.
 *
 * This branch is an explicit product-level visual override of the N2 black/gold
 * presentation. Trust language, hierarchy and interaction rules stay intact;
 * the visual system moves to a Japanese late-night transit/pack-terminal world.
 *
 * Layering: primitive -> semantic -> component. Components should consume the
 * exported `sg` semantic/component aliases instead of raw color literals.
 */

const primitive = {
  midnight950: '#080D18',
  midnight900: '#0C1322',
  navy800: '#121A2A',
  navy700: '#182338',
  navy600: '#21304A',
  steel500: '#42516C',
  steel400: '#6F7B91',
  aluminum300: '#A7B0BC',
  ivory100: '#F4EFE3',
  cobalt500: '#275DDB',
  cobalt400: '#3E72F0',
  vermilion500: '#FF5A47',
  mint500: '#38BFA8',
  amber500: '#EAB464',
  rose500: '#F36B74',
} as const;

const semantic = {
  bg: primitive.midnight950,
  surface: primitive.navy800,
  surface2: primitive.navy700,
  surfaceRaised: primitive.navy600,
  bayShell: '#0D1627',
  bayGlass: 'rgba(24,35,56,0.72)',
  surfaceTransparent: 'rgba(18,26,42,0)',
  line: '#2C3A52',
  lineStrong: primitive.steel500,
  text: primitive.ivory100,
  muted: primitive.aluminum300,
  chrome: primitive.steel400,
  /** Compatibility key: on this approved skin the value/primary accent is cobalt. */
  gold: primitive.cobalt500,
  goldHi: primitive.cobalt400,
  onGold: primitive.ivory100,
  neon: primitive.vermilion500,
  neonGlow: 'rgba(255,90,71,0.30)',
  success: primitive.mint500,
  error: primitive.rose500,
  warning: primitive.amber500,
  ticket: '#EAE4D8',
  ticketInk: '#111827',
  cobaltWashSoft: 'rgba(39,93,219,0.08)',
  cobaltWash: 'rgba(39,93,219,0.14)',
  cobaltWashStrong: 'rgba(39,93,219,0.20)',
  cobaltBorder: 'rgba(62,114,240,0.42)',
  cobaltBorderStrong: 'rgba(62,114,240,0.65)',
  mintWash: 'rgba(56,191,168,0.13)',
  mintBorder: 'rgba(56,191,168,0.36)',
  vermilionWash: 'rgba(255,90,71,0.13)',
  neonBorder: 'rgba(255,90,71,0.38)',
  warningWash: 'rgba(234,180,100,0.13)',
  warningBorder: 'rgba(234,180,100,0.36)',
  ivoryLight: 'rgba(244,239,227,0.72)',
  ivoryLightSoft: 'rgba(244,239,227,0.62)',
  cobaltLight: 'rgba(62,114,240,0.45)',
  cobaltLightStrong: 'rgba(62,114,240,0.50)',
  backdropRail: 'rgba(62,114,240,0.10)',
  backdropGrid: 'rgba(167,176,188,0.04)',
  modalScrim: 'rgba(0,0,0,0.60)',
  functionalScrim: 'rgba(8,13,24,0.88)',
  onPrimarySoft: 'rgba(244,239,227,0.68)',
  cardShine: 'rgba(244,239,227,0.14)',
} as const;

const component = {
  screen: {
    background: semantic.bg,
    rail: semantic.line,
  },
  panel: {
    background: semantic.surface,
    border: semantic.line,
    radius: 6,
  },
  buttonPrimary: {
    background: semantic.gold,
    foreground: semantic.onGold,
    border: semantic.goldHi,
    radius: 4,
    height: 54,
  },
  ticket: {
    background: semantic.ticket,
    foreground: semantic.ticketInk,
    radius: 3,
  },
  dock: {
    background: '#0C1424',
    active: semantic.goldHi,
    inactive: semantic.muted,
  },
} as const;

export const sg = {
  ...semantic,
  primitive,
  component,

  radius: { panel: 6, btn: 4, tag: 3, pill: 999 } as const,
  /** One focal object per screen: smoked acrylic depth, not a soft card shadow. */
  shadowHero: {
    shadowColor: '#020611',
    shadowOpacity: 0.72,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 18 },
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
    shadowOpacity: 0.38,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },

  font: {
    /** Condensed-feeling, high-impact display face available in the app bundle. */
    display: 'Outfit_900Black',
    body: 'SchibstedGrotesk_400Regular',
    bodyMedium: 'SchibstedGrotesk_500Medium',
    bodyBold: 'SchibstedGrotesk_700Bold',
    data: 'SplineSansMono_400Regular',
    dataBold: 'SplineSansMono_500Medium',
    /** Terminal labels deliberately use the mono face. */
    label: 'SplineSansMono_500Medium',
  },
  type: {
    hero: { fontSize: 36, lineHeight: 38, letterSpacing: -1.35 },
    title: { fontSize: 24, lineHeight: 28, letterSpacing: -0.55 },
    label: { fontSize: 10, lineHeight: 14, letterSpacing: 1.15 },
    body: { fontSize: 15, lineHeight: 22, letterSpacing: 0 },
    data: { fontSize: 14, lineHeight: 18, letterSpacing: -0.15 },
  },
  numeric: ['tabular-nums'] as const,
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64 } as const,
} as const;

export type TokyoNightTerminalTheme = typeof sg;
