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
  const gap = 14;
  const slotW = packW + gap;
  const len = 34 + (sessionSalt % 11);
  const winIndex = 16 + (sessionSalt % 9);

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
