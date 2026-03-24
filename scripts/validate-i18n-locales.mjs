#!/usr/bin/env node
/**
 * Validates every src/i18n/locales/*.json:
 * - Parses as JSON
 * - Shape matches en.json (no string where English has a nested object)
 * - mergeWithEnglish(en, locale) yields full tree (spot-check: same top-level keys)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const localesDir = path.join(root, 'src', 'i18n', 'locales');
const indexTsPath = path.join(root, 'src', 'i18n', 'index.ts');

function isPlainObject(x) {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

function mergeWithEnglish(english, overlay) {
  const out = {};
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

function assertCompatibleShape(english, overlay, pathPrefix) {
  if (english === undefined) return;

  if (Array.isArray(english)) {
    if (overlay !== undefined && !Array.isArray(overlay)) {
      throw new Error(`${pathPrefix}: English is array but locale is ${typeof overlay}`);
    }
    return;
  }

  if (isPlainObject(english)) {
    if (overlay === undefined) return;
    if (!isPlainObject(overlay)) {
      throw new Error(`${pathPrefix}: English is object but locale is ${typeof overlay}`);
    }
    for (const k of Object.keys(english)) {
      assertCompatibleShape(english[k], overlay[k], `${pathPrefix}.${k}`);
    }
    return;
  }

  // Leaf in English (string/number/boolean/null)
  if (overlay !== undefined && isPlainObject(overlay)) {
    throw new Error(`${pathPrefix}: English is leaf but locale is object`);
  }
}

function countLeaves(obj) {
  if (!isPlainObject(obj)) return 1;
  let n = 0;
  for (const k of Object.keys(obj)) {
    n += countLeaves(obj[k]);
  }
  return n;
}

function main() {
  const files = fs.readdirSync(localesDir).filter((f) => f.endsWith('.json'));
  if (!files.includes('en.json')) {
    console.error('Missing en.json');
    process.exit(1);
  }

  const indexTs = fs.readFileSync(indexTsPath, 'utf8');
  let errors = 0;

  for (const file of files) {
    if (file === 'en.json') continue;
    const code = file.replace(/\.json$/, '');
    const needle = `locales/${code}.json`;
    if (!indexTs.includes(needle)) {
      console.error(`FAIL: ${file} is not imported in src/i18n/index.ts (expected ${needle})`);
      errors++;
    }
  }

  const enRaw = fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8');
  const en = JSON.parse(enRaw);

  for (const file of files.sort()) {
    const id = file.replace(/\.json$/, '');
    const full = path.join(localesDir, file);
    try {
      const raw = fs.readFileSync(full, 'utf8');
      const loc = JSON.parse(raw);
      assertCompatibleShape(en, loc, id);
      if (id !== 'en') {
        const merged = mergeWithEnglish(en, loc);
        const enKeys = Object.keys(en).sort().join(',');
        const mergedKeys = Object.keys(merged).sort().join(',');
        if (enKeys !== mergedKeys) {
          console.error(`FAIL ${file}: merged top-level keys differ from en.json`);
          errors++;
        }
        // Merged tree should have every leaf path from English filled
        const mergedLeaves = countLeaves(merged);
        const enLeaves = countLeaves(en);
        if (mergedLeaves < enLeaves) {
          console.error(`FAIL ${file}: merged leaf count ${mergedLeaves} < en ${enLeaves}`);
          errors++;
        }
      }
      console.log(`OK  ${file}`);
    } catch (e) {
      console.error(`FAIL ${file}:`, e.message || e);
      errors++;
    }
  }

  if (errors) {
    console.error(`\n${errors} error(s)`);
    process.exit(1);
  }
  console.log(`\nAll ${files.length} locale file(s) validated.`);
}

main();
