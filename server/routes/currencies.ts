import { Router } from "express";
import { db } from "../db";
import { currencies, exchange_rates } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requirePermission } from "../middleware/permissions";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import { badRequest, notFound, serverError } from '../utils/sendError';
import { normalize } from "../utils/sanitize";
import { seedCurrencies, getExchangeRate, convertCurrency, fetchLiveExchangeRate } from "../utils/currency";
import { logCreate } from "../utils/auditLog";

const router = Router();

/**
 * Get all available currencies
 * @route GET /api/currencies
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    // Ensure default currencies exist
    await seedCurrencies();

    const allCurrencies = await db
      .select()
      .from(currencies)
      .where(eq(currencies.is_active, true));

    res.json(allCurrencies);
  } catch (error: any) {
    console.error("Error fetching currencies:", error);
    return serverError(res, "Failed to fetch currencies");
  }
});

/**
 * Get exchange rates for a company
 * @route GET /api/currencies/rates
 */
router.get("/rates", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;

    const rates = await db
      .select()
      .from(exchange_rates)
      .where(eq(exchange_rates.company_id, companyId))
      .orderBy(desc(exchange_rates.date));

    res.json(rates);
  } catch (error: any) {
    console.error("Error fetching exchange rates:", error);
    return serverError(res, "Failed to fetch exchange rates");
  }
});

/**
 * Get live exchange rate
 * @route GET /api/currencies/live-rate
 */
router.get("/live-rate", requireAuth, async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return badRequest(res, "From and To currencies are required");
    }

    const rate = await fetchLiveExchangeRate(from as string, to as string);
    res.json({ rate });
  } catch (error: any) {
    console.error("Error fetching live rate:", error);
    return serverError(res, "Failed to fetch live rate");
  }
});

/**
 * Add a new exchange rate
 * @route POST /api/currencies/rates
 */
router.post("/rates", requireAuth, requirePermission('settings', 'edit'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const body = normalize(req.body);

    if (!body.from_currency || !body.to_currency || !body.rate) {
      return badRequest(res, "Missing required fields");
    }

    const rate = await db
      .insert(exchange_rates)
      .values({
        company_id: companyId,
        from_currency: body.from_currency,
        to_currency: body.to_currency,
        rate: body.rate.toString(),
        date: body.date ? new Date(body.date) : new Date(),
        source: 'manual',
        created_by: userId,
      })
      .returning();

    // Audit log
    await logCreate({
      companyId,
      entityType: 'exchange_rate',
      entityId: rate[0].id,
      createdData: { from_currency: body.from_currency, to_currency: body.to_currency, rate: body.rate },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json(rate[0]);
  } catch (error: any) {
    console.error("Error creating exchange rate:", error);
    return serverError(res, "Failed to create exchange rate");
  }
});

/**
 * Convert amount
 * @route POST /api/currencies/convert
 */
router.post("/convert", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { amount, from, to, date } = req.body;

    if (!amount || !from || !to) {
      return badRequest(res, "Missing required fields");
    }

    const result = await convertCurrency(
      companyId,
      parseFloat(amount),
      from,
      to,
      date ? new Date(date) : new Date()
    );

    const rate = await getExchangeRate(
      companyId,
      from,
      to,
      date ? new Date(date) : new Date()
    );

    res.json({
      amount: parseFloat(amount),
      from,
      to,
      rate,
      result,
      date: date || new Date()
    });
  } catch (error: any) {
    console.error("Error converting currency:", error);
    return serverError(res, "Failed to convert currency");
  }
});

export default router;
