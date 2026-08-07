/**
 * Single place for **user-facing** app name and demo flags.
 * Legal text for Terms / Privacy lives in `src/legal/inAppLegalCopy.ts` (in-app modals).
 * App Store submission: see `docs/MVP_PUBLISH_ORDER.md`.
 */
import packageJson from '../../package.json';

/** Shown in Account, demo banner, legal copy, etc. */
export const APP_DISPLAY_NAME = 'Pull Hub';

/**
 * Splits `APP_DISPLAY_NAME` for the header / pack art (e.g. "Pull Hub" → Pull + Hub).
 */
export function getAppLogoParts(): { primary: string; secondary: string | null } {
  const parts = APP_DISPLAY_NAME.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return { primary: parts[0], secondary: parts.slice(1).join(' ') };
  }
  return { primary: APP_DISPLAY_NAME, secondary: null };
}

/** Two-line wordmark: “Pull” + “Hub” styling — last word gets accent color in the header. */
export function getLogoWordmarkParts(): { lead: string; accent: string } | null {
  const parts = APP_DISPLAY_NAME.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return { lead: parts.slice(0, -1).join(' '), accent: parts[parts.length - 1]! };
  }
  return null;
}

/** Monogram for header badge (e.g. Pull Hub → PH). */
export function getLogoInitials(): string {
  const parts = APP_DISPLAY_NAME.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.[0];
    const b = parts[1]?.[0];
    if (a && b) return `${a}${b}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0]!.length >= 2) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return 'PH';
}

export const APP_VERSION = packageJson.version;
export const APP_SLUG = packageJson.name;

/** Help Center / Contact Support mailto target (replace before launch). */
export const SUPPORT_EMAIL = 'support@pullhub.app';

/** Public web origin for referral links (`?r=` username). */
export const PUBLIC_WEB_ORIGIN = 'https://pullhub.com';

/** If true, Buy Points is clearly labeled as mock (no real charges). */
export const CREDITS_ARE_MOCK = false;

/** Extra local Points in dev so catalog packs can be opened for animation/UI work. */
export const DEV_STARTER_CREDITS = __DEV__ ? 50_000 : 0;

/**
 * Local outcome generation is a development aid only. Production builds must
 * receive every pack result from the live finite-inventory engine.
 */
export const ENABLE_LOCAL_PACK_SIMULATION = __DEV__;

/**
 * Marketplace listings and checkout must come from verified seller inventory.
 * The current local listing catalog is a design fixture, so production keeps
 * the marketplace in a polished unavailable state until the live feed ships.
 */
export const MARKETPLACE_IS_LIVE = process.env.EXPO_PUBLIC_MARKETPLACE_LIVE === '1';

/** Promotion grants stay off until codes and referral rewards are server-owned. */
export const PROMOTIONS_ARE_LIVE = process.env.EXPO_PUBLIC_PROMOTIONS_LIVE === '1';

/** Paid membership stays informational until StoreKit and server entitlements are connected. */
export const MEMBERSHIP_IS_LIVE = process.env.EXPO_PUBLIC_MEMBERSHIP_LIVE === '1';

/** Friends, activity, and leaderboards stay hidden until profiles come from a verified service. */
export const SOCIAL_IS_LIVE = process.env.EXPO_PUBLIC_SOCIAL_LIVE === '1';

/** Shipping address collection stays off until storage, regions, and fulfillment are verified. */
export const SHIPPING_IS_LIVE = process.env.EXPO_PUBLIC_SHIPPING_LIVE === '1';

/** Wallet, payout, identity, and provider-linking rows are hidden until their services ship. */
export const ADVANCED_ACCOUNT_SERVICES_ARE_LIVE =
  process.env.EXPO_PUBLIC_ADVANCED_ACCOUNT_SERVICES_LIVE === '1';

/** Contact details are shown only when the inbox and response process are actively monitored. */
export const SUPPORT_IS_LIVE = process.env.EXPO_PUBLIC_SUPPORT_LIVE === '1';

/**
 * When true, seeds one sample incoming friend request so the Friends tab badge + requests UI
 * can be exercised without a backend. Turn off for production (or when `CREDITS_ARE_MOCK` is false).
 */
export const SHOW_DEMO_INCOMING_FRIEND_REQUEST = CREDITS_ARE_MOCK;

/**
 * When true (and Points are mock), the user must acknowledge the simulation notice once
 * (`SimulationDisclosure` modal). Top banner is disabled — use this for a cleaner layout.
 */
export const SHOW_SIMULATION_DISCLOSURE = CREDITS_ARE_MOCK;

/**
 * @deprecated Use `SHOW_SIMULATION_DISCLOSURE` + modal. Kept for older references.
 * When false, `DemoBanner` does not render.
 */
export const SHOW_DEMO_BANNER = false;

/** @deprecated Copy for legacy banner; modal uses i18n `demoSimulation.*`. */
export const DEMO_BANNER_TEXT = 'Preview build — Points and rewards are simulated.';
