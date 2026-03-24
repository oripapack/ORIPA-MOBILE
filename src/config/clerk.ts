/** Set `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env` (see `.env.example`). */
export const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

export const isClerkEnabled = CLERK_PUBLISHABLE_KEY.trim().length > 0;

/**
 * When true, signed-in users must pass `LinkPhoneScreen` (SMS) before the app.
 * Disable until Clerk Phone / SMS is enabled on your subscription.
 */
export const requirePhoneVerification = false;
