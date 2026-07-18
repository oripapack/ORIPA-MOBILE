/**
 * "Stage & Gallery" tokens — palette revision "Urushi Archive" (2026-07-14).
 * Source of truth: docs/design-spec.md.
 *
 * Additive namespace: existing tokens (colors.ts / ph.ts) stay untouched and
 * screens migrate one at a time. Luminance encodes meaning — open in a dark
 * theater (Stage), browse in a lacquer-dark showroom, own/transact on washi.
 *
 * Rules that code can't enforce but reviewers must:
 * - shu (朱) on at most ONE element per screen; CTA only. Never flat-filled —
 *   semi-gloss (top 7% white gradient + inset top highlight + dark shadow).
 * - brass replaces gold. NEVER on buttons — rarity display, decorative lines,
 *   details only.
 * - jade is text/status only (trade-in complete, value confirmed). Not a
 *   button color.
 * - One warm spotlight from top-center per dark screen; components must not
 *   self-illuminate (LIVE indicators are the sanctioned exception).
 * - No full 1px borders on every element: matte background, satin UI cards
 *   (top-edge inset highlight only), gloss product imagery (layered shadow +
 *   ONE fixed diagonal reflection, never animated), semi-gloss CTA.
 * - Fraunces only for brand statements, pack names, and revealed card names.
 *   Mono only for prices / odds / stock / coins / hashes.
 * - Japanese motifs (wave, torii, sakura) are flagged OFF, not deleted.
 * - Kanji stamp expression is rejected — no kanji co-labels on UI.
 */

export const sg = {
  // ── sumi 墨 — dark layers (2–4% lightness steps) ──
  sumi: {
    s0: '#090A0A', // Stage — UI frame around the 3D scene
    s1: '#111313', // Showroom background
    s2: '#171918', // Showroom surface (satin cards)
    s3: '#1D201F', // Showroom raised surface
  },
  showroom: {
    bg: '#111313',
    surface: '#171918',
    raised: '#1D201F',
    text: '#E8E5DE', // near-white is banned; warm off-white only
    textMuted: '#9A968D', // derived — not in the approved sheet, flag if revising
  },
  stage: { bg: '#090A0A' },

  // ── washi 和紙 — Gallery layer ──
  gallery: {
    bg: '#F2EFE8',
    surface: '#F8F6F1',
    ink: '#201F1C',
    inkMuted: '#6E6960', // derived
  },

  // ── Accents ──
  shu: '#A63B32',
  shuHover: '#AF4036',
  onShu: '#F5EFE9',
  brass: '#A88B58', // rarity / decorative lines / details ONLY — never buttons
  jade: '#33705C', // text & status only (financial confirmation)
  jadeOnDark: '#4E8F76', // derived for contrast on sumi

  // ── Type faces (loaded in App.tsx via @expo-google-fonts) ──
  // Role limits: display = brand statement / pack name / revealed card name.
  // data = prices, odds, stock, coins, hashes — nothing else.
  font: {
    display: 'Fraunces_600SemiBold',
    displayMedium: 'Fraunces_500Medium',
    body: 'SchibstedGrotesk_400Regular',
    bodyMedium: 'SchibstedGrotesk_500Medium',
    bodyBold: 'SchibstedGrotesk_700Bold',
    data: 'SplineSansMono_500Medium',
    dataBold: 'SplineSansMono_600SemiBold',
  },

  // ── 8pt spacing (approved subset) ──
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64 } as const,

  // ── Radius roles ──
  radius: {
    control: 8, // buttons, inputs
    card: 12, // UI cards
    panel: 16, // large panels / sheets
    image: 7, // product / slab imagery
    pill: 999, // status chips ONLY
  } as const,

  // ── Material: satin top-edge highlight (instead of full borders) ──
  satinTopHighlight: 'rgba(255,255,255,0.05)',

  // ── Lighting: single warm spot, top-center (per dark screen) ──
  spot: {
    color: 'rgba(255,250,238,0.085)',
    // Web: radial-gradient(closest-side, spot.color, transparent 70%) at top
    // center + vertical darkening. RN: approximate with react-native-svg
    // RadialGradient per screen; components never add their own light.
  },
  // Monochrome soft-light noise over all dark surfaces (web: SVG turbulence)
  noiseOpacity: 0.018,

  // ── Elevation: real shadows in Gallery only ──
  galleryShadow: {
    shadowColor: '#201F1C',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  // Semi-gloss CTA drop shadow (dark, grounded)
  ctaShadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  // ── Glow (LIVE indicator / Stage effects ONLY) ──
  liveGlow: {
    shadowColor: '#A88B58',
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },

  // ── Feature flags ──
  flags: {
    /**
     * Wave / torii / sakura environments are parked (OFF), not deleted:
     * "Japan-origin + premium" must stand WITHOUT motifs first; they return
     * one at a time for comparison. Sakura particle spec (kept for Phase E):
     * none ≤ Rare / Legendary 3–7 petals · low saturation · 1.4s / Mythic full
     * celebration with depth rules.
     */
    japaneseMotifs: false,
  },
} as const;

export type SgLayer = 'showroom' | 'gallery';
