/**
 * Pack opening (x1) uses the HTML Three.js scene served from
 * `pack-ring-server/opening-3d.html` via WebView/iframe (`RingPackOpenFlow`).
 * Scene feel knobs live in that HTML's top-level `CFG` (URL overrides supported);
 * optional app-side defaults: `src/config/packOpeningSceneTweaks.ts`.
 * Bulk opens use Reanimated `BulkOpenCinematic` instead.
 *
 * Prototype rip helpers below remain for legacy sandbox components only.
 */
export type PrototypePackRipGesture = 'slash' | 'tap';

export const PROTOTYPE_PACK_RIP_GESTURE: PrototypePackRipGesture = 'tap';

export const PROTOTYPE_RIP_GESTURE_GUARD_MS = 420;
