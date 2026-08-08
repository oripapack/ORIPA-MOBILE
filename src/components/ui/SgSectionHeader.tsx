import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, AccessibilityInfo } from 'react-native';
import { sg } from '../../tokens/sg';

interface Props {
  title: string;
  /** Right-side action label, e.g. "VIEW ALL". */
  actionLabel?: string;
  onAction?: () => void;
  /**
   * Neon LIVE dot before the action label — neon is the "moment" color and
   * always glows (§4); the 1.6s blink is one of the two always-on motions
   * allowed by §8. Disabled under reduced motion.
   */
  live?: boolean;
}

/** Terminal section header: bold title + monospaced operational action. */
export function SgSectionHeader({ title, actionLabel, onAction, live }: Props) {
  const pulse = useRef(new Animated.Value(0.5)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => { if (mounted) setReduceMotion(v); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!live || reduceMotion) return;
    // §8: LIVE dot blink cycle 1.6s
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [live, reduceMotion, pulse]);

  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onAction} style={styles.action} accessibilityRole="button">
          {live ? <Animated.View style={[styles.liveDot, { opacity: reduceMotion ? 1 : pulse }]} /> : null}
          <Text style={styles.actionLabel}>{actionLabel}</Text>
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
    paddingBottom: 9,
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
  },
  title: { fontFamily: sg.font.display, fontSize: 18, letterSpacing: -0.35, color: sg.text, textTransform: 'uppercase' },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionLabel: {
    fontFamily: sg.font.label,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: sg.muted,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: sg.neon,
    ...sg.glowNeon,
  },
});
