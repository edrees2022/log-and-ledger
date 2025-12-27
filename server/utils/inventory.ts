import { db } from "../db";
import { stock_movements, items } from "@shared/schema";
import { eq, and, sum, sql } from "drizzle-orm";

export interface StockMovementInput {
  company_id: string;
  item_id: string;
  warehouse_id: string;
  transaction_type: "purchase" | "sale" | "adjustment" | "transfer_in" | "transfer_out" | "manufacturing_in" | "manufacturing_out";
  transaction_date: Date;
  quantity: number;
  unit_cost: number;
  reference_type?: string;
  reference_id?: string;
  batch_id?: string;
  notes?: string;
  created_by?: string;
}

/**
 * Record stock movement and update item quantity
 */
export async function recordStockMovement(
  movement: StockMovementInput,
  tx?: typeof db
): Promise<void> {
  const dbConnection = tx || db;

  // Determine if this is an increase or decrease
  const quantityChange = ["purchase", "transfer_in", "adjustment", "manufacturing_in"].includes(movement.transaction_type)
    ? movement.quantity
    : -movement.quantity;

  const totalCost = movement.quantity * movement.unit_cost;

  // Insert stock movement record
  await dbConnection.insert(stock_movements).values({
    company_id: movement.company_id,
    item_id: movement.item_id,
    warehouse_id: movement.warehouse_id,
    transaction_type: movement.transaction_type,
    transaction_date: movement.transaction_date,
    quantity: movement.quantity.toString(),
    unit_cost: movement.unit_cost.toString(),
    total_cost: totalCost.toString(),
    reference_type: movement.reference_type,
    reference_id: movement.reference_id,
    batch_id: movement.batch_id,
    notes: movement.notes,
    created_by: movement.created_by,
  });

  // Update item stock quantity
  const [currentItem] = await dbConnection
    .select()
    .from(items)
    .where(eq(items.id, movement.item_id))
    .limit(1);

  if (currentItem) {
    const currentQty = parseFloat(currentItem.stock_quantity?.toString() || "0");
    const newQty = currentQty + quantityChange;

    await dbConnection
      .update(items)
      .set({
        stock_quantity: newQty.toString(),
        updated_at: new Date(),
      })
      .where(eq(items.id, movement.item_id));
  }
}

/**
 * Calculate current stock value using FIFO method
 */
export async function calculateStockValue(
  companyId: string,
  itemId: string,
  warehouseId?: string
): Promise<{ quantity: number; value: number; average_cost: number }> {
  const conditions = warehouseId
    ? and(
        eq(stock_movements.company_id, companyId),
        eq(stock_movements.item_id, itemId),
        eq(stock_movements.warehouse_id, warehouseId)
      )
    : and(
        eq(stock_movements.company_id, companyId),
        eq(stock_movements.item_id, itemId)
      );

  const movements = await db
    .select({
      quantity: stock_movements.quantity,
      total_cost: stock_movements.total_cost,
      transaction_type: stock_movements.transaction_type,
    })
    .from(stock_movements)
    .where(conditions)
    .orderBy(stock_movements.transaction_date);

  let totalQuantity = 0;
  let totalValue = 0;

  for (const movement of movements) {
    const qty = parseFloat(movement.quantity.toString());
    const cost = parseFloat(movement.total_cost.toString());

    if (["purchase", "transfer_in", "adjustment"].includes(movement.transaction_type)) {
      totalQuantity += qty;
      totalValue += cost;
    } else {
      totalQuantity -= qty;
      // For sales, reduce value proportionally
      const avgCost = totalValue / (totalQuantity + qty);
      totalValue -= qty * avgCost;
    }
  }

  const averageCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;

  return {
    quantity: totalQuantity,
    value: totalValue,
    average_cost: averageCost,
  };
}

/**
 * Get stock movements for a specific item
 */
export async function getItemStockHistory(
  companyId: string,
  itemId: string,
  startDate?: Date,
  endDate?: Date
) {
  let conditions = and(
    eq(stock_movements.company_id, companyId),
    eq(stock_movements.item_id, itemId)
  );

  // TODO: Add date filtering when needed
  
  return await db
    .select()
    .from(stock_movements)
    .where(conditions)
    .orderBy(sql`${stock_movements.transaction_date} DESC`);
}

/**
 * Get current stock levels for all items
 */
export async function getStockLevels(companyId: string) {
  return await db
    .select({
      item_id: stock_movements.item_id,
      warehouse_id: stock_movements.warehouse_id,
      total_in: sum(
        sql`CASE WHEN ${stock_movements.transaction_type} IN ('purchase', 'transfer_in', 'adjustment') 
            THEN ${stock_movements.quantity} 
            ELSE 0 END`
      ),
      total_out: sum(
        sql`CASE WHEN ${stock_movements.transaction_type} IN ('sale', 'transfer_out') 
            THEN ${stock_movements.quantity} 
            ELSE 0 END`
      ),
    })
    .from(stock_movements)
    .where(eq(stock_movements.company_id, companyId))
    .groupBy(stock_movements.item_id, stock_movements.warehouse_id);
}
