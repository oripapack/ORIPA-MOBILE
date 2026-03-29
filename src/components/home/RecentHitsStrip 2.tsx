import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';
import { mockRecentHits } from '../../data/mockRecentHits';
import { VaultFramedCard } from '../shared/VaultFramedCard';

export function RecentHitsStrip() {
  const { t } = useTranslation();
  return (
    <VaultFramedCard style={styles.outer} contentStyle={styles.cardContent}>
      <View style={styles.head}>
        <View style={styles.dot} />
        <Text style={styles.kicker}>{t('home.lobby.recentKicker')}</Text>
      </View>
      <View style={styles.list}>
        {mockRecentHits.map((h) => (
          <View key={h.id} style={styles.row}>
            <Text style={styles.rowMain} numberOfLines={1}>
              <Text style={styles.user}>@{h.user}</Text>
              <Text style={styles.sep}> · </Text>
              <Text style={styles.pull}>{h.pull}</Text>
            </Text>
            <Text style={styles.pack} numberOfLines={1}>
              {h.packTitle}
            </Text>
          </View>
        ))}
      </View>
    </VaultFramedCard>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: spacing.base,
    marginTop: spacing.lg,
  },
  cardContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingRight: spacing.lg,
    paddingLeft: spacing.lg + 6,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
    opacity: 0.7,
  },
  kicker: {
    fontSize: 9,
    fontWeight: fontWeight.black,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  list: {
    gap: 10,
  },
  row: {
    gap: 2,
  },
  rowMain: {
    fontSize: fontSize.sm,
  },
  user: {
    fontWeight: fontWeight.black,
    color: colors.textSecondary,
  },
  sep: {
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
  },
  pull: {
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  pack: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
});
