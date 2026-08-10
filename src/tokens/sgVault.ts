/** C-13 Vault / trade-in surface variant registered in design-system N2 S-3. */
import { sg } from './sg';

export const sgVault = {
  ...sg,
  bg: '#0B0E11',
  surface: '#14181D',
  line: '#262E36',
  /** Positive / holdings delta only; never a CTA fill. */
  up: sg.success,
} as const;
