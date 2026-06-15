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

const chipBase =
  'rounded-ph-pill border border-ph-border bg-ph-bg/60 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-ph-text-sec backdrop-blur-sm ph-transition hover:border-ph-border-md hover:text-ph-text active:scale-[0.97]';

/**
 * Skip + Replay + dev speed toggle.
 * Minimal, de-emphasised so it doesn't distract from the reveal.
 */
export function ControlsLayer({
  onSkip,
  onReplay,
  speed,
  onSpeedChange,
  showDevControls,
  canSkip,
}: Props) {
  return (
    <div className="absolute inset-x-0 top-3 z-[40] flex items-center justify-between px-4">
      <button
        type="button"
        onClick={onSkip}
        disabled={!canSkip}
        className={`${chipBase} disabled:opacity-25 disabled:pointer-events-none`}
      >
        Skip
      </button>

      <div className="flex items-center gap-2">
        <button type="button" onClick={onReplay} className={chipBase}>
          Replay
        </button>

        {showDevControls ? (
          <div className="flex rounded-ph-pill border border-ph-border bg-ph-bg/60 p-0.5 backdrop-blur-sm">
            {(['slow', 'normal', 'fast'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSpeedChange(s)}
                className={`rounded-ph-pill px-3 py-1 text-[9px] font-bold uppercase ph-transition ${
                  speed === s
                    ? 'bg-ph-surface-raise text-ph-text'
                    : 'text-ph-text-muted hover:text-ph-text-sec'
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
