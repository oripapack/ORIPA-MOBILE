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
import { MEMBERSHIP_PLANS, type MembershipTierId } from '../data/membershipPlans';
import { useAppStore } from '../store/useAppStore';
import { useMembershipSimulationStore } from '../store/membershipSimulationStore';
import { fontSize } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import type { RootStackParamList } from '../navigation/types';
import { confirmUserAction, showUserMessage } from '../utils/showUserMessage';
import { SgScreen } from '../components/ui/SgScreen';
import { MEMBERSHIP_IS_LIVE } from '../config/app';

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
      headerTitleStyle: { fontFamily: sg.font.bodyBold, fontSize: fontSize.md },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: sg.surface2 },
    });
  }, [navigation, t]);

  React.useEffect(() => {
    if (simulatedTier) setSelectedId(simulatedTier);
  }, [simulatedTier]);

  const onSubscribe = useCallback(() => {
    const plan = MEMBERSHIP_PLANS.find((p) => p.id === selectedId);
    if (!plan) return;
    setSimulatedTier(plan.id);
    addCredits(plan.monthlyCoins);
    showUserMessage(
      t('membership.simActivatedTitle'),
      t('membership.simActivatedBody', {
        tier: t(`membership.tierName_${plan.id}`),
        coins: plan.monthlyCoins.toLocaleString(),
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

  if (!MEMBERSHIP_IS_LIVE && !__DEV__) {
    return (
      <SgScreen>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.releasePage, { paddingBottom: insets.bottom + spacing.xxxl }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.releaseEyebrow}>{t('membership.releaseEyebrow')}</Text>
          <Text style={styles.releaseTitle}>{t('membership.releaseTitle')}</Text>
          <Text style={styles.releaseBody}>{t('membership.releaseBody')}</Text>
          <View style={styles.releasePanel}>
            <Text style={styles.releasePanelCode}>MEMBERSHIP / ENTITLEMENTS</Text>
            <Text style={styles.releasePanelStatus}>{t('membership.releaseStatus')}</Text>
          </View>
        </ScrollView>
      </SgScreen>
    );
  }

  return (
    <SgScreen>
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

        {MEMBERSHIP_PLANS.map((plan) => (
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

      <View style={[styles.stickyCta, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
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
    </SgScreen>
  );
}

const styles = StyleSheet.create({
  releasePage: {
    flexGrow: 1,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xxl,
  },
  releaseEyebrow: {
    fontFamily: sg.font.label,
    fontSize: 9,
    letterSpacing: 1.1,
    color: sg.warning,
    marginBottom: spacing.sm,
  },
  releaseTitle: {
    fontFamily: sg.font.display,
    fontSize: fontSize.xxl,
    lineHeight: 32,
    color: sg.text,
    marginBottom: spacing.md,
  },
  releaseBody: {
    fontFamily: sg.font.body,
    fontSize: fontSize.sm,
    lineHeight: 22,
    color: sg.muted,
  },
  releasePanel: {
    minHeight: 116,
    marginTop: spacing.xxl,
    padding: spacing.base,
    justifyContent: 'space-between',
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.lineStrong,
    borderRadius: sg.radius.panel,
  },
  releasePanelCode: {
    fontFamily: sg.font.label,
    fontSize: 9,
    letterSpacing: 0.8,
    color: sg.chrome,
  },
  releasePanelStatus: {
    fontFamily: sg.font.label,
    fontSize: 11,
    letterSpacing: 0.8,
    color: sg.warning,
  },
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    flex: 1,
  },
  activeBanner: {
    marginHorizontal: spacing.base,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: sg.mintWash,
    borderWidth: 1,
    borderColor: sg.mintBorder,
  },
  activeBannerTitle: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.success,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  activeBannerBody: {
    fontSize: fontSize.sm,
    color: sg.text,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  activeBannerLink: {
    fontSize: fontSize.xs,
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
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
  },
  heroTitle: {
    fontSize: fontSize.xxl,
    fontFamily: sg.font.display,
    color: sg.text,
    paddingHorizontal: spacing.base,
    marginTop: spacing.xs,
    letterSpacing: -0.5,
  },
  heroLead: {
    fontSize: fontSize.sm,
    color: sg.muted,
    lineHeight: 22,
    paddingHorizontal: spacing.base,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  valueCallout: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
  },
  valueTitle: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyBold,
    color: sg.gold,
    marginBottom: spacing.xs,
  },
  valueBody: {
    fontSize: fontSize.xs,
    color: sg.muted,
    lineHeight: 18,
  },
  trustBlock: {
    paddingHorizontal: spacing.base,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
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
    paddingHorizontal: spacing.base,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  stickyCta: {
    borderTopWidth: 1,
    borderTopColor: sg.line,
    backgroundColor: sg.bg,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
  },
  ctaButton: {
    backgroundColor: sg.value,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: fontSize.md,
    fontFamily: sg.font.bodyBold,
    color: sg.onValue,
    letterSpacing: 0.3,
  },
  ctaHint: {
    fontSize: 10,
    color: sg.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
