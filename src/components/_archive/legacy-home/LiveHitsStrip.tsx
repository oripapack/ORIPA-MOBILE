import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { mockLiveHits } from '../../data/mockRecentHits';
import { formatUsd } from '../../lib/socialFormat';
import { rarityColor, rarityLabel } from '../social/rarityStyles';

/** Compact social proof — white cards, same radius/border as Discover rails */
const CARD_W = 198;

export function LiveHitsStrip() {
  const { t } = useTranslation();
  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <View style={styles.liveDot} />
        <Text style={styles.kicker}>{t('home.lobby.liveHitsKicker')}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {mockLiveHits.map((h) => (
          <View key={h.id} style={styles.card}>
            <Text style={styles.user} numberOfLines={1}>
              @{h.user}
            </Text>
            <Text style={styles.pull} numberOfLines={2}>
              {h.pull}
            </Text>
            <View style={styles.row}>
              <Text style={styles.val}>{formatUsd(h.value)}</Text>
              <View style={[styles.badge, { borderColor: rarityColor(h.rarity) }]}>
                <Text style={[styles.badgeText, { color: rarityColor(h.rarity) }]}>
                  {rarityLabel(h.rarity)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingBottom: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.base,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.red,
    opacity: 0.65,
  },
  kicker: {
    fontSize: 10,
    fontFamily: brandFont.semibold,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  scroll: {
    gap: 12,
    paddingHorizontal: spacing.base,
    paddingBottom: 2,
  },
  card: {
    width: CARD_W,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  user: {
    fontSize: 11,
    fontFamily: brandFont.medium,
    color: colors.textMuted,
    marginBottom: 4,
  },
  pull: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: colors.textPrimary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  val: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: colors.textPrimary,
    flex: 1,
    letterSpacing: -0.2,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: colors.surfaceMuted,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: brandFont.semibold,
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
});
