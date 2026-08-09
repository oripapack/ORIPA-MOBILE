const fs = require('node:fs');

const app = require('./app.json').expo;

const metadataPath = process.env.APP_STORE_METADATA_FILE || 'app-store/metadata/en-US.json';
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
const submissionPath = process.env.APP_STORE_SUBMISSION_ENV_FILE || '.env.app-store.local';
const notesPath =
  process.env.APP_STORE_REVIEW_NOTES_FILE ||
  'app-store/review/generated-review-notes.local.txt';

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

function required(values, name) {
  const value = String(values[name] ?? '').trim();
  if (!value) throw new Error(`${name} is required for EAS Metadata`);
  return value;
}

module.exports = () => {
  if (metadata.status !== 'approved') {
    throw new Error('App Store metadata must be approved before EAS Metadata can read it');
  }
  if (metadata.category.status !== 'approved') {
    throw new Error('App Store category must be approved before EAS Metadata can read it');
  }
  if (!fs.existsSync(submissionPath)) {
    throw new Error(`Missing ${submissionPath}`);
  }
  if (!fs.existsSync(notesPath)) {
    throw new Error(`Missing ${notesPath}; generate App Review notes first`);
  }

  const values = { ...parseEnvFile(submissionPath), ...process.env };
  const notes = fs.readFileSync(notesPath, 'utf8');
  const reviewPassword = String(process.env.APP_STORE_REVIEW_PASSWORD ?? '');

  const review = {
    firstName: required(values, 'APP_STORE_REVIEW_CONTACT_FIRST_NAME'),
    lastName: required(values, 'APP_STORE_REVIEW_CONTACT_LAST_NAME'),
    email: required(values, 'APP_STORE_REVIEW_CONTACT_EMAIL'),
    phone: required(values, 'APP_STORE_REVIEW_CONTACT_PHONE'),
    notes,
  };

  if (reviewPassword) {
    review.demoUsername = required(values, 'APP_STORE_REVIEW_ACCOUNT_EMAIL');
    review.demoPassword = reviewPassword;
    review.demoRequired = true;
  }

  const localizedInfo = {
    title: metadata.name,
    subtitle: metadata.subtitle,
    description: metadata.description,
    keywords: metadata.keywords.split(',').map((keyword) => keyword.trim()),
    promoText: metadata.promotionalText,
    supportUrl: metadata.supportUrl,
    privacyPolicyUrl: metadata.privacyPolicyUrl,
  };
  if (metadata.marketingUrl) localizedInfo.marketingUrl = metadata.marketingUrl;

  return {
    configVersion: 0,
    apple: {
      version: app.version,
      copyright: metadata.copyright,
      categories: metadata.category.easCategories,
      info: { 'en-US': localizedInfo },
      release: {
        automaticRelease: false,
        phasedRelease: false,
      },
      review,
      // Intentionally omit `advisory`: the current EAS Metadata schema does not
      // cover Apple's Loot Boxes answer. Complete age rating in App Store Connect.
    },
  };
};
