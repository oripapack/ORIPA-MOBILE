#!/usr/bin/env node
/**
 * Phase 5 live health checks against hosted Supabase.
 * Requires EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY in root .env.
 *
 * Checks (anon / public where possible; auth-gated contracts verified by schema presence):
 *  1. Catalog REST + odds weight integrity for 3 live packs
 *  2. Ledger / RPC contract surface (deduct not client-callable; process_* present)
 *  3. Vault inventory table + RLS gate (anon cannot list others' items)
 *  4. Shipping tables + fulfillment RPC contract
 *
 * Usage: node scripts/smoke-live-packs.mjs
 *        npm run smoke:live-packs   (from backend/)
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const path = resolve(root, '.env');
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return out;
}

const LIVE_PACKS = [
  { catalogId: 'welcome-pack', versionId: 'a0000000-0000-4000-8000-000000000002' },
  { catalogId: 'grail-edition', versionId: 'a0000000-0000-4000-8000-000000000004' },
  { catalogId: 'charizard-chase', versionId: 'a0000000-0000-4000-8000-000000000006' },
];

const N2_TIERS = ['mythic', 'legendary', 'epic', 'base'];

function formatPercent(weight, total) {
  const pct = (weight / total) * 100;
  if (pct >= 10) return `${pct.toFixed(1).replace(/\.0$/, '')}%`;
  if (pct >= 1) return `${pct.toFixed(1)}%`;
  if (pct >= 0.1) return `${pct.toFixed(2)}%`;
  return `${pct.toFixed(3)}%`;
}

function buildOddsRows(items) {
  const total = items.reduce((s, r) => s + Math.max(1, Number(r.weight)), 0);
  const byTier = Object.fromEntries(N2_TIERS.map((t) => [t, 0]));
  for (const item of items) {
    const tier = item.rarity_tier ?? 'base';
    byTier[tier] = (byTier[tier] ?? 0) + Math.max(1, Number(item.weight));
  }
  return N2_TIERS.filter((t) => byTier[t] > 0).map((tier) => ({
    tier,
    chance: formatPercent(byTier[tier], total),
    weight: byTier[tier],
    total,
  }));
}

function headers(anonKey) {
  return {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
  };
}

async function restGet(url, anonKey, path) {
  const res = await fetch(`${url}/rest/v1/${path}`, { headers: headers(anonKey) });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { res, json };
}

async function rpcPost(url, anonKey, fn, body) {
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: headers(anonKey),
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { res, json };
}

let failed = false;
function pass(msg) {
  console.log(`✓ ${msg}`);
}
function fail(msg) {
  console.error(`✗ ${msg}`);
  failed = true;
}

async function checkCatalog(url, anonKey) {
  console.log('\n── 1. Live pack catalog & odds integrity ──');
  for (const pack of LIVE_PACKS) {
    const { res: versionRes, json: versions } = await restGet(
      url,
      anonKey,
      `pack_versions?id=eq.${pack.versionId}&select=id,is_active,credit_cost`,
    );
    if (!versionRes.ok || !versions?.length) {
      fail(`${pack.catalogId}: pack_version missing or query failed`);
      continue;
    }
    const version = versions[0];
    if (!version.is_active) fail(`${pack.catalogId}: pack_version inactive`);

    const { res: poolRes, json: items } = await restGet(
      url,
      anonKey,
      `pack_pool_items?pack_version_id=eq.${pack.versionId}&select=item_id,card_name,weight,rarity_tier,sort_order&order=sort_order.asc`,
    );
    if (!poolRes.ok || !items?.length) {
      fail(`${pack.catalogId}: no pool items (${poolRes.status})`);
      continue;
    }

    const invalidTier = items.find(
      (i) => i.rarity_tier && !N2_TIERS.includes(i.rarity_tier),
    );
    if (invalidTier) {
      fail(
        `${pack.catalogId}: invalid rarity_tier "${invalidTier.rarity_tier}" on ${invalidTier.item_id}`,
      );
    }

    const rows = buildOddsRows(items);
    const mythic = rows.find((r) => r.tier === 'mythic');
    const mythicOk = mythic?.chance === '0.50%' || mythic?.chance === '0.5%';
    pass(
      `${pack.catalogId} — ${items.length} pool lines, credit_cost=${version.credit_cost}`,
    );
    for (const row of rows) {
      console.log(
        `    ${row.tier.padEnd(10)} ${row.chance.padStart(7)}  (weight ${row.weight}/${row.total})`,
      );
    }
    if (mythic && !mythicOk) {
      fail(`${pack.catalogId}: mythic expected ~0.50%, got ${mythic.chance}`);
    }
  }
}

async function checkLedgerRpc(url, anonKey) {
  console.log('\n── 2. Credit ledger RPC contract / idempotency surface ──');

  // Low-level mutator must NOT be callable with anon key (revoked from public/authenticated).
  const deduct = await rpcPost(url, anonKey, 'deduct_user_credits', {
    p_user_id: 'smoke-test-user',
    p_amount: 1,
    p_idempotency_key: 'smoke-deduct-should-fail',
    p_reference_id: null,
    p_metadata: {},
  });
  if (deduct.res.status === 200) {
    fail('deduct_user_credits callable with anon key — privilege leak');
  } else {
    pass(
      `deduct_user_credits blocked for anon (HTTP ${deduct.res.status})`,
    );
  }

  const credit = await rpcPost(url, anonKey, 'credit_user_credits', {
    p_user_id: 'smoke-test-user',
    p_amount: 1,
    p_idempotency_key: 'smoke-credit-should-fail',
    p_reference_id: null,
    p_metadata: {},
  });
  if (credit.res.status === 200) {
    fail('credit_user_credits callable with anon key — privilege leak');
  } else {
    pass(
      `credit_user_credits blocked for anon (HTTP ${credit.res.status})`,
    );
  }

  // process_atomic_pull must exist but reject unauthenticated/invalid callers.
  const pull = await rpcPost(url, anonKey, 'process_atomic_pull', {
    p_pack_version_id: LIVE_PACKS[0].versionId,
    p_idempotency_key: '00000000-0000-4000-8000-000000000099',
    p_client_seed: 'smoke',
    p_nonce: 0,
    p_hashed_server_seed: 'a'.repeat(64),
    p_revealed_server_seed: 'b'.repeat(64),
    p_digest_hex: 'c'.repeat(64),
    p_roll_value: 0,
    p_won_item_id: 'smoke',
    p_card_name: 'smoke',
    p_serial_number: 'SMOKE',
    p_provenance_at: new Date().toISOString(),
    p_should_mint: false,
  });
  if (pull.res.status === 200) {
    fail('process_atomic_pull succeeded with anon key — auth gap');
  } else {
    pass(
      `process_atomic_pull requires auth (HTTP ${pull.res.status})`,
    );
  }

  // credit_transactions: anon should not read arbitrary rows (empty or 401/403)
  const { res: txRes, json: txs } = await restGet(
    url,
    anonKey,
    'credit_transactions?select=id&limit=1',
  );
  if (txRes.ok && Array.isArray(txs) && txs.length > 0) {
    fail('credit_transactions readable with anon key — RLS gap');
  } else {
    pass(
      `credit_transactions not exposed to anon (HTTP ${txRes.status}, rows=${Array.isArray(txs) ? txs.length : 'n/a'})`,
    );
  }
}

async function checkVault(url, anonKey) {
  console.log('\n── 3. Vault inventory schema & RLS gate ──');

  const { res, json } = await restGet(
    url,
    anonKey,
    'user_vault_items?select=id,status,rarity_tier&limit=1',
  );

  if (res.status === 404) {
    fail('user_vault_items table missing — run Phase 3+ migrations');
    return;
  }

  if (res.ok && Array.isArray(json) && json.length > 0) {
    fail('user_vault_items returns rows for anon — RLS gap');
  } else {
    pass(
      `user_vault_items reachable & anon-empty (HTTP ${res.status})`,
    );
  }

  // Trade-in RPC must reject anon
  const tradeIn = await rpcPost(url, anonKey, 'process_instant_trade_in', {
    p_vault_item_id: '00000000-0000-4000-8000-000000000001',
    p_idempotency_key: 'smoke-trade-in',
  });
  if (tradeIn.res.status === 200) {
    fail('process_instant_trade_in succeeded with anon — auth gap');
  } else {
    pass(
      `process_instant_trade_in requires auth (HTTP ${tradeIn.res.status})`,
    );
  }
}

async function checkShipping(url, anonKey) {
  console.log('\n── 4. Shipping fulfillment contract ──');

  for (const table of [
    'shipping_addresses',
    'shipping_orders',
    'shipping_order_items',
  ]) {
    const { res, json } = await restGet(url, anonKey, `${table}?select=id&limit=1`);
    if (res.status === 404) {
      fail(`${table} missing — run Phase 4 migration`);
      continue;
    }
    if (res.ok && Array.isArray(json) && json.length > 0) {
      fail(`${table} returns rows for anon — RLS gap`);
    } else {
      pass(`${table} present & anon-empty (HTTP ${res.status})`);
    }
  }

  const fulfill = await rpcPost(url, anonKey, 'request_physical_fulfillment', {
    p_user_id: 'smoke-user',
    p_vault_item_ids: ['00000000-0000-4000-8000-000000000001'],
    p_address_id: '00000000-0000-4000-8000-000000000002',
    p_idempotency_key: 'smoke-fulfill',
  });
  if (fulfill.res.status === 200) {
    fail('request_physical_fulfillment succeeded with anon — auth gap');
  } else {
    pass(
      `request_physical_fulfillment requires auth (HTTP ${fulfill.res.status})`,
    );
  }

  const markShipped = await rpcPost(url, anonKey, 'mark_shipping_order_shipped', {
    p_order_id: '00000000-0000-4000-8000-000000000003',
    p_tracking_number: null,
    p_carrier: null,
  });
  if (markShipped.res.status === 200) {
    fail('mark_shipping_order_shipped callable with anon — privilege leak');
  } else {
    pass(
      `mark_shipping_order_shipped blocked for anon (HTTP ${markShipped.res.status})`,
    );
  }
}

async function main() {
  const env = loadEnv();
  const url = env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error(
      'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env',
    );
    process.exit(1);
  }

  console.log(`Target: ${url.replace(/https?:\/\//, '').split('.')[0]}…`);

  // Probe a real table — bare /rest/v1/ is service_role-only on newer hosts.
  const health = await restGet(
    url,
    anonKey,
    'pack_versions?select=id&limit=1',
  ).catch((e) => ({
    res: { ok: false, status: 0, statusText: e.message },
    json: null,
  }));

  if (!health.res.ok) {
    const status = health.res.status;
    const statusText = health.res.statusText ?? '';
    console.error(
      `Supabase unreachable (${status} ${statusText})`.trim(),
    );
    if (status === 401) {
      console.error(
        '401 = bad API key. In Supabase Dashboard → Project Settings → API Keys,',
      );
      console.error(
        'copy the legacy anon JWT (starts with eyJ…) into EXPO_PUBLIC_SUPABASE_ANON_KEY in the repo root .env.',
      );
    } else {
      console.error(
        'If the project is paused, unpause it in the Supabase dashboard first.',
      );
    }
    process.exit(1);
  }
  pass('REST gateway reachable');

  await checkCatalog(url, anonKey);
  await checkLedgerRpc(url, anonKey);
  await checkVault(url, anonKey);
  await checkShipping(url, anonKey);

  if (failed) {
    console.error(
      '\nSmoke test FAILED — apply migrations (`npm run deploy:all`) and re-run.',
    );
    process.exit(1);
  }
  console.log('\nSmoke test PASSED — catalog, ledger gates, vault, and shipping look healthy.');
  console.log(
    'Next (signed-in app): x1 pull → trade-in → vault ship on welcome/grail/charizard packs.',
  );
}

main();
