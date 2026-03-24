import type { PackOpeningStyle } from '../components/pack/opening/types';

/**
 * Demo pack opening animation preset.
 * - `fifa`: cinematic stadium → burst → walkout
 * - `csgo`: horizontal scroll strip with weighted stop
 * - `hybrid`: short intro → strip → finale reveal
 */
export const DEFAULT_PACK_OPENING_STYLE: PackOpeningStyle = 'hybrid';
