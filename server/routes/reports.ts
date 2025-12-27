import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { getTrialBalance, getGeneralLedger, getIncomeStatement, getBalanceSheet, getConsolidatedBalanceSheet, getGlobalDashboardStats } from "../utils/reports";
import { serverError, badRequest } from "../utils/sendError";
import { generateCashFlowForecast } from "../utils/forecasting";
import { db } from "../db";
import { audit_logs } from "@shared/schema";
import { eq, and, gte } from "drizzle-orm";
import { getCache, setCache, CacheKeys, CacheTTL } from "../cache";

const router = Router();

/**
 * @swagger
 * /api/reports/trial-balance:
 *   get:
 *     summary: Get Trial Balance report
 *     description: Retrieve trial balance for a specific date range
 *     tags: [Reports]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date of the period
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date of the period
 *     responses:
 *       200:
 *         description: Trial Balance report
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   accountId:
 *                     type: string
 *                   accountCode:
 *                     type: string
 *                   accountName:
 *                     type: string
 *                   accountType:
 *                     type: string
 *                   openingBalance:
 *                     type: number
 *                   debit:
 *                     type: number
 *                   credit:
 *                     type: number
 *                   netMovement:
 *                     type: number
 *                   closingBalance:
 *                     type: number
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 */
router.get("/trial-balance", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return badRequest(res, "startDate and endDate are required");
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return badRequest(res, "Invalid date format");
    }

    // Check cache first
    const cacheKey = CacheKeys.trialBalance(companyId, startDate as string, endDate as string);
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const report = await getTrialBalance(companyId, start, end);
    
    // Cache for 30 minutes (reports don't change frequently)
    await setCache(cacheKey, report, CacheTTL.LONG);
    
    res.json(report);
  } catch (error) {
    console.error("Error generating trial balance:", error);
    serverError(res, "Failed to generate trial balance");
  }
});

/**
 * @swagger
 * /api/reports/general-ledger:
 *   get:
 *     summary: Get General Ledger
 *     description: Retrieve detailed transactions for a specific account
 *     tags: [Reports]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: General Ledger report
 */
router.get("/general-ledger", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { accountId, startDate, endDate } = req.query;

    if (!accountId || !startDate || !endDate) {
      return badRequest(res, "accountId, startDate and endDate are required");
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return badRequest(res, "Invalid date format");
    }

    const report = await getGeneralLedger(companyId, accountId as string, start, end);
    res.json(report);
  } catch (error) {
    console.error("Error generating general ledger:", error);
    serverError(res, "Failed to generate general ledger");
  }
});

/**
 * @swagger
 * /api/reports/income-statement:
 *   get:
 *     summary: Get Income Statement (P&L)
 *     description: Retrieve Profit and Loss statement for a period
 *     tags: [Reports]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: Income Statement
 */
router.get("/income-statement", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return badRequest(res, "startDate and endDate are required");
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return badRequest(res, "Invalid date format");
    }

    const report = await getIncomeStatement(companyId, start, end);
    res.json(report);
  } catch (error) {
    console.error("Error generating income statement:", error);
    serverError(res, "Failed to generate income statement");
  }
});

/**
 * @swagger
 * /api/reports/balance-sheet:
 *   get:
 *     summary: Get Balance Sheet
 *     description: Retrieve Balance Sheet as of a specific date
 *     tags: [Reports]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: Balance Sheet
 */
router.get("/balance-sheet", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { date } = req.query;

    if (!date) {
      return badRequest(res, "date is required");
    }

    const asOfDate = new Date(date as string);

    if (isNaN(asOfDate.getTime())) {
      return badRequest(res, "Invalid date format");
    }

    const report = await getBalanceSheet(companyId, asOfDate);
    res.json(report);
  } catch (error) {
    console.error("Error generating balance sheet:", error);
    serverError(res, "Failed to generate balance sheet");
  }
});

/**
 * @swagger
 * /api/reports/consolidated-balance-sheet:
 *   get:
 *     summary: Get Consolidated Balance Sheet
 *     description: Retrieve Consolidated Balance Sheet as of a specific date
 *     tags: [Reports]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: Consolidated Balance Sheet
 */
router.get("/consolidated-balance-sheet", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { date } = req.query;

    if (!date) {
      return badRequest(res, "date is required");
    }

    const asOfDate = new Date(date as string);

    if (isNaN(asOfDate.getTime())) {
      return badRequest(res, "Invalid date format");
    }

    const report = await getConsolidatedBalanceSheet(companyId, asOfDate);
    res.json(report);
  } catch (error) {
    console.error("Error generating consolidated balance sheet:", error);
    serverError(res, "Failed to generate consolidated balance sheet");
  }
});

/**
 * @swagger
 * /api/reports/cash-flow-forecast:
 *   get:
 *     summary: Get Cash Flow Forecast
 *     description: Retrieve cash flow forecast for the next N months
 *     tags: [Reports]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Number of months to forecast
 *       - in: query
 *         name: useAI
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Whether to use AI for analysis
 *     responses:
 *       200:
 *         description: Cash Flow Forecast
 */
router.get("/cash-flow-forecast", requireAuth, async (req, res) => {
  try {
    const months = parseInt(req.query.months as string) || 3;
    const useAI = req.query.useAI === 'true';
    const companyId = (req as any).session.companyId;
    
    const forecast = await generateCashFlowForecast(companyId, months, useAI);
    res.json(forecast);
  } catch (error) {
    serverError(res, error as Error, { message: "Error generating cash flow forecast" });
  }
});

/**
 * @swagger
 * /api/reports/ai-analytics:
 *   get:
 *     summary: Get AI Analytics
 *     description: Retrieve AI usage statistics
 *     tags: [Reports]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: AI Analytics Data
 */
router.get("/ai-analytics", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch logs
    const logs = await db.select()
      .from(audit_logs)
      .where(and(
        eq(audit_logs.company_id, companyId),
        eq(audit_logs.entity_type, 'ai_invoice_extract'),
        gte(audit_logs.timestamp, startDate)
      ));

    // Aggregate data
    const summary = {
      totalExtractions: logs.length,
      successfulExtractions: logs.filter(l => (l.changes as any)?.success).length,
      failedExtractions: logs.filter(l => !(l.changes as any)?.success).length,
      successRate: 0,
      estimatedCost: logs.reduce((acc, l) => acc + ((l.changes as any)?.estimated_cost_usd || 0), 0),
      currency: 'USD'
    };
    summary.successRate = summary.totalExtractions ? Math.round((summary.successfulExtractions / summary.totalExtractions) * 100) : 0;

    const providersMap = new Map<string, { total: number, success: number }>();
    const modelsMap = new Map<string, number>();
    const modesMap = new Map<string, number>();
    const dailyTrendMap = new Map<string, { extractions: number, success: number }>();

    logs.forEach(l => {
      const changes = l.changes as any || {};
      const provider = changes.provider || 'unknown';
      const model = changes.model || 'unknown';
      const mode = changes.mode || 'unknown';
      const date = l.timestamp.toISOString().split('T')[0];

      // Providers
      if (!providersMap.has(provider)) providersMap.set(provider, { total: 0, success: 0 });
      const p = providersMap.get(provider)!;
      p.total++;
      if (changes.success) p.success++;

      // Models
      modelsMap.set(model, (modelsMap.get(model) || 0) + 1);

      // Modes
      modesMap.set(mode, (modesMap.get(mode) || 0) + 1);

      // Daily Trend
      if (!dailyTrendMap.has(date)) dailyTrendMap.set(date, { extractions: 0, success: 0 });
      const d = dailyTrendMap.get(date)!;
      d.extractions++;
      if (changes.success) d.success++;
    });

    const providers = Array.from(providersMap.entries()).map(([name, stats]) => ({
      name,
      total: stats.total,
      success: stats.success,
      successRate: stats.total ? Math.round((stats.success / stats.total) * 100) + '%' : '0%'
    }));

    const models = Array.from(modelsMap.entries()).map(([name, count]) => ({ name, count }));
    const modes = Array.from(modesMap.entries()).map(([name, count]) => ({ name, count }));
    
    const dailyTrend = Array.from(dailyTrendMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, stats]) => ({ date, ...stats }));

    const recentExtractions = logs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10)
      .map(l => ({
        id: l.id,
        timestamp: l.timestamp.toISOString(),
        entity_id: l.entity_id,
        provider: (l.changes as any)?.provider || 'unknown',
        model: (l.changes as any)?.model || 'unknown',
        mode: (l.changes as any)?.mode || 'unknown',
        success: !!(l.changes as any)?.success,
        actor: l.actor_name || 'System',
        cost: (l.changes as any)?.estimated_cost_usd,
        tokens: {
          in: (l.changes as any)?.estimated_tokens_in || 0,
          out: (l.changes as any)?.estimated_tokens_out || 0
        },
        error: (l.changes as any)?.error
      }));

    res.json({
      summary,
      providers,
      models,
      modes,
      dailyTrend,
      recentExtractions
    });

  } catch (error) {
    console.error("Error generating AI analytics:", error);
    serverError(res, "Failed to generate AI analytics");
  }
});

// Global Dashboard Stats
router.get("/global-dashboard", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const stats = await getGlobalDashboardStats(companyId);
    res.json(stats);
  } catch (error: any) {
    console.error("Error fetching global dashboard:", error);
    return serverError(res, "Failed to fetch global dashboard stats");
  }
});

/**
 * @swagger
 * /api/reports/aging:
 *   get:
 *     summary: Get Aging Report
 *     description: Get accounts receivable or payable aging report
 *     tags: [Reports]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [receivable, payable]
 *         required: true
 *       - in: query
 *         name: asOfDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to calculate aging from (defaults to today)
 *     responses:
 *       200:
 *         description: Aging Report
 */
router.get("/aging", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { type, asOfDate } = req.query;

    if (!type || !['receivable', 'payable'].includes(type as string)) {
      return badRequest(res, "type must be 'receivable' or 'payable'");
    }

    const asOf = asOfDate ? new Date(asOfDate as string) : new Date();
    if (isNaN(asOf.getTime())) {
      return badRequest(res, "Invalid date format");
    }

    const { getAgingReport } = await import("../utils/reports");
    const report = await getAgingReport(companyId, type as 'receivable' | 'payable', asOf);
    res.json(report);
  } catch (error) {
    console.error("Error generating aging report:", error);
    serverError(res, "Failed to generate aging report");
  }
});

/**
 * @swagger
 * /api/reports/contact-statement/{contactId}:
 *   get:
 *     summary: Get Contact Statement
 *     description: Get statement of account for a customer or supplier
 *     tags: [Reports]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: Contact Statement
 */
router.get("/contact-statement/:contactId", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { contactId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return badRequest(res, "startDate and endDate are required");
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return badRequest(res, "Invalid date format");
    }

    const { getContactStatement } = await import("../utils/reports");
    const statement = await getContactStatement(companyId, contactId, start, end);
    res.json(statement);
  } catch (error) {
    console.error("Error generating contact statement:", error);
    serverError(res, "Failed to generate contact statement");
  }
});

/**
 * @swagger
 * /api/reports/sales-summary:
 *   get:
 *     summary: Get Sales Summary report
 *     tags: [Reports]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: Sales Summary
 */
router.get("/sales-summary", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return badRequest(res, "startDate and endDate are required");
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return badRequest(res, "Invalid date format");
    }

    const { getSalesSummary } = await import("../utils/reports");
    const summary = await getSalesSummary(companyId, start, end);
    res.json(summary);
  } catch (error) {
    console.error("Error generating sales summary:", error);
    serverError(res, "Failed to generate sales summary");
  }
});

/**
 * @swagger
 * /api/reports/purchases-summary:
 *   get:
 *     summary: Get Purchases Summary report
 *     tags: [Reports]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: Purchases Summary
 */
router.get("/purchases-summary", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return badRequest(res, "startDate and endDate are required");
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return badRequest(res, "Invalid date format");
    }

    const { getPurchasesSummary } = await import("../utils/reports");
    const summary = await getPurchasesSummary(companyId, start, end);
    res.json(summary);
  } catch (error) {
    console.error("Error generating purchases summary:", error);
    serverError(res, "Failed to generate purchases summary");
  }
});

/**
 * @openapi
 * /api/reports/profit-loss-comparison:
 *   get:
 *     summary: Get profit/loss comparison between two periods
 *     tags: [Reports]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: period1Start
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: period1End
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: period2Start
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: period2End
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 */
router.get("/profit-loss-comparison", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { period1Start, period1End, period2Start, period2End } = req.query;

    if (!period1Start || !period1End || !period2Start || !period2End) {
      return badRequest(res, "All period dates are required");
    }

    const p1Start = new Date(period1Start as string);
    const p1End = new Date(period1End as string);
    const p2Start = new Date(period2Start as string);
    const p2End = new Date(period2End as string);

    if (isNaN(p1Start.getTime()) || isNaN(p1End.getTime()) || 
        isNaN(p2Start.getTime()) || isNaN(p2End.getTime())) {
      return badRequest(res, "Invalid date format");
    }

    const { getProfitLossComparison } = await import("../utils/reports");
    const comparison = await getProfitLossComparison(companyId, p1Start, p1End, p2Start, p2End);
    res.json(comparison);
  } catch (error) {
    console.error("Error generating profit/loss comparison:", error);
    serverError(res, "Failed to generate profit/loss comparison");
  }
});

export default router;
