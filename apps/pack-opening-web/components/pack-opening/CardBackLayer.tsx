'use client';

import { motion } from 'framer-motion';
import type { PackOpeningPhase, RevealRarity } from './types';

/** Rarity → subtle tint shown on the card back during hidden phase */
const RARITY_BACK_COLOR: Record<RevealRarity, string> = {
  common:  'rgba(148,163,184,0.18)',
  rare:    'rgba(56,189,248,0.22)',
  ultra:   'rgba(167,139,250,0.24)',
  chase:   'rgba(251,191,36,0.22)',
};

type Props = {
  rarity: RevealRarity;
  phase: PackOpeningPhase;
  onTap: () => void;
};

/**
 * Stage 3 — card face-down.
 * Shown during 'hidden' phase. User taps the card to advance to metadata.
 * Subtle breathing glow builds anticipation without casino strobing.
 */
export function CardBackLayer({ rarity, phase, onTap }: Props) {
  const isHidden   = phase === 'hidden';
  const isMetadata = phase === 'metadata';

  if (!isHidden && !isMetadata) return null;

  const tint = RARITY_BACK_COLOR[rarity];

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[25] flex flex-col items-center justify-center gap-6"
      style={{ perspective: 1200 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Dark screen dim */}
      <div className="absolute inset-0 bg-ph-bg/80" />

      {/* Card back — tappable during hidden, fades out during metadata */}
      <motion.div
        className="pointer-events-auto relative z-10 cursor-pointer"
        animate={isHidden ? { scale: [1, 1.012, 1] } : { scale: 0.96, opacity: 0 }}
        transition={
          isHidden
            ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.18, ease: 'easeOut' }
        }
        onClick={isHidden ? onTap : undefined}
      >
        {/* Rarity glow ring */}
        <div
          className="absolute -inset-3 rounded-[22px] blur-xl"
          style={{ background: tint, opacity: 0.7 }}
        />

        {/* Card frame */}
        <div
          className="relative flex h-52 w-36 flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-ph-border-md bg-ph-surface-raise"
          style={{
            background: `linear-gradient(155deg, var(--ph-surface-raise), #0d0c18)`,
          }}
        >
          {/* Decorative cross-hatch lines (card back pattern) */}
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 1px, transparent 1px, transparent 8px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 1px, transparent 1px, transparent 8px)',
            }}
          />

          {/* Center logo mark */}
          <div className="flex flex-col items-center gap-1">
            <div
              className="h-12 w-12 rounded-full border border-ph-border-md"
              style={{
                background: tint,
                boxShadow: `0 0 18px ${tint}`,
              }}
            />
            <p className="text-[9px] font-bold uppercase tracking-widest text-ph-text-muted">
              Pull Hub
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tap-to-reveal prompt — only during hidden */}
      {isHidden ? (
        <motion.button
          type="button"
          onClick={onTap}
          className="relative z-10 rounded-ph-pill border border-ph-border-md bg-ph-surface/80 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-ph-text-sec backdrop-blur-sm ph-transition-colors hover:border-ph-border-high hover:text-ph-text"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.25, ease: 'easeOut' }}
        >
          Tap to reveal
        </motion.button>
      ) : null}
    </motion.div>
  );
}
