import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, AccessibilityInfo } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';
import { sg } from '../../../tokens/sg';

/**
 * Home banner strip (144px, panel radius). Crossfades every 3s, pauses while
 * touched, and never auto-advances under reduced motion (dots become the
 * manual control).
 *
 * Slide text is real UI overlay text — never baked into artwork. The artwork
 * is a rights-safe, flat vector system: Japanese inbound symbols are treated
 * as pop/wayfinding graphics per JAPAN ELEMENTS, never as solemn photography.
 */
const SLIDES = [
  {
    key: 'exclusives',
    title: 'TOKYO-BORN DESIGN',
    sub: 'Japanese Oripa culture, built for collectors in the U.S.',
    art: 'tokyo',
  },
  {
    key: 'tradein',
    title: '100% of listed value in Points.',
    sub: 'Zero fees. Instantly.',
    footnote: '*of listed value',
    art: 'value',
  },
  {
    key: 'fair',
    title: 'VERIFY THE RECORD',
    sub: 'Pull details, in one place.',
    art: 'verify',
  },
] as const;

const INTERVAL_MS = 3000;
const FADE_MS = 450;

export function SgBannerCarousel() {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const paused = useRef(false);
  const fade = useRef(new Animated.Value(1)).current;
  const indexRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => { if (mounted) setReduceMotion(v); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (reduceMotion) return; // no auto-advance under reduced motion
    const id = setInterval(() => {
      if (paused.current) return;
      const next = (indexRef.current + 1) % SLIDES.length;
      // Crossfade: fade the top layer out, swap content, fade back in
      Animated.timing(fade, { toValue: 0, duration: FADE_MS, useNativeDriver: true }).start(() => {
        indexRef.current = next;
        setIndex(next);
        Animated.timing(fade, { toValue: 1, duration: FADE_MS, useNativeDriver: true }).start();
      });
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [reduceMotion, fade]);

  const goTo = (i: number) => {
    indexRef.current = i;
    setIndex(i);
  };

  const slide = SLIDES[index]!;

  return (
    <Pressable
      style={styles.wrap}
      onPressIn={() => { paused.current = true; }}
      onPressOut={() => { paused.current = false; }}
      accessibilityRole="none"
    >
      <Animated.View style={[styles.slide, { opacity: fade }]}>
        <BannerArtwork variant={slide.art} />
        <View style={styles.signalRail} pointerEvents="none">
          <View style={styles.signalCobalt} />
          <View style={styles.signalTeal} />
          <View style={styles.signalRed} />
        </View>
        {/* Overlay text — real UI, not baked into the artwork */}
        <View style={styles.textWrap}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.sub}>{slide.sub}</Text>
          {'footnote' in slide && slide.footnote ? (
            <Text style={styles.footnote}>{slide.footnote}</Text>
          ) : null}
        </View>
      </Animated.View>
      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <Pressable
            key={s.key}
            onPress={() => goTo(i)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Banner ${i + 1}`}
          >
            <View style={[styles.dot, i === index && styles.dotActive]} />
          </Pressable>
        ))}
      </View>
    </Pressable>
  );
}

function BannerArtwork({ variant }: { variant: (typeof SLIDES)[number]['art'] }) {
  return (
    <Svg
      viewBox="0 0 408 144"
      preserveAspectRatio="xMidYMid slice"
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Rect width="408" height="144" fill={sg.surface2} />
      <G opacity={0.42} stroke={sg.line} strokeWidth="1">
        <Line x1="0" y1="24" x2="408" y2="24" />
        <Line x1="0" y1="72" x2="408" y2="72" />
        <Line x1="0" y1="120" x2="408" y2="120" />
        <Line x1="306" y1="0" x2="306" y2="144" />
        <Line x1="354" y1="0" x2="354" y2="144" />
      </G>

      {variant === 'tokyo' ? (
        <G>
          <G opacity={0.82} stroke={sg.neon} strokeWidth="5" strokeLinecap="square">
            <Line x1="304" y1="41" x2="386" y2="41" />
            <Line x1="314" y1="52" x2="376" y2="52" />
            <Line x1="324" y1="53" x2="324" y2="119" />
            <Line x1="366" y1="53" x2="366" y2="119" />
          </G>
          <G fill={sg.text} opacity={0.75}>
            <Rect x="292" y="96" width="8" height="8" rx="2" />
            <Rect x="389" y="24" width="5" height="5" rx="1" />
          </G>
          <Path d="M270 123 L294 99 L318 123" fill="none" stroke={sg.muted} strokeWidth="1.5" />
        </G>
      ) : null}

      {variant === 'value' ? (
        <G>
          <Circle cx="345" cy="72" r="44" fill={sg.surface} stroke={sg.line} strokeWidth="1" />
          <Path d="M327 59 H366 L354 47 M366 59 L354 71" fill="none" stroke={sg.gold} strokeWidth="5" strokeLinecap="square" />
          <Path d="M363 85 H324 L336 73 M324 85 L336 97" fill="none" stroke={sg.gold} strokeWidth="5" strokeLinecap="square" />
          <G fill={sg.goldHi} opacity={0.78}>
            <Rect x="285" y="30" width="6" height="24" rx="2" />
            <Rect x="285" y="60" width="6" height="44" rx="2" />
            <Rect x="285" y="110" width="6" height="8" rx="2" />
          </G>
        </G>
      ) : null}

      {variant === 'verify' ? (
        <G>
          <Rect x="300" y="25" width="82" height="94" rx="13" fill={sg.surface} stroke={sg.line} />
          <G opacity={0.74} stroke={sg.muted} strokeWidth="1">
            <Line x1="314" y1="46" x2="368" y2="46" />
            <Line x1="314" y1="60" x2="368" y2="60" />
            <Line x1="314" y1="74" x2="352" y2="74" />
            <Line x1="314" y1="88" x2="360" y2="88" />
          </G>
          <Circle cx="354" cy="93" r="18" fill={sg.surface2} stroke={sg.gold} strokeWidth="2" />
          <Path d="M345 93 L352 100 L364 84" fill="none" stroke={sg.gold} strokeWidth="4" strokeLinecap="square" />
          <Path d="M274 118 L296 91 L318 118" fill="none" stroke={sg.neon} strokeWidth="2" opacity={0.8} />
        </G>
      ) : null}
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 144,
    marginHorizontal: sg.space.md,
    marginTop: sg.space.md,
    borderRadius: sg.radius.panel,
    overflow: 'hidden',
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
  },
  slide: { ...StyleSheet.absoluteFillObject },
  signalRail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  signalCobalt: { flex: 3, backgroundColor: sg.gold },
  signalTeal: { flex: 2, backgroundColor: sg.teal },
  signalRed: { flex: 1, backgroundColor: sg.neon },
  textWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: sg.space.lg,
    paddingRight: sg.space.md,
    maxWidth: '78%',
  },
  title: {
    fontFamily: sg.font.bodyBold,
    fontSize: 17,
    color: sg.text,
    letterSpacing: 0.3,
  },
  sub: {
    fontFamily: sg.font.body,
    fontSize: 13,
    color: sg.text,
    marginTop: 3,
    opacity: 0.9,
  },
  footnote: {
    fontFamily: sg.font.body,
    fontSize: 9,
    color: sg.text,
    opacity: 0.7,
    marginTop: 4,
  },
  dots: {
    position: 'absolute',
    right: sg.space.md,
    bottom: sg.space.sm,
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: sg.chrome,
  },
  dotActive: { backgroundColor: sg.gold },
});
