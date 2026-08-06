import React, { useCallback, useState } from 'react';
import { sg } from '../tokens/sg';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SgScreen } from '../components/ui';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { usePromotionStore } from '../store/promotionStore';
import { VaultFramedCard } from '../components/shared/VaultFramedCard';
import { ReferralLinkCard } from '../components/promotions/ReferralLinkCard';
import { PromoCodeInput } from '../components/promotions/PromoCodeInput';
import { PromoSuccessModal } from '../components/promotions/PromoSuccessModal';
import { formatGrantSummary } from '../components/promotions/formatGrant';

export function PromotionsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const userId = useAppStore((s) => s.user.id);
  const username = useAppStore((s) => s.user.username);
  const applyManualPromo = usePromotionStore((s) => s.applyManualPromo);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ title: string; body: string } | null>(null);

  const onSubmitCode = useCallback(
    async (raw: string) => {
      setError(null);
      const result = applyManualPromo(userId, raw);
      if (!result.ok) {
        const key =
          result.reason === 'already_redeemed'
            ? 'promotions.errorRedeemed'
            : result.reason === 'invalid'
              ? 'promotions.errorInvalid'
              : 'promotions.errorInactive';
        setError(t(key));
        return;
      }
      setSuccess({
        title: result.label,
        body: formatGrantSummary(result.grant),
      });
    },
    [applyManualPromo, userId, t],
  );

  return (
    <SgScreen>
      <View style={[styles.header, { paddingTop: insets.top + sg.space.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn}>
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('promotions.screenTitle')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + sg.space.xxl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.lead}>{t('promotions.screenLead')}</Text>

        <Text style={styles.sectionHeader}>{t('promotions.sectionReferral')}</Text>
        <VaultFramedCard style={styles.card}>
          <ReferralLinkCard username={username} />
        </VaultFramedCard>

        <Text style={styles.sectionHeader}>{t('promotions.sectionCode')}</Text>
        <VaultFramedCard style={styles.card}>
          <View style={styles.codeInner}>
            <Text style={styles.codeExplainer}>{t('promotions.codeExplainer')}</Text>
            <PromoCodeInput onSubmit={onSubmitCode} />
            {error ? (
              <Text style={styles.error} accessibilityLiveRegion="polite">
                {error}
              </Text>
            ) : null}
          </View>
        </VaultFramedCard>
      </ScrollView>

      <PromoSuccessModal
        visible={success !== null}
        title={success?.title ?? ''}
        body={success?.body ?? ''}
        onDismiss={() => setSuccess(null)}
      />
    </SgScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sg.space.md,
    paddingBottom: sg.space.sm,
    backgroundColor: sg.bg,
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: {
    fontSize: 32,
    color: sg.text,
    marginTop: -4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: sg.type.lg,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: sg.bg,
  },
  content: {
    paddingHorizontal: sg.space.md,
    paddingTop: sg.space.lg,
  },
  lead: {
    fontSize: sg.type.sm,
    color: sg.muted,
    lineHeight: 20,
    marginBottom: sg.space.lg,
  },
  sectionHeader: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: sg.space.xs,
    paddingLeft: sg.space.xs,
  },
  card: {
    marginBottom: sg.space.lg,
  },
  codeInner: {
    padding: sg.space.lg,
  },
  codeExplainer: {
    fontSize: sg.type.sm,
    color: sg.muted,
    lineHeight: 20,
    marginBottom: sg.space.sm,
  },
  error: {
    marginTop: sg.space.md,
    fontSize: sg.type.sm,
    color: sg.muted,
  },
});
