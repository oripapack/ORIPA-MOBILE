import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { sg } from '../../tokens/sg';
import { sgVault } from '../../tokens/sgVault';
import { TerminalBackdrop } from '../terminal/TerminalBackdrop';

type Skin = 'default' | 'vault';

interface Props {
  children: React.ReactNode;
  /** `vault` applies N2 §10 FINTECH VAULT chassis. */
  skin?: Skin;
  style?: StyleProp<ViewStyle>;
  /** Keeps utility/detail routes readable on tablet and desktop without narrowing the background chassis. */
  constrainContent?: boolean;
}

/**
 * N2 screen shell — flat night chassis (no Phygitals green wash).
 * Replace `HomeBackground` + outer View with this on migrating screens.
 */
export function SgScreen({ children, skin = 'default', style, constrainContent = false }: Props) {
  const t = skin === 'vault' ? sgVault : sg;
  return (
    <View style={[styles.root, { backgroundColor: t.bg }, style]}>
      <TerminalBackdrop />
      {constrainContent ? <View style={styles.contentFrame}>{children}</View> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  contentFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'center',
  },
});
