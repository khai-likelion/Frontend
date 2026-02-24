/**
 * src/utils/format.js
 * Shared number / percent formatting utilities.
 *
 * All functions are null-safe: invalid inputs are treated as 0.
 */

/**
 * Format a number with thousand-separator commas.
 *
 * @param {any}    n     – value to format (non-number → 0)
 * @param {Intl.NumberFormatOptions} [opts]
 * @returns {string}
 *
 * @example
 *   formatNumber(1234)                            // "1,234"
 *   formatNumber(3.14, { maximumFractionDigits: 1 }) // "3.1"
 */
export function formatNumber(n, opts = {}) {
  const safe = typeof n === 'number' && isFinite(n) ? n : 0;
  return safe.toLocaleString('ko-KR', {
    maximumFractionDigits: 0,
    ...opts,
  });
}

/**
 * Format a number as a percentage string.
 *
 * @param {any}    n      – value to format (non-number → 0)
 * @param {number} [digits=1] – decimal places
 * @returns {string}  e.g. "8.2%"
 */
export function formatPercent(n, digits = 1) {
  const safe = typeof n === 'number' && isFinite(n) ? n : 0;
  return `${safe.toFixed(digits)}%`;
}

/**
 * Clamp a value between min and max.
 * Non-number inputs are clamped to min.
 *
 * @param {any}    n
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(n, min, max) {
  const safe = typeof n === 'number' && isFinite(n) ? n : min;
  return Math.min(Math.max(safe, min), max);
}
