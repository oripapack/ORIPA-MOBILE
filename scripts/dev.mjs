#!/usr/bin/env node
/**
 * One command dev: pack-ring Vite (background) + Expo (foreground, QR + w/i/a).
 */
import { spawn } from 'node:child_process';
import { execSync } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const clearCache = process.argv.includes('--clear') || process.argv.includes('-c');
const useTunnel = process.argv.includes('--tunnel');

function freePort(port) {
  try {
    const pids = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);
    for (const pid of pids) {
      try {
        execSync(`kill -9 ${pid}`);
        console.log(`[dev] Freed port ${port} (pid ${pid})`);
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* port free */
  }
}

function waitForHttp(port, timeoutMs = 60_000) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const probe = () => {
      const req = http.get(`http://127.0.0.1:${port}/`, (res) => {
        res.resume();
        resolve(undefined);
      });
      req.on('error', () => {
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Pack ring server did not start on :${port}`));
          return;
        }
        setTimeout(probe, 250);
      });
      req.setTimeout(2000, () => {
        req.destroy();
      });
    };
    probe();
  });
}

async function tunnelPackRing() {
  const ngrok = (await import('@expo/ngrok')).default;
  const url = await ngrok.connect({ addr: 3000, authtoken: process.env.NGROK_AUTHTOKEN });
  const base = String(url).replace(/\/$/, '');
  process.env.EXPO_PUBLIC_PACK_RING_WEB_URL = base;
  console.log(`[ring] Tunnel URL (phone WebView): ${base}`);
  return base;
}

async function main() {
  freePort(3000);
  freePort(8081);

  console.log('');
  console.log('  Pull Hub — one command');
  console.log('  ──────────────────────────────────────────────');
  console.log('  FULL APP (use this):   http://localhost:8081');
  console.log('    → press  w  in this terminal to open it');
  console.log('    → QR code → phone (Expo Go)');
  console.log('  Pack animation: only after you tap Open Pack in the app');
  console.log('  Port 3000: helper for phone WebView — NOT the app UI');
  if (useTunnel) console.log('  Tunnel: ngrok will expose pack ring for Expo Go');
  console.log('  ──────────────────────────────────────────────');
  console.log('');

  const vite = spawn(
    'npx',
    ['vite', '--config', 'pack-ring-server/vite.config.ts', '--clearScreen', 'false'],
    { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], shell: true, env: process.env },
  );

  vite.stdout?.on('data', (chunk) => {
    const line = chunk.toString().trim();
    if (line && !line.includes('CJS build of Vite')) console.log(`[ring] ${line}`);
  });
  vite.stderr?.on('data', (chunk) => {
    const line = chunk.toString().trim();
    if (line && !line.includes('CJS build of Vite')) console.error(`[ring] ${line}`);
  });

  try {
    await waitForHttp(3000);
    console.log('[ring] Ready at http://127.0.0.1:3000');
  } catch (err) {
    console.error('[ring]', err instanceof Error ? err.message : err);
    vite.kill('SIGTERM');
    process.exit(1);
  }

  if (useTunnel) {
    try {
      await tunnelPackRing();
    } catch (err) {
      console.error('[ring] ngrok tunnel failed — phone pack scene may not load:', err);
    }
  }

  const expoArgs = ['expo', 'start', ...(clearCache ? ['-c'] : []), ...(useTunnel ? ['--tunnel'] : [])];
  const expo = spawn('npx', expoArgs, {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

  let exiting = false;
  function shutdown(code = 0) {
    if (exiting) return;
    exiting = true;
    vite.kill('SIGTERM');
    expo.kill('SIGTERM');
    setTimeout(() => process.exit(code), 300);
  }

  process.on('SIGINT', () => shutdown(0));
  process.on('SIGTERM', () => shutdown(0));
  expo.on('exit', (code) => shutdown(code ?? 0));
  vite.on('exit', (code) => {
    if (code && code !== 0 && !exiting) {
      console.error('[ring] Vite exited unexpectedly');
      shutdown(code);
    }
  });
}

main().catch((err) => {
  console.error('[dev]', err);
  process.exit(1);
});
