import React from 'react';
import { sg } from '../../tokens/sg';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontSize } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

interface Props {
  visible: boolean;
  title: string;
  body: string;
  onClose: () => void;
}

export function LegalDocumentModal({ visible, title, body, onClose }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.root, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.sm }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12} style={styles.closeBtn} accessibilityRole="button">
            <Text style={styles.closeLabel}>{t('legalModal.done')}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator
        >
          <Text style={styles.body}>{body}</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: sg.surface2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
  },
  title: {
    flex: 1,
    fontSize: fontSize.lg,
    fontFamily: sg.font.display,
    color: sg.text,
    paddingRight: spacing.sm,
  },
  closeBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  closeLabel: {
    fontSize: fontSize.base,
    fontFamily: sg.font.bodyBold,
    color: sg.error,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
  },
  body: {
    fontSize: fontSize.sm,
    lineHeight: 22,
    color: sg.text,
  },
});
