import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { sg } from '../tokens/sg';
import { ConnectionStatusCard } from '../components/shared/ConnectionStatusCard';

export function MessagesScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.root}>
      <Text style={styles.lead}>{t('messagesScreen.lead')}</Text>
      <ConnectionStatusCard
        eyebrow={t('messagesScreen.eyebrow')}
        title={t('messagesScreen.unavailableTitle')}
        body={t('messagesScreen.unavailableBody')}
        icon="chatbubbles-outline"
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
});
