import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'red' | 'black';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({ label, onPress, variant = 'black', disabled, loading, style }: Props) {
  const isRed = variant === 'red';

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.88}
    >
      {isRed ? (
        <View style={[styles.fill, { backgroundColor: colors.red }]} />
      ) : (
        <LinearGradient
          colors={[colors.goldDark, colors.gold]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}
        />
      )}
      <View style={styles.labelWrap} pointerEvents="none">
        {loading ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <Text style={[styles.label, !isRed && styles.labelOnGreen]}>{label}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: radius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
  labelWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  label: {
    color: colors.white,
    fontSize: fontSize.base,
    fontFamily: brandFont.bold,
    letterSpacing: 0.3,
  },
  labelOnGreen: {
    color: colors.ink,
  },
  disabled: {
    opacity: 0.4,
  },
});
