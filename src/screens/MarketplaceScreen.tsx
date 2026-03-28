import React, { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../components/shared/AppHeader';
import { ListingCard } from '../components/marketplace/ListingCard';
import { WhyChoosePullHub } from '../components/marketplace/WhyChoosePullHub';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import {
  marketplaceStores,
  marketplaceListings,
  type ListingCategory,
  type MarketplaceListing,
} from '../data/marketplace';
import { demoMarketplacePromoImage } from '../data/demoMedia';
import { navigationRef } from '../navigation/navigationRef';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { VaultFramedCard } from '../components/shared/VaultFramedCard';

const CATEGORY_KEYS: (ListingCategory | 'all')[] = [
  'all',
  'pokemon',
  'one_piece',
  'yugioh',
  'sports',
];

export function MarketplaceScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { refreshControl } = usePullToRefresh();
  const { requireAuth } = useRequireAuth();
  const searchRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ListingCategory | 'all'>('all');

  const filteredListings = useMemo(() => {
    const q = query.trim().toLowerCase();
    return marketplaceListings.filter((l) => {
      if (category !== 'all' && l.category !== category) return false;
      if (!q) return true;
      const hay = `${l.title} ${l.subtitle}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, category]);

  const saleListings = useMemo(
    () => filteredListings.filter((l) => l.badge === 'sale'),
    [filteredListings],
  );

  const onListingPress = (listing: MarketplaceListing) => {
    requireAuth(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('PaymentPortal', {
          initialTab: 'marketplace',
          listingTitle: listing.title,
          listingPrice: listing.price,
        });
      }
    });
  };

  return (
    <View style={styles.root}>
      <AppHeader onSearch={() => searchRef.current?.focus()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        <Text style={[styles.pageTitle, { paddingTop: spacing.sm }]}>{t('marketplace.storeTitle')}</Text>
        <Text style={styles.lead}>{t('marketplace.storeLead')}</Text>

        {/* Search */}
        <VaultFramedCard style={styles.searchBarOuter} contentStyle={styles.searchBarInner}>
          <View style={styles.searchBarRow}>
            <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              ref={searchRef}
              style={styles.searchInput}
              placeholder={t('marketplace.searchPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
            />
          </View>
        </VaultFramedCard>

        {/* Promo */}
        <VaultFramedCard style={styles.promoOuter} contentStyle={styles.promoInner}>
          <View style={styles.promoRow}>
            <Image
              source={{ uri: demoMarketplacePromoImage }}
              style={styles.promoImage}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
            <View style={styles.promoTextCol}>
              <Text style={styles.promoTitle}>{t('marketplace.promoTitle')}</Text>
              <Text style={styles.promoBody}>{t('marketplace.promoBody')}</Text>
            </View>
          </View>
        </VaultFramedCard>

        {/* Category tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          {CATEGORY_KEYS.map((key) => {
            const active = category === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.catChip, active && styles.catChipActive]}
                onPress={() => setCategory(key)}
                activeOpacity={0.85}
              >
                <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                  {t(`marketplace.cat_${key}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Why choose Pull Hub Store */}
        <WhyChoosePullHub />

        {/* Special price row */}
        {saleListings.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{t('marketplace.specialPrice')}</Text>
              <View style={styles.saleTag}>
                <Text style={styles.saleTagText}>{t('marketplace.saleOn')}</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hRow}
            >
              {saleListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onPress={() => onListingPress(listing)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Partner stores + listings */}
        <Text style={styles.sectionEyebrow}>{t('marketplace.sectionStores')}</Text>

        {marketplaceStores.map((store) => {
          const rows = filteredListings.filter((l) => {
            if (l.storeId !== store.id) return false;
            // Avoid duplicating “sale” items: they appear in the Special price row
            if (saleListings.length > 0 && l.badge === 'sale') return false;
            return true;
          });
          if (rows.length === 0) return null;

          return (
            <VaultFramedCard key={store.id} style={styles.storeSection} contentStyle={styles.storeSectionInner}>
              <View style={styles.storeHeader}>
                <View style={styles.storeTitleRow}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  {store.verified ? (
                    <View style={styles.verifiedPill}>
                      <Text style={styles.verifiedText}>{t('marketplace.verified')}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.storeTagline}>{store.tagline}</Text>
                <Text style={styles.commission}>
                  {t('marketplace.commissionLine', { pct: Math.round(store.commissionRate * 100) })}
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hRowStore}
              >
                {rows.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onPress={() => onListingPress(listing)}
                  />
                ))}
              </ScrollView>
            </VaultFramedCard>
          );
        })}

        {filteredListings.length === 0 ? (
          <VaultFramedCard style={styles.emptyOuter} contentStyle={styles.emptyInner}>
            <Text style={styles.emptyText}>{t('marketplace.emptyResults')}</Text>
          </VaultFramedCard>
        ) : null}

        <VaultFramedCard style={styles.demoNoteOuter} contentStyle={styles.demoNoteInner}>
          <Text style={styles.demoNoteText}>{t('marketplace.demoNote')}</Text>
        </VaultFramedCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 0,
  },
  pageTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xs,
  },
  lead: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  searchBarOuter: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  searchBarInner: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: spacing.md,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  promoOuter: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  promoInner: {
    paddingVertical: spacing.sm,
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  promoImage: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  promoTextCol: {
    flex: 1,
  },
  promoTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.gold,
    marginBottom: 4,
  },
  promoBody: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  catScroll: {
    paddingHorizontal: spacing.base,
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  catChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipActive: {
    backgroundColor: colors.nearBlack,
    borderColor: colors.gold,
  },
  catChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  catChipTextActive: {
    color: colors.gold,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  saleTag: {
    backgroundColor: colors.red,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  saleTagText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  hRow: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xs,
  },
  sectionEyebrow: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  storeSection: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.lg,
  },
  storeSectionInner: {
    paddingBottom: spacing.sm,
  },
  storeHeader: {
    marginBottom: spacing.sm,
  },
  hRowStore: {
    paddingBottom: spacing.xs,
    marginHorizontal: -4,
  },
  storeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: 4,
  },
  storeName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  verifiedPill: {
    backgroundColor: colors.verifiedPillBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.md,
  },
  verifiedText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.verifiedPillText,
    letterSpacing: 0.3,
  },
  storeTagline: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  commission: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  emptyOuter: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  emptyInner: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  demoNoteOuter: {
    marginHorizontal: spacing.base,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  demoNoteInner: {
    alignItems: 'center',
  },
  demoNoteText: {
    fontSize: fontSize.xs,
    color: colors.demoNoteText,
    lineHeight: 18,
    textAlign: 'center',
  },
});
