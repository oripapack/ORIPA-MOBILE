#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const app = JSON.parse(fs.readFileSync('app.json', 'utf8')).expo;
const outputPath =
  process.env.APP_STORE_PROVENANCE_FILE || 'app-store/release/provenance.local.json';
const recordIndex = process.argv.indexOf('--record');

function fail(messages) {
  console.error('App Store build provenance check failed:');
  for (const message of messages) console.error(`- ${message}`);
  process.exit(1);
}

function git(...args) {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  if (result.status !== 0) {
    const detail = result.stderr.trim() || result.stdout.trim() || `git ${args.join(' ')} failed`;
    fail([detail]);
  }
  return result.stdout.trim();
}

function parseJsonOutput(output) {
  const start = output.indexOf('{');
  const end = output.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('EAS did not return a JSON build record');
  return JSON.parse(output.slice(start, end + 1));
}

function normalizeBuild(build) {
  return {
    schemaVersion: 1,
    easBuildId: String(build.id ?? '').trim(),
    projectId: String(build.project?.id ?? '').trim(),
    platform: String(build.platform ?? '').trim().toUpperCase(),
    status: String(build.status ?? '').trim().toUpperCase(),
    distribution: String(build.distribution ?? '').trim().toUpperCase(),
    buildProfile: String(build.buildProfile ?? build.metadata?.buildProfile ?? '').trim(),
    appVersion: String(build.appVersion ?? '').trim(),
    appBuildVersion: String(build.appBuildVersion ?? '').trim(),
    gitCommitHash: String(build.gitCommitHash ?? build.gitCommit?.hash ?? '').trim(),
    completedAt: String(build.completedAt ?? build.updatedAt ?? '').trim(),
    recordedAt: new Date().toISOString(),
  };
}

function validate(provenance) {
  const failures = [];
  const head = git('rev-parse', 'HEAD');
  const trackedChanges = git('status', '--porcelain', '--untracked-files=no');
  const projectId = String(app.extra?.eas?.projectId ?? '').trim();

  if (provenance.schemaVersion !== 1) failures.push('schemaVersion must be 1');
  if (!/^[0-9a-f-]{20,}$/i.test(provenance.easBuildId ?? '')) {
    failures.push('easBuildId is missing or malformed');
  }
  if (provenance.projectId !== projectId) {
    failures.push(`projectId must match app.json (${projectId})`);
  }
  if (provenance.platform !== 'IOS') failures.push('platform must be IOS');
  if (provenance.status !== 'FINISHED') failures.push('EAS build status must be FINISHED');
  if (provenance.distribution !== 'STORE') failures.push('EAS distribution must be STORE');
  if (provenance.buildProfile !== 'production') {
    failures.push('EAS build profile must be production');
  }
  if (provenance.appVersion !== app.version) {
    failures.push(`appVersion must match app.json (${app.version})`);
  }
  if (!/^\d+$/.test(provenance.appBuildVersion ?? '')) {
    failures.push('appBuildVersion must be a positive integer');
  }
  if (!/^[0-9a-f]{40}$/i.test(provenance.gitCommitHash ?? '')) {
    failures.push('gitCommitHash must be a full 40-character Git hash');
  } else if (provenance.gitCommitHash !== head) {
    failures.push(`EAS build commit ${provenance.gitCommitHash} does not match HEAD ${head}`);
  }
  if (!provenance.completedAt || Number.isNaN(Date.parse(provenance.completedAt))) {
    failures.push('completedAt must be a valid EAS completion timestamp');
  }
  if (!provenance.recordedAt || Number.isNaN(Date.parse(provenance.recordedAt))) {
    failures.push('recordedAt must be a valid timestamp');
  }
  if (trackedChanges) {
    failures.push('tracked files changed after the EAS build; build and HEAD are no longer identical');
  }

  return failures;
}

if (recordIndex >= 0) {
  const buildId = String(process.argv[recordIndex + 1] ?? '').trim();
  if (!buildId) fail(['Usage: npm run record:app-store-build -- <EAS_BUILD_ID>']);

  const result = spawnSync(
    'npx',
    ['--yes', 'eas-cli', 'build:view', buildId, '--json'],
    { encoding: 'utf8' },
  );
  if (result.status !== 0) {
    fail([result.stderr.trim() || result.stdout.trim() || 'Unable to read the EAS build']);
  }

  let build;
  try {
    build = parseJsonOutput(result.stdout);
  } catch (error) {
    fail([error instanceof Error ? error.message : String(error)]);
  }
  const provenance = normalizeBuild(build);
  const failures = validate(provenance);
  if (failures.length) fail(failures);

  fs.mkdirSync(new URL('../app-store/release/', import.meta.url), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(provenance, null, 2)}\n`, { mode: 0o600 });
  console.log(`Recorded verified EAS build provenance in ${outputPath}.`);
  process.exit(0);
}

if (!fs.existsSync(outputPath)) {
  fail([
    `Missing ${outputPath}`,
    'After the production build finishes, run: npm run record:app-store-build -- <EAS_BUILD_ID>',
  ]);
}

let provenance;
try {
  provenance = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
} catch {
  fail([`${outputPath} is not valid JSON`]);
}

const failures = validate(provenance);
if (failures.length) fail(failures);

console.log(
  `Verified EAS iOS build ${provenance.easBuildId}: ${provenance.appVersion} (${provenance.appBuildVersion}) at ${provenance.gitCommitHash}.`,
);
