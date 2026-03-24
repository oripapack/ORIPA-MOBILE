import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Encoded QR string (see `buildFriendQrPayload`). */
  qrValue: string;
  memberId: string;
  displayName: string;
  onCopied?: () => void;
}

export function MyQrModal({ visible, onClose, qrValue, memberId, displayName, onCopied }: Props) {
  const { t } = useTranslation();
  const copyId = async () => {
    await Clipboard.setStringAsync(memberId);
    onCopied?.();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent {...transparentModalIOSProps}>
      <View style={styles.backdrop}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdropTap} />
        </TouchableWithoutFeedback>
        <View style={styles.sheet} pointerEvents="box-none">
          <View style={styles.handle} />
          <View style={styles.sheetTop}>
            <Text style={styles.badge}>{t('friends.heroEyebrow')}</Text>
            <Text style={styles.title}>{t('myQr.title')}</Text>
            <Text style={styles.subtitle}>{t('myQr.subtitle')}</Text>
          </View>

          <View style={styles.qrWrap}>
            <QRCode value={qrValue} size={216} backgroundColor={colors.white} color={colors.nearBlack} />
          </View>

          <Text style={styles.nameLabel}>{t('myQr.you')}</Text>
          <Text style={styles.name}>{displayName}</Text>

          <View style={styles.idRow}>
            <Text style={styles.idText}>{memberId}</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={copyId} activeOpacity={0.7}>
              <Text style={styles.copyBtnText}>{t('myQr.copy')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>{t('myQr.done')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  backdropTap: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    elevation: 8,
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl + 8,
    paddingTop: spacing.sm,
    borderTopWidth: 3,
    borderTopColor: colors.casinoGold,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.base,
  },
  sheetTop: {
    marginBottom: spacing.md,
  },
  badge: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.casinoGold,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  qrWrap: {
    alignSelf: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'rgba(240,193,76,0.65)',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  nameLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.casinoFelt,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.casinoFeltBorder,
    marginBottom: spacing.lg,
  },
  idText: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
    color: colors.white,
    marginRight: spacing.sm,
  },
  copyBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.casinoGold,
    borderRadius: radius.md,
  },
  copyBtnText: {
    color: colors.nearBlack,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
  },
  doneBtn: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  doneBtnText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
  },
});
