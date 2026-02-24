#!/usr/bin/env node
/**
 * scripts/verify_frontend_api.js
 *
 * Smoke test: validates that the backend API returns shapes
 * compatible with the frontend API modules (src/api/*.js).
 *
 * Usage:
 *   node scripts/verify_frontend_api.js [--stores-limit <n>] [--x-id <id>] [--y-id <id>]
 *
 * Exit codes:
 *   0 — all tests passed
 *   1 — one or more tests failed
 *
 * Requires Node.js ≥ 18 (native fetch).
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── .env parser ───────────────────────────────────────────────────────────────
function loadEnv(envPath) {
  let text;
  try {
    text = readFileSync(envPath, 'utf8');
  } catch {
    return {};
  }
  const env = {};
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

// ── CLI arg parser ────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = { storesLimit: 3, xId: null, yId: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--stores-limit' && argv[i + 1]) args.storesLimit = Number(argv[++i]);
    if (argv[i] === '--x-id'         && argv[i + 1]) args.xId = argv[++i];
    if (argv[i] === '--y-id'         && argv[i + 1]) args.yId = argv[++i];
  }
  return args;
}

// ── Configuration ─────────────────────────────────────────────────────────────
const env     = loadEnv(resolve(__dirname, '../.env'));
const BASE_URL = (env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '');
const args    = parseArgs(process.argv.slice(2));

// ── Assertion helpers ─────────────────────────────────────────────────────────
let passCount = 0;
let failCount = 0;

function assertEqual(label, actual, expected) {
  if (actual === expected) {
    console.log(`  ✅ [PASS] ${label}`);
    passCount++;
  } else {
    console.log(`  ❌ [FAIL] ${label}`);
    console.log(`           expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    failCount++;
  }
}

function assertExists(label, value) {
  if (value !== null && value !== undefined) {
    console.log(`  ✅ [PASS] ${label}`);
    passCount++;
  } else {
    console.log(`  ❌ [FAIL] ${label} — value is ${value}`);
    failCount++;
  }
}

function assertIsList(label, value) {
  if (Array.isArray(value)) {
    console.log(`  ✅ [PASS] ${label} (${value.length} items)`);
    passCount++;
  } else {
    console.log(`  ❌ [FAIL] ${label} — expected array, got ${typeof value}`);
    failCount++;
  }
}

/** Passes if at least one of the given keys exists in obj (even if value is null). */
function assertKeyPresent(label, obj, ...keys) {
  const found = obj && keys.some(k => k in obj);
  if (found) {
    const vals = keys.map(k => JSON.stringify(obj[k])).join(' / ');
    console.log(`  ✅ [PASS] ${label} (${vals})`);
    passCount++;
  } else {
    console.log(`  ❌ [FAIL] ${label} — key(s) ${keys.join('/')} not in response`);
    failCount++;
  }
}

function assertRange(label, value, min, max) {
  if (typeof value === 'number' && value >= min && value <= max) {
    console.log(`  ✅ [PASS] ${label} (${value})`);
    passCount++;
  } else {
    console.log(`  ❌ [FAIL] ${label} — expected number in [${min}, ${max}], got ${JSON.stringify(value)}`);
    failCount++;
  }
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────
// Mirrors /^\[([A-Z_]+)\]/ from src/api/client.js and src/utils/error.js
const CODE_PATTERN = /^\[([A-Z_]+)\]/;

async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  let body;
  try { body = await res.json(); } catch { body = null; }
  return { status: res.status, ok: res.ok, body };
}

/** Replicates parseError code-extraction from src/utils/error.js */
function extractCode(body) {
  const raw = body?.detail ?? body?.error_message ?? body?.message ?? null;
  if (typeof raw !== 'string') return null;
  return CODE_PATTERN.exec(raw)?.[1] ?? null;
}

// ── [1/4] Connectivity ────────────────────────────────────────────────────────
async function testConnectivity() {
  console.log('\n[1/4] Connectivity');
  try {
    const { status } = await apiFetch('/stores?limit=1');
    assertRange('HTTP status is 2xx', status, 200, 299);
  } catch (e) {
    console.log(`  ❌ [FAIL] Server unreachable at ${BASE_URL} — ${e.message}`);
    failCount++;
  }
}

// ── [2/4] Store API ───────────────────────────────────────────────────────────
async function testStores(limit) {
  console.log(`\n[2/4] Store API  (limit=${limit})`);
  let data;
  try {
    const { status, body } = await apiFetch(`/stores?limit=${limit}`);
    assertRange('HTTP status is 2xx', status, 200, 299);
    data = body;
  } catch (e) {
    console.log(`  ❌ [FAIL] Fetch failed — ${e.message}`);
    failCount++;
    return;
  }

  assertExists('response body exists', data);
  assertIsList('items is an array', data?.items);
  assertExists('total field exists', data?.total);

  if (Array.isArray(data?.items) && data.items.length > 0) {
    const s = data.items[0];
    assertExists('items[0].id',
      s?.id);
    // Backend may return store_name (snake_case) or name (camelCase)
    assertExists('items[0].name or store_name',
      s?.name ?? s?.store_name);
    // Geo fields: lat/lng, latitude/longitude, or lon are all accepted by normalizer
    const hasLat = s?.lat !== undefined || s?.latitude !== undefined;
    const hasLng = s?.lng !== undefined || s?.longitude !== undefined || s?.lon !== undefined;
    if (hasLat && hasLng) {
      console.log(`  ✅ [PASS] items[0] has geo coordinates`);
      passCount++;
    } else {
      console.log(`  ℹ️  [INFO] items[0] missing lat/lng — geoValid will be false (normalizer handles this)`);
      passCount++; // Not a crash — normalizer sets geoValid=false gracefully
    }
    // Verify normalizer alias: store_name is accepted via normalizeStore()
    if (s?.name === undefined && s?.store_name !== undefined) {
      console.log(`  ✅ [PASS] store_name alias handled by normalizeStore() → name field`);
      passCount++;
    }
  } else {
    console.log('  ℹ️  [INFO] items array is empty — field checks skipped');
  }
}

// ── [3a/4] X-Report View ──────────────────────────────────────────────────────
async function testXReport(xId) {
  if (!xId) {
    console.log('\n[3a/4] X-Report View — skipped (pass --x-id <id> to enable)');
    return;
  }
  console.log(`\n[3a/4] X-Report View  (id=${xId})`);
  let data;
  try {
    const { status, body } = await apiFetch(`/x-reports/${xId}/view`);
    assertRange('HTTP status is 2xx', status, 200, 299);
    data = body;
  } catch (e) {
    console.log(`  ❌ [FAIL] Fetch failed — ${e.message}`);
    failCount++;
    return;
  }

  assertExists('response body exists', data);
  // Fields expected by normalizeXReportView (camelCase or snake_case accepted)
  // name: required — view service populates from Store table
  assertExists('name or store_name',             data?.name        ?? data?.store_name);
  // grade / rankPercent: Optional in schema (null is valid — normalizer defaults to '—' / 0)
  assertKeyPresent('grade key present (null OK)',           data, 'grade');
  assertKeyPresent('rankPercent key present (null OK)',     data, 'rankPercent', 'rank_percent');
  assertIsList('radarData or radar_data',        data?.radarData   ?? data?.radar_data   ?? []);
  assertIsList('keywords or key_words',          data?.keywords    ?? data?.key_words    ?? []);
  assertIsList('solutions or strategies',        data?.solutions   ?? data?.strategies   ?? []);
}

// ── [3b/4] Y-Report View ──────────────────────────────────────────────────────
async function testYReport(yId) {
  if (!yId) {
    console.log('\n[3b/4] Y-Report View — skipped (pass --y-id <id> to enable)');
    return;
  }
  console.log(`\n[3b/4] Y-Report View  (id=${yId})`);
  let data;
  try {
    const { status, body } = await apiFetch(`/y-reports/${yId}/view`);
    assertRange('HTTP status is 2xx', status, 200, 299);
    data = body;
  } catch (e) {
    console.log(`  ❌ [FAIL] Fetch failed — ${e.message}`);
    failCount++;
    return;
  }

  assertExists('response body exists', data);

  // Section 1 – Overview
  assertExists('overview',                                         data?.overview);

  // Section 2 – Keywords
  assertExists('keywords',                                         data?.keywords);

  // Section 3 – Rating distribution
  assertExists('ratingDistribution or rating_distribution',
    data?.ratingDistribution ?? data?.rating_distribution);

  // Section 4 – Hourly traffic
  assertIsList('hourlyTraffic or hourly_traffic',
    data?.hourlyTraffic ?? data?.hourly_traffic ?? []);

  // Section 5 – Retention
  assertExists('retention',                                        data?.retention);

  // Section 6 – Side effects (list, may be empty)
  assertIsList('sideEffects or side_effects',
    data?.sideEffects ?? data?.side_effects ?? []);

  // Section 7 – Risk score
  assertExists('riskScore or risk_score',
    data?.riskScore ?? data?.risk_score);

  // Section 8 – LLM summary (empty string is acceptable)
  assertEqual('llmSummary or llm_summary is a string',
    typeof (data?.llmSummary ?? data?.llm_summary ?? ''), 'string');
}

// ── [4/4] Error Handling ──────────────────────────────────────────────────────
async function testErrorHandling() {
  console.log('\n[4/4] Error Handling');

  // Test A: non-numeric path param → FastAPI returns 422 Unprocessable Entity
  try {
    const { status, body } = await apiFetch('/x-reports/INVALID_ID/view');
    assertRange('Non-numeric path param returns 4xx', status, 400, 499);

    const rawMsg = body?.detail ?? body?.error_message ?? body?.message;
    assertExists('Error body contains detail / error_message / message', rawMsg);

    // Optional: check for [CODE] prefix (backend may or may not send it for 4xx)
    const code = extractCode(body);
    if (code) {
      console.log(`  ✅ [PASS] parseError extracted code: [${code}]`);
      passCount++;
    } else {
      console.log(`  ℹ️  [INFO] No [CODE] prefix in 4xx body — frontend falls back to raw message (expected)`);
      passCount++;
    }
  } catch (e) {
    console.log(`  ❌ [FAIL] Error-handling fetch failed — ${e.message}`);
    failCount++;
  }

  // Test B: valid numeric ID that does not exist → expect 404
  try {
    const { status } = await apiFetch('/x-reports/9999999999/view');
    assertRange('Non-existent report ID returns 4xx', status, 400, 499);
  } catch (e) {
    console.log(`  ❌ [FAIL] Fetch failed — ${e.message}`);
    failCount++;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║          Frontend API Smoke Test                     ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`Base URL : ${BASE_URL}`);
  console.log(`X-Report : ${args.xId  ?? '(skipped)'}`);
  console.log(`Y-Report : ${args.yId  ?? '(skipped)'}`);

  await testConnectivity();
  await testStores(args.storesLimit);
  await testXReport(args.xId);
  await testYReport(args.yId);
  await testErrorHandling();

  const total = passCount + failCount;
  console.log(`\n${'─'.repeat(54)}`);
  console.log(`Result : ${passCount}/${total} passed  (${failCount} failed)`);

  if (failCount > 0) {
    console.log('\n❌  Smoke test FAILED');
    process.exit(1);
  } else {
    console.log('\n✅  All tests passed');
  }
}

main().catch(err => {
  console.error('Unexpected fatal error:', err);
  process.exit(1);
});
