/**
 * Deterministic images for MVP demos (no backend).
 */

const UNSPLASH = 'https://images.unsplash.com';

/**
 * Pack hero art — cycling Unsplash crops (TCG / collectibles vibe).
 */
const PACK_HERO_IMAGES: string[] = [
  `${UNSPLASH}/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&q=80&w=1200&h=600`,
  `${UNSPLASH}/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&q=80&w=1200&h=600`,
  `${UNSPLASH}/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200&h=600`,
  `${UNSPLASH}/photo-1535572290543-960a8046f5af?auto=format&fit=crop&q=80&w=1200&h=600`,
  `${UNSPLASH}/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1200&h=600`,
  `${UNSPLASH}/photo-1606335543042-57c525922933?auto=format&fit=crop&q=80&w=1200&h=600`,
  `${UNSPLASH}/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1200&h=600`,
  `${UNSPLASH}/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&q=80&w=1200&h=600`,
];

function seedToIndex(seed: string): number {
  const n = parseInt(seed, 10);
  if (Number.isFinite(n) && n > 0) {
    return (n - 1) % PACK_HERO_IMAGES.length;
  }
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h % PACK_HERO_IMAGES.length;
}

export function demoPackHeroImage(seed: string): string {
  return PACK_HERO_IMAGES[seedToIndex(seed)] ?? PACK_HERO_IMAGES[0];
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
