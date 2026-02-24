/**
 * src/api/jobs.js
 * Job status polling API.
 *
 * Exports:
 *   fetchJob(jobId, { signal }?)
 *   normalizeJob(resp)
 */

import { apiGet } from './client';

const VALID_STATUSES = new Set(['pending', 'processing', 'completed', 'failed']);

/** Regex to extract [SOME_CODE] prefix from an error message string. */
const CODE_PATTERN = /^\[([A-Z_]+)\]/;

/**
 * GET /jobs/{jobId}
 * @param {number} jobId
 * @param {{ signal?: AbortSignal }} [options]
 */
export async function fetchJob(jobId, { signal } = {}) {
  return apiGet(`/jobs/${jobId}`, { signal });
}

/**
 * Normalise the raw /jobs/{id} response.
 *
 * Key-casing defence: handles both camelCase (resultId, errorMessage)
 * and snake_case (result_id, error_message).
 *
 * Type guard: if status is outside the known enum it is forced to 'failed'
 * and errorCode is set to 'JOB_STATUS_INVALID'.
 *
 * @param {any} resp
 * @returns {{
 *   status: 'pending'|'processing'|'completed'|'failed',
 *   progress: number|null,
 *   resultId: number|null,
 *   errorMessage: string|null,
 *   errorCode: string|null,
 * }}
 */
export function normalizeJob(resp) {
  if (!resp || typeof resp !== 'object') {
    return {
      status: 'failed',
      progress: null,
      resultId: null,
      errorMessage: '응답이 없습니다.',
      errorCode: 'EMPTY_RESPONSE',
    };
  }

  // --- status guard ---
  const rawStatus = resp.status ?? 'failed';
  const statusValid = VALID_STATUSES.has(rawStatus);
  const status = statusValid ? rawStatus : 'failed';

  // --- resultId (camelCase + snake_case defence) ---
  const rawResultId = resp.resultId ?? resp.result_id ?? null;
  const resultId = rawResultId !== null ? Number(rawResultId) : null;

  // --- errorMessage (camelCase + snake_case defence) ---
  const errorMessage =
    (typeof resp.errorMessage === 'string' ? resp.errorMessage : null) ??
    (typeof resp.error_message === 'string' ? resp.error_message : null) ??
    null;

  // --- errorCode extraction ---
  let errorCode = null;
  if (!statusValid) {
    errorCode = 'JOB_STATUS_INVALID';
  } else if (typeof errorMessage === 'string') {
    const m = CODE_PATTERN.exec(errorMessage);
    errorCode = m ? m[1] : null;
  }

  return {
    status,
    progress: typeof resp.progress === 'number' ? resp.progress : null,
    resultId,
    errorMessage,
    errorCode,
  };
}
