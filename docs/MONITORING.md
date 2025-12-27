# Monitoring and Error Reporting

This project supports optional Sentry server-side monitoring. It is disabled by default and enabled when the environment provides a DSN.

## Enable Sentry (server)

Set the following variables in your environment:

- `SENTRY_DSN`: Sentry DSN for this project.
- `SENTRY_TRACES_SAMPLE_RATE` (optional): Defaults to `0.1`.

No code changes required; the server auto-initializes Sentry when `SENTRY_DSN` is present.

## Client error ingestion

The client sends errors to `POST /api/logs`, which performs redaction and rate limits to 20 req/min. You can ingest these logs into your platform logs and/or forward to a provider in the future.

## Notes

- Sentry is added in a fail-safe manner: if initialization fails, the app continues normally.
- Sensitive fields are redacted by the existing middleware before logging.
