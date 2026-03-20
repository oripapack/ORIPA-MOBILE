import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';
import { CreditsPill } from './CreditsPill';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  onSearch?: () => void;
}

export function AppHeader({ onSearch }: Props) {
  const insets = useSafeAreaInsets();
  const openModal = useAppStore((s) => s.openModal);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      {/* Logo */}
      <View style={styles.logo}>
        <Text style={styles.logoText}>VAULT</Text>
        <Text style={styles.logoDot}>PACKS</Text>
      </View>

      {/* Right controls */}
      <View style={styles.right}>
        <CreditsPill onAdd={() => openModal('buyCredits')} />
        <TouchableOpacity style={styles.iconBtn} onPress={onSearch}>
          <Text style={styles.icon}>🔍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  logoText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.nearBlack,
    letterSpacing: -0.5,
  },
  logoDot: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.red,
    letterSpacing: -0.5,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
});
