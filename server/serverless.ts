import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { ensureSchemaUpgrades } from "./bootstrap/schemaUpgrade";
import { pool } from "./db";
import { sanitizeMiddleware } from "./middleware/sanitize";
import { successEnvelopeMiddleware } from "./middleware/successEnvelope";
import { notFound, sendError, serverError } from './utils/sendError';

async function createApp() {
  const app = express();

  // CORS middleware - CRITICAL for API calls from frontend
  app.use((req, res, next) => {
    const allowedOrigins = [
      'https://logledger-pro.com',
      'https://www.logledger-pro.com',
      'http://localhost:5173',
      'http://localhost:3000',
      // Capacitor mobile apps
      'capacitor://localhost',
      'ionic://localhost',
      'http://localhost',
      'https://localhost'
    ];
    
    const origin = req.headers.origin;
    
    // Allow requests from mobile apps (they might not send origin header)
    // or from allowed origins
    if (!origin || origin === 'null' || allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  });

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    // Disable COOP to allow Firebase popup auth to work properly
    crossOriginOpenerPolicy: false,
  }));

  // Rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many authentication attempts, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(sanitizeMiddleware);
  // Wrap successful JSON responses in { data: ... }
  app.use(successEnvelopeMiddleware);

  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'log-ledger-secret-key-change-in-production',
    name: 'ledger.sid',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // In production we need cross-site cookie for frontend on different domain
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
  }));

  // Ensure critical schema upgrades are applied in serverless too (best-effort)
  try { await ensureSchemaUpgrades(pool as any); } catch {}

  // Register API routes
  await registerRoutes(app);

  // API 404 fallback
  app.all("/api/*", (_req, res) => {
    return notFound(res, "API endpoint not found");
  });

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error('Error:', err);
    return sendError(res, status, message);
  });

  return app;
}

// Export a handler function for Vercel
let appPromise: Promise<express.Express> | null = null;

export default async function handler(req: Request, res: Response) {
  console.log(`[Vercel] ${req.method} ${req.url}`);
  console.log('[Vercel] Environment check:', {
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasFirebaseKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    nodeEnv: process.env.NODE_ENV
  });
  
  try {
    if (!appPromise) {
      console.log('[Vercel] Initializing Express app...');
      appPromise = createApp().catch(err => {
        console.error('[Vercel] Failed to create app:', err);
        appPromise = null; // Reset so we can retry
        throw err;
      });
    }
    
    const app = await appPromise;
    console.log('[Vercel] App ready, handling request...');
    return app(req, res);
  } catch (error) {
    console.error('[Vercel] Handler error:', error);
    console.error('[Vercel] Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    // Make sure we send response
    if (!res.headersSent) {
      return serverError(res, error instanceof Error ? error.message : 'Unknown error', {
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      });
    }
  }
}
