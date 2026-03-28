'use client';

import { motion, type MotionValue } from 'framer-motion';
import type { RevealCard } from './types';
import { RARITY_VISUAL } from './rarityConfig';
import { formatUsd } from './formatUsd';

type Props = {
  card: RevealCard;
  valueOpacity: MotionValue<number>;
  visible: boolean;
};

export function ResultLayer({ card, valueOpacity, visible }: Props) {
  const vis = RARITY_VISUAL[card.rarity];

  if (!visible) return null;

  return (
    <motion.div
      className="absolute inset-x-0 bottom-8 z-[30] flex flex-col items-center gap-2 px-6 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Estimated value</div>
      <motion.div className="text-3xl font-black tabular-nums text-white" style={{ opacity: valueOpacity }}>
        {formatUsd(card.value)}
      </motion.div>
      <div className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${vis.badge}`}>
        {vis.label} pull
      </div>
    </motion.div>
  );
}
