import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';
import { CreditsPill } from './CreditsPill';
import { getAppLogoParts } from '../../config/app';
import { navigationRef } from '../../navigation/navigationRef';

interface Props {
  onSearch?: () => void;
}

export function AppHeader({ onSearch }: Props) {
  const insets = useSafeAreaInsets();
  const { primary, secondary } = getAppLogoParts();

  const goCredits = () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('PaymentPortal', { initialTab: 'credits' });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      {/* Logo */}
      <View style={styles.logo}>
        <Text style={styles.logoText}>{primary}</Text>
        {secondary != null && secondary.length > 0 ? (
          <Text style={styles.logoDot}>{secondary}</Text>
        ) : null}
      </View>

      {/* Right controls */}
      <View style={styles.right}>
        <CreditsPill onAdd={goCredits} />
        <TouchableOpacity style={styles.iconBtn} onPress={onSearch}>
          <Ionicons name="search" size={22} color={colors.nearBlack} />
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
});
