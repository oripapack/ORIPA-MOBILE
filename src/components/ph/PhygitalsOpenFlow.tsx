import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Pack } from '../../data/mockPacks';
import type { RevealRarity } from '../../../shared/types/pack';
import { ph } from '../../tokens/phTheme';
import { brandFont, fontSize } from '../../tokens/typography';
import { PackVisual } from './PackVisual';
import { PhButton } from './PhButton';

type Stage = 'hidden' | 'metadata' | 'result';

const R_LABEL: Record<RevealRarity, string> = {
  common: 'COMMON',
  rare: 'RARE',
  ultra: 'ULTRA RARE',
  chase: 'CHASE',
};

const R_COLOR: Record<RevealRarity, string> = {
  common: ph.reveal.common,
  rare: ph.reveal.rare,
  ultra: ph.reveal.ultra,
  chase: ph.reveal.chase,
};

const R_GRADIENT: Record<RevealRarity, [string, string]> = {
  common: ['#1e293b', '#0f172a'],
  rare: ['#1e3a5f', '#0c1a2e'],
  ultra: ['#2d1b4e', '#130a24'],
  chase: ['#3d2a0a', '#1a1204'],
};

export type PhygitalsOpenFlowProps = {
  pack: Pack;
  onRevealDone: () => void;
  onStoreInVault?: () => void;
  skipNonce: number;
};

function SlabBack({ rarity }: { rarity: RevealRarity }) {
  const color = R_COLOR[rarity];
  return (
    <View style={styles.slab}>
      <View style={styles.slabTop}>
        <Text style={styles.slabBrand}>PULL HUB</Text>
        <Text style={styles.slabAuth}>AUTHENTICATED</Text>
      </View>
      <View style={styles.slabBack}>
        <Text style={styles.question}>?</Text>
      </View>
      <View style={styles.slabBottom}>
        <Text style={styles.slabBottomText}>Secure Vault Storage</Text>
      </View>
    </View>
  );
}

function SlabFront({
  cardName,
  grade,
  year,
  rarity,
}: {
  cardName: string;
  grade: string;
  year: string;
  rarity: RevealRarity;
}) {
  const [from, to] = R_GRADIENT[rarity];
  const color = R_COLOR[rarity];
  return (
    <View style={[styles.slab, styles.slabFront, { borderColor: ph.borderHigh }]}>
      <View style={styles.slabTop}>
        <Text style={styles.slabBrand}>PULL HUB</Text>
        <Text style={[styles.gradeText, { color }]}>{grade}</Text>
      </View>
      <LinearGradient colors={[from, to]} style={styles.slabFace}>
        <View style={[styles.slabArt, { borderColor: `${color}30` }]} />
        <Text style={styles.cardName}>{cardName}</Text>
      </LinearGradient>
      <View style={styles.slabBottom}>
        <Text style={styles.slabBottomText}>{year} · Verified · Authenticated</Text>
      </View>
    </View>
  );
}

export function PhygitalsOpenFlow({
  pack,
  onRevealDone,
  onStoreInVault,
  skipNonce,
}: PhygitalsOpenFlowProps) {
  const reveal = pack.demoReveal ?? {
    rarity: 'rare' as RevealRarity,
    cardName: pack.highlightPrize ?? pack.title,
    value: pack.creditPrice / 100,
    grade: 'PSA 9',
    year: '2024',
  };

  const [stage, setStage] = useState<Stage>('hidden');
  const fade = useRef(new Animated.Value(0)).current;
  const metaOpacity = useRef(new Animated.Value(0)).current;
  const resultScale = useRef(new Animated.Value(0.92)).current;

  const animateIn = useCallback(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [fade]);

  useEffect(() => { animateIn(); }, [stage, animateIn]);

  useEffect(() => {
    if (skipNonce === 0) return;
    setStage('result');
  }, [skipNonce]);

  useEffect(() => {
    if (stage !== 'metadata') return;
    metaOpacity.setValue(0);
    Animated.timing(metaOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    const t = setTimeout(() => {
      setStage('result');
      resultScale.setValue(0.92);
      Animated.spring(resultScale, { toValue: 1, friction: 8, useNativeDriver: true }).start();
    }, 1200);
    return () => clearTimeout(t);
  }, [stage, metaOpacity, resultScale]);

  const revealDoneRef = useRef(false);
  useEffect(() => {
    if (stage !== 'result' || revealDoneRef.current) return;
    revealDoneRef.current = true;
    onRevealDone();
  }, [stage, onRevealDone]);

  if (stage === 'hidden') {
    return (
      <Animated.View style={[styles.full, { opacity: fade }]}>
        <PackVisual
          name={pack.title}
          category={pack.tcgCategory ?? 'TCG'}
          rarityTier={pack.rarityTier ?? 'epic'}
          size="lg"
        />
        <View style={{ height: 32 }} />
        <SlabBack rarity={reveal.rarity} />
        <Text style={styles.tapHint}>Tap to reveal</Text>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setStage('metadata')} />
      </Animated.View>
    );
  }

  if (stage === 'metadata') {
    const color = R_COLOR[reveal.rarity];
    return (
      <Animated.View style={[styles.full, { opacity: fade }]}>
        <Animated.View style={{ opacity: metaOpacity, alignItems: 'center', gap: 16 }}>
          {(['YEAR', 'CATEGORY', 'GRADE', 'RARITY'] as const).map((label, i) => {
            const value =
              label === 'YEAR' ? reveal.year
              : label === 'CATEGORY' ? (pack.tcgCategory ?? 'TCG')
              : label === 'GRADE' ? reveal.grade
              : R_LABEL[reveal.rarity];
            return (
              <View key={label} style={styles.metaRow}>
                <Text style={styles.metaLabel}>{label}</Text>
                <Text style={[styles.metaValue, label === 'RARITY' && { color }]}>{value}</Text>
              </View>
            );
          })}
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.full, { opacity: fade }]}>
      <Animated.View style={{ transform: [{ scale: resultScale }] }}>
        <SlabFront
          cardName={reveal.cardName}
          grade={reveal.grade}
          year={reveal.year}
          rarity={reveal.rarity}
        />
      </Animated.View>
      <Text style={styles.resultName}>{reveal.cardName}</Text>
      <Text style={[styles.resultValue, { color: R_COLOR[reveal.rarity] }]}>
        ${reveal.value.toLocaleString()}
      </Text>
      <View style={styles.resultCtas}>
        {onStoreInVault ? (
          <PhButton label="Store in Vault" onPress={onStoreInVault} variant="secondary" style={styles.cta} />
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  full: {
    flex: 1,
    backgroundColor: '#080808',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  tapHint: {
    marginTop: 24,
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: ph.textMuted,
    letterSpacing: 0.5,
  },
  slab: {
    width: 240,
    height: 334,
    backgroundColor: '#111',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: ph.borderMd,
    overflow: 'hidden',
  },
  slabFront: {},
  slabTop: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: ph.border,
  },
  slabBrand: { fontSize: 10, fontFamily: brandFont.bold, color: ph.textSec, letterSpacing: 1.6 },
  slabAuth: { fontSize: 9, color: ph.textMuted, letterSpacing: 0.8 },
  gradeText: { fontSize: 11, fontFamily: brandFont.bold },
  slabBack: {
    flex: 1,
    margin: 10,
    backgroundColor: '#080808',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  question: { fontSize: 72, fontFamily: brandFont.black, color: 'rgba(255,255,255,0.04)' },
  slabFace: {
    flex: 1,
    margin: 10,
    borderRadius: 5,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slabArt: { width: '82%', flex: 1, backgroundColor: 'rgba(0,0,0,0.36)', borderRadius: 4, borderWidth: 1 },
  cardName: { fontSize: 11, fontFamily: brandFont.bold, color: ph.text, textAlign: 'center', paddingTop: 8 },
  slabBottom: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: ph.border,
  },
  slabBottomText: { fontSize: 8, color: ph.textMuted, letterSpacing: 1 },
  metaRow: { alignItems: 'center', gap: 4 },
  metaLabel: { fontSize: 10, fontFamily: brandFont.bold, color: ph.textMuted, letterSpacing: 2 },
  metaValue: { fontSize: 22, fontFamily: brandFont.black, color: ph.text },
  resultName: { marginTop: 24, fontSize: fontSize.lg, fontFamily: brandFont.bold, color: ph.text, textAlign: 'center' },
  resultValue: { marginTop: 8, fontSize: 32, fontFamily: brandFont.black },
  resultCtas: { marginTop: 32, width: '100%', gap: 12 },
  cta: { width: '100%' },
});
