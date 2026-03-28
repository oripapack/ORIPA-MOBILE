import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

type Action = 'addUsername' | 'scanQr' | 'showQr' | 'shareInvite' | 'promo';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (action: Action) => void;
};

const ROWS: { action: Action; icon: keyof typeof Ionicons.glyphMap }[] = [
  { action: 'addUsername', icon: 'person-add-outline' },
  { action: 'scanQr', icon: 'scan-outline' },
  { action: 'showQr', icon: 'qr-code-outline' },
  { action: 'shareInvite', icon: 'share-outline' },
  { action: 'promo', icon: 'gift-outline' },
];

export function FriendsHubMenu({ visible, onClose, onSelect }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const pick = (action: Action) => {
    onSelect(action);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.sm }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.grab} />
          <Text style={styles.sheetTitle}>{t('friends.hubMenuTitle')}</Text>
          {ROWS.map((row) => (
            <TouchableOpacity
              key={row.action}
              style={styles.row}
              onPress={() => pick(row.action)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={t(`friends.hubMenu.${row.action}`)}
            >
              <View style={styles.rowIcon}>
                <Ionicons name={row.icon} size={22} color={colors.gold} />
              </View>
              <Text style={styles.rowLabel}>{t(`friends.hubMenu.${row.action}`)}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.cancel} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.cancelText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: { elevation: 16 },
    }),
  },
  grab: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: colors.textMuted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(232,197,71,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.2)',
  },
  rowLabel: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  cancel: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
});
