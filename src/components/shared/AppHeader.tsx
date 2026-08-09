import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sg } from '../../tokens/sg';
import { spacing } from '../../tokens/spacing';
import { CreditsPill } from './CreditsPill';
import { APP_DISPLAY_NAME } from '../../config/app';
import { navigationRef } from '../../navigation/navigationRef';
import { useRequireAuth } from '../../hooks/useRequireAuth';

export function AppHeader({ onSearch }: { onSearch?: () => void }) {
  const insets = useSafeAreaInsets();
  const { requireAuth } = useRequireAuth();
  const goPoints = () => {
    requireAuth(() => {
      if (navigationRef.isReady()) navigationRef.navigate('PaymentPortal', { initialTab: 'credits' });
    });
  };
  const goCreditHistory = () => {
    requireAuth(() => {
      if (navigationRef.isReady()) navigationRef.navigate('CreditHistory');
    });
  };

  return (
    <View style={[styles.shell, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.row}>
        <View style={styles.logo} accessibilityRole="header" accessibilityLabel={APP_DISPLAY_NAME}>
          <View style={styles.monogram}>
            <View style={styles.markTall} />
            <View style={styles.markShort} />
            <View style={styles.markDot} />
          </View>
          <View>
            <Text style={styles.wordmark}>Pull Hub</Text>
            <Text style={styles.submark}>東京 · Tokyo collection</Text>
          </View>
        </View>
        <View style={styles.right}>
          <CreditsPill onAdd={goPoints} onPressBalance={goCreditHistory} />
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onSearch}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Search"
          >
            <Ionicons name="search" size={18} color={sg.text} />
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
    backgroundColor: sg.component.dock.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: sg.cardShine,
    paddingHorizontal: spacing.base,
    paddingBottom: 11,
    zIndex: 2,
  },
  row: {
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 9, flexShrink: 1 },
  monogram: { width: 31, height: 34, position: 'relative' },
  markTall: { position: 'absolute', left: 1, top: 2, bottom: 2, width: 7, borderRadius: 4, backgroundColor: sg.text },
  markShort: { position: 'absolute', left: 12, top: 2, height: 20, width: 7, borderRadius: 4, backgroundColor: sg.text },
  markDot: { position: 'absolute', right: 1, top: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: sg.goldHi },
  wordmark: { fontFamily: sg.font.display, fontSize: 19, lineHeight: 22, color: sg.text, letterSpacing: -0.15 },
  submark: { fontFamily: sg.font.japanese, fontSize: 8, lineHeight: 11, color: sg.muted, letterSpacing: 0.1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: { width: 40, height: 40, borderRadius: sg.radius.btn, borderWidth: StyleSheet.hairlineWidth, borderColor: sg.line, alignItems: 'center', justifyContent: 'center', backgroundColor: sg.surface },
});
