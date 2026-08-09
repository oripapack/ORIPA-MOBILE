#!/usr/bin/env node

import fs from 'node:fs';

const failures = [];
const warnings = [];
const testFlightMode = process.argv.includes('--testflight');

const app = JSON.parse(fs.readFileSync('app.json', 'utf8')).expo;
const eas = JSON.parse(fs.readFileSync('eas.json', 'utf8'));
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

function validateAppIcon(assetPath) {
  if (!assetPath || !fs.existsSync(assetPath)) return;
  const png = fs.readFileSync(assetPath);
  const isPng = png.length >= 26 && png.subarray(1, 4).toString('ascii') === 'PNG';
  if (!isPng) {
    failures.push('App Store icon must be a PNG');
    return;
  }
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  const colorType = png[25];
  const hasAlphaChannel = colorType === 4 || colorType === 6;
  const hasTransparencyChunk = png.includes(Buffer.from('tRNS'));
  if (width !== 1024 || height !== 1024) {
    failures.push(`App Store icon must be 1024x1024; found ${width}x${height}`);
  }
  if (hasAlphaChannel || hasTransparencyChunk) {
    failures.push('App Store icon must not contain transparency');
  }
}

const bundleIdentifier = app.ios?.bundleIdentifier ?? '';
if (!bundleIdentifier || bundleIdentifier.includes('anonymous')) {
  failures.push('app.json must contain the final non-anonymous iOS bundle identifier');
}
if (!app.ios?.buildNumber) failures.push('app.json ios.buildNumber is required');
if (app.ios?.supportsTablet !== false) {
  failures.push('This release was QAed for iPhone only; ios.supportsTablet must remain false');
}
if (app.ios?.infoPlist?.ITSAppUsesNonExemptEncryption !== false) {
  failures.push('ITSAppUsesNonExemptEncryption must be explicitly set after export-compliance review');
}
if (!app.ios?.privacyManifests?.NSPrivacyAccessedAPITypes?.length) {
  failures.push('iOS privacy manifest declarations are missing');
}
if (!/^\d+\.\d+\.\d+$/.test(app.version ?? '')) {
  failures.push('app.json version must use semantic x.y.z format');
}
if (packageJson.version !== app.version) {
  failures.push('package.json and app.json versions must match');
}
if (!app.extra?.eas?.projectId) {
  failures.push('Expo project is not linked; run `npx eas-cli init` and commit the generated projectId');
}
if (eas.build?.production?.environment !== 'production') {
  failures.push('eas.json production profile must use the production EAS environment');
}
if (eas.cli?.version !== '>= 18.5.0') {
  failures.push('eas.json must require EAS CLI >= 18.5.0 for metadata credential handling');
}
if (eas.submit?.production?.ios?.metadataPath !== './store.config.js') {
  failures.push('eas.json production submit profile must use ./store.config.js');
}
if (!fs.existsSync('store.config.js')) {
  failures.push('Missing dynamic EAS Metadata configuration: store.config.js');
}
if (!eas.submit?.production?.ios?.ascAppId && testFlightMode) {
  failures.push('App Store Connect ascAppId is required before TestFlight upload');
} else if (!eas.submit?.production?.ios?.ascAppId) {
  warnings.push('App Store Connect ascAppId is not set yet; add it before EAS Submit');
}

for (const asset of [app.icon, app.splash?.image]) {
  if (!asset || !fs.existsSync(asset)) failures.push(`Missing required app asset: ${asset ?? '(unset)'}`);
}
validateAppIcon(app.icon);

const cameraPlugin = app.plugins?.find(
  (plugin) => Array.isArray(plugin) && plugin[0] === 'expo-camera',
);
if (!cameraPlugin || cameraPlugin[1]?.microphonePermission !== false) {
  failures.push('expo-camera must explicitly disable microphone permission for this release');
}
if (cameraPlugin?.[1]?.recordAudioAndroid !== false) {
  failures.push('expo-camera must explicitly disable Android audio recording for this release');
}

if (failures.length) {
  console.error('App Store readiness check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
}
if (warnings.length) {
  console.warn('App Store readiness warnings:');
  for (const warning of warnings) console.warn(`- ${warning}`);
}
if (failures.length) process.exit(1);

console.log(`App Store configuration is ready for ${bundleIdentifier} ${app.version} (${app.ios.buildNumber}).`);
