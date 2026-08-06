import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { ChipTagType, Pack, packImageSource } from '../../data/mockPacks';
import { getMockPackTopHit } from '../../data/mockTopHits';
import { getMockPackOdds } from '../../data/mockPackOdds';
import { sg } from '../../tokens/sg';
import { AssetBlockedCard } from '../shared/AssetBlockedCard';
import { useAppStore } from '../../store/useAppStore';
import { useMembershipSimulationStore } from '../../store/membershipSimulationStore';
import { membershipMeetsRequired } from '../../data/membershipPlans';
import { getLocalizedPackFields } from '../../i18n/packCopy';
import { navigationRef } from '../../navigation/navigationRef';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { PackOddsModal } from './PackOddsModal';
import type { PackOpenQuantity } from '../../store/useAppStore';

const PACK_IMG_H = 184;
const CARD_RADIUS = sg.radius.panel;

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
  const displayTags = useMemo(() => pack.tags.filter((tag) => tag !== 'graded'), [pack.tags]);

  const primary = useMemo(() => primaryTag(displayTags), [displayTags]);
  const secondary = useMemo(() => secondaryTag(displayTags, primary), [displayTags, primary]);

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
        <View style={styles.hero}>
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
            <View style={styles.packArtPending} pointerEvents="none">
              <View style={styles.packArtDummy} />
              <Text style={styles.packArtPendingText}>PACK ART PENDING</Text>
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
              <View style={styles.topHitThumb}>
                <AssetBlockedCard label="MEDIA PENDING" compact />
              </View>
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
    marginHorizontal: sg.space.md,
    marginBottom: sg.space.lg,
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
    backgroundColor: sg.surface2,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: PACK_IMG_H,
  },
  heroFade: {
    ...StyleSheet.absoluteFillObject,
  },
  packArtPending: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: sg.space.sm,
  },
  packArtDummy: {
    width: 56,
    height: 80,
    borderRadius: sg.radius.tag,
    borderWidth: 1,
    borderColor: sg.line,
    backgroundColor: sg.surface,
  },
  packArtPendingText: {
    fontFamily: sg.font.dataBold,
    fontSize: 9,
    letterSpacing: 0.9,
    color: sg.muted,
  },
  badgeCluster: {
    position: 'absolute',
    top: sg.space.md,
    right: sg.space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 2,
  },
  badgeMain: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: sg.radius.tag,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  badgeMainText: {
    fontSize: 10,
    fontFamily: sg.font.bodyMedium,
    color: sg.onInk,
    letterSpacing: 0.8,
  },
  badgeSecondary: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: sg.radius.tag,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeSecondaryText: {
    fontSize: 10,
    fontFamily: sg.font.bodyMedium,
    color: sg.onInk,
    opacity: 0.9,
    letterSpacing: 0.6,
  },
  memberLockOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
    justifyContent: 'flex-end',
    padding: sg.space.md,
  },
  memberLockPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: sg.space.sm,
    paddingVertical: 5,
    borderRadius: sg.radius.tag,
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
  },
  memberLockPillText: {
    fontSize: 10,
    fontFamily: sg.font.bodyMedium,
    color: sg.onInk,
    letterSpacing: 0.4,
  },
  meta: {
    paddingHorizontal: sg.space.lg,
    paddingTop: sg.space.lg,
    paddingBottom: sg.space.lg + 2,
    backgroundColor: sg.surface,
  },
  productTitle: {
    fontSize: sg.type.md,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
    lineHeight: 22,
    marginBottom: sg.space.sm,
    letterSpacing: -0.2,
  },
  productSubtitle: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 20,
    marginBottom: sg.space.md,
  },
  topHitWrap: {
    borderRadius: sg.radius.btn,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    backgroundColor: sg.surface2,
    padding: sg.space.md,
    marginBottom: sg.space.lg,
  },
  topHitWrapChase: {
    borderColor: sg.accentLine,
  },
  topHitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sg.space.sm,
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
    borderRadius: sg.radius.tag,
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
    gap: sg.space.md,
  },
  topHitThumb: {
    width: 44,
    height: 56,
    borderRadius: sg.radius.tag,
    backgroundColor: sg.line,
  },
  topHitCopy: {
    flex: 1,
    minWidth: 0,
  },
  topHitName: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
    marginBottom: 6,
  },
  topHitMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: sg.space.sm,
  },
  rarityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: sg.radius.tag,
    backgroundColor: sg.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
  },
  rarityPillChase: {
    borderColor: sg.accentLine,
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
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
  },
  metadataRow: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    marginBottom: sg.space.lg,
    lineHeight: 20,
  },
  limitText: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.error,
    marginBottom: sg.space.sm,
  },
  guaranteeText: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 18,
    marginBottom: sg.space.lg,
  },
  primaryCta: {
    height: 48,
    borderRadius: sg.radius.btn,
    backgroundColor: sg.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCtaDisabled: {
    opacity: 0.5,
  },
  primaryCtaText: {
    color: sg.onGold,
    fontSize: sg.type.base,
    fontFamily: sg.font.bodyMedium,
    letterSpacing: 0.2,
  },
  openOptionsWrap: {
    gap: sg.space.sm,
  },
  quickRow: {
    flexDirection: 'row',
    gap: sg.space.sm,
  },
  quickCta: {
    flex: 1,
    minHeight: 54,
    borderRadius: sg.radius.btn,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    backgroundColor: sg.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sg.space.sm,
    paddingVertical: sg.space.sm,
  },
  quickCtaDisabled: {
    opacity: 0.45,
  },
  quickCtaTitle: {
    color: sg.text,
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyMedium,
  },
  quickCtaSub: {
    color: sg.muted,
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyMedium,
    marginTop: 2,
  },
  oddsLinkHit: {
    alignSelf: 'center',
    marginTop: sg.space.md,
    paddingVertical: sg.space.xs,
  },
  oddsLink: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.gold,
    textDecorationLine: 'underline',
  },
});
