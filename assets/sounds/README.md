# Pack opening SFX

Short PCM `.wav` files for `expo-av`:

- **Lineup carousel** — `pack_lineup_snap.wav` / `pack_lineup_pick.wav` via `src/audio/packLineupSfx.ts`
- **Tear / reveal / hit** — `pack_tear.wav`, `pack_reveal.wav`, `pack_hit.wav` (reserved for future wiring)

Regenerate (e.g. after tweaking the generator):

```bash
npm run generate:sfx
```

Source script: `scripts/generate-pack-sfx.mjs`
