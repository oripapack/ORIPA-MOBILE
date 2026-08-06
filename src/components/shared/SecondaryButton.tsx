import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { SgButton } from '../ui/SgButton';

interface Props {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Compatibility wrapper. New code should use `SgButton` directly. */
export function SecondaryButton({ label, onPress, style }: Props) {
  return <SgButton label={label} onPress={onPress} variant="line" style={style} />;
}
