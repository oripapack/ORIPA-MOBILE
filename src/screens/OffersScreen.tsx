import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { sg } from '../tokens/sg';
import { ConnectionStatusCard } from '../components/shared/ConnectionStatusCard';

export function OffersScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.root}>
      <Text style={styles.lead}>{t('offersScreen.lead')}</Text>
      <View style={styles.tabs}>
        <View style={[styles.tab, styles.tabActive]}>
          <Text style={styles.tabActiveText}>{t('offersScreen.received')}</Text>
        </View>
        <View style={styles.tab}>
          <Text style={styles.tabText}>{t('offersScreen.sent')}</Text>
        </View>
      </View>
      <ConnectionStatusCard
        eyebrow={t('offersScreen.eyebrow')}
        title={t('offersScreen.unavailableTitle')}
        body={t('offersScreen.unavailableBody')}
        icon="swap-horizontal-outline"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: sg.bg, padding: sg.space.md },
  lead: {
    fontFamily: sg.font.body,
    fontSize: 13,
    lineHeight: 20,
    color: sg.muted,
    marginBottom: sg.space.md,
  },
  tabs: { flexDirection: 'row', gap: sg.space.sm, marginBottom: sg.space.md },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: sg.radius.btn,
    borderWidth: 1,
    borderColor: sg.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: { borderColor: sg.gold, backgroundColor: sg.surface },
  tabText: { fontFamily: sg.font.bodyMedium, fontSize: 13, color: sg.muted },
  tabActiveText: { fontFamily: sg.font.bodyBold, fontSize: 13, color: sg.text },
});
