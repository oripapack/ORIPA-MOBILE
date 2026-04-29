import type { PackOpeningStyle } from '../components/pack/opening/types';

/**
 * Demo pack opening animation preset.
 * - `fifa`: cinematic stadium → burst → walkout
 * - `csgo`: horizontal scroll strip with weighted stop
 * - `hybrid`: short intro → strip → finale reveal
 */
export const DEFAULT_PACK_OPENING_STYLE: PackOpeningStyle = 'hybrid';

/**
 * When true, `PackOpeningModal` uses the internal lineup → rip prototype instead of `PackOpeningEngine`.
 * Set false to return to the classic reel + hero flow.
 */
export const USE_PROTOTYPE_LINEUP_PACK_OPEN = true;

/**
 * When true, `PackOpeningModal` uses the Pokémon TCG Pocket-style swipe-to-tear flow.
 * Takes precedence over `USE_PROTOTYPE_LINEUP_PACK_OPEN`.
 */
export const USE_POKEPOKE_PACK_OPEN = false;

/**
 * Prototype rip step: `'tap'` = single tap opens with a clean vertical peel (matches the seam).
 * `'slash'` = swipe trail + hinge (trail is decorative; true slice-through-art is not modeled).
 */
export type PrototypePackRipGesture = 'slash' | 'tap';

export const PROTOTYPE_PACK_RIP_GESTURE: PrototypePackRipGesture = 'tap';

/**
 * Ignore rip gestures for this long after the rip step mounts so the finger-up from
 * picking a pack in the carousel cannot register as a tap/slash on the tear step.
 */
export const PROTOTYPE_RIP_GESTURE_GUARD_MS = 420;
