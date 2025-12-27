import { Router } from "express";
import { db } from "../db";
import { stock_movements, items, warehouses, insertStockMovementSchema, insertWarehouseSchema, stock_transfers, stock_transfer_items, batches, sales_invoices, bills, document_lines, inventory_serials, inventory_batches } from "@shared/schema";
import { eq, and, desc, sql, isNull, ne } from "drizzle-orm";
import { requirePermission } from "../middleware/permissions";
import { requireAuth } from "../middleware/authMiddleware";
import { badRequest, notFound, serverError } from '../utils/sendError';
import { normalize } from "../utils/sanitize";
import { recordStockMovement, getStockLevels, getItemStockHistory, calculateStockValue } from "../utils/inventory";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";
import { logCreate, logUpdate, logDelete } from "../utils/auditLog";

const router = Router();

// === WAREHOUSES ===

router.get("/warehouses", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const result = await db.select().from(warehouses)
      .where(eq(warehouses.company_id, companyId))
      .orderBy(warehouses.name);
    res.json(result);
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    serverError(res, "Failed to fetch warehouses");
  }
});

router.post("/warehouses", requireAuth, requirePermission('settings', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const body = normalize(req.body);
    
    // Build warehouse data - only include fields that exist
    const warehouseData: any = {
      company_id: companyId,
      code: body.code,
      name: body.name,
      is_active: body.is_active !== undefined ? body.is_active : true
    };
    
    // Only add location if provided (column may not exist in older DBs)
    if (body.location !== undefined && body.location !== '') {
      warehouseData.location = body.location;
    }

    const [warehouse] = await db.insert(warehouses).values(warehouseData).returning();
    
    // Audit log
    const userId = (req as any).session.userId;
    await logCreate({
      companyId,
      entityType: 'warehouse',
      entityId: warehouse.id,
      createdData: { name: warehouse.name, code: warehouse.code },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json(warehouse);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return badRequest(res, fromZodError(error).message);
    }
    serverError(res, "Failed to create warehouse");
  }
});

router.put("/warehouses/:id", requireAuth, requirePermission('settings', 'edit'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { id } = req.params;
    const body = normalize(req.body);

    // Check if warehouse exists and belongs to company
    const [existing] = await db.select().from(warehouses)
      .where(and(eq(warehouses.id, id), eq(warehouses.company_id, companyId)));
    
    if (!existing) {
      return notFound(res, "Warehouse not found");
    }

    const updateData = {
      code: body.code || existing.code,
      name: body.name || existing.name,
      location: body.location,
      is_active: body.is_active !== undefined ? body.is_active : existing.is_active,
      updated_at: new Date()
    };

    const [updated] = await db.update(warehouses)
      .set(updateData)
      .where(and(eq(warehouses.id, id), eq(warehouses.company_id, companyId)))
      .returning();

    // Audit log
    const userId = (req as any).session.userId;
    await logUpdate({
      companyId,
      entityType: 'warehouse',
      entityId: id,
      oldData: { name: existing.name, code: existing.code, is_active: existing.is_active },
      newData: { name: updated.name, code: updated.code, is_active: updated.is_active },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json(updated);
  } catch (error: any) {
    console.error("Error updating warehouse:", error);
    serverError(res, "Failed to update warehouse");
  }
});

// === INVENTORY ===

// Get stock movements (filtered)
router.get("/movements", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { type, limit = "50" } = req.query;

    const conditions = [eq(stock_movements.company_id, companyId)];
    
    if (type === 'in') {
      // Filter for incoming movements (purchase, manufacturing_in, transfer_in)
      conditions.push(sql`${stock_movements.transaction_type} IN ('purchase', 'manufacturing_in')`);
    } else if (type === 'adjustment') {
      // Filter for manual adjustments
      conditions.push(sql`(${stock_movements.transaction_type} = 'adjustment' OR ${stock_movements.reference_type} = 'manual_adjustment')`);
    } else if (type === 'sale') {
      conditions.push(sql`${stock_movements.transaction_type} = 'sale'`);
    } else if (type === 'transfer') {
      conditions.push(sql`${stock_movements.transaction_type} IN ('transfer_in', 'transfer_out')`);
    }

    const movements = await db.query.stock_movements.findMany({
      where: and(...conditions),
      orderBy: [desc(stock_movements.transaction_date)],
      limit: parseInt(limit as string),
      with: {
        item: true,
        warehouse: true
      }
    });

    res.json(movements);
  } catch (error) {
    console.error("Error fetching movements:", error);
    serverError(res, "Failed to fetch movements");
  }
});

// Get batches for an item
router.get("/batches/:itemId", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { itemId } = req.params;
    const { warehouseId } = req.query;

    // If warehouseId is provided, we might want to filter batches that have stock in that warehouse
    // For now, let's just return all batches for the item
    const itemBatches = await db.select().from(batches)
      .where(and(
        eq(batches.company_id, companyId),
        eq(batches.item_id, itemId)
      ))
      .orderBy(desc(batches.expiry_date));

    res.json(itemBatches);
  } catch (error) {
    console.error("Error fetching batches:", error);
    serverError(res, "Failed to fetch batches");
  }
});

// Get stock levels for all items
router.get("/levels", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const levels = await getStockLevels(companyId);
    
    // Enrich with item details
    const enrichedLevels = await Promise.all(levels.map(async (level) => {
      const [item] = await db.select().from(items).where(eq(items.id, level.item_id));
      const [warehouse] = await db.select().from(warehouses).where(eq(warehouses.id, level.warehouse_id));
      
      const totalIn = parseFloat(level.total_in?.toString() || '0');
      const totalOut = parseFloat(level.total_out?.toString() || '0');
      
      return {
        ...level,
        itemName: item?.name,
        itemCode: item?.sku,
        warehouseName: warehouse?.name,
        currentQuantity: totalIn - totalOut
      };
    }));

    res.json(enrichedLevels);
  } catch (error) {
    console.error("Error fetching stock levels:", error);
    serverError(res, "Failed to fetch stock levels");
  }
});

// Get stock history for an item
router.get("/items/:id/history", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const itemId = req.params.id;
    console.log("Fetching history for item:", itemId, "company:", companyId);
    
    const history = await getItemStockHistory(companyId, itemId);
    console.log("History found:", history.length, "records");
    
    res.json(history);
  } catch (error: any) {
    console.error("Error fetching history:", error);
    serverError(res, "Failed to fetch stock history: " + error.message);
  }
});

// Get valuation for an item
router.get("/items/:id/valuation", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { warehouseId } = req.query;
    
    const valuation = await calculateStockValue(
      companyId, 
      req.params.id, 
      warehouseId as string
    );
    
    res.json(valuation);
  } catch (error) {
    serverError(res, "Failed to calculate valuation");
  }
});

// Get valuation for all items
router.get("/valuation", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { warehouseId } = req.query;

    // Get all inventory/product type items (safe query that works before migration)
    const allItems = await db.select().from(items)
      .where(and(
        eq(items.company_id, companyId),
        sql`${items.type} IN ('product', 'inventory')`
      ));

    const valuationReport = await Promise.all(allItems.map(async (item) => {
      const valuation = await calculateStockValue(
        companyId,
        item.id,
        warehouseId as string
      );
      
      return {
        itemId: item.id,
        itemCode: item.sku,
        itemName: item.name,
        quantity: valuation.quantity,
        averageCost: valuation.average_cost,
        totalValue: valuation.value
      };
    }));

    // Filter out items with zero quantity unless they have value
    const filteredReport = valuationReport.filter(item => item.quantity > 0 || item.totalValue > 0);

    res.json(filteredReport);
  } catch (error) {
    console.error("Error fetching valuation report:", error);
    serverError(res, "Failed to fetch valuation report");
  }
});

// Create manual adjustment
router.post("/adjustments", requireAuth, requirePermission('items', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const body = normalize(req.body);

    // Validate input manually first or use schema partial
    if (!body.item_id || !body.warehouse_id || !body.quantity || !body.transaction_type) {
      return badRequest(res, "Missing required fields");
    }

    await recordStockMovement({
      company_id: companyId,
      item_id: body.item_id,
      warehouse_id: body.warehouse_id,
      transaction_type: body.transaction_type, // adjustment, transfer_in, transfer_out
      transaction_date: new Date(body.date || new Date()),
      quantity: parseFloat(body.quantity),
      unit_cost: parseFloat(body.unit_cost || '0'),
      notes: body.notes,
      reference_type: 'manual_adjustment',
      created_by: userId
    });

    // Audit log
    await logCreate({
      companyId,
      entityType: 'stock_movement',
      entityId: body.item_id,
      createdData: { item_id: body.item_id, warehouse_id: body.warehouse_id, quantity: body.quantity, type: body.transaction_type },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: "Stock adjustment recorded successfully" });
  } catch (error: any) {
    console.error("Error recording adjustment:", error);
    serverError(res, "Failed to record adjustment");
  }
});

// Update manual adjustment
router.put("/adjustments/:id", requireAuth, requirePermission('items', 'edit'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const { id } = req.params;
    const body = normalize(req.body);

    // Check if movement exists and belongs to this company
    const existing = await db.query.stock_movements.findFirst({
      where: and(
        eq(stock_movements.id, id),
        eq(stock_movements.company_id, companyId)
      )
    });

    if (!existing) {
      return notFound(res, "Adjustment not found");
    }

    // Only allow editing manual adjustments
    if (existing.reference_type !== 'manual_adjustment') {
      return badRequest(res, "Only manual adjustments can be edited");
    }

    // Get the old values for audit
    const oldData = { ...existing };

    // Update the movement
    const updateData: any = {};
    if (body.item_id) updateData.item_id = body.item_id;
    if (body.warehouse_id) updateData.warehouse_id = body.warehouse_id;
    if (body.quantity !== undefined) {
      updateData.quantity = String(body.quantity);
      updateData.total_cost = String(parseFloat(body.quantity) * parseFloat(body.unit_cost || existing.unit_cost || '0'));
    }
    if (body.unit_cost !== undefined) {
      updateData.unit_cost = String(body.unit_cost);
      updateData.total_cost = String(parseFloat(body.quantity || existing.quantity || '0') * parseFloat(body.unit_cost));
    }
    if (body.date) updateData.transaction_date = new Date(body.date);
    if (body.notes !== undefined) updateData.notes = body.notes;

    await db.update(stock_movements)
      .set(updateData)
      .where(eq(stock_movements.id, id));

    // Audit log
    await logUpdate({
      companyId,
      entityType: 'stock_movement',
      entityId: id,
      oldData: oldData,
      newData: updateData,
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: "Adjustment updated successfully" });
  } catch (error: any) {
    console.error("Error updating adjustment:", error);
    serverError(res, "Failed to update adjustment");
  }
});

// Delete manual adjustment
router.delete("/adjustments/:id", requireAuth, requirePermission('items', 'delete'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const { id } = req.params;

    // Check if movement exists and belongs to this company
    const existing = await db.query.stock_movements.findFirst({
      where: and(
        eq(stock_movements.id, id),
        eq(stock_movements.company_id, companyId)
      )
    });

    if (!existing) {
      return notFound(res, "Adjustment not found");
    }

    // Only allow deleting manual adjustments
    if (existing.reference_type !== 'manual_adjustment') {
      return badRequest(res, "Only manual adjustments can be deleted");
    }

    // Delete the movement
    await db.delete(stock_movements).where(eq(stock_movements.id, id));

    // Audit log
    await logDelete({
      companyId,
      entityType: 'stock_movement',
      entityId: id,
      deletedData: existing,
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: "Adjustment deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting adjustment:", error);
    serverError(res, "Failed to delete adjustment");
  }
});

// === STOCK TRANSFERS ===

// List transfers
router.get("/transfers", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const transfers = await db.query.stock_transfers.findMany({
      where: eq(stock_transfers.company_id, companyId),
      orderBy: [desc(stock_transfers.date)],
      with: {
        from_warehouse: true,
        to_warehouse: true,
        items: {
          with: {
            item: true,
            batch: true
          }
        }
      }
    });
    res.json(transfers);
  } catch (error) {
    console.error("Error fetching transfers:", error);
    serverError(res, "Failed to fetch transfers");
  }
});

// Create transfer
router.post("/transfers", requireAuth, requirePermission('items', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    
    const schema = z.object({
      transfer_number: z.string(),
      from_warehouse_id: z.string(),
      to_warehouse_id: z.string(),
      date: z.string().transform(str => new Date(str)),
      notes: z.string().optional(),
      items: z.array(z.object({
        item_id: z.string(),
        batch_id: z.string().optional(),
        quantity: z.number()
      }))
    });

    const result = schema.safeParse(req.body);
    if (!result.success) return badRequest(res, fromZodError(result.error).message);

    const { items: transferItems, ...transferData } = result.data;

    const [transfer] = await db.insert(stock_transfers).values({
      ...transferData,
      company_id: companyId,
      created_by: userId,
      status: 'draft'
    }).returning();

    if (transferItems.length > 0) {
      await db.insert(stock_transfer_items).values(
        transferItems.map(item => ({
          transfer_id: transfer.id,
          item_id: item.item_id,
          batch_id: item.batch_id,
          quantity: item.quantity.toString()
        }))
      );
    }

    // Audit log
    await logCreate({
      companyId,
      entityType: 'stock_transfer',
      entityId: transfer.id,
      createdData: { transfer_number: transfer.transfer_number, from_warehouse_id: transferData.from_warehouse_id, to_warehouse_id: transferData.to_warehouse_id },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json(transfer);
  } catch (error) {
    console.error("Error creating transfer:", error);
    serverError(res, "Failed to create transfer");
  }
});

// Get transfer details
router.get("/transfers/:id", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const transfer = await db.query.stock_transfers.findFirst({
      where: and(
        eq(stock_transfers.id, req.params.id),
        eq(stock_transfers.company_id, companyId)
      ),
      with: {
        from_warehouse: true,
        to_warehouse: true,
        items: {
          with: {
            item: true,
            batch: true
          }
        }
      }
    });

    if (!transfer) return notFound(res, "Transfer not found");
    res.json(transfer);
  } catch (error) {
    serverError(res, "Failed to fetch transfer details");
  }
});

// Update transfer (only draft)
router.put("/transfers/:id", requireAuth, requirePermission('items', 'edit'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { from_warehouse_id, to_warehouse_id, date, notes, items } = req.body;
    
    const transfer = await db.query.stock_transfers.findFirst({
      where: and(
        eq(stock_transfers.id, req.params.id),
        eq(stock_transfers.company_id, companyId)
      )
    });

    if (!transfer) return notFound(res, "Transfer not found");
    if (transfer.status !== 'draft') return badRequest(res, "Only draft transfers can be edited");

    // Update transfer
    await db.update(stock_transfers)
      .set({
        from_warehouse_id,
        to_warehouse_id,
        date: new Date(date),
        notes
      })
      .where(eq(stock_transfers.id, transfer.id));

    // Delete existing items and recreate
    await db.delete(stock_transfer_items).where(eq(stock_transfer_items.transfer_id, transfer.id));

    // Create new items
    for (const item of items) {
      await db.insert(stock_transfer_items).values({
        transfer_id: transfer.id,
        item_id: item.item_id,
        quantity: item.quantity,
        batch_id: item.batch_id || null
      });
    }

    // Fetch updated transfer
    const updatedTransfer = await db.query.stock_transfers.findFirst({
      where: eq(stock_transfers.id, transfer.id),
      with: {
        from_warehouse: true,
        to_warehouse: true,
        items: {
          with: {
            item: true,
            batch: true
          }
        }
      }
    });

    res.json(updatedTransfer);
  } catch (error) {
    console.error("Error updating transfer:", error);
    serverError(res, "Failed to update transfer");
  }
});

// Submit transfer for approval
router.post("/transfers/:id/submit", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    
    const transfer = await db.query.stock_transfers.findFirst({
      where: and(
        eq(stock_transfers.id, req.params.id),
        eq(stock_transfers.company_id, companyId)
      )
    });

    if (!transfer) return notFound(res, "Transfer not found");
    if (transfer.status !== 'draft') return badRequest(res, "Transfer must be in draft status to submit");

    await db.update(stock_transfers)
      .set({ status: 'pending_approval' })
      .where(eq(stock_transfers.id, transfer.id));

    res.json({ message: "Transfer submitted for approval" });
  } catch (error) {
    console.error("Error submitting transfer:", error);
    serverError(res, "Failed to submit transfer");
  }
});

// Delete transfer (only draft)
router.delete("/transfers/:id", requireAuth, requirePermission('items', 'delete'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    
    const transfer = await db.query.stock_transfers.findFirst({
      where: and(
        eq(stock_transfers.id, req.params.id),
        eq(stock_transfers.company_id, companyId)
      )
    });

    if (!transfer) return notFound(res, "Transfer not found");
    if (transfer.status !== 'draft') return badRequest(res, "Only draft transfers can be deleted");

    // Delete transfer items first
    await db.delete(stock_transfer_items).where(eq(stock_transfer_items.transfer_id, transfer.id));
    // Delete transfer
    await db.delete(stock_transfers).where(eq(stock_transfers.id, transfer.id));

    res.json({ message: "Transfer deleted successfully" });
  } catch (error) {
    console.error("Error deleting transfer:", error);
    serverError(res, "Failed to delete transfer");
  }
});

// Approve transfer
router.post("/transfers/:id/approve", requireAuth, requirePermission('items', 'edit'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    
    const transfer = await db.query.stock_transfers.findFirst({
      where: and(
        eq(stock_transfers.id, req.params.id),
        eq(stock_transfers.company_id, companyId)
      )
    });

    if (!transfer) return notFound(res, "Transfer not found");
    if (transfer.status !== 'pending_approval') return badRequest(res, "Transfer must be pending approval");

    await db.update(stock_transfers)
      .set({ status: 'approved' })
      .where(eq(stock_transfers.id, transfer.id));

    res.json({ message: "Transfer approved" });
  } catch (error) {
    console.error("Error approving transfer:", error);
    serverError(res, "Failed to approve transfer");
  }
});

// Complete transfer (Move Stock)
router.post("/transfers/:id/complete", requireAuth, requirePermission('items', 'edit'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;

    const transfer = await db.query.stock_transfers.findFirst({
      where: and(
        eq(stock_transfers.id, req.params.id),
        eq(stock_transfers.company_id, companyId)
      ),
      with: {
        items: true
      }
    });

    if (!transfer) return notFound(res, "Transfer not found");
    
    // Allow completion from 'draft' or 'approved' status
    // This provides flexibility - small companies can complete directly,
    // while larger companies can use the full approval workflow
    if (transfer.status === 'completed') {
       return badRequest(res, "Transfer is already completed");
    }
    
    if (transfer.status === 'cancelled') {
       return badRequest(res, "Cannot complete a cancelled transfer");
    }

    // Execute stock movements
    for (const transferItem of transfer.items) {
      // Fetch current item cost
      const [item] = await db.select().from(items).where(eq(items.id, transferItem.item_id));
      const currentCost = item?.cost_price ? Number(item.cost_price) : 0;

      // 1. Remove from source
      await recordStockMovement({
        company_id: companyId,
        item_id: transferItem.item_id,
        warehouse_id: transfer.from_warehouse_id,
        transaction_type: 'transfer_out',
        transaction_date: new Date(),
        quantity: parseFloat(transferItem.quantity),
        unit_cost: currentCost,
        notes: `Transfer ${transfer.transfer_number} to ${transfer.to_warehouse_id}`,
        reference_type: 'stock_transfer',
        reference_id: transfer.id,
        batch_id: transferItem.batch_id || undefined,
        created_by: userId
      });

      // 2. Add to destination
      await recordStockMovement({
        company_id: companyId,
        item_id: transferItem.item_id,
        warehouse_id: transfer.to_warehouse_id,
        transaction_type: 'transfer_in',
        transaction_date: new Date(),
        quantity: parseFloat(transferItem.quantity),
        unit_cost: currentCost,
        notes: `Transfer ${transfer.transfer_number} from ${transfer.from_warehouse_id}`,
        reference_type: 'stock_transfer',
        reference_id: transfer.id,
        batch_id: transferItem.batch_id || undefined,
        created_by: userId
      });
    }

    // Update transfer status
    await db.update(stock_transfers)
      .set({ status: 'completed' })
      .where(eq(stock_transfers.id, transfer.id));

    res.json({ message: "Transfer completed" });
  } catch (error) {
    console.error("Error completing transfer:", error);
    serverError(res, "Failed to complete transfer");
  }
});

// === BATCHES ===

// Get batches for an item
router.get("/items/:itemId/batches", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const itemBatches = await db.query.batches.findMany({
      where: and(
        eq(batches.company_id, companyId),
        eq(batches.item_id, req.params.itemId)
      ),
      with: {
        warehouse: true
      },
      orderBy: [desc(batches.expiry_date)]
    });
    res.json(itemBatches);
  } catch (error) {
    console.error("Error fetching batches:", error);
    serverError(res, "Failed to fetch batches");
  }
});

// Backfill stock movements for existing invoices and bills
// Debug endpoint to check data
router.get("/debug-data", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    
    // Check invoices
    const allInvoices = await db.select().from(sales_invoices)
      .where(eq(sales_invoices.company_id, companyId));
    
    // Check document_lines
    const allLines = await db.select().from(document_lines).limit(50);
    
    // Check transfers
    const allTransfers = await db.select().from(stock_transfers)
      .where(eq(stock_transfers.company_id, companyId));
    
    // Check transfer items
    const allTransferItems = await db.select().from(stock_transfer_items).limit(50);
    
    // Check items
    const allItems = await db.select().from(items)
      .where(eq(items.company_id, companyId));
    
    // Check existing movements
    const existingMovements = await db.select().from(stock_movements)
      .where(eq(stock_movements.company_id, companyId));
    
    res.json({
      invoices: {
        count: allInvoices.length,
        sample: allInvoices.slice(0, 3).map(i => ({ id: i.id, number: i.invoice_number, date: i.date }))
      },
      document_lines: {
        count: allLines.length,
        sample: allLines.slice(0, 5).map(l => ({ 
          id: l.id, 
          document_type: l.document_type, 
          document_id: l.document_id,
          item_id: l.item_id,
          quantity: l.quantity
        }))
      },
      transfers: {
        count: allTransfers.length,
        sample: allTransfers.slice(0, 3).map(t => ({ 
          id: t.id, 
          number: t.transfer_number, 
          status: t.status,
          from: t.from_warehouse_id,
          to: t.to_warehouse_id
        }))
      },
      transfer_items: {
        count: allTransferItems.length,
        sample: allTransferItems.slice(0, 5)
      },
      items: {
        count: allItems.length,
        sample: allItems.slice(0, 3).map(i => ({ id: i.id, name: i.name, type: i.type }))
      },
      existing_movements: {
        count: existingMovements.length,
        sample: existingMovements.slice(0, 5)
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Debug: get history for specific item by ID in URL
router.get("/debug-history/:itemId", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const itemId = req.params.itemId;
    
    // Get all movements for this item
    const movements = await db.select()
      .from(stock_movements)
      .where(and(
        eq(stock_movements.company_id, companyId),
        eq(stock_movements.item_id, itemId)
      ))
      .orderBy(desc(stock_movements.transaction_date));
    
    // Also get item info
    const [item] = await db.select().from(items).where(eq(items.id, itemId));
    
    res.json({
      itemId,
      item: item ? { id: item.id, name: item.name, type: item.type } : null,
      movements: {
        count: movements.length,
        data: movements
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/backfill-movements", requireAuth, requirePermission('settings', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    
    let recordedCount = 0;
    let skippedCount = 0;
    let errors: string[] = [];
    
    // Get default warehouse for items without warehouse specified
    const [defaultWarehouse] = await db.select()
      .from(warehouses)
      .where(and(
        eq(warehouses.company_id, companyId),
        eq(warehouses.is_active, true)
      ))
      .limit(1);
    
    if (!defaultWarehouse) {
      return badRequest(res, "No active warehouse found. Please create a warehouse first.");
    }
    
    console.log("Starting backfill for company:", companyId);
    
    // === 1. Process Sales Invoices ===
    try {
      const invoices = await db.select({
        invoice: sales_invoices,
        line: document_lines
      })
      .from(sales_invoices)
      .innerJoin(document_lines, and(
        eq(document_lines.document_id, sales_invoices.id),
        eq(document_lines.document_type, 'invoice')
      ))
      .where(eq(sales_invoices.company_id, companyId));
      
      console.log(`Found ${invoices.length} invoice lines`);
      
      for (const { invoice, line } of invoices) {
        if (!line.item_id) continue;
        
        const [existingMovement] = await db.select()
          .from(stock_movements)
          .where(and(
            eq(stock_movements.company_id, companyId),
            eq(stock_movements.reference_type, 'invoice'),
            eq(stock_movements.reference_id, invoice.id),
            eq(stock_movements.item_id, line.item_id)
          ))
          .limit(1);
        
        if (existingMovement) {
          skippedCount++;
          continue;
        }
        
        const [item] = await db.select().from(items).where(eq(items.id, line.item_id));
        if (!item || (item.type !== 'product' && item.type !== 'inventory')) {
          continue;
        }
        
        try {
          await recordStockMovement({
            company_id: companyId,
            item_id: line.item_id,
            warehouse_id: line.warehouse_id || defaultWarehouse.id,
            transaction_type: 'sale',
            transaction_date: new Date(invoice.date),
            quantity: -Math.abs(parseFloat(line.quantity || '0')),
            unit_cost: parseFloat(line.unit_price || '0'),
            reference_type: 'invoice',
            reference_id: invoice.id,
            notes: `Sale - Invoice ${invoice.invoice_number}`,
            created_by: userId
          });
          recordedCount++;
        } catch (e: any) {
          errors.push(`Invoice ${invoice.invoice_number}: ${e.message}`);
        }
      }
    } catch (e: any) {
      console.error("Error processing invoices:", e);
      errors.push(`Invoice processing error: ${e.message}`);
    }
    
    // === 2. Process Bills ===
    try {
      const billsData = await db.select({
        bill: bills,
        line: document_lines
      })
      .from(bills)
      .innerJoin(document_lines, and(
        eq(document_lines.document_id, bills.id),
        eq(document_lines.document_type, 'bill')
      ))
      .where(eq(bills.company_id, companyId));
      
      console.log(`Found ${billsData.length} bill lines`);
      
      for (const { bill, line } of billsData) {
        if (!line.item_id) continue;
        
        const [existingMovement] = await db.select()
          .from(stock_movements)
          .where(and(
            eq(stock_movements.company_id, companyId),
            eq(stock_movements.reference_type, 'bill'),
            eq(stock_movements.reference_id, bill.id),
            eq(stock_movements.item_id, line.item_id)
          ))
          .limit(1);
        
        if (existingMovement) {
          skippedCount++;
          continue;
        }
        
        const [item] = await db.select().from(items).where(eq(items.id, line.item_id));
        if (!item || (item.type !== 'product' && item.type !== 'inventory')) {
          continue;
        }
        
        try {
          await recordStockMovement({
            company_id: companyId,
            item_id: line.item_id,
            warehouse_id: line.warehouse_id || defaultWarehouse.id,
            transaction_type: 'purchase',
            transaction_date: new Date(bill.date),
            quantity: Math.abs(parseFloat(line.quantity || '0')),
            unit_cost: parseFloat(line.unit_price || '0'),
            reference_type: 'bill',
            reference_id: bill.id,
            notes: `Purchase - Bill ${bill.bill_number}`,
            created_by: userId
          });
          recordedCount++;
        } catch (e: any) {
          errors.push(`Bill ${bill.bill_number}: ${e.message}`);
        }
      }
    } catch (e: any) {
      console.error("Error processing bills:", e);
      errors.push(`Bill processing error: ${e.message}`);
    }
    
    // === 3. Process Completed Stock Transfers ===
    try {
      const transfers = await db.select({
        transfer: stock_transfers,
        transferItem: stock_transfer_items
      })
      .from(stock_transfers)
      .innerJoin(stock_transfer_items, eq(stock_transfer_items.transfer_id, stock_transfers.id))
      .where(and(
        eq(stock_transfers.company_id, companyId),
        eq(stock_transfers.status, 'completed')
      ));
      
      console.log(`Found ${transfers.length} completed transfer items`);
      
      for (const { transfer, transferItem } of transfers) {
        // Check for transfer_out movement
        const [existingOut] = await db.select()
          .from(stock_movements)
          .where(and(
            eq(stock_movements.company_id, companyId),
            eq(stock_movements.reference_type, 'transfer'),
            eq(stock_movements.reference_id, transfer.id),
            eq(stock_movements.item_id, transferItem.item_id),
            eq(stock_movements.transaction_type, 'transfer_out')
          ))
          .limit(1);
        
        // Check for transfer_in movement
        const [existingIn] = await db.select()
          .from(stock_movements)
          .where(and(
            eq(stock_movements.company_id, companyId),
            eq(stock_movements.reference_type, 'transfer'),
            eq(stock_movements.reference_id, transfer.id),
            eq(stock_movements.item_id, transferItem.item_id),
            eq(stock_movements.transaction_type, 'transfer_in')
          ))
          .limit(1);
        
        const [item] = await db.select().from(items).where(eq(items.id, transferItem.item_id));
        if (!item) continue;
        
        const qty = Math.abs(parseFloat(transferItem.quantity || '0'));
        const unitCost = parseFloat(item.cost_price || '0');
        
        // Record transfer_out if not exists
        if (!existingOut) {
          try {
            await recordStockMovement({
              company_id: companyId,
              item_id: transferItem.item_id,
              warehouse_id: transfer.from_warehouse_id,
              transaction_type: 'transfer_out',
              transaction_date: new Date(transfer.date),
              quantity: -qty,
              unit_cost: unitCost,
              reference_type: 'transfer',
              reference_id: transfer.id,
              notes: `Transfer Out - ${transfer.transfer_number}`,
              created_by: userId
            });
            recordedCount++;
          } catch (e: any) {
            errors.push(`Transfer ${transfer.transfer_number} out: ${e.message}`);
          }
        } else {
          skippedCount++;
        }
        
        // Record transfer_in if not exists
        if (!existingIn) {
          try {
            await recordStockMovement({
              company_id: companyId,
              item_id: transferItem.item_id,
              warehouse_id: transfer.to_warehouse_id,
              transaction_type: 'transfer_in',
              transaction_date: new Date(transfer.date),
              quantity: qty,
              unit_cost: unitCost,
              reference_type: 'transfer',
              reference_id: transfer.id,
              notes: `Transfer In - ${transfer.transfer_number}`,
              created_by: userId
            });
            recordedCount++;
          } catch (e: any) {
            errors.push(`Transfer ${transfer.transfer_number} in: ${e.message}`);
          }
        } else {
          skippedCount++;
        }
      }
    } catch (e: any) {
      console.error("Error processing transfers:", e);
      errors.push(`Transfer processing error: ${e.message}`);
    }
    
    console.log(`Backfill complete: recorded=${recordedCount}, skipped=${skippedCount}, errors=${errors.length}`);
    
    res.json({
      success: true,
      message: `Backfill completed. Recorded: ${recordedCount}, Skipped: ${skippedCount}${errors.length > 0 ? `, Errors: ${errors.length}` : ''}`,
      recorded: recordedCount,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error("Error in backfill:", error);
    serverError(res, "Failed to backfill stock movements: " + error.message);
  }
});

// === SERIAL NUMBERS ===

// Get available serial numbers for an item (status = 'available')
router.get("/serials/:itemId", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { itemId } = req.params;
    const warehouseId = req.query.warehouse_id as string | undefined;

    const conditions = [
      eq(inventory_serials.company_id, companyId),
      eq(inventory_serials.item_id, itemId),
      eq(inventory_serials.status, 'available')
    ];

    if (warehouseId) {
      conditions.push(eq(inventory_serials.warehouse_id, warehouseId));
    }

    const serials = await db.select().from(inventory_serials)
      .where(and(...conditions));
    
    res.json(serials);
  } catch (error: any) {
    console.error("Error fetching serials:", error);
    serverError(res, "Failed to fetch serial numbers");
  }
});

// Create serial numbers (for purchases)
router.post("/serials", requireAuth, requirePermission('items', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const body = normalize(req.body);
    
    const schema = z.object({
      item_id: z.string(),
      warehouse_id: z.string(),
      serial_numbers: z.array(z.string().min(1))
    });

    const result = schema.safeParse(body);
    if (!result.success) return badRequest(res, fromZodError(result.error).message);

    const { item_id, warehouse_id, serial_numbers } = result.data;
    
    // Check for duplicates
    const existing = await db.select().from(inventory_serials)
      .where(and(
        eq(inventory_serials.company_id, companyId),
        eq(inventory_serials.item_id, item_id)
      ));
    
    const existingNumbers = existing.map(s => s.serial_number);
    const duplicates = serial_numbers.filter(sn => existingNumbers.includes(sn));
    
    if (duplicates.length > 0) {
      return badRequest(res, `Duplicate serial numbers: ${duplicates.join(', ')}`);
    }

    // Insert new serial numbers
    const insertData = serial_numbers.map(sn => ({
      company_id: companyId,
      item_id,
      warehouse_id,
      serial_number: sn,
      status: 'available'
    }));

    await db.insert(inventory_serials).values(insertData);

    res.json({ success: true, count: serial_numbers.length });
  } catch (error: any) {
    console.error("Error creating serials:", error);
    serverError(res, "Failed to create serial numbers");
  }
});

// Update serial number status (for sales - mark as sold)
router.put("/serials/:id/status", requireAuth, requirePermission('items', 'edit'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { id } = req.params;
    const { status } = req.body;

    if (!['available', 'sold', 'returned', 'damaged'].includes(status)) {
      return badRequest(res, "Invalid status");
    }

    await db.update(inventory_serials)
      .set({ status })
      .where(and(
        eq(inventory_serials.id, id),
        eq(inventory_serials.company_id, companyId)
      ));

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error updating serial status:", error);
    serverError(res, "Failed to update serial status");
  }
});

// === BATCHES ===

// Get batches for an item (with available quantity > 0)
router.get("/batches/:itemId", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { itemId } = req.params;
    const warehouseId = req.query.warehouse_id as string | undefined;

    const conditions = [
      eq(inventory_batches.company_id, companyId),
      eq(inventory_batches.item_id, itemId)
    ];

    if (warehouseId) {
      conditions.push(eq(inventory_batches.warehouse_id, warehouseId));
    }

    const batches = await db.select().from(inventory_batches)
      .where(and(...conditions));
    
    // Filter batches with quantity > 0
    const availableBatches = batches.filter(b => parseFloat(b.quantity || '0') > 0);
    res.json(availableBatches);
  } catch (error: any) {
    console.error("Error fetching batches:", error);
    serverError(res, "Failed to fetch batches");
  }
});

// Create or update batch (for purchases)
router.post("/batches", requireAuth, requirePermission('items', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const body = normalize(req.body);
    
    const schema = z.object({
      item_id: z.string(),
      warehouse_id: z.string(),
      batch_number: z.string().min(1),
      quantity: z.number().positive(),
      expiry_date: z.string().optional()
    });

    const result = schema.safeParse(body);
    if (!result.success) return badRequest(res, fromZodError(result.error).message);

    const { item_id, warehouse_id, batch_number, quantity, expiry_date } = result.data;
    
    // Check if batch already exists
    const existing = await db.select().from(inventory_batches)
      .where(and(
        eq(inventory_batches.company_id, companyId),
        eq(inventory_batches.item_id, item_id),
        eq(inventory_batches.batch_number, batch_number),
        eq(inventory_batches.warehouse_id, warehouse_id)
      ));

    if (existing.length > 0) {
      // Update existing batch quantity
      const newQty = parseFloat(existing[0].quantity || '0') + quantity;
      await db.update(inventory_batches)
        .set({ quantity: String(newQty) })
        .where(eq(inventory_batches.id, existing[0].id));
      
      res.json({ success: true, batch_id: existing[0].id, updated: true });
    } else {
      // Create new batch
      const [batch] = await db.insert(inventory_batches).values({
        company_id: companyId,
        item_id,
        warehouse_id,
        batch_number,
        quantity: String(quantity),
        expiry_date: expiry_date ? new Date(expiry_date) : null
      }).returning();

      res.json({ success: true, batch_id: batch.id, created: true });
    }
  } catch (error: any) {
    console.error("Error creating/updating batch:", error);
    serverError(res, "Failed to create/update batch");
  }
});

// Reduce batch quantity (for sales)
router.put("/batches/:id/reduce", requireAuth, requirePermission('items', 'edit'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return badRequest(res, "Invalid quantity");
    }

    const [batch] = await db.select().from(inventory_batches)
      .where(and(
        eq(inventory_batches.id, id),
        eq(inventory_batches.company_id, companyId)
      ));

    if (!batch) {
      return notFound(res, "Batch not found");
    }

    const currentQty = parseFloat(batch.quantity || '0');
    if (quantity > currentQty) {
      return badRequest(res, `Insufficient quantity. Available: ${currentQty}`);
    }

    const newQty = currentQty - quantity;
    await db.update(inventory_batches)
      .set({ quantity: String(newQty) })
      .where(eq(inventory_batches.id, id));

    res.json({ success: true, remaining: newQty });
  } catch (error: any) {
    console.error("Error reducing batch quantity:", error);
    serverError(res, "Failed to reduce batch quantity");
  }
});

export default router;
