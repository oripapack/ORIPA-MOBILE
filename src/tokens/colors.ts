/**
 * Futuristic Pokémon-TCG digital arena — deep blue space, electric cyan holo rails,
 * energy yellow highlights, Pokémon-adjacent red CTAs.
 */
export const colors = {
  // Base — starfield / stadium void
  background: '#050A14',
  surfaceElevated: '#0E1629',
  surfaceMuted: '#141C32',
  white: '#FFFFFF',
  black: '#020617',
  /** Secondary solid surfaces / wood-adjacent controls — cool slate */
  nearBlack: '#1E293B',

  // Text — cool ivory on deep blue
  textPrimary: '#F0F7FF',
  textSecondary: '#94A8C8',
  textMuted: '#64748B',

  // Border — holo / steel rail
  border: '#2A3F5C',
  borderLight: '#1A2538',

  // Brand — primary CTAs (Pokémon red) + energy yellow + electric cyan
  red: '#E60012',
  redDark: '#B8000E',
  redGlow: 'rgba(230, 0, 18, 0.38)',
  /** Energy / coins / sparkles (TCG yellow) */
  gold: '#FFCB05',
  goldDark: '#E6A800',
  goldSoft: 'rgba(255, 203, 5, 0.14)',
  green: '#22C55E',

  /** Electric cyan — holo lines, VIP highlights, secondary emphasis */
  accent: '#38BDF8',
  accentDark: '#0EA5E9',
  accentSoft: 'rgba(56, 189, 248, 0.12)',
  accentBorder: 'rgba(56, 189, 248, 0.35)',
  accentGlow: 'rgba(56, 189, 248, 0.45)',

  /** Home — blue wash */
  homeGradientTop: '#050A14',
  homeGradientMid: '#0A1228',
  homeGradientBottom: '#060B18',
  headerHairline: 'rgba(56, 189, 248, 0.25)',

  /** Top / bottom chrome */
  headerBarBg: 'rgba(5, 10, 22, 0.94)',
  tabBarBg: 'rgba(4, 8, 18, 0.98)',

  // Chips — digital booster hues
  chipNew: 'rgba(59, 130, 246, 0.14)',
  chipNewText: '#93C5FD',
  chipNewBorder: 'rgba(96, 165, 250, 0.4)',

  chipBestValue: 'rgba(34, 197, 94, 0.12)',
  chipBestValueText: '#86EFAC',
  chipBestValueBorder: 'rgba(74, 222, 128, 0.3)',

  chipHotDrop: 'rgba(230, 0, 18, 0.14)',
  chipHotDropText: '#FCA5A5',
  chipHotDropBorder: 'rgba(248, 113, 113, 0.35)',

  chipGraded: 'rgba(168, 85, 247, 0.12)',
  chipGradedText: '#D8B4FE',
  chipGradedBorder: 'rgba(192, 132, 252, 0.32)',

  chipNewUser: 'rgba(244, 63, 94, 0.12)',
  chipNewUserText: '#FDA4AF',
  chipNewUserBorder: 'rgba(251, 113, 133, 0.32)',

  creditsPillBg: '#0F1729',

  promoBannerBg: 'rgba(230, 0, 18, 0.1)',
  promoBannerBorder: 'rgba(56, 189, 248, 0.35)',
  verifiedPillBg: 'rgba(34, 197, 94, 0.12)',
  verifiedPillText: '#86EFAC',
  demoNoteBg: 'rgba(56, 189, 248, 0.08)',
  demoNoteBorder: 'rgba(56, 189, 248, 0.3)',
  demoNoteText: '#7DD3FC',
  warningBannerBg: 'rgba(255, 203, 5, 0.1)',
  warningBannerBorder: '#E6A800',
  warningBannerText: '#FEF3C7',

  shadow: 'rgba(0, 0, 0, 0.55)',
  shadowStrong: 'rgba(0, 0, 0, 0.65)',
  shadowCard: 'rgba(0, 0, 0, 0.45)',

  /** Premium panels — holo cyan (legacy names kept for imports) */
  casinoFelt: '#030712',
  casinoGold: '#7DD3FC',
  casinoGoldDark: '#38BDF8',
  casinoFeltBorder: 'rgba(56, 189, 248, 0.35)',
} as const;
