'use client';

import { motion, type MotionValue } from 'framer-motion';
import type { RevealCard } from './types';
import { RARITY_VISUAL } from './rarityConfig';

type Props = {
  card: RevealCard;
  dim: MotionValue<number>;
  flash: MotionValue<number>;
  flipRotateX: MotionValue<number>;
  floatY: MotionValue<number>;
  badgeScale: MotionValue<number>;
};

/**
 * Post-reel: dim, flash, 3D flip — premium, not casino strobing.
 */
export function RevealLayer({ card, dim, flash, flipRotateX, floatY, badgeScale }: Props) {
  const vis = RARITY_VISUAL[card.rarity];

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[25] flex items-center justify-center"
      style={{
        perspective: 1200,
      }}
    >
      <motion.div className="absolute inset-0 bg-[#0b0f14]" style={{ opacity: dim }} />

      <motion.div className="absolute inset-0 bg-white" style={{ opacity: flash }} />

      <motion.div
        className="relative z-10"
        style={{
          rotateX: flipRotateX,
          y: floatY,
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className={`relative h-52 w-36 rounded-2xl border bg-gradient-to-br p-[1px] shadow-card-soft ring-2 ${vis.ring} ${vis.gradient}`}
          style={{ borderColor: `${card.color}55` }}
        >
          <div className="flex h-full w-full flex-col items-center justify-between rounded-2xl bg-slate-950/90 p-4">
            <div className="text-5xl">{card.image}</div>
            <div className="w-full text-center">
              <div className="line-clamp-2 text-sm font-black text-white">{card.name}</div>
            </div>
            <motion.div
              className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${vis.badge}`}
              style={{ scale: badgeScale }}
            >
              {vis.label}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
