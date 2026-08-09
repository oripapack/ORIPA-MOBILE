#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const submissionMode = process.argv.includes('--submission');
const metadataPath = process.env.APP_STORE_METADATA_FILE || 'app-store/metadata/en-US.json';
const screenshotDirectory =
  process.env.APP_STORE_SCREENSHOT_DIR || 'app-store/screenshots/en-US/6.9-inch';
const failures = [];
const warnings = [];

function codePointLength(value) {
  return Array.from(value).length;
}

function requireString(metadata, key, maxLength) {
  const value = metadata[key];
  if (typeof value !== 'string' || !value.trim()) {
    failures.push(`${key} is required`);
    return '';
  }
  const length = codePointLength(value);
  if (length > maxLength) failures.push(`${key} exceeds ${maxLength} characters (${length})`);
  return value.trim();
}

function requireHttps(metadata, key) {
  const value = metadata[key];
  if (!value) {
    if (submissionMode) failures.push(`${key} is required for submission`);
    else warnings.push(`${key} is still empty`);
    return;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') failures.push(`${key} must use HTTPS`);
  } catch {
    failures.push(`${key} must be a valid public URL`);
  }
}

function inspectPng(filePath) {
  const png = fs.readFileSync(filePath);
  const isPng = png.length >= 26 && png.subarray(1, 4).toString('ascii') === 'PNG';
  if (!isPng) return { valid: false };
  return {
    valid: true,
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
    hasTransparency: [4, 6].includes(png[25]) || png.includes(Buffer.from('tRNS')),
  };
}

if (!fs.existsSync(metadataPath)) {
  console.error(`App Store metadata check failed:\n- Missing ${metadataPath}`);
  process.exit(1);
}

let metadata;
try {
  metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
} catch (error) {
  console.error(`App Store metadata check failed:\n- ${metadataPath} is not valid JSON`);
  process.exit(1);
}

const app = JSON.parse(fs.readFileSync('app.json', 'utf8')).expo;

if (metadata.schemaVersion !== 1) failures.push('schemaVersion must be 1');
if (metadata.locale !== 'en-US') failures.push('locale must be en-US for this metadata file');

const appStoreName = requireString(metadata, 'name', 30);
if (appStoreName && appStoreName !== app.name) {
  failures.push(`metadata name must match app.json expo.name (${app.name})`);
}
requireString(metadata, 'subtitle', 30);
requireString(metadata, 'promotionalText', 170);
requireString(metadata, 'description', 4000);
const keywords = requireString(metadata, 'keywords', 100);
const keywordBytes = Buffer.byteLength(keywords, 'utf8');
if (keywordBytes > 100) failures.push(`keywords exceeds 100 UTF-8 bytes (${keywordBytes})`);

const normalizedKeywords = keywords
  .split(',')
  .map((keyword) => keyword.trim().toLowerCase())
  .filter(Boolean);
if (new Set(normalizedKeywords).size !== normalizedKeywords.length) {
  failures.push('keywords contains duplicate entries');
}
if (normalizedKeywords.some((keyword) => keyword === metadata.name?.trim().toLowerCase())) {
  failures.push('keywords must not repeat the app name');
}

for (const key of ['name', 'subtitle', 'promotionalText', 'keywords', 'description']) {
  const value = metadata[key];
  if (typeof value === 'string' && /\b(todo|tbd)|example\.com|\[[A-Z0-9_ -]+\]/i.test(value)) {
    failures.push(`${key} contains placeholder text`);
  }
}

for (const key of ['privacyPolicyUrl', 'supportUrl']) requireHttps(metadata, key);
if (metadata.marketingUrl) requireHttps(metadata, 'marketingUrl');

if (!metadata.copyright?.trim()) {
  if (submissionMode) failures.push('copyright is required for submission');
  else warnings.push('copyright is still empty pending the exact legal entity');
}

if (submissionMode && metadata.status !== 'approved') {
  failures.push('metadata status must be approved before submission');
} else if (!submissionMode && metadata.status !== 'approved') {
  warnings.push(`metadata status is ${metadata.status ?? '(missing)'}`);
}

if (!metadata.category || typeof metadata.category !== 'object') {
  failures.push('category decision is required');
} else {
  for (const key of ['primary', 'primarySubcategory', 'secondary', 'rationale']) {
    if (!metadata.category[key]?.trim()) failures.push(`category.${key} is required`);
  }
  if (
    !Array.isArray(metadata.category.easCategories) ||
    metadata.category.easCategories.length !== 2 ||
    !Array.isArray(metadata.category.easCategories[0]) ||
    metadata.category.easCategories[0][0] !== 'GAMES' ||
    metadata.category.easCategories[0][1] !== 'GAMES_CARD' ||
    metadata.category.easCategories[1] !== 'SHOPPING'
  ) {
    failures.push('category.easCategories must map the provisional Games/Card + Shopping decision');
  }
  if (submissionMode && metadata.category.status !== 'approved') {
    failures.push('category.status must be approved before submission');
  } else if (!submissionMode && metadata.category.status !== 'approved') {
    warnings.push(`category status is ${metadata.category.status ?? '(missing)'}`);
  }
}

const screenshotFiles = fs.existsSync(screenshotDirectory)
  ? fs
      .readdirSync(screenshotDirectory)
      .filter((file) => file.toLowerCase().endsWith('.png'))
      .sort()
  : [];

if (submissionMode && (screenshotFiles.length < 1 || screenshotFiles.length > 10)) {
  failures.push(`6.9-inch screenshots must contain 1-10 PNG files; found ${screenshotFiles.length}`);
} else if (!submissionMode && screenshotFiles.length === 0) {
  warnings.push('6.9-inch App Store screenshots have not been captured yet');
}

const allowedPortraitSizes = new Set(['1260x2736', '1290x2796', '1320x2868']);
for (const file of screenshotFiles) {
  const filePath = path.join(screenshotDirectory, file);
  const image = inspectPng(filePath);
  if (!image.valid) {
    failures.push(`${file} is not a valid PNG`);
    continue;
  }
  const size = `${image.width}x${image.height}`;
  if (!allowedPortraitSizes.has(size)) {
    failures.push(`${file} must use an accepted 6.9-inch portrait size; found ${size}`);
  }
  if (image.hasTransparency) failures.push(`${file} must not contain transparency`);
}

if (failures.length) {
  console.error('App Store metadata check failed:');
  for (const failure of new Set(failures)) console.error(`- ${failure}`);
}
if (warnings.length) {
  console.warn('App Store metadata warnings:');
  for (const warning of new Set(warnings)) console.warn(`- ${warning}`);
}
if (failures.length) process.exit(1);

console.log(
  `App Store metadata fields are within limits (${submissionMode ? 'submission' : 'draft'} mode).`,
);
