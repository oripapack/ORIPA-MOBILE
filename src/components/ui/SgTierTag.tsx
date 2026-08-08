import React from 'react';
import { View, Text, StyleSheet, Platform, type ViewStyle, type TextStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';
import { sg } from '../../tokens/sg';
import type { N2TierState } from '../../lib/n2Rarity';

/**
 * §6 (v2.3) tier tag — four steps, THREE colors, distinguished by FORM:
 *   mythic    — neon filled tag + glow (sg.glowNeon box shadow, the RN
 *               translation of --ph-glow-neon: a text shadow cannot render
 *               against the solid neon fill)
 *   legendary — gold filled tag, on-gold (black) label
 *   epic      — gold outline only
 *   base      — context-dependent, see below
 * 'unknown' renders NOTHING in every context — absence of tier data must
 * never look like a judged low tier. No new colors: neon / gold / muted.
 *
 * Context (§6 文脈規定):
 *   disclosure — odds table: all four steps equally readable. BASE is plain
 *                text in `sg.text` at full opacity (no dimming — disclosure
 *                must never de-emphasize a step).
 *   badge      — on cards: BASE renders nothing ("not a hit" is not worth
 *                announcing); only the top three tiers show.
 */
export function SgTierTag({ tier, context }: { tier: N2TierState; context: 'disclosure' | 'badge' }) {
  if (tier === 'unknown') return null;
  if (tier === 'base' && context === 'badge') return null;
  const text = tier === 'base' ? styles.baseDisclosure : textStyles[tier];
  const tag = (
    <View style={[styles.tag, tier === 'base' ? null : boxStyles[tier]]}>
      <Text style={[styles.label, text]}>{tier.toUpperCase()}</Text>
    </View>
  );
  // Android renders no colored box shadow — the MYTHIC glow is meaningful
  // (§6: neon must glow), so it gets an svg radial halo behind the tag there.
  if (tier === 'mythic' && Platform.OS === 'android') {
    return (
      <View style={styles.mythicWrap}>
        <Svg
          pointerEvents="none"
          style={styles.androidGlow}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <Defs>
            <RadialGradient id="sgTierGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={sg.neon} stopOpacity={0.4} />
              <Stop offset="100%" stopColor={sg.neon} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx="50" cy="50" rx="50" ry="50" fill="url(#sgTierGlow)" />
        </Svg>
        {tag}
      </View>
    );
  }
  return tag;
}

const boxStyles: Record<'mythic' | 'legendary' | 'epic', ViewStyle> = {
  mythic: { backgroundColor: sg.neon, ...sg.glowNeon },
  legendary: { backgroundColor: sg.value },
  epic: { borderColor: sg.value },
};

const textStyles: Record<'mythic' | 'legendary' | 'epic', TextStyle> = {
  mythic: { color: sg.onGold },
  legendary: { color: sg.onValue },
  epic: { color: sg.value },
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
  // §6 disclosure: plain text, full-opacity `text` color — never dimmed.
  baseDisclosure: { color: sg.text },
  mythicWrap: { alignSelf: 'flex-start' },
  androidGlow: { position: 'absolute', left: -16, right: -16, top: -12, bottom: -12 },
});
