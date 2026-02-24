/**
 * src/utils/error.js
 * Utility for parsing API/job errors into a normalised shape.
 */

import { getErrorMessage } from '../i18n/errors';

/** Extracts [CODE] prefix from an error message string. */
const CODE_PATTERN = /^\[([A-Z_]+)\]/;

/**
 * Normalise any caught error into { code, message, rawMessage }.
 *
 * Handles:
 *   - server/client errors from client.js  (have .status + .code)
 *   - job errors                            (have .code)
 *   - messages with a [CODE] prefix
 *
 * @param {unknown} err
 * @returns {{ code: string|null, message: string, rawMessage: string|null }}
 */
export function parseError(err) {
  if (!err || typeof err !== 'object') {
    return { code: null, message: getErrorMessage(null), rawMessage: null };
  }

  // 5xx from client.js — always mapped to SERVER_5XX
  if (err.status != null && err.status >= 500) {
    return {
      code: 'SERVER_5XX',
      message: getErrorMessage('SERVER_5XX'),
      rawMessage: typeof err.message === 'string' ? err.message : null,
    };
  }

  const rawMessage = typeof err.message === 'string' ? err.message : null;

  // Prefer explicit .code; fall back to [CODE] extraction from message
  const code =
    (typeof err.code === 'string' ? err.code : null) ??
    (rawMessage ? (CODE_PATTERN.exec(rawMessage)?.[1] ?? null) : null);

  return {
    code,
    message: getErrorMessage(code, rawMessage),
    rawMessage,
  };
}
