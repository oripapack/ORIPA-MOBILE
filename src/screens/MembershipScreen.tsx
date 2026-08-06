import React, { useCallback, useLayoutEffect, useState } from 'react';
import { sg } from '../tokens/sg';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MembershipTierCard } from '../components/membership/MembershipTierCard';
import { MOCK_MEMBERSHIP_PLANS, type MembershipTierId } from '../data/membershipPlans';
import { useAppStore } from '../store/useAppStore';
import { useMembershipSimulationStore } from '../store/membershipSimulationStore';
import type { RootStackParamList } from '../navigation/types';
import { confirmUserAction, showUserMessage } from '../utils/showUserMessage';

type Nav = StackNavigationProp<RootStackParamList, 'Membership'>;

/**
 * Paid membership (会員) — simulate tier in MVP (persisted); IAP later.
 */
export function MembershipScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const simulatedTier = useMembershipSimulationStore((s) => s.simulatedTier);
  const setSimulatedTier = useMembershipSimulationStore((s) => s.setSimulatedTier);
  const addCredits = useAppStore((s) => s.addCredits);
  const [selectedId, setSelectedId] = useState<MembershipTierId>('gold');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('membership.navTitle'),
      headerShown: true,
      headerTintColor: sg.text,
      headerTitleStyle: { fontFamily: sg.font.bodyBold, fontSize: sg.type.md },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: sg.surface2 },
    });
  }, [navigation, t]);

  React.useEffect(() => {
    if (simulatedTier) setSelectedId(simulatedTier);
  }, [simulatedTier]);

  const onSubscribe = useCallback(() => {
    const plan = MOCK_MEMBERSHIP_PLANS.find((p) => p.id === selectedId);
    if (!plan) return;
    setSimulatedTier(plan.id);
    addCredits(plan.monthlyPoints);
    showUserMessage(
      t('membership.simActivatedTitle'),
      t('membership.simActivatedBody', {
        tier: t(`membership.tierName_${plan.id}`),
        coins: plan.monthlyPoints.toLocaleString(),
      }),
    );
  }, [addCredits, selectedId, setSimulatedTier, t]);

  const onClearSimulation = useCallback(() => {
    confirmUserAction({
      title: t('membership.simClearTitle'),
      message: t('membership.simClearBody'),
      cancelLabel: t('common.cancel'),
      confirmLabel: t('membership.simClearConfirm'),
      destructive: true,
      onConfirm: () => setSimulatedTier(null),
    });
  }, [setSimulatedTier, t]);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {simulatedTier ? (
          <View style={styles.activeBanner}>
            <Text style={styles.activeBannerTitle}>{t('membership.simActiveTitle')}</Text>
            <Text style={styles.activeBannerBody}>
              {t('membership.simActiveBody', { tier: t(`membership.tierName_${simulatedTier}`) })}
            </Text>
            <TouchableOpacity onPress={onClearSimulation} activeOpacity={0.85}>
              <Text style={styles.activeBannerLink}>{t('membership.simClearLink')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <Text style={styles.heroEyebrow}>{t('membership.heroEyebrow')}</Text>
        <Text style={styles.heroTitle}>{t('membership.heroTitle')}</Text>
        <Text style={styles.heroLead}>{t('membership.heroLead')}</Text>

        <View style={styles.valueCallout}>
          <Text style={styles.valueTitle}>{t('membership.valueBlockTitle')}</Text>
          <Text style={styles.valueBody}>{t('membership.valueBlockBody')}</Text>
        </View>

        {MOCK_MEMBERSHIP_PLANS.map((plan) => (
          <MembershipTierCard
            key={plan.id}
            plan={plan}
            selected={selectedId === plan.id}
            onSelect={() => setSelectedId(plan.id)}
          />
        ))}

        <View style={styles.trustBlock}>
          <Text style={styles.trustLine}>{t('membership.renewalNote')}</Text>
          <Text style={styles.trustLine}>{t('membership.cancelAnytime')}</Text>
        </View>

        <Text style={styles.lockNote}>{t('membership.memberPackLockNote')}</Text>
      </ScrollView>

      <View style={[styles.stickyCta, { paddingBottom: Math.max(insets.bottom, sg.space.md) }]}>
        <TouchableOpacity style={styles.ctaButton} onPress={onSubscribe} activeOpacity={0.88}>
          <Text style={styles.ctaText}>
            {simulatedTier === selectedId
              ? t('membership.ctaSimSameTier')
              : t('membership.ctaSubscribe')}
          </Text>
        </TouchableOpacity>
        <Text style={styles.ctaHint}>{t('membership.ctaSimHint')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: sg.bg,
  },
  scroll: {
    flex: 1,
  },
  activeBanner: {
    marginHorizontal: sg.space.md,
    marginTop: sg.space.md,
    marginBottom: sg.space.sm,
    padding: sg.space.md,
    borderRadius: sg.radius.panel,
    backgroundColor: sg.successWash,
    borderWidth: 1,
    borderColor: sg.successLine,
  },
  activeBannerTitle: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.success,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  activeBannerBody: {
    fontSize: sg.type.sm,
    color: sg.text,
    lineHeight: 20,
    marginBottom: sg.space.sm,
  },
  activeBannerLink: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    textDecorationLine: 'underline',
  },
  heroEyebrow: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    paddingHorizontal: sg.space.md,
    paddingTop: sg.space.md,
  },
  heroTitle: {
    fontSize: sg.type.xxl,
    fontFamily: sg.font.display,
    color: sg.text,
    paddingHorizontal: sg.space.md,
    marginTop: sg.space.xs,
    letterSpacing: -0.5,
  },
  heroLead: {
    fontSize: sg.type.sm,
    color: sg.muted,
    lineHeight: 22,
    paddingHorizontal: sg.space.md,
    marginTop: sg.space.sm,
    marginBottom: sg.space.md,
  },
  valueCallout: {
    marginHorizontal: sg.space.md,
    marginBottom: sg.space.lg,
    padding: sg.space.md,
    borderRadius: sg.radius.panel,
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
  },
  valueTitle: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyBold,
    color: sg.gold,
    marginBottom: sg.space.xs,
  },
  valueBody: {
    fontSize: sg.type.xs,
    color: sg.muted,
    lineHeight: 18,
  },
  trustBlock: {
    paddingHorizontal: sg.space.md,
    marginTop: sg.space.sm,
    marginBottom: sg.space.md,
  },
  trustLine: {
    fontSize: 11,
    color: sg.muted,
    lineHeight: 18,
    marginBottom: 4,
  },
  lockNote: {
    fontSize: 10,
    color: sg.muted,
    paddingHorizontal: sg.space.md,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  stickyCta: {
    borderTopWidth: 1,
    borderTopColor: sg.line,
    backgroundColor: sg.bg,
    paddingHorizontal: sg.space.md,
    paddingTop: sg.space.sm,
  },
  ctaButton: {
    backgroundColor: sg.gold,
    borderRadius: sg.radius.btn,
    paddingVertical: sg.space.md,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: sg.type.md,
    fontFamily: sg.font.bodyBold,
    color: sg.onGold,
    letterSpacing: 0.3,
  },
  ctaHint: {
    fontSize: 10,
    color: sg.muted,
    textAlign: 'center',
    marginTop: sg.space.sm,
  },
});
