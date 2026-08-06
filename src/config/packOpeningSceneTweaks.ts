/**
 * Optional query overrides appended to `opening-3d.html` by RingPackOpenFlow.
 * Keys must match CFG fields in `pack-ring-server/opening-3d.html`
 * (alias: `tearSensitivity` → `tearWidthCap`).
 *
 * Edit values here to tweak feel on device/simulator without rebuilding the HTML,
 * or leave empty and override via the scene URL directly, e.g.
 * `http://…:3000/opening-3d.html?embed=1&tearSensitivity=280&revealDelayMs=600`.
 */
export type PackOpeningSceneTweakKey =
  | 'tearSensitivity'
  | 'tearWidthFrac'
  | 'tearWidthCap'
  | 'rotScaleY'
  | 'rotScaleX'
  | 'rotXClamp'
  | 'flashOnOpen'
  | 'flashOnFlip'
  | 'flashDecay'
  | 'glowPeakScale'
  | 'burstOpenN'
  | 'burstFlipN'
  | 'camZMin'
  | 'camTyOpen'
  | 'camTyCenter'
  | 'revealDelayMs'
  | 'revealDelayReducedMs'
  | 'flapDur'
  | 'flipDur'
  | 'centerDur'
  | 'packExitDelayMs'
  | 'emergeDelayMs';

export type PackOpeningSceneTweaks = Partial<Record<PackOpeningSceneTweakKey, number>>;

/** Live tweak bag — empty by default. Set keys while iterating on device feel. */
export const PACK_OPENING_SCENE_TWEAKS: PackOpeningSceneTweaks = {
  // Example:
  // tearSensitivity: 320,
  // revealDelayMs: 800,
};

export function appendPackOpeningSceneTweaks(qs: URLSearchParams): void {
  for (const [key, value] of Object.entries(PACK_OPENING_SCENE_TWEAKS)) {
    if (value == null || Number.isNaN(value)) continue;
    qs.set(key, String(value));
  }
}
