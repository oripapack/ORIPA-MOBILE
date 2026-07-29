import React, { useLayoutEffect, useMemo } from 'react';
import { sg } from '../tokens/sg';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fontSize } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { TIER_BENEFITS } from '../data/tierBenefits';

type Nav = StackNavigationProp<RootStackParamList, 'TierBenefits'>;

const tierAccent: Record<string, string> = {
  Starter: '#6B7280',
  Bronze: '#92400E',
  Silver: '#6B7280',
  Gold: '#B45309',
};

export function TierBenefitsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const userTier = useAppStore((s) => s.user.tier);
  const userXp = useAppStore((s) => s.user.xp);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('tierBenefits.navTitle'),
      headerShown: true,
      headerTintColor: sg.text,
      headerTitleStyle: { fontFamily: sg.font.bodyBold },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: sg.surface2 },
    });
  }, [navigation, t]);

  const nextTierXp = useMemo(() => {
    const order = TIER_BENEFITS.map((x) => x.tier);
    const idx = order.indexOf(userTier);
    if (idx < 0 || idx >= TIER_BENEFITS.length - 1) return null;
    return TIER_BENEFITS[idx + 1]?.minXp ?? null;
  }, [userTier]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.lead}>{t('tierBenefits.lead')}</Text>
      {nextTierXp != null ? (
        <Text style={styles.progressHint}>
          {t('tierBenefits.progressHint', {
            xp: userXp.toLocaleString(),
            need: nextTierXp.toLocaleString(),
          })}
        </Text>
      ) : (
        <Text style={styles.progressHint}>{t('tierBenefits.topTier')}</Text>
      )}

      {TIER_BENEFITS.map((row) => {
        const active = row.tier === userTier;
        const accent = tierAccent[row.tier] ?? sg.muted;
        return (
          <View
            key={row.tier}
            style={[styles.card, active && { borderColor: accent, borderWidth: 2 }]}
          >
            <View style={styles.cardTop}>
              <Text style={[styles.tierName, { color: accent }]}>{row.tier}</Text>
              <Text style={styles.minXp}>
                {t('tierBenefits.fromXp', { xp: row.minXp.toLocaleString() })}
              </Text>
            </View>
            {active ? (
              <View style={styles.pill}>
                <Text style={styles.pillText}>{t('tierBenefits.yourTier')}</Text>
              </View>
            ) : null}
            {row.perks.map((p) => (
              <Text key={p} style={styles.perk}>
                • {p}
              </Text>
            ))}
          </View>
        );
      })}

      <Text style={styles.disclaimer}>{t('tierBenefits.disclaimer')}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: sg.bg },
  content: { padding: spacing.base, paddingTop: spacing.md },
  lead: {
    fontSize: fontSize.sm,
    color: sg.muted,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  progressHint: {
    fontSize: fontSize.xs,
    color: sg.muted,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  card: {
    backgroundColor: sg.surface2,
    borderRadius: radius.xl,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: sg.line,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  tierName: {
    fontSize: fontSize.lg,
    fontFamily: sg.font.display,
    letterSpacing: 0.5,
  },
  minXp: {
    fontSize: fontSize.xs,
    color: sg.muted,
    fontFamily: sg.font.bodyMedium,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: sg.bg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  pillText: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.error,
  },
  perk: {
    fontSize: fontSize.sm,
    color: sg.text,
    lineHeight: 22,
    marginBottom: 4,
  },
  disclaimer: {
    fontSize: fontSize.xs,
    color: sg.muted,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
});
