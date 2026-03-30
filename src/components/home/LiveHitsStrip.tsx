import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { mockLiveHits } from '../../data/mockRecentHits';
import { formatUsd } from '../../lib/socialFormat';
import { rarityColor, rarityLabel } from '../social/rarityStyles';

const CARD_W = 268;

export function LiveHitsStrip() {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View style={styles.dot} />
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
            <Text style={styles.pack} numberOfLines={1}>
              {h.packTitle}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
    opacity: 0.75,
  },
  kicker: {
    fontSize: 9,
    fontWeight: fontWeight.black,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  scroll: {
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xs,
  },
  card: {
    width: CARD_W,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.08)',
  },
  user: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  pull: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    lineHeight: 18,
    minHeight: 36,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: 6,
  },
  val: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: colors.casinoGold,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    backgroundColor: 'rgba(2,6,23,0.35)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: fontWeight.black,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  pack: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
});
