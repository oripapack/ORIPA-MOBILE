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

/** NANP: strip accidental leading 1 when user pastes full national number. */
export function nationalDigitsOnly(dialDigits: string, nationalRaw: string): string {
  let n = nationalRaw.replace(/\D/g, '');
  if (dialDigits === '1' && n.length === 11 && n.startsWith('1')) {
    n = n.slice(1);
  }
  return n;
}

/**
 * Build E.164 from country dial (e.g. `+1`) and local digits only (no country code in `nationalRaw`).
 */
export function toE164FromDialAndNational(dialCode: string, nationalRaw: string): string {
  const dial = dialCode.trim().startsWith('+') ? dialCode.trim() : `+${dialCode.trim()}`;
  const dialDigits = dial.replace(/\D/g, '');
  const nationalDigits = nationalDigitsOnly(dialDigits, nationalRaw);
  if (!dialDigits || !nationalDigits) return '';
  return `+${dialDigits}${nationalDigits}`;
}

/** NANP (+1): 10-digit national; others: E.164 length 10–15. */
export function isValidNationalForDial(dialCode: string, nationalRaw: string): boolean {
  const dial = dialCode.trim().startsWith('+') ? dialCode.trim() : `+${dialCode.trim()}`;
  const dialDigits = dial.replace(/\D/g, '');
  const nationalDigits = nationalDigitsOnly(dialDigits, nationalRaw);
  if (!nationalDigits) return false;
  if (dialDigits === '1') {
    return nationalDigits.length === 10;
  }
  const e164 = toE164FromDialAndNational(dialCode, nationalRaw);
  return isValidE164Length(e164);
}

/** ITU E.164: 10–15 digits total (inclusive of country code). */
export function isValidE164Length(e164: string): boolean {
  const d = e164.replace(/\D/g, '');
  return d.length >= 10 && d.length <= 15;
}

export function hasVerifiedPhone(user: {
  phoneNumbers?: Array<{ verification?: { status?: string | null } }>;
} | null | undefined): boolean {
  if (!user?.phoneNumbers?.length) return false;
  return user.phoneNumbers.some((p) => p.verification?.status === 'verified');
}
