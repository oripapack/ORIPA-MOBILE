/**
 * One-shot: replace `fontWeight: fontWeight.*` with `fontFamily: brandFont.*`
 * for Outfit to render weights correctly on Android.
 */
import fs from 'fs';
import path from 'path';

const REPLACEMENTS = [
  ['fontWeight: fontWeight.regular', 'fontFamily: brandFont.regular'],
  ['fontWeight: fontWeight.medium', 'fontFamily: brandFont.medium'],
  ['fontWeight: fontWeight.semibold', 'fontFamily: brandFont.semibold'],
  ['fontWeight: fontWeight.bold', 'fontFamily: brandFont.bold'],
  ['fontWeight: fontWeight.heavy', 'fontFamily: brandFont.extraBold'],
  ['fontWeight: fontWeight.black', 'fontFamily: brandFont.black'],
];

const STRING_WEIGHTS = [
  ["fontWeight: '900'", 'fontFamily: brandFont.black'],
  ["fontWeight: \"900\"", 'fontFamily: brandFont.black'],
  ["fontWeight: '800'", 'fontFamily: brandFont.extraBold'],
  ["fontWeight: \"800\"", 'fontFamily: brandFont.extraBold'],
  ["fontWeight: '700'", 'fontFamily: brandFont.bold'],
  ["fontWeight: \"700\"", 'fontFamily: brandFont.bold'],
];

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === 'node_modules') continue;
      walk(p, out);
    } else if (name.endsWith('.tsx') && !name.includes(' 2.tsx')) {
      out.push(p);
    }
  }
  return out;
}

function patchImport(content) {
  if (!content.includes('brandFont.')) return content;
  if (/import\s*\{[^}]*\bbrandFont\b[^}]*\}\s*from\s*['"][^'"]*tokens\/typography['"]/.test(content)) {
    return content;
  }
  const re =
    /import\s*\{([^}]*)\}\s*from\s*(['"])(\.{1,2}\/(?:[^'"]*\/)*tokens\/typography)\2/;
  const m = content.match(re);
  if (!m) {
    console.warn('No typography import found but brandFont used');
    return content;
  }
  const inner = m[1];
  if (/\bbrandFont\b/.test(inner)) return content;
  const nextInner = inner.trim().endsWith(',') ? `${inner} brandFont` : `${inner}, brandFont`;
  return content.replace(re, `import {${nextInner}} from $2$3$2`);
}

function stripUnusedFontWeightImport(content) {
  if (!/fontWeight: fontWeight\./.test(content) && /\bfontWeight\b/.test(content)) {
    const re =
      /import\s*\{([^}]*)\}\s*from\s*(['"])(\.{1,2}\/(?:[^'"]*\/)*tokens\/typography)\2/;
    const m = content.match(re);
    if (!m) return content;
    const parts = m[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const filtered = parts.filter((p) => p !== 'fontWeight');
    if (filtered.length === parts.length) return content;
    const newInner = filtered.join(', ');
    return content.replace(re, `import { ${newInner} } from $2$3$2`);
  }
  return content;
}

const root = path.join(process.cwd(), 'src');
const files = walk(root);
let touched = 0;
for (const file of files) {
  let s = fs.readFileSync(file, 'utf8');
  const orig = s;
  for (const [a, b] of [...REPLACEMENTS, ...STRING_WEIGHTS]) {
    s = s.split(a).join(b);
  }
  if (s !== orig) {
    s = patchImport(s);
    s = stripUnusedFontWeightImport(s);
    fs.writeFileSync(file, s);
    touched++;
  }
}
console.log(`Updated ${touched} files`);
