import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sg } from '../../tokens/sg';
import { PointsPill } from './PointsPill';
import { APP_DISPLAY_NAME, getLogoInitials, getLogoWordmarkParts } from '../../config/app';
import { navigationRef } from '../../navigation/navigationRef';
import { useRequireAuth } from '../../hooks/useRequireAuth';

interface Props {
  onSearch?: () => void;
}

/**
 * Tokyo Arcade Vault chrome: a porcelain machine cap with black wordmark,
 * cobalt balance control and a thin aluminum divider.
 * Logic (auth gate, PaymentPortal navigation) is unchanged.
 */
export function AppHeader({ onSearch }: Props) {
  const insets = useSafeAreaInsets();
  const { requireAuth } = useRequireAuth();
  const initials = getLogoInitials();
  const wordmark = getLogoWordmarkParts();

  const goPoints = () => {
    requireAuth(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('PaymentPortal', { initialTab: 'credits' });
      }
    });
  };

  return (
    <View style={[styles.shell, { paddingTop: insets.top + sg.space.sm }]}>
      <BlurView
        intensity={Platform.OS === 'ios' ? 52 : 40}
        tint="light"
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.scrim} pointerEvents="none" />

      <View style={styles.row}>
        <View
          style={styles.logo}
          accessibilityRole="header"
          accessibilityLabel={APP_DISPLAY_NAME}
        >
          {/* Monogram ring — line, not gold: the header gold budget is the wordmark accent + balance */}
          <View style={styles.monogramRing}>
            <View style={styles.monogramInner}>
              <Text style={styles.monogramText} numberOfLines={1}>
                {initials}
              </Text>
            </View>
          </View>
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

        <View style={styles.right}>
          <PointsPill onAdd={goPoints} />
          <TouchableOpacity style={styles.iconBtn} onPress={onSearch} activeOpacity={0.75}>
            <Ionicons name="search" size={20} color={sg.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: sg.line,
    paddingHorizontal: sg.space.md,
    paddingBottom: sg.space.md,
    zIndex: 2,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(245,242,234,0.92)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.sm,
    flexShrink: 1,
  },
  monogramRing: {
    borderRadius: sg.radius.tag,
    padding: 1,
    backgroundColor: sg.text,
  },
  monogramInner: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 6,
    borderRadius: 3,
    backgroundColor: sg.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: {
    fontSize: 13,
    fontFamily: sg.font.bodyBold,
    color: sg.onInk,
    letterSpacing: 1,
  },
  wordmarkCol: {
    justifyContent: 'center',
    flexShrink: 1,
  },
  wordmarkLine: {
    fontSize: 18,
    letterSpacing: 0.5,
  },
  wordmarkLead: {
    color: sg.text,
    fontFamily: sg.font.bodyBold,
  },
  wordmarkAccent: {
    color: sg.gold,
    fontFamily: sg.font.bodyBold,
  },
  wordmarkSingle: {
    fontSize: 17,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    letterSpacing: -0.2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.sm,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: sg.radius.btn,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
  },
});
