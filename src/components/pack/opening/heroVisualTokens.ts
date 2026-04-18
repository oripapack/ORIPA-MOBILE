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
  /** Deeper ink → cold highlight (liquid glass stage) */
  faceGradientTop: '#0a1628',
  faceGradientMid: '#071018',
  faceGradientBottom: '#020617',
  /** Prism foil sweep — reads “premium chase” on a dark sleeve */
  foilGloss: [
    'rgba(255,255,255,0)',
    'rgba(56, 189, 248, 0.12)',
    'rgba(255, 255, 255, 0.08)',
    'rgba(192, 132, 252, 0.09)',
    'rgba(45, 212, 191, 0.06)',
    'rgba(255, 255, 255, 0)',
  ] as const,
  /** Secondary sweep — caustic “lens” leak */
  causticSheen: [
    'rgba(255,255,255,0)',
    'rgba(224, 242, 254, 0.07)',
    'rgba(255,255,255,0.04)',
    'rgba(167, 139, 250, 0.05)',
    'rgba(255,255,255,0)',
  ] as const,
  edgeHighlight: 'rgba(255,255,255,0.26)',
  edgeShadow: 'rgba(0,0,0,0.45)',
  spine: 'rgba(15, 23, 42, 0.9)',
  holoRail: 'rgba(125, 211, 252, 0.22)',
  holoRailAlt: 'rgba(244, 114, 182, 0.12)',
  /** SVG liquid blobs (radial stops) */
  liquidBlobA: 'rgba(56, 189, 248, 0.22)',
  liquidBlobB: 'rgba(167, 139, 250, 0.14)',
  liquidBlobC: 'rgba(45, 212, 191, 0.1)',
  liquidFlow: 'rgba(186, 230, 253, 0.35)',
  liquidFlowAlt: 'rgba(244, 114, 182, 0.2)',
  glassVeil: 'rgba(248, 250, 252, 0.06)',
  glassRim: 'rgba(255, 255, 255, 0.14)',
};

export const HERO_CARD_STOCK = {
  frameOuter: '#0a0c0e',
  frameBevel: 'rgba(255,255,255,0.12)',
  stock: '#080a0c',
  artMatte: 'rgba(0,0,0,0.35)',
  nameplate: 'rgba(248, 250, 252, 0.96)',
  micro: 'rgba(148, 163, 184, 0.95)',
};
