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
            <Text style={styles.title}>{t('friends.addModalTitle')}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Text style={styles.cancel}>{t('locale.cancel')}</Text>
            </TouchableOpacity>
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
            <PrimaryButton label={t('friends.lookup')} onPress={onLookupPress} />
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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  cancel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  scroll: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.base,
    backgroundColor: colors.white,
  },
  scanGap: {
    height: spacing.sm,
  },
  demoHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.base,
    lineHeight: 18,
  },
});
