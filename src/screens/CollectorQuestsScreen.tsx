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
      headerTitleStyle: { fontFamily: sg.font.bodyBold, fontSize: sg.type.md },
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
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + sg.space.lg }]}
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
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: sg.bg,
  },
  content: {
    paddingHorizontal: sg.space.md,
    paddingTop: sg.space.sm,
  },
  lead: {
    fontSize: sg.type.sm,
    color: sg.muted,
    lineHeight: 20,
    marginBottom: sg.space.lg,
  },
  card: {
    marginBottom: sg.space.lg,
  },
  cardInner: {
    padding: sg.space.lg,
  },
  questBlock: {
    padding: sg.space.lg,
    paddingBottom: sg.space.sm,
  },
  eyebrow: {
    fontSize: 10,
    fontFamily: sg.font.dataBold,
    color: sg.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: sg.space.sm,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sg.space.sm,
  },
  streakMain: { flex: 1 },
  streakVal: {
    fontSize: sg.type.hero,
    fontFamily: sg.font.dataBold,
    color: sg.text,
    letterSpacing: -1,
    fontVariant: [...sg.numeric],
  },
  streakLab: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    marginTop: 2,
  },
  streakDivider: {
    width: StyleSheet.hairlineWidth,
    height: 44,
    backgroundColor: sg.line,
    marginHorizontal: sg.space.md,
  },
  streakSide: { alignItems: 'flex-end' },
  streakBestLab: {
    fontSize: sg.type.xs,
    color: sg.muted,
    fontFamily: sg.font.bodyMedium,
  },
  streakBestVal: {
    fontSize: sg.type.lg,
    fontFamily: sg.font.dataBold,
    color: sg.text,
    marginTop: 2,
    fontVariant: [...sg.numeric],
  },
  streakFine: {
    fontSize: sg.type.xs,
    color: sg.muted,
    lineHeight: 18,
  },
  section: {
    fontSize: 10,
    fontFamily: sg.font.dataBold,
    color: sg.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: sg.space.md,
    marginTop: sg.space.xs,
  },
});
