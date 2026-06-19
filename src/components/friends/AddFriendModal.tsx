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
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
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
            <Ionicons name="close" size={24} color={colors.textSecondary} />
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
            placeholderTextColor={colors.textMuted}
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
                  <Ionicons name={row.icon} size={20} color={colors.gold} />
                </View>
                <Text style={styles.methodLabel}>{row.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
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
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: {
    flex: 1,
    fontSize: fontSize.xl,
    fontFamily: brandFont.bold,
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  subtitle: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.semibold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    fontSize: fontSize.md,
    fontFamily: brandFont.regular,
    color: colors.textPrimary,
    backgroundColor: colors.nearBlack,
    marginBottom: spacing.md,
  },
  addBtn: {
    marginBottom: spacing.lg,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.medium,
    color: colors.textMuted,
  },
  methodList: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.nearBlack,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLabel: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: brandFont.semibold,
    color: colors.textPrimary,
  },
  demoBlock: {
    marginTop: spacing.xl,
  },
  demoTitle: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.semibold,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  demoText: {
    flex: 1,
    minWidth: 0,
  },
  demoName: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: colors.textPrimary,
  },
  demoHandle: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.regular,
    color: colors.textMuted,
    marginTop: 2,
  },
  demoAddBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  demoAddText: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: colors.gold,
  },
});
