import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';
import { CreditsPill } from './CreditsPill';
import { APP_DISPLAY_NAME, getLogoInitials, getLogoWordmarkParts } from '../../config/app';
import { navigationRef } from '../../navigation/navigationRef';
import { useRequireAuth } from '../../hooks/useRequireAuth';

interface Props {
  onSearch?: () => void;
}

export function AppHeader({ onSearch }: Props) {
  const insets = useSafeAreaInsets();
  const { requireAuth } = useRequireAuth();
  const initials = getLogoInitials();
  const wordmark = getLogoWordmarkParts();

  const goCredits = () => {
    requireAuth(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('PaymentPortal', { initialTab: 'credits' });
      }
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      {/* Logo: gradient monogram + wordmark (no split underline) */}
      <View
        style={styles.logo}
        accessibilityRole="header"
        accessibilityLabel={APP_DISPLAY_NAME}
      >
        <LinearGradient
          colors={[colors.accentSapphire, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.monogramRing}
        >
          <View style={styles.monogramInner}>
            <Text style={styles.monogramText} numberOfLines={1}>
              {initials}
            </Text>
          </View>
        </LinearGradient>
        <View style={styles.wordmarkCol}>
          {wordmark ? (
            <Text style={styles.wordmarkLine} numberOfLines={1}>
              <Text style={styles.wordmarkLead}>{wordmark.lead}</Text>
              <Text style={styles.wordmarkAccent}> {wordmark.accent}</Text>
            </Text>
          ) : (
            <Text style={styles.wordmarkSingle} numberOfLines={1}>
              {APP_DISPLAY_NAME}
            </Text>
          )}
        </View>
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
    gap: spacing.sm,
    flexShrink: 1,
  },
  monogramRing: {
    borderRadius: 12,
    padding: 1.5,
  },
  monogramInner: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  wordmarkCol: {
    justifyContent: 'center',
    flexShrink: 1,
  },
  wordmarkLine: {
    fontSize: fontSize.lg,
    letterSpacing: -0.35,
  },
  wordmarkLead: {
    color: colors.textPrimary,
    fontFamily: brandFont.bold,
  },
  wordmarkAccent: {
    color: colors.accent,
    fontFamily: brandFont.black,
  },
  wordmarkSingle: {
    fontSize: fontSize.lg,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    letterSpacing: -0.35,
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
