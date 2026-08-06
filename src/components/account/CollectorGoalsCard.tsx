import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { sg } from '../../tokens/sg';
import { fontSize } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';
import { VaultFramedCard } from '../shared/VaultFramedCard';
import { COLLECTOR_QUESTS } from '../../data/collectorQuests';
import { useAppStore } from '../../store/useAppStore';
import { CollectorQuestRow } from './CollectorQuestRow';

/**
 * Full streak + quest lists (e.g. legacy embed). Player tab uses {@link CollectorQuestsScreen} + snapshot.
 */
export function CollectorGoalsCard() {
  const { t } = useTranslation();
  const streak = useAppStore((s) => s.collectorStreakDays);
  const best = useAppStore((s) => s.collectorStreakBest);
  const questProgress = useAppStore((s) => s.collectorQuestProgress);
  const claimQuest = useAppStore((s) => s.claimCollectorQuest);

  const onClaim = useCallback(
    (id: string) => {
      claimQuest(id);
    },
    [claimQuest],
  );

  const dailies = COLLECTOR_QUESTS.filter((q) => q.kind === 'daily');
  const weeklies = COLLECTOR_QUESTS.filter((q) => q.kind === 'weekly');

  return (
    <VaultFramedCard style={styles.card} contentStyle={styles.inner}>
      <Text style={styles.sectionEyebrow}>{t('progression.streakEyebrow')}</Text>
      <View style={styles.streakRow}>
        <View style={styles.streakMain}>
          <Text style={styles.streakVal}>{streak}</Text>
          <Text style={styles.streakLab}>{t('progression.streakDaysLabel')}</Text>
        </View>
        <View style={styles.streakDivider} />
        <View style={styles.streakSide}>
          <Text style={styles.streakBestLab}>{t('progression.streakBest')}</Text>
          <Text style={styles.streakBestVal}>{best}</Text>
        </View>
      </View>
      <Text style={styles.streakFine}>{t('progression.streakFine')}</Text>

      <Text style={[styles.sectionEyebrow, styles.questsEyebrow]}>{t('progression.questsDaily')}</Text>
      {dailies.map((q) => (
        <CollectorQuestRow key={q.id} def={q} row={questProgress[q.id]} onClaim={onClaim} />
      ))}

      <Text style={[styles.sectionEyebrow, styles.questsEyebrow]}>{t('progression.questsWeekly')}</Text>
      <Text style={styles.questsHint}>{t('progression.questsResetHint')}</Text>
      {weeklies.map((q) => (
        <CollectorQuestRow key={q.id} def={q} row={questProgress[q.id]} onClaim={onClaim} />
      ))}
    </VaultFramedCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.base },
  inner: { padding: spacing.lg, gap: 0 },
  sectionEyebrow: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  questsEyebrow: { marginTop: spacing.lg },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  streakMain: { flex: 1 },
  streakVal: {
    fontSize: fontSize.hero,
    fontFamily: sg.font.dataBold,
    fontVariant: [...sg.numeric],
    color: sg.text,
    letterSpacing: -1,
  },
  streakLab: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    marginTop: 2,
  },
  streakDivider: {
    width: StyleSheet.hairlineWidth,
    height: 44,
    backgroundColor: sg.line,
    marginHorizontal: spacing.md,
  },
  streakSide: { alignItems: 'flex-end' },
  streakBestLab: {
    fontSize: fontSize.xs,
    color: sg.muted,
    fontFamily: sg.font.bodyMedium,
  },
  streakBestVal: {
    fontSize: fontSize.lg,
    fontFamily: sg.font.dataBold,
    fontVariant: [...sg.numeric],
    color: sg.text,
    marginTop: 2,
  },
  streakFine: {
    fontSize: fontSize.xs,
    color: sg.muted,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  questsHint: {
    fontSize: fontSize.xs,
    color: sg.muted,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
});
