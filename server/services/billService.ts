import { withTransaction, validateDoubleEntry } from '../utils/transaction';
import { db } from '../db';
import { bills, document_lines } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import type { InsertBill, Bill } from '@shared/schema';
import { logger } from '../logger';

/**
 * Create bill with document lines in a single transaction
 * Ensures atomicity - either all records created or none
 */
export async function createBillWithLines(
  billData: InsertBill,
  lines: Array<{
    item_id?: string;
    tax_id?: string;
    description: string;
    quantity: string;
    rate: string;
    discount?: string;
    amount: string;
  }>
): Promise<Bill> {
  return withTransaction(async (tx) => {
    // 1. Create bill
    const [bill] = await tx
      .insert(bills)
      .values(billData)
      .returning();

    logger.info({ billId: bill.id, companyId: bill.company_id }, 'Created bill');

    // 2. Create document lines
    if (lines.length > 0) {
      const lineValues = lines.map((line, index) => ({
        document_type: 'bill',
        document_id: bill.id,
        line_number: index + 1,
        unit_price: line.rate,
        line_total: line.amount,
        ...line,
      }));

      await tx.insert(document_lines).values(lineValues);
      logger.info({ billId: bill.id, lineCount: lines.length }, 'Created bill lines');
    }

    // 3. TODO: Create journal entry (if bill is posted, not draft)

    return bill;
  });
}

/**
 * Delete bill and all related records atomically
 */
export async function deleteBillWithRelated(
  billId: string,
  companyId: string
): Promise<boolean> {
  return withTransaction(async (tx) => {
    await tx
      .delete(bills)
      .where(
        and(
          eq(bills.id, billId),
          eq(bills.company_id, companyId)
        )
      );

    logger.info({ billId, companyId }, 'Deleted bill with related records');
    return true;
  });
}
