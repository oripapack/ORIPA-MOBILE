import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getLocalizedPackTitle } from '../../i18n/packCopy';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';
import { Pull } from '../../data/mockUser';

type Props = { pull: Pull };

export function PullHistoryRow({ pull }: Props) {
  const { t, i18n } = useTranslation();

  return (
    <View style={styles.pullCard}>
      <View style={styles.pullLeft}>
        <Text style={styles.pullEmoji}>✨</Text>
        <View style={styles.pullTextCol}>
          <Text style={styles.pullResult} numberOfLines={2}>
            {pull.result}
          </Text>
          <Text style={styles.pullPack} numberOfLines={2} ellipsizeMode="tail">
            {getLocalizedPackTitle(pull.packId, pull.packTitle, t)}
          </Text>
        </View>
      </View>
      <View style={styles.pullRight}>
        <Text style={styles.pullCredits} numberOfLines={1}>
          {pull.fulfillment === 'shipped'
            ? t('rewards.shipped')
            : `+${pull.creditsWon.toLocaleString()}`}
        </Text>
        <Text style={styles.pullDate}>
          {pull.timestamp.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}
        </Text>
      </View>
    </View>
  );
}

/** Reused where we need “recent pulls” without the full row layout (e.g. compact list). */
export function useCompletedPullsSorted() {
  const pullHistory = useAppStore((s) => s.user.pullHistory);
  return useMemo(() => {
    const list = pullHistory.filter((p) => p.fulfillment !== 'pending');
    return [...list].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [pullHistory]);
}

const styles = StyleSheet.create({
  pullCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pullLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    paddingRight: spacing.xs,
  },
  pullTextCol: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  pullEmoji: {
    fontSize: 24,
    marginTop: 2,
  },
  pullResult: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    width: '100%',
  },
  pullPack: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    width: '100%',
  },
  pullRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
    flexGrow: 0,
    marginLeft: spacing.sm,
    minWidth: 124,
    paddingLeft: spacing.xs,
  },
  pullCredits: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.green,
    textAlign: 'right',
    width: '100%',
  },
  pullDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
