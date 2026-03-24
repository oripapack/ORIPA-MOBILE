import React, { useLayoutEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { RootStackParamList } from '../navigation/types';
import { LootBoxDisclosure } from '../components/payments/LootBoxDisclosure';
import { CreditsPurchaseSection } from '../components/payments/CreditsPurchaseSection';
import { MarketplaceCheckoutSection } from '../components/payments/MarketplaceCheckoutSection';

type Nav = StackNavigationProp<RootStackParamList, 'PaymentPortal'>;
type R = RouteProp<RootStackParamList, 'PaymentPortal'>;

export function PaymentPortalScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const params = route.params;

  const initialTab = params?.initialTab ?? 'credits';
  const [tab, setTab] = useState<'credits' | 'marketplace'>(initialTab);
  const [lootVisible, setLootVisible] = useState(false);

  const listingTitle = params?.listingTitle ?? t('paymentPortal.sampleListingTitle');
  const listingPrice = params?.listingPrice ?? '—';

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('paymentPortal.navTitle'),
      headerShown: true,
      headerTintColor: colors.textPrimary,
      headerTitleStyle: { fontWeight: fontWeight.bold },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: colors.surfaceElevated },
    });
  }, [navigation, t]);

  const tabLabel = useMemo(
    () => ({
      credits: t('paymentPortal.tabCredits'),
      marketplace: t('paymentPortal.tabMarketplace'),
    }),
    [t],
  );

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>{t('paymentPortal.eyebrow')}</Text>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'credits' && styles.tabActive]}
            onPress={() => setTab('credits')}
            activeOpacity={0.88}
          >
            <Text style={[styles.tabText, tab === 'credits' && styles.tabTextActive]}>
              {tabLabel.credits}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'marketplace' && styles.tabActive]}
            onPress={() => setTab('marketplace')}
            activeOpacity={0.88}
          >
            <Text style={[styles.tabText, tab === 'marketplace' && styles.tabTextActive]}>
              {tabLabel.marketplace}
            </Text>
          </TouchableOpacity>
        </View>

        {tab === 'credits' ? (
          <CreditsPurchaseSection onOpenLootBoxDisclosure={() => setLootVisible(true)} />
        ) : (
          <MarketplaceCheckoutSection listingTitle={listingTitle} listingPrice={listingPrice} />
        )}
      </ScrollView>

      <LootBoxDisclosure visible={lootVisible} onClose={() => setLootVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  eyebrow: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  tabActive: {
    borderColor: colors.red,
    backgroundColor: colors.surfaceMuted,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
  },
});
