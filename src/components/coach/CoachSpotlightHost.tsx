import React, { type ReactNode } from 'react';
import { Modal } from 'react-native';

type Props = {
  visible: boolean;
  children: ReactNode;
};

export function CoachSpotlightHost({ visible, children }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      {children}
    </Modal>
  );
}
