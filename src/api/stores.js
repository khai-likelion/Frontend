/**
 * src/api/stores.js
 * Store-domain API functions and response normalisation.
 *
 * Exports:
 *   fetchStores({ q, limit, offset, signal })
 *   normalizeStoresResponse(resp)
 */

import { apiGet } from './client';

/**
 * GET /stores
 *
 * @param {{ q?: string, limit?: number, offset?: number, signal?: AbortSignal }} options
 * @returns {Promise<{ items: object[], total: number, limit: number, offset: number }>}
 */
export async function fetchStores({ q, limit = 50, offset = 0, signal } = {}) {
  return apiGet('/stores', {
    params: { q, limit, offset },
    signal,
  });
}

/**
 * Normalise a single raw store item into a UI-safe shape.
 *
 * Alias priority (first defined value wins):
 *   name        — item.name        → item.store_name    → '이름 정보 없음'
 *   address     — item.address     → item.store_address → ''
 *   lat         — item.lat         → item.latitude
 *   lng         — item.lng         → item.longitude     → item.lon
 *   rankPercent — item.rankPercent → item.rank_percent
 *
 * @param {any} item  raw store object from API
 * @returns {NormalisedStore|null}  null if item is not an object
 */
function normalizeStore(item) {
  if (!item || typeof item !== 'object') return null;

  // ── Field aliases ─────────────────────────────────────────────────────────
  const rawName    = item.name        ?? item.store_name;
  const rawAddress = item.address     ?? item.store_address;
  const rawLat     = item.lat         ?? item.latitude;
  const rawLng     = item.lng         ?? item.longitude ?? item.lon;
  const rankPercent = item.rankPercent ?? item.rank_percent;

  // ── Geo validation ────────────────────────────────────────────────────────
  // Convert to number; undefined / null / non-numeric → NaN → geoValid=false.
  const latNum  = rawLat != null ? Number(rawLat) : NaN;
  const lngNum  = rawLng != null ? Number(rawLng) : NaN;
  const geoValid = !Number.isNaN(latNum) && !Number.isNaN(lngNum);

  return {
    id:          item.id   != null ? String(item.id)   : '',
    name:        rawName   != null ? String(rawName)   : '이름 정보 없음',
    address:     rawAddress != null ? String(rawAddress) : '',
    lat:         geoValid ? latNum : null,
    lng:         geoValid ? lngNum : null,
    geoValid,
    sentiment:   typeof item.sentiment === 'number' ? item.sentiment  : null,
    revenue:     typeof item.revenue   === 'number' ? item.revenue    : null,
    grade:       item.grade   != null ? String(item.grade)   : null,
    rankPercent: rankPercent  != null ? Number(rankPercent)  : null,
  };
}

/**
 * Normalise the raw /stores response into a clean, UI-safe shape.
 *
 * Data-quality rules applied:
 *   1. items must be an array (fallback to [])
 *   2. Each item is passed through normalizeStore() — see alias rules above
 *   3. Invalid items (non-object) are filtered out
 *
 * @param {any} resp  raw server response
 * @returns {{ items: NormalisedStore[], total: number, limit: number, offset: number }}
 *
 * @typedef {{
 *   id: string,
 *   name: string,
 *   address: string,
 *   lat: number|null,
 *   lng: number|null,
 *   geoValid: boolean,
 *   sentiment: number|null,
 *   revenue: number|null,
 *   grade: string|null,
 *   rankPercent: number|null,
 * }} NormalisedStore
 */
export function normalizeStoresResponse(resp) {
  if (!resp || typeof resp !== 'object') {
    return { items: [], total: 0, limit: 50, offset: 0 };
  }

  const rawItems = Array.isArray(resp.items) ? resp.items : [];
  const items    = rawItems.map(normalizeStore).filter(Boolean);

  return {
    items,
    total:  typeof resp.total  === 'number' ? resp.total  : items.length,
    limit:  typeof resp.limit  === 'number' ? resp.limit  : 50,
    offset: typeof resp.offset === 'number' ? resp.offset : 0,
  };
}
