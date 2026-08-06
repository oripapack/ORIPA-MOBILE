import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { ChipTagType, Pack, packImageSource } from '../../data/mockPacks';
import { getMockPackTopHit } from '../../data/mockTopHits';
import { getMockPackOdds } from '../../data/mockPackOdds';
import { sg } from '../../tokens/sg';
import { fontSize } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { useAppStore } from '../../store/useAppStore';
import { useMembershipSimulationStore } from '../../store/membershipSimulationStore';
import { membershipMeetsRequired } from '../../data/membershipPlans';
import { getLocalizedPackFields } from '../../i18n/packCopy';
import { navigationRef } from '../../navigation/navigationRef';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { PackOddsModal } from './PackOddsModal';
import type { PackOpenQuantity } from '../../store/useAppStore';

const WIN_W = Dimensions.get('window').width;
const CARD_GUTTER = spacing.base * 2;
const CARD_W = WIN_W - CARD_GUTTER;
const PACK_IMG_H = 184;
const CARD_RADIUS = radius.lg;

const TAG_PRIORITY: ChipTagType[] = [
  'first_time',
  'premium_pack',
  'low_cost',
  'high_return',
  'hot_drop',
  'new_user',
  'chase_boost',
  'best_value',
  'graded',
  'new',
  'bonus_pack',
];

function primaryTag(tags: ChipTagType[]): ChipTagType | undefined {
  const hit = TAG_PRIORITY.find((t) => tags.includes(t));
  return hit ?? tags[0];
}

function secondaryTag(tags: ChipTagType[], primary: ChipTagType | undefined): ChipTagType | undefined {
  if (!primary) return undefined;
  const rest = tags.filter((t) => t !== primary);
  const hit = TAG_PRIORITY.find((t) => rest.includes(t));
  return hit ?? rest[0];
}

interface Props {
  pack: Pack;
  onPress?: () => void;
}

export function PackCard({ pack, onPress }: Props) {
  const { t } = useTranslation();
  const { requireAuth } = useRequireAuth();
  const openPack = useAppStore((s) => s.openPack);
  const isPackOpening = useAppStore((s) => s.modals.packOpening);
  const awaitingFulfillment = useAppStore((s) => s.pendingFulfillmentPullIds.length > 0);
  const usedFirstTimePackIds = useAppStore((s) => s.usedFirstTimePackIds);
  const firstTimeUsed = !!pack.isFirstTimePack && usedFirstTimePackIds.includes(pack.id);
  const simulatedTier = useMembershipSimulationStore((s) => s.simulatedTier);
  const requiredTier = pack.requiredMembershipTier;
  const membershipLocked =
    !!requiredTier && !membershipMeetsRequired(simulatedTier, requiredTier);
  const loc = getLocalizedPackFields(pack, t);
  const topHit = getMockPackTopHit(pack);
  const isChase = !!topHit?.isChase || pack.tags.includes('chase_boost');

  const primary = useMemo(() => primaryTag(pack.tags), [pack.tags]);
  const secondary = useMemo(() => secondaryTag(pack.tags, primary), [pack.tags, primary]);

  const [oddsOpen, setOddsOpen] = useState(false);
  const odds = useMemo(() => getMockPackOdds(pack), [pack]);

  const cardScale = React.useRef(new Animated.Value(1)).current;
  const pressIn = () => {
    Animated.spring(cardScale, { toValue: 0.99, friction: 8, tension: 400, useNativeDriver: true }).start();
  };
  const pressOut = () => {
    Animated.spring(cardScale, { toValue: 1, friction: 8, tension: 400, useNativeDriver: true }).start();
  };

  const ctaBlocked = isPackOpening || awaitingFulfillment || firstTimeUsed;
  const openLockedPack = () => {
    if (navigationRef.isReady()) navigationRef.navigate('Membership');
  };

  const openQty = (qty: PackOpenQuantity) => {
    if (membershipLocked) {
      openLockedPack();
      return;
    }
    requireAuth(() => {
      void openPack(pack, { quantity: qty });
    }, { allowUnauthenticatedPackOpen: true });
  };

  const goDetails = () => {
    if (onPress) onPress();
    else if (navigationRef.isReady()) navigationRef.navigate('PackDetails', { packId: String(pack.id) });
  };

  return (
    <Animated.View
      style={[
        styles.card,
        membershipLocked && styles.cardMemberLocked,
        { transform: [{ scale: cardScale }] },
      ]}
    >
      <Pressable
        onPress={goDetails}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={styles.heroPress}
        accessibilityRole="button"
        accessibilityLabel={loc.title}
      >
        <View style={[styles.hero, { backgroundColor: pack.imageColor ?? sg.surface2 }]}>
          {pack.imageUrl != null ? (
            <>
              <Image
                source={packImageSource(pack.imageUrl)}
                style={styles.heroImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
              />
              <LinearGradient
                pointerEvents="none"
                colors={['transparent', 'rgba(0,0,0,0.38)']}
                locations={[0.72, 1]}
                style={styles.heroFade}
              />
            </>
          ) : (
            <View style={styles.heroFade} pointerEvents="none">
              <Svg width={CARD_W} height={PACK_IMG_H}>
                <Defs>
                  <SvgLinearGradient id={`packImgFade-${pack.id}`} x1="0.5" y1="0" x2="0.5" y2="1">
                    <Stop offset="0" stopColor="#000000" stopOpacity={0} />
                    <Stop offset="0.7" stopColor="#000000" stopOpacity={0.06} />
                    <Stop offset="1" stopColor="#000000" stopOpacity={0.2} />
                  </SvgLinearGradient>
                </Defs>
                <Rect x={0} y={0} width={CARD_W} height={PACK_IMG_H} fill={`url(#packImgFade-${pack.id})`} />
              </Svg>
            </View>
          )}

          {primary ? (
            <View style={styles.badgeCluster} pointerEvents="none">
              <View style={styles.badgeMain}>
                <Text style={styles.badgeMainText}>
                  {t(`packCard.shortBadge.${primary}`, {
                    defaultValue: String(primary).replace(/_/g, ' ').toUpperCase(),
                  })}
                </Text>
              </View>
              {secondary ? (
                <View style={styles.badgeSecondary}>
                  <Text style={styles.badgeSecondaryText}>
                    {t(`packCard.shortBadge.${secondary}`, {
                      defaultValue: String(secondary).replace(/_/g, ' ').toUpperCase(),
                    })}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {membershipLocked && requiredTier ? (
            <View style={styles.memberLockOverlay} pointerEvents="none">
              <View style={styles.memberLockPill}>
                <Text style={styles.memberLockPillText}>
                  {t('membership.benefits.memberPackLockedShort', {
                    tier: t(`membership.tierName_${requiredTier}`),
                  })}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </Pressable>

      <View style={styles.meta}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {loc.title}
        </Text>
        <Text style={styles.productSubtitle} numberOfLines={2}>
          {loc.valueDescription}
        </Text>

        {topHit ? (
          <View style={[styles.topHitWrap, isChase && styles.topHitWrapChase]}>
            <View style={styles.topHitHeader}>
              <Text style={styles.topHitLabel}>{t('packCard.topHit')}</Text>
              {topHit.isChase ? (
                <View style={styles.chasePill}>
                  <Text style={styles.chaseText}>{t('packCard.chase')}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.topHitRow}>
              <Image source={{ uri: topHit.imageUrl }} style={styles.topHitThumb} contentFit="cover" />
              <View style={styles.topHitCopy}>
                <Text style={styles.topHitName} numberOfLines={1}>
                  {topHit.name}
                </Text>
                <View style={styles.topHitMetaRow}>
                  <View style={[styles.rarityPill, topHit.isChase && styles.rarityPillChase]}>
                    <Text style={[styles.rarityText, topHit.isChase && styles.rarityTextChase]}>
                      {topHit.rarity}
                    </Text>
                  </View>
                  <Text style={styles.topHitValue} numberOfLines={1}>
                    {topHit.estValue}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        <Text style={styles.metadataRow}>
          {t('packCard.metadataRow', {
            defaultValue: '{{credits}} Points • {{remaining}} remaining',
            credits: pack.creditPrice.toLocaleString(),
            remaining: pack.remainingInventory.toLocaleString(),
          })}
        </Text>

        {pack.maxPerUser ? (
          <Text style={styles.limitText}>{t('packCard.maxPerUser', { count: pack.maxPerUser })}</Text>
        ) : null}

        <Text style={styles.guaranteeText} numberOfLines={2}>
          {loc.guaranteeText}
        </Text>

        {membershipLocked ? (
          <Pressable
            style={[styles.primaryCta, ctaBlocked && styles.primaryCtaDisabled]}
            onPress={openLockedPack}
            disabled={ctaBlocked}
          >
            <Text style={styles.primaryCtaText}>{t('packCard.unlockMembershipCta')}</Text>
          </Pressable>
        ) : (
          <View style={styles.openOptionsWrap}>
            <Pressable
              style={[styles.primaryCta, ctaBlocked && styles.primaryCtaDisabled]}
              onPress={() => openQty(1)}
              disabled={ctaBlocked}
            >
              <Text style={styles.primaryCtaText}>{t('packCard.openPack')}</Text>
            </Pressable>

            <View style={styles.quickRow}>
              <Pressable
                style={[styles.quickCta, (ctaBlocked || pack.remainingInventory < 10) && styles.quickCtaDisabled]}
                onPress={() => openQty(10)}
                disabled={ctaBlocked || pack.remainingInventory < 10}
              >
                <Text style={styles.quickCtaTitle}>Open 10</Text>
                <Text style={styles.quickCtaSub}>{(pack.creditPrice * 10).toLocaleString()} Points</Text>
              </Pressable>
              <Pressable
                style={[styles.quickCta, (ctaBlocked || pack.remainingInventory < 100) && styles.quickCtaDisabled]}
                onPress={() => openQty(100)}
                disabled={ctaBlocked || pack.remainingInventory < 100}
              >
                <Text style={styles.quickCtaTitle}>Open 100</Text>
                <Text style={styles.quickCtaSub}>{(pack.creditPrice * 100).toLocaleString()} Points</Text>
              </Pressable>
            </View>
          </View>
        )}

        <Pressable onPress={() => setOddsOpen(true)} hitSlop={8} style={styles.oddsLinkHit}>
          <Text style={styles.oddsLink}>{t('home.lobby.viewOdds')}</Text>
        </Pressable>
      </View>

      <PackOddsModal visible={oddsOpen} onClose={() => setOddsOpen(false)} packTitle={loc.title} odds={odds} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: sg.surface,
    borderRadius: CARD_RADIUS,
    marginHorizontal: spacing.base,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
  },
  cardMemberLocked: {
    opacity: 0.92,
  },
  heroPress: {
    overflow: 'hidden',
  },
  hero: {
    height: PACK_IMG_H,
    width: '100%',
    overflow: 'hidden',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: PACK_IMG_H,
  },
  heroFade: {
    ...StyleSheet.absoluteFillObject,
  },
  badgeCluster: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 2,
  },
  badgeMain: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  badgeMainText: {
    fontSize: 10,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
    letterSpacing: 0.8,
  },
  badgeSecondary: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeSecondaryText: {
    fontSize: 10,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
    opacity: 0.9,
    letterSpacing: 0.6,
  },
  memberLockOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  memberLockPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
  },
  memberLockPillText: {
    fontSize: 10,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
    letterSpacing: 0.4,
  },
  meta: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg + 2,
    backgroundColor: sg.surface,
  },
  productTitle: {
    fontSize: fontSize.md,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
    lineHeight: 22,
    marginBottom: spacing.sm,
    letterSpacing: -0.2,
  },
  productSubtitle: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  topHitWrap: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    backgroundColor: sg.surface2,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  topHitWrapChase: {
    borderColor: 'rgba(212,175,55,0.35)',
  },
  topHitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  topHitLabel: {
    fontSize: 10,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  chasePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: sg.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
  },
  chaseText: {
    fontSize: 10,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
    letterSpacing: 0.6,
  },
  topHitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  topHitThumb: {
    width: 44,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: sg.line,
  },
  topHitCopy: {
    flex: 1,
    minWidth: 0,
  },
  topHitName: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
    marginBottom: 6,
  },
  topHitMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rarityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: sg.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
  },
  rarityPillChase: {
    borderColor: 'rgba(212,175,55,0.35)',
  },
  rarityText: {
    fontSize: 10,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
  },
  rarityTextChase: {
    color: sg.gold,
  },
  topHitValue: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
  },
  metadataRow: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  limitText: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.error,
    marginBottom: spacing.sm,
  },
  guaranteeText: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  primaryCta: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: sg.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCtaDisabled: {
    opacity: 0.5,
  },
  primaryCtaText: {
    color: sg.onGold,
    fontSize: fontSize.base,
    fontFamily: sg.font.bodyMedium,
    letterSpacing: 0.2,
  },
  openOptionsWrap: {
    gap: spacing.sm,
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickCta: {
    flex: 1,
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    backgroundColor: sg.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  quickCtaDisabled: {
    opacity: 0.45,
  },
  quickCtaTitle: {
    color: sg.text,
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
  },
  quickCtaSub: {
    color: sg.muted,
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyMedium,
    marginTop: 2,
  },
  oddsLinkHit: {
    alignSelf: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  oddsLink: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.gold,
    textDecorationLine: 'underline',
  },
});
