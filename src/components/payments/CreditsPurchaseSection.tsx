import React, { useCallback, useState } from 'react';
import { sg } from '../../tokens/sg';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
  InteractionManager,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { fontSize } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { creditBundles } from '../../data/mockPacks';
import { useAppStore } from '../../store/useAppStore';
import type { RootStackParamList } from '../../navigation/types';
import {
  allowDemoCreditGrants,
  creditCheckoutUnavailableReason,
  isLiveStripeCreditCheckoutEnabled,
} from '../../config/payments';
import {
  creditBundleAmountCents,
  startStripeCreditCheckout,
} from '../../lib/creditCheckout';
import { showUserMessage } from '../../utils/showUserMessage';
import { useRequireAuth } from '../../hooks/useRequireAuth';

const SCROLL_MAX_H = Math.round(Dimensions.get('window').height * 0.52);

interface Props {
  onOpenLootBoxDisclosure: () => void;
}

type RootNav = StackNavigationProp<RootStackParamList>;

export function CreditsPurchaseSection({ onOpenLootBoxDisclosure }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation<RootNav>();
  const addCredits = useAppStore((s) => s.addCredits);
  const { requireAuth } = useRequireAuth();
  const [busyBundleId, setBusyBundleId] = useState<string | null>(null);

  const unavailable = creditCheckoutUnavailableReason();
  const demoMode = allowDemoCreditGrants();
  const stripeLive = isLiveStripeCreditCheckoutEnabled() && unavailable === null;
  const purchasesEnabled = demoMode || stripeLive;

  const resumePackOpenIfReady = useCallback(() => {
    const s0 = useAppStore.getState();
    const qty = s0.resumePackOpenQuantity ?? 1;
    const need = s0.selectedPack ? s0.selectedPack.creditPrice * qty : 0;
    if (!s0.resumePackOpenAfterCredits || !s0.selectedPack || s0.user.credits < need) {
      return;
    }

    const wentBack = navigation.canGoBack();
    if (wentBack) {
      navigation.goBack();
    }

    const delay = wentBack ? 160 : 0;
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        const s = useAppStore.getState();
        const pack = s.selectedPack;
        const q = s.resumePackOpenQuantity ?? 1;
        if (pack && s.user.credits >= pack.creditPrice * q) {
          void s.openPack(pack, { quantity: q });
        }
      }, delay);
    });
  }, [navigation]);

  const handlePurchase = (bundle: (typeof creditBundles)[number]) => {
    requireAuth(() => {
      void (async () => {
        if (demoMode) {
          addCredits(bundle.credits);
          showUserMessage(
            t('buyCredits.demoGrantedTitle'),
            t('buyCredits.demoGrantedBody', { count: bundle.credits.toLocaleString() }),
          );
          resumePackOpenIfReady();
          return;
        }

        if (!stripeLive) {
          showUserMessage(
            t('buyCredits.unavailableTitle'),
            unavailable === 'iap_native'
              ? t('buyCredits.iapComingSoonBody')
              : t('buyCredits.stripeComingSoonBody'),
          );
          return;
        }

        const amountCents = creditBundleAmountCents(bundle.priceUsd);
        setBusyBundleId(bundle.id);
        try {
          const result = await startStripeCreditCheckout({
            bundleId: bundle.id,
            bundleLabel: bundle.label,
            credits: bundle.credits,
            amountCents,
          });
          if (!result.ok) {
            showUserMessage(
              t('buyCredits.checkoutFailedTitle'),
              result.message || t('buyCredits.checkoutFailedBody'),
            );
            return;
          }
          showUserMessage(
            t('buyCredits.checkoutOpenedTitle'),
            t('buyCredits.checkoutOpenedBody'),
          );
        } finally {
          setBusyBundleId(null);
        }
      })();
    });
  };

  const statusBanner =
    demoMode
      ? t('buyCredits.mockNote')
      : unavailable === 'iap_native'
        ? t('buyCredits.iapComingSoonBody')
        : unavailable === 'stripe_coming_soon'
          ? t('buyCredits.stripeComingSoonBody')
          : t('buyCredits.stripeLiveNote');

  return (
    <View>
      <Text style={styles.title}>{t('buyCredits.title')}</Text>
      <Text style={styles.subtitle}>{t('buyCredits.subtitle')}</Text>
      <Text style={[styles.mockNote, demoMode ? null : styles.soonNote]}>{statusBanner}</Text>
      {demoMode ? (
        <View style={styles.demoTag}>
          <Text style={styles.demoTagText}>{t('buyCredits.demoModeBadge')}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.probabilityLink}
        onPress={onOpenLootBoxDisclosure}
        activeOpacity={0.85}
        accessibilityRole="button"
      >
        <Text style={styles.probabilityLinkText}>{t('paymentPortal.viewProbabilities')}</Text>
      </TouchableOpacity>

      <ScrollView
        style={[styles.scroll, { maxHeight: SCROLL_MAX_H }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
        bounces
        nestedScrollEnabled={Platform.OS === 'android'}
      >
        {creditBundles.map((bundle) => {
          const promo = bundle.showPromoDiscount;
          const busy = busyBundleId === bundle.id;
          const disabled = !purchasesEnabled || busyBundleId != null;
          return (
            <View key={bundle.id} style={styles.bundleWrap}>
              <View style={[styles.bundleCard, disabled && styles.bundleCardDisabled]}>
                {promo ? (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>
                      {t('buyCredits.discountBadge', { pct: bundle.discountPercent })}
                    </Text>
                  </View>
                ) : null}
                <View style={[styles.bundleRow, !promo && styles.bundleRowNoBadge]}>
                  <MaterialCommunityIcons name="sack" size={36} color={sg.gold} />
                  <View style={styles.bundleCenter}>
                    <Text style={styles.pointsLine}>
                      {t('buyCredits.pointsLine', {
                        count: bundle.credits.toLocaleString(),
                      })}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text style={promo ? styles.priceNow : styles.priceList}>{bundle.priceUsd}</Text>
                      {promo && bundle.priceUsdWas ? (
                        <Text style={styles.priceWas}>{bundle.priceUsdWas}</Text>
                      ) : null}
                    </View>
                    {bundle.bonus ? <Text style={styles.bundleBonus}>{bundle.bonus}</Text> : null}
                  </View>
                  <TouchableOpacity
                    style={[styles.buyBtn, disabled && styles.buyBtnDisabled]}
                    onPress={() => handlePurchase(bundle)}
                    activeOpacity={0.85}
                    disabled={disabled}
                    accessibilityState={{ disabled }}
                  >
                    {busy ? (
                      <ActivityIndicator color={sg.onGold} />
                    ) : (
                      <Text style={[styles.buyBtnText, disabled && styles.buyBtnTextMuted]}>
                        {demoMode
                          ? t('buyCredits.demoGrantCta')
                          : purchasesEnabled
                            ? t('buyCredits.buyNow')
                            : t('buyCredits.unavailableCta')}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        <Text style={styles.disclaimer}>{t('buyCredits.disclaimer')}</Text>
        <Text style={styles.routingNote}>{t('paymentPortal.digitalRoutingNote')}</Text>

        <View style={styles.trustRow}>
          <Text style={styles.trustText}>
            {demoMode
              ? t('buyCredits.mockFooter')
              : purchasesEnabled
                ? t('buyCredits.liveFooter')
                : t('buyCredits.comingSoonFooter')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xxl,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  mockNote: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.error,
    backgroundColor: 'rgba(255,74,56,0.10)',
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  soonNote: {
    color: sg.gold,
    backgroundColor: 'rgba(232,197,71,0.12)',
  },
  demoTag: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: sg.error,
    backgroundColor: 'rgba(255,74,56,0.08)',
  },
  demoTagText: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.error,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  probabilityLink: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  probabilityLinkText: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.error,
    textDecorationLine: 'underline',
  },
  scroll: {},
  scrollContent: {
    paddingBottom: spacing.md,
  },
  bundleWrap: {
    marginBottom: spacing.md,
  },
  bundleCard: {
    position: 'relative',
    backgroundColor: sg.surface2,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: sg.line,
  },
  bundleCardDisabled: {
    opacity: 0.72,
  },
  bundleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  bundleRowNoBadge: {
    marginTop: spacing.sm,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: sg.neon,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    zIndex: 2,
  },
  discountBadgeText: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    letterSpacing: 0.5,
  },
  bundleCenter: {
    flex: 1,
    minWidth: 0,
  },
  pointsLine: {
    fontSize: fontSize.lg,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 4,
  },
  priceNow: {
    fontSize: fontSize.md,
    fontFamily: sg.font.display,
    color: sg.gold,
  },
  priceList: {
    fontSize: fontSize.md,
    fontFamily: sg.font.display,
    color: sg.text,
  },
  priceWas: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.body,
    color: sg.muted,
    textDecorationLine: 'line-through',
  },
  bundleBonus: {
    fontSize: fontSize.xs,
    color: sg.success,
    fontFamily: sg.font.bodyMedium,
    marginTop: 6,
  },
  buyBtn: {
    backgroundColor: sg.gold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    justifyContent: 'center',
    minWidth: 88,
    minHeight: 36,
    alignItems: 'center',
  },
  buyBtnDisabled: {
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
  },
  buyBtnText: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.onGold,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  buyBtnTextMuted: {
    color: sg.muted,
  },
  disclaimer: {
    fontSize: 10,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 15,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  routingNote: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  trustRow: {
    alignItems: 'center',
  },
  trustText: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.body,
    color: sg.muted,
    textAlign: 'center',
  },
});
