/**
 * src/api/yReport.js
 * Y-Report domain API.
 *
 * Exports:
 *   createYReport(payload, { signal }?)        → { jobId: number }
 *   fetchYReportView(yReportId, { signal }?)
 *   normalizeYReportView(resp)
 */

import { apiPost, apiGet } from './client';

/**
 * POST /y-reports
 * Creates a Y-Report job and returns the job ID.
 *
 * Key defence: backend may return jobId or job_id.
 *
 * @param {{ storeId?: string, selectedStrategyIds?: string[] }} payload
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ jobId: number }>}
 */
export async function createYReport(payload, { signal } = {}) {
  const resp = await apiPost('/y-reports', payload, { signal });

  const rawJobId = resp?.jobId ?? resp?.job_id;
  if (rawJobId == null) {
    const err = new Error('jobId를 받지 못했습니다.');
    err.code = 'JOB_ID_MISSING';
    throw err;
  }

  return { jobId: Number(rawJobId) };
}

/**
 * Fetch a completed Y-Report's data.
 * 1st try: GET /y-reports/{id}/view
 * Fallback: GET /y-reports/{id}   (if /view returns 404)
 *
 * @param {number} yReportId
 * @param {{ signal?: AbortSignal }} [options]
 */
export async function fetchYReportView(yReportId, { signal } = {}) {
  try {
    return await apiGet(`/y-reports/${yReportId}/view`, { signal });
  } catch (err) {
    if (err.status === 404) {
      return apiGet(`/y-reports/${yReportId}`, { signal });
    }
    throw err;
  }
}

// ── Safe-defaults object (returned on invalid/empty response) ──────────────
function safeDefaults() {
  return {
    overview: {
      sim1: { totalVisits: 0, marketShare: 0 },
      sim2: { totalVisits: 0, marketShare: 0 },
    },
    keywords:          { sim1: [], sim2: [] },
    ratingDistribution: {},
    ratingSummary: {
      sim1: { avg: 0, satisfaction: 0 },
      sim2: { avg: 0, satisfaction: 0 },
    },
    hourlyTraffic: [],
    peakSlot:      { sim1: '—', sim2: '—' },
    generation:    [],
    purpose:       [],
    retention: {
      sim1Agents: 0, sim2Agents: 0,
      retained: 0, newUsers: 0, churned: 0,
      retentionRate: 0, newRatio: 0,
    },
    agentType:    [],
    gender:       [],
    radar:        [],
    radarStores:  { comp1: '경쟁사 1', comp2: '경쟁사 2', comp3: '경쟁사 3' },
    crosstab:     { generations: [], purposes: [], sim2: [] },
    sideEffects:  [],
    tradeoffs:    [],
    riskScore: {
      score: 0, level: '', positive: 0, watch: 0, negative: 0, totalMetrics: 0,
    },
    llmSummary: '',
  };
}

/**
 * Normalise the raw Y-Report view response into the shape expected by YReportView.
 *
 * Guarantees:
 *   - Never returns null — invalid input yields safeDefaults()
 *   - Every array field defaults to []
 *   - sim1/sim2 aliases: also accepts before/after, simA/simB, baseCase/variantCase
 *   - snake_case aliases accepted where noted
 *   - console.debug once on bad input (no throw)
 *
 * @param {any} resp  raw API response
 * @returns {NormalisedYReport}
 */
export function normalizeYReportView(resp) {
  if (!resp || typeof resp !== 'object') {
    console.debug('[yReport] normalizeYReportView: empty/invalid response, using safe defaults', resp);
    return safeDefaults();
  }

  const arr = (v) => (Array.isArray(v) ? v : []);
  const num = (v, fallback = 0) => (typeof v === 'number' && isFinite(v) ? v : fallback);
  const str = (v, fallback = '—') => (typeof v === 'string' ? v : fallback);

  // ── sim1/sim2 key resolution ─────────────────────────────────────────────
  // Priority: sim1 > before > simA > baseCase
  //           sim2 > after  > simB > variantCase
  const ov = resp.overview ?? {};
  const kw = resp.keywords ?? {};

  return {
    // ── 지표 1: Overview ──────────────────────────────────────────────────
    overview: {
      sim1: {
        totalVisits: num(
          ov.sim1?.totalVisits ?? ov.before?.totalVisits ??
          ov.simA?.totalVisits ?? ov.baseCase?.totalVisits,
        ),
        marketShare: num(
          ov.sim1?.marketShare ?? ov.before?.marketShare ??
          ov.simA?.marketShare ?? ov.baseCase?.marketShare,
        ),
      },
      sim2: {
        totalVisits: num(
          ov.sim2?.totalVisits ?? ov.after?.totalVisits ??
          ov.simB?.totalVisits ?? ov.variantCase?.totalVisits,
        ),
        marketShare: num(
          ov.sim2?.marketShare ?? ov.after?.marketShare ??
          ov.simB?.marketShare ?? ov.variantCase?.marketShare,
        ),
      },
    },

    // ── 키워드 ──────────────────────────────────────────────────────────────
    keywords: {
      sim1: arr(kw.sim1 ?? kw.before ?? kw.simA ?? kw.baseCase),
      sim2: arr(kw.sim2 ?? kw.after  ?? kw.simB ?? kw.variantCase),
    },

    // ── 평점 분포 ────────────────────────────────────────────────────────────
    // Keep as raw object; each key → { sim1: [...], sim2: [...] }
    ratingDistribution: (
      resp.ratingDistribution && typeof resp.ratingDistribution === 'object'
        ? resp.ratingDistribution
        : {}
    ),

    // ── 평점 요약 ────────────────────────────────────────────────────────────
    ratingSummary: {
      sim1: {
        avg:          num(resp.ratingSummary?.sim1?.avg),
        satisfaction: num(resp.ratingSummary?.sim1?.satisfaction),
      },
      sim2: {
        avg:          num(resp.ratingSummary?.sim2?.avg),
        satisfaction: num(resp.ratingSummary?.sim2?.satisfaction),
      },
    },

    // ── 지표 3: 시간대별 트래픽 ──────────────────────────────────────────────
    hourlyTraffic: arr(resp.hourlyTraffic ?? resp.hourly_traffic),
    peakSlot: {
      sim1: str(resp.peakSlot?.sim1 ?? resp.peakSlot?.before ?? resp.peak_slot?.sim1),
      sim2: str(resp.peakSlot?.sim2 ?? resp.peakSlot?.after  ?? resp.peak_slot?.sim2),
    },

    // ── 지표 4: 세대별 증감 ──────────────────────────────────────────────────
    generation: arr(resp.generation),

    // ── 지표 5: 방문 목적 ────────────────────────────────────────────────────
    purpose: arr(resp.purpose),

    // ── 지표 6: 재방문율 ─────────────────────────────────────────────────────
    retention: {
      sim1Agents:    num(resp.retention?.sim1Agents    ?? resp.retention?.sim1_agents),
      sim2Agents:    num(resp.retention?.sim2Agents    ?? resp.retention?.sim2_agents),
      retained:      num(resp.retention?.retained),
      newUsers:      num(resp.retention?.newUsers      ?? resp.retention?.new_users),
      churned:       num(resp.retention?.churned),
      retentionRate: num(resp.retention?.retentionRate ?? resp.retention?.retention_rate),
      newRatio:      num(resp.retention?.newRatio      ?? resp.retention?.new_ratio),
    },

    // ── 지표 9: 에이전트 유형 ────────────────────────────────────────────────
    agentType: arr(resp.agentType ?? resp.agent_type),

    // ── 지표 10: 성별 ─────────────────────────────────────────────────────────
    gender: arr(resp.gender),

    // ── 지표 7: 경쟁 매장 비교 ──────────────────────────────────────────────
    radar: arr(resp.radar),
    radarStores: {
      comp1: str(resp.radarStores?.comp1 ?? resp.radar_stores?.comp1, '경쟁사 1'),
      comp2: str(resp.radarStores?.comp2 ?? resp.radar_stores?.comp2, '경쟁사 2'),
      comp3: str(resp.radarStores?.comp3 ?? resp.radar_stores?.comp3, '경쟁사 3'),
    },

    // ── 지표 11: 크로스탭 ────────────────────────────────────────────────────
    crosstab: {
      generations: arr(resp.crosstab?.generations),
      purposes:    arr(resp.crosstab?.purposes),
      sim2:        arr(resp.crosstab?.sim2 ?? resp.crosstab?.after ?? resp.crosstab?.variantCase),
    },

    // ── 역효과 / 리스크 ───────────────────────────────────────────────────────
    sideEffects: arr(resp.sideEffects ?? resp.side_effects),
    tradeoffs:   arr(resp.tradeoffs),
    riskScore: {
      score:        num(resp.riskScore?.score        ?? resp.risk_score?.score),
      level:        str(resp.riskScore?.level        ?? resp.risk_score?.level, ''),
      positive:     num(resp.riskScore?.positive     ?? resp.risk_score?.positive),
      watch:        num(resp.riskScore?.watch        ?? resp.risk_score?.watch),
      negative:     num(resp.riskScore?.negative     ?? resp.risk_score?.negative),
      totalMetrics: num(resp.riskScore?.totalMetrics ?? resp.risk_score?.total_metrics),
    },

    // ── LLM 종합 평가 ──────────────────────────────────────────────────────
    llmSummary: str(resp.llmSummary ?? resp.llm_summary, ''),
  };
}
