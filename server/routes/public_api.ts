import { Router } from "express";
import { db } from "../db";
import { journals, sales_invoices } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { apiKeyAuth, requireScope } from "../middleware/apiKeyAuth";
import { apiLimiter } from "../middleware/rateLimiter";

const router = Router();

// Apply API Key Auth and Rate Limiting to all routes
router.use(apiKeyAuth);
router.use(apiLimiter);

// GET /v1/journals
router.get("/journals", requireScope("read:journals"), async (req, res) => {
  try {
    const companyId = (req as any).companyId;
    const data = await db.query.journals.findMany({
      where: eq(journals.company_id, companyId),
      orderBy: [desc(journals.date)],
      limit: 100 // Default limit
    });
    res.json({ data });
  } catch (error) {
    console.error("Public API Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /v1/invoices
router.get("/invoices", requireScope("read:invoices"), async (req, res) => {
  try {
    const companyId = (req as any).companyId;
    const data = await db.query.sales_invoices.findMany({
      where: eq(sales_invoices.company_id, companyId),
      orderBy: [desc(sales_invoices.date)],
      limit: 100
    });
    res.json({ data });
  } catch (error) {
    console.error("Public API Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
