import { logger } from './logger';

/**
 * Sentry tracing utilities for performance monitoring
 * Gracefully degrades if Sentry not available
 */

let Sentry: any = null;
try {
  if (process.env.SENTRY_DSN) {
    Sentry = require('@sentry/node');
  }
} catch {}

/**
 * Start a new Sentry transaction for tracing
 * Returns transaction object or null if Sentry not available
 */
export function startTransaction(
  name: string,
  op: string,
  data?: Record<string, any>
): any {
  if (!Sentry) return null;

  try {
    return Sentry.startTransaction({
      name,
      op,
      data,
    });
  } catch (error) {
    logger.debug({ error }, 'Failed to start Sentry transaction');
    return null;
  }
}

/**
 * Create a child span within a transaction
 */
export function startSpan(
  transaction: any,
  op: string,
  description: string
): any {
  if (!transaction || !Sentry) return null;

  try {
    return transaction.startChild({
      op,
      description,
    });
  } catch (error) {
    logger.debug({ error }, 'Failed to start span');
    return null;
  }
}

/**
 * Finish a span and record timing
 */
export function finishSpan(span: any): void {
  if (!span) return;

  try {
    span.finish();
  } catch (error) {
    logger.debug({ error }, 'Failed to finish span');
  }
}

/**
 * Finish a transaction
 */
export function finishTransaction(transaction: any): void {
  if (!transaction) return;

  try {
    transaction.finish();
  } catch (error) {
    logger.debug({ error }, 'Failed to finish transaction');
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  category: string,
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, any>
): void {
  if (!Sentry) return;

  try {
    Sentry.addBreadcrumb({
      category,
      message,
      level,
      data,
    });
  } catch (error) {
    logger.debug({ error }, 'Failed to add breadcrumb');
  }
}

/**
 * Capture exception manually
 */
export function captureException(
  error: Error,
  context?: Record<string, any>
): void {
  if (!Sentry) {
    logger.error({ err: error, context }, 'Exception (Sentry not available)');
    return;
  }

  try {
    Sentry.captureException(error, {
      extra: context,
    });
  } catch (err) {
    logger.debug({ err }, 'Failed to capture exception');
  }
}

/**
 * Set user context for error tracking
 */
export function setUser(user: {
  id: string;
  email?: string;
  username?: string;
}): void {
  if (!Sentry) return;

  try {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } catch (error) {
    logger.debug({ error }, 'Failed to set user context');
  }
}

/**
 * Clear user context (on logout)
 */
export function clearUser(): void {
  if (!Sentry) return;

  try {
    Sentry.setUser(null);
  } catch (error) {
    logger.debug({ error }, 'Failed to clear user context');
  }
}

/**
 * Set custom context/tags
 */
export function setContext(key: string, value: Record<string, any>): void {
  if (!Sentry) return;

  try {
    Sentry.setContext(key, value);
  } catch (error) {
    logger.debug({ error }, 'Failed to set context');
  }
}

export function setTag(key: string, value: string): void {
  if (!Sentry) return;

  try {
    Sentry.setTag(key, value);
  } catch (error) {
    logger.debug({ error }, 'Failed to set tag');
  }
}
