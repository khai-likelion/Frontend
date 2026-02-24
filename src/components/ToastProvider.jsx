/**
 * src/components/ToastProvider.jsx
 * Minimal toast notification system — no external dependencies.
 *
 * Features:
 *   - Deduplication: identical message within DEDUP_WINDOW_MS is silently skipped
 *   - Auto-dismiss after DURATION_MS
 *   - Three severity levels: 'error' | 'success' | 'info'
 *
 * Usage:
 *   1. Wrap your app (or any subtree) with <ToastProvider>
 *   2. const { showToast } = useToast()
 *   3. showToast('메시지', 'error')
 */

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { X } from 'lucide-react';

const DURATION_MS    = 4000;
const DEDUP_WINDOW_MS = 2500;

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts]    = useState([]);
  const lastShownRef = useRef({}); // { [message]: timestamp }

  const showToast = useCallback((message, type = 'info') => {
    const now  = Date.now();
    const last = lastShownRef.current[message];
    if (last && now - last < DEDUP_WINDOW_MS) return; // deduplicate
    lastShownRef.current[message] = now;

    const id = now + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, DURATION_MS);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

const COLOR_MAP = {
  error:   'bg-red-600 text-white border-red-700',
  success: 'bg-emerald-600 text-white border-emerald-700',
  info:    'bg-gray-800 text-white border-gray-900',
};

function ToastItem({ toast, onDismiss }) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm pointer-events-auto ${COLOR_MAP[toast.type] ?? COLOR_MAP.info}`}
    >
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 mt-0.5 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/**
 * Access toast from any component inside ToastProvider.
 * @returns {{ showToast: (message: string, type?: 'error'|'success'|'info') => void }}
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
