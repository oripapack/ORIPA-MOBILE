import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Pull } from '../../data/mockUser';
import { buildHitRateWindow } from '../../lib/hitRate';
import { sg } from '../../tokens/sg';
import { VaultFramedCard } from '../shared/VaultFramedCard';

const WINDOW = 10;

interface Props {
  pullHistory: Pull[];
}

export function HitRateCard({ pullHistory }: Props) {
  const { t } = useTranslation();
  const { pct, slots, tracked } = useMemo(
    () => buildHitRateWindow(pullHistory, WINDOW),
    [pullHistory],
  );

  const barSlots = useMemo(() => {
    const out: ({ hit: boolean } | 'empty')[] = [];
    for (let i = 0; i < WINDOW; i += 1) {
      if (i < slots.length) out.push(slots[i]);
      else out.push('empty');
    }
    return out;
  }, [slots]);

  return (
    <VaultFramedCard style={styles.card} contentStyle={styles.inner}>
      <Text style={styles.title}>{t('account.hitRateTitle')}</Text>
      {tracked === 0 ? (
        <Text style={styles.empty}>{t('account.hitRateEmpty')}</Text>
      ) : (
        <>
          <View style={styles.pctRow}>
            <Text style={styles.pct}>{pct}%</Text>
            <Text style={styles.pctHint}>
              {t('account.hitRateSample', { count: tracked, window: WINDOW })}
            </Text>
          </View>
          <View style={styles.bar}>
            {barSlots.map((s, i) => (
              <View
                key={i}
                style={[
                  styles.barSeg,
                  s === 'empty'
                    ? styles.barEmpty
                    : s.hit
                      ? styles.barHit
                      : styles.barMiss,
                ]}
              />
            ))}
          </View>
          <View style={styles.legendRow}>
            {barSlots.map((s, i) => (
              <View key={i} style={styles.tickWrap}>
                {s === 'empty' ? (
                  <Text style={styles.tickEmpty}>—</Text>
                ) : (
                  <Text style={[styles.tick, s.hit ? styles.tickHit : styles.tickMiss]}>
                    {s.hit ? t('account.hitRateMarkHit') : t('account.hitRateMarkMiss')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </>
      )}
    </VaultFramedCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: sg.space.lg,
  },
  inner: {
    paddingVertical: sg.space.md,
    paddingHorizontal: sg.space.md,
  },
  title: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: sg.space.md,
  },
  empty: {
    fontSize: sg.type.sm,
    color: sg.muted,
    lineHeight: 20,
  },
  pctRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: sg.space.sm,
    marginBottom: sg.space.md,
  },
  pct: {
    fontSize: sg.type.xxl,
    fontFamily: sg.font.dataBold,
    fontVariant: [...sg.numeric],
    color: sg.text,
    letterSpacing: -0.5,
  },
  pctHint: {
    fontSize: sg.type.xs,
    color: sg.muted,
    flex: 1,
  },
  bar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: sg.space.sm,
  },
  barSeg: {
    flex: 1,
    height: 8,
    borderRadius: sg.radius.tag,
  },
  barHit: {
    backgroundColor: sg.success,
    opacity: 0.85,
  },
  barMiss: {
    backgroundColor: sg.error,
    opacity: 0.45,
  },
  barEmpty: {
    backgroundColor: sg.line,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 4,
  },
  tickWrap: {
    flex: 1,
    alignItems: 'center',
  },
  tick: {
    fontSize: 9,
    fontFamily: sg.font.dataBold,
    fontVariant: [...sg.numeric],
  },
  tickHit: {
    color: sg.success,
  },
  tickMiss: {
    color: sg.error,
  },
  tickEmpty: {
    fontSize: 9,
    color: sg.muted,
    opacity: 0.5,
  },
});
