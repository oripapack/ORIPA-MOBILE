/** Live `pack_versions.id` values from backend/supabase/seed.sql */
export const LIVE_PACK_VERSION_IDS = {
  WELCOME: 'a0000000-0000-4000-8000-000000000002',
  GRAIL_EDITION: 'a0000000-0000-4000-8000-000000000004',
  CHARIZARD_CHASE: 'a0000000-0000-4000-8000-000000000006',
} as const;

/** @deprecated Use LIVE_PACK_VERSION_IDS.WELCOME */
export const LIVE_DEMO_PACK_VERSION_ID = LIVE_PACK_VERSION_IDS.WELCOME;

/** Catalog pack id → live `pack_versions.id`. */
const CATALOG_PACK_VERSION_IDS: Record<string, string> = {
  'welcome-pack': LIVE_PACK_VERSION_IDS.WELCOME,
  'grail-edition': LIVE_PACK_VERSION_IDS.GRAIL_EDITION,
  'charizard-chase': LIVE_PACK_VERSION_IDS.CHARIZARD_CHASE,
};

/** Opening-page pack ids that map to a live backend version. */
const OPENING_PACK_VERSION_IDS: Record<string, string> = {
  welcome: LIVE_PACK_VERSION_IDS.WELCOME,
  'grail-edition': LIVE_PACK_VERSION_IDS.GRAIL_EDITION,
  'charizard-chase': LIVE_PACK_VERSION_IDS.CHARIZARD_CHASE,
};

export function packVersionIdForCatalogPackId(packId: string): string | undefined {
  return CATALOG_PACK_VERSION_IDS[packId];
}

export function packVersionIdForOpeningPackId(packId: string): string | undefined {
  return OPENING_PACK_VERSION_IDS[packId] ?? CATALOG_PACK_VERSION_IDS[packId];
}

export function catalogPackIdForPackVersionId(packVersionId: string): string | undefined {
  for (const [catalogId, versionId] of Object.entries(CATALOG_PACK_VERSION_IDS)) {
    if (versionId === packVersionId) return catalogId;
  }
  return undefined;
}

export function liveCatalogPackIds(): string[] {
  return Object.keys(CATALOG_PACK_VERSION_IDS);
}
