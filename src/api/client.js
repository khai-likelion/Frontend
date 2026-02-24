/**
 * src/api/client.js
 * Fetch-based API client (no axios, no added dependencies).
 *
 * Exports:
 *   apiGet(path, { params, headers, signal }?)
 *   apiPost(path, body, { headers, signal }?)
 *
 * Features:
 *   - baseURL from VITE_API_BASE_URL
 *   - 10-second internal timeout via AbortController
 *   - Caller-supplied signal support (chained with internal timeout)
 *   - Standardised error objects: { status, code, message, raw }
 *   - [CODE] prefix extraction from error messages
 *   - Single console.debug line per error (no console.error spam)
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const DEFAULT_TIMEOUT_MS = 10_000;

/** Regex to extract [SOME_CODE] prefix from an error message string. */
const CODE_PATTERN = /^\[([A-Z_]+)\]/;

/**
 * Build a standardised error object from an HTTP response.
 * @param {number} status
 * @param {object|null} body  parsed JSON response body (may be null)
 * @returns {{ status: number, code: string|null, message: string, raw: any }}
 */
function buildErrorObject(status, body) {
  // Prefer server-provided message fields
  const serverMsg =
    (typeof body?.detail === 'string' ? body.detail : null) ??
    (typeof body?.error_message === 'string' ? body.error_message : null) ??
    (typeof body?.message === 'string' ? body.message : null) ??
    null;

  // Fallback messages by HTTP status
  let defaultMsg;
  if (status >= 500) defaultMsg = '서버 오류가 발생했습니다.';
  else if (status === 404) defaultMsg = '요청한 리소스를 찾을 수 없습니다.';
  else if (status === 401) defaultMsg = '인증이 필요합니다.';
  else if (status === 403) defaultMsg = '접근이 거부되었습니다.';
  else defaultMsg = `오류가 발생했습니다. (${status})`;

  const message = serverMsg ?? defaultMsg;

  // Extract [CODE] prefix if present
  const codeMatch = typeof message === 'string' ? CODE_PATTERN.exec(message) : null;
  const code = codeMatch ? codeMatch[1] : null;

  return { status, code, message, raw: body };
}

/**
 * Build a full URL from a path and optional query params.
 * Uses BASE_URL as origin; falls back to window.location.origin.
 */
function buildUrl(path, params) {
  const base = BASE_URL || window.location.origin;
  // Ensure base doesn't have a trailing slash before joining
  const normalised = base.replace(/\/+$/, '');
  const url = new URL(path, normalised + '/');

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    });
  }

  return url.toString();
}

/**
 * Core request function.
 *
 * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} method
 * @param {string} path   e.g. '/stores'
 * @param {{ body?, params?, headers?, signal? }} options
 * @returns {Promise<any>}  parsed JSON response
 * @throws  Error with { status, code, message, raw } attached
 */
async function request(method, path, { body, params, headers, signal, timeout } = {}) {
  const url = buildUrl(path, params);

  // Internal timeout controller (caller may override via timeout option)
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(
    () => timeoutController.abort(new DOMException('Request timed out', 'TimeoutError')),
    timeout ?? DEFAULT_TIMEOUT_MS,
  );

  // Chain caller signal + internal timeout into one signal
  let combinedSignal = timeoutController.signal;
  if (signal) {
    const combined = new AbortController();
    const abort = () => combined.abort();
    signal.addEventListener('abort', abort, { once: true });
    timeoutController.signal.addEventListener('abort', abort, { once: true });
    combinedSignal = combined.signal;
  }

  const fetchOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    signal: combinedSignal,
  };

  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    // Parse JSON if available
    let data = null;
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    }

    if (!response.ok) {
      const err = buildErrorObject(response.status, data);
      // Single standardised log line per error
      console.debug(
        `[API_ERROR] ${method} ${url} ${response.status}${err.code ? ` ${err.code}` : ''} ${err.message}`,
      );
      const error = new Error(err.message);
      Object.assign(error, err);
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Perform a GET request.
 * @param {string} path
 * @param {{ params?: Record<string,any>, headers?: Record<string,string>, signal?: AbortSignal }} [options]
 */
export function apiGet(path, options) {
  return request('GET', path, options ?? {});
}

/**
 * Perform a POST request.
 * @param {string} path
 * @param {any} body
 * @param {{ headers?: Record<string,string>, signal?: AbortSignal }} [options]
 */
export function apiPost(path, body, options) {
  return request('POST', path, { body, ...(options ?? {}) });
}

export function apiPostLong(path, body, options) {
  return request('POST', path, { body, timeout: 180_000, ...(options ?? {}) });
}
