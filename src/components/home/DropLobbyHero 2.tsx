import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import type { Pack } from '../../data/mockPacks';
import { getLocalizedPackFields } from '../../i18n/packCopy';
import { getMockPackTopHit } from '../../data/mockTopHits';
import { getMockPackOdds } from '../../data/mockPackOdds';
import { PackOddsModal } from '../pack/PackOddsModal';
import { navigationRef } from '../../navigation/navigationRef';
import { useAppStore } from '../../store/useAppStore';
import { useMembershipSimulationStore } from '../../store/membershipSimulationStore';
import { membershipMeetsRequired } from '../../data/membershipPlans';

const W = Dimensions.get('window').width - spacing.base * 2;
const HERO_H = Math.min(192, W * 0.48);
const CARD_RADIUS = radius.lg;

type Props = {
  pack: Pack;
};

/** Featured pack — product-style card (image, copy, single primary CTA). */
export function DropLobbyHero({ pack }: Props) {
  const { t } = useTranslation();
  const loc = getLocalizedPackFields(pack, t);
  const topHit = getMockPackTopHit(pack);
  const odds = useMemo(() => getMockPackOdds(pack), [pack]);
  const [oddsOpen, setOddsOpen] = useState(false);

  const openPack = useAppStore((s) => s.openPack);
  const isPackOpening = useAppStore((s) => s.modals.packOpening);
  const awaitingFulfillment = useAppStore((s) => s.pendingFulfillmentPullIds.length > 0);
  const simulatedTier = useMembershipSimulationStore((s) => s.simulatedTier);
  const requiredTier = pack.requiredMembershipTier;
  const membershipLocked =
    !!requiredTier && !membershipMeetsRequired(simulatedTier, requiredTier);
  const ctaBlocked = isPackOpening || awaitingFulfillment;

  const goDetails = () => {
    if (navigationRef.isReady()) navigationRef.navigate('PackDetails', { packId: String(pack.id) });
  };

  const openLockedPack = () => {
    if (navigationRef.isReady()) navigationRef.navigate('Membership');
  };

  const subtitle = topHit ? `${topHit.name} · ${topHit.estValue}` : loc.valueDescription;

  return (
    <View style={styles.section}>
      <View style={styles.kickerRow}>
        <View style={styles.kickerLine} />
        <Text style={styles.kicker}>{t('home.lobby.featuredKicker')}</Text>
      </View>

      <View style={styles.card}>
        <Pressable
          onPress={goDetails}
          style={({ pressed }) => [styles.heroPress, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={loc.title}
        >
          <View style={[styles.hero, { backgroundColor: pack.imageColor ?? colors.surfaceMuted }]}>
            {pack.imageUrl ? (
              <Image source={{ uri: pack.imageUrl }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
            ) : null}
            <LinearGradient
              pointerEvents="none"
              colors={['transparent', 'rgba(0,0,0,0.14)']}
              locations={[0.82, 1]}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
        </Pressable>

        <View style={styles.meta}>
          <Text style={styles.featuredEyebrow}>{t('home.lobby.featuredEyebrow')}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {loc.title}
          </Text>
          <Text style={styles.sub} numberOfLines={2}>
            {subtitle}
          </Text>

          <Text style={styles.metadataRow}>
            {t('packCard.metadataRow', {
              defaultValue: '{{credits}} credits • {{remaining}} remaining',
              credits: pack.creditPrice.toLocaleString(),
              remaining: pack.remainingInventory.toLocaleString(),
            })}
          </Text>

          <Pressable
            style={[styles.primaryCta, ctaBlocked && styles.primaryCtaDisabled]}
            onPress={() => (membershipLocked ? openLockedPack() : openPack(pack))}
            disabled={ctaBlocked}
          >
            <Text style={styles.primaryCtaText}>
              {membershipLocked ? t('packCard.unlockMembershipCta') : t('packCard.openPack')}
            </Text>
          </Pressable>

          <Pressable onPress={() => setOddsOpen(true)} hitSlop={8} style={styles.oddsLinkHit}>
            <Text style={styles.oddsLink}>{t('home.lobby.viewOdds')}</Text>
          </Pressable>
        </View>
      </View>

      <PackOddsModal visible={oddsOpen} onClose={() => setOddsOpen(false)} packTitle={loc.title} odds={odds} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  kickerLine: {
    width: 28,
    height: 1,
    backgroundColor: colors.border,
  },
  kicker: {
    fontSize: 10,
    fontFamily: brandFont.semibold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  card: {
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.98 },
  heroPress: {
    overflow: 'hidden',
  },
  hero: {
    height: HERO_H,
    width: '100%',
  },
  meta: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg + 2,
    backgroundColor: colors.surfaceElevated,
  },
  featuredEyebrow: {
    fontSize: 10,
    fontFamily: brandFont.semibold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.md,
    fontFamily: brandFont.semibold,
    color: colors.textPrimary,
    letterSpacing: -0.2,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  sub: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  metadataRow: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.regular,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  primaryCta: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.nearBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCtaDisabled: {
    opacity: 0.5,
  },
  primaryCtaText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontFamily: brandFont.semibold,
    letterSpacing: 0.2,
  },
  oddsLinkHit: {
    alignSelf: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  oddsLink: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.medium,
    color: colors.accent,
    textDecorationLine: 'underline',
  },
});
