import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { sg } from '../../../tokens/sg';
import { SgTierTag } from '../../ui';
import type { RevealRarity } from './types';
import type { N2Tier } from '../../../lib/n2Rarity';

const TIER_BY_REVEAL: Record<RevealRarity, N2Tier> = {
  common: 'base',
  rare: 'epic',
  ultra_rare: 'legendary',
  chase: 'mythic',
};

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
  const tier = TIER_BY_REVEAL[revealRarity];

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
        styles.cardOuter,
        {
          transform: hasWalkoutMotion
            ? [{ translateY: walkoutY! }, { scale: walkoutScale! }, { rotate: walkoutRotate! }]
            : undefined,
        },
        style,
      ]}
    >
      <View style={styles.headerRail}>
        <Text style={styles.headerLabel}>PULL RESULT / TERMINAL 01</Text>
        <Text style={styles.headerStatus}>RECORDED</Text>
      </View>
      <View style={styles.cardTop}>
        <View style={styles.valueBlock}>
          <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.55}>
            {creditsWon.toLocaleString()}
          </Text>
          <Text style={styles.valueUnit}>POINTS</Text>
        </View>
        <View style={styles.cardMeta}>
          <View style={styles.tierRow}>
            <Text style={styles.tierLabel}>TIER</Text>
            <SgTierTag tier={tier} context="badge" />
          </View>
          <Text style={styles.resultLabel}>{t('packOpening.youPulled')}</Text>
          <Text style={styles.resultName} numberOfLines={3}>
            {resultText}
          </Text>
        </View>
      </View>
      <View style={styles.cardBar}>
        <Text style={styles.pointsLine}>
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
  enterDurationMs = 520,
  children,
}: {
  visible: boolean;
  instant: boolean;
  /** Breathing room after hero settles before CTAs claim focus */
  enterDelayMs?: number;
  /** Opacity ramp length once delay elapses */
  enterDurationMs?: number;
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
          duration: enterDurationMs,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 11,
          tension: 68,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [visible, instant, enterDelayMs, enterDurationMs, opacity, translateY]);

  if (!visible) return null;

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    width: '100%',
    maxWidth: 340,
    borderRadius: sg.radius.panel,
    borderWidth: 1,
    borderColor: sg.lineStrong,
    overflow: 'hidden',
    backgroundColor: sg.surface,
    ...sg.shadowHero,
  },
  headerRail: {
    minHeight: 30,
    paddingHorizontal: sg.space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: sg.surface2,
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
  },
  headerLabel: {
    fontFamily: sg.font.label,
    fontSize: sg.type.label.fontSize,
    letterSpacing: sg.type.label.letterSpacing,
    color: sg.muted,
  },
  headerStatus: {
    fontFamily: sg.font.dataBold,
    fontSize: sg.type.label.fontSize,
    color: sg.success,
  },
  cardTop: {
    flexDirection: 'row',
    padding: sg.space.lg,
    gap: sg.space.md,
    minHeight: 168,
    backgroundColor: sg.surface,
  },
  valueBlock: {
    width: 92,
    minHeight: 84,
    justifyContent: 'center',
    paddingHorizontal: sg.space.sm,
    backgroundColor: sg.cobaltWash,
    borderLeftWidth: 3,
    borderLeftColor: sg.goldHi,
  },
  value: {
    color: sg.text,
    fontSize: 22,
    fontFamily: sg.font.dataBold,
    letterSpacing: -0.5,
    fontVariant: [...sg.numeric],
  },
  valueUnit: {
    color: sg.muted,
    fontSize: sg.type.label.fontSize,
    fontFamily: sg.font.label,
    marginTop: sg.space.xs,
    letterSpacing: sg.type.label.letterSpacing,
  },
  cardMeta: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  tierRow: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.sm,
    marginBottom: sg.space.sm,
  },
  tierLabel: {
    color: sg.muted,
    fontSize: sg.type.label.fontSize,
    fontFamily: sg.font.label,
    letterSpacing: sg.type.label.letterSpacing,
  },
  resultLabel: {
    color: sg.muted,
    fontSize: sg.type.label.fontSize,
    fontFamily: sg.font.label,
    letterSpacing: sg.type.label.letterSpacing,
    textTransform: 'uppercase',
    marginBottom: sg.space.xs,
  },
  resultName: {
    color: sg.text,
    fontSize: 18,
    fontFamily: sg.font.display,
    lineHeight: 21,
  },
  cardBar: {
    backgroundColor: sg.surface2,
    paddingVertical: sg.space.md,
    paddingHorizontal: sg.space.lg,
    borderTopWidth: 1,
    borderTopColor: sg.line,
  },
  pointsLine: {
    color: sg.goldHi,
    fontSize: 20,
    fontFamily: sg.font.dataBold,
    textAlign: 'center',
    letterSpacing: 0.5,
    fontVariant: [...sg.numeric],
  },
  cardShine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 72,
    marginLeft: -36,
    backgroundColor: sg.cardShine,
    transform: [{ skewX: '-18deg' }],
  },
});
