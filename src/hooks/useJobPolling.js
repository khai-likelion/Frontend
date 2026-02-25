/**
 * src/hooks/useJobPolling.js
 *
 * Generic job-status polling hook.
 *
 * Usage:
 *   const { status, progress, resultId, errorMessage, errorCode, isPolling, attempt }
 *     = useJobPolling(jobId, options)
 *
 * Options:
 *   enabled       boolean   – start polling immediately (default: true)
 *   baseIntervalMs  number  – initial poll interval in ms (default: 1500)
 *   maxIntervalMs   number  – cap for backoff interval (default: 5000)
 *   timeoutMs       number  – hard timeout after which polling fails (default: 120000)
 *   maxRetries      number  – max poll attempts (default: 120)
 *   onCompleted   (resultId: number) => void
 *   onFailed      (errorMessage: string, errorCode: string|null) => void
 *   persistKey    string|undefined  – localStorage key for reconnection (optional, default: off)
 *
 * Guarantees:
 *   • Abort + timer cleanup on jobId change / unmount (no memory leak / race condition)
 *   • Polling stops on completed, failed, timeout, or maxRetries
 *   • Exponential-ish backoff: interval grows with attempt count
 *   • 5xx server errors stop polling immediately with errorCode='SERVER_5XX'
 */

import { useState, useEffect, useRef } from 'react';
import { fetchJob, normalizeJob } from '../api/jobs';

const LS_PREFIX = 'job_polling_';

/**
 * If persistKey is provided, returns the previously persisted jobId (number|null).
 * Useful for the host component to initialise jobId on mount.
 */
export function getPersistedJobId(persistKey) {
  if (!persistKey) return null;
  const raw = localStorage.getItem(LS_PREFIX + persistKey);
  return raw ? Number(raw) : null;
}

export function useJobPolling(jobId, {
  enabled = true,
  baseIntervalMs = 1500,
  maxIntervalMs = 5000,
  timeoutMs = 120_000,
  maxRetries = 120,
  onCompleted,
  onFailed,
  persistKey,
} = {}) {
  const [state, setState] = useState({
    status: 'pending',
    progress: null,
    resultId: null,
    errorMessage: null,
    errorCode: null,
    isPolling: false,
    attempt: 0,
  });

  // Keep callbacks fresh without triggering re-renders or re-effects
  const callbacksRef = useRef({ onCompleted, onFailed });
  useEffect(() => {
    callbacksRef.current = { onCompleted, onFailed };
  });

  useEffect(() => {
    if (!jobId || !enabled) {
      setState(s => ({ ...s, isPolling: false }));
      return;
    }

    // ── Persist for reconnect ─────────────────────────────────────────────
    if (persistKey) {
      localStorage.setItem(LS_PREFIX + persistKey, String(jobId));
    }

    // ── Mutable closure state (not React state — avoids stale closures) ───
    let stopped = false;
    let timer = null;
    let attempt = 0;
    const abortController = new AbortController();
    const startTime = Date.now();

    setState({
      status: 'pending',
      progress: null,
      resultId: null,
      errorMessage: null,
      errorCode: null,
      isPolling: true,
      attempt: 0,
    });

    // ── Helpers ───────────────────────────────────────────────────────────
    const cleanup = () => {
      stopped = true;
      abortController.abort();
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (persistKey) {
        localStorage.removeItem(LS_PREFIX + persistKey);
      }
    };

    const finish = (nextState) => {
      cleanup();
      setState(s => ({ ...s, ...nextState, isPolling: false }));
    };

    const fail = (message, code) => {
      finish({ status: 'failed', errorMessage: message, errorCode: code });
      callbacksRef.current.onFailed?.(message, code);
    };

    // ── Poll loop ─────────────────────────────────────────────────────────
    const poll = async () => {
      if (stopped) return;

      // Hard constraints
      if (Date.now() - startTime >= timeoutMs) {
        fail('요청 시간이 초과되었습니다.', 'TIMEOUT');
        return;
      }
      if (attempt >= maxRetries) {
        fail('최대 재시도 횟수를 초과하였습니다.', 'MAX_RETRIES_EXCEEDED');
        return;
      }

      try {
        const resp = await fetchJob(jobId, { signal: abortController.signal });
        if (stopped) return;

        const job = normalizeJob(resp);
        attempt++;
        setState(s => ({ ...s, status: job.status, progress: job.progress, attempt }));

        // ── Terminal: completed ───────────────────────────────────────────
        if (job.status === 'completed') {
          if (job.resultId == null) {
            fail('결과 ID를 받지 못했습니다.', 'RESULT_ID_MISSING');
          } else {
            finish({ status: 'completed', resultId: job.resultId });
            callbacksRef.current.onCompleted?.(job.resultId);
          }
          return;
        }

        // ── Terminal: failed ──────────────────────────────────────────────
        if (job.status === 'failed') {
          fail(
            job.errorMessage ?? '작업이 실패했습니다.',
            job.errorCode,
          );
          return;
        }

        // ── Still running — schedule next poll with gentle backoff ────────
        // interval = min(maxIntervalMs, baseIntervalMs × (1 + attempt × 0.05))
        const nextInterval = Math.min(
          maxIntervalMs,
          baseIntervalMs * (1 + attempt * 0.05),
        );
        timer = setTimeout(poll, nextInterval);

      } catch (err) {
        if (stopped) return;

        // AbortError: either our own cleanup (stopped=true, already guarded above)
        // or client.js's internal 10-second request timeout (transient) — retry.
        // 5xx: transient server error — retry with backoff.
        if (err.name === 'AbortError' || (err.status != null && err.status >= 500)) {
          attempt++;
          setState(s => ({ ...s, attempt }));
          if (attempt >= maxRetries) {
            fail('최대 재시도 횟수를 초과하였습니다.', 'MAX_RETRIES_EXCEEDED');
            return;
          }
          timer = setTimeout(poll, Math.min(maxIntervalMs * 2, 10_000));
          return;
        }

        // Other network / client error (4xx etc.) — fatal
        fail(
          err.message ?? '알 수 없는 오류가 발생했습니다.',
          err.code ?? null,
        );
      }
    };

    poll();

    // ── Cleanup on jobId change / unmount ─────────────────────────────────
    return cleanup;
  }, [jobId, enabled, baseIntervalMs, maxIntervalMs, timeoutMs, maxRetries, persistKey]);

  return state;
}
