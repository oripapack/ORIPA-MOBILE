import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { parseFriendInviteFromQr } from '../../lib/friendQr';
import { showUserMessage } from '../../utils/showUserMessage';
import { sg } from '../../tokens/sg';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Called with normalized username from a valid friend QR. */
  onUsernameScanned: (username: string) => void;
}

export function QrScannerModal({ visible, onClose, onUsernameScanned }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const scannedRef = useRef(false);
  const [pasteInput, setPasteInput] = useState('');

  useEffect(() => {
    if (visible) {
      scannedRef.current = false;
      setPasteInput('');
      if (!permission?.granted) {
        void requestPermission();
      }
    }
  }, [visible, permission?.granted, requestPermission]);

  const finishScan = useCallback(
    (username: string) => {
      if (scannedRef.current) return;
      scannedRef.current = true;
      onUsernameScanned(username);
      onClose();
    },
    [onClose, onUsernameScanned],
  );

  const handleBarcode = useCallback(
    (scanningResult: BarcodeScanningResult) => {
      const username = parseFriendInviteFromQr(scanningResult.data);
      if (!username) return;
      finishScan(username);
    },
    [finishScan],
  );

  const onPasteSubmit = () => {
    const username = parseFriendInviteFromQr(pasteInput);
    if (!username) {
      showUserMessage(t('friendsAlerts.invalidIdTitle'), t('friendsAlerts.invalidIdBody'));
      return;
    }
    finishScan(username);
  };

  const showCamera = permission?.granted === true;
  const showWebPaste = Platform.OS === 'web' && !showCamera;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
          >
            <Text style={styles.cancel}>{t('qrScanner.cancel')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('qrScanner.title')}</Text>
          <View style={{ width: 56 }} />
        </View>

        {!permission && (
          <View style={styles.permBody}>
            <ActivityIndicator color={sg.gold} />
          </View>
        )}

        {permission && !showCamera ? (
          <View style={styles.permBody}>
            <Text style={styles.permText}>{t('qrScanner.permText')}</Text>
            <TouchableOpacity style={styles.permBtn} onPress={() => void requestPermission()}>
              <Text style={styles.permBtnText}>{t('qrScanner.allowCamera')}</Text>
            </TouchableOpacity>
            {showWebPaste ? (
              <View style={styles.webPasteBlock}>
                <Text style={styles.webPasteLabel}>{t('qrScanner.webPasteLabel')}</Text>
                <TextInput
                  style={styles.webPasteInput}
                  value={pasteInput}
                  onChangeText={setPasteInput}
                  placeholder={t('qrScanner.webPastePlaceholder')}
                  placeholderTextColor={sg.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity style={styles.permBtn} onPress={onPasteSubmit}>
                  <Text style={styles.permBtnText}>{t('qrScanner.webPasteSubmit')}</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        ) : null}

        {showCamera ? (
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
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: sg.bg,
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
    fontFamily: brandFont.semibold,
    color: sg.text,
    width: 56,
  },
  cancelButton: {
    minWidth: 56,
    minHeight: 44,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSize.base,
    fontFamily: brandFont.bold,
    color: sg.text,
  },
  permBody: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  permText: {
    fontSize: fontSize.base,
    color: sg.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  permBtn: {
    alignSelf: 'center',
    backgroundColor: sg.value,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  permBtnText: {
    color: sg.onValue,
    fontFamily: brandFont.bold,
    fontSize: fontSize.base,
  },
  webPasteBlock: {
    marginTop: spacing.xxl,
    gap: spacing.sm,
  },
  webPasteLabel: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.medium,
    color: sg.muted,
    textAlign: 'center',
  },
  webPasteInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.lineStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    fontFamily: brandFont.regular,
    color: sg.text,
    backgroundColor: sg.surface2,
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
    borderColor: sg.goldHi,
    backgroundColor: 'transparent',
  },
  hint: {
    position: 'absolute',
    bottom: spacing.xl,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: sg.text,
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
  },
});
