import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { audit_logs } from '@shared/schema';
import { sql, and, eq, gte } from 'drizzle-orm';
import { logger } from '../logger';

const DAILY_COST_LIMIT_USD = 5.0; // Default limit per company

export async function checkCompanyAICap(req: Request, res: Response, next: NextFunction) {
  try {
    const companyId = (req as any).session?.companyId;
    if (!companyId) return next(); // Skip if no company context

    // Calculate start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Query total cost for today
    const result = await db.execute(sql`
      SELECT COALESCE(SUM((changes->>'estimated_cost_usd')::numeric), 0) as total_cost
      FROM audit_logs
      WHERE company_id = ${companyId}
        AND entity_type = 'ai_invoice_extract'
        AND created_at >= ${today.toISOString()}
    `);

    const totalCost = Number((result.rows?.[0] as any)?.total_cost || 0);

    if (totalCost >= DAILY_COST_LIMIT_USD) {
      logger.warn({ companyId, totalCost }, 'Daily AI cost limit exceeded');
      return res.status(429).json({
        error: 'Daily AI usage limit exceeded for your company',
        code: 'AI_DAILY_LIMIT_EXCEEDED'
      });
    }

    next();
  } catch (error) {
    logger.error({ err: error }, 'Error checking AI limits');
    // Fail open (allow request) if check fails, to avoid blocking due to DB errors
    next();
  }
}
