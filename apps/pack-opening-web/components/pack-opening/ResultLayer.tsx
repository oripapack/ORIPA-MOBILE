'use client';

import { motion, type MotionValue } from 'framer-motion';
import type { RevealCard } from './types';
import { formatUsd } from './formatUsd';

/** Rarity label displayed in the result */
const RARITY_LABEL: Record<string, string> = {
  common: 'Common',
  rare:   'Rare',
  ultra:  'Ultra Rare',
  chase:  'Chase',
};

const RARITY_BADGE: Record<string, string> = {
  common: 'bg-ph-common-bg border-ph-common-border text-ph-common',
  rare:   'bg-ph-rare-bg   border-ph-rare-border   text-ph-rare',
  ultra:  'bg-ph-epic-bg   border-ph-epic-border   text-ph-epic',
  chase:  'bg-ph-legendary-bg border-ph-legendary-border text-ph-legendary',
};

type Props = {
  card: RevealCard;
  valueOpacity: MotionValue<number>;
  visible: boolean;
  onVault?: () => void;
  onConvert?: () => void;
};

/**
 * Stage 5 — result CTA.
 * Shows estimated value + rarity label + Vault / Convert buttons.
 * No casino-style celebrations; clean collectible presentation.
 */
export function ResultLayer({ card, valueOpacity, visible, onVault, onConvert }: Props) {
  if (!visible) return null;

  const badgeClass  = RARITY_BADGE[card.rarity]  ?? RARITY_BADGE.common;
  const rarityLabel = RARITY_LABEL[card.rarity]   ?? 'Pull';

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-[30] flex flex-col items-center gap-3 px-5 pb-6 pt-4 text-center"
      style={{
        background:
          'linear-gradient(to top, var(--ph-bg) 70%, transparent)',
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Rarity badge */}
      <div className={`rounded-ph-pill border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${badgeClass}`}>
        {rarityLabel} pull
      </div>

      {/* Value */}
      <motion.div
        className="text-3xl font-black tabular-nums text-ph-text"
        style={{ opacity: valueOpacity }}
      >
        {formatUsd(card.value)}
      </motion.div>

      <p className="text-[10px] font-semibold uppercase tracking-widest text-ph-text-muted">
        Estimated value
      </p>

      {/* CTAs */}
      <motion.div
        className="mt-1 flex w-full flex-col gap-2"
        style={{ opacity: valueOpacity }}
      >
        <button
          type="button"
          onClick={onVault}
          className="w-full rounded-ph-pill bg-ph-green py-3 text-xs font-black uppercase tracking-wide text-ph-green-ink shadow-ph-cta ph-transition hover:bg-ph-green-hover"
        >
          Add to Vault
        </button>
        <button
          type="button"
          onClick={onConvert}
          className="w-full rounded-ph-pill border border-ph-border-md bg-transparent py-2.5 text-xs font-bold uppercase tracking-wide text-ph-text-sec ph-transition hover:border-ph-border-high hover:text-ph-text"
        >
          Convert to Credits
        </button>
      </motion.div>
    </motion.div>
  );
}
