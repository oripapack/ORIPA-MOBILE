/**
 * “Online casino” — deep felt, velvet cards, gold trim, chip red CTAs.
 * Tweak `background` / `gold` to try variants.
 */
export const colors = {
  // Base — table felt + chip rack
  background: '#0A100C',
  surfaceElevated: '#152018',
  surfaceMuted: '#1C2A22',
  white: '#FFFFFF',
  black: '#050806',
  /** Velvet / wood controls (secondary solid buttons, active chips) */
  nearBlack: '#4A3428',

  // Text — warm ivory on felt
  textPrimary: '#F5EDD6',
  textSecondary: '#C4B59A',
  textMuted: '#8A7B68',

  // Border — gold wire / brass
  border: '#3D3428',
  borderLight: '#2A241C',

  // Brand — chip red (CTAs) + bullion gold (VIP / tabs / credits sparkle)
  red: '#C41E3A',
  redDark: '#9B1C2E',
  redGlow: 'rgba(196, 30, 58, 0.38)',
  gold: '#E8C547',
  goldDark: '#B8860B',
  goldSoft: 'rgba(232, 197, 71, 0.16)',
  green: '#22C55E',

  /** Home — felt wash */
  homeGradientTop: '#0A100C',
  homeGradientMid: '#0F1A12',
  homeGradientBottom: '#0C1410',
  headerHairline: 'rgba(212, 175, 55, 0.22)',

  /** Top / bottom chrome (translucent felt) */
  headerBarBg: 'rgba(12, 22, 10, 0.94)',
  tabBarBg: 'rgba(10, 18, 8, 0.98)',

  // Chips — table felt + casino chip hues
  chipNew: 'rgba(59, 130, 246, 0.12)',
  chipNewText: '#93C5FD',
  chipNewBorder: 'rgba(96, 165, 250, 0.35)',

  chipBestValue: 'rgba(34, 197, 94, 0.12)',
  chipBestValueText: '#86EFAC',
  chipBestValueBorder: 'rgba(74, 222, 128, 0.3)',

  chipHotDrop: 'rgba(220, 38, 38, 0.14)',
  chipHotDropText: '#FCA5A5',
  chipHotDropBorder: 'rgba(248, 113, 113, 0.35)',

  chipGraded: 'rgba(168, 85, 247, 0.12)',
  chipGradedText: '#D8B4FE',
  chipGradedBorder: 'rgba(192, 132, 252, 0.32)',

  chipNewUser: 'rgba(244, 63, 94, 0.12)',
  chipNewUserText: '#FDA4AF',
  chipNewUserBorder: 'rgba(251, 113, 133, 0.32)',

  creditsPillBg: '#1A0F0A',

  promoBannerBg: 'rgba(180, 30, 50, 0.12)',
  promoBannerBorder: 'rgba(212, 175, 55, 0.35)',
  verifiedPillBg: 'rgba(34, 197, 94, 0.12)',
  verifiedPillText: '#86EFAC',
  demoNoteBg: 'rgba(212, 175, 55, 0.1)',
  demoNoteBorder: 'rgba(212, 175, 55, 0.35)',
  demoNoteText: '#F0D78C',
  warningBannerBg: 'rgba(212, 175, 55, 0.12)',
  warningBannerBorder: '#B8860B',
  warningBannerText: '#F5E6B8',

  shadow: 'rgba(0, 0, 0, 0.55)',
  shadowStrong: 'rgba(0, 0, 0, 0.65)',
  shadowCard: 'rgba(0, 0, 0, 0.45)',

  /** Account strip — premium felt */
  casinoFelt: '#060A08',
  casinoGold: '#F0D78C',
  casinoGoldDark: '#C9A227',
  casinoFeltBorder: 'rgba(212, 175, 55, 0.45)',
} as const;
