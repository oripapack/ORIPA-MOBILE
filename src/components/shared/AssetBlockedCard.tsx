import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { sg } from '../../tokens/sg';

type Props = {
  label?: string;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Rights-safe card/slab media placeholder.
 * Never imitate missing photography with gradients; replace only with owned,
 * rights-cleared inventory media that meets docs/asset-spec.md.
 */
export function AssetBlockedCard({ label = 'CARD MEDIA PENDING', compact = false, style }: Props) {
  return (
    <View
      style={[styles.frame, compact && styles.frameCompact, style]}
      accessibilityRole="image"
      accessibilityLabel={label}
    >
      <View style={[styles.labelRail, compact && styles.labelRailCompact]} />
      <View style={styles.cardField}>
        <View style={[styles.dummyCard, compact && styles.dummyCardCompact]} />
      </View>
      <Text style={[styles.label, compact && styles.labelCompact]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    height: '100%',
    minHeight: 112,
    padding: sg.space.sm,
    borderRadius: sg.radius.btn,
    borderWidth: 1,
    borderColor: sg.line,
    backgroundColor: sg.surface2,
  },
  frameCompact: {
    minHeight: 52,
    padding: 5,
    borderRadius: sg.radius.tag,
  },
  labelRail: {
    height: 13,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#55555D',
    backgroundColor: '#24242A',
  },
  labelRailCompact: {
    height: 7,
  },
  cardField: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dummyCard: {
    width: '60%',
    aspectRatio: 0.72,
    maxHeight: '72%',
    borderRadius: sg.radius.tag,
    borderWidth: 1,
    borderColor: '#55555D',
    backgroundColor: '#1D1D22',
  },
  dummyCardCompact: {
    width: '54%',
    borderRadius: 2,
  },
  label: {
    fontFamily: sg.font.dataBold,
    fontSize: 8,
    lineHeight: 11,
    color: sg.muted,
    letterSpacing: 0.45,
    textAlign: 'center',
  },
  labelCompact: {
    fontSize: 5.5,
    lineHeight: 8,
  },
});
