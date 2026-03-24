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
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { PrimaryButton } from '../shared/PrimaryButton';
import { SecondaryButton } from '../shared/SecondaryButton';
import { useFriendInviteResolver } from '../../hooks/useFriendInviteResolver';
import { useAppStore } from '../../store/useAppStore';
import { DEMO_DISCOVERABLE_USERS } from '../../data/socialMock';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Open the camera scanner (must be a root-level modal — not nested inside this sheet). */
  onRequestScanner: () => void;
}

export function AddFriendModal({ visible, onClose, onRequestScanner }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { resolveFromRaw } = useFriendInviteResolver({ onAdded: onClose });
  const friends = useAppStore((s) => s.friends);
  const addFriend = useAppStore((s) => s.addFriend);

  const [lookupInput, setLookupInput] = useState('');

  const demoList = useMemo(
    () => DEMO_DISCOVERABLE_USERS.filter((d) => !friends.some((f) => f.username === d.username)),
    [friends],
  );

  useEffect(() => {
    if (!visible) {
      setLookupInput('');
    }
  }, [visible]);

  const onLookupPress = () => {
    resolveFromRaw(lookupInput);
  };

  return (
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
          <Text style={styles.inputLabel}>{t('friends.enterFriendUsername')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('friends.placeholderUsername')}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            value={lookupInput}
            onChangeText={setLookupInput}
            returnKeyType="done"
            onSubmitEditing={onLookupPress}
          />
          <PrimaryButton label={t('friends.lookup')} onPress={onLookupPress} variant="red" />
          <View style={styles.scanGap} />
          <SecondaryButton
            label={t('friends.scanQr')}
            onPress={() => {
              onRequestScanner();
            }}
          />
          <Text style={styles.demoHint}>{t('friends.demoHint')}</Text>

          {demoList.length > 0 ? (
            <View style={styles.demoSection}>
              <Text style={styles.demoBrowseTitle}>{t('social.demoBrowseTitle')}</Text>
              {demoList.map((d) => (
                <View key={d.username} style={styles.demoRow}>
                  <View style={styles.demoRowText}>
                    <Text style={styles.demoName} numberOfLines={1}>
                      {d.displayName}
                    </Text>
                    <Text style={styles.demoUn} numberOfLines={1}>
                      @{d.username}
                    </Text>
                    <Text style={styles.demoBlurb} numberOfLines={2}>
                      {d.blurb}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.demoAddBtn}
                    onPress={() => {
                      const res = addFriend(d.username, d.displayName);
                      if (res.ok) {
                        Alert.alert(
                          t('social.demoAddedTitle'),
                          t('social.demoAddedBody', { name: d.displayName }),
                        );
                        onClose();
                      } else if (res.reason === 'duplicate') {
                        Alert.alert(t('social.demoAddedTitle'), t('social.demoAlreadyFriend'));
                      }
                    }}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.demoAddBtnText}>{t('friends.add')}</Text>
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
  demoSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  demoBrowseTitle: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  demoRowText: {
    flex: 1,
    minWidth: 0,
  },
  demoName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  demoUn: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    marginTop: 2,
  },
  demoBlurb: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  demoAddBtn: {
    backgroundColor: colors.nearBlack,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  demoAddBtnText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: colors.white,
    letterSpacing: 0.3,
  },
});
