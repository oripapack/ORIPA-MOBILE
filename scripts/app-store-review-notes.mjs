#!/usr/bin/env node

import fs from 'node:fs';

const sourcePath = process.env.APP_STORE_SUBMISSION_ENV_FILE || '.env.app-store.local';
const outputPath =
  process.env.APP_STORE_REVIEW_NOTES_FILE || 'app-store/review/generated-review-notes.local.txt';
const renderMode = process.argv.includes('--render');
const failures = [];

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const parsed = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const equals = trimmed.indexOf('=');
    if (equals < 1) continue;
    const key = trimmed.slice(0, equals).trim();
    let value = trimmed.slice(equals + 1).trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    parsed[key] = value;
  }
  return parsed;
}

if (!fs.existsSync(sourcePath)) {
  failures.push(`Missing ${sourcePath}; copy .env.app-store.example and complete it without passwords`);
}

const fileValues = parseEnvFile(sourcePath);
for (const [name, value] of Object.entries(fileValues)) {
  if (/(?:PASSWORD|SECRET|PRIVATE_KEY)/i.test(name) && String(value).trim()) {
    failures.push(`${sourcePath} must not store passwords, secrets, or private keys (${name})`);
  }
}
const values = { ...fileValues, ...process.env };

function requireValue(name) {
  const value = String(values[name] ?? '').trim();
  if (!value) {
    failures.push(`${name} is required to generate App Review notes`);
    return '';
  }
  if (
    /example\.com|live-pack-id|your |\[(?:[A-Z0-9_ -]+)\]|\b(?:describe|todo|tbd|unresolved)\b/i.test(
      value,
    )
  ) {
    failures.push(`${name} contains placeholder or unresolved text`);
  }
  return value;
}

const fields = {
  reviewEmail: requireValue('APP_STORE_REVIEW_ACCOUNT_EMAIL'),
  releaseCountries: requireValue('APP_STORE_RELEASE_COUNTRIES'),
  reviewPack: requireValue('APP_STORE_REVIEW_PACK_ID'),
  openNavigation: requireValue('APP_STORE_REVIEW_OPEN_NAVIGATION'),
  oddsNavigation: requireValue('APP_STORE_ODDS_NAVIGATION'),
  fairnessNavigation: requireValue('APP_STORE_FAIRNESS_NAVIGATION'),
  vaultNavigation: requireValue('APP_STORE_VAULT_TRADE_IN_NAVIGATION'),
  shippingLimitations: requireValue('APP_STORE_SHIPPING_LIMITATIONS'),
  accountDeletionNavigation: requireValue('APP_STORE_ACCOUNT_DELETION_NAVIGATION'),
  productIds: requireValue('APP_STORE_POINTS_PRODUCT_IDS'),
  chanceModelSummary: requireValue('APP_STORE_CHANCE_MODEL_SUMMARY'),
  supportEmail: requireValue('APP_STORE_SUPPORT_CONTACT_EMAIL'),
};

if (fields.reviewEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.reviewEmail)) {
  failures.push('APP_STORE_REVIEW_ACCOUNT_EMAIL must be a valid email address');
}
if (fields.supportEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.supportEmail)) {
  failures.push('APP_STORE_SUPPORT_CONTACT_EMAIL must be a valid email address');
}

function renderReviewNotes() {
  return `Pull Hub is a trading-card pack experience for collectors. Customers use
Points purchased with Apple In-App Purchase to open packs with disclosed odds.
Each result is recorded in Vault. Points cannot be withdrawn for cash.

Release territories: ${fields.releaseCountries}

Review account
Email: ${fields.reviewEmail}
Password: entered only in App Store Connect Review Information
No payment method is attached to this account. The account has a server-side
review grant used only for App Review.

Review pack: ${fields.reviewPack}
Open flow: ${fields.openNavigation}
Odds before purchase: ${fields.oddsNavigation}
Fairness record after opening: ${fields.fairnessNavigation}
Vault and Trade in: ${fields.vaultNavigation}
Physical fulfillment: ${fields.shippingLimitations}
Account deletion: ${fields.accountDeletionNavigation}

Points product IDs: ${fields.productIds}
Chance-model classification: ${fields.chanceModelSummary}
Support contact: ${fields.supportEmail}
`;
}

const expected = renderReviewNotes();
const byteLength = Buffer.byteLength(expected, 'utf8');
if (byteLength > 4000) failures.push(`App Review notes exceed 4000 UTF-8 bytes (${byteLength})`);
if (/\[(?:[A-Z0-9_ -]+)\]|\b(?:todo|tbd|unresolved)\b/i.test(expected)) {
  failures.push('App Review notes contain placeholder or unresolved text');
}

if (failures.length) {
  console.error('App Review notes check failed:');
  for (const failure of new Set(failures)) console.error(`- ${failure}`);
  process.exit(1);
}

if (renderMode) {
  fs.writeFileSync(outputPath, expected, { mode: 0o600 });
  console.log(`Generated password-free App Review notes in ${outputPath} (${byteLength} bytes).`);
  process.exit(0);
}

if (!fs.existsSync(outputPath)) {
  console.error(
    `App Review notes check failed:\n- Missing ${outputPath}\n- Run: npm run render:app-store-review-notes`,
  );
  process.exit(1);
}

const actual = fs.readFileSync(outputPath, 'utf8');
if (actual !== expected) {
  console.error(
    `App Review notes check failed:\n- ${outputPath} is stale; regenerate it from ${sourcePath}`,
  );
  process.exit(1);
}

console.log(`App Review notes are complete, password-free, and within 4000 bytes (${byteLength}).`);
