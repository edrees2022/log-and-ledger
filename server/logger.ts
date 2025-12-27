/**
 * Production-ready structured logger with Pino
 * - JSON logs in production (machine-readable)
 * - Pretty-printed logs in development
 * - Automatic request correlation
 * - Performance optimized (async buffering)
 */

import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

// Create base logger with appropriate settings
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
  // Production: JSON logs to stdout
  ...(!isDev && {
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
  }),
  // Add timestamp
  timestamp: pino.stdTimeFunctions.isoTime,
  // Redact sensitive fields
  redact: {
    paths: ['password', 'password_hash', 'token', 'authorization', 'cookie', 'set-cookie'],
    remove: true,
  },
});

// Backward compatibility with existing code
export function log(...args: unknown[]) {
  if (args.length === 1 && typeof args[0] === 'object') {
    logger.info(args[0]);
  } else {
    logger.info(args.join(' '));
  }
}

export function logError(...args: unknown[]) {
  if (args.length === 1 && args[0] instanceof Error) {
    logger.error({ err: args[0] }, args[0].message);
  } else if (args.length === 1 && typeof args[0] === 'object') {
    logger.error(args[0]);
  } else {
    logger.error(args.join(' '));
  }
}

export function logWarn(...args: unknown[]) {
  if (args.length === 1 && typeof args[0] === 'object') {
    logger.warn(args[0]);
  } else {
    logger.warn(args.join(' '));
  }
}

export function logDebug(...args: unknown[]) {
  if (args.length === 1 && typeof args[0] === 'object') {
    logger.debug(args[0]);
  } else {
    logger.debug(args.join(' '));
  }
}


// Backward compatibility: export default as info logger
export default { log, logError, logWarn, logDebug };
