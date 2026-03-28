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
  sortMarketplaceListings,
  type ListingCategory,
  type MarketplaceListing,
  type MarketplaceSortId,
} from '../data/marketplace';
import { demoMarketplacePromoImage } from '../data/demoMedia';
import { navigationRef } from '../navigation/navigationRef';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useRequireAuth } from '../hooks/useRequireAuth';

const CATEGORY_KEYS: (ListingCategory | 'all')[] = [
  'all',
  'pokemon',
  'one_piece',
  'yugioh',
  'sports',
];

const SORT_IDS: MarketplaceSortId[] = [
  'recommended',
  'newest',
  'price_low',
  'price_high',
  'sale_first',
];

export function MarketplaceScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { refreshControl } = usePullToRefresh();
  const { requireAuth } = useRequireAuth();
  const searchRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ListingCategory | 'all'>('all');
  const [sort, setSort] = useState<MarketplaceSortId>('recommended');

  const storeNameById = useMemo(() => {
    const m = new Map<string, string>();
    marketplaceStores.forEach((s) => m.set(s.id, s.name));
    return m;
  }, []);

  const totalListingsByStore = useMemo(() => {
    const m = new Map<string, number>();
    marketplaceListings.forEach((l) => {
      m.set(l.storeId, (m.get(l.storeId) ?? 0) + 1);
    });
    return m;
  }, []);

  const filteredListings = useMemo(() => {
    const q = query.trim().toLowerCase();
    return marketplaceListings.filter((l) => {
      if (category !== 'all' && l.category !== category) return false;
      if (!q) return true;
      const storeName = storeNameById.get(l.storeId) ?? '';
      const hay = `${l.title} ${l.subtitle} ${storeName}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, category, storeNameById]);

  const sortedListings = useMemo(
    () => sortMarketplaceListings(filteredListings, sort),
    [filteredListings, sort],
  );

  const saleListings = useMemo(
    () => sortedListings.filter((l) => l.badge === 'sale'),
    [sortedListings],
  );

  const resetBrowse = () => {
    setQuery('');
    setCategory('all');
    setSort('recommended');
  };

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

        {/* Search — market scan */}
        <View style={styles.searchShell}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
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

        {/* Categories */}
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

        {/* Sort */}
        <View style={styles.sortBlock}>
          <Text style={styles.sortLabel}>{t('marketplace.sortRowLabel')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortScroll}
          >
            {SORT_IDS.map((id) => {
              const active = sort === id;
              return (
                <TouchableOpacity
                  key={id}
                  style={[styles.sortChip, active && styles.sortChipActive]}
                  onPress={() => setSort(id)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>
                    {t(`marketplace.sort_${id}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Sale row */}
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

        <WhyChoosePullHub />

        {/* Partner storefronts */}
        <Text style={styles.sectionEyebrow}>{t('marketplace.sectionStores')}</Text>

        {marketplaceStores.map((store) => {
          const rows = sortedListings.filter((l) => {
            if (l.storeId !== store.id) return false;
            if (saleListings.length > 0 && l.badge === 'sale') return false;
            return true;
          });
          if (rows.length === 0) return null;

          const inv = totalListingsByStore.get(store.id) ?? 0;

          return (
            <View key={store.id} style={styles.storeBlock}>
              <View style={styles.storeHeader}>
                <View style={styles.storeTitleRow}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  {store.verified ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={colors.gold}
                      accessibilityLabel={t('marketplace.verified')}
                      style={styles.verifiedIcon}
                    />
                  ) : null}
                </View>

                <Text style={styles.storeMetaLine}>
                  {t('marketplace.inventoryCount', { count: inv })}{' '}
                  <Text style={styles.storeMetaDot}>·</Text>{' '}
                  {t(`marketplace.storeShipping.${store.shippingKey}`)}
                </Text>

                <Text style={styles.storeSpecialty}>{t(`marketplace.storeSpecialty.${store.specialtyKey}`)}</Text>
                <Text style={styles.storeTagline}>{store.tagline}</Text>
                <Text style={styles.partnerLine}>{t('marketplace.partnerProgramLine')}</Text>
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
            </View>
          );
        })}

        {sortedListings.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>{t('marketplace.emptyTitle')}</Text>
            <Text style={styles.emptyHint}>{t('marketplace.emptyHint')}</Text>
            <TouchableOpacity style={styles.emptyCta} onPress={resetBrowse} activeOpacity={0.88}>
              <Text style={styles.emptyCtaText}>{t('marketplace.emptyClearCta')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Compact promo — supporting, after browse */}
        <View style={styles.promoCompact}>
          <Image
            source={{ uri: demoMarketplacePromoImage }}
            style={styles.promoThumb}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
          <View style={styles.promoCopy}>
            <Text style={styles.promoEyebrow}>{t('marketplace.promoEyebrow')}</Text>
            <Text style={styles.promoTitle} numberOfLines={1}>
              {t('marketplace.promoTitle')}
            </Text>
            <Text style={styles.promoBody} numberOfLines={2}>
              {t('marketplace.promoBody')}
            </Text>
          </View>
        </View>

        <View style={styles.demoNote}>
          <Text style={styles.demoNoteText}>{t('marketplace.demoNote')}</Text>
        </View>
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
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    paddingHorizontal: spacing.base,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  lead: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  searchShell: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    minHeight: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  catScroll: {
    paddingHorizontal: spacing.base,
    gap: 8,
    paddingBottom: spacing.sm,
  },
  catChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipActive: {
    backgroundColor: colors.nearBlack,
    borderWidth: 1.5,
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  catChipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  catChipTextActive: {
    color: colors.gold,
    fontWeight: fontWeight.bold,
  },
  sortBlock: {
    marginBottom: spacing.md,
  },
  sortLabel: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xs,
  },
  sortScroll: {
    paddingHorizontal: spacing.base,
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sortChipActive: {
    borderColor: colors.goldSoft,
    backgroundColor: 'rgba(232, 197, 71, 0.08)',
  },
  sortChipText: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  sortChipTextActive: {
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
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  saleTag: {
    backgroundColor: colors.red,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  saleTagText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  hRow: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xs,
  },
  sectionEyebrow: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  storeBlock: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  storeHeader: {
    marginBottom: spacing.sm,
  },
  hRowStore: {
    paddingBottom: spacing.xs,
    marginHorizontal: -2,
  },
  storeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  storeName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  verifiedIcon: {
    marginTop: 1,
  },
  storeMetaLine: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    marginBottom: 2,
  },
  storeMetaDot: {
    color: colors.textMuted,
  },
  storeSpecialty: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
    fontWeight: fontWeight.semibold,
  },
  storeTagline: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  partnerLine: {
    fontSize: 10,
    color: colors.goldDark,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  commission: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  emptyWrap: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  emptyCta: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: 'rgba(232, 197, 71, 0.08)',
  },
  emptyCtaText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.gold,
  },
  promoCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.base,
    marginBottom: spacing.lg,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  promoThumb: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  promoCopy: {
    flex: 1,
  },
  promoEyebrow: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  promoTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.gold,
    marginBottom: 2,
  },
  promoBody: {
    fontSize: 10,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  demoNote: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.demoNoteBorder,
    backgroundColor: colors.demoNoteBg,
  },
  demoNoteText: {
    fontSize: 10,
    color: colors.demoNoteText,
    lineHeight: 16,
    textAlign: 'center',
  },
});
