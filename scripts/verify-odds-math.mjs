#!/usr/bin/env node
/** Unit-check odds math matches seed weights (1/4/11/184 → 0.50% mythic). */

function formatPercent(weight, total) {
  const pct = (weight / total) * 100;
  if (pct >= 10) return `${pct.toFixed(1).replace(/\.0$/, '')}%`;
  if (pct >= 1) return `${pct.toFixed(1)}%`;
  if (pct >= 0.1) return `${pct.toFixed(2)}%`;
  return `${pct.toFixed(3)}%`;
}

const items = [
  { weight: 1, rarity_tier: 'mythic' },
  { weight: 4, rarity_tier: 'legendary' },
  { weight: 11, rarity_tier: 'epic' },
  { weight: 184, rarity_tier: 'base' },
];

const total = items.reduce((s, r) => s + r.weight, 0);
const byTier = {};
for (const item of items) {
  byTier[item.rarity_tier] = (byTier[item.rarity_tier] ?? 0) + item.weight;
}

const mythic = formatPercent(byTier.mythic, total);
const expected = '0.50%';

if (mythic !== expected) {
  console.error(`Expected mythic ${expected}, got ${mythic}`);
  process.exit(1);
}

console.log(
  'Odds math OK:',
  Object.entries(byTier)
    .map(([tier, w]) => `${tier}=${formatPercent(w, total)}`)
    .join(', '),
);
