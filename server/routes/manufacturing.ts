import { Router } from "express";
import { db } from "../db";
import { 
  manufacturing_boms, manufacturing_bom_items, production_orders, items, stock_movements,
  insertManufacturingBomSchema, insertManufacturingBomItemSchema, insertProductionOrderSchema,
  batches
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/authMiddleware";
import { z } from "zod";
import { badRequest, notFound, serverError } from "../utils/sendError";

const router = Router();

// === BOMs ===
router.get("/boms", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const results = await db.select().from(manufacturing_boms).where(eq(manufacturing_boms.company_id, companyId));
    res.json(results);
  } catch (error: any) {
    return serverError(res, "Failed to fetch BOMs");
  }
});

router.post("/boms", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { items, ...bomData } = req.body;
    
    const validatedBom = insertManufacturingBomSchema.parse(bomData);
    
    // Transactional insert
    const result = await db.transaction(async (tx) => {
      const [newBom] = await tx.insert(manufacturing_boms).values({ ...validatedBom, company_id: companyId }).returning();
      
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const validatedItem = insertManufacturingBomItemSchema.parse({ ...item, bom_id: newBom.id });
          await tx.insert(manufacturing_bom_items).values(validatedItem);
        }
      }
      return newBom;
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error("BOM creation error:", error);
    return serverError(res, "Failed to create BOM");
  }
});

// === PRODUCTION ORDERS ===
router.post("/orders", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const data = insertProductionOrderSchema.parse(req.body);
    const [order] = await db.insert(production_orders).values({ ...data, company_id: companyId }).returning();
    res.status(201).json(order);
  } catch (error: any) {
    return serverError(res, "Failed to create production order");
  }
});

// List Production Orders
router.get("/orders", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const results = await db.select()
      .from(production_orders)
      .where(eq(production_orders.company_id, companyId))
      .orderBy(desc(production_orders.created_at));
    res.json(results);
  } catch (error: any) {
    return serverError(res, "Failed to fetch production orders");
  }
});

// Update Production Order
router.patch("/orders/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    const data = req.body;
    
    const [updated] = await db
      .update(production_orders)
      .set({ ...data, updated_at: new Date() })
      .where(and(eq(production_orders.id, id), eq(production_orders.company_id, companyId)))
      .returning();
      
    if (!updated) return notFound(res, "Order not found");
    res.json(updated);
  } catch (error: any) {
    return serverError(res, "Failed to update order");
  }
});

// Complete Production Order (Execute Manufacturing)
router.post("/orders/:id/complete", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    const userId = (req as any).user.id;
    const { batch_number, expiry_date } = req.body;

    // 1. Get Order
    const [order] = await db.select()
      .from(production_orders)
      .where(and(eq(production_orders.id, id), eq(production_orders.company_id, companyId)));

    if (!order) return notFound(res, "Order not found");
    if (order.status === "completed") return badRequest(res, "Order already completed");

    // 2. Get BOM Items (Raw Materials)
    if (!order.bom_id) return badRequest(res, "Order has no BOM linked");
    
    const bomItems = await db.select()
      .from(manufacturing_bom_items)
      .where(eq(manufacturing_bom_items.bom_id, order.bom_id));

    await db.transaction(async (tx) => {
      // 3. Deduct Raw Materials
      for (const item of bomItems) {
        const qtyNeeded = Number(item.quantity) * Number(order.quantity);
        
        // Create Stock Movement (OUT)
        await tx.insert(stock_movements).values({
          company_id: companyId,
          item_id: item.item_id,
          warehouse_id: order.warehouse_id || "default", // Fallback needs handling
          transaction_type: "manufacturing_out",
          transaction_date: new Date(),
          quantity: (-qtyNeeded).toString(),
          unit_cost: "0", // TODO: Implement costing
          total_cost: "0",
          reference_type: "production_order",
          reference_id: order.id,
          created_by: userId,
        });
      }

      // 4. Create Batch if provided
      let batchId: string | undefined;
      if (batch_number) {
        const [newBatch] = await tx.insert(batches).values({
          company_id: companyId,
          item_id: order.item_id,
          batch_number: batch_number,
          expiry_date: expiry_date ? new Date(expiry_date) : null,
          quantity: order.quantity.toString(),
          warehouse_id: order.warehouse_id,
          manufacturing_date: new Date(),
        }).returning();
        batchId = newBatch.id;
      }

      // 5. Add Finished Good
      await tx.insert(stock_movements).values({
        company_id: companyId,
        item_id: order.item_id,
        warehouse_id: order.warehouse_id || "default",
        transaction_type: "manufacturing_in",
        transaction_date: new Date(),
        quantity: order.quantity.toString(),
        unit_cost: "0", // TODO: Calculate from BOM cost
        total_cost: "0",
        reference_type: "production_order",
        reference_id: order.id,
        batch_id: batchId,
        created_by: userId,
      });

      // 6. Update Order Status
      await tx.update(production_orders)
        .set({ 
          status: "completed", 
          updated_at: new Date(),
          output_batch_number: batch_number,
          output_expiry_date: expiry_date ? new Date(expiry_date) : null
        })
        .where(eq(production_orders.id, id));
    });

    res.json({ message: "Production completed successfully" });
  } catch (error: any) {
    console.error("Production completion error:", error);
    return serverError(res, "Failed to complete production");
  }
});

export default router;
