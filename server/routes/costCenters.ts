import { Router } from "express";
import { db } from "../db";
import { cost_centers, insertCostCenterSchema } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middleware/authMiddleware";
import { z } from "zod";
import { badRequest, notFound, serverError } from "../utils/sendError";
import { logCreate, logUpdate, logDelete } from "../utils/auditLog";

const router = Router();

// List all cost centers
router.get("/", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const allCostCenters = await db
      .select()
      .from(cost_centers)
      .where(and(eq(cost_centers.company_id, companyId), eq(cost_centers.is_active, true)));
    res.json(allCostCenters);
  } catch (error: any) {
    console.error("Error fetching cost centers:", error);
    return serverError(res, "Failed to fetch cost centers");
  }
});

// Create cost center
router.post("/", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const data = insertCostCenterSchema.parse(req.body);
    
    const [newCostCenter] = await db
      .insert(cost_centers)
      .values({ ...data, company_id: companyId })
      .returning();

    await logCreate({
      companyId,
      entityType: 'cost_centers',
      entityId: newCostCenter.id,
      createdData: newCostCenter,
      actorId: (req as any).session.userId,
      actorName: (req as any).session.userName,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json(newCostCenter);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return badRequest(res, error.message);
    }
    console.error("Error creating cost center:", error);
    return serverError(res, "Failed to create cost center");
  }
});

// Update cost center
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { id } = req.params;
    const data = insertCostCenterSchema.partial().parse(req.body);

    const [existing] = await db
      .select()
      .from(cost_centers)
      .where(and(eq(cost_centers.id, id), eq(cost_centers.company_id, companyId)));

    if (!existing) return notFound(res, "Cost center not found");

    const [updated] = await db
      .update(cost_centers)
      .set({ ...data, updated_at: new Date() })
      .where(eq(cost_centers.id, id))
      .returning();

    await logUpdate({
      companyId,
      entityType: 'cost_centers',
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
    console.error("Error updating cost center:", error);
    return serverError(res, "Failed to update cost center");
  }
});

// Delete cost center (soft delete)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { id } = req.params;

    const [existing] = await db
      .select()
      .from(cost_centers)
      .where(and(eq(cost_centers.id, id), eq(cost_centers.company_id, companyId)));

    if (!existing) return notFound(res, "Cost center not found");

    const [deleted] = await db
      .update(cost_centers)
      .set({ is_active: false, updated_at: new Date() })
      .where(eq(cost_centers.id, id))
      .returning();

    await logDelete({
      companyId,
      entityType: 'cost_centers',
      entityId: id,
      deletedData: existing,
      actorId: (req as any).session.userId,
      actorName: (req as any).session.userName,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting cost center:", error);
    return serverError(res, "Failed to delete cost center");
  }
});

export default router;
