import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
  Modal,
  Pressable,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  Easing,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../components/shared/AppHeader';
import { HomeBackground } from '../components/shared/HomeBackground';
import { ListingCard } from '../components/marketplace/ListingCard';
import { WhyChoosePullHub } from '../components/marketplace/WhyChoosePullHub';
import { colors } from '../tokens/colors';
import { fontSize, brandFont } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import {
  marketplaceStores,
  marketplaceListings,
  sortMarketplaceListings,
  filterListingsByRegion,
  getStoreById,
  type ListingCategory,
  type MarketplaceListing,
  type MarketplaceRegionFilterId,
  type MarketplaceSortId,
} from '../data/marketplace';
import { demoMarketplacePromoImage } from '../data/demoMedia';
import { navigationRef } from '../navigation/navigationRef';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { ShopCoach } from '../components/coach/ShopCoach';

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

const REGION_FILTER_IDS: MarketplaceRegionFilterId[] = ['all', 'us', 'japan', 'europe'];

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function bumpMarketplaceLayout() {
  LayoutAnimation.configureNext(
    LayoutAnimation.create(200, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity),
  );
}

export function MarketplaceScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { requireAuth } = useRequireAuth();
  const searchRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ListingCategory | 'all'>('all');
  const [sort, setSort] = useState<MarketplaceSortId>('recommended');
  const [regionFilter, setRegionFilter] = useState<MarketplaceRegionFilterId>('all');
  const [filtersModalVisible, setFiltersModalVisible] = useState(false);
  const filtersVisibleRef = useRef(false);
  const backdropOp = useRef(new Animated.Value(0)).current;
  const sheetSlide = useRef(new Animated.Value(1)).current;
  const resultsOpacity = useRef(new Animated.Value(1)).current;

  const closeFilters = useCallback(() => {
    if (!filtersVisibleRef.current) return;
    Animated.parallel([
      Animated.timing(backdropOp, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sheetSlide, {
        toValue: 1,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setFiltersModalVisible(false);
    });
  }, [backdropOp, sheetSlide]);

  const openFilters = useCallback(() => {
    Keyboard.dismiss();
    setFiltersModalVisible(true);
  }, []);

  useLayoutEffect(() => {
    filtersVisibleRef.current = filtersModalVisible;
    if (!filtersModalVisible) return undefined;
    backdropOp.setValue(0);
    sheetSlide.setValue(1);
    const anim = Animated.parallel([
      Animated.timing(backdropOp, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(sheetSlide, {
        toValue: 0,
        damping: 26,
        stiffness: 280,
        useNativeDriver: true,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [filtersModalVisible, backdropOp, sheetSlide]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (sort !== 'recommended') n += 1;
    if (regionFilter !== 'all') n += 1;
    return n;
  }, [sort, regionFilter]);

  const storeNameById = useMemo(() => {
    const m = new Map<string, string>();
    marketplaceStores.forEach((s) => m.set(s.id, s.name));
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

  const regionFilteredListings = useMemo(
    () => filterListingsByRegion(filteredListings, regionFilter),
    [filteredListings, regionFilter],
  );

  const sortedListings = useMemo(
    () =>
      sortMarketplaceListings(regionFilteredListings, sort, {
        regionFilterAllWithLocalBoost: regionFilter === 'all' && sort === 'recommended',
      }),
    [regionFilteredListings, sort, regionFilter],
  );

  const saleListings = useMemo(
    () => sortedListings.filter((l) => l.badge === 'sale'),
    [sortedListings],
  );

  const storeSections = useMemo(() => {
    return marketplaceStores
      .map((store) => {
        const rows = sortedListings.filter((l) => {
          if (l.storeId !== store.id) return false;
          if (saleListings.length > 0 && l.badge === 'sale') return false;
          return true;
        });
        if (rows.length === 0) return null;
        const inv = sortedListings.filter((l) => l.storeId === store.id).length;
        return { store, rows, inv };
      })
      .filter((s): s is NonNullable<typeof s> => s != null);
  }, [sortedListings, saleListings]);

  const resetBrowse = () => {
    bumpMarketplaceLayout();
    setQuery('');
    setCategory('all');
    setSort('recommended');
    setRegionFilter('all');
    Keyboard.dismiss();
    closeFilters();
  };

  const hasResults = sortedListings.length > 0;

  useEffect(() => {
    if (!hasResults) return undefined;
    resultsOpacity.stopAnimation();
    resultsOpacity.setValue(0.45);
    const pulse = Animated.timing(resultsOpacity, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    pulse.start();
    return () => pulse.stop();
  }, [sortedListings.length, sort, regionFilter, category, query, hasResults, resultsOpacity]);

  const regionShortLabel = (storeId: string) => {
    const s = getStoreById(storeId);
    return s ? t(`marketplace.regionPill.${s.fulfillmentRegion}`) : undefined;
  };

  const shipsFromLineForStore = (store: (typeof marketplaceStores)[number]) =>
    t('marketplace.shipsFromLine', { place: t(`marketplace.shipsFromPlace.${store.fulfillmentRegion}`) });

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
      <HomeBackground />
      <AppHeader onSearch={() => searchRef.current?.focus()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={[styles.pageTitle, { paddingTop: spacing.sm }]}>{t('marketplace.storeTitle')}</Text>
        <Text style={styles.lead}>{t('marketplace.storeLead')}</Text>

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
            onSubmitEditing={() => Keyboard.dismiss()}
            accessibilityLabel={t('marketplace.searchA11yLabel')}
          />
          {query.length > 0 ? (
            <TouchableOpacity
              onPress={() => {
                setQuery('');
                searchRef.current?.focus();
              }}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={t('marketplace.clearSearchA11y')}
            >
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.catRow}>
          {/*
            Wrap horizontal ScrollView so it cannot paint under the filter control (flex + RN scroll
            sizing). overflow: 'hidden' clips chips; flexShrink: 0 reserves a fixed lane for the button.
          */}
          <View style={styles.catScrollOuter}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.catScrollView}
              contentContainerStyle={styles.catScroll}
            >
              {CATEGORY_KEYS.map((key) => {
                const active = category === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.catChip, active && styles.catChipActive]}
                    onPress={() => {
                      bumpMarketplaceLayout();
                      setCategory(key);
                    }}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                      {t(`marketplace.cat_${key}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          <TouchableOpacity
            style={styles.filterFab}
            onPress={openFilters}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('marketplace.openFiltersA11y')}
          >
            <Ionicons name="options-outline" size={22} color={colors.textPrimary} />
            {activeFilterCount > 0 ? (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        {hasResults ? (
          <View accessibilityLiveRegion="polite">
            <Animated.Text style={[styles.resultsMeta, { opacity: resultsOpacity }]}>
              {t('marketplace.resultsCount', { count: sortedListings.length })}
            </Animated.Text>
          </View>
        ) : null}

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
                  shipsFromShort={regionFilter === 'all' ? regionShortLabel(listing.storeId) : undefined}
                  onPress={() => onListingPress(listing)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {storeSections.length > 0 ? (
          <>
            <Text style={styles.sectionEyebrow}>{t('marketplace.sectionStores')}</Text>
            {storeSections.map(({ store, rows, inv }) => (
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

                  <Text style={styles.storeShipsFrom}>{shipsFromLineForStore(store)}</Text>
                  {store.crossBorderKey ? (
                    <Text style={styles.storeCrossBorder}>
                      {t(`marketplace.storeCrossBorder.${store.crossBorderKey}`)}
                    </Text>
                  ) : null}

                  <Text style={styles.storeMetaLine}>
                    {t('marketplace.inventoryCount', { count: inv })}{' '}
                    <Text style={styles.storeMetaDot}>·</Text>{' '}
                    {t(`marketplace.storeShipping.${store.shippingKey}`)}
                  </Text>

                  <Text style={styles.storeSpecialty}>{t(`marketplace.storeSpecialty.${store.specialtyKey}`)}</Text>
                  <Text style={styles.storeTagline}>{store.tagline}</Text>
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
                      shipsFromShort={regionFilter === 'all' ? regionShortLabel(listing.storeId) : undefined}
                      onPress={() => onListingPress(listing)}
                    />
                  ))}
                </ScrollView>
              </View>
            ))}
          </>
        ) : null}

        {!hasResults ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>{t('marketplace.emptyTitle')}</Text>
            <Text style={styles.emptyHint}>{t('marketplace.emptyHint')}</Text>
            <TouchableOpacity style={styles.emptyCta} onPress={resetBrowse} activeOpacity={0.88}>
              <Text style={styles.emptyCtaText}>{t('marketplace.emptyClearCta')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {hasResults ? (
          <>
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

            <WhyChoosePullHub />

            <View style={styles.demoNote}>
              <Text style={styles.demoNoteText}>{t('marketplace.demoNote')}</Text>
            </View>
          </>
        ) : (
          <View style={[styles.demoNote, styles.demoNoteEmpty]}>
            <Text style={styles.demoNoteText}>{t('marketplace.demoNote')}</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={filtersModalVisible}
        animationType="none"
        transparent
        onRequestClose={closeFilters}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdropHit} onPress={closeFilters} accessibilityRole="button">
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: 'rgba(2,6,23,1)',
                  opacity: backdropOp.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }),
                },
              ]}
            />
          </Pressable>
          <Animated.View
            style={[
              styles.modalSheet,
              {
                paddingBottom: insets.bottom + spacing.lg,
                transform: [
                  {
                    translateY: sheetSlide.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 140],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.modalGrabber} />
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{t('marketplace.filtersModalTitle')}</Text>
              <TouchableOpacity
                onPress={closeFilters}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t('marketplace.filtersDone')}
              >
                <Ionicons name="close" size={26} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSectionLabel}>{t('marketplace.sortRowLabel')}</Text>
            <View style={styles.modalChipWrap}>
              {SORT_IDS.map((id) => {
                const active = sort === id;
                return (
                  <TouchableOpacity
                    key={id}
                    style={[styles.sortChip, active && styles.sortChipActive]}
                    onPress={() => {
                      bumpMarketplaceLayout();
                      setSort(id);
                    }}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>
                      {t(`marketplace.sort_${id}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.modalSectionLabel, styles.modalSectionLabelSpaced]}>
              {t('marketplace.regionRowLabel')}
            </Text>
            <View style={styles.modalChipWrap}>
              {REGION_FILTER_IDS.map((id) => {
                const active = regionFilter === id;
                return (
                  <TouchableOpacity
                    key={id}
                    style={[styles.regionChip, active && styles.regionChipActive]}
                    onPress={() => {
                      bumpMarketplaceLayout();
                      setRegionFilter(id);
                    }}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.regionChipText, active && styles.regionChipTextActive]}>
                      {t(`marketplace.region_${id}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalResetBtn}
                onPress={() => {
                  bumpMarketplaceLayout();
                  setSort('recommended');
                  setRegionFilter('all');
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.modalResetText}>{t('marketplace.filtersReset')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDoneBtn} onPress={closeFilters} activeOpacity={0.88}>
                <Text style={styles.modalDoneText}>{t('marketplace.filtersDone')}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <ShopCoach />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.homeGradientBottom,
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: 0,
  },
  pageTitle: {
    fontSize: fontSize.xl,
    fontFamily: brandFont.black,
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
    minWidth: 0,
  },
  resultsMeta: {
    fontSize: 11,
    fontFamily: brandFont.semibold,
    color: colors.textMuted,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingLeft: spacing.base,
    paddingRight: spacing.base,
  },
  catScrollOuter: {
    flex: 1,
    minWidth: 0,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  catScrollView: {
    width: '100%',
  },
  catScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: spacing.xs,
    paddingVertical: 2,
  },
  filterFab: {
    position: 'relative',
    flexShrink: 0,
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.background,
  },
  filterBadgeText: {
    fontSize: 9,
    fontFamily: brandFont.black,
    color: colors.nearBlack,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdropHit: {
    ...StyleSheet.absoluteFillObject,
  },
  modalSheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  modalGrabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    flex: 1,
    paddingRight: spacing.sm,
  },
  modalSectionLabel: {
    fontSize: 10,
    fontFamily: brandFont.bold,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  modalSectionLabelSpaced: {
    marginTop: spacing.md,
  },
  modalChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.sm,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalResetBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  modalResetText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: colors.textMuted,
  },
  modalDoneBtn: {
    flex: 1,
    backgroundColor: colors.nearBlack,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalDoneText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: colors.white,
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
    fontFamily: brandFont.semibold,
    color: colors.textSecondary,
  },
  catChipTextActive: {
    color: colors.gold,
    fontFamily: brandFont.bold,
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
    borderColor: colors.accentBorder,
    backgroundColor: colors.accentSoft,
  },
  sortChipText: {
    fontSize: 11,
    fontFamily: brandFont.semibold,
    color: colors.textMuted,
  },
  sortChipTextActive: {
    color: colors.accentDark,
  },
  regionChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  regionChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  regionChipText: {
    fontSize: 11,
    fontFamily: brandFont.semibold,
    color: colors.textSecondary,
  },
  regionChipTextActive: {
    color: colors.accentDark,
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
    fontFamily: brandFont.black,
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
    fontFamily: brandFont.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  hRow: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xs,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontFamily: brandFont.bold,
    color: colors.textSecondary,
    letterSpacing: 0.2,
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
    fontFamily: brandFont.black,
    color: colors.textPrimary,
  },
  verifiedIcon: {
    marginTop: 1,
  },
  storeShipsFrom: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: colors.textPrimary,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  storeCrossBorder: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 4,
    lineHeight: 15,
  },
  storeMetaLine: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: brandFont.medium,
    marginBottom: 2,
  },
  storeMetaDot: {
    color: colors.textMuted,
  },
  storeSpecialty: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
    fontFamily: brandFont.semibold,
  },
  storeTagline: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
    lineHeight: 18,
  },
  emptyWrap: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontFamily: brandFont.bold,
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
    borderColor: colors.accentBorder,
    backgroundColor: colors.accentSoft,
  },
  emptyCtaText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: colors.accentDark,
  },
  promoCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.base,
    marginTop: spacing.md,
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
    fontFamily: brandFont.bold,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  promoTitle: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: colors.gold,
    marginBottom: 2,
  },
  promoBody: {
    fontSize: 10,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  demoNoteEmpty: {
    marginTop: spacing.md,
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
