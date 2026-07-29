/**
 * N2 §10 FINTECH VAULT skin — Vault / buyback surfaces only.
 * Trust chassis (gold = price/CTA, text hierarchy) stays; bg/surface/line/up differ.
 */
import { sg } from './sg';

export const sgVault = {
  ...sg,
  bg: '#0B0E11',
  surface: '#14181D',
  surface2: '#1A2026',
  line: '#262E36',
  /** Positive / holdings delta — Vault skin only; never as a CTA fill. */
  up: '#3DDC97',
} as const;
