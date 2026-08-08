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
import { sg } from '../tokens/sg';
import { fontSize, brandFont } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { RootStackParamList } from '../navigation/types';
import {
  getUserShippingOrdersLive,
  isLiveShippingEnabled,
  type ShippingOrder,
} from '../data/shipping';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { VaultFramedCard } from '../components/shared/VaultFramedCard';

type Nav = StackNavigationProp<RootStackParamList, 'ShippingOrders'>;

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function ShippingOrdersScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [orders, setOrders] = useState<ShippingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('shippingOrders.navTitle'),
      headerShown: true,
      headerTintColor: sg.text,
      headerTitleStyle: { fontFamily: sg.font.bodyBold },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: sg.surface2 },
    });
  }, [navigation, t]);

  const load = useCallback(async () => {
    setError(null);
    if (!isLiveShippingEnabled()) {
      setOrders([]);
      setLoading(false);
      return;
    }
    try {
      const rows = await getUserShippingOrdersLive();
      setOrders(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('shippingOrders.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

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

  const goAddress = () => navigation.navigate('ShippingAddress');

  if (loading && orders.length === 0) {
    return (
      <View style={[styles.centered, { paddingBottom: insets.bottom }]}>
        <ActivityIndicator color={sg.gold} />
        <Text style={styles.muted}>{t('shippingOrders.loading')}</Text>
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
      data={orders}
      keyExtractor={(item) => item.id}
      refreshControl={refreshControl}
      ListHeaderComponent={
        <View style={styles.headerBlock}>
          <Text style={styles.lead}>{t('shippingOrders.lead')}</Text>
          <TouchableOpacity onPress={goAddress} accessibilityRole="button">
            <Text style={styles.link}>{t('shippingOrders.manageAddress')}</Text>
          </TouchableOpacity>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => void load()} accessibilityRole="button">
                <Text style={styles.link}>{t('shippingOrders.retry')}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          {!isLiveShippingEnabled() ? (
            <Text style={styles.offlineNote}>{t('shippingOrders.offlineNote')}</Text>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        !error ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{t('shippingOrders.emptyTitle')}</Text>
            <Text style={styles.emptyBody}>{t('shippingOrders.emptyBody')}</Text>
          </View>
        ) : null
      }
      renderItem={({ item }) => <ShippingOrderCard order={item} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

function ShippingOrderCard({ order }: { order: ShippingOrder }) {
  const { t } = useTranslation();
  const statusKey = `shippingOrders.status.${order.status}` as const;
  const itemCount = order.vault_item_ids?.length;

  return (
    <VaultFramedCard style={styles.card} contentStyle={styles.cardInner}>
      <View style={styles.cardTop}>
        <Text style={styles.orderId} numberOfLines={1}>
          {t('shippingOrders.orderId', { id: order.id.slice(0, 8) })}
        </Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{t(statusKey)}</Text>
        </View>
      </View>

      <Text style={styles.meta}>{t('shippingOrders.created', { when: formatWhen(order.created_at) })}</Text>
      {order.shipped_at ? (
        <Text style={styles.meta}>
          {t('shippingOrders.shippedAt', { when: formatWhen(order.shipped_at) })}
        </Text>
      ) : null}

      {itemCount != null && itemCount > 0 ? (
        <Text style={styles.meta}>
          {t('shippingOrders.itemCount', { count: itemCount })}
        </Text>
      ) : null}

      <Text style={styles.meta}>
        {t('shippingOrders.fee', { credits: order.fee_credits.toLocaleString() })}
      </Text>

      {order.carrier ? (
        <Text style={styles.trackingLine} selectable>
          {t('shippingOrders.carrier', { carrier: order.carrier })}
        </Text>
      ) : null}
      {order.tracking_number ? (
        <Text style={styles.trackingLine} selectable>
          {t('shippingOrders.tracking', { tracking: order.tracking_number })}
        </Text>
      ) : (
        <Text style={styles.metaMuted}>{t('shippingOrders.trackingPending')}</Text>
      )}
    </VaultFramedCard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: sg.bg },
  content: { paddingHorizontal: spacing.base },
  centered: {
    flex: 1,
    backgroundColor: sg.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  muted: { color: sg.muted, fontSize: fontSize.sm },
  headerBlock: { marginBottom: spacing.lg, gap: spacing.sm },
  lead: {
    fontSize: fontSize.sm,
    color: sg.muted,
    lineHeight: 20,
  },
  link: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: sg.gold,
  },
  offlineNote: {
    fontSize: fontSize.xs,
    color: sg.muted,
    lineHeight: 18,
  },
  errorBox: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: sg.line,
    backgroundColor: sg.surface2,
    gap: spacing.sm,
  },
  errorText: { color: sg.error, fontSize: fontSize.sm, lineHeight: 20 },
  empty: { paddingVertical: spacing.xl, alignItems: 'center' },
  emptyTitle: {
    fontSize: fontSize.md,
    fontFamily: brandFont.bold,
    color: sg.text,
    marginBottom: spacing.xs,
  },
  emptyBody: {
    fontSize: fontSize.sm,
    color: sg.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: { marginBottom: spacing.md },
  cardInner: { padding: spacing.base, gap: 6 },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: 4,
  },
  orderId: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: sg.text,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(212,175,55,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
  },
  statusPillText: {
    fontSize: 10,
    fontFamily: brandFont.bold,
    color: sg.gold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  meta: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.medium,
    color: sg.muted,
    lineHeight: 18,
  },
  metaMuted: {
    fontSize: fontSize.xs,
    color: sg.muted,
    fontStyle: 'italic',
    marginTop: 4,
  },
  trackingLine: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: sg.text,
    lineHeight: 22,
    marginTop: 4,
  },
});
