#!/usr/bin/env node

import fs from 'node:fs';

const failures = [];
const warnings = [];

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

const submissionPath = process.env.APP_STORE_SUBMISSION_ENV_FILE || '.env.app-store.local';
const productionPath = process.env.APP_STORE_PRODUCTION_ENV_FILE || '.env.production';
const values = {
  ...parseEnvFile(productionPath),
  ...parseEnvFile(submissionPath),
  ...process.env,
};

function requireValue(name) {
  const value = (values[name] ?? '').trim();
  if (!value) {
    failures.push(`${name} is required`);
    return '';
  }
  if (/your |example\.com|live-pack-id|0000000000/i.test(value)) {
    failures.push(`${name} still contains an example or placeholder value`);
  }
  return value;
}

function requireYes(name) {
  const value = requireValue(name).toLowerCase();
  if (value && value !== 'yes') failures.push(`${name} must be yes after the check is completed`);
}

function requireHttps(name) {
  const value = requireValue(name);
  if (!value) return;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') failures.push(`${name} must use HTTPS`);
  } catch {
    failures.push(`${name} must be a valid public URL`);
  }
}

async function requirePublicPage(name, value, expectedText) {
  if (!value) return;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(value, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!response.ok) failures.push(`${name} returned HTTP ${response.status}`);
    if (!response.ok) return;
    const body = await response.text();
    if (body.trim().length < 300) {
      failures.push(`${name} appears empty or contains only a placeholder redirect`);
    }
    if (/window\.location\.href\s*=\s*["']\/lander|domain\s+(parking|for sale)/i.test(body)) {
      failures.push(`${name} resolves to a parked-domain or lander page`);
    }
    if (!expectedText.test(body)) {
      failures.push(`${name} does not contain the expected public policy/support content`);
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    failures.push(`${name} is not publicly reachable: ${reason}`);
  } finally {
    clearTimeout(timeout);
  }
}

if (!fs.existsSync(submissionPath)) {
  failures.push(`Missing ${submissionPath}; copy .env.app-store.example and complete it without passwords`);
}
if (!fs.existsSync(productionPath)) {
  failures.push(`Missing ${productionPath}; copy .env.production.example and use production services`);
}

const eas = JSON.parse(fs.readFileSync('eas.json', 'utf8'));
const configuredAscAppId = String(eas.submit?.production?.ios?.ascAppId ?? '').trim();
const declaredAscAppId = requireValue('APP_STORE_ASC_APP_ID');
if (!configuredAscAppId) failures.push('eas.json submit.production.ios.ascAppId is required before submission');
if (configuredAscAppId && declaredAscAppId && configuredAscAppId !== declaredAscAppId) {
  failures.push('APP_STORE_ASC_APP_ID must match eas.json submit.production.ios.ascAppId');
}

requireValue('APP_STORE_LEGAL_ENTITY_NAME');
requireHttps('APP_STORE_PRIVACY_URL');
requireHttps('APP_STORE_SUPPORT_URL');
const supportEmail = requireValue('APP_STORE_SUPPORT_CONTACT_EMAIL');
if (supportEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(supportEmail)) {
  failures.push('APP_STORE_SUPPORT_CONTACT_EMAIL must be a monitored email address');
}
requireValue('APP_STORE_RELEASE_COUNTRIES');
const reviewEmail = requireValue('APP_STORE_REVIEW_ACCOUNT_EMAIL');
if (reviewEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(reviewEmail)) {
  failures.push('APP_STORE_REVIEW_ACCOUNT_EMAIL must be a valid email address');
}
requireValue('APP_STORE_REVIEW_PACK_ID');
requireValue('APP_STORE_POINTS_PRODUCT_IDS');
requireValue('APP_STORE_ODDS_NAVIGATION');
requireValue('APP_STORE_FAIRNESS_NAVIGATION');

for (const approval of [
  'APP_STORE_REVIEW_ACCOUNT_READY',
  'APP_STORE_LEGAL_COPY_APPROVED',
  'APP_STORE_CHANCE_MODEL_LEGAL_APPROVED',
  'APP_STORE_PRIVACY_VENDOR_AUDIT_APPROVED',
  'APP_STORE_ACCOUNT_DELETION_DEPLOYED',
  'APP_STORE_SIWA_REVOCATION_VERIFIED',
  'APP_STORE_IAP_VERIFIED',
  'APP_STORE_FAIRNESS_INVENTORY_VERIFIED',
  'APP_STORE_CORE_FLOW_SMOKE_PASSED',
  'APP_STORE_TESTFLIGHT_QA_PASSED',
]) {
  requireYes(approval);
}

if ((values.APP_STORE_AGE_RATING_LOOT_BOXES ?? '').toLowerCase() !== 'yes') {
  failures.push('APP_STORE_AGE_RATING_LOOT_BOXES must be yes for purchasable randomized packs');
}
for (const rating of [
  'APP_STORE_AGE_RATING_GAMBLING',
  'APP_STORE_AGE_RATING_SIMULATED_GAMBLING',
]) {
  const value = requireValue(rating).toLowerCase();
  if (value === 'unresolved') failures.push(`${rating} requires a documented legal/product answer`);
}

for (const [publicName, submissionName] of [
  ['EXPO_PUBLIC_LEGAL_ENTITY_NAME', 'APP_STORE_LEGAL_ENTITY_NAME'],
  ['EXPO_PUBLIC_PRIVACY_POLICY_URL', 'APP_STORE_PRIVACY_URL'],
  ['EXPO_PUBLIC_SUPPORT_URL', 'APP_STORE_SUPPORT_URL'],
]) {
  const publicValue = requireValue(publicName);
  const submissionValue = requireValue(submissionName);
  if (publicValue && submissionValue && publicValue !== submissionValue) {
    failures.push(`${publicName} must match ${submissionName}`);
  }
}

const legalCopy = fs.readFileSync('src/legal/inAppLegalCopy.ts', 'utf8');
for (const marker of [
  'MVP / preview builds',
  'Have qualified counsel review before App Store submission',
  'certain features may be simulated',
  'when real-money purchases are available',
  'If Points are labeled as simulated or preview',
]) {
  if (legalCopy.includes(marker)) {
    failures.push(`Legal copy still contains pre-release language: ${marker}`);
  }
}

await Promise.all([
  requirePublicPage(
    'APP_STORE_PRIVACY_URL',
    (values.APP_STORE_PRIVACY_URL ?? '').trim(),
    /privacy|personal data|information we collect/i,
  ),
  requirePublicPage(
    'APP_STORE_SUPPORT_URL',
    (values.APP_STORE_SUPPORT_URL ?? '').trim(),
    /support|contact|help center/i,
  ),
]);

if (failures.length) {
  console.error('App Store submission gate failed:');
  for (const failure of new Set(failures)) console.error(`- ${failure}`);
}
if (warnings.length) {
  console.warn('App Store submission warnings:');
  for (const warning of warnings) console.warn(`- ${warning}`);
}
if (failures.length) process.exit(1);

console.log('App Store submission declarations, production configuration, and human approvals are complete.');
