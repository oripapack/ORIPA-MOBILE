import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { RarityTier } from '../../../shared/types/pack';
import { ph } from '../../tokens/phTheme';
import { brandFont, fontSize } from '../../tokens/typography';

const RARITY_LABEL: Record<RarityTier, string> = {
  base: 'Base',
  epic: 'Epic',
  legendary: 'Legendary',
  mythic: 'Mythic',
};

export function RarityBadge({ rarity, small }: { rarity: RarityTier; small?: boolean }) {
  return (
    <View style={[styles.badge, { backgroundColor: ph.rarityBg[rarity], borderColor: ph.rarityBorder[rarity] }, small && styles.small]}>
      <View style={[styles.dot, { backgroundColor: ph.rarity[rarity] }]} />
      <Text style={[styles.text, { color: ph.rarity[rarity] }, small && styles.textSmall]}>
        {RARITY_LABEL[rarity]}
      </Text>
    </View>
  );
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
      <Text style={[styles.statusText, variant === 'success' && { color: ph.green }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: ph.radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  small: { paddingHorizontal: 8, paddingVertical: 2 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: {
    fontSize: 10,
    fontFamily: brandFont.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  textSmall: { fontSize: 9 },
  statusText: { fontSize: 10, fontFamily: brandFont.bold, color: ph.textSec, textTransform: 'uppercase' },
  success: { backgroundColor: ph.greenSoft, borderColor: ph.greenBorder },
  warning: { backgroundColor: ph.redSoft, borderColor: ph.redBorder },
  featured: { backgroundColor: ph.rarityBg.epic, borderColor: ph.rarityBorder.epic },
  neutral: { backgroundColor: ph.surface, borderColor: ph.border },
});
