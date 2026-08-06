import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { sg } from '../../tokens/sg';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  onAdd: () => void;
}

/**
 * Header Points balance. The store field remains `credits` until the separate
 * data migration, but product copy and visual semantics are Points-only.
 */
export function PointsPill({ onAdd }: Props) {
  const points = useAppStore((s) => s.user.credits);
  const formatted = points.toLocaleString();

  return (
    <View style={styles.pill} accessibilityLabel={`Points balance ${formatted}`}>
      <Text style={styles.unit}>PTS</Text>
      <Text style={styles.amount}>{formatted}</Text>
      <Pressable
        style={({ pressed }) => [styles.addBtn, pressed && styles.addPressed]}
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel="Add Points"
        hitSlop={6}
      >
        <Text style={styles.addText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.xs,
    paddingLeft: sg.space.sm,
    borderWidth: 1,
    borderColor: sg.line,
    borderRadius: sg.radius.tag,
    backgroundColor: sg.surface,
    overflow: 'hidden',
  },
  unit: {
    color: sg.muted,
    fontFamily: sg.font.dataBold,
    fontSize: 9,
    letterSpacing: 1.1,
  },
  amount: {
    marginRight: sg.space.xs,
    color: sg.gold,
    fontFamily: sg.font.dataBold,
    fontSize: 13,
    fontVariant: [...sg.numeric],
  },
  addBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: sg.line,
    backgroundColor: sg.surface2,
  },
  addPressed: { opacity: 0.72 },
  addText: {
    color: sg.text,
    fontFamily: sg.font.bodyBold,
    fontSize: 16,
    lineHeight: 20,
  },
});
