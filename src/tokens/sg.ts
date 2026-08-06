/**
 * Tokyo Arcade Vault app skin.
 *
 * This branch deliberately overrides the N2 visual skin while preserving the
 * same semantic token API and product trust surfaces. The user-approved art
 * direction is a porcelain arcade shell, acrylic panels, black product bays,
 * cobalt controls, teal status and signal-red moments.
 *
 * React Native translation notes:
 * - CSS variables become this typed object.
 * - Web-only concepts from the handoff (backdrop blur, :active,
 *   prefers-reduced-motion, clip-path, text-stroke) are translated
 *   per-component in later steps — this module carries colors, lines,
 *   radii, shadows and type only.
 *
 * Compatibility note: the legacy `gold` key now resolves to cobalt. This lets
 * existing value/CTA code adopt the new skin without changing product logic.
 * `neon` resolves to signal red and remains reserved for short-lived moments.
 * - success = verification / stock / success only. Never decoration.
 * - Dividers are 1px `line` borders, not shadows. `shadowHero` is the only
 *   shadow, on at most ONE hero element per screen.
 * - All numerals (price / odds / stock / cert / countdown / balance) are
 *   data-face + tabular-nums.
 */

export const sg = {
  // ── Acrylic chassis ──
  bg: '#F5F2EA',
  surface: '#FCFBF7',
  surface2: '#E8ECF2',
  line: '#C6CBD3',

  // ── Ink and interface copy ──
  text: '#0A0C10',
  muted: '#5F6670',

  // ── Tokyo transit signals ──
  // Legacy key names are retained to avoid changing business components;
  // their visual meaning in this skin is cobalt = value / primary control.
  gold: '#165DFF',
  goldHi: '#0E47D9',
  onGold: '#F5F2EA',
  accentWash: 'rgba(22,93,255,0.08)',
  accentSoft: 'rgba(22,93,255,0.14)',
  accentMedium: 'rgba(22,93,255,0.20)',
  accentLine: 'rgba(22,93,255,0.38)',
  accentStrongLine: 'rgba(22,93,255,0.55)',
  neon: '#FF5148',
  neonGlow: 'rgba(255,81,72,0.28)',
  teal: '#22BFAE',
  violet: '#7655E8',
  ink: '#0A0C10',
  onInk: '#F5F2EA',
  chrome: '#AEB7C3',

  // ── セマンティック ──
  success: '#147B70',
  successWash: 'rgba(20,123,112,0.12)',
  successLine: 'rgba(20,123,112,0.35)',
  error: '#CC2D31',
  signalWash: 'rgba(255,81,72,0.12)',
  signalLine: 'rgba(255,81,72,0.42)',
  warning: '#A95A00',

  // ── Industrial acrylic geometry ──
  radius: { panel: 8, btn: 8, tag: 4 } as const,
  shadowHero: {
    shadowColor: '#243B61',
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  glowNeon: {
    shadowColor: '#FF5148',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },

  // ── Type: one angular arcade/control family across the complete skin ──
  // Chakra Petch's squared terminals are the strongest visible difference
  // from the previous app. Numeric call sites still apply tabular-nums.
  font: {
    display: 'ChakraPetch_700Bold',
    body: 'ChakraPetch_400Regular',
    bodyMedium: 'ChakraPetch_500Medium',
    bodyBold: 'ChakraPetch_700Bold',
    data: 'ChakraPetch_500Medium',
    dataBold: 'ChakraPetch_700Bold',
  },
  /** Compact RN type scale used by the Tokyo Arcade Vault screens. */
  type: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 28,
    hero: 34,
  } as const,
  /** fontVariant for every numeric display (price/odds/stock/cert/balance). */
  numeric: ['tabular-nums'] as const,

  // ── 8pt spacing system ──
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64 } as const,
} as const;
