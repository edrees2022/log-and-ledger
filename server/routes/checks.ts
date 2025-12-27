import { Router } from "express";
import { db } from "../db";
import { checks, insertCheckSchema, bank_accounts } from "@shared/schema";
import { eq, and, desc, getTableColumns } from "drizzle-orm";
import { requireAuth } from "../middleware/authMiddleware";
import { z } from "zod";
import { badRequest, notFound, serverError } from "../utils/sendError";
import { logCreate, logUpdate } from "../utils/auditLog";

const router = Router();

// List checks
router.get("/", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { type, status } = req.query;
    
    const conditions = [eq(checks.company_id, companyId)];
    
    if (type) {
      conditions.push(eq(checks.type, type as string));
    }
    if (status) {
      conditions.push(eq(checks.status, status as string));
    }
    
    const results = await db
      .select({
        ...getTableColumns(checks),
        bank_name: bank_accounts.bank_name,
        currency: bank_accounts.currency
      })
      .from(checks)
      .leftJoin(bank_accounts, eq(checks.bank_account_id, bank_accounts.id))
      .where(and(...conditions))
      .orderBy(desc(checks.issue_date));
    
    res.json(results);
  } catch (error: any) {
    console.error("Error fetching checks:", error);
    return serverError(res, "Failed to fetch checks");
  }
});

// Create check
router.post("/", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const data = insertCheckSchema.parse(req.body);
    
    const [newCheck] = await db
      .insert(checks)
      .values({ ...data, company_id: companyId })
      .returning();

    await logCreate({
      companyId,
      entityType: 'checks',
      entityId: newCheck.id,
      createdData: newCheck,
      actorId: (req as any).session.userId,
      actorName: (req as any).session.userName,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json(newCheck);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return badRequest(res, error.message);
    }
    console.error("Error creating check:", error);
    return serverError(res, "Failed to create check");
  }
});

// Update check status (lifecycle management)
router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { id } = req.params;
    const { status } = req.body;

    if (!['on_hand', 'deposited', 'cleared', 'bounced', 'returned', 'cancelled'].includes(status)) {
      return badRequest(res, "Invalid status");
    }

    const [existing] = await db
      .select()
      .from(checks)
      .where(and(eq(checks.id, id), eq(checks.company_id, companyId)));

    if (!existing) return notFound(res, "Check not found");

    const [updated] = await db
      .update(checks)
      .set({ status, updated_at: new Date() })
      .where(eq(checks.id, id))
      .returning();

    await logUpdate({
      companyId,
      entityType: 'checks',
      entityId: id,
      oldData: existing,
      newData: updated,
      actorId: (req as any).session.userId,
      actorName: (req as any).session.userName,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json(updated);
  } catch (error: any) {
    console.error("Error updating check status:", error);
    return serverError(res, "Failed to update check status");
  }
});

export default router;
