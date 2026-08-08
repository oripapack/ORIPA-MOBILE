/**
 * When true, Open Pack does not require Clerk sign-in.
 * Development builds only. Production web and native builds use the same
 * account gate so users never enter an opening they cannot save or fulfill.
 *
 * Guests still don't persist pulls to vault; signup prompt can still show after.
 */
export const canOpenPackWithoutSignIn = __DEV__;
