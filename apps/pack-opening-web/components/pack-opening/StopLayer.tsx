'use client';

import { motion } from 'framer-motion';
import type { PackOpeningPhase } from './types';

type Props = {
  phase: PackOpeningPhase;
  active: boolean;
};

/**
 * Center marker + subtle vignette during deceleration (isolated from reel transform).
 */
export function StopLayer({ phase, active }: Props) {
  const pulse =
    phase === 'slowing' || phase === 'landing' ? { scale: [1, 1.04, 1], opacity: [0.65, 1, 0.75] } : false;

  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[15]">
      <div className="absolute inset-x-0 top-[38%] flex -translate-y-1/2 justify-center">
        <motion.div
          className="h-[124px] w-[2px] rounded-full bg-gradient-to-b from-amber-200/20 via-amber-100/90 to-amber-200/20 shadow-[0_0_24px_rgba(251,191,36,0.35)]"
          animate={pulse || { opacity: 0.85 }}
          transition={{ duration: 0.55, repeat: pulse ? 1 : 0 }}
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 top-[55%] bg-gradient-to-t from-[#0b0f14] via-transparent to-transparent opacity-40" />
    </div>
  );
}
