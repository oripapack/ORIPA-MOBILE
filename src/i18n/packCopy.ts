import type { TFunction } from 'i18next';
import type { Pack } from '../data/mockPacks';

/** Localized display strings for a pack (falls back to `mockPacks` English). */
export function getLocalizedPackFields(pack: Pack, t: TFunction) {
  const base = `packCatalog.${pack.id}`;
  return {
    title: t(`${base}.title`, { defaultValue: pack.title }),
    valueDescription: t(`${base}.value`, { defaultValue: pack.valueDescription }),
    guaranteeText: t(`${base}.guarantee`, { defaultValue: pack.guaranteeText }),
  };
}

/** Resolve title for pull history / stored `packTitle` using `packId`. */
export function getLocalizedPackTitle(packId: string, fallbackTitle: string, t: TFunction) {
  return t(`packCatalog.${packId}.title`, { defaultValue: fallbackTitle });
}
