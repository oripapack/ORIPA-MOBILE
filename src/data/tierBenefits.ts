/** Placeholder tier ladder — replace with product / live config later. */
export type AppTier = 'Starter' | 'Bronze' | 'Silver' | 'Gold';

export type TierBenefitRow = {
  tier: AppTier;
  minXp: number;
  /** Short bullets shown in the tier benefits screen. */
  perks: string[];
};

export const TIER_BENEFITS: TierBenefitRow[] = [
  {
    tier: 'Starter',
    minXp: 0,
    perks: [
      'Standard pack browse & open',
      'Marketplace access',
      'Base earn rate on XP from pulls',
    ],
  },
  {
    tier: 'Bronze',
    minXp: 10_000,
    perks: [
      'Everything in Starter',
      '+2% bonus credits on credit bundle purchases (demo)',
      'Priority support queue (demo)',
    ],
  },
  {
    tier: 'Silver',
    minXp: 50_000,
    perks: [
      'Everything in Bronze',
      'Free shipping on eligible marketplace orders over $75 (demo)',
      'Monthly “member pick” pack drop (demo)',
    ],
  },
  {
    tier: 'Gold',
    minXp: 150_000,
    perks: [
      'Everything in Silver',
      '+5% bonus credits on credit bundle purchases (demo)',
      'Early access to select hot drops (demo)',
      'Dedicated account tier badge & profile flair (demo)',
    ],
  },
];
