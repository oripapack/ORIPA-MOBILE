import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { fontSize, fontWeight } from '../../../tokens/typography';
import { spacing } from '../../../tokens/spacing';
import { REVEAL_RARITY_VISUAL } from './rarityTokens';
import type { RevealRarity } from './types';

type Props = {
  creditsWon: number;
  resultText: string;
  revealRarity: RevealRarity;
  /** Animated flip / scale wrapper values from parent, or static */
  walkoutY?: Animated.Value;
  walkoutScale?: Animated.Value;
  walkoutRotate?: Animated.AnimatedInterpolation<string | number>;
  cardShine?: Animated.Value;
  style?: ViewStyle;
};

export function RevealResultCard({
  creditsWon,
  resultText,
  revealRarity,
  walkoutY,
  walkoutScale,
  walkoutRotate,
  cardShine,
  style,
}: Props) {
  const { t } = useTranslation();
  const tv = REVEAL_RARITY_VISUAL[revealRarity];

  const shineX =
    cardShine?.interpolate({
      inputRange: [0, 1],
      outputRange: [-120, 220],
    }) ?? new Animated.Value(0);

  const hasWalkoutMotion =
    walkoutY != null && walkoutScale != null && walkoutRotate != null;

  return (
    <Animated.View
      style={[
        styles.fifaCardOuter,
        {
          borderColor: tv.border,
          shadowColor: tv.glow,
          transform: hasWalkoutMotion
            ? [{ translateY: walkoutY! }, { scale: walkoutScale! }, { rotate: walkoutRotate! }]
            : undefined,
        },
        style,
      ]}
    >
      <View style={[styles.fifaCardTop, { backgroundColor: tv.cardTop }]}>
        <View style={[styles.ovrCircle, { backgroundColor: tv.ovrBg }]}>
          <Text style={styles.ovrNum} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.45}>
            {creditsWon.toLocaleString()}
          </Text>
          <Text style={styles.ovrLbl}>CR</Text>
        </View>
        <View style={styles.fifaCardMeta}>
          <Text style={[styles.fifaTierLbl, { color: tv.accent }]}>
            {tv.emoji} {tv.label}
          </Text>
          <Text style={styles.fifaHead}>{t('packOpening.youPulled')}</Text>
          <Text style={styles.fifaName} numberOfLines={3}>
            {resultText}
          </Text>
        </View>
      </View>
      <View style={styles.fifaCardBar}>
        <Text style={[styles.fifaCreditsBig, { color: tv.accent }]}>
          {t('packOpening.creditsLabel', {
            amount: creditsWon.toLocaleString(),
          })}
        </Text>
      </View>
      {cardShine ? (
        <Animated.View
          style={[
            styles.cardShine,
            {
              opacity: cardShine,
              transform: [{ translateX: shineX }],
            },
          ]}
        />
      ) : null}
    </Animated.View>
  );
}

export function RevealCtaFade({
  visible,
  instant,
  enterDelayMs = 520,
  children,
}: {
  visible: boolean;
  instant: boolean;
  /** Breathing room after hero settles before CTAs claim focus */
  enterDelayMs?: number;
  children: React.ReactNode;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(22)).current;

  useEffect(() => {
    if (!visible) {
      opacity.setValue(0);
      translateY.setValue(22);
      return;
    }
    if (instant) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }
    translateY.setValue(22);
    opacity.setValue(0);
    Animated.sequence([
      Animated.delay(enterDelayMs),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 9,
          tension: 98,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [visible, instant, enterDelayMs, opacity, translateY]);

  if (!visible) return null;

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>
  );
}

const styles = StyleSheet.create({
  fifaCardOuter: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    borderWidth: 3,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 16,
  },
  fifaCardTop: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    minHeight: 168,
  },
  ovrCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  ovrNum: {
    color: '#fff',
    fontSize: 20,
    fontWeight: fontWeight.black,
    letterSpacing: -0.5,
  },
  ovrLbl: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    fontWeight: fontWeight.bold,
    marginTop: 2,
    letterSpacing: 2,
  },
  fifaCardMeta: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  fifaTierLbl: {
    fontSize: 11,
    fontWeight: fontWeight.black,
    letterSpacing: 2,
    marginBottom: 6,
  },
  fifaHead: {
    color: 'rgba(248,250,252,0.55)',
    fontSize: 10,
    fontWeight: fontWeight.bold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  fifaName: {
    color: '#F8FAFC',
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    lineHeight: 22,
  },
  fifaCardBar: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  fifaCreditsBig: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  cardShine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 72,
    marginLeft: -36,
    backgroundColor: 'rgba(255,255,255,0.14)',
    transform: [{ skewX: '-18deg' }],
  },
});
