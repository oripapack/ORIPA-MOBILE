import React from 'react';
import { sg } from '../../tokens/sg';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  title: string;
  body: string;
  onDismiss: () => void;
};

export function PromoSuccessModal({ visible, title, body, onDismiss }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={[styles.card, { marginBottom: insets.bottom + sg.space.lg }]} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.eyebrow}>{t('promotions.successEyebrow')}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          <TouchableOpacity style={styles.btn} onPress={onDismiss} activeOpacity={0.88} accessibilityRole="button">
            <Text style={styles.btnText}>{t('promotions.successCta')}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: sg.space.lg,
  },
  card: {
    backgroundColor: sg.surface2,
    borderRadius: sg.radius.panel,
    padding: sg.space.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
  },
  eyebrow: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.gold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: sg.space.sm,
  },
  title: {
    fontSize: sg.type.xl,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: sg.space.sm,
  },
  body: {
    fontSize: sg.type.md,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 22,
    marginBottom: sg.space.lg,
  },
  btn: {
    backgroundColor: sg.gold,
    borderRadius: sg.radius.panel,
    paddingVertical: sg.space.md,
    alignItems: 'center',
  },
  btnText: {
    fontSize: sg.type.md,
    fontFamily: sg.font.bodyBold,
    color: sg.onGold,
  },
});
