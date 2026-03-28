'use client';

import type { PackOpeningSpeed } from './types';

type Props = {
  onSkip: () => void;
  onReplay: () => void;
  speed: PackOpeningSpeed;
  onSpeedChange: (s: PackOpeningSpeed) => void;
  showDevControls: boolean;
  canSkip: boolean;
};

export function ControlsLayer({
  onSkip,
  onReplay,
  speed,
  onSpeedChange,
  showDevControls,
  canSkip,
}: Props) {
  return (
    <div className="absolute inset-x-0 top-4 z-[40] flex items-center justify-between px-4">
      <button
        type="button"
        onClick={onSkip}
        disabled={!canSkip}
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-200 backdrop-blur-sm transition enabled:active:scale-[0.98] disabled:opacity-30"
      >
        Skip
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onReplay}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-200 backdrop-blur-sm transition active:scale-[0.98]"
        >
          Replay
        </button>
        {showDevControls ? (
          <div className="flex rounded-full border border-white/10 bg-black/30 p-1">
            {(['slow', 'normal', 'fast'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSpeedChange(s)}
                className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                  speed === s ? 'bg-white/15 text-white' : 'text-slate-500'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
