import { Router } from "express";
import { db } from "../db";
import { expenses } from "@shared/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/authMiddleware";
import { serverError } from "../utils/sendError";

const router = Router();

// Get ESG Summary
router.get("/summary", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { year } = req.query;
    
    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

    // Calculate total carbon footprint
    // Formula: Sum(quantity * carbon_factor)
    // If quantity is missing, we can't calculate accurately, but maybe we can estimate from amount?
    // For now, let's stick to explicit ESG data.
    
    const emissions = await db.select({
      category: expenses.category,
      total_co2: sql<number>`SUM(COALESCE(${expenses.quantity}, 0) * COALESCE(${expenses.carbon_factor}, 0))`,
      total_spend: sql<number>`SUM(${expenses.amount})`,
      count: sql<number>`COUNT(*)`
    })
    .from(expenses)
    .where(and(
      eq(expenses.company_id, companyId),
      gte(expenses.date, startDate),
      lte(expenses.date, endDate),
      sql`${expenses.carbon_factor} IS NOT NULL`
    ))
    .groupBy(expenses.category)
    .orderBy(desc(sql`SUM(COALESCE(${expenses.quantity}, 0) * COALESCE(${expenses.carbon_factor}, 0))`));

    const totalFootprint = emissions.reduce((sum, row) => sum + Number(row.total_co2), 0);

    // Monthly Trend
    const monthlyTrend = await db.select({
      month: sql<string>`to_char(${expenses.date}, 'YYYY-MM')`,
      total_co2: sql<number>`SUM(COALESCE(${expenses.quantity}, 0) * COALESCE(${expenses.carbon_factor}, 0))`
    })
    .from(expenses)
    .where(and(
      eq(expenses.company_id, companyId),
      gte(expenses.date, startDate),
      lte(expenses.date, endDate),
      sql`${expenses.carbon_factor} IS NOT NULL`
    ))
    .groupBy(sql`to_char(${expenses.date}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${expenses.date}, 'YYYY-MM')`);

    res.json({
      year: currentYear,
      total_co2_kg: totalFootprint,
      by_category: emissions,
      trend: monthlyTrend
    });

  } catch (error) {
    console.error("Error fetching ESG summary:", error);
    serverError(res, "Failed to fetch ESG summary");
  }
});

export default router;
