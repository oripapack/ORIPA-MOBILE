import { APP_DISPLAY_NAME, SUPPORT_EMAIL } from './app';

function publicValue(value: string | undefined): string {
  return (value ?? '').trim();
}

/**
 * Public legal identity embedded in the client at build time.
 * Production release gates require explicit values; fallbacks exist only so local
 * development remains usable before counsel and the operating entity sign off.
 */
export const LEGAL_ENTITY_NAME =
  publicValue(process.env.EXPO_PUBLIC_LEGAL_ENTITY_NAME) || `${APP_DISPLAY_NAME} operator`;

export const LEGAL_CONTACT_EMAIL =
  publicValue(process.env.EXPO_PUBLIC_LEGAL_CONTACT_EMAIL) || SUPPORT_EMAIL;

export const PRIVACY_POLICY_URL = publicValue(process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL);

export const SUPPORT_URL = publicValue(process.env.EXPO_PUBLIC_SUPPORT_URL);
