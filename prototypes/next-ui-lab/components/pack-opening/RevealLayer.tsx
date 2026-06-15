'use client';

import { motion, type MotionValue } from 'framer-motion';
import type { PackOpeningPhase, RevealCard } from './types';

/** Rarity → design-token-based visual classes */
const RARITY_CLASSES: Record<string, {
  gradient: string;
  border: string;
  badge: string;
  label: string;
}> = {
  common: {
    gradient: 'from-ph-common-bg to-ph-surface',
    border:   'border-ph-common-border',
    badge:    'bg-ph-common-bg border border-ph-common-border text-ph-common',
    label:    'Common',
  },
  rare: {
    gradient: 'from-ph-rare-bg to-ph-surface',
    border:   'border-ph-rare-border',
    badge:    'bg-ph-rare-bg border border-ph-rare-border text-ph-rare',
    label:    'Rare',
  },
  ultra: {
    gradient: 'from-ph-epic-bg to-ph-surface',
    border:   'border-ph-epic-border',
    badge:    'bg-ph-epic-bg border border-ph-epic-border text-ph-epic',
    label:    'Ultra Rare',
  },
  chase: {
    gradient: 'from-ph-legendary-bg to-ph-surface',
    border:   'border-ph-legendary-border',
    badge:    'bg-ph-legendary-bg border border-ph-legendary-border text-ph-legendary',
    label:    'Chase',
  },
};

type Props = {
  card: RevealCard;
  phase: PackOpeningPhase;
  dim: MotionValue<number>;
  flash: MotionValue<number>;
  flipRotateX: MotionValue<number>;
  floatY: MotionValue<number>;
  badgeScale: MotionValue<number>;
};

/**
 * Stage 4 — 3D card flip reveal.
 * Also handles Stage 3 (metadata) with the card face showing name/rarity
 * before full art is "visible" (since we use placeholders anyway).
 * Premium and restrained: no strobing, single-direction 3D flip.
 */
export function RevealLayer({ card, phase, dim, flash, flipRotateX, floatY, badgeScale }: Props) {
  const vis = RARITY_CLASSES[card.rarity] ?? RARITY_CLASSES.common;

  const showReveal   = phase === 'reveal'   || phase === 'result';
  const showMetadata = phase === 'metadata';

  if (!showReveal && !showMetadata) return null;

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[25] flex items-center justify-center"
      style={{ perspective: 1200 }}
    >
      {/* Screen dim */}
      <motion.div className="absolute inset-0 bg-ph-bg" style={{ opacity: dim }} />

      {/* White flash (reveal moment) */}
      {showReveal ? (
        <motion.div className="absolute inset-0 bg-white" style={{ opacity: flash }} />
      ) : null}

      {/* Metadata phase — card face but no 3D flip yet */}
      {showMetadata ? (
        <motion.div
          className="relative z-10 flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {/* Card frame (static, face-up) */}
          <div
            className={`relative h-52 w-36 overflow-hidden rounded-2xl border bg-gradient-to-br ${vis.gradient} ${vis.border}`}
          >
            <div className="flex h-full w-full flex-col items-center justify-between bg-ph-surface/90 p-4">
              {/* Art placeholder */}
              <div className={`h-24 w-24 rounded-ph-lg bg-gradient-to-br opacity-60 ${vis.gradient}`} />
              <div className="w-full text-center">
                <p className="line-clamp-2 text-xs font-black text-ph-text">{card.name}</p>
              </div>
              <div className={`rounded-ph-pill px-3 py-1 text-[9px] font-black uppercase tracking-widest ${vis.badge}`}>
                {vis.label}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* Reveal phase — 3D flip */}
      {showReveal ? (
        <motion.div
          className="relative z-10"
          style={{ rotateX: flipRotateX, y: floatY, transformStyle: 'preserve-3d' }}
        >
          {/* Rarity glow behind card */}
          <div
            className={`absolute -inset-4 rounded-[28px] blur-2xl bg-gradient-to-b ${vis.gradient} opacity-50`}
          />

          <div
            className={`relative h-52 w-36 overflow-hidden rounded-2xl border bg-gradient-to-br ${vis.gradient} ${vis.border} shadow-ph-card`}
          >
            <div className="flex h-full w-full flex-col items-center justify-between bg-ph-surface/90 p-4">
              {/* Card art placeholder — styled rectangle instead of emoji */}
              <div className={`h-24 w-24 rounded-ph-lg bg-gradient-to-br ${vis.gradient}`} />

              <div className="w-full text-center">
                <p className="line-clamp-2 text-sm font-black text-ph-text">{card.name}</p>
              </div>

              {/* Rarity badge */}
              <motion.div
                className={`rounded-ph-pill px-3 py-1 text-[9px] font-black uppercase tracking-widest ${vis.badge}`}
                style={{ scale: badgeScale }}
              >
                {vis.label}
              </motion.div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
