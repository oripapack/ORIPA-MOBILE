import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { RarityTier } from '../../../shared/types/pack';
import { sg } from '../../tokens/sg';
import { SgTierTag } from '../ui/SgTierTag';
import type { N2TierState } from '../../lib/n2Rarity';

const LEGACY_TIER: Record<RarityTier, N2TierState> = {
  common: 'base',
  rare: 'unknown',
  epic: 'epic',
  legendary: 'legendary',
  mythic: 'mythic',
};

/** @deprecated Use SgTierTag with an explicit N2 tier at the call site. */
export function RarityBadge({ rarity, small: _small }: { rarity: RarityTier; small?: boolean }) {
  return <SgTierTag tier={LEGACY_TIER[rarity]} context="badge" />;
}

export function StatusBadge({
  children,
  variant = 'neutral',
}: {
  children: string;
  variant?: 'success' | 'warning' | 'featured' | 'neutral';
}) {
  const variantStyle =
    variant === 'success' ? styles.success
    : variant === 'warning' ? styles.warning
    : variant === 'featured' ? styles.featured
    : styles.neutral;
  return (
    <View style={[styles.badge, variantStyle]}>
      <Text style={[styles.statusText, variant === 'success' && styles.successText, variant === 'warning' && styles.warningText]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: sg.radius.tag,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusText: { fontSize: 10, fontFamily: sg.font.bodyBold, color: sg.muted, textTransform: 'uppercase' },
  successText: { color: sg.success },
  warningText: { color: sg.warning },
  success: { backgroundColor: sg.surface2, borderColor: sg.success },
  warning: { backgroundColor: sg.surface2, borderColor: sg.warning },
  featured: { backgroundColor: sg.surface2, borderColor: sg.gold },
  neutral: { backgroundColor: sg.surface, borderColor: sg.line },
});
