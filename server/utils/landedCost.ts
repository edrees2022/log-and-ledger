import { db } from "../db";
import { landed_cost_vouchers, landed_cost_bills, landed_cost_items, stock_movements, bills, document_lines, items } from "@shared/schema";
import { eq, sql, inArray, and } from "drizzle-orm";
import { createJournalEntry } from "./journalEntry";
import { calculateStockValue } from "./inventory";

export async function allocateLandedCost(voucherId: string) {
  // 1. Get Voucher
  const [voucher] = await db.select().from(landed_cost_vouchers).where(eq(landed_cost_vouchers.id, voucherId));
  if (!voucher) throw new Error("Voucher not found");

  // 2. Get Bills (Total Cost to Allocate)
  const bills = await db.select().from(landed_cost_bills).where(eq(landed_cost_bills.voucher_id, voucherId));
  const totalAmount = bills.reduce((sum, b) => sum + parseFloat(b.amount.toString()), 0);

  // 3. Get Items (Targets)
  const itemsList = await db.select().from(landed_cost_items).where(eq(landed_cost_items.voucher_id, voucherId));
  
  // Fetch stock movements details manually
  const itemDetails = await Promise.all(itemsList.map(async (item) => {
    const [movement] = await db.select().from(stock_movements).where(eq(stock_movements.id, item.stock_movement_id));
    return { ...item, movement };
  }));

  // 4. Calculate Allocation Base
  let totalBase = 0;
  if (voucher.allocation_method === 'quantity') {
    totalBase = itemDetails.reduce((sum, i) => sum + parseFloat(i.movement?.quantity.toString() || '0'), 0);
  } else {
    // Value
    totalBase = itemDetails.reduce((sum, i) => sum + parseFloat(i.movement?.total_cost.toString() || '0'), 0);
  }

  if (totalBase === 0) return; // Nothing to allocate to

  // 5. Distribute and Update
  for (const item of itemDetails) {
    if (!item.movement) continue;
    
    const base = voucher.allocation_method === 'quantity' 
      ? parseFloat(item.movement.quantity.toString()) 
      : parseFloat(item.movement.total_cost.toString());
      
    const ratio = base / totalBase;
    const allocatedAmount = totalAmount * ratio;
    
    const originalCost = parseFloat(item.movement.total_cost.toString());
    const newTotalCost = originalCost + allocatedAmount;
    const quantity = parseFloat(item.movement.quantity.toString());
    const newUnitCost = quantity !== 0 ? newTotalCost / quantity : 0;

    await db.update(landed_cost_items)
      .set({
        original_cost: originalCost.toString(),
        allocated_cost: allocatedAmount.toString(),
        new_unit_cost: newUnitCost.toString()
      })
      .where(eq(landed_cost_items.id, item.id));
  }
}

export async function postLandedCostVoucher(voucherId: string, userId: string) {
  // 1. Ensure allocation is up to date
  await allocateLandedCost(voucherId);

  const [voucher] = await db.select().from(landed_cost_vouchers).where(eq(landed_cost_vouchers.id, voucherId));
  if (!voucher) throw new Error("Voucher not found");
  if (voucher.status === 'posted') throw new Error("Already posted");

  const voucherItems = await db.select().from(landed_cost_items).where(eq(landed_cost_items.voucher_id, voucherId));

  const voucherBills = await db.select().from(landed_cost_bills).where(eq(landed_cost_bills.voucher_id, voucherId));

  // 2. Update Stock Movements
  const affectedItemIds = new Set<string>();
  
  for (const item of voucherItems) {
    await db.update(stock_movements)
      .set({
        unit_cost: item.new_unit_cost,
        total_cost: sql`${stock_movements.quantity} * ${item.new_unit_cost}`
      })
      .where(eq(stock_movements.id, item.stock_movement_id));
      
    // Get item ID for WAC recalculation
    const [movement] = await db.select().from(stock_movements).where(eq(stock_movements.id, item.stock_movement_id));
    if (movement) affectedItemIds.add(movement.item_id);
  }

  // 3. Create Journal Entry
  // Debit: Inventory Account (Asset)
  // Credit: Expense Account (from Bill)
  
  const journalLines = [];

  // Prepare Debits (Inventory)
  for (const vItem of voucherItems) {
    const allocated = parseFloat(vItem.allocated_cost.toString());
    if (allocated <= 0) continue;

    const [movement] = await db.select().from(stock_movements).where(eq(stock_movements.id, vItem.stock_movement_id));
    
    if (movement) {
      const [item] = await db.select().from(items).where(eq(items.id, movement.item_id));
      
      if (item && item.inventory_account_id) {
        journalLines.push({
          account_id: item.inventory_account_id,
          debit: allocated,
          credit: 0,
          description: `Landed Cost Allocation - ${item.name}`
        });
      }
    }
  }

  // Prepare Credits (Expense Reduction)
  // We need to find which accounts were debited in the original bills
  for (const vBill of voucherBills) {
    const amount = parseFloat(vBill.amount.toString());
    if (amount <= 0) continue;

    // Find bill lines to see which account was used
    const lines = await db.select().from(document_lines)
      .where(and(
        eq(document_lines.document_id, vBill.bill_id),
        eq(document_lines.document_type, 'bill')
      ));
    
    // Distribute credit proportionally to lines? 
    // Or just find the first expense account?
    // Let's try to find the expense account from the item in the line
    let remainingCredit = amount;
    
    for (const line of lines) {
      if (remainingCredit <= 0) break;
      
      // Get item to find expense account
      if (line.item_id) {
        const [lineItem] = await db.select().from(items).where(eq(items.id, line.item_id));
        if (lineItem && lineItem.cost_account_id) {
          // Use this account
          // How much? Proportional to line total?
          // For simplicity, let's just credit this account with the full amount if it's the only line
          // Or split it.
          // Let's assume the bill is purely for freight.
          journalLines.push({
            account_id: lineItem.cost_account_id,
            debit: 0,
            credit: remainingCredit, // TODO: Better distribution if multiple lines
            description: `Landed Cost Allocation - Bill ${vBill.bill_id}`
          });
          remainingCredit = 0;
        }
      }
    }
    
    // Fallback if no account found (should not happen if bill is valid)
    if (remainingCredit > 0) {
       // Log warning or fail?
       console.warn(`Could not find expense account for bill ${vBill.bill_id}`);
    }
  }

  if (journalLines.length > 0) {
    await createJournalEntry({
      company_id: voucher.company_id,
      date: new Date(),
      description: `Landed Cost Allocation: ${voucher.voucher_number}`,
      source_type: 'landed_cost',
      source_id: voucher.id,
      lines: journalLines,
      created_by: userId
    });
  }

  // 4. Recalculate WAC for affected items
  for (const itemId of Array.from(affectedItemIds)) {
    await calculateStockValue(voucher.company_id, itemId);
  }
  
  await db.update(landed_cost_vouchers)
    .set({ status: 'posted', updated_at: new Date() })
    .where(eq(landed_cost_vouchers.id, voucherId));
}
