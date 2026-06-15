/**
 * App-wide color tokens — aligned with Phygitals black + green (`shared/tokens/ph.ts`).
 * Legacy key names (gold, accent, etc.) are kept so existing screens pick up the new look.
 */
import { ph } from '../../shared/tokens/ph';

export const colors = {
  background: ph.bg,
  surfaceElevated: ph.surfaceHigh,
  surfaceMuted: ph.surface,
  white: ph.text,
  black: '#020204',
  nearBlack: ph.surfaceRaise,
  ink: ph.greenInk,

  textPrimary: ph.text,
  textSecondary: ph.textSec,
  textMuted: ph.textMuted,
  textOnDark: ph.text,

  border: ph.border,
  borderLight: 'rgba(255,255,255,0.04)',

  red: ph.red,
  redDark: '#DC2626',
  redGlow: ph.redSoft,

  /** Primary CTA — premium emerald green. Legacy `gold` key kept so existing screens compile. */
  gold: ph.green,
  goldDark: ph.greenHover,
  goldSoft: ph.greenSoft,
  goldTintSubtle: 'rgba(16,185,129,0.06)',
  goldWash: 'rgba(16,185,129,0.08)',
  goldWash2: 'rgba(16,185,129,0.06)',
  goldWashMedium: 'rgba(16,185,129,0.10)',
  goldWashStrong: ph.greenSoft,
  goldBorderHairline: ph.greenBorder,
  goldBorderMuted: 'rgba(16,185,129,0.30)',
  goldBorder: 'rgba(16,185,129,0.38)',
  goldBorderStrong: 'rgba(16,185,129,0.48)',
  goldBorderHeavy: 'rgba(16,185,129,0.55)',
  goldPillBg: ph.greenSoft,
  goldPillBorder: ph.greenBorder,

  green: ph.green,

  /** Muted champagne gold — use ONLY for top-tier/grail accents, not CTAs. */
  champagneGold: ph.gold,
  champagneGoldSoft: ph.goldSoft,
  champagneGoldBorder: ph.goldBorder,

  /** Secondary accent — epic purple for highlights / links. */
  accent: ph.rarity.epic,
  accentDark: '#7C3AED',
  accentSoft: ph.rarityBg.epic,
  accentBorder: ph.rarityBorder.epic,
  accentGlow: 'rgba(168,85,247,0.20)',

  accentSapphire: ph.rarity.rare,
  accentSapphireSoft: ph.rarityBg.rare,

  accentCopper: ph.amber,
  accentCopperSoft: 'rgba(245,158,11,0.12)',

  accentJade: ph.green,
  accentJadeSoft: ph.greenSoft,

  magenta: ph.rarity.mythic,
  magentaDark: '#DB2777',
  magentaSoft: ph.rarityBg.mythic,
  magentaBorder: ph.rarityBorder.mythic,

  homeGradientTop: ph.surfaceHigh,
  homeGradientMid: ph.surface,
  homeGradientBottom: ph.bg,
  headerHairline: ph.borderMd,

  headerBarBg: 'rgba(5,5,7,0.94)',
  tabBarBg: 'rgba(5,5,7,0.97)',

  chipNew: ph.rarityBg.rare,
  chipNewText: ph.rarity.rare,
  chipNewBorder: ph.rarityBorder.rare,

  chipBestValue: ph.greenSoft,
  chipBestValueText: ph.green,
  chipBestValueBorder: ph.greenBorder,

  chipHotDrop: ph.rarityBg.mythic,
  chipHotDropText: ph.rarity.mythic,
  chipHotDropBorder: ph.rarityBorder.mythic,

  chipGraded: ph.rarityBg.legendary,
  chipGradedText: ph.rarity.legendary,
  chipGradedBorder: ph.rarityBorder.legendary,

  chipNewUser: ph.rarityBg.epic,
  chipNewUserText: ph.rarity.epic,
  chipNewUserBorder: ph.rarityBorder.epic,

  creditsPillBg: ph.surfaceHigh,

  promoBannerBg: ph.rarityBg.epic,
  promoBannerBorder: ph.rarityBorder.epic,
  verifiedPillBg: ph.greenSoft,
  verifiedPillText: ph.green,
  demoNoteBg: ph.greenSoft,
  demoNoteBorder: ph.greenBorder,
  demoNoteText: ph.green,
  warningBannerBg: ph.redSoft,
  warningBannerBorder: ph.red,
  warningBannerText: ph.red,

  shadow: 'rgba(0,0,0,0.55)',
  shadowStrong: 'rgba(0,0,0,0.72)',
  shadowCard: 'rgba(0,0,0,0.35)',

  casinoFelt: ph.surface,
  casinoGold: ph.green,
  casinoGoldDark: ph.greenHover,
  casinoFeltBorder: ph.borderMd,
} as const;
