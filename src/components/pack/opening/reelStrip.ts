export type ReelShell = {
  key: string;
  tint: string;
};

const VARIANT_TINTS = [
  '#1e3a5f',
  '#2d1f3d',
  '#0f2f32',
  '#3d2a1f',
  '#1a2840',
  '#252045',
  '#0d2d28',
] as const;

/**
 * Deterministic reel strip: one slot matches the real pack tint at `winIndex`.
 * Presentation only — does not affect roll outcome.
 */
export function buildReelShells(sessionSalt: number, winTint: string): {
  shells: ReelShell[];
  winIndex: number;
  slotW: number;
  packW: number;
} {
  const packW = 82;
  /** Wide gaps so the ring reads as separate packs — open space shows depth, not “see-through” faces. */
  const gap = 52;
  const slotW = packW + gap;
  /** Fewer shells than before; spacing does most of the work for a lighter carousel. */
  const len = 26 + (sessionSalt % 7);
  const winIndex = 11 + (sessionSalt % 9);

  const shells: ReelShell[] = [];
  for (let i = 0; i < len; i += 1) {
    if (i === winIndex) {
      shells.push({ key: `w-${i}`, tint: winTint });
    } else {
      const tint = VARIANT_TINTS[(sessionSalt + i * 13) % VARIANT_TINTS.length];
      shells.push({ key: `d-${i}`, tint });
    }
  }

  return { shells, winIndex, slotW, packW };
}
