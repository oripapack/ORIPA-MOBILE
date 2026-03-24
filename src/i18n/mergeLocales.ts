/**
 * Deep-merge each locale on top of English so missing keys inherit English copy.
 * Without this, shorter locale files leave holes and i18next shows raw key paths.
 */

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

export function mergeWithEnglish(
  english: Record<string, unknown>,
  overlay: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const key of Object.keys(english)) {
    const b = english[key];
    const o = overlay[key];

    if (o === undefined) {
      out[key] = b;
      continue;
    }

    if (Array.isArray(b) || Array.isArray(o)) {
      out[key] = o;
      continue;
    }

    if (isPlainObject(b) && isPlainObject(o)) {
      out[key] = mergeWithEnglish(b, o);
      continue;
    }

    out[key] = o;
  }

  for (const key of Object.keys(overlay)) {
    if (!(key in english)) {
      out[key] = overlay[key];
    }
  }

  return out;
}
