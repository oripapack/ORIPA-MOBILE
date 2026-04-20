import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { CollectorQuestDef } from '../../data/collectorQuests';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

type QuestProgress = { progress: number; claimed: boolean };

type Props = {
  def: CollectorQuestDef;
  row: QuestProgress | undefined;
  onClaim: (id: string) => void;
  /** Tighter spacing when embedded in profile snapshot */
  compact?: boolean;
  /** Last row in a list — drops bottom border */
  isLast?: boolean;
};

export function CollectorQuestRow({ def, row, onClaim, compact, isLast }: Props) {
  const { t } = useTranslation();
  const progress = row?.progress ?? 0;
  const claimed = row?.claimed ?? false;
  const done = progress >= def.target;
  const pct = Math.min(100, Math.round((progress / def.target) * 100));

  return (
    <View style={[styles.questRow, compact && styles.questRowCompact, isLast && styles.questRowLast]}>
      <View style={styles.questTop}>
        <View style={styles.questTitleCol}>
          <Text style={styles.kindPill}>
            {def.kind === 'daily' ? t('progression.questKindDaily') : t('progression.questKindWeekly')}
          </Text>
          <Text style={styles.questTitle}>{t(`quests.${def.titleKey}.title`)}</Text>
        </View>
        {done && !claimed ? (
          <TouchableOpacity style={styles.claimBtn} onPress={() => onClaim(def.id)} accessibilityRole="button">
            <Text style={styles.claimBtnText}>{t('progression.claimXp', { xp: def.xpReward })}</Text>
          </TouchableOpacity>
        ) : claimed ? (
          <Text style={styles.claimedPill}>{t('progression.claimed')}</Text>
        ) : null}
      </View>
      {!compact ? <Text style={styles.questDesc}>{t(`quests.${def.titleKey}.desc`)}</Text> : null}
      <View style={styles.questMetaRow}>
        <View style={styles.miniTrack}>
          <View style={[styles.miniFill, { width: `${pct}%` as `${number}%` }]} />
        </View>
        <Text style={styles.questMeta}>
          {t('progression.questProgress', { current: progress, target: def.target })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  questRow: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  questRowCompact: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
  },
  questRowLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  questTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: 4,
  },
  questTitleCol: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  kindPill: {
    alignSelf: 'flex-start',
    fontSize: 9,
    fontFamily: brandFont.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  questTitle: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  questDesc: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  questMetaRow: { gap: 6 },
  miniTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  miniFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accentDark,
  },
  questMeta: {
    fontSize: 10,
    fontFamily: brandFont.bold,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  claimBtn: {
    backgroundColor: colors.nearBlack,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  claimBtnText: {
    color: colors.white,
    fontSize: 10,
    fontFamily: brandFont.bold,
  },
  claimedPill: {
    fontSize: 10,
    fontFamily: brandFont.bold,
    color: colors.textMuted,
    paddingVertical: 6,
  },
});
