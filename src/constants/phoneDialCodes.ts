/** Dial options for phone input (English labels; expand as needed). */

export type DialCodeOption = {
  id: string;
  name: string;
  /** E.164 prefix including + */
  dial: string;
  flag: string;
};

export const DEFAULT_DIAL_CODE_ID = 'US';

/** US first; rest A–Z by country name. */
export const PHONE_DIAL_CODES: DialCodeOption[] = [
  { id: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
  { id: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
  { id: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
  { id: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷' },
  { id: 'CN', name: 'China', dial: '+86', flag: '🇨🇳' },
  { id: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
  { id: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
  { id: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { id: 'HK', name: 'Hong Kong', dial: '+852', flag: '🇭🇰' },
  { id: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
  { id: 'ID', name: 'Indonesia', dial: '+62', flag: '🇮🇩' },
  { id: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹' },
  { id: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
  { id: 'KR', name: 'South Korea', dial: '+82', flag: '🇰🇷' },
  { id: 'MY', name: 'Malaysia', dial: '+60', flag: '🇲🇾' },
  { id: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽' },
  { id: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱' },
  { id: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿' },
  { id: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭' },
  { id: 'PL', name: 'Poland', dial: '+48', flag: '🇵🇱' },
  { id: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬' },
  { id: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸' },
  { id: 'TW', name: 'Taiwan', dial: '+886', flag: '🇹🇼' },
  { id: 'TH', name: 'Thailand', dial: '+66', flag: '🇹🇭' },
  { id: 'VN', name: 'Vietnam', dial: '+84', flag: '🇻🇳' },
];

export function dialOptionById(id: string): DialCodeOption | undefined {
  return PHONE_DIAL_CODES.find((c) => c.id === id);
}
