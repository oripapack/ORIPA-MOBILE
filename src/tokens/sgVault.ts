/** Inventory console variant of the Tokyo Night Terminal skin. */
import { sg } from './sg';

export const sgVault = {
  ...sg,
  bg: '#080E19',
  surface: '#101B2B',
  surface2: '#17253A',
  line: '#2A3B55',
  /** Positive / holdings delta only; never a CTA fill. */
  up: sg.success,
} as const;
