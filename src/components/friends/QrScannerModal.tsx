import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { parseFriendMemberIdFromQr } from '../../lib/friendQr';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { transparentModalIOSProps } from '../../constants/modalPresentation';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Called with parsed member ID from a valid friend QR. */
  onMemberIdScanned: (memberId: string) => void;
}

export function QrScannerModal({ visible, onClose, onMemberIdScanned }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const scannedRef = useRef(false);

  useEffect(() => {
    if (visible) {
      scannedRef.current = false;
    }
  }, [visible]);

  const handleBarcode = useCallback(
    (scanningResult: BarcodeScanningResult) => {
      if (scannedRef.current) return;
      const id = parseFriendMemberIdFromQr(scanningResult.data);
      if (!id) return;
      scannedRef.current = true;
      onMemberIdScanned(id);
      onClose();
    },
    [onMemberIdScanned, onClose],
  );

  if (Platform.OS === 'web') {
    return (
      <Modal visible={visible} animationType="fade" transparent {...transparentModalIOSProps}>
        <View style={[styles.webWrap, { paddingTop: insets.top + spacing.lg }]}>
          <Text style={styles.webTitle}>{t('qrScanner.webTitle')}</Text>
          <Text style={styles.webBody}>{t('qrScanner.webBody')}</Text>
          <TouchableOpacity style={styles.closeWeb} onPress={onClose}>
            <Text style={styles.closeWebText}>{t('qrScanner.close')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} hitSlop={12} accessibilityRole="button">
            <Text style={styles.cancel}>{t('qrScanner.cancel')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('qrScanner.title')}</Text>
          <View style={{ width: 56 }} />
        </View>

        {!permission?.granted ? (
          <View style={styles.permBody}>
            <Text style={styles.permText}>{t('qrScanner.permText')}</Text>
            <TouchableOpacity style={styles.permBtn} onPress={() => requestPermission()}>
              <Text style={styles.permBtnText}>{t('qrScanner.allowCamera')}</Text>
            </TouchableOpacity>
            {!permission && (
              <ActivityIndicator color={colors.red} style={{ marginTop: spacing.lg }} />
            )}
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={handleBarcode}
            />
            <View style={styles.frameOverlay} pointerEvents="none">
              <View style={styles.frameBox} />
            </View>
            <Text style={styles.hint}>{t('qrScanner.hint')}</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.black,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
  },
  cancel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    width: 56,
  },
  headerTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  permBody: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  permText: {
    fontSize: fontSize.base,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  permBtn: {
    alignSelf: 'center',
    backgroundColor: colors.red,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  permBtnText: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.base,
  },
  cameraContainer: {
    flex: 1,
    marginBottom: spacing.xl,
  },
  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameBox: {
    width: 260,
    height: 260,
    borderRadius: radius.lg,
    borderWidth: 3,
    borderColor: colors.gold,
    backgroundColor: 'transparent',
  },
  hint: {
    position: 'absolute',
    bottom: spacing.xl,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.85)',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  webWrap: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  webTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  webBody: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  closeWeb: {
    alignSelf: 'flex-start',
    backgroundColor: colors.nearBlack,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  closeWebText: {
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
});
