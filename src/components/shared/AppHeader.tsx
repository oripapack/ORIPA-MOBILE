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
import { useRequireAuth } from '../../hooks/useRequireAuth';

interface Props {
  onSearch?: () => void;
}

export function AppHeader({ onSearch }: Props) {
  const insets = useSafeAreaInsets();
  const { primary, secondary } = getAppLogoParts();
  const { requireAuth } = useRequireAuth();

  const goCredits = () => {
    requireAuth(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('PaymentPortal', { initialTab: 'credits' });
      }
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      {/* Logo */}
      <View style={styles.logo}>
        <View>
          <Text style={styles.logoText}>{primary}</Text>
          <View style={styles.logoAccent} />
        </View>
        {secondary != null && secondary.length > 0 ? (
          <Text style={styles.logoDot}>{secondary}</Text>
        ) : null}
      </View>

      {/* Right controls */}
      <View style={styles.right}>
        <CreditsPill onAdd={goCredits} />
        <TouchableOpacity style={styles.iconBtn} onPress={onSearch}>
          <Ionicons name="search" size={22} color={colors.textPrimary} />
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
    backgroundColor: colors.headerBarBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.headerHairline,
    shadowColor: colors.shadowStrong,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    zIndex: 2,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  logoText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  logoAccent: {
    marginTop: 4,
    height: 3,
    width: 36,
    borderRadius: 2,
    backgroundColor: colors.gold,
    opacity: 0.95,
  },
  logoDot: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.gold,
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
