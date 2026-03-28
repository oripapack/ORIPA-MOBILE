/**
 * Deterministic images for MVP demos (no backend).
 */

const UNSPLASH = 'https://images.unsplash.com';

/**
 * Pack hero art — two images only:
 * 1) Same as New User Welcome Pack — TCG spread on table.
 * 2) Framed Pokémon cards on wood (https://unsplash.com/photos/...-TWCnHKKhqSo).
 */
const PACK_HERO_IMAGES: string[] = [
  `${UNSPLASH}/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&q=80&w=1200&h=600`,
  `${UNSPLASH}/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&q=80&w=1200&h=600`,
];

export function demoPackHeroImage(seed: string): string {
  const n = parseInt(seed, 10);
  const idx = Number.isFinite(n) ? Math.max(0, n - 1) % PACK_HERO_IMAGES.length : 0;
  return PACK_HERO_IMAGES[idx] ?? PACK_HERO_IMAGES[0];
}

/**
 * Deterministic square placeholder for marketplace listing thumbs. 
 * `marketplace.ts` uses explicit Unsplash URLs per listing; keep this for tests or quick demos.
 */
export function demoListingThumb(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(`ml-${seed}`)}/512/512`;
}

/** Home welcome banner (behind gradients in HeroBanner). */
export const demoHomeHeroBackground =
  `${UNSPLASH}/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&q=80&w=1400&h=500`;

/**
 * Marketplace “shipping / promo” strip (see MarketplaceScreen promo banner).
 * GEMINI_IMAGE_PROMPT: Small lifestyle or logistics visual — e.g. parcel box with collectible tape,
 * courier van iconography, or hands handing over a sealed card mailer; clean, trust-first, not cluttered.
 */
export const demoMarketplacePromoImage =
  'https://images.unsplash.com/photo-1620455805821-742f3fdb36ca?auto=format&fit=crop&q=80&w=900&h=400';
