/**
 * API Version 2 - Enhanced Internal API
 * 
 * This module provides the versioned internal API with improved features:
 * - Standardized pagination
 * - Enhanced caching
 * - Better error responses
 * - Consistent response envelopes
 */

import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissions";
import { db } from "../db";
import { 
  accounts, contacts, items, taxes,
  sales_invoices, bills, payments, receipts
} from "@shared/schema";
import { eq, desc, asc, count, sql } from "drizzle-orm";
import { parsePaginationParams, createPaginatedResponse } from "../utils/pagination";
import { getCache, setCache, CacheKeys, CacheTTL } from "../cache";
import { badRequest, serverError, notFound } from "../utils/sendError";

const router = Router();

/**
 * @swagger
 * /api/v2/accounts:
 *   get:
 *     summary: Get paginated chart of accounts
 *     tags: [API v2]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 25
 *           maximum: 200
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: code
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: Paginated list of accounts
 */
router.get("/accounts", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const params = parsePaginationParams(req, 'accounts');
    
    // Try cache for first page with default params
    if (params.page === 1 && params.limit === 25) {
      const cached = await getCache<any>(CacheKeys.accounts(companyId));
      if (cached) {
        return res.json(cached);
      }
    }

    // Get total count
    const [countResult] = await db
      .select({ total: count() })
      .from(accounts)
      .where(eq(accounts.company_id, companyId));
    
    const total = countResult?.total || 0;

    // Get paginated data
    const data = await db
      .select()
      .from(accounts)
      .where(eq(accounts.company_id, companyId))
      .orderBy(
        params.sortOrder === 'asc' 
          ? asc(accounts.code) 
          : desc(accounts.code)
      )
      .limit(params.limit)
      .offset(params.offset);

    const response = createPaginatedResponse(data, total, params);

    // Cache first page
    if (params.page === 1 && params.limit === 25) {
      await setCache(CacheKeys.accounts(companyId), response, CacheTTL.MEDIUM);
    }

    res.json(response);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    serverError(res, "Failed to fetch accounts");
  }
});

/**
 * @swagger
 * /api/v2/contacts:
 *   get:
 *     summary: Get paginated contacts (customers/suppliers)
 *     tags: [API v2]
 */
router.get("/contacts", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const params = parsePaginationParams(req, 'contacts');
    const { type } = req.query; // customer, supplier, both

    // Build query
    let query = db
      .select()
      .from(contacts)
      .where(eq(contacts.company_id, companyId));

    // Get total
    const [countResult] = await db
      .select({ total: count() })
      .from(contacts)
      .where(eq(contacts.company_id, companyId));
    
    const total = countResult?.total || 0;

    // Get paginated data
    const data = await db
      .select()
      .from(contacts)
      .where(eq(contacts.company_id, companyId))
      .orderBy(
        params.sortOrder === 'asc' 
          ? asc(contacts.name) 
          : desc(contacts.name)
      )
      .limit(params.limit)
      .offset(params.offset);

    res.json(createPaginatedResponse(data, total, params));
  } catch (error) {
    console.error("Error fetching contacts:", error);
    serverError(res, "Failed to fetch contacts");
  }
});

/**
 * @swagger
 * /api/v2/items:
 *   get:
 *     summary: Get paginated items (products/services)
 *     tags: [API v2]
 */
router.get("/items", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const params = parsePaginationParams(req, 'items');

    const [countResult] = await db
      .select({ total: count() })
      .from(items)
      .where(eq(items.company_id, companyId));
    
    const total = countResult?.total || 0;

    const data = await db
      .select()
      .from(items)
      .where(eq(items.company_id, companyId))
      .orderBy(
        params.sortOrder === 'asc' 
          ? asc(items.name) 
          : desc(items.name)
      )
      .limit(params.limit)
      .offset(params.offset);

    res.json(createPaginatedResponse(data, total, params));
  } catch (error) {
    console.error("Error fetching items:", error);
    serverError(res, "Failed to fetch items");
  }
});

/**
 * @swagger
 * /api/v2/invoices:
 *   get:
 *     summary: Get paginated sales invoices
 *     tags: [API v2]
 */
router.get("/invoices", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const params = parsePaginationParams(req, 'invoices');

    const [countResult] = await db
      .select({ total: count() })
      .from(sales_invoices)
      .where(eq(sales_invoices.company_id, companyId));
    
    const total = countResult?.total || 0;

    const data = await db
      .select()
      .from(sales_invoices)
      .where(eq(sales_invoices.company_id, companyId))
      .orderBy(desc(sales_invoices.date))
      .limit(params.limit)
      .offset(params.offset);

    res.json(createPaginatedResponse(data, total, params));
  } catch (error) {
    console.error("Error fetching invoices:", error);
    serverError(res, "Failed to fetch invoices");
  }
});

/**
 * @swagger
 * /api/v2/bills:
 *   get:
 *     summary: Get paginated purchase bills
 *     tags: [API v2]
 */
router.get("/bills", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const params = parsePaginationParams(req, 'bills');

    const [countResult] = await db
      .select({ total: count() })
      .from(bills)
      .where(eq(bills.company_id, companyId));
    
    const total = countResult?.total || 0;

    const data = await db
      .select()
      .from(bills)
      .where(eq(bills.company_id, companyId))
      .orderBy(desc(bills.date))
      .limit(params.limit)
      .offset(params.offset);

    res.json(createPaginatedResponse(data, total, params));
  } catch (error) {
    console.error("Error fetching bills:", error);
    serverError(res, "Failed to fetch bills");
  }
});

/**
 * API Health check with version info
 */
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
});

export default router;
