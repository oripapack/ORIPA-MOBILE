import React, { useCallback } from 'react';
import type { GestureResponderHandlers } from 'react-native';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { sg } from '../../../../tokens/sg';
import { fontSize } from '../../../../tokens/typography';
import { spacing } from '../../../../tokens/spacing';
import { REVEAL_RARITY_VISUAL } from '../rarityTokens';
import type { PackRollResult, RevealCard, RevealRarity } from '../types';
import { usePokePokeGesture } from './usePokePokeGesture';
import { PokePokePackTear } from './PokePokePackTear';
import { PokePokeCardReveal } from './PokePokeCardReveal';
import { PokePokeParticles } from './PokePokeParticles';
import type { Pack } from '../../../../data/mockPacks';

export interface PokePokePackOpenFlowProps {
  roll: PackRollResult;
  revealCard: RevealCard;
  revealRarity: RevealRarity;
  packTint: string;
  packFaceTitle?: string;
  sessionSalt: number;
  replayKey: number;
  skipNonce: number;
  onRevealDone: () => void;
  onStoreInVault?: () => void;
  onSharePull?: () => void;
  /** The actual Pack object (needed for imageUrl / imageColor / category). */
  pack: Pack;
}

export function PokePokePackOpenFlow({
  roll,
  revealCard,
  revealRarity,
  skipNonce,
  onRevealDone,
  pack,
}: PokePokePackOpenFlowProps) {
  const { t } = useTranslation();
  const tv = REVEAL_RARITY_VISUAL[revealRarity];

  const onBurst = useCallback(() => {
    // no-op — burst is handled internally
  }, []);

  const { phase, panHandlers: panHandlersRaw, animValues: av, triggerBurst } = usePokePokeGesture({
    rarity: revealRarity,
    skipNonce,
    onBurst,
    onRevealSettled: onRevealDone,
  });

  const valueText = `🪙 ${roll.creditsWon.toLocaleString()}`;
  const showPack = phase === 'float' || phase === 'tearing' || phase === 'burst';
  const showCard = phase === 'reveal' || phase === 'result';
  const showHint = phase === 'float' || phase === 'tearing';

  return (
    <View style={styles.root}>
      {/* Rarity background glow (appears during reveal) */}
      {(phase === 'reveal' || phase === 'result') ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.rarityBg,
            { opacity: av.auraOpacity },
          ]}
        >
          <LinearGradient
            colors={['transparent', `${tv.glow.replace(/[\d.]+\)$/, '0.35)')}`]}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      ) : null}

      {/* Burst flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={[styles.burstOverlay, { opacity: av.burstOpacity }]}
      />

      {/* Pack + particles centered */}
      <View style={styles.stage}>
        {showPack ? (
          <Animated.View
            style={[
              styles.packWrap,
              { transform: [{ scale: av.packScale }, { translateY: av.floatY }] },
            ]}
          >
            <PokePokePackTear
              pack={pack}
              av={av}
              panHandlers={panHandlersRaw as GestureResponderHandlers}
              hintVisible={showHint}
            />

            {/* Swipe hint arrow */}
            <Animated.View
              pointerEvents="none"
              style={[styles.hintWrap, { opacity: av.hintOpacity }]}
            >
              <Text style={styles.hintArrow}>↑</Text>
              <Text style={styles.hintText}>{t('packOpening.pokepoke.swipeHint', { defaultValue: 'スワイプして開封' })}</Text>
            </Animated.View>
          </Animated.View>
        ) : null}

        {/* Particles (always mounted, triggered by burst) */}
        <PokePokeParticles rarity={revealRarity} trigger={av.particleTrigger} />

        {/* Card reveal */}
        {showCard ? (
          <PokePokeCardReveal
            card={revealCard}
            revealRarity={revealRarity}
            valueText={valueText}
            av={av}
          />
        ) : null}
      </View>

      {/* Rarity badge overlay (shown during reveal/result) */}
      {phase === 'result' ? (
        <Animated.View style={[styles.rarityBadge, { opacity: av.cardOpacity }]}>
          <Text style={[styles.rarityEmoji]}>{tv.emoji}</Text>
          <Text style={[styles.rarityLabel, { color: tv.accent }]}>{tv.label}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rarityBg: {
    ...StyleSheet.absoluteFillObject,
  },
  burstOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packWrap: {
    alignItems: 'center',
  },
  hintWrap: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  hintArrow: {
    fontSize: 28,
    color: sg.text,
    opacity: 0.72,
  },
  hintText: {
    marginTop: 4,
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    letterSpacing: 0.4,
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: spacing.lg,
  },
  rarityEmoji: {
    fontSize: 18,
  },
  rarityLabel: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.display,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
});
