/** Dial options for phone input (English labels; expand as needed). */

export type DialCodeOption = {
  id: string;
  name: string;
  /** E.164 prefix including + */
  dial: string;
};

export const DEFAULT_DIAL_CODE_ID = 'US';

/** US first; rest A–Z by country name. */
export const PHONE_DIAL_CODES: DialCodeOption[] = [
  { id: 'US', name: 'United States', dial: '+1' },
  { id: 'CA', name: 'Canada', dial: '+1' },
  { id: 'AU', name: 'Australia', dial: '+61' },
  { id: 'BR', name: 'Brazil', dial: '+55' },
  { id: 'CN', name: 'China', dial: '+86' },
  { id: 'FR', name: 'France', dial: '+33' },
  { id: 'DE', name: 'Germany', dial: '+49' },
  { id: 'GB', name: 'United Kingdom', dial: '+44' },
  { id: 'HK', name: 'Hong Kong', dial: '+852' },
  { id: 'IN', name: 'India', dial: '+91' },
  { id: 'ID', name: 'Indonesia', dial: '+62' },
  { id: 'IT', name: 'Italy', dial: '+39' },
  { id: 'JP', name: 'Japan', dial: '+81' },
  { id: 'KR', name: 'South Korea', dial: '+82' },
  { id: 'MY', name: 'Malaysia', dial: '+60' },
  { id: 'MX', name: 'Mexico', dial: '+52' },
  { id: 'NL', name: 'Netherlands', dial: '+31' },
  { id: 'NZ', name: 'New Zealand', dial: '+64' },
  { id: 'PH', name: 'Philippines', dial: '+63' },
  { id: 'PL', name: 'Poland', dial: '+48' },
  { id: 'SG', name: 'Singapore', dial: '+65' },
  { id: 'ES', name: 'Spain', dial: '+34' },
  { id: 'TW', name: 'Taiwan', dial: '+886' },
  { id: 'TH', name: 'Thailand', dial: '+66' },
  { id: 'VN', name: 'Vietnam', dial: '+84' },
];

export function dialOptionById(id: string): DialCodeOption | undefined {
  return PHONE_DIAL_CODES.find((c) => c.id === id);
}
