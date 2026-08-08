import { colors } from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 3,
  md: 4,
  lg: 6,
  xl: 8,
  xxl: 10,
  full: 999,
};

/** Shared elevation presets — keeps cards and rails feeling “finished” on dark UI. */
export const elevation = {
  lobbyTile: {
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 22,
    elevation: 12,
  },
  heroBanner: {
    shadowColor: colors.shadowStrong,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 10,
  },
  chromeBar: {
    shadowColor: colors.shadowStrong,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
