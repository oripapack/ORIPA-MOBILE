import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { CollectorQuestDef } from '../../data/collectorQuests';
import { sg } from '../../tokens/sg';
import { fontSize } from '../../tokens/typography';
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
    borderBottomColor: sg.line,
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
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  questTitle: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    lineHeight: 20,
  },
  questDesc: {
    fontSize: fontSize.xs,
    color: sg.muted,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  questMetaRow: { gap: 6 },
  miniTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: sg.surface2,
    overflow: 'hidden',
  },
  miniFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: sg.gold,
  },
  questMeta: {
    fontSize: 10,
    fontFamily: sg.font.dataBold,
    color: sg.muted,
    letterSpacing: 0.3,
    fontVariant: [...sg.numeric],
  },
  claimBtn: {
    backgroundColor: sg.surface2,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  claimBtnText: {
    color: sg.text,
    fontSize: 10,
    fontFamily: sg.font.dataBold,
    fontVariant: [...sg.numeric],
  },
  claimedPill: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    paddingVertical: 6,
  },
});
