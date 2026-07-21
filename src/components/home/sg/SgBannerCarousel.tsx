import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, AccessibilityInfo } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { sg } from '../../../tokens/sg';

/**
 * Home banner strip (~90px, radius: card). Crossfades every 3s, pauses while
 * touched, and never auto-advances under reduced motion (dots become the
 * manual control). Slide text is a real UI overlay — NEVER baked into the
 * background image. Backgrounds are placeholders until the AI art lands in
 * assets/home/banners/ (banner-01..04) — swap the `bg` gradients for
 * <Image> sources in the follow-up task.
 */
const SLIDES = [
  {
    key: 'exclusives',
    title: 'Japanese Exclusives',
    sub: 'Direct from Tokyo',
    bg: ['#1D201F', '#141615'] as const,
  },
  {
    key: 'fair',
    title: 'Provably Fair',
    sub: 'Verify every pull',
    bg: ['#191C1B', '#101211'] as const,
  },
  {
    key: 'shipping',
    title: 'Free shipping over $100',
    sub: 'Bundle & ship together',
    bg: ['#1B1D1C', '#121413'] as const,
  },
];

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
        <LinearGradient colors={[...slide.bg]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        {/* Overlay text — real UI, not baked into the artwork */}
        <View style={styles.textWrap}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.sub}>{slide.sub}</Text>
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
    height: 90,
    marginHorizontal: sg.space.md,
    marginTop: sg.space.md,
    borderRadius: sg.radius.card,
    overflow: 'hidden',
    backgroundColor: sg.showroom.surface,
  },
  slide: { ...StyleSheet.absoluteFillObject },
  textWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: sg.space.md },
  title: { fontFamily: sg.font.bodyBold, fontSize: 16, color: sg.showroom.text },
  sub: { fontFamily: sg.font.body, fontSize: 12, color: sg.showroom.textMuted, marginTop: 2 },
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
    backgroundColor: 'rgba(232,229,222,0.25)',
  },
  dotActive: { backgroundColor: sg.brass },
});
