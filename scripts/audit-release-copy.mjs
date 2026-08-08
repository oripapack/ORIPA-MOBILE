import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const sourceExtensions = new Set(['.ts', '.tsx']);
const emojiPattern = /[\u{1F300}-\u{1FAFF}]/u;
const forbiddenTerms =
  /\b(coins?|credits?|buyback|buy back|cash out|cash in|market value|retail value)\b/i;
const hypePattern = /(?:\bInsane\b|Don't miss out|(?:^|\s)#1(?:\s|$))/i;

function walkFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '_archive') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

function walkValues(value, keyPath, visit) {
  if (typeof value === 'string') {
    visit(value, keyPath);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    walkValues(child, keyPath ? `${keyPath}.${key}` : key, visit);
  }
}

const localeDir = path.join(root, 'src/i18n/locales');
for (const file of walkFiles(localeDir).filter((name) => name.endsWith('.json'))) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  walkValues(data, '', (value, keyPath) => {
    const visible = value.replace(/\{\{(?:coins?|credits?)\}\}/gi, '');
    if (forbiddenTerms.test(visible)) {
      failures.push(`${path.relative(root, file)}:${keyPath} uses a forbidden currency term`);
    }
    if (emojiPattern.test(value)) {
      failures.push(`${path.relative(root, file)}:${keyPath} contains an emoji icon`);
    }
    if (hypePattern.test(value)) {
      failures.push(`${path.relative(root, file)}:${keyPath} contains unverifiable hype`);
    }
  });
}

for (const sourceRoot of ['src', 'shared']) {
  for (const file of walkFiles(path.join(root, sourceRoot))) {
    if (!sourceExtensions.has(path.extname(file))) continue;
    const source = fs.readFileSync(file, 'utf8');
    const relative = path.relative(root, file);
    if (/#(?:fff|ffffff)\b/i.test(source)) {
      failures.push(`${relative} contains forbidden pure white`);
    }
    if (emojiPattern.test(source)) {
      failures.push(`${relative} contains an emoji icon`);
    }
    if (hypePattern.test(source)) {
      failures.push(`${relative} contains unverifiable hype`);
    }
  }
}

if (failures.length > 0) {
  console.error('Release copy audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Release copy audit passed: C-5 literals and C-13 locale terms are clean.');
