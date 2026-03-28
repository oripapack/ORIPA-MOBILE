'use client';

import { motion } from 'framer-motion';
import type { PackOpeningPhase, RevealRarity } from './types';
import { RARITY_PROFILE } from './rarityConfig';

type Props = {
  rarity: RevealRarity;
  phase: PackOpeningPhase;
};

/**
 * Tier glow + optional lightweight confetti (no heavy particles).
 */
export function RarityEffects({ rarity, phase }: Props) {
  const { glowIntensity, confetti } = RARITY_PROFILE[rarity];
  const active = phase === 'reveal' || phase === 'result';

  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[18] overflow-hidden">
      <motion.div
        className="absolute left-1/2 top-[40%] h-64 w-64 -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            rarity === 'chase'
              ? 'radial-gradient(circle, rgba(251,191,36,0.45), transparent 65%)'
              : rarity === 'ultra'
                ? 'radial-gradient(circle, rgba(167,139,250,0.42), transparent 65%)'
                : rarity === 'rare'
                  ? 'radial-gradient(circle, rgba(56,189,248,0.38), transparent 65%)'
                  : 'radial-gradient(circle, rgba(148,163,184,0.22), transparent 65%)',
          opacity: glowIntensity * 0.85,
        }}
        animate={{ opacity: [glowIntensity * 0.55, glowIntensity * 0.95, glowIntensity * 0.75] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {confetti ? (
        <div className="absolute inset-0">
          {Array.from({ length: 18 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/3 h-2 w-2 rounded-sm bg-amber-200/90"
              initial={{ x: 0, y: 0, opacity: 0.9, rotate: 0 }}
              animate={{
                x: (i % 6) * 18 - 45 + (i % 3) * 7,
                y: 120 + (i % 4) * 22,
                opacity: 0,
                rotate: i * 40,
              }}
              transition={{ duration: 1.35 + (i % 5) * 0.08, ease: 'easeOut' }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
