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

/** If true, Buy Credits is clearly labeled as mock (no real charges). */
export const CREDITS_ARE_MOCK = false;

/** Extra local credits in dev so catalog packs can be opened for animation/UI work. */
export const DEV_STARTER_CREDITS = __DEV__ ? 50_000 : 0;

/**
 * When true, seeds one sample incoming friend request so the Friends tab badge + requests UI
 * can be exercised without a backend. Turn off for production (or when `CREDITS_ARE_MOCK` is false).
 */
export const SHOW_DEMO_INCOMING_FRIEND_REQUEST = CREDITS_ARE_MOCK;

/**
 * When true (and credits are mock), the user must acknowledge the simulation notice once
 * (`SimulationDisclosure` modal). Top banner is disabled — use this for a cleaner layout.
 */
export const SHOW_SIMULATION_DISCLOSURE = CREDITS_ARE_MOCK;

/**
 * @deprecated Use `SHOW_SIMULATION_DISCLOSURE` + modal. Kept for older references.
 * When false, `DemoBanner` does not render.
 */
export const SHOW_DEMO_BANNER = false;

/** @deprecated Copy for legacy banner; modal uses i18n `demoSimulation.*`. */
export const DEMO_BANNER_TEXT = 'Preview build — credits & rewards are simulated.';
