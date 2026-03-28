import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
  InteractionManager,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { creditBundles } from '../../data/mockPacks';
import { useAppStore } from '../../store/useAppStore';
import { CREDITS_ARE_MOCK } from '../../config/app';
import type { RootStackParamList } from '../../navigation/types';

const SCROLL_MAX_H = Math.round(Dimensions.get('window').height * 0.52);

interface Props {
  onOpenLootBoxDisclosure: () => void;
}

type RootNav = StackNavigationProp<RootStackParamList>;

export function CreditsPurchaseSection({ onOpenLootBoxDisclosure }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation<RootNav>();
  const addCredits = useAppStore((s) => s.addCredits);

  const handlePurchase = (credits: number) => {
    addCredits(credits);

    const s0 = useAppStore.getState();
    if (
      !s0.resumePackOpenAfterCredits ||
      !s0.selectedPack ||
      s0.user.credits < s0.selectedPack.creditPrice
    ) {
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
        if (pack && s.user.credits >= pack.creditPrice) {
          s.openPack(pack);
        }
      }, delay);
    });
  };

  return (
    <View>
      <Text style={styles.title}>{t('buyCredits.title')}</Text>
      <Text style={styles.subtitle}>{t('buyCredits.subtitle')}</Text>
      {CREDITS_ARE_MOCK && <Text style={styles.mockNote}>{t('buyCredits.mockNote')}</Text>}

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
          return (
            <View key={bundle.id} style={styles.bundleWrap}>
              <View style={styles.bundleCard}>
                {promo ? (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>
                      {t('buyCredits.discountBadge', { pct: bundle.discountPercent })}
                    </Text>
                  </View>
                ) : null}
                <View style={[styles.bundleRow, !promo && styles.bundleRowNoBadge]}>
                  <MaterialCommunityIcons name="sack" size={40} color="#CA8A04" />
                  <View style={styles.bundleCenter}>
                    <Text style={styles.pointsLine}>
                      {t('buyCredits.pointsLine', {
                        count: bundle.credits.toLocaleString(),
                      })}
                    </Text>
                    <Text style={styles.approxLine}>
                      {t('buyCredits.approx')}{' '}
                      <Text style={promo ? styles.priceNow : styles.priceList}>{bundle.priceUsd}</Text>
                    </Text>
                    {promo && bundle.priceUsdWas ? (
                      <Text style={styles.priceWas}>{bundle.priceUsdWas}</Text>
                    ) : null}
                    {promo ? (
                      <View style={styles.jpyRow}>
                        <Text style={styles.jpyWas}>{bundle.jpyWas}</Text>
                        <Text style={styles.jpyNow}> {bundle.jpyNow}</Text>
                      </View>
                    ) : (
                      <Text style={styles.jpyList}>{bundle.jpyNow}</Text>
                    )}
                    {bundle.bonus ? <Text style={styles.bundleBonus}>{bundle.bonus}</Text> : null}
                  </View>
                  <TouchableOpacity
                    style={styles.buyBtn}
                    onPress={() => handlePurchase(bundle.credits)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.buyBtnText}>{t('buyCredits.buyNow')}</Text>
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
            {CREDITS_ARE_MOCK ? t('buyCredits.mockFooter') : t('buyCredits.liveFooter')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  mockNote: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.redDark,
    backgroundColor: colors.promoBannerBg,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  probabilityLink: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  probabilityLinkText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.red,
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
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.red,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    zIndex: 2,
  },
  discountBadgeText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  bundleCenter: {
    flex: 1,
    minWidth: 0,
  },
  pointsLine: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  approxLine: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  priceNow: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.red,
  },
  priceList: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  priceWas: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  jpyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 4,
  },
  jpyWas: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  jpyNow: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.red,
  },
  jpyList: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: 4,
  },
  bundleBonus: {
    fontSize: fontSize.xs,
    color: colors.green,
    fontWeight: fontWeight.semibold,
    marginTop: 6,
  },
  buyBtn: {
    backgroundColor: colors.nearBlack,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    justifyContent: 'center',
  },
  buyBtnText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  disclaimer: {
    fontSize: 10,
    fontWeight: fontWeight.regular,
    color: colors.textMuted,
    lineHeight: 15,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  routingNote: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  trustRow: {
    alignItems: 'center',
  },
  trustText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
