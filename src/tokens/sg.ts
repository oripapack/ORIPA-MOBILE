/**
 * N2 "Neon Torii" design tokens.
 * Single source of truth: docs/design-system-n2.md (§3) — values are copied
 * verbatim, do not tune them here.
 *
 * React Native translation notes:
 * - CSS variables become this typed object.
 * - Web-only concepts from the handoff (backdrop blur, :active,
 *   prefers-reduced-motion, clip-path, text-stroke) are translated
 *   per-component in later steps — this module carries colors, lines,
 *   radii, shadows and type only.
 *
 * Role rules that code can't enforce (§4):
 * - gold = VALUE: prices, the ONE primary CTA per screen (black label),
 *   Hit rank, balances, logo accent. Never body text or wide fills.
 * - neon = MOMENT: DROP LIVE / CHASE / countdowns / reveal only,
 *   ≤2% of screen area, always with glow. Never CTAs, body, nav.
 * - success = verification / stock / success only. Never decoration.
 * - Dividers are 1px `line` borders, not shadows. `shadowHero` is the only
 *   shadow, on at most ONE hero element per screen.
 * - All numerals (price / odds / stock / cert / countdown / balance) are
 *   data-face + tabular-nums.
 */

export const sg = {
  // ── 基層 ──
  bg: '#000000',
  surface: '#101013',
  surface2: '#17171C',
  line: '#27272E',

  // ── テキスト ──
  text: '#F0EEE8', // #FFFFFF is banned app-wide
  muted: '#8E8C85',

  // ── ブランド ──
  gold: '#D4AF37',
  goldHi: '#E8CE7E',
  onGold: '#000000',
  neon: '#FF4A38',
  neonGlow: 'rgba(255,74,56,0.32)',

  // ── セマンティック ──
  success: '#6FBF8F',
  error: '#E5484D', // flat — never glows
  warning: '#FFB224',

  // ── 質感 ──
  radius: { panel: 13, btn: 10, tag: 6 } as const,
  /** 0 20px 48px rgba(0,0,0,.65) — at most ONE hero element per screen. */
  shadowHero: {
    shadowColor: '#000000',
    shadowOpacity: 0.65,
    shadowRadius: 48,
    shadowOffset: { width: 0, height: 20 },
    elevation: 12,
  },
  /** 0 0 16px neonGlow — neon must glow (LIVE / CHASE moments only). */
  glowNeon: {
    shadowColor: '#FF4A38',
    shadowOpacity: 0.32,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },

  // ── 型 (§7 — N2 brand set; optical sizing is a no-op in RN) ──
  font: {
    /** Headings — Fraunces weight 500 (not 600). */
    display: 'Fraunces_500Medium',
    body: 'SchibstedGrotesk_400Regular',
    bodyMedium: 'SchibstedGrotesk_500Medium',
    bodyBold: 'SchibstedGrotesk_700Bold',
    /** Data faces — Spline Sans Mono 400/500 per §7. */
    data: 'SplineSansMono_400Regular',
    dataBold: 'SplineSansMono_500Medium',
  },
  /** fontVariant for every numeric display (price/odds/stock/cert/balance). */
  numeric: ['tabular-nums'] as const,

  // ── spacing — N2 defines no spacing scale; the existing 8pt system stays ──
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64 } as const,
} as const;
