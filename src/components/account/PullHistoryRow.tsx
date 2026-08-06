import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { getLocalizedPackTitle } from '../../i18n/packCopy';
import { useAppStore } from '../../store/useAppStore';
import { sg } from '../../tokens/sg';
import { Pull } from '../../data/mockUser';

type Props = { pull: Pull };

export function PullHistoryRow({ pull }: Props) {
  const { t, i18n } = useTranslation();
  const isStatus = pull.fulfillment === 'shipped' || pull.fulfillment === 'vaulted';

  return (
    <View style={styles.pullCard}>
      <View style={styles.pullLeft}>
        <View style={styles.pullIcon}>
          <Ionicons name="sparkles-outline" size={18} color={sg.gold} />
        </View>
        <View style={styles.pullTextCol}>
          <Text style={styles.pullResult} numberOfLines={2}>
            {pull.result}
          </Text>
          <Text style={styles.pullPack} numberOfLines={2} ellipsizeMode="tail">
            {getLocalizedPackTitle(pull.packId, pull.packTitle, t)}
          </Text>
        </View>
      </View>
      <View style={styles.pullRight}>
        <Text style={[styles.pullValue, isStatus && styles.pullStatus]} numberOfLines={1}>
          {pull.fulfillment === 'shipped'
            ? t('rewards.shipped')
            : pull.fulfillment === 'vaulted'
              ? t('rewards.inVault')
              : `+${pull.creditsWon.toLocaleString()} PTS`}
        </Text>
        <Text style={styles.pullDate}>
          {pull.timestamp.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}
        </Text>
      </View>
    </View>
  );
}

/** Reused where we need “recent pulls” without the full row layout (e.g. compact list). */
export function useCompletedPullsSorted() {
  const pullHistory = useAppStore((s) => s.user.pullHistory);
  return useMemo(() => {
    const list = pullHistory.filter((p) => p.fulfillment !== 'pending');
    return [...list].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [pullHistory]);
}

const styles = StyleSheet.create({
  pullCard: {
    backgroundColor: sg.surface,
    borderRadius: sg.radius.panel,
    borderWidth: 1,
    borderColor: sg.line,
    padding: sg.space.md,
    marginBottom: sg.space.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pullLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: sg.space.md,
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    paddingRight: sg.space.xs,
  },
  pullTextCol: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  pullIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: sg.line,
  },
  pullResult: {
    fontSize: 14,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
    width: '100%',
  },
  pullPack: {
    fontSize: 11,
    color: sg.muted,
    marginTop: 2,
    width: '100%',
  },
  pullRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
    flexGrow: 0,
    marginLeft: sg.space.sm,
    minWidth: 116,
    paddingLeft: sg.space.xs,
  },
  pullValue: {
    fontSize: 13,
    fontFamily: sg.font.dataBold,
    color: sg.gold,
    textAlign: 'right',
    width: '100%',
    fontVariant: [...sg.numeric],
  },
  pullStatus: { color: sg.success },
  pullDate: {
    fontSize: 11,
    fontFamily: sg.font.data,
    color: sg.muted,
    marginTop: 2,
    fontVariant: [...sg.numeric],
  },
});
