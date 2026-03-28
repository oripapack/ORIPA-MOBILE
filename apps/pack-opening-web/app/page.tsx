'use client';

import { useMemo, useState } from 'react';
import { PackOpeningEngine } from '../components/pack-opening/PackOpeningEngine';
import type { RevealCard } from '../components/pack-opening/types';

const PRESETS: { label: string; card: RevealCard }[] = [
  {
    label: 'Common',
    card: {
      id: 'demo-c',
      name: 'Trainer Supporter',
      image: '🎴',
      rarity: 'common',
      value: 12,
      color: '#64748b',
    },
  },
  {
    label: 'Rare',
    card: {
      id: 'demo-r',
      name: 'Full Art V',
      image: '✨',
      rarity: 'rare',
      value: 180,
      color: '#38bdf8',
    },
  },
  {
    label: 'Ultra',
    card: {
      id: 'demo-u',
      name: 'Alt Art Secret',
      image: '💎',
      rarity: 'ultra',
      value: 640,
      color: '#a78bfa',
    },
  },
  {
    label: 'Chase',
    card: {
      id: 'demo-ch',
      name: 'Grail Chase',
      image: '🔥',
      rarity: 'chase',
      value: 2400,
      color: '#fbbf24',
    },
  },
];

export default function PackOpeningDemoPage() {
  const [preset, setPreset] = useState(0);
  const [salt, setSalt] = useState(1);

  const card = PRESETS[preset]!.card;

  const key = useMemo(() => `${preset}-${salt}`, [preset, salt]);

  return (
    <main className="min-h-dvh bg-[#070a0e] px-4 py-10">
      <div className="mx-auto max-w-lg">
        <header className="mb-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">PullHub</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-white">Pack opening engine</h1>
          <p className="mt-2 text-sm text-slate-400">
            Layered, state-driven animation — modular for iteration.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setPreset(i)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${
                preset === i ? 'bg-white text-slate-900' : 'bg-white/5 text-slate-400'
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSalt((s) => s + 1)}
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-300"
          >
            New reel seed
          </button>
        </div>

        <PackOpeningEngine key={key} winningCard={card} sessionSalt={salt} showDevControls />
      </div>
    </main>
  );
}
