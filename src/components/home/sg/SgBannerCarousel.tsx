import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, AccessibilityInfo } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { sg } from '../../../tokens/sg';

/**
 * Home banner strip (144px ≈ 1/3 of screen width, radius: card). Crossfades
 * every 3s, pauses while touched, and never auto-advances under reduced
 * motion (dots become the manual control).
 *
 * Slide text is a real UI overlay — NEVER baked into the artwork. A thin
 * dark gradient sits behind the text zone only (rgba black ≤25%); the
 * artwork itself is not dimmed. Sources are WebP (originals kept as PNG in
 * assets/home/banners/).
 */
const SLIDES = [
  {
    key: 'exclusives',
    title: 'JAPANESE EXCLUSIVES',
    sub: 'Direct from Tokyo.',
    image: require('../../../../assets/home/banners/banner-01.webp'),
  },
  {
    key: 'tradein',
    title: '100% back in Coins.',
    sub: 'Zero fees. Instantly.',
    footnote: '*of listed value',
    image: require('../../../../assets/home/banners/banner-02.webp'),
  },
  {
    key: 'fair',
    title: 'Provably fair.',
    sub: 'Verify every pull.',
    image: require('../../../../assets/home/banners/banner-03.webp'),
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
        <Image
          source={slide.image}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={0}
        />
        {/* Legibility gradient — behind the text zone only, artwork stays bright */}
        <LinearGradient
          colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.10)', 'rgba(0,0,0,0)']}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.textScrim}
          pointerEvents="none"
        />
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

const styles = StyleSheet.create({
  wrap: {
    height: 144,
    marginHorizontal: sg.space.md,
    marginTop: sg.space.md,
    borderRadius: sg.radius.card,
    overflow: 'hidden',
    backgroundColor: sg.showroom.surface,
  },
  slide: { ...StyleSheet.absoluteFillObject },
  textScrim: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '70%',
  },
  textWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: sg.space.md, maxWidth: '78%' },
  title: { fontFamily: sg.font.bodyBold, fontSize: 17, color: sg.showroom.text, letterSpacing: 0.3 },
  sub: { fontFamily: sg.font.body, fontSize: 13, color: sg.showroom.text, marginTop: 3, opacity: 0.9 },
  footnote: { fontFamily: sg.font.body, fontSize: 9, color: sg.showroom.text, opacity: 0.7, marginTop: 4 },
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
    backgroundColor: 'rgba(232,229,222,0.35)',
  },
  dotActive: { backgroundColor: sg.brass },
});
