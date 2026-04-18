/**
 * TCG / hobby light — crisp white cards on a soft violet-tinted canvas.
 * Primary energy: vivid violet + indigo (CTAs, links, frames). Value / Vault: warm amber-gold.
 * Hot drops & hype: magenta accent. Red reserved for urgency and errors only.
 */
export const colors = {
  // Base — whisper of lilac so screens don’t read as flat office gray
  background: '#F5F4FA',
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#EFEEF6',
  white: '#FFFFFF',
  black: '#0F0B14',
  /** Deep violet-ink — primary CTA fills */
  nearBlack: '#312A44',

  // Text — slightly plum-tinted neutrals
  textPrimary: '#1E1B2E',
  textSecondary: '#5C566E',
  textMuted: '#8A8499',
  textOnDark: '#FAF8FF',

  border: '#E4E1ED',
  borderLight: '#EFEDF5',

  // Brand — urgency / errors (unchanged role)
  red: '#B91C1C',
  redDark: '#991B1B',
  redGlow: 'rgba(185, 28, 28, 0.12)',

  /** Loot / Vault / coins — amber-gold (reads clearly next to violet) */
  gold: '#B45309',
  goldDark: '#92400E',
  goldSoft: 'rgba(180, 83, 9, 0.12)',
  /** Amber washes & borders (replace legacy yellow-gold rgba in components) */
  goldTintSubtle: 'rgba(180, 83, 9, 0.06)',
  goldWash: 'rgba(180, 83, 9, 0.08)',
  goldWash2: 'rgba(180, 83, 9, 0.07)',
  goldWashMedium: 'rgba(180, 83, 9, 0.1)',
  goldWashStrong: 'rgba(180, 83, 9, 0.14)',
  goldBorderHairline: 'rgba(180, 83, 9, 0.22)',
  goldBorderMuted: 'rgba(180, 83, 9, 0.28)',
  goldBorder: 'rgba(180, 83, 9, 0.35)',
  goldBorderStrong: 'rgba(180, 83, 9, 0.45)',
  goldBorderHeavy: 'rgba(180, 83, 9, 0.52)',
  goldPillBg: 'rgba(180, 83, 9, 0.16)',
  goldPillBorder: 'rgba(180, 83, 9, 0.5)',

  green: '#15803D',

  /** Main accent — violet (pack-opening energy, links, primary highlights) */
  accent: '#7C3AED',
  accentDark: '#6D28D9',
  accentSoft: 'rgba(124, 58, 237, 0.1)',
  accentBorder: 'rgba(124, 58, 237, 0.28)',
  accentGlow: 'rgba(124, 58, 237, 0.18)',

  /** Secondary electric note — indigo/sapphire for gradients & duo accents */
  accentSapphire: '#4F46E5',
  accentSapphireSoft: 'rgba(79, 70, 229, 0.12)',

  /** Hype / chase / limited — magenta (use sparingly) */
  magenta: '#C026D3',
  magentaDark: '#A21CAF',
  magentaSoft: 'rgba(192, 38, 211, 0.12)',
  magentaBorder: 'rgba(192, 38, 211, 0.35)',

  /** Home wash — cool lilac vertical gradient */
  homeGradientTop: '#FBFAFF',
  homeGradientMid: '#F5F4FA',
  homeGradientBottom: '#EDEAF7',
  headerHairline: 'rgba(49, 42, 68, 0.08)',

  headerBarBg: 'rgba(255, 255, 255, 0.94)',
  tabBarBg: 'rgba(255, 255, 255, 0.98)',

  chipNew: 'rgba(124, 58, 237, 0.12)',
  chipNewText: '#6D28D9',
  chipNewBorder: 'rgba(124, 58, 237, 0.28)',

  chipBestValue: 'rgba(21, 128, 61, 0.1)',
  chipBestValueText: '#166534',
  chipBestValueBorder: 'rgba(22, 163, 74, 0.22)',

  chipHotDrop: 'rgba(192, 38, 211, 0.12)',
  chipHotDropText: '#A21CAF',
  chipHotDropBorder: 'rgba(192, 38, 211, 0.32)',

  chipGraded: 'rgba(79, 70, 229, 0.12)',
  chipGradedText: '#4338CA',
  chipGradedBorder: 'rgba(79, 70, 229, 0.28)',

  chipNewUser: 'rgba(180, 83, 9, 0.12)',
  chipNewUserText: '#9A3412',
  chipNewUserBorder: 'rgba(180, 83, 9, 0.22)',

  creditsPillBg: '#EFEEF6',

  promoBannerBg: 'rgba(192, 38, 211, 0.08)',
  promoBannerBorder: 'rgba(124, 58, 237, 0.22)',
  verifiedPillBg: 'rgba(21, 128, 61, 0.1)',
  verifiedPillText: '#166534',
  demoNoteBg: 'rgba(124, 58, 237, 0.08)',
  demoNoteBorder: 'rgba(124, 58, 237, 0.22)',
  demoNoteText: '#6D28D9',
  warningBannerBg: 'rgba(180, 83, 9, 0.08)',
  warningBannerBorder: '#B45309',
  warningBannerText: '#78350F',

  shadow: 'rgba(30, 27, 46, 0.06)',
  shadowStrong: 'rgba(30, 27, 46, 0.11)',
  shadowCard: 'rgba(30, 27, 46, 0.08)',

  /**
   * Premium panels — soft lilac paper (legacy names preserved for imports).
   */
  casinoFelt: '#EDEAF5',
  casinoGold: '#7C3AED',
  casinoGoldDark: '#6D28D9',
  casinoFeltBorder: 'rgba(124, 58, 237, 0.14)',
} as const;
