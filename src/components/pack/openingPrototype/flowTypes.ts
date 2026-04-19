import type { PackRollResult, RevealCard, RevealRarity } from '../opening/types';

/**
 * Explicit phases for the lineup → rip → reveal prototype.
 * Easy to rename or insert steps when productizing.
 */
export type PrototypePackFlowPhase =
  | 'carousel'
  | 'selecting'
  | 'centered'
  | 'ripping'
  | 'reveal';

export type PrototypePackOpenFlowProps = {
  roll: PackRollResult;
  revealCard: RevealCard;
  revealRarity: RevealRarity;
  packTint: string;
  packFaceTitle?: string;
  sessionSalt: number;
  replayKey: number;
  skipNonce: number;
  onRevealDone: () => void;
  onStoreInVault?: () => void;
  onSharePull?: () => void;
};
