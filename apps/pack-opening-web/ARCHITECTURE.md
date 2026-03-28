# Pack Opening Engine (Web)

## Architecture

Single orchestrator (`PackOpeningEngine`) composes **isolated layers**. The **state machine** in `usePackOpening` drives all motion values; layers are presentational and do not own timers.

```
PackOpeningEngine
├── ControlsLayer      — skip / replay / speed (dev)
├── IntroLayer         — pack scale, glow, flash → handoff
├── ReelLayer          — horizontal strip (transform-only)
├── StopLayer          — center marker + vignette (slowdown/landing)
├── RarityEffectsLayer — tier glow + optional light confetti
├── RevealLayer        — dim, flash, flip, badge
└── ResultLayer        — value fade (motion value)
```

**Stop vs reel:** deceleration and spring landing are executed in `usePackOpening` on `translateX`. `StopLayer` is purely visual (marker, edge emphasis).

## State machine

`idle → intro → spinning → slowing → landing → reveal → result`

- **Skip:** sets all terminal motion values and jumps to `result`.
- **Replay:** bumps `replayKey`; `usePackOpening` effect resets and re-runs the sequence.

## Timing (target ~3.5–4.5s)

Base segments (scaled by rarity + speed):

| Segment   | Base (ms) | Notes                          |
|-----------|------------|--------------------------------|
| intro     | ~780       | scale + glow + flash out       |
| spin      | ~1250      | linear fast travel             |
| slow      | ~620       | cubic ease deceleration        |
| landing   | spring     | slight overshoot               |
| suspense  | tier + base| rarity pause before reveal     |
| flash+flip| ~130+520   | dim, flash, 3D flip            |
| value     | ~420       | fade-in                        |

## Component tree (runtime)

```
PackOpeningEngine
  ├─ motion values from usePackOpening
  ├─ RarityEffects(phase)
  ├─ ReelLayer(translateX, reelOpacity)
  ├─ StopLayer(phase)
  ├─ IntroLayer(introOpacity …)
  ├─ RevealLayer? (reveal | result)
  ├─ ResultLayer? (reveal | result)
  └─ ControlsLayer
```

## Performance

- Animate **`transform` + `opacity`** only on hot paths.
- Reel: single row, fixed card count; no virtualized DOM churn during spin.
- Optional heavy blur avoided on the strip; edge fades use **gradients**.

## Repo note

The main PullHub app is **Expo / React Native**. This **Next.js** app lives under `apps/pack-opening-web` for Framer Motion + Tailwind iteration; port layers to Reanimated when wiring mobile.
