import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
// Persistent session stores (prod: Postgres; dev: in-memory with pruning)
// Force Render rebuild: 2025-11-12T12:55 - Critical permissions fix deployment
import connectPgSimple from "connect-pg-simple";
import createMemoryStore from "memorystore";
import helmet from "helmet";
import csrf from "csurf";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { logger } from "./logger";
import { sanitizeMiddleware } from "./middleware/sanitize";
import { successEnvelopeMiddleware } from "./middleware/successEnvelope";
import { redactSensitive } from "./middleware/redact";
import cors, { CorsOptions } from "cors";
import { ensureSchemaUpgrades } from "./bootstrap/schemaUpgrade";
import { notFound, sendError } from './utils/sendError';
import pinoHttp from 'pino-http';
import type * as Sentry from '@sentry/node';
// Optional Sentry monitoring (enabled only if SENTRY_DSN is set)
let SentryInstance: typeof Sentry | null = null;
try {
  // Defer require to avoid hard dependency when DSN not set
  if (process.env.SENTRY_DSN) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    SentryInstance = require('@sentry/node');
  }
} catch {}

const app = express();

// Initialize Sentry (optional)
if (SentryInstance && process.env.SENTRY_DSN) {
  try {
    SentryInstance.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      // Performance monitoring
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
      // Profile slow transactions
      profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE || 0.1),
      // Enhanced integrations
      integrations: [
        SentryInstance.httpIntegration(),
        SentryInstance.postgresIntegration(),
      ],
      // Custom transaction naming
      beforeSend(event: Sentry.ErrorEvent) {
        // Don't send health check errors to Sentry
        if (event.request?.url?.includes('/health')) {
          return null;
        }
        return event;
      },
      // Track slow transactions
      tracesSampler(samplingContext: any) {
        // Always trace slow transactions
        if (samplingContext.parentSampled === true) {
          return 1.0;
        }
        // Sample 10% of normal transactions
        return 0.1;
      },
    });
    app.use(SentryInstance.setupExpressErrorHandler(app) as any);
    logger.info('Sentry APM initialized');
  } catch (error) {
    logger.warn({ error }, 'Sentry initialization failed');
  }
}

// Pino HTTP logger middleware (request/response logging)
app.use(
  pinoHttp({
    logger,
    // Redact sensitive headers
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
      remove: true,
    },
    // Custom request ID generator
    genReqId: (req, res) => {
      const existingID = req.headers['x-request-id'];
      if (existingID) return existingID as string;
      return Math.random().toString(36).substring(2, 15);
    },
    // Don't log health checks (reduces noise)
    autoLogging: {
      ignore: (req) => req.url?.startsWith('/api/health'),
    },
  })
);

// Trust proxy - needed for Render.com and rate limiting
// Trust multiple proxies (Vercel -> Render LB -> App)
// Setting to 3 to be safe (Vercel Edge -> Vercel Gateway -> Render LB)
app.set('trust proxy', 3);

// CORS configuration - Secure origin whitelisting
const prodFallbackOrigins = [
  'https://logledger-pro.com',
  'https://www.logledger-pro.com',
  'https://log-and-ledger.vercel.app',  // Vercel default domain
  'https://log-and-ledger.onrender.com', // Render.com deployment
  'https://log-and-ledger.web.app', // Firebase Hosting
  'https://log-and-ledger.firebaseapp.com', // Firebase Hosting
];

const envOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...envOrigins,
  ...prodFallbackOrigins,
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173'
].filter((v, i, a) => a.indexOf(v) === i);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const inWhitelist = allowedOrigins.includes(origin);
    let wildcardOK = false;
    try {
      const host = new URL(origin).hostname;
      // Allow any subdomain of logledger-pro.com
      if (host === 'logledger-pro.com' || host.endsWith('.logledger-pro.com')) wildcardOK = true;
      // Allow any Vercel preview/production deployment
      if (host.endsWith('.vercel.app')) wildcardOK = true;
      // Allow Render.com deployments
      if (host.endsWith('.onrender.com')) wildcardOK = true;
      // Allow Firebase Hosting
      if (host.endsWith('.web.app') || host.endsWith('.firebaseapp.com')) wildcardOK = true;
    } catch {}

    if (inWhitelist || wildcardOK) {
      callback(null, true);
    } else {
      logger.warn({ origin, allowed: allowedOrigins }, 'CORS blocked request');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// Ensure preflight requests are answered even when no explicit route matches
app.options('*', cors(corsOptions));

// Security headers
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"], // API-only server
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: []
    }
  } : false, // disabled/relaxed in development for Vite
  crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
  // Disable COOP to allow Firebase popup auth to work properly
  crossOriginOpenerPolicy: false,
}));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs (slightly increased from 5)
  message: "Too many authentication attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter (for UI/internal API)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs (~1 req/sec avg)
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again later",
  skip: (req) => req.path.startsWith('/api/auth') || req.path.startsWith('/api/v1') // Skip auth (has its own) and public API
});

// Public API rate limiter (for external integrations)
const publicApiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 2000, // 2000 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: "Public API rate limit exceeded",
  keyGenerator: (req) => {
    // Try to limit by API Key if present, otherwise IP
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer sk_')) {
      return authHeader.split(' ')[1];
    }
    return req.ip || 'unknown';
  }
});

// Apply rate limiting
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/v1", publicApiLimiter);
app.use("/api", apiLimiter); // Applies to everything else under /api

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Input Sanitization - apply to all routes
app.use(sanitizeMiddleware);

// Standardize successful JSON responses to { data: ... }
app.use(successEnvelopeMiddleware);

// Session configuration with enhanced security
(() => {
  const PgStore = connectPgSimple(session);
  const MemoryStore = createMemoryStore(session);

  const usePgStore = process.env.NODE_ENV === 'production' && !!process.env.DATABASE_URL;

  const store = usePgStore
    ? new PgStore({
        // Use Postgres-backed sessions in production for stability across restarts
        conString: process.env.DATABASE_URL as string,
        tableName: process.env.SESSION_TABLE || 'session',
        createTableIfMissing: true,
        // Prune expired sessions periodically (in seconds)
        pruneSessionInterval: 60 * 30,
      })
    : new MemoryStore({
        // Dev-only in-memory store with daily prune
        checkPeriod: 24 * 60 * 60 * 1000,
      });

  app.use(session({
    secret: process.env.SESSION_SECRET || 'log-ledger-secret-key-change-in-production',
    name: 'ledger.sid', // Change default session name
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiry on activity
    store,
    proxy: true, // Trust the reverse proxy when setting secure cookies
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none' // Required for cross-site cookies (even with proxy, sometimes needed)
    }
  }));
})();

// CSRF Protection - enabled for state-changing requests
const csrfProtection = csrf({
  cookie: {
    key: '_csrf',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
});

// Apply CSRF protection to state-changing routes, skip safe methods and certain paths
app.use((req, res, next) => {
  // Skip CSRF for safe methods (GET, HEAD, OPTIONS)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  // Skip CSRF for API key authenticated requests (public API)
  if (req.path.startsWith('/api/v1')) {
    return next();
  }
  // Skip CSRF for health checks
  if (req.path.startsWith('/api/health')) {
    return next();
  }
  // Skip CSRF for Firebase token authenticated requests
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return next();
  }
  // Apply CSRF protection to all other state-changing requests
  csrfProtection(req as any, res as any, next);
});

// Provide CSRF token endpoint
app.get('/api/csrf-token', (req, res, next) => {
  csrfProtection(req as any, res as any, (err?: any) => {
    if (err) {
      // Log but don't fail - CSRF token is optional for Firebase auth
      console.warn('CSRF token generation warning:', err.message);
      return res.json({ csrfToken: '' });
    }
    res.json({ csrfToken: (req as any).csrfToken?.() || '' });
  });
});

// Logging middleware (with redaction) - REMOVED, using pino-http now
// Request/response logging now handled by pino-http middleware above

(async () => {
  // Ensure lightweight schema upgrades are applied before routes
  try { 
    const { pool } = await import('./db');
    const migrationResult = await ensureSchemaUpgrades(pool);
    if (!migrationResult.success) {
      logger.warn({ errors: migrationResult.errors }, 'Some migrations failed but server will continue');
    }
  } catch (error: any) {
    logger.error({ err: error }, 'CRITICAL: Schema upgrades failed completely');
    // In production, this should prevent server start
    if (process.env.NODE_ENV === 'production') {
      logger.error('Cannot start server without successful migrations');
      process.exit(1);
    }
  }
  
  const server = await registerRoutes(app);

  // API 404 fallback - ensures /api/* requests never reach Vite's catch-all HTML handler
  app.all("/api/*", (_req, res) => {
    return notFound(res, "API endpoint not found");
  });

  // Sentry error handler is already registered above with setupExpressErrorHandler()

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    // Capture with Sentry (already done by SentryInstance.expressErrorHandler above)
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || "Internal Server Error";
    const payload = err?.payload ? redactSensitive(err.payload) : undefined;

    // Server-side log with safe details
    const details = {
      status,
      message,
      name: err?.name,
      code: err?.code,
      payload,
    };
    logger.error({ err: details, stack: err?.stack }, 'Request error');

    // Respond without leaking internals
    return sendError(res, status, message);
  });

  // In production on DigitalOcean: Only serve API
  // Frontend is served by Vercel separately
  // No need for Vite or static file serving in production!

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 3000 if not specified.
  const port = parseInt(process.env.PORT || '3000', 10);
  server.listen(port, "0.0.0.0", () => {
    logger.info({ port, env: process.env.NODE_ENV || 'development' }, 'API Server running');
  });
  
  // Global process-level error handlers
  process.on('unhandledRejection', (reason: any) => {
    logger.error({ err: reason }, 'Unhandled promise rejection');
    if (SentryInstance && process.env.SENTRY_DSN) {
      try { SentryInstance.captureException(reason); } catch {}
    }
  });
  process.on('uncaughtException', (err: any) => {
    logger.fatal({ err }, 'Uncaught exception');
    if (SentryInstance && process.env.SENTRY_DSN) {
      try { SentryInstance.captureException(err); } catch {}
    }
    // In production, prefer exiting to allow orchestration to restart
    if (process.env.NODE_ENV === 'production') {
      setTimeout(() => process.exit(1), 100);
    }
  });
})();