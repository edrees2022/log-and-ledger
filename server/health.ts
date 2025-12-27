import type { Request, Response } from 'express';
import { pool } from './db';

/**
 * Health check endpoint
 * Returns comprehensive service health status
 * 
 * Returns 200 if all services healthy, 503 if any service down
 */
export async function healthCheck(req: Request, res: Response) {
  const startTime = Date.now();
  const checks: Record<string, any> = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
    },
    database: { status: 'unknown', latency: 0 },
    firebase: { status: process.env.FIREBASE_SERVICE_ACCOUNT ? 'configured' : 'not_configured' },
  };

  // Check database connectivity
  try {
    const dbStart = Date.now();
    await pool.query('SELECT 1');
    checks.database = {
      status: 'healthy',
      latency: Date.now() - dbStart,
    };
  } catch (error: any) {
    checks.database = {
      status: 'unhealthy',
      error: error?.message || 'Connection failed',
    };
    checks.status = 'unhealthy';
  }

  // Check Firebase configuration
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    checks.firebase = {
      status: 'not_configured',
      warning: 'FIREBASE_SERVICE_ACCOUNT not set',
    };
  }

  checks.responseTime = Date.now() - startTime;

  // Return 503 if any critical service is down
  const statusCode = checks.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(checks);
}

/**
 * Readiness check endpoint
 * Returns 200 only if all critical services are ready to accept traffic
 */
export async function readinessCheck(req: Request, res: Response) {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    
    // All critical services ready
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    // Not ready - return 503
    res.status(503).json({
      status: 'not_ready',
      error: error?.message || 'Service unavailable',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Liveness check endpoint
 * Returns 200 if process is alive (even if dependencies are down)
 */
export async function livenessCheck(req: Request, res: Response) {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
