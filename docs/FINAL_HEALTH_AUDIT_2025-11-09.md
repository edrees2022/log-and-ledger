# Final Health Audit – 2025-11-09

This report summarizes the current application health across security, performance, reliability, and observability.

## Security

- HTTP protections: Helmet enabled, CORS configured, rate limiting applied on sensitive endpoints.
- Sessions: Express-session with Postgres store (Neon) configured; cookies set `HttpOnly`, `Secure` (in prod), and `SameSite` appropriately.
- CSRF: Middleware present with selective skips for safe routes and GET; dedicated `/api/csrf-token` endpoint. Notes: in development, CSRF is relaxed for DX.
- Auth: Firebase client auth tokens verified server-side for SSO bind. Server session established via `/api/auth/sso-login` using `Authorization: Bearer <idToken>`.
- Sensitive fields: User password hashes and secrets not leaked in responses (sanitization applied in routes).

Risk/Follow-ups:
- Consider rotating session secrets and documenting rotation procedure.
- Enforce HTTPS-only cookies in all deployments; confirm platform settings (Render/DO/Vercel) enforce TLS termination.
- Expand CSRF protection notes for production hardening (document required headers for mutations in external clients).

## Performance

- Build: Vite + React, tree-shaking enabled; bundle builds are passing. UI is responsive with lazy network activity where applicable.
- Querying: TanStack Query in use; cache invalidation occurs after auth transitions (SSO bind, login, company switch).
- Latency: Client diagnostics now pings `/api/health` every 15s and renders color-coded badge:
  - <250ms: good, 250–800ms: warn, >800ms: bad. (Adjust thresholds as needed.)
- React integrity: Runtime probe ensures a single React instance; warns if multiple copies are detected.

Follow-ups:
- Consider code-splitting heavy routes/reports if startup bundle grows.
- Add Web Vitals collection to complement diagnostics (CLS/LCP/INP sampled).

## Reliability

- Auth/SSO: Background binding with non-overlapping attempts and exponential backoff (max 2 tries). UI remains functional in auth-only mode with clear toasts.
- Timeouts: Network calls guarded by AbortController (12s for SSO, 7s for health checks).
- Offline: Diagnostics displays online/offline status; app behaves gracefully when offline.
- Testing: Vitest configured with jsdom; UI test added for Diagnostics page (auth-only badge, copy ID, timeline rendering).

Follow-ups:
- Increase test coverage around SSO error branches and toast feedback.
- Add smoke tests for critical report pages to prevent regressions.

## Observability

- Request correlation: `requestId` surfaced from backend to client and shown in Diagnostics; copy action provided.
- SSO Timeline: Instrumented stages emitted from AuthContext (attempt start, token acquired, success/failure/error) and visible in Diagnostics.
- React Probe: Aggregates runtime instances and version; displayed in Diagnostics.
- Health Endpoint: `/api/health` returns status JSON; used for latency probing.

Follow-ups:
- Consider server-side structured logs with `requestId` propagation to external log sinks (e.g., Logflare, Datadog) for production.
- Add basic uptime counters and last-success timestamps on the server for quick sanity checks.

## Summary

Overall health is green. The app degrades gracefully during auth-only conditions, provides actionable diagnostics, and enforces standard web security practices. Remaining items are incremental: expand test coverage, polish reports layout consistency, and (optionally) wire server logs to an external sink.
