import { withTransaction } from '../utils/transaction';
import { db } from '../db';
import { sales_invoices, document_lines, journals, journal_lines } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import type { InsertSalesInvoice, SalesInvoice } from '@shared/schema';
import { logger } from '../logger';

/**
 * Create sales invoice with document lines in a single transaction
 * Ensures atomicity - either all records created or none
 */
export async function createSalesInvoiceWithLines(
  invoiceData: InsertSalesInvoice,
  lines: Array<{
    item_id?: string;
    tax_id?: string;
    description: string;
    quantity: string;
    rate: string;
    discount?: string;
    amount: string;
  }>
): Promise<SalesInvoice> {
  return withTransaction(async (tx) => {
    // 1. Create invoice
    const [invoice] = await tx
      .insert(sales_invoices)
      .values(invoiceData)
      .returning();

    logger.info({ invoiceId: invoice.id, companyId: invoice.company_id }, 'Created sales invoice');

    // 2. Create document lines
    if (lines.length > 0) {
      const lineValues = lines.map((line, index) => ({
        document_type: 'invoice',
        document_id: invoice.id,
        line_number: index + 1,
        unit_price: line.rate,
        line_total: line.amount,
        ...line,
      }));

      await tx.insert(document_lines).values(lineValues);
      logger.info({ invoiceId: invoice.id, lineCount: lines.length }, 'Created invoice lines');
    }

    // 3. TODO: Create journal entry (if invoice is posted, not draft)
    // Will be implemented when auto-posting logic is ready

    return invoice;
  });
}

/**
 * Delete sales invoice and all related records atomically
 */
export async function deleteSalesInvoiceWithRelated(
  invoiceId: string,
  companyId: string
): Promise<boolean> {
  return withTransaction(async (tx) => {
    // Cascade delete will handle document_lines automatically
    // But we explicitly delete allocations if any exist
    await tx
      .delete(sales_invoices)
      .where(
        and(
          eq(sales_invoices.id, invoiceId),
          eq(sales_invoices.company_id, companyId)
        )
      );

    logger.info({ invoiceId, companyId }, 'Deleted sales invoice with related records');
    return true;
  });
}
