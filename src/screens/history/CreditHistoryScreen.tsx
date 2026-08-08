import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { sg } from '../../tokens/sg';
import { spacing } from '../../tokens/spacing';
import { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import {
  creditTransactionTypeLabel,
  fetchCreditLedgerLive,
  isLiveCreditLedgerEnabled,
  type CreditLedgerRow,
} from '../../data/creditLedger';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { VaultFramedCard } from '../../components/shared/VaultFramedCard';

type Nav = StackNavigationProp<RootStackParamList, 'CreditHistory'>;

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatSignedAmount(amount: number): string {
  const abs = Math.abs(amount).toLocaleString();
  if (amount > 0) return `+${abs}`;
  if (amount < 0) return `−${abs}`;
  return abs;
}

export function CreditHistoryScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const credits = useAppStore((s) => s.user.credits);
  const [rows, setRows] = useState<CreditLedgerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('creditHistory.navTitle'),
      headerShown: true,
      headerTintColor: sg.text,
      headerTitleStyle: { fontFamily: sg.font.bodyBold },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: sg.surface2 },
    });
  }, [navigation, t]);

  const load = useCallback(async () => {
    setError(null);
    if (!isLiveCreditLedgerEnabled()) {
      setRows([]);
      setLoading(false);
      return;
    }
    try {
      const next = await fetchCreditLedgerLive({
        limit: 80,
        currentBalance: credits,
      });
      setRows(next);
    } catch {
      setError(t('creditHistory.loadError'));
    } finally {
      setLoading(false);
    }
  }, [credits, t]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load]),
  );

  const { refreshControl } = usePullToRefresh({
    onRefresh: async () => {
      await load();
    },
  });

  if (loading && rows.length === 0) {
    return (
      <View style={[styles.centered, { paddingBottom: insets.bottom }]}>
        <ActivityIndicator color={sg.gold} />
        <Text style={styles.muted}>{t('creditHistory.loading')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xxxl, paddingTop: spacing.md },
      ]}
      data={rows}
      keyExtractor={(item) => item.id}
      refreshControl={refreshControl}
      ListHeaderComponent={
        <View style={styles.headerBlock}>
          <Text style={styles.lead}>{t('creditHistory.lead')}</Text>
          <Text style={styles.balanceLine}>
            {t('creditHistory.currentBalance', { balance: credits.toLocaleString() })}
          </Text>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => void load()} accessibilityRole="button">
                <Text style={styles.link}>{t('creditHistory.retry')}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          {!isLiveCreditLedgerEnabled() ? (
            <Text style={styles.offline}>{t('creditHistory.offlineNote')}</Text>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        !loading && !error && isLiveCreditLedgerEnabled() ? (
          <VaultFramedCard style={styles.emptyCard} contentStyle={styles.emptyInner}>
            <Text style={styles.emptyTitle}>{t('creditHistory.emptyTitle')}</Text>
            <Text style={styles.emptyBody}>{t('creditHistory.emptyBody')}</Text>
          </VaultFramedCard>
        ) : null
      }
      renderItem={({ item }) => {
        const credit = item.amount > 0;
        return (
          <VaultFramedCard style={styles.rowCard} contentStyle={styles.rowInner}>
            <View style={styles.rowTop}>
              <Text style={styles.type}>{creditTransactionTypeLabel(item.transaction_type)}</Text>
              <Text style={[styles.amount, credit ? styles.amountCredit : styles.amountDebit]}>
                {formatSignedAmount(item.amount)}
              </Text>
            </View>
            <View style={styles.rowBottom}>
              <Text style={styles.when}>{formatWhen(item.created_at)}</Text>
              <Text style={styles.balanceAfter}>
                {t('creditHistory.balanceAfter', {
                  balance: item.balanceAfter.toLocaleString(),
                })}
              </Text>
            </View>
          </VaultFramedCard>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: sg.bg },
  content: { paddingHorizontal: spacing.md, gap: spacing.sm },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sg.bg,
    gap: spacing.sm,
  },
  muted: { fontFamily: sg.font.body, fontSize: 13, color: sg.muted },
  headerBlock: { marginBottom: spacing.sm, gap: 8 },
  lead: { fontFamily: sg.font.body, fontSize: 14, lineHeight: 20, color: sg.muted },
  balanceLine: {
    fontFamily: sg.font.dataBold,
    fontSize: 13,
    color: sg.gold,
    fontVariant: [...sg.numeric],
  },
  offline: { fontFamily: sg.font.body, fontSize: 12, lineHeight: 17, color: sg.muted },
  errorBox: {
    padding: spacing.sm,
    borderRadius: sg.radius.panel,
    borderWidth: 1,
    borderColor: sg.line,
    backgroundColor: sg.surface,
    gap: 6,
  },
  errorText: { fontFamily: sg.font.body, fontSize: 13, color: sg.text },
  link: { fontFamily: sg.font.bodyBold, fontSize: 13, color: sg.gold },
  emptyCard: { marginTop: spacing.md },
  emptyInner: { padding: spacing.lg, gap: 8 },
  emptyTitle: { fontFamily: sg.font.bodyBold, fontSize: 16, color: sg.text },
  emptyBody: { fontFamily: sg.font.body, fontSize: 13, lineHeight: 18, color: sg.muted },
  rowCard: { marginBottom: 2 },
  rowInner: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, gap: 6 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  type: { fontFamily: sg.font.bodyBold, fontSize: 14, color: sg.text, flex: 1, paddingRight: 8 },
  amount: {
    fontFamily: sg.font.dataBold,
    fontSize: 15,
    fontVariant: [...sg.numeric],
  },
  amountCredit: { color: sg.gold },
  amountDebit: { color: sg.text },
  when: { fontFamily: sg.font.body, fontSize: 11, color: sg.muted, flex: 1, paddingRight: 8 },
  balanceAfter: {
    fontFamily: sg.font.data,
    fontSize: 11,
    color: sg.muted,
    fontVariant: [...sg.numeric],
  },
});
