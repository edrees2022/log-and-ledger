// Optional Sentry init for client (guarded by VITE_SENTRY_DSN)
// Keeps our existing ErrorBoundary and /api/logs flow; Sentry is additive.
export function initClientMonitoring() {
  try {
    const dsn = (import.meta as any)?.env?.VITE_SENTRY_DSN;
    if (!dsn) return;
    // Lazy import to avoid adding weight when DSN is not set
    import('@sentry/react').then(Sentry => {
      try {
        Sentry.init({
          dsn,
          environment: (import.meta as any)?.env?.MODE || 'development',
          tracesSampleRate: Number(((import.meta as any)?.env?.VITE_SENTRY_TRACES_SAMPLE_RATE) ?? 0.1),
        });
      } catch {}
    }).catch(() => {});
  } catch {}
}
