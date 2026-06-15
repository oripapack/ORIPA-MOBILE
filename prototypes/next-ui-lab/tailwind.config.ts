import type { Config } from 'tailwindcss';

/**
 * Pull Hub — Tailwind design token config
 *
 * All color values reference CSS custom properties defined in globals.css.
 * This keeps a single source of truth: change the variable → all utilities update.
 *
 * Token groups:
 *   ph-bg / ph-surface / ph-surface-high / ph-surface-raise  — backgrounds
 *   ph-border / ph-border-md / ph-border-high                — borders
 *   ph-text / ph-text-sec / ph-text-muted                    — text hierarchy
 *   ph-green* / ph-red* / ph-amber*                          — semantic actions
 *   ph-rarity-*                                              — rarity tier palette
 *
 * Spacing follows an 8pt system (Tailwind's default scale already covers this:
 *   1=4px  2=8px  4=16px  6=24px  8=32px  12=48px  16=64px)
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // Include prototypes so class scanning works during dev review
    '../../docs/prototypes/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      /* ── Typography ───────────────────────────────────────────────────── */
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },

      /* ── Color palette ────────────────────────────────────────────────── */
      colors: {
        /* Backgrounds */
        'ph-bg':           'var(--ph-bg)',
        'ph-surface':      'var(--ph-surface)',
        'ph-surface-high': 'var(--ph-surface-high)',
        'ph-surface-raise':'var(--ph-surface-raise)',

        /* Borders — use as border-ph-border, ring-ph-border-md, etc. */
        'ph-border':      'var(--ph-border)',
        'ph-border-md':   'var(--ph-border-md)',
        'ph-border-high': 'var(--ph-border-high)',

        /* Text */
        'ph-text':        'var(--ph-text)',
        'ph-text-sec':    'var(--ph-text-sec)',
        'ph-text-muted':  'var(--ph-text-muted)',

        /* Primary action — green */
        'ph-green':        'var(--ph-green)',
        'ph-green-hover':  'var(--ph-green-hover)',
        'ph-green-soft':   'var(--ph-green-soft)',
        'ph-green-border': 'var(--ph-green-border)',
        'ph-green-ink':    'var(--ph-green-ink)',

        /* Warning / rare — red */
        'ph-red':         'var(--ph-red)',
        'ph-red-soft':    'var(--ph-red-soft)',
        'ph-red-border':  'var(--ph-red-border)',

        /* Amber (badges, value) */
        'ph-amber':     'var(--ph-amber)',
        'ph-amber-ink': 'var(--ph-amber-ink)',

        /* Rarity tier text colors */
        'ph-common':    'var(--ph-rarity-common)',
        'ph-rare':      'var(--ph-rarity-rare)',
        'ph-epic':      'var(--ph-rarity-epic)',
        'ph-legendary': 'var(--ph-rarity-legendary)',
        'ph-mythic':    'var(--ph-rarity-mythic)',

        /* Rarity tier backgrounds */
        'ph-common-bg':    'var(--ph-rarity-common-bg)',
        'ph-rare-bg':      'var(--ph-rarity-rare-bg)',
        'ph-epic-bg':      'var(--ph-rarity-epic-bg)',
        'ph-legendary-bg': 'var(--ph-rarity-legendary-bg)',
        'ph-mythic-bg':    'var(--ph-rarity-mythic-bg)',

        /* Rarity tier borders */
        'ph-common-border':    'var(--ph-rarity-common-border)',
        'ph-rare-border':      'var(--ph-rarity-rare-border)',
        'ph-epic-border':      'var(--ph-rarity-epic-border)',
        'ph-legendary-border': 'var(--ph-rarity-legendary-border)',
        'ph-mythic-border':    'var(--ph-rarity-mythic-border)',
      },

      /* ── Border radius ────────────────────────────────────────────────── */
      borderRadius: {
        // Augmenting Tailwind defaults with Pull Hub named steps
        'ph-sm':   '6px',
        'ph-md':   '8px',
        'ph-lg':   '12px',
        'ph-xl':   '16px',
        'ph-2xl':  '20px',
        'ph-3xl':  '24px',
        'ph-pill': '9999px',
      },

      /* ── Box shadows ──────────────────────────────────────────────────── */
      boxShadow: {
        // Remove the old generic shadow
        // Generic dark card lift
        'ph-card':       '0 4px 16px rgba(0,0,0,0.40), 0 1px 4px rgba(0,0,0,0.28)',
        'ph-card-hover': '0 12px 40px rgba(0,0,0,0.56), 0 2px 8px rgba(0,0,0,0.36)',
        // Green CTA glow — use on primary "Open Pack" button
        'ph-cta':        '0 0 32px rgba(34,197,94,0.18)',
        'ph-cta-hover':  '0 0 48px rgba(34,197,94,0.28)',
        // Subtle ambient for floating modals / sheets
        'ph-sheet':      '0 24px 80px rgba(0,0,0,0.65), 0 4px 16px rgba(0,0,0,0.40)',
        // Rarity aura glows (low opacity, decorative)
        'ph-aura-epic':      '0 0 32px rgba(168,85,247,0.20)',
        'ph-aura-legendary': '0 0 32px rgba(245,158,11,0.20)',
        'ph-aura-mythic':    '0 0 32px rgba(236,72,153,0.22)',
        // Legacy — keep so existing code doesn't break
        'card-soft':     '0 8px 32px rgba(15, 23, 42, 0.12)',
      },

      /* ── Transition durations ─────────────────────────────────────────── */
      // CLAUDE.md: max 300ms, easing ease-out
      transitionDuration: {
        'ph-fast':   '100ms',
        'ph-normal': '150ms',
        'ph-slow':   '300ms',
      },

      /* ── Keyframes for subtle motion ──────────────────────────────────── */
      keyframes: {
        'ph-fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'ph-scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'ph-fade-in':  'ph-fade-in 200ms ease-out both',
        'ph-scale-in': 'ph-scale-in 200ms ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
