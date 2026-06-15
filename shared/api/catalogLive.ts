import { LIVE_DEMO_PACK_VERSION_ID } from './executePull';

/** Shared catalog pack id → live `pack_versions.id`. */
const CATALOG_PACK_VERSION_IDS: Record<string, string> = {
  'welcome-pack': LIVE_DEMO_PACK_VERSION_ID,
};

/** Opening-page pack ids that map to a live backend version. */
const OPENING_PACK_VERSION_IDS: Record<string, string> = {
  welcome: LIVE_DEMO_PACK_VERSION_ID,
};

export function packVersionIdForCatalogPackId(packId: string): string | undefined {
  return CATALOG_PACK_VERSION_IDS[packId];
}

export function packVersionIdForOpeningPackId(packId: string): string | undefined {
  return OPENING_PACK_VERSION_IDS[packId] ?? CATALOG_PACK_VERSION_IDS[packId];
}
