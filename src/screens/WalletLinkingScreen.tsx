import React, { useCallback, useLayoutEffect, useState } from 'react';
import { sg } from '../tokens/sg';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '@clerk/clerk-expo';
import { RootStackParamList } from '../navigation/types';
import { createClerkAuthedClient } from '../lib/supabaseAuthed';
import { isSupabaseConfigured } from '../lib/supabase';
import { isClerkEnabled } from '../config/clerk';
import { showUserMessage } from '../utils/showUserMessage';

type Nav = StackNavigationProp<RootStackParamList, 'WalletLinking'>;

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export function WalletLinkingScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('walletLinking.navTitle'),
      headerShown: true,
      headerTintColor: sg.text,
      headerTitleStyle: { fontFamily: sg.font.bodyBold },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: sg.surface2 },
    });
  }, [navigation, t]);

  if (!isClerkEnabled) {
    return (
      <View style={styles.unavailableRoot}>
        <View style={styles.unavailableCard}>
          <Text style={styles.unavailableEyebrow}>{t('walletLinking.navTitle')}</Text>
          <Text style={styles.unavailableTitle}>{t('walletLinking.unavailableTitle')}</Text>
          <Text style={styles.unavailableBody}>{t('walletLinking.unavailableBody')}</Text>
        </View>
      </View>
    );
  }

  return <WalletLinkingClerkContent />;
}

function WalletLinkingClerkContent() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { userId, isLoaded } = useAuth();
  const [address, setAddress] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (!isLoaded) return;

    void (async () => {
      if (!userId || !isSupabaseConfigured) {
        setLoaded(true);
        return;
      }

      try {
        const supabase = await createClerkAuthedClient();
        if (!supabase) {
          setLoaded(true);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('wallet_address')
          .eq('id', userId)
          .maybeSingle();

        if (!error && data?.wallet_address) {
          setAddress(data.wallet_address);
        }
      } catch {
        /* ignore load errors */
      } finally {
        setLoaded(true);
      }
    })();
  }, [isLoaded, userId]);

  const onSave = useCallback(async () => {
    const inputAddress = address.trim();

    if (!EVM_ADDRESS_RE.test(inputAddress)) {
      showUserMessage(t('walletLinking.invalidTitle'), t('walletLinking.invalidBody'));
      return;
    }

    if (!userId) {
      showUserMessage(t('common.error'), t('walletLinking.notSignedIn'));
      return;
    }

    if (!isSupabaseConfigured) {
      showUserMessage(t('common.error'), t('walletLinking.notConfigured'));
      return;
    }

    setSaving(true);
    try {
      const supabase = await createClerkAuthedClient();
      if (!supabase) {
        showUserMessage(t('common.error'), t('walletLinking.authFailed'));
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ wallet_address: inputAddress })
        .eq('id', userId);

      if (error) {
        showUserMessage(t('common.error'), error.message);
        return;
      }

      setAddress(inputAddress);
      showUserMessage(t('walletLinking.savedTitle'), t('walletLinking.savedBody'));
    } catch {
      showUserMessage(t('common.error'), t('walletLinking.saveFailed'));
    } finally {
      setSaving(false);
    }
  }, [address, t, userId]);

  if (!loaded) {
    return <View style={[styles.container, { backgroundColor: sg.bg }]} />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + sg.space.xxl }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.lead}>{t('walletLinking.lead')}</Text>

      <View style={styles.field}>
        <Text style={styles.label}>{t('walletLinking.fieldLabel')}</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder={t('walletLinking.placeholder')}
          placeholderTextColor={sg.muted}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
        />
      </View>

      <Text style={styles.hint}>{t('walletLinking.hint')}</Text>

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={() => void onSave()}
        activeOpacity={0.88}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={sg.text} />
        ) : (
          <Text style={styles.saveBtnText}>{t('walletLinking.save')}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  unavailableRoot: {
    flex: 1,
    backgroundColor: sg.bg,
    padding: sg.space.md,
  },
  unavailableCard: {
    backgroundColor: sg.surface,
    borderRadius: sg.radius.panel,
    borderWidth: 1,
    borderColor: sg.line,
    padding: sg.space.lg,
  },
  unavailableEyebrow: {
    fontFamily: sg.font.dataBold,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: sg.gold,
    marginBottom: sg.space.sm,
  },
  unavailableTitle: {
    fontFamily: sg.font.display,
    fontSize: 24,
    color: sg.text,
    marginBottom: sg.space.sm,
  },
  unavailableBody: {
    fontFamily: sg.font.body,
    fontSize: 13,
    lineHeight: 20,
    color: sg.muted,
  },
  container: { flex: 1, backgroundColor: sg.bg },
  content: { padding: sg.space.md, paddingTop: sg.space.md },
  lead: {
    fontSize: sg.type.sm,
    color: sg.muted,
    lineHeight: 22,
    marginBottom: sg.space.lg,
  },
  field: { marginBottom: sg.space.sm },
  label: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    marginBottom: sg.space.xs,
  },
  input: {
    backgroundColor: sg.surface2,
    borderRadius: sg.radius.btn,
    borderWidth: 1,
    borderColor: sg.line,
    paddingHorizontal: sg.space.md,
    paddingVertical: sg.space.sm,
    fontSize: sg.type.base,
    color: sg.text,
    minHeight: 48,
    fontFamily: sg.font.bodyMedium,
  },
  hint: {
    fontSize: sg.type.xs,
    color: sg.muted,
    lineHeight: 18,
    marginBottom: sg.space.lg,
  },
  saveBtn: {
    backgroundColor: sg.gold,
    borderRadius: sg.radius.panel,
    paddingVertical: sg.space.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: {
    fontSize: sg.type.md,
    fontFamily: sg.font.bodyBold,
    color: sg.onGold,
  },
});
