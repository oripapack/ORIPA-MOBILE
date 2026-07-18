import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, AccessibilityInfo } from 'react-native';
import { sg, SgLayer } from '../../tokens/sg';

interface Props {
  title: string;
  /** Right-side action label, e.g. "VIEW ALL". */
  actionLabel?: string;
  onAction?: () => void;
  /**
   * Brass pulsing dot before the action label. Glow is design-rule-limited to
   * LIVE indicators (and Stage effects) — the sanctioned exception to the
   * single-light rule. Pulse is disabled when the user prefers reduced motion.
   */
  live?: boolean;
  layer?: SgLayer;
}

/**
 * Section titles use the body face (bold) — Fraunces is reserved for brand
 * statements, pack names and revealed card names.
 */
export function SgSectionHeader({ title, actionLabel, onAction, live, layer = 'showroom' }: Props) {
  const pulse = useRef(new Animated.Value(0.5)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => { if (mounted) setReduceMotion(v); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!live || reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 1200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [live, reduceMotion, pulse]);

  const ink = layer === 'showroom' ? sg.showroom.text : sg.gallery.ink;
  const muted = layer === 'showroom' ? sg.showroom.textMuted : sg.gallery.inkMuted;

  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: ink }]}>{title}</Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onAction} style={styles.action} accessibilityRole="button">
          {live ? <Animated.View style={[styles.liveDot, { opacity: reduceMotion ? 1 : pulse }]} /> : null}
          <Text style={[styles.actionLabel, { color: muted }]}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  title: { fontFamily: sg.font.bodyBold, fontSize: 17, letterSpacing: 0.2 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionLabel: {
    fontFamily: sg.font.bodyMedium,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: sg.brass,
    ...sg.liveGlow,
  },
});
