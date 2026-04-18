import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import type { ChipTagType, Pack } from '../../data/mockPacks';
import { getLocalizedPackFields } from '../../i18n/packCopy';
import { getMockPackTopHit } from '../../data/mockTopHits';
import { navigationRef } from '../../navigation/navigationRef';

export type LobbyRailVariant = 'new' | 'hot' | 'graded';

const HOT_RAIL = 'rgba(185, 90, 75, 0.45)';
const HOT_BORDER = 'rgba(185, 90, 75, 0.2)';

const GRADED_RAIL = 'rgba(107, 80, 150, 0.4)';
const GRADED_BORDER = 'rgba(107, 80, 150, 0.2)';

const THUMB_FADE = ['transparent', 'rgba(0,0,0,0.08)'] as const;

const CARD_RADIUS = radius.lg;
/** Horizontal gap between tiles (must match LobbyPackRail scroll gap). */
export const LOBBY_TILE_SCROLL_GAP = 16;

/**
 * ~1.35–1.75 cards visible: wide cinematic tiles, image-led (Netflix-style row).
 */
function useLobbyTileSize() {
  const { width: ww } = useWindowDimensions();
  const gutter = spacing.base * 2;
  const avail = Math.max(0, ww - gutter);
  const raw = avail / 1.52 - LOBBY_TILE_SCROLL_GAP * 0.45;
  const tileW = Math.round(Math.min(300, Math.max(200, raw)));
  const thumbH = Math.round(tileW * 0.62);
  return { tileW, thumbH };
}

function priorityTag(pack: Pack, variant: LobbyRailVariant): ChipTagType | undefined {
  const tags = pack.tags ?? [];
  if (variant === 'hot') {
    if (tags.includes('hot_drop')) return 'hot_drop';
    if (tags.includes('chase_boost')) return 'chase_boost';
  }
  if (variant === 'graded' && tags.includes('graded')) return 'graded';
  return tags[0];
}

type Props = { pack: Pack; railVariant: LobbyRailVariant };

/** Large image-first row tiles — title, credits, optional tag only (no dense meta). */
export function LobbyPackTile({ pack, railVariant }: Props) {
  const { t } = useTranslation();
  const { tileW, thumbH } = useLobbyTileSize();
  const loc = getLocalizedPackFields(pack, t);
  const topHit = getMockPackTopHit(pack);
  const accent = pack.imageColor ?? colors.surfaceMuted;
  const imgUri = pack.imageUrl ?? topHit?.imageUrl;

  const tag = useMemo(() => priorityTag(pack, railVariant), [pack, railVariant]);
  const tagLabel = tag ? t(`packCard.shortBadge.${tag}`) : '';

  const isHot = railVariant === 'hot';
  const isGraded = railVariant === 'graded';

  const showHotOverlay =
    isHot && (pack.tags.includes('hot_drop') || pack.tags.includes('chase_boost'));

  return (
    <Pressable
      onPress={() => {
        if (navigationRef.isReady()) navigationRef.navigate('PackDetails', { packId: String(pack.id) });
      }}
      style={({ pressed }) => [
        styles.wrap,
        { width: tileW },
        isHot && styles.wrapHot,
        isGraded && styles.wrapGraded,
        pressed && styles.pressed,
      ]}
    >
      {isHot ? <View style={[styles.railBar, { backgroundColor: HOT_RAIL }]} /> : null}
      {isGraded ? <View style={[styles.railBar, { backgroundColor: GRADED_RAIL }]} /> : null}

      <View style={styles.column}>
        <View style={[styles.thumb, { height: thumbH, backgroundColor: accent }]}>
          {imgUri ? (
            <Image source={{ uri: imgUri }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
          ) : null}
          <LinearGradient
            pointerEvents="none"
            colors={[...THUMB_FADE]}
            locations={[0.82, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          {showHotOverlay ? (
            <View style={styles.hotThumbTag}>
              <Text style={styles.hotThumbTagText}>
                {pack.tags.includes('chase_boost')
                  ? t('packCard.shortBadge.chase_boost')
                  : t('packCard.shortBadge.hot_drop')}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {loc.title}
          </Text>
          <Text style={styles.credits} numberOfLines={1}>
            {pack.creditPrice.toLocaleString()} {t('packCard.credits')}
          </Text>
          {tagLabel ? (
            <View
              style={[
                styles.tagPill,
                isHot && styles.tagPillHot,
                isGraded && styles.tagPillGraded,
              ]}
            >
              <Text
                style={[
                  styles.tagText,
                  isHot && styles.tagTextHot,
                  isGraded && styles.tagTextGraded,
                ]}
                numberOfLines={1}
              >
                {tagLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  wrapHot: {
    borderColor: HOT_BORDER,
  },
  wrapGraded: {
    borderColor: GRADED_BORDER,
  },
  pressed: { opacity: 0.97, transform: [{ scale: 0.99 }] },
  railBar: {
    width: 2,
    alignSelf: 'stretch',
  },
  column: {
    flex: 1,
    minWidth: 0,
  },
  thumb: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  hotThumbTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  hotThumbTagText: {
    fontSize: 10,
    fontFamily: brandFont.medium,
    letterSpacing: 0.6,
    color: colors.redDark,
    textTransform: 'uppercase',
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: 6,
  },
  title: {
    fontSize: fontSize.base,
    fontFamily: brandFont.medium,
    color: colors.textPrimary,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  credits: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.regular,
    color: colors.textMuted,
  },
  tagPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    maxWidth: '100%',
  },
  tagPillHot: {
    backgroundColor: 'rgba(185, 90, 75, 0.08)',
    borderColor: 'rgba(185, 90, 75, 0.22)',
  },
  tagPillGraded: {
    backgroundColor: colors.chipGraded,
    borderColor: colors.chipGradedBorder,
  },
  tagText: {
    fontSize: 10,
    fontFamily: brandFont.medium,
    color: colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  tagTextHot: {
    color: colors.chipHotDropText,
  },
  tagTextGraded: {
    color: colors.chipGradedText,
  },
});
