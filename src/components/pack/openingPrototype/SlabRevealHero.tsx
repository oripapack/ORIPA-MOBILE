import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { brandFont } from '../../../tokens/typography';
import type { RevealCard } from '../opening/types';

type Props = {
  revealCard: RevealCard;
  slabW: number;
  slabH: number;
  borderColor: string;
  accentColor: string;
};

/**
 * Graded-case style hero: plastic slab frame, optional artwork, holo sweep, monogram fallback.
 */
export function SlabRevealHero({ revealCard, slabW, slabH, borderColor, accentColor }: Props) {
  const { t } = useTranslation();
  const shine = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shine, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(shine, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shine]);

  const shineX = shine.interpolate({
    inputRange: [0, 1],
    outputRange: [-slabW * 0.35, slabW * 1.2],
  });

  const hasArt = revealCard.artwork != null;
  const monogram = revealCard.name.trim().charAt(0).toUpperCase() || '?';

  return (
    <View style={[styles.slabOuter, { width: slabW, height: slabH, borderColor }]}>
      <LinearGradient
        colors={['rgba(248,250,252,0.22)', 'rgba(226,232,240,0.08)', 'rgba(15,23,42,0.35)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.slabBezel} pointerEvents="none" />

      <View style={[styles.labelStrip, { backgroundColor: `${accentColor}33` }]}>
        <Text style={[styles.labelStripText, { color: accentColor }]} numberOfLines={1}>
          {t('packOpening.stageEyebrow')}
        </Text>
      </View>

      <View style={styles.mat}>
        <LinearGradient
          colors={[`${revealCard.color}55`, '#0f172a', '#020617']}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {hasArt ? (
          <Image
            source={revealCard.artwork}
            style={styles.artImage}
            contentFit="cover"
            transition={280}
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={styles.monogramWrap}>
            <Text style={styles.monogram}>{monogram}</Text>
            <Text style={styles.monogramGlyph}>{revealCard.image}</Text>
          </View>
        )}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.holoSheen,
            {
              transform: [{ translateX: shineX }, { skewX: '-14deg' }],
            },
          ]}
        />
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.06)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.vignette}
          pointerEvents="none"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slabOuter: {
    flexDirection: 'column',
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(2,6,23,0.65)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 28,
    elevation: 18,
  },
  slabBezel: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    margin: 5,
  },
  labelStrip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  labelStripText: {
    fontSize: 10,
    fontFamily: brandFont.extraBold,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  mat: {
    flex: 1,
    minHeight: 132,
    marginHorizontal: 10,
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  artImage: {
    ...StyleSheet.absoluteFillObject,
  },
  monogramWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  monogram: {
    fontSize: 56,
    fontFamily: brandFont.black,
    color: 'rgba(248,250,252,0.92)',
    letterSpacing: -2,
  },
  monogramGlyph: {
    fontSize: 28,
    opacity: 0.88,
  },
  holoSheen: {
    position: 'absolute',
    top: -8,
    bottom: -8,
    width: 72,
    marginLeft: -36,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
  },
});
