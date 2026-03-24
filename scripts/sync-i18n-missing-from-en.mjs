#!/usr/bin/env node
/**
 * Fills **missing** keys in every non-English locale from `en.json`.
 * - Does **not** overwrite existing strings (translations stay intact).
 * - New/changed keys in English appear in other locales as English until you translate them.
 *
 * Typical loop when copy changes:
 * 1. Edit `src/i18n/locales/en.json` (keys + English).
 * 2. Run `npm run sync:i18n` (this script).
 * 3. Translate new/changed leaves in each `*.json` (AI in Cursor, vendor, or teammate).
 * 4. Run `npm run validate:i18n`.
 *
 * If you **rename** a key, old keys remain in locale files until you delete them (validate may
 * flag extra keys depending on rules — currently merge-based validation focuses on shape vs en).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '..', 'src', 'i18n', 'locales');

function isPlainObject(x) {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

function deepClone(x) {
  return JSON.parse(JSON.stringify(x));
}

/**
 * For every path present in `en`, ensure `loc` has a value. Missing branches are copied from `en`.
 * Existing leaves in `loc` are kept as-is.
 */
function fillMissingFromEn(en, loc) {
  if (Array.isArray(en)) {
    return loc !== undefined ? loc : deepClone(en);
  }
  if (isPlainObject(en)) {
    const base = isPlainObject(loc) ? { ...loc } : {};
    for (const k of Object.keys(en)) {
      if (!(k in base)) {
        base[k] = deepClone(en[k]);
      } else {
        base[k] = fillMissingFromEn(en[k], base[k]);
      }
    }
    return base;
  }
  return loc !== undefined ? loc : en;
}

function main() {
  const enPath = path.join(localesDir, 'en.json');
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const files = fs.readdirSync(localesDir).filter((f) => f.endsWith('.json'));

  for (const file of files.sort()) {
    if (file === 'en.json') continue;
    const p = path.join(localesDir, file);
    const before = fs.readFileSync(p, 'utf8');
    const loc = JSON.parse(before);
    const merged = fillMissingFromEn(en, loc);
    const after = JSON.stringify(merged, null, 2) + '\n';
    if (after !== before) {
      fs.writeFileSync(p, after, 'utf8');
      console.log('updated', file);
    } else {
      console.log('unchanged', file);
    }
  }
  console.log('\nDone. Run: npm run validate:i18n');
}

main();
