import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { PrimaryButton } from '../shared/PrimaryButton';
import { SecondaryButton } from '../shared/SecondaryButton';
import { QrScannerModal } from './QrScannerModal';
import { useAppStore } from '../../store/useAppStore';
import {
  isValidMemberIdFormat,
  lookupMemberDisplayName,
  normalizeMemberId,
} from '../../data/friends';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AddFriendModal({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const addFriend = useAppStore((s) => s.addFriend);

  const [lookupInput, setLookupInput] = useState('');
  const [scanOpen, setScanOpen] = useState(false);

  useEffect(() => {
    if (!visible) {
      setLookupInput('');
      setScanOpen(false);
    }
  }, [visible]);

  const promptAddFriend = useCallback(
    (memberId: string, displayName: string) => {
      Alert.alert(t('friendsAlerts.addTitle'), `${displayName}\n${memberId}`, [
        { text: t('friendsAlerts.cancel'), style: 'cancel' },
        {
          text: t('friendsAlerts.add'),
          onPress: () => {
            const res = addFriend(memberId, displayName);
            if (res.ok) {
              Alert.alert(t('friendsAlerts.addedTitle'), t('friendsAlerts.addedBody', { name: displayName }));
              setLookupInput('');
              onClose();
            } else if (res.reason === 'self') {
              Alert.alert(t('friendsAlerts.selfTitle'), t('friendsAlerts.selfBody'));
            } else if (res.reason === 'duplicate') {
              Alert.alert(t('friendsAlerts.duplicateTitle'), t('friendsAlerts.duplicateBody'));
            } else {
              Alert.alert(t('friendsAlerts.errorTitle'), t('friendsAlerts.errorBody'));
            }
          },
        },
      ]);
    },
    [addFriend, onClose, t],
  );

  const resolveAndOfferAdd = useCallback(
    (rawId: string) => {
      const id = normalizeMemberId(rawId);
      if (!isValidMemberIdFormat(id)) {
        Alert.alert(t('friendsAlerts.invalidIdTitle'), t('friendsAlerts.invalidIdBody'));
        return;
      }
      const name = lookupMemberDisplayName(id);
      if (!name) {
        Alert.alert(t('friendsAlerts.notFoundTitle'), t('friendsAlerts.notFoundBody'));
        return;
      }
      promptAddFriend(id, name);
    },
    [promptAddFriend, t],
  );

  const onLookupPress = () => {
    resolveAndOfferAdd(lookupInput);
  };

  const onScanned = (memberId: string) => {
    setScanOpen(false);
    resolveAndOfferAdd(memberId);
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
        <View
          style={[
            styles.root,
            {
              paddingTop: insets.top + spacing.sm,
              paddingBottom: insets.bottom + spacing.base,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerAccent} />
            <View style={styles.headerInner}>
              <Text style={styles.badge}>{t('friends.heroEyebrow')}</Text>
              <View style={styles.headerRow}>
                <Text style={styles.title}>{t('friends.addModalTitle')}</Text>
                <TouchableOpacity onPress={onClose} hitSlop={12}>
                  <Text style={styles.cancel}>{t('locale.cancel')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.inputLabel}>{t('friends.enterFriendId')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('friends.placeholderId')}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              value={lookupInput}
              onChangeText={setLookupInput}
              returnKeyType="done"
              onSubmitEditing={onLookupPress}
            />
            <PrimaryButton label={t('friends.lookup')} onPress={onLookupPress} variant="red" />
            <View style={styles.scanGap} />
            <SecondaryButton label={t('friends.scanQr')} onPress={() => setScanOpen(true)} />
            <Text style={styles.demoHint}>{t('friends.demoHint')}</Text>
          </ScrollView>
        </View>
      </Modal>

      <QrScannerModal visible={scanOpen} onClose={() => setScanOpen(false)} onMemberIdScanned={onScanned} />
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.homeGradientBottom,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: colors.casinoFelt,
    borderBottomWidth: 1,
    borderBottomColor: colors.casinoFeltBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  headerAccent: {
    width: 5,
    backgroundColor: colors.casinoGold,
  },
  headerInner: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  badge: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.casinoGold,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.white,
    letterSpacing: -0.3,
  },
  cancel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: 'rgba(248,250,252,0.75)',
  },
  scroll: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.casinoGold,
    paddingHorizontal: spacing.base,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceElevated,
  },
  scanGap: {
    height: spacing.sm,
  },
  demoHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});
