import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { sg } from '../../tokens/sg';
import { useReducedMotionPreference } from '../../hooks/useReducedMotionPreference';

interface Props {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}

export function SecondaryButton({ label, onPress, style }: Props) {
  const reduceMotion = useReducedMotionPreference();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        pressed && !reduceMotion && styles.pressedScale,
        style,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: sg.radius.btn,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sg.space.lg,
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: sg.line,
  },
  label: {
    color: sg.text,
    fontSize: 16,
    fontFamily: sg.font.bodyMedium,
  },
  pressed: {
    opacity: 0.82,
  },
  pressedScale: { transform: [{ scale: 0.985 }] },
});
