/**
 * Premium reveal visuals: stage + surfaces (decoupled from motion / phase logic).
 */
export const HERO_STAGE = {
  /** Cool key light — not purple; reads as studio steel + ink */
  keyLight: 'rgba(148, 163, 184, 0.14)',
  keyLightStrong: 'rgba(226, 232, 240, 0.22)',
  floorShadow: 'rgba(2, 6, 23, 0.92)',
  edgeFalloff: 'rgba(0, 0, 0, 0.78)',
  /** Ambient leak: neutral moonlight, rarity accents layered separately */
  leakCore: 'rgba(241, 245, 249, 0.07)',
  leakRim: 'rgba(148, 163, 184, 0.12)',
};

export const HERO_PACK = {
  faceGradientTop: '#0f1419',
  faceGradientBottom: '#06090c',
  foilGloss: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.07)', 'rgba(255,255,255,0)'] as const,
  edgeHighlight: 'rgba(255,255,255,0.22)',
  edgeShadow: 'rgba(0,0,0,0.45)',
  spine: 'rgba(15, 23, 42, 0.9)',
};

export const HERO_CARD_STOCK = {
  frameOuter: '#0a0c0e',
  frameBevel: 'rgba(255,255,255,0.12)',
  stock: '#080a0c',
  artMatte: 'rgba(0,0,0,0.35)',
  nameplate: 'rgba(248, 250, 252, 0.96)',
  micro: 'rgba(148, 163, 184, 0.95)',
};
