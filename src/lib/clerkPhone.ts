/**
 * Helpers for Clerk phone verification (add-phone flow, not phone sign-in).
 */

export function normalizeE164(input: string): string {
  const s = input.trim();
  if (!s) return '';
  const body = s.startsWith('+') ? s.slice(1) : s;
  const digits = body.replace(/\D/g, '');
  return digits ? `+${digits}` : '';
}

export function hasVerifiedPhone(user: {
  phoneNumbers?: Array<{ verification?: { status?: string | null } }>;
} | null | undefined): boolean {
  if (!user?.phoneNumbers?.length) return false;
  return user.phoneNumbers.some((p) => p.verification?.status === 'verified');
}
