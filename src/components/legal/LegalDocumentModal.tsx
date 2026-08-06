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
      <View style={[styles.root, { paddingTop: insets.top + sg.space.sm, paddingBottom: insets.bottom + sg.space.sm }]}>
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
    paddingHorizontal: sg.space.md,
    paddingBottom: sg.space.sm,
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
  },
  title: {
    flex: 1,
    fontSize: sg.type.lg,
    fontFamily: sg.font.display,
    color: sg.text,
    paddingRight: sg.space.sm,
  },
  closeBtn: {
    paddingVertical: sg.space.xs,
    paddingHorizontal: sg.space.sm,
  },
  closeLabel: {
    fontSize: sg.type.base,
    fontFamily: sg.font.bodyBold,
    color: sg.error,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: sg.space.md,
    paddingTop: sg.space.md,
    paddingBottom: Platform.OS === 'ios' ? sg.space.xl : sg.space.lg,
  },
  body: {
    fontSize: sg.type.sm,
    lineHeight: 22,
    color: sg.text,
  },
});
