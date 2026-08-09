import React, { type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  visible: boolean;
  children: ReactNode;
};

/**
 * Keep the web coach above the tab bar without react-native-web's transparent
 * Modal portal, which can intercept input while rendering beneath the app.
 */
export function CoachSpotlightHost({ visible, children }: Props) {
  if (!visible || typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}
