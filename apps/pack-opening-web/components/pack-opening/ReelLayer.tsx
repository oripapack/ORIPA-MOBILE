'use client';

import { motion, type MotionValue } from 'framer-motion';
import type { RevealCard } from './types';

const SLOT = 96;
const CARD_W = 80;

/** Rarity → subtle border tint on reel card */
const RARITY_TINT: Record<string, string> = {
  common: 'rgba(148,163,184,0.25)',
  rare:   'rgba(56,189,248,0.30)',
  ultra:  'rgba(167,139,250,0.32)',
  chase:  'rgba(251,191,36,0.32)',
};

type Props = {
  cards: RevealCard[];
  translateX: MotionValue<number>;
  opacity: MotionValue<number>;
  slotWidth: number;
  cardWidth: number;
  edgeFade?: boolean;
};

/**
 * Horizontal card strip — transform-driven (no DOM churn during spin).
 * Each slot is a dark card shape; emoji removed in favour of CSS styling.
 */
export function ReelLayer({
  cards,
  translateX,
  opacity,
  slotWidth,
  cardWidth,
  edgeFade = true,
}: Props) {
  return (
    <motion.div
      className="absolute inset-x-0 top-[38%] z-10 h-[140px] -translate-y-1/2 overflow-hidden"
      style={{ opacity }}
    >
      {/* Edge fade vignette */}
      {edgeFade ? (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-ph-bg to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-ph-bg to-transparent" />
        </>
      ) : null}

      {/* Center stop marker — very subtle */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-px -translate-x-1/2 bg-ph-border-md" />

      <motion.div
        className="flex h-full flex-row items-center ph-will-animate"
        style={{ x: translateX, gap: slotWidth - cardWidth }}
      >
        {cards.map((c, i) => {
          const tint = RARITY_TINT[c.rarity] ?? RARITY_TINT.common;
          return (
            <div
              key={`${c.id}-${i}`}
              className="flex shrink-0 flex-col items-center justify-between overflow-hidden rounded-ph-lg bg-ph-surface-high"
              style={{
                width: cardWidth,
                height: 108,
                border: `1px solid ${tint}`,
              }}
            >
              {/* Rarity top strip */}
              <div className="h-1 w-full" style={{ background: tint }} />

              {/* Card art placeholder */}
              <div
                className="my-1 flex-1 w-10 rounded-ph-sm opacity-60"
                style={{
                  background: `linear-gradient(155deg, ${tint}, var(--ph-surface))`,
                }}
              />

              {/* Card name */}
              <p className="line-clamp-1 px-1 pb-1.5 text-center text-[8px] font-semibold text-ph-text-muted">
                {c.name}
              </p>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

export const REEL_DEFAULT_LAYOUT = { slotWidth: SLOT, cardWidth: CARD_W };
