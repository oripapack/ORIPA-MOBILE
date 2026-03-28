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
 * FIFA-inspired: pack center, glow build, scale — flash hands off to reel.
 */
export function IntroLayer({
  packTint,
  packLabel = 'Booster',
  scale,
  glow,
  flash,
  opacity,
}: Props) {
  const glowOpacity = useTransform(glow, [0, 1], [0.35, 1]);
  const flashOpacity = useTransform(flash, [0, 1], [0, 0.95]);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
      style={{ opacity }}
    >
      <motion.div
        className="relative flex h-44 w-32 items-center justify-center rounded-2xl border border-white/10 shadow-card-soft ph-will-animate"
        style={{
          scale,
          background: `linear-gradient(145deg, ${packTint}33, rgba(15,23,42,0.92))`,
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent"
          style={{ opacity: glowOpacity }}
        />
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl bg-white"
          style={{ opacity: flashOpacity }}
        />
        <div className="relative px-3 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300/90">PullHub</div>
          <div className="mt-2 text-lg font-black text-white">{packLabel}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
