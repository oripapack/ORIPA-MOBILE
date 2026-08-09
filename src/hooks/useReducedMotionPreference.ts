import { useSyncExternalStore } from 'react';
import { AccessibilityInfo } from 'react-native';

let reduceMotion = false;
let listening = false;
const listeners = new Set<() => void>();

function publish(next: boolean) {
  if (reduceMotion === next) return;
  reduceMotion = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!listening) {
    listening = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(publish);
    AccessibilityInfo.addEventListener('reduceMotionChanged', publish);
  }
  return () => listeners.delete(listener);
}

/** One shared OS preference subscription for all non-Reanimated controls. */
export function useReducedMotionPreference(): boolean {
  return useSyncExternalStore(subscribe, () => reduceMotion, () => false);
}
