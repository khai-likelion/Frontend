/**
 * src/i18n/errors.js
 * Centralised error-code → Korean user-message map.
 *
 * All job/network/server error codes should be registered here so that
 * every component shows consistent, user-friendly messages.
 */

export const ERROR_MESSAGES = {
  // ── Job lifecycle ──────────────────────────────────────────────────────
  JOB_ID_MISSING:                '작업 ID를 받지 못했습니다. 다시 시도해 주세요.',
  RESULT_ID_MISSING:             '결과를 가져오는데 실패했습니다. 다시 시도해 주세요.',
  JOB_STATUS_INVALID:            '작업 상태를 확인할 수 없습니다. 다시 시도해 주세요.',
  EMPTY_RESPONSE:                '서버에서 응답을 받지 못했습니다.',

  // ── Network / timeout ─────────────────────────────────────────────────
  TIMEOUT:                       '요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.',
  MAX_RETRIES_EXCEEDED:          '요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.',
  BACKEND_TIMEOUT:               '요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.',

  // ── Server errors ─────────────────────────────────────────────────────
  SERVER_5XX:                    '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',

  // ── Business-logic errors ─────────────────────────────────────────────
  STRATEGY_PARSE_COUNT_MISMATCH: '전략 생성 도중 오류가 발생했습니다. 다시 시도해 주세요.',
};

/**
 * Returns a user-friendly Korean message for a given error code.
 * Falls back to `fallback` if provided, then to a generic message.
 *
 * @param {string|null|undefined} code
 * @param {string} [fallback]
 * @returns {string}
 */
export function getErrorMessage(code, fallback) {
  return ERROR_MESSAGES[code] ?? fallback ?? '알 수 없는 오류가 발생했습니다.';
}
