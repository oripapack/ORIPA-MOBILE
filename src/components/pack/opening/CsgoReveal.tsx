import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { hapticPackReveal, hapticPackResult, type RarityTier } from '../../../audio/packOpeningFeedback';
import { fontSize, fontWeight } from '../../../tokens/typography';
import { radius, spacing } from '../../../tokens/spacing';
import type { HomeNicheCategory } from '../../../data/mockPacks';
import { REVEAL_RARITY_VISUAL } from './rarityTokens';
import { buildCsgoStrip } from './stripGenerator';
import { STAGE } from './sharedStage';
import type { RevealCard } from './types';

const { WIN_W } = STAGE;
const CARD_W = 86;
const GAP = 10;
const CARD_H = 112;

function StripCard({ card, dimmed }: { card: RevealCard; dimmed: boolean }) {
  const tv = REVEAL_RARITY_VISUAL[card.rarity];
  return (
    <View
      style={[
        styles.stripCard,
        {
          borderColor: tv.border,
          shadowColor: tv.glow,
          opacity: dimmed ? 0.45 : 1,
        },
      ]}
    >
      <View style={[styles.cardArt, { backgroundColor: card.color }]}>
        <Text style={styles.cardEmoji}>{card.image}</Text>
      </View>
      <Text style={styles.cardName} numberOfLines={1}>
        {card.name}
      </Text>
    </View>
  );
}

type Props = {
  winningCard: RevealCard;
  sessionSalt: number;
  prizeLine?: HomeNicheCategory;
  replayKey: number;
  skipNonce: number;
  audioTier: RarityTier;
  onComplete: () => void;
};

export function CsgoReveal({
  winningCard,
  sessionSalt,
  prizeLine = 'pokemon',
  replayKey,
  skipNonce,
  audioTier,
  onComplete,
}: Props) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const highlight = useRef(new Animated.Value(0)).current;
  const blurPulse = useRef(new Animated.Value(0)).current;
  const completeRef = useRef(false);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const { strip, winIndex } = useMemo(
    () => buildCsgoStrip(winningCard, sessionSalt, prizeLine),
    [winningCard, sessionSalt, prizeLine, replayKey],
  );
  const targetX = WIN_W / 2 - (winIndex * (CARD_W + GAP) + CARD_W / 2);
  const startX = targetX + WIN_W * 0.92;
  const targetXRef = useRef(targetX);
  targetXRef.current = targetX;

  const runSequence = useCallback(() => {
    completeRef.current = false;
    scrollX.setValue(startX);
    highlight.setValue(0);
    blurPulse.setValue(1);

    const slowEnter = targetX * 0.965;

    const blurLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(blurPulse, {
          toValue: 0.35,
          duration: 90,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(blurPulse, {
          toValue: 0.85,
          duration: 90,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );
    blurLoop.start();

    const main = Animated.sequence([
      Animated.timing(scrollX, {
        toValue: slowEnter,
        duration: 2400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(scrollX, {
        toValue: targetX,
        duration: 2800,
        easing: Easing.bezier(0.12, 0.85, 0.18, 1),
        useNativeDriver: true,
      }),
    ]);

    animRef.current = main;

    main.start(({ finished }) => {
      blurLoop.stop();
      if (!finished) return;
      hapticPackReveal();
      Animated.timing(blurPulse, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();

      Animated.sequence([
        Animated.spring(scrollX, {
          toValue: targetX + 10,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scrollX, {
          toValue: targetX,
          friction: 6,
          tension: 140,
          useNativeDriver: true,
        }),
        Animated.timing(highlight, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        hapticPackResult(audioTier);
        if (!completeRef.current) {
          completeRef.current = true;
          onComplete();
        }
      });
    });
  }, [audioTier, blurPulse, highlight, onComplete, scrollX, startX, targetX]);

  useEffect(() => {
    runSequence();
    return () => {
      animRef.current?.stop();
    };
  }, [replayKey, runSequence]);

  useEffect(() => {
    if (skipNonce === 0) return;
    animRef.current?.stop();
    scrollX.setValue(targetXRef.current);
    highlight.setValue(1);
    blurPulse.setValue(0);
    if (!completeRef.current) {
      completeRef.current = true;
      hapticPackResult(audioTier);
      onComplete();
    }
  }, [audioTier, blurPulse, highlight, onComplete, scrollX, skipNonce]);

  const markerOpacity = highlight.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });

  return (
    <View style={styles.wrap}>
      <View style={styles.centerMarker} pointerEvents="none">
        <Animated.View style={[styles.markerTri, { opacity: markerOpacity }]} />
        <View style={styles.markerLine} />
      </View>

      <View style={styles.mask}>
        <Animated.View
          style={[
            styles.blurVeil,
            {
              opacity: blurPulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.22],
              }),
            },
          ]}
          pointerEvents="none"
        />
        <Animated.View style={[styles.stripRow, { transform: [{ translateX: scrollX }] }]}>
          {strip.map((c, i) => (
            <StripCard key={`${c.id}-${i}`} card={c} dimmed={i !== winIndex} />
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    minHeight: 200,
    justifyContent: 'center',
  },
  mask: {
    width: '100%',
    height: CARD_H + 56,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  blurVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.2)',
    zIndex: 2,
  },
  stripRow: {
    flexDirection: 'row',
    gap: GAP,
    paddingVertical: spacing.sm,
  },
  stripCard: {
    width: CARD_W,
    borderRadius: radius.md,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 6,
    padding: 4,
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  cardArt: {
    height: 64,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardName: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: 'rgba(248,250,252,0.75)',
    textAlign: 'center',
  },
  centerMarker: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 4,
    marginLeft: -2,
    alignItems: 'center',
    zIndex: 10,
  },
  markerLine: {
    position: 'absolute',
    top: 12,
    bottom: 12,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 2,
  },
  markerTri: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255,255,255,0.95)',
  },
});
