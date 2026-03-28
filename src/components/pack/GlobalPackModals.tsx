import React from 'react';
import { PackOpeningModal } from './PackOpeningModal';
import { WonPrizesModal } from './WonPrizesModal';
import { InsufficientCreditsModal } from '../shared/InsufficientCreditsModal';
import { SignupPromptModal } from '../onboarding/SignupPromptModal';

/**
 * Mounted once at app root so pack open / won prizes / credits modals work
 * from any tab (Home, Marketplace, etc.). Credit purchases use the Payment stack screen.
 */
export function GlobalPackModals() {
  return (
    <>
      {/* Pack opening first; insufficient credits after so it stacks above when both were briefly relevant */}
      <PackOpeningModal />
      <InsufficientCreditsModal />
      <WonPrizesModal />
      <SignupPromptModal />
    </>
  );
}
