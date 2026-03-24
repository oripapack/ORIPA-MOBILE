import React, { useState, useCallback } from 'react';
import { RefreshControl, Platform } from 'react-native';
import { colors } from '../tokens/colors';

type Options = {
  minMs?: number;
  onRefresh?: () => void | Promise<void>;
};

/**
 * Pull down from the top of a scroll view to refresh (iOS/Android).
 * Wire `refreshControl` onto `FlatList` or `ScrollView`.
 */
export function usePullToRefresh(options: Options = {}) {
  const { minMs = 700, onRefresh: onRefreshExtra } = options;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const start = Date.now();
    try {
      await onRefreshExtra?.();
    } finally {
      const elapsed = Date.now() - start;
      if (elapsed < minMs) {
        await new Promise((r) => setTimeout(r, minMs - elapsed));
      }
      setRefreshing(false);
    }
  }, [minMs, onRefreshExtra]);

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.red}
      {...(Platform.OS === 'android'
        ? { colors: [colors.red] as [string], progressBackgroundColor: colors.surfaceElevated }
        : {})}
    />
  );

  return { refreshing, onRefresh, refreshControl };
}
