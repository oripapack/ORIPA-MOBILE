import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import type { Pack } from '../../data/mockPacks';
import { getLocalizedPackFields } from '../../i18n/packCopy';
import { mockPackTopHits } from '../../data/mockTopHits';
import { navigationRef } from '../../navigation/navigationRef';

export type LobbyRailVariant = 'new' | 'hot' | 'graded';

const RAIL: Record<LobbyRailVariant, { rail: string; glow: string }> = {
  new: { rail: 'rgba(147,197,253,0.95)', glow: 'rgba(59,130,246,0.18)' },
  hot: { rail: 'rgba(252,165,165,0.95)', glow: 'rgba(220,38,38,0.2)' },
  graded: { rail: 'rgba(216,180,254,0.95)', glow: 'rgba(168,85,247,0.18)' },
};

type Props = { pack: Pack; railVariant: LobbyRailVariant };

/** Product-like tile for horizontal rails — frame + side rail, not a generic mini card. */
export function LobbyPackTile({ pack, railVariant }: Props) {
  const { t } = useTranslation();
  const loc = getLocalizedPackFields(pack, t);
  const topHit = mockPackTopHits[String(pack.id)];
  const accent = pack.imageColor ?? colors.nearBlack;
  const rail = RAIL[railVariant];

  const badge = useMemo(() => {
    const tag = pack.tags?.[0];
    return tag ? t(`packCard.shortBadge.${tag}`) : '';
  }, [pack.tags, t]);

  return (
    <Pressable
      onPress={() => {
        if (navigationRef.isReady()) navigationRef.navigate('PackDetails', { packId: String(pack.id) });
      }}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      <View style={[styles.railBar, { backgroundColor: rail.rail }]} />
      <View style={styles.inner}>
        <View style={[styles.thumb, { backgroundColor: accent }]}>
          {topHit?.imageUrl ? (
            <Image source={{ uri: topHit.imageUrl }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
          ) : null}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.65)']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={[styles.thumbGlow, { backgroundColor: rail.glow }]} />
          <View style={styles.cornerTL} />
          <View style={styles.cornerBR} />
        </View>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {loc.title}
          </Text>
          <Text style={styles.price} numberOfLines={1}>
            {pack.creditPrice.toLocaleString()} {t('packCard.credits')}
            {badge ? ` · ${badge}` : ''}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const W = 158;
const styles = StyleSheet.create({
  wrap: {
    width: W,
    flexDirection: 'row',
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(10,16,12,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  pressed: { opacity: 0.94, transform: [{ scale: 0.985 }] },
  railBar: {
    width: 4,
    alignSelf: 'stretch',
    opacity: 0.85,
  },
  inner: { flex: 1 },
  thumb: {
    height: 104,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  thumbGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  cornerTL: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 12,
    height: 12,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: 'rgba(245,237,214,0.35)',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 12,
    height: 12,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(245,237,214,0.25)',
  },
  body: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    lineHeight: 15,
    letterSpacing: -0.2,
  },
  price: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
});
