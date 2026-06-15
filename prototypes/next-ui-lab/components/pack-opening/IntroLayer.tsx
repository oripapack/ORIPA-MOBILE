'use client';

import { motion, useTransform, type MotionValue } from 'framer-motion';

type Props = {
  packTint: string;
  packLabel?: string;
  scale: MotionValue<number>;
  glow: MotionValue<number>;
  flash: MotionValue<number>;
  opacity: MotionValue<number>;
};

/**
 * Stage 2 intro — pack scales in, glows, then flashes to the reel.
 * Premium dark aesthetic; no casino strobing.
 */
export function IntroLayer({
  packTint,
  packLabel = 'Booster',
  scale,
  glow,
  flash,
  opacity,
}: Props) {
  const glowOpacity  = useTransform(glow,  [0, 1], [0.2, 0.9]);
  const flashOpacity = useTransform(flash, [0, 1], [0, 0.85]);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
      style={{ opacity }}
    >
      <motion.div
        className="relative flex h-48 w-36 flex-col items-center justify-center gap-3 overflow-hidden rounded-[20px] border border-ph-border-md ph-will-animate"
        style={{
          scale,
          background: `linear-gradient(145deg, ${packTint}2a, var(--ph-bg))`,
          boxShadow: `0 0 48px ${packTint}22, 0 24px 64px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Sheen */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />

        {/* Rarity-tinted glow overlay */}
        <motion.div
          className="absolute inset-0 rounded-[20px]"
          style={{
            opacity: glowOpacity,
            background: `linear-gradient(to bottom, ${packTint}18, transparent)`,
          }}
        />

        {/* Flash */}
        <motion.div
          className="pointer-events-none absolute inset-0 bg-white"
          style={{ opacity: flashOpacity }}
        />

        {/* Pack content */}
        <div className="relative flex flex-col items-center gap-2 px-3 text-center">
          {/* Decorative card shape placeholder */}
          <div
            className="h-16 w-12 rounded-ph-lg border border-ph-border-md opacity-70"
            style={{
              background: `linear-gradient(155deg, ${packTint}33, var(--ph-surface-raise))`,
            }}
          />
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-ph-text-muted">
            Pull Hub
          </p>
          <p className="text-sm font-black text-ph-text">{packLabel}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
