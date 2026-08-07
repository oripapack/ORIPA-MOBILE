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
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TerminalBackdrop } from '../terminal/TerminalBackdrop';

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
        <TerminalBackdrop />
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.documentMark}>
              <Ionicons name="document-text-outline" size={18} color={sg.goldHi} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.headerKicker}>TOKYO TERMINAL / LEGAL</Text>
              <Text style={styles.title}>{title}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={12} style={styles.closeBtn} accessibilityRole="button">
            <Text style={styles.closeLabel}>{t('legalModal.done')}</Text>
            <Ionicons name="close" size={17} color={sg.text} />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator
        >
          <View style={styles.document}>
            <View style={styles.documentMeta}>
              <Text style={styles.documentCode}>DOC / 01</Text>
              <View style={styles.metaLine} />
            </View>
            <Text style={styles.body}>{body}</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: sg.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: sg.space.sm,
    minHeight: 68,
    paddingHorizontal: sg.space.md,
    paddingVertical: sg.space.sm,
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
    backgroundColor: sg.surface,
  },
  headerTitleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.sm,
  },
  documentMark: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sg.cobaltWash,
    borderWidth: 1,
    borderColor: sg.cobaltBorder,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  headerKicker: {
    fontFamily: sg.font.label,
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 0.9,
    color: sg.muted,
  },
  title: {
    marginTop: 1,
    fontSize: 19,
    lineHeight: 22,
    fontFamily: sg.font.display,
    color: sg.text,
  },
  closeBtn: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: sg.lineStrong,
    backgroundColor: sg.surface2,
  },
  closeLabel: {
    fontSize: 13,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: sg.space.md,
    paddingTop: sg.space.md,
    paddingBottom: Platform.OS === 'ios' ? sg.space.xxxl : sg.space.xl,
  },
  document: {
    paddingHorizontal: sg.space.md,
    paddingTop: sg.space.md,
    paddingBottom: sg.space.lg,
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
    borderLeftWidth: 3,
    borderLeftColor: sg.gold,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.sm,
    marginBottom: sg.space.md,
  },
  documentCode: {
    fontFamily: sg.font.label,
    fontSize: sg.type.label.fontSize,
    lineHeight: sg.type.label.lineHeight,
    letterSpacing: sg.type.label.letterSpacing,
    color: sg.goldHi,
  },
  metaLine: { flex: 1, height: 1, backgroundColor: sg.line },
  body: {
    fontFamily: sg.font.body,
    fontSize: 14,
    lineHeight: 23,
    color: sg.ivoryLight,
  },
});
