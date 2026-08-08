import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { sg } from '../../../tokens/sg';

/** Trust strip — dividers are 1px `line` borders (N2 §3). */
export function SgTrustStrip() {
  const { t } = useTranslation();
  const items = [
    { title: t('home.trustStrip.zeroFeeTitle'), sub: t('home.trustStrip.zeroFeeSub') },
    { title: t('home.trustStrip.listedValueTitle'), sub: t('home.trustStrip.listedValueSub') },
    {
      title: t('home.trustStrip.freeShipTitle'),
      sub: t('home.trustStrip.freeShipSub'),
      subNum: t('home.trustStrip.freeShipThreshold'),
    },
  ] as const;

  return (
    <View style={styles.row}>
      {items.map((item, i) => (
        <View key={item.title} style={[styles.cell, i > 0 && styles.cellDivider]}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.sub}>
            {item.sub}
            {'subNum' in item && item.subNum ? <Text style={styles.subNum}>{item.subNum}</Text> : null}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginHorizontal: sg.space.md,
    marginTop: sg.space.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: sg.line,
  },
  cell: { flex: 1, paddingVertical: 14, paddingHorizontal: 6, alignItems: 'center' },
  cellDivider: { borderLeftWidth: 1, borderLeftColor: sg.line },
  title: { fontFamily: sg.font.bodyBold, fontSize: 12, color: sg.text },
  sub: {
    fontFamily: sg.font.body,
    fontSize: 10,
    color: sg.muted,
    marginTop: 3,
    textAlign: 'center',
  },
  subNum: {
    fontFamily: sg.font.dataBold,
    fontSize: 10,
    color: sg.muted,
    fontVariant: ['tabular-nums'],
  },
});
