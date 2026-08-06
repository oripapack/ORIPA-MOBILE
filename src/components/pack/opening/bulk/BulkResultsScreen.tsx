import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Reanimated, {
  Easing,
  FadeInDown,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { hapticPackResult } from '../../../../audio/packOpeningFeedback';
import { sg } from '../../../../tokens/sg';
import { fontSize } from '../../../../tokens/typography';
import { radius, spacing } from '../../../../tokens/spacing';
import { HERO_CARD_STOCK } from '../heroVisualTokens';
import { tierCelebrationFor } from '../tierCelebration';
import { revealRarityFromTier } from '../types';
import { REVEAL_RARITY_VISUAL } from '../rarityTokens';
import type { BulkOpenViewModel, BulkPullItem } from './bulkOpenTypes';

const FLIP_MS = 520;
const GRID_STAGGER_MS = 36;

export type BulkResultsScreenProps = {
  viewModel: BulkOpenViewModel;
  onContinue: () => void;
};

function BulkResultsHeader({ viewModel }: { viewModel: BulkOpenViewModel }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const modeLabel = t('packDetails.multiOpen.fastTitle');

  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <Text style={styles.headerEyebrow}>{modeLabel}</Text>
      <Text style={styles.headerTitle}>
        {t('packOpening.bulkSummaryTitle', { count: viewModel.quantity })}
      </Text>
      <Text style={styles.headerTotal}>
        {t('packOpening.bulkTotalCredits', {
          amount: viewModel.totalCredits.toLocaleString(),
        })}
      </Text>
      {viewModel.tierCounts ? (
        <Text style={styles.headerTierLine} numberOfLines={2}>
          {(['mythic', 'legendary', 'epic', 'rare', 'common'] as const)
            .flatMap((tier) => {
              const n = viewModel.tierCounts[tier];
              if (!n) return [];
              return [`${t(`packOpening.tier_${tier}`)} ×${n}`];
            })
            .join(' · ')}
        </Text>
      ) : null}
    </View>
  );
}

function CardBackFace({ accent }: { accent: string }) {
  return (
    <View style={styles.cardFace}>
      <LinearGradient
        colors={['#12121A', '#0A0A10', '#050508']}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.cardBackDiamond, { borderColor: `${accent}88` }]}>
        <View style={[styles.cardBackDiamondInner, { backgroundColor: `${accent}33` }]} />
      </View>
      <Text style={styles.cardBackMark}>PULL HUB</Text>
    </View>
  );
}

function CardFrontFace({ item }: { item: BulkPullItem }) {
  const { t } = useTranslation();
  const tv = tierCelebrationFor(item.roll.tier);
  const revealRarity = revealRarityFromTier(item.roll.tier);
  const rv = REVEAL_RARITY_VISUAL[revealRarity];
  const hasArt = item.card.artwork != null;
  const monogram = item.card.name.trim().charAt(0).toUpperCase() || '?';

  return (
    <View style={[styles.cardFace, styles.cardFaceFront]}>
      <LinearGradient
        colors={[HERO_CARD_STOCK.frameOuter, HERO_CARD_STOCK.stock]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.cardFrontSpine, { backgroundColor: tv.accent }]} />
      <View style={styles.cardFrontBody}>
        <View style={[styles.cardArtWindow, { borderColor: `${tv.accent}44` }]}>
          {hasArt ? (
            <Image
              source={item.card.artwork}
              style={styles.cardArtImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.cardArtFallback, { backgroundColor: item.card.color }]}>
              <Text style={styles.cardArtEmoji}>{item.card.image}</Text>
              <Text style={styles.cardArtMonogram}>{monogram}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.cardFrontTier, { color: tv.accent }]}>
          {t(`packOpening.tier_${item.roll.tier}`)}
        </Text>
        <Text style={styles.cardFrontName} numberOfLines={2}>
          {item.roll.result}
        </Text>
        <Text style={[styles.cardFrontCredits, { color: rv.accent }]}>
          {t('packOpening.bulkRowCredits', {
            amount: item.roll.creditsWon.toLocaleString(),
          })}
        </Text>
      </View>
    </View>
  );
}

function BulkBestHitHero({
  item,
  onFlipComplete,
}: {
  item: BulkPullItem;
  onFlipComplete: () => void;
}) {
  const { t } = useTranslation();
  const tv = tierCelebrationFor(item.roll.tier);
  const accent = tv.accent;

  const rotation = useSharedValue(0);
  const glow = useSharedValue(0.35);
  const badge = useSharedValue(0);

  const notifyFlipComplete = useCallback(() => {
    hapticPackResult(item.roll.tier);
    onFlipComplete();
  }, [item.roll.tier, onFlipComplete]);

  useEffect(() => {
    rotation.value = withTiming(
      180,
      {
        duration: FLIP_MS,
        easing: Easing.bezier(0.33, 0.86, 0.2, 1),
      },
      (finished) => {
        if (finished) runOnJS(notifyFlipComplete)();
      },
    );

    glow.value = withDelay(
      FLIP_MS * 0.35,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.45, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );

    badge.value = withDelay(
      FLIP_MS * 0.55,
      withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) }),
    );
  }, [badge, glow, notifyFlipComplete, rotation]);

  const flipStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${rotation.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.55,
    transform: [{ scale: 0.92 + glow.value * 0.12 }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badge.value,
    transform: [{ translateY: (1 - badge.value) * 8 }],
  }));

  return (
    <View style={styles.heroWrap}>
      <Reanimated.View style={[styles.heroGlow, { backgroundColor: tv.glow }, glowStyle]} />

      <Reanimated.View style={[styles.heroBadge, badgeStyle]}>
        <LinearGradient
          colors={[`${accent}EE`, `${accent}AA`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBadgeGrad}
        >
          <Text style={styles.heroBadgeText}>{t('packOpening.bulkBestHit')}</Text>
        </LinearGradient>
      </Reanimated.View>

      <Reanimated.View style={[styles.flipContainer, flipStyle]}>
        <View style={[styles.cardShell, { borderColor: `${accent}66`, shadowColor: accent }]}>
          <View style={styles.cardFaceStack}>
            <View style={[styles.cardFaceSide, styles.cardFaceBackSide]}>
              <CardBackFace accent={accent} />
            </View>
            <View style={[styles.cardFaceSide, styles.cardFaceFrontSide]}>
              <CardFrontFace item={item} />
            </View>
          </View>
        </View>
      </Reanimated.View>
    </View>
  );
}

function BulkPoolTile({
  item,
  index,
  columns,
}: {
  item: BulkPullItem;
  index: number;
  columns: number;
}) {
  const { t } = useTranslation();
  const tv = tierCelebrationFor(item.roll.tier);
  const tileW = useMemo(() => `${100 / columns}%` as const, [columns]);

  return (
    <Reanimated.View
      entering={FadeInDown.delay(index * GRID_STAGGER_MS).duration(300)}
      style={[styles.poolTileWrap, { width: tileW }]}
    >
      <View style={[styles.poolTile, { borderColor: `${tv.accent}44` }]}>
        <View style={[styles.poolTileTierBar, { backgroundColor: tv.accent }]} />
        <Text style={[styles.poolTileTier, { color: tv.accent }]} numberOfLines={1}>
          {t(`packOpening.tier_${item.roll.tier}`)}
        </Text>
        <Text style={styles.poolTileName} numberOfLines={2}>
          {item.roll.result}
        </Text>
        <Text style={styles.poolTileCredits}>
          {item.roll.creditsWon.toLocaleString()}
        </Text>
      </View>
    </Reanimated.View>
  );
}

function BulkPoolGrid({
  items,
  columns,
}: {
  items: BulkPullItem[];
  columns: number;
}) {
  const { t } = useTranslation();

  const renderItem = useCallback(
    ({ item, index }: { item: BulkPullItem; index: number }) => (
      <BulkPoolTile item={item} index={index} columns={columns} />
    ),
    [columns],
  );

  const keyExtractor = useCallback(
    (item: BulkPullItem) => `bulk-rest-${item.index}`,
    [],
  );

  return (
    <View style={styles.poolSection}>
      <Text style={styles.poolSectionTitle}>{t('packOpening.bulkOtherPulls')}</Text>
      <FlatList
        data={items}
        key={columns}
        numColumns={columns}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator
        contentContainerStyle={styles.poolListContent}
        columnWrapperStyle={columns > 1 ? styles.poolRow : undefined}
        initialNumToRender={columns * 6}
        maxToRenderPerBatch={columns * 8}
        windowSize={7}
      />
    </View>
  );
}

function BulkResultsFooter({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
      <LinearGradient
        colors={['transparent', 'rgba(2,6,23,0.92)', 'rgba(2,6,23,0.98)']}
        style={styles.footerFade}
        pointerEvents="none"
      />
      <TouchableOpacity
        onPress={onContinue}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel={t('packOpening.continueToWonPrizes')}
        style={styles.footerBtnOuter}
      >
        <LinearGradient
          colors={[sg.gold, sg.goldHi]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.footerBtn}
        >
          <Text style={styles.footerBtnText}>{t('packOpening.continueToWonPrizes')}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

export function BulkResultsScreen({ viewModel, onContinue }: BulkResultsScreenProps) {
  const { width } = useWindowDimensions();
  const [gridReady, setGridReady] = useState(false);

  const columns = width >= 420 ? 4 : 3;

  const onFlipComplete = useCallback(() => {
    setGridReady(true);
  }, []);

  return (
    <View style={styles.root}>
      <BulkResultsHeader viewModel={viewModel} />
      <BulkBestHitHero item={viewModel.best} onFlipComplete={onFlipComplete} />
      {gridReady ? (
        <BulkPoolGrid items={viewModel.rest} columns={columns} />
      ) : (
        <View style={styles.poolPlaceholder} />
      )}
      <BulkResultsFooter onContinue={onContinue} />
    </View>
  );
}

const CARD_W = 220;
const CARD_H = 308;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
    backgroundColor: sg.bg,
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingBottom: sg.space.sm,
    gap: 4,
  },
  headerEyebrow: {
    fontFamily: sg.font.bodyBold,
    fontSize: 10,
    color: sg.muted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontFamily: sg.font.bodyBold,
    fontSize: fontSize.lg,
    color: sg.text,
  },
  headerTotal: {
    fontFamily: sg.font.bodyMedium,
    fontSize: fontSize.sm,
    color: sg.muted,
  },
  headerTierLine: {
    fontFamily: sg.font.bodyMedium,
    fontSize: 11,
    color: sg.muted,
    marginTop: 2,
  },
  heroWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    minHeight: CARD_H + 48,
  },
  heroGlow: {
    position: 'absolute',
    width: CARD_W + 80,
    height: CARD_H + 80,
    borderRadius: 999,
  },
  heroBadge: {
    position: 'absolute',
    top: 0,
    zIndex: 4,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  heroBadgeGrad: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  heroBadgeText: {
    fontFamily: sg.font.bodyBold,
    fontSize: 11,
    color: sg.onGold,
    letterSpacing: 1.6,
  },
  flipContainer: {
    width: CARD_W,
    height: CARD_H,
    marginTop: 24,
  },
  cardShell: {
    width: '100%',
    height: '100%',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 16,
  },
  cardFaceStack: {
    flex: 1,
    position: 'relative',
  },
  cardFaceSide: {
    ...StyleSheet.absoluteFillObject,
    backfaceVisibility: 'hidden',
  },
  cardFaceBackSide: {},
  cardFaceFrontSide: {
    transform: [{ rotateY: '180deg' }],
  },
  cardFace: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFaceFront: {
    alignItems: 'stretch',
  },
  cardBackDiamond: {
    width: 52,
    height: 52,
    borderWidth: 1.5,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  cardBackDiamondInner: {
    width: 28,
    height: 28,
  },
  cardBackMark: {
    fontFamily: sg.font.bodyBold,
    fontSize: 10,
    color: sg.muted,
    letterSpacing: 3,
  },
  cardFrontSpine: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 4,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  cardFrontBody: {
    flex: 1,
    padding: spacing.md,
    paddingLeft: spacing.md + 4,
    gap: 6,
  },
  cardArtWindow: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#020617',
    minHeight: 140,
  },
  cardArtImage: {
    width: '100%',
    height: '100%',
  },
  cardArtFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  cardArtEmoji: {
    fontSize: 36,
  },
  cardArtMonogram: {
    fontFamily: sg.font.bodyBold,
    fontSize: fontSize.lg,
    color: sg.text,
  },
  cardFrontTier: {
    fontFamily: sg.font.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cardFrontName: {
    fontFamily: sg.font.bodyMedium,
    fontSize: fontSize.sm,
    color: sg.text,
    lineHeight: 18,
  },
  cardFrontCredits: {
    fontFamily: sg.font.dataBold,
    fontSize: fontSize.xs,
    fontVariant: [...sg.numeric],
  },
  poolPlaceholder: {
    flex: 1,
    minHeight: 80,
  },
  poolSection: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: spacing.sm,
  },
  poolSectionTitle: {
    fontFamily: sg.font.bodyBold,
    fontSize: fontSize.sm,
    color: sg.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: sg.space.sm,
    paddingHorizontal: sg.space.xs,
  },
  poolListContent: {
    paddingBottom: 120,
  },
  poolRow: {
    gap: spacing.xs,
  },
  poolTileWrap: {
    padding: spacing.xs / 2,
  },
  poolTile: {
    borderRadius: sg.radius.btn,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: sg.surface2,
    padding: sg.space.sm,
    minHeight: 96,
    gap: 4,
    overflow: 'hidden',
    flex: 1,
  },
  poolTileTierBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  poolTileTier: {
    fontFamily: sg.font.bodyBold,
    fontSize: 9,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingLeft: 4,
  },
  poolTileName: {
    fontFamily: sg.font.bodyMedium,
    fontSize: 11,
    color: sg.text,
    lineHeight: 14,
    paddingLeft: 4,
    flex: 1,
  },
  poolTileCredits: {
    fontFamily: sg.font.dataBold,
    fontSize: 11,
    color: sg.muted,
    paddingLeft: 4,
    fontVariant: [...sg.numeric],
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
  },
  footerFade: {
    ...StyleSheet.absoluteFillObject,
    top: -28,
  },
  footerBtnOuter: {
    borderRadius: sg.radius.btn,
    overflow: 'hidden',
    ...sg.shadowHero,
  },
  footerBtn: {
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: sg.radius.btn,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  footerBtnText: {
    fontFamily: sg.font.bodyBold,
    fontSize: fontSize.md,
    color: sg.onGold,
    letterSpacing: 0.3,
  },
});
