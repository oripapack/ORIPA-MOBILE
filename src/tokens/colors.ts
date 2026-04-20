/**
 * Jewel vault — dark premium shell with multi-tone accents (not flat monochrome).
 * Gold = value / CTAs on gold; amethyst = primary digital energy; sapphire, jade, coral = variety.
 * Red stays for urgency; ink = legible type on gold surfaces.
 */
export const colors = {
  background: '#07050F',
  surfaceElevated: '#14102A',
  surfaceMuted: '#1C1733',
  white: '#FFFFFF',
  black: '#020108',
  /** Velvet slabs, media bars — sits above background with subtle violet depth */
  nearBlack: '#241B3D',
  /** High-contrast type on gold / champagne fills */
  ink: '#0A0614',

  textPrimary: '#F4F0FF',
  textSecondary: '#B4ABCC',
  textMuted: '#8B82A8',
  textOnDark: '#FAF7FF',

  border: 'rgba(196, 181, 255, 0.14)',
  borderLight: 'rgba(196, 181, 255, 0.07)',

  red: '#F43F5E',
  redDark: '#E11D48',
  redGlow: 'rgba(244, 63, 94, 0.2)',

  /** Vault / loot — bright antique gold */
  gold: '#E8C547',
  goldDark: '#C9A227',
  goldSoft: 'rgba(232, 197, 71, 0.16)',
  goldTintSubtle: 'rgba(232, 197, 71, 0.07)',
  goldWash: 'rgba(232, 197, 71, 0.1)',
  goldWash2: 'rgba(232, 197, 71, 0.08)',
  goldWashMedium: 'rgba(232, 197, 71, 0.12)',
  goldWashStrong: 'rgba(232, 197, 71, 0.16)',
  goldBorderHairline: 'rgba(232, 197, 71, 0.28)',
  goldBorderMuted: 'rgba(232, 197, 71, 0.34)',
  goldBorder: 'rgba(232, 197, 71, 0.42)',
  goldBorderStrong: 'rgba(232, 197, 71, 0.52)',
  goldBorderHeavy: 'rgba(232, 197, 71, 0.6)',
  goldPillBg: 'rgba(232, 197, 71, 0.18)',
  goldPillBorder: 'rgba(232, 197, 71, 0.55)',

  green: '#34D399',

  /** Primary accent — amethyst (highlights, links) */
  accent: '#C084FC',
  accentDark: '#7E22CE',
  accentSoft: 'rgba(192, 132, 252, 0.14)',
  accentBorder: 'rgba(192, 132, 252, 0.38)',
  accentGlow: 'rgba(192, 132, 252, 0.25)',

  /** Sapphire — cool jewel contrast */
  accentSapphire: '#38BDF8',
  accentSapphireSoft: 'rgba(56, 189, 248, 0.14)',

  /** Coral / copper — warm tertiary (rings, variety) */
  accentCopper: '#FB923C',
  accentCopperSoft: 'rgba(251, 146, 60, 0.14)',

  /** Jade — mint jewel for special highlights */
  accentJade: '#2DD4BF',
  accentJadeSoft: 'rgba(45, 212, 191, 0.12)',

  /** Hype / chase — orchid pink */
  magenta: '#F472B6',
  magentaDark: '#EC4899',
  magentaSoft: 'rgba(244, 114, 182, 0.14)',
  magentaBorder: 'rgba(244, 114, 182, 0.38)',

  /** Home wash — vertical jewel drift (plum → sapphire → ink) */
  homeGradientTop: '#1A1035',
  homeGradientMid: '#0F1730',
  homeGradientBottom: '#07050F',
  headerHairline: 'rgba(232, 197, 71, 0.18)',

  headerBarBg: 'rgba(10, 8, 18, 0.92)',
  tabBarBg: 'rgba(10, 8, 18, 0.96)',

  chipNew: 'rgba(192, 132, 252, 0.16)',
  chipNewText: '#E9D5FF',
  chipNewBorder: 'rgba(192, 132, 252, 0.35)',

  chipBestValue: 'rgba(45, 212, 191, 0.14)',
  chipBestValueText: '#5EEAD4',
  chipBestValueBorder: 'rgba(45, 212, 191, 0.3)',

  chipHotDrop: 'rgba(244, 114, 182, 0.16)',
  chipHotDropText: '#FBCFE8',
  chipHotDropBorder: 'rgba(244, 114, 182, 0.35)',

  chipGraded: 'rgba(56, 189, 248, 0.14)',
  chipGradedText: '#7DD3FC',
  chipGradedBorder: 'rgba(56, 189, 248, 0.32)',

  chipNewUser: 'rgba(251, 146, 60, 0.14)',
  chipNewUserText: '#FDBA74',
  chipNewUserBorder: 'rgba(251, 146, 60, 0.32)',

  creditsPillBg: 'rgba(28, 23, 51, 0.92)',

  promoBannerBg: 'rgba(244, 114, 182, 0.1)',
  promoBannerBorder: 'rgba(192, 132, 252, 0.3)',
  verifiedPillBg: 'rgba(52, 211, 153, 0.12)',
  verifiedPillText: '#6EE7B7',
  demoNoteBg: 'rgba(192, 132, 252, 0.1)',
  demoNoteBorder: 'rgba(192, 132, 252, 0.32)',
  demoNoteText: '#E9D5FF',
  warningBannerBg: 'rgba(251, 146, 60, 0.12)',
  warningBannerBorder: '#FB923C',
  warningBannerText: '#FDBA74',

  shadow: 'rgba(0, 0, 0, 0.5)',
  shadowStrong: 'rgba(0, 0, 0, 0.65)',
  shadowCard: 'rgba(126, 34, 206, 0.18)',

  /**
   * Premium panels — deep felt with gold trim (legacy names preserved for imports).
   */
  casinoFelt: '#1E1836',
  casinoGold: '#E8C547',
  casinoGoldDark: '#C9A227',
  casinoFeltBorder: 'rgba(232, 197, 71, 0.22)',
} as const;
