import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Platform } from 'react-native';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import Ionicons from '@expo/vector-icons/Ionicons';
import { sg } from '../../tokens/sg';
import { fontSize } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Encoded QR string (see `buildFriendQrPayload`). */
  qrValue: string;
  /** Public handle — what friends use to add you. */
  username: string;
  displayName: string;
  onCopied?: () => void;
  /** Opens the camera scanner to add someone by their QR (root-level modal). */
  onScanSomeoneElse?: () => void;
}

export function MyQrModal({
  visible,
  onClose,
  qrValue,
  username,
  displayName,
  onCopied,
  onScanSomeoneElse,
}: Props) {
  const { t } = useTranslation();
  const copyId = async () => {
    await Clipboard.setStringAsync(username);
    onCopied?.();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      {...transparentModalIOSProps}
      presentationStyle={Platform.OS === 'ios' ? undefined : 'overFullScreen'}
      onRequestClose={onClose}
    >
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
            {qrValue ? (
              <QRCode value={qrValue} size={216} backgroundColor={sg.text} color={sg.bg} />
            ) : (
              <Text style={styles.subtitle}>{t('myQr.missingUsername')}</Text>
            )}
          </View>

          <Text style={styles.nameLabel}>{t('myQr.you')}</Text>
          <Text style={styles.name}>{displayName}</Text>

          <View style={styles.idRow}>
            <Text style={styles.idText}>@{username}</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={copyId} activeOpacity={0.7}>
              <Text style={styles.copyBtnText}>{t('myQr.copy')}</Text>
            </TouchableOpacity>
          </View>

          {onScanSomeoneElse ? (
            <TouchableOpacity
              style={styles.scanOtherBtn}
              onPress={onScanSomeoneElse}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel={t('myQr.scanAnother')}
            >
              <Ionicons name="camera-outline" size={22} color={sg.gold} />
              <View style={styles.scanOtherTextCol}>
                <Text style={styles.scanOtherTitle}>{t('myQr.scanAnother')}</Text>
                <Text style={styles.scanOtherSub}>{t('myQr.scanAnotherSub')}</Text>
              </View>
              <Text style={styles.scanOtherChevron}>›</Text>
            </TouchableOpacity>
          ) : null}

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
    backgroundColor: sg.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl + 8,
    paddingTop: spacing.sm,
    borderTopWidth: 3,
    borderTopColor: sg.gold,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: sg.line,
    marginBottom: spacing.base,
  },
  sheetTop: {
    marginBottom: spacing.md,
  },
  badge: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: sg.muted,
    lineHeight: 20,
  },
  qrWrap: {
    alignSelf: 'center',
    padding: spacing.md,
    backgroundColor: sg.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'rgba(212,175,55,0.38)',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  nameLabel: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: fontSize.lg,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: spacing.base,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: sg.surface2,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: sg.line,
    marginBottom: spacing.lg,
  },
  idText: {
    flex: 1,
    fontSize: fontSize.base,
    fontFamily: sg.font.dataBold,
    letterSpacing: 0.5,
    color: sg.text,
    marginRight: spacing.sm,
  },
  copyBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: sg.surface2,
    borderRadius: radius.md,
  },
  copyBtnText: {
    color: sg.text,
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyBold,
  },
  scanOtherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: sg.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(225,29,46,0.35)',
  },
  scanOtherEmoji: {
    fontSize: 22,
  },
  scanOtherTextCol: {
    flex: 1,
    minWidth: 0,
  },
  scanOtherTitle: {
    fontSize: fontSize.md,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  scanOtherSub: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  scanOtherChevron: {
    fontSize: 22,
    color: sg.muted,
    fontFamily: sg.font.body,
  },
  doneBtn: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: sg.error,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: sg.error,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  doneBtnText: {
    color: sg.text,
    fontSize: fontSize.base,
    fontFamily: sg.font.bodyBold,
    letterSpacing: 0.5,
  },
});
