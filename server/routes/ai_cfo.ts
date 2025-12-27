import { Router } from "express";
import { db } from "../db";
import { payments, receipts } from "@shared/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/authMiddleware";
import { serverError } from "../utils/sendError";

const router = Router();

// Helper to calculate linear regression
function calculateTrend(data: number[]) {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0] || 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumXX += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

router.get("/forecast/cashflow", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    
    // 1. Fetch historical data (last 12 months)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11); // Last 12 months including current
    startDate.setDate(1); // Start of month

    // Fetch Receipts (Cash In)
    const receiptsData = await db.select({
      month: sql<string>`to_char(${receipts.date}, 'YYYY-MM')`,
      total: sql<number>`sum(${receipts.amount})`
    })
    .from(receipts)
    .where(and(
      eq(receipts.company_id, companyId),
      gte(receipts.date, startDate),
      lte(receipts.date, endDate)
    ))
    .groupBy(sql`to_char(${receipts.date}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${receipts.date}, 'YYYY-MM')`);

    // Fetch Payments (Cash Out)
    const paymentsData = await db.select({
      month: sql<string>`to_char(${payments.date}, 'YYYY-MM')`,
      total: sql<number>`sum(${payments.amount})`
    })
    .from(payments)
    .where(and(
      eq(payments.company_id, companyId),
      gte(payments.date, startDate),
      lte(payments.date, endDate)
    ))
    .groupBy(sql`to_char(${payments.date}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${payments.date}, 'YYYY-MM')`);

    // Merge and fill missing months
    const history = [];
    const months = [];
    const cashInArr = [];
    const cashOutArr = [];
    const netArr = [];

    let current = new Date(startDate);
    while (current <= endDate) {
      const monthStr = current.toISOString().slice(0, 7); // YYYY-MM
      months.push(monthStr);

      const inVal = parseFloat(receiptsData.find(r => r.month === monthStr)?.total?.toString() || '0');
      const outVal = parseFloat(paymentsData.find(p => p.month === monthStr)?.total?.toString() || '0');
      
      history.push({
        month: monthStr,
        cashIn: inVal,
        cashOut: outVal,
        net: inVal - outVal
      });

      cashInArr.push(inVal);
      cashOutArr.push(outVal);
      netArr.push(inVal - outVal);

      current.setMonth(current.getMonth() + 1);
    }

    // 2. Generate Forecast (Next 6 months)
    const forecast = [];
    const trendIn = calculateTrend(cashInArr);
    const trendOut = calculateTrend(cashOutArr);

    // Start prediction from next month
    const lastIndex = cashInArr.length - 1;
    
    for (let i = 1; i <= 6; i++) {
      const nextIndex = lastIndex + i;
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + i);
      const monthStr = nextDate.toISOString().slice(0, 7);

      const predIn = Math.max(0, trendIn.slope * nextIndex + trendIn.intercept);
      const predOut = Math.max(0, trendOut.slope * nextIndex + trendOut.intercept);

      forecast.push({
        month: monthStr,
        cashIn: predIn,
        cashOut: predOut,
        net: predIn - predOut
      });
    }

    // 3. Generate Insights (Simple rule-based for now, can be upgraded to LLM)
    const insights = [];
    const avgNet = netArr.reduce((a, b) => a + b, 0) / netArr.length;
    const lastNet = netArr[netArr.length - 1];

    if (lastNet < 0) {
      insights.push("Warning: Negative cash flow in the last month.");
    }
    if (trendOut.slope > trendIn.slope) {
      insights.push("Alert: Expenses are growing faster than revenue.");
    }
    if (avgNet > 0 && lastNet < avgNet * 0.5) {
      insights.push("Notice: Recent cash flow is significantly lower than average.");
    }

    res.json({
      history,
      forecast,
      insights
    });

  } catch (error) {
    console.error("Error generating cash flow forecast:", error);
    serverError(res, "Failed to generate forecast");
  }
});

export default router;
