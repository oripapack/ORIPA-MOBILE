import React, { useLayoutEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { sg } from '../tokens/sg';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { progressionFromTotalXp } from '../lib/collectorProgression';
import { SgData } from '../components/ui';

type Nav = StackNavigationProp<RootStackParamList, 'TierBenefits'>;

/**
 * Collector level status. Product benefits are intentionally not invented:
 * only the XP progression already implemented in the app is shown here.
 */
export function TierBenefitsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const totalXp = useAppStore((s) => s.user.xp);
  const progress = progressionFromTotalXp(totalXp);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('tierBenefits.navTitle'),
      headerShown: true,
      headerTintColor: sg.text,
      headerTitleStyle: { fontFamily: sg.font.bodyBold },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: sg.bg },
    });
  }, [navigation, t]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + sg.space.xxxl }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>{t('tierBenefits.eyebrow')}</Text>
      <Text style={styles.title}>{t('tierBenefits.currentLevel', { level: progress.level })}</Text>
      <Text style={styles.rank}>{t(`progression.rankBand_${progress.rankBand}`)}</Text>

      <View style={styles.progressCard}>
        <View style={styles.progressTop}>
          <SgData value={totalXp.toLocaleString()} unit="TOTAL XP" size="lg" tone="gold" />
          <SgData value={`${progress.pctInLevel}%`} unit="THIS LEVEL" size="sm" />
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress.pctInLevel}%` as `${number}%` }]} />
        </View>
        <Text style={styles.progressLine}>
          {t('tierBenefits.progressLine', {
            current: progress.xpIntoLevel.toLocaleString(),
            next: progress.xpForNextLevel.toLocaleString(),
          })}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoKicker}>{t('tierBenefits.previewKicker')}</Text>
        <Text style={styles.infoTitle}>{t('tierBenefits.previewTitle')}</Text>
        <Text style={styles.infoBody}>{t('tierBenefits.previewBody')}</Text>
      </View>

      <Text style={styles.note}>{t('tierBenefits.disclaimer')}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: sg.bg },
  content: { padding: sg.space.md, paddingTop: sg.space.lg },
  eyebrow: {
    fontFamily: sg.font.dataBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: sg.gold,
    marginBottom: sg.space.sm,
  },
  title: {
    fontFamily: sg.font.display,
    fontSize: 32,
    lineHeight: 36,
    color: sg.text,
  },
  rank: {
    fontFamily: sg.font.bodyMedium,
    fontSize: 13,
    color: sg.muted,
    marginTop: sg.space.xs,
    marginBottom: sg.space.lg,
  },
  progressCard: {
    backgroundColor: sg.surface,
    borderRadius: sg.radius.panel,
    borderWidth: 1,
    borderColor: sg.line,
    padding: sg.space.lg,
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: sg.space.md,
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: sg.line,
    overflow: 'hidden',
    marginTop: sg.space.lg,
  },
  fill: { height: 4, borderRadius: 2, backgroundColor: sg.gold },
  progressLine: {
    fontFamily: sg.font.data,
    fontSize: 11,
    color: sg.muted,
    marginTop: sg.space.sm,
    fontVariant: [...sg.numeric],
  },
  infoCard: {
    marginTop: sg.space.md,
    backgroundColor: sg.surface2,
    borderRadius: sg.radius.panel,
    borderWidth: 1,
    borderColor: sg.line,
    padding: sg.space.lg,
  },
  infoKicker: {
    fontFamily: sg.font.dataBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: sg.muted,
    marginBottom: sg.space.sm,
  },
  infoTitle: {
    fontFamily: sg.font.display,
    fontSize: 22,
    color: sg.text,
    marginBottom: sg.space.sm,
  },
  infoBody: {
    fontFamily: sg.font.body,
    fontSize: 13,
    lineHeight: 20,
    color: sg.muted,
  },
  note: {
    fontFamily: sg.font.body,
    fontSize: 11,
    lineHeight: 18,
    color: sg.muted,
    marginTop: sg.space.md,
  },
});
