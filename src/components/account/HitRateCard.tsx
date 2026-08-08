import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Pull } from '../../data/mockUser';
import { buildHitRateWindow } from '../../lib/hitRate';
import { sg } from '../../tokens/sg';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
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
    marginBottom: spacing.lg,
  },
  inner: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  title: {
    fontSize: 10,
    fontFamily: brandFont.black,
    color: sg.muted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  empty: {
    fontSize: fontSize.sm,
    color: sg.muted,
    lineHeight: 20,
  },
  pctRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  pct: {
    fontSize: fontSize.xxl,
    fontFamily: brandFont.black,
    color: sg.text,
    letterSpacing: -0.5,
  },
  pctHint: {
    fontSize: fontSize.xs,
    color: sg.muted,
    flex: 1,
  },
  bar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.sm,
  },
  barSeg: {
    flex: 1,
    height: 8,
    borderRadius: radius.sm,
  },
  barHit: {
    backgroundColor: sg.success,
    opacity: 0.85,
  },
  barMiss: {
    backgroundColor: sg.error,
    opacity: 0.65,
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
    fontFamily: brandFont.black,
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
