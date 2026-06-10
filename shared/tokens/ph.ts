/**
 * Pull Hub design tokens (Phygitals-inspired).
 * Source of truth — mirrored in apps/pack-opening-web/app/globals.css.
 */
export const ph = {
  bg: '#050507',
  surface: '#0e0e12',
  surfaceHigh: '#141419',
  surfaceRaise: '#1a1a22',

  border: 'rgba(255,255,255,0.07)',
  borderMd: 'rgba(255,255,255,0.11)',
  borderHigh: 'rgba(255,255,255,0.18)',

  text: '#FFFFFF',
  textSec: '#9CA3AF',
  textMuted: '#6B7280',

  green: '#22C55E',
  greenHover: '#16A34A',
  greenSoft: 'rgba(34,197,94,0.10)',
  greenBorder: 'rgba(34,197,94,0.25)',
  greenInk: '#052e16',

  red: '#EF4444',
  redSoft: 'rgba(239,68,68,0.10)',
  redBorder: 'rgba(239,68,68,0.22)',

  amber: '#F59E0B',
  amberInk: '#451a03',

  rarity: {
    common: '#9CA3AF',
    rare: '#60A5FA',
    epic: '#A855F7',
    legendary: '#F59E0B',
    mythic: '#EC4899',
  },

  rarityBg: {
    common: 'rgba(156,163,175,0.09)',
    rare: 'rgba(96,165,250,0.09)',
    epic: 'rgba(168,85,247,0.11)',
    legendary: 'rgba(245,158,11,0.11)',
    mythic: 'rgba(236,72,153,0.13)',
  },

  rarityBorder: {
    common: 'rgba(156,163,175,0.18)',
    rare: 'rgba(96,165,250,0.20)',
    epic: 'rgba(168,85,247,0.24)',
    legendary: 'rgba(245,158,11,0.26)',
    mythic: 'rgba(236,72,153,0.28)',
  },

  reveal: {
    common: '#9CA3AF',
    rare: '#60A5FA',
    ultra: '#A855F7',
    chase: '#F59E0B',
  },

  radius: {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 20,
    pill: 999,
  },
} as const;

export type PhRarity = keyof typeof ph.rarity;
