import { Platform, type ViewStyle } from 'react-native';

/**
 * Flex column root for stack/tab screens.
 * Web: `minHeight: 0` + `height: '100%'` so children get a bounded height for scrolling.
 */
export const screenRoot: ViewStyle = {
  flex: 1,
  ...(Platform.OS === 'web' ? { minHeight: 0, height: '100%' } : null),
};

/**
 * ScrollView that fills space between header and footer.
 * Web: `flex: 1` + `height: 0` is the standard flexbox scroll clipping fix.
 */
export const screenScroll: ViewStyle = {
  flex: 1,
  ...(Platform.OS === 'web' ? { minHeight: 0, height: 0 } : null),
};

/** Non-scrolling header row above a `screenScroll` sibling. */
export const screenHeader: ViewStyle = {
  flexShrink: 0,
};

/** Pinned footer below a `screenScroll` sibling (use instead of `position: 'absolute'` on web). */
export const screenFooter: ViewStyle = {
  flexShrink: 0,
};
