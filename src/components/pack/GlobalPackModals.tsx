import React from 'react';
import { PackOpeningModal } from './PackOpeningModal';
import { WonPrizesModal } from './WonPrizesModal';
import { InsufficientCreditsModal } from '../shared/InsufficientCreditsModal';

/**
 * Mounted once at app root so pack open / won prizes / credits modals work
 * from any tab (Home, Marketplace, etc.). Credit purchases use the Payment stack screen.
 */
export function GlobalPackModals() {
  return (
    <>
      <InsufficientCreditsModal />
      <PackOpeningModal />
      <WonPrizesModal />
    </>
  );
}
