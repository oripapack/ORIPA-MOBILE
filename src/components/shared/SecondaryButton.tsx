import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { sg } from '../../tokens/sg';

interface Props {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}

export function SecondaryButton({ label, onPress, style }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
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
});
