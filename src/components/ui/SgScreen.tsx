import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { sg } from '../../tokens/sg';
import { sgVault } from '../../tokens/sgVault';

type Skin = 'default' | 'vault';

interface Props {
  children: React.ReactNode;
  /** `vault` applies the cooler Tokyo Arcade Vault inventory chassis. */
  skin?: Skin;
  style?: StyleProp<ViewStyle>;
}

/**
 * Tokyo Arcade Vault screen shell — porcelain by default, cooler acrylic for Vault.
 * Replace `HomeBackground` + outer View with this on migrating screens.
 */
export function SgScreen({ children, skin = 'default', style }: Props) {
  const t = skin === 'vault' ? sgVault : sg;
  return (
    <View style={[styles.root, { backgroundColor: t.bg }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
