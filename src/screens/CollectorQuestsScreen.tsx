import React, { useCallback, useLayoutEffect } from 'react';
import { sg } from '../tokens/sg';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { COLLECTOR_QUESTS } from '../data/collectorQuests';
import { CollectorQuestRow } from '../components/account/CollectorQuestRow';
import { VaultFramedCard } from '../components/shared/VaultFramedCard';
import { fontSize } from '../tokens/typography';
import { spacing } from '../tokens/spacing';
import { SgScreen } from '../components/ui/SgScreen';

type Nav = StackNavigationProp<RootStackParamList, 'CollectorQuests'>;

export function CollectorQuestsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('account.collectorQuestsTitle'),
      headerShown: true,
      headerTintColor: sg.text,
      headerTitleStyle: { fontFamily: sg.font.bodyBold, fontSize: fontSize.md },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: sg.surface2 },
    });
  }, [navigation, t]);
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
    <SgScreen constrainContent>
      <ScrollView
        style={styles.root}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
      <Text style={styles.lead}>{t('progression.questsResetHint')}</Text>

      <VaultFramedCard style={styles.card} contentStyle={styles.cardInner}>
        <Text style={styles.eyebrow}>{t('progression.streakEyebrow')}</Text>
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
      </VaultFramedCard>

      <Text style={styles.section}>{t('progression.questsDaily')}</Text>
      <VaultFramedCard style={styles.card} contentStyle={styles.questBlock}>
        {dailies.map((q) => (
          <CollectorQuestRow key={q.id} def={q} row={questProgress[q.id]} onClaim={onClaim} />
        ))}
      </VaultFramedCard>

      <Text style={styles.section}>{t('progression.questsWeekly')}</Text>
      <VaultFramedCard style={styles.card} contentStyle={styles.questBlock}>
        {weeklies.map((q) => (
          <CollectorQuestRow key={q.id} def={q} row={questProgress[q.id]} onClaim={onClaim} />
        ))}
      </VaultFramedCard>
      </ScrollView>
    </SgScreen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
  },
  lead: {
    fontSize: fontSize.sm,
    color: sg.muted,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardInner: {
    padding: spacing.lg,
  },
  questBlock: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  eyebrow: {
    fontSize: 10,
    fontFamily: sg.font.display,
    color: sg.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  streakMain: { flex: 1 },
  streakVal: {
    fontSize: fontSize.hero,
    fontFamily: sg.font.display,
    color: sg.text,
    letterSpacing: -1,
  },
  streakLab: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyMedium,
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
    fontFamily: sg.font.display,
    color: sg.text,
    marginTop: 2,
  },
  streakFine: {
    fontSize: fontSize.xs,
    color: sg.muted,
    lineHeight: 18,
  },
  section: {
    fontSize: 10,
    fontFamily: sg.font.display,
    color: sg.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
});
