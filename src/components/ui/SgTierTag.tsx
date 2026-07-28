import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { sg } from '../../tokens/sg';
import type { N2TierState } from '../../lib/n2Rarity';

/**
 * §6 (v2.2) tier tag — six steps, THREE colors, distinguished by FORM:
 *   mythic    — neon filled tag + glow (sg.glowNeon box shadow, the RN
 *               translation of --ph-glow-neon: a text shadow cannot render
 *               against the solid neon fill)
 *   legendary — gold filled tag, on-gold (black) label
 *   epic      — gold outline only
 *   rare      — muted outline only
 *   uncommon  — muted text only
 *   common    — muted text only @50%
 * 'unknown' renders NOTHING — absence of tier data must never look like a
 * judged low tier. No new colors beyond neon / gold / muted (§6).
 */
export function SgTierTag({ tier }: { tier: N2TierState }) {
  if (tier === 'unknown') return null;
  return (
    <View style={[styles.tag, boxStyles[tier]]}>
      <Text style={[styles.label, textStyles[tier]]}>{tier.toUpperCase()}</Text>
    </View>
  );
}

const boxStyles: Record<Exclude<N2TierState, 'unknown'>, ViewStyle> = {
  mythic: { backgroundColor: sg.neon, ...sg.glowNeon },
  legendary: { backgroundColor: sg.gold },
  epic: { borderColor: sg.gold },
  rare: { borderColor: sg.muted },
  uncommon: {},
  common: { opacity: 0.5 },
};

const textStyles: Record<Exclude<N2TierState, 'unknown'>, TextStyle> = {
  mythic: { color: sg.onGold },
  legendary: { color: sg.onGold },
  epic: { color: sg.gold },
  rare: { color: sg.muted },
  uncommon: { color: sg.muted },
  common: { color: sg.muted },
};

const styles = StyleSheet.create({
  // Transparent border on every form so filled / outline / text-only tags
  // share identical box metrics (outline forms only recolor it).
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: sg.radius.tag,
  },
  label: {
    fontFamily: sg.font.bodyMedium,
    fontSize: 10,
    letterSpacing: 1,
  },
});
