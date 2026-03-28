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

export const APP_VERSION = packageJson.version;
export const APP_SLUG = packageJson.name;

/** Help Center / Contact Support mailto target (replace before launch). */
export const SUPPORT_EMAIL = 'support@pullhub.app';

/** Public web origin for referral links (`?r=` username). */
export const PUBLIC_WEB_ORIGIN = 'https://pullhub.com';

/** If true, Buy Credits is clearly labeled as mock (no real charges). */
export const CREDITS_ARE_MOCK = true;

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
