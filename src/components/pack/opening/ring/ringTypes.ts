import type { Pack } from '../../../../data/mockPacks';
import type { PackRollResult, RevealCard } from '../types';

export type RingPackOpenFlowProps = {
  pack: Pack;
  roll: PackRollResult;
  revealCard: RevealCard;
  skipNonce: number;
  onRevealDone: () => void;
  onStoreInVault?: () => void;
};
