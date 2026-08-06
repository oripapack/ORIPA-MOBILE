import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { sg } from '../../tokens/sg';
import { PrimaryButton } from '../shared/PrimaryButton';
import { useFriendInviteResolver } from '../../hooks/useFriendInviteResolver';
import { useAppStore } from '../../store/useAppStore';
import { DEMO_DISCOVERABLE_USERS } from '../../data/socialMock';
import { showUserMessage } from '../../utils/showUserMessage';

interface Props {
  visible: boolean;
  onClose: () => void;
  onRequestScanner: () => void;
  onShowMyQr: () => void;
  onCopyInviteLink: () => void;
}

type MethodRow = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

export function AddFriendModal({
  visible,
  onClose,
  onRequestScanner,
  onShowMyQr,
  onCopyInviteLink,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { resolveFromRaw } = useFriendInviteResolver({
    onAdded: () => setLookupInput(''),
  });
  const friends = useAppStore((s) => s.friends);
  const addFriend = useAppStore((s) => s.addFriend);

  const [lookupInput, setLookupInput] = useState('');

  const demoList = useMemo(
    () => DEMO_DISCOVERABLE_USERS.filter((d) => !friends.some((f) => f.username === d.username)),
    [friends],
  );

  useEffect(() => {
    if (!visible) setLookupInput('');
  }, [visible]);

  const methodRows: MethodRow[] = [
    {
      key: 'scan',
      icon: 'scan-outline',
      label: t('friends.addMethodScan'),
      onPress: onRequestScanner,
    },
    {
      key: 'showQr',
      icon: 'qr-code-outline',
      label: t('friends.addMethodShowQr'),
      onPress: onShowMyQr,
    },
    {
      key: 'copyLink',
      icon: 'link-outline',
      label: t('friends.addMethodCopyLink'),
      onPress: onCopyInviteLink,
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.topBar}>
          <Text style={styles.title}>{t('friends.addModalTitle')}</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={12}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
          >
            <Ionicons name="close" size={24} color={sg.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>{t('friends.addModalSubtitle')}</Text>

          <Text style={styles.fieldLabel}>{t('friends.enterFriendUsername')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('friends.placeholderUsername')}
            placeholderTextColor={sg.muted}
            autoCapitalize="none"
            autoCorrect={false}
            value={lookupInput}
            onChangeText={setLookupInput}
            returnKeyType="done"
            onSubmitEditing={() => resolveFromRaw(lookupInput)}
          />
          <PrimaryButton
            label={t('friends.addFriendBtn')}
            onPress={() => resolveFromRaw(lookupInput)}
            style={styles.addBtn}
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('friends.addDividerOr')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.methodList}>
            {methodRows.map((row) => (
              <TouchableOpacity
                key={row.key}
                style={styles.methodRow}
                onPress={row.onPress}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={row.label}
              >
                <View style={styles.methodIcon}>
                  <Ionicons name={row.icon} size={20} color={sg.gold} />
                </View>
                <Text style={styles.methodLabel}>{row.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={sg.muted} />
              </TouchableOpacity>
            ))}
          </View>

          {demoList.length > 0 ? (
            <View style={styles.demoBlock}>
              <Text style={styles.demoTitle}>{t('friends.demoTryTitle')}</Text>
              {demoList.map((d) => (
                <View key={d.username} style={styles.demoRow}>
                  <View style={styles.demoText}>
                    <Text style={styles.demoName} numberOfLines={1}>
                      {d.displayName}
                    </Text>
                    <Text style={styles.demoHandle} numberOfLines={1}>
                      @{d.username}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.demoAddBtn}
                    onPress={() => {
                      const res = addFriend(d.username, d.displayName);
                      if (res.ok) {
                        showUserMessage(
                          t('social.demoAddedTitle'),
                          t('social.demoAddedBody', { name: d.displayName }),
                        );
                      } else if (res.reason === 'duplicate') {
                        showUserMessage(t('social.demoAddedTitle'), t('social.demoAlreadyFriend'));
                      }
                    }}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.demoAddText}>{t('friends.add')}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
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
    paddingHorizontal: sg.space.md,
    paddingVertical: sg.space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: sg.line,
  },
  title: {
    flex: 1,
    fontSize: sg.type.xl,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: sg.space.md,
    paddingBottom: sg.space.xl,
  },
  subtitle: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 20,
    marginBottom: sg.space.lg,
  },
  fieldLabel: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    marginBottom: sg.space.xs,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    borderRadius: sg.radius.btn,
    paddingHorizontal: sg.space.md,
    paddingVertical: Platform.OS === 'ios' ? sg.space.md : sg.space.sm,
    fontSize: sg.type.md,
    fontFamily: sg.font.body,
    color: sg.text,
    backgroundColor: sg.surface2,
    marginBottom: sg.space.md,
  },
  addBtn: {
    marginBottom: sg.space.lg,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.sm,
    marginBottom: sg.space.lg,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: sg.line,
  },
  dividerText: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
  },
  methodList: {
    borderRadius: sg.radius.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    overflow: 'hidden',
    backgroundColor: sg.surface2,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.md,
    paddingHorizontal: sg.space.md,
    paddingVertical: sg.space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: sg.line,
  },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: sg.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLabel: {
    flex: 1,
    fontSize: sg.type.md,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  demoBlock: {
    marginTop: sg.space.lg,
  },
  demoTitle: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    marginBottom: sg.space.sm,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.md,
    paddingVertical: sg.space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: sg.line,
  },
  demoText: {
    flex: 1,
    minWidth: 0,
  },
  demoName: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  demoHandle: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.body,
    color: sg.muted,
    marginTop: 2,
  },
  demoAddBtn: {
    paddingHorizontal: sg.space.md,
    paddingVertical: sg.space.sm,
    borderRadius: sg.radius.btn,
    backgroundColor: sg.accentSoft,
    borderWidth: 1,
    borderColor: sg.accentLine,
  },
  demoAddText: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.gold,
  },
});
