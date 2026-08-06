import React from 'react';
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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { MOCK_POINT_BUNDLES } from '../../data/mockPacks';
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
  const isPreviewPricing = __DEV__ || CREDITS_ARE_MOCK;

  const handlePurchase = (credits: number) => {
    addCredits(credits);

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
  };

  return (
    <View>
      <Text style={styles.title}>{t('buyCredits.title')}</Text>
      <Text style={styles.subtitle}>{t('buyCredits.subtitle')}</Text>
      {isPreviewPricing ? <Text style={styles.mockNote}>{t('buyCredits.mockNote')}</Text> : null}

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
        {MOCK_POINT_BUNDLES.map((bundle) => {
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
                  <View style={styles.pointsMark}>
                    <MaterialCommunityIcons name="star-four-points-small" size={18} color={sg.gold} />
                    <Text style={styles.pointsMarkText}>PTS</Text>
                  </View>
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
            {isPreviewPricing ? t('buyCredits.mockFooter') : t('buyCredits.liveFooter')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: sg.type.xxl,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: sg.space.xs,
  },
  subtitle: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    marginBottom: sg.space.sm,
    lineHeight: 20,
  },
  mockNote: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    backgroundColor: sg.surface,
    padding: sg.space.sm,
    borderRadius: sg.radius.btn,
    borderWidth: 1,
    borderColor: sg.line,
    marginBottom: sg.space.md,
    lineHeight: 18,
  },
  probabilityLink: {
    alignSelf: 'flex-start',
    marginBottom: sg.space.md,
    paddingVertical: sg.space.xs,
  },
  probabilityLinkText: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.gold,
    textDecorationLine: 'underline',
  },
  scroll: {},
  scrollContent: {
    paddingBottom: sg.space.md,
  },
  bundleWrap: {
    marginBottom: sg.space.md,
  },
  bundleCard: {
    position: 'relative',
    backgroundColor: sg.surface,
    borderRadius: sg.radius.panel,
    padding: sg.space.md,
    borderWidth: 1,
    borderColor: sg.line,
  },
  bundleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.sm,
    marginTop: sg.space.lg,
  },
  bundleRowNoBadge: {
    marginTop: sg.space.sm,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: sg.gold,
    paddingHorizontal: sg.space.sm,
    paddingVertical: 3,
    borderRadius: sg.radius.tag,
    zIndex: 2,
  },
  discountBadgeText: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.onGold,
    letterSpacing: 0.5,
  },
  bundleCenter: {
    flex: 1,
    minWidth: 0,
  },
  pointsMark: {
    width: 48,
    height: 48,
    borderRadius: sg.radius.btn,
    borderWidth: 1,
    borderColor: sg.line,
    backgroundColor: sg.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsMarkText: {
    marginTop: -3,
    fontSize: 8,
    fontFamily: sg.font.dataBold,
    color: sg.gold,
    letterSpacing: 1,
  },
  pointsLine: {
    fontSize: sg.type.lg,
    fontFamily: sg.font.dataBold,
    color: sg.text,
    marginBottom: 2,
    fontVariant: [...sg.numeric],
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 4,
  },
  priceNow: {
    fontSize: sg.type.md,
    fontFamily: sg.font.dataBold,
    color: sg.gold,
    fontVariant: [...sg.numeric],
  },
  priceList: {
    fontSize: sg.type.md,
    fontFamily: sg.font.dataBold,
    color: sg.text,
    fontVariant: [...sg.numeric],
  },
  priceWas: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.data,
    color: sg.muted,
    textDecorationLine: 'line-through',
    fontVariant: [...sg.numeric],
  },
  bundleBonus: {
    fontSize: sg.type.xs,
    color: sg.success,
    fontFamily: sg.font.bodyMedium,
    marginTop: 6,
  },
  buyBtn: {
    backgroundColor: sg.gold,
    paddingHorizontal: sg.space.md,
    paddingVertical: sg.space.sm + 2,
    borderRadius: sg.radius.btn,
    justifyContent: 'center',
    minWidth: 72,
    alignItems: 'center',
  },
  buyBtnText: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.onGold,
    letterSpacing: 0.3,
  },
  disclaimer: {
    fontSize: 10,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 15,
    marginTop: sg.space.sm,
    marginBottom: sg.space.sm,
  },
  routingNote: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    lineHeight: 18,
    marginBottom: sg.space.sm,
  },
  trustRow: {
    alignItems: 'center',
  },
  trustText: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.body,
    color: sg.muted,
    textAlign: 'center',
  },
});
