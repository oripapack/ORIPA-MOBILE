import React from 'react';
import { AuthScreen } from '../../screens/AuthScreen';
import { AuthBottomSheet } from './AuthBottomSheet';

type EmailMode = 'signin' | 'signup';

type Props = {
  visible: boolean;
  initialEmailMode?: EmailMode;
  onRequestClose: () => void;
};

/** @deprecated name — compact bottom sheet + blur, not a full-screen modal. */
export function AuthSheetModal({ visible, initialEmailMode = 'signin', onRequestClose }: Props) {
  return (
    <AuthBottomSheet visible={visible} onRequestClose={onRequestClose} showBackdrop>
      <AuthScreen
        presentation="sheet"
        welcomeMode={false}
        initialEmailMode={initialEmailMode}
        onRequestClose={onRequestClose}
      />
    </AuthBottomSheet>
  );
}
