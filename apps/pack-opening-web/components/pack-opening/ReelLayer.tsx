'use client';

import { motion, type MotionValue } from 'framer-motion';
import type { RevealCard } from './types';

const SLOT = 96;
const CARD_W = 80;

type Props = {
  cards: RevealCard[];
  translateX: MotionValue<number>;
  opacity: MotionValue<number>;
  slotWidth: number;
  cardWidth: number;
  /** Optional: edge fade instead of CSS blur (perf) */
  edgeFade?: boolean;
};

/**
 * Horizontal strip — transform-driven scroll (no huge list re-renders).
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
      {edgeFade ? (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-[#0b0f14] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-[#0b0f14] to-transparent" />
        </>
      ) : null}

      <motion.div
        className="flex h-full flex-row items-center ph-will-animate"
        style={{
          x: translateX,
          gap: slotWidth - cardWidth,
        }}
      >
        {cards.map((c, i) => (
          <div
            key={`${c.id}-${i}`}
            className="flex shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-900/80 shadow-inner"
            style={{
              width: cardWidth,
              height: 108,
            }}
          >
            <div className="text-center">
              <div className="text-3xl">{c.image}</div>
              <div className="mt-1 line-clamp-1 max-w-[72px] text-[9px] font-semibold text-slate-400">
                {c.name}
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

export const REEL_DEFAULT_LAYOUT = { slotWidth: SLOT, cardWidth: CARD_W };
