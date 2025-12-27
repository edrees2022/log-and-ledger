import { sendClientError } from '@/lib/logging';

let sentInWindow = 0;
let windowStart = Date.now();
const MAX_PER_MINUTE = 5;

function allowSend() {
  const now = Date.now();
  if (now - windowStart > 60_000) {
    windowStart = now;
    sentInWindow = 0;
  }
  if (sentInWindow >= MAX_PER_MINUTE) return false;
  sentInWindow++;
  return true;
}

export function initGlobalErrorReporting() {
  if (typeof window === 'undefined') return;
  if ((window as any).__LL_ERRORS_INIT__) return;
  (window as any).__LL_ERRORS_INIT__ = true;

  window.addEventListener('error', (event) => {
    try {
      if (!allowSend()) return;
      const err = event?.error as Error | undefined;
      sendClientError({
        message: err?.message || String(event?.message || 'Unknown error'),
        name: err?.name,
        stack: err?.stack,
        tags: ['global', 'onerror'],
      });
    } catch {}
  });

  window.addEventListener('unhandledrejection', (event) => {
    try {
      if (!allowSend()) return;
      const reason: any = (event as PromiseRejectionEvent).reason;
      const message = typeof reason === 'object' && reason?.message ? reason.message : String(reason);
      const stack = typeof reason === 'object' && reason?.stack ? reason.stack : undefined;
      sendClientError({
        message,
        name: reason?.name || 'UnhandledRejection',
        stack,
        tags: ['global', 'unhandledrejection'],
      });
    } catch {}
  });
}
