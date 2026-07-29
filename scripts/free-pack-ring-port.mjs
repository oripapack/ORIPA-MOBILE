#!/usr/bin/env node
/**
 * Free TCP port 3000 before starting the pack-ring Next dev server.
 * A stale `next dev` from a prior session blocks the port and breaks `npm start`.
 */
import { execSync } from 'node:child_process';

const PORT = process.env.PACK_RING_PORT ?? '3000';

try {
  const pids = execSync(`lsof -ti tcp:${PORT}`, { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean);

  for (const pid of pids) {
    try {
      execSync(`kill -9 ${pid}`);
      console.log(`[start] Freed port ${PORT} (stopped pid ${pid})`);
    } catch {
      console.warn(`[start] Could not stop pid ${pid} on port ${PORT}`);
    }
  }
} catch {
  // Nothing listening — OK.
}
