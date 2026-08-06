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
import { sg } from '../../tokens/sg';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

type Action = 'showQr' | 'shareInvite' | 'promo';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (action: Action) => void;
};

const ROWS: { action: Action; icon: keyof typeof Ionicons.glyphMap }[] = [
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
          <Text style={styles.sheetTitle}>{t('friends.moreMenuTitle')}</Text>
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
                <Ionicons name={row.icon} size={22} color={sg.gold} />
              </View>
              <Text style={styles.rowLabel}>{t(`friends.hubMenu.${row.action}`)}</Text>
              <Ionicons name="chevron-forward" size={18} color={sg.muted} />
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
    backgroundColor: sg.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
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
    fontFamily: brandFont.black,
    color: sg.muted,
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
    borderBottomColor: sg.line,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: sg.cobaltWash,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: sg.mintBorder,
  },
  rowLabel: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: brandFont.semibold,
    color: sg.text,
  },
  cancel: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: fontSize.md,
    fontFamily: brandFont.semibold,
    color: sg.muted,
  },
});
