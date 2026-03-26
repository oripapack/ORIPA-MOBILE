#!/usr/bin/env node
/**
 * Applies flat path → string translations from scripts/i18n-translations/<lang>.json
 * Only replaces a leaf when it still equals en.json (avoids clobbering manual edits).
 *
 * Run: node scripts/apply-i18n-translations.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '..', 'src', 'i18n', 'locales');
const transDir = path.join(__dirname, 'i18n-translations');

function flat(obj, p = '', o = {}) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    o[p] = obj;
    return o;
  }
  for (const k of Object.keys(obj)) flat(obj[k], p ? `${p}.${k}` : k, o);
  return o;
}

function setPath(obj, dotPath, value) {
  const parts = dotPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (!cur[k] || typeof cur[k] !== 'object') cur[k] = {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
}

function main() {
  const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));
  const fEn = flat(en);

  const files = fs.readdirSync(transDir).filter((f) => f.endsWith('.json'));
  if (!files.length) {
    console.error('No JSON files in', transDir);
    process.exit(1);
  }

  for (const tf of files.sort()) {
    const lang = tf.replace(/\.json$/, '');
    if (lang === 'en') continue;
    const localePath = path.join(localesDir, `${lang}.json`);
    if (!fs.existsSync(localePath)) {
      console.warn('skip missing locale', lang);
      continue;
    }
    const patch = JSON.parse(fs.readFileSync(path.join(transDir, tf), 'utf8'));
    const raw = fs.readFileSync(localePath, 'utf8');
    const loc = JSON.parse(raw);
    const fLoc = flat(loc);
    let n = 0;
    for (const [dotPath, translated] of Object.entries(patch)) {
      if (typeof translated !== 'string') continue;
      if (fEn[dotPath] === undefined) {
        console.warn(`  ${lang}: unknown path ${dotPath}`);
        continue;
      }
      if (fLoc[dotPath] === fEn[dotPath]) {
        setPath(loc, dotPath, translated);
        n++;
      }
    }
    const out = JSON.stringify(loc, null, 2) + '\n';
    if (out !== raw) fs.writeFileSync(localePath, out, 'utf8');
    console.log(lang, 'applied', n, 'patch(es)');
  }
  console.log('\nRun: npm run validate:i18n');
}

main();
