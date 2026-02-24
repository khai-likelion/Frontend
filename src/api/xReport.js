/**
 * src/api/xReport.js
 * X-Report domain API.
 *
 * Exports:
 *   createXReport(payload, { signal }?)        → { jobId: number }
 *   fetchXReportView(xReportId, { signal }?)
 *   normalizeXReportView(resp)
 */

import { apiPostLong, apiGet } from './client';

/**
 * POST /x-reports
 * Synchronously generates (or returns cached) X-Report and returns its ID.
 *
 * The backend runs the LLM generation inline and returns XReportOut directly.
 * There is no Celery job involved — use xReportId to fetch the view immediately.
 *
 * @param {{ store_source_id?: string, snapshot_version?: string, prompt_id?: string }} payload
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ xReportId: number }>}
 */
export async function createXReport(payload, { signal } = {}) {
  const resp = await apiPostLong('/x-reports', payload, { signal });

  const rawId = resp?.id;
  if (rawId == null) {
    const err = new Error('X-Report ID를 받지 못했습니다.');
    err.code = 'XREPORT_ID_MISSING';
    throw err;
  }

  return { xReportId: Number(rawId) };
}

/**
 * Fetch a completed X-Report's data.
 * 1st try: GET /x-reports/{id}/view
 * Fallback: GET /x-reports/{id}   (if /view returns 404)
 *
 * @param {number} xReportId
 * @param {{ signal?: AbortSignal }} [options]
 */
export async function fetchXReportView(xReportId, { signal } = {}) {
  try {
    return await apiGet(`/x-reports/${xReportId}/view`, { signal });
  } catch (err) {
    if (err.status === 404) {
      return apiGet(`/x-reports/${xReportId}`, { signal });
    }
    throw err;
  }
}

// Radar subject key → Korean label (backend may send English keys)
const RADAR_SUBJECT_MAP = {
  taste:      '맛',
  service:    '서비스',
  atmosphere: '분위기',
  price:      '가격',
  hygiene:    '위생',
};

/**
 * Normalise the raw X-Report view response into the shape expected by XReportView.
 *
 * Guarantees:
 *   - Every field the UI reads is present (array defaults to [], strings to '—')
 *   - snake_case aliases are accepted (radar_data, key_words, rank_percent, etc.)
 *   - Radar subject keys are mapped to Korean labels
 *
 * @param {any} resp  raw API response
 * @returns {NormalisedXReport}
 */
export function normalizeXReportView(resp) {
  if (!resp || typeof resp !== 'object') return null;

  const arr = (v) => (Array.isArray(v) ? v : []);
  const str = (v, fallback = '—') => (typeof v === 'string' ? v : fallback);
  const num = (v, fallback = 0) => (typeof v === 'number' ? v : fallback);

  // ── radarData ─────────────────────────────────────────────────────────
  const rawRadar = arr(resp.radarData ?? resp.radar_data);
  const radarData = rawRadar.map(item => ({
    subject: RADAR_SUBJECT_MAP[item.subject] ?? str(item.subject),
    A:       num(item.A ?? item.score),
    reason:  str(item.reason ?? item.detail, ''),
  }));

  // ── keywords ──────────────────────────────────────────────────────────
  const rawKeywords = arr(resp.keywords ?? resp.key_words);
  const keywords = rawKeywords.map(k => ({
    text:      str(k.text ?? k.word ?? k.keyword),
    sentiment: str(k.sentiment, 'neutral'),
  }));

  // ── solutions ─────────────────────────────────────────────────────────
  const rawSolutions = arr(resp.solutions ?? resp.strategies);
  const solutions = rawSolutions.map(s => ({
    id:        s.id ?? s.strategy_id ?? undefined,
    category:  str(s.category, '기타'),
    title:     str(s.title ?? s.name),
    desc:      str(s.desc ?? s.description, ''),
    execution: str(s.execution ?? s.how_to, ''),
    effect:    str(s.effect ?? s.expected_effect, ''),
  }));

  return {
    name:        str(resp.name ?? resp.store_name, ''),
    grade:       str(resp.grade, '—'),
    rankPercent: num(resp.rankPercent ?? resp.rank_percent),
    description: str(resp.description ?? resp.summary, ''),
    fullReport:  str(resp.fullReport ?? resp.full_report, ''),
    radarData,
    keywords,
    solutions,
  };
}
