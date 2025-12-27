import { Router } from "express";
import { db } from "../db";
import { budgets, accounts, insertBudgetSchema } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requirePermission } from "../middleware/permissions";
import { requireAuth } from "../middleware/authMiddleware";
import { badRequest, notFound, serverError } from '../utils/sendError';
import { normalize } from "../utils/sanitize";
import { getBudgetVsActual } from "../utils/budget";
import { fromZodError } from "zod-validation-error";
import { logCreate, logUpdate, logDelete } from "../utils/auditLog";

const router = Router();

// Get Budgets with account details
router.get("/", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { fiscalYear } = req.query;
    
    const conditions = [eq(budgets.company_id, companyId)];
    
    if (fiscalYear) {
      conditions.push(eq(budgets.fiscal_year, parseInt(fiscalYear as string)));
    }

    const result = await db.query.budgets.findMany({
      where: and(...conditions),
      with: {
        account: true
      },
      orderBy: [desc(budgets.fiscal_year)]
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    serverError(res, "Failed to fetch budgets");
  }
});

// Create/Update Budget with monthly breakdown
router.post("/", requireAuth, requirePermission('accounting', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const body = normalize(req.body);
    
    // Calculate total from monthly values if provided
    const monthlyFields = ['january', 'february', 'march', 'april', 'may', 'june', 
                          'july', 'august', 'september', 'october', 'november', 'december'];
    
    let calculatedTotal = 0;
    monthlyFields.forEach(month => {
      if (body[month]) {
        calculatedTotal += parseFloat(body[month]) || 0;
      }
    });
    
    // Use calculated total if monthly values provided, otherwise use provided total
    const total = calculatedTotal > 0 ? calculatedTotal.toString() : (body.total || '0');
    
    const validatedData = insertBudgetSchema.parse({
      ...body,
      company_id: companyId,
      total,
      budget_name: body.budget_name || `Budget ${body.fiscal_year}`,
      period_type: body.period_type || 'yearly'
    });

    // Check if budget exists for this account and year
    const existing = await db.select().from(budgets).where(and(
      eq(budgets.company_id, companyId),
      eq(budgets.account_id, validatedData.account_id),
      eq(budgets.fiscal_year, validatedData.fiscal_year)
    ));

    let budget;
    if (existing.length > 0) {
      // Update
      [budget] = await db.update(budgets)
        .set({ ...validatedData, updated_at: new Date() })
        .where(eq(budgets.id, existing[0].id))
        .returning();
      
      await logUpdate({
        companyId,
        entityType: 'budget',
        entityId: budget.id,
        oldData: existing[0],
        newData: validatedData,
        actorId: userId,
        actorName: (req as any).session?.userName || 'User',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    } else {
      // Insert
      [budget] = await db.insert(budgets).values({
        ...validatedData,
        created_by: userId
      }).returning();
      
      await logCreate({
        companyId,
        entityType: 'budget',
        entityId: budget.id,
        createdData: { account_id: budget.account_id, fiscal_year: budget.fiscal_year, total: budget.total },
        actorId: userId,
        actorName: (req as any).session?.userName || 'User',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }

    res.status(201).json(budget);
  } catch (error: any) {
    console.error("Error saving budget:", error);
    if (error.name === "ZodError") {
      return badRequest(res, fromZodError(error).message);
    }
    serverError(res, "Failed to save budget");
  }
});

// Budget vs Actual Report
router.get("/vs-actual", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { fiscalYear, period } = req.query;

    if (!fiscalYear) {
      return badRequest(res, "fiscalYear is required");
    }

    const report = await getBudgetVsActual(
      companyId, 
      parseInt(fiscalYear as string),
      period ? parseInt(period as string) : undefined
    );

    res.json(report);
  } catch (error) {
    console.error("Error generating budget report:", error);
    serverError(res, "Failed to generate budget report");
  }
});

// Copy Budget from one year to another
router.post("/copy", requireAuth, requirePermission('accounting', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const { fromYear, toYear, adjustmentPercent = 0 } = req.body;

    if (!fromYear || !toYear) {
      return badRequest(res, "fromYear and toYear are required");
    }

    if (fromYear === toYear) {
      return badRequest(res, "Source and target year must be different");
    }

    // Get source year budgets
    const sourceBudgets = await db.select().from(budgets).where(and(
      eq(budgets.company_id, companyId),
      eq(budgets.fiscal_year, parseInt(fromYear))
    ));

    if (sourceBudgets.length === 0) {
      return notFound(res, "No budgets found for source year");
    }

    // Check if target year already has budgets
    const existingTarget = await db.select().from(budgets).where(and(
      eq(budgets.company_id, companyId),
      eq(budgets.fiscal_year, parseInt(toYear))
    ));

    if (existingTarget.length > 0) {
      return badRequest(res, "Target year already has budgets. Delete them first.");
    }

    const adjustment = 1 + (parseFloat(adjustmentPercent) / 100);
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                    'july', 'august', 'september', 'october', 'november', 'december'] as const;

    const newBudgets = [];
    for (const source of sourceBudgets) {
      const newBudget: any = {
        company_id: companyId,
        budget_name: source.budget_name?.replace(fromYear, toYear) || `Budget ${toYear}`,
        fiscal_year: parseInt(toYear),
        account_id: source.account_id,
        period_type: source.period_type,
        created_by: userId
      };

      // Apply adjustment to each month
      let total = 0;
      for (const month of months) {
        const sourceValue = parseFloat(source[month]?.toString() || '0');
        const adjustedValue = (sourceValue * adjustment).toFixed(2);
        newBudget[month] = adjustedValue;
        total += parseFloat(adjustedValue);
      }
      newBudget.total = total.toFixed(2);

      const [inserted] = await db.insert(budgets).values(newBudget).returning();
      newBudgets.push(inserted);
    }

    await logCreate({
      companyId,
      entityType: 'budget',
      entityId: 'bulk-copy',
      createdData: { fromYear, toYear, adjustmentPercent, count: newBudgets.length },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ 
      success: true, 
      message: `Copied ${newBudgets.length} budgets from ${fromYear} to ${toYear}`,
      count: newBudgets.length 
    });
  } catch (error) {
    console.error("Error copying budgets:", error);
    serverError(res, "Failed to copy budgets");
  }
});

// Delete Budget
router.delete("/:id", requireAuth, requirePermission('accounting', 'delete'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const { id } = req.params;

    const existing = await db.select().from(budgets).where(and(
      eq(budgets.id, id),
      eq(budgets.company_id, companyId)
    ));

    if (existing.length === 0) {
      return notFound(res, "Budget not found");
    }

    await db.delete(budgets).where(eq(budgets.id, id));

    await logDelete({
      companyId,
      entityType: 'budget',
      entityId: id,
      deletedData: existing[0],
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting budget:", error);
    serverError(res, "Failed to delete budget");
  }
});

export default router;
