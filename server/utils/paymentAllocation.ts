import { db } from "../db";
import { payment_allocations, sales_invoices, bills, receipts, payments } from "@shared/schema";
import { eq, and, sum, sql, desc } from "drizzle-orm";

export interface PaymentAllocationInput {
  company_id: string;
  payment_type: "receipt" | "payment";
  payment_id: string;
  document_type: "invoice" | "bill";
  document_id: string;
  allocated_amount: number;
  created_by?: string;
}

/**
 * Allocate payment to invoice/bill
 */
export async function allocatePayment(
  allocation: PaymentAllocationInput,
  tx?: typeof db
): Promise<{ id: string }> {
  const dbConnection = tx || db;

  // Insert allocation record
  const inserted = await dbConnection
    .insert(payment_allocations)
    .values({
    company_id: allocation.company_id,
    payment_type: allocation.payment_type,
    payment_id: allocation.payment_id,
    document_type: allocation.document_type,
    document_id: allocation.document_id,
    allocated_amount: allocation.allocated_amount.toString(),
    created_by: allocation.created_by,
  })
    .returning({ id: payment_allocations.id });

  // Update document status based on payment
  await updateDocumentPaymentStatus(
    allocation.document_type,
    allocation.document_id,
    dbConnection
  );
  return { id: inserted?.[0]?.id as string };
}

/**
 * Calculate total allocated amount for a document
 */
export async function getTotalAllocated(
  documentType: "invoice" | "bill",
  documentId: string
): Promise<number> {
  const result = await db
    .select({
      total: sum(payment_allocations.allocated_amount),
    })
    .from(payment_allocations)
    .where(
      and(
        eq(payment_allocations.document_type, documentType),
        eq(payment_allocations.document_id, documentId)
      )
    );

  const total = result[0]?.total;
  return total ? parseFloat(total.toString()) : 0;
}

/**
 * Update document payment status (paid, partial, unpaid)
 */
async function updateDocumentPaymentStatus(
  documentType: "invoice" | "bill",
  documentId: string,
  tx: typeof db
): Promise<void> {
  const totalAllocated = await getTotalAllocated(documentType, documentId);

  const table = documentType === "invoice" ? sales_invoices : bills;
  
  const [document] = await tx
    .select()
    .from(table)
    .where(eq(table.id, documentId))
    .limit(1);

  if (!document) return;

  const totalAmount = parseFloat(document.total.toString());
  const dueDate = (document as any).due_date ? new Date((document as any).due_date) : null;
  const now = new Date();
  const epsilon = 0.01;

  let newStatus: string;
  if (totalAllocated >= totalAmount - epsilon) {
    newStatus = "paid";
  } else if (totalAllocated > epsilon) {
    newStatus = "partially_paid";
  } else {
    if (documentType === "invoice") {
      if ((document as any).status === "draft") {
        newStatus = "draft";
      } else if (dueDate && dueDate.getTime() < now.getTime()) {
        newStatus = "overdue";
      } else {
        newStatus = "sent";
      }
    } else {
      if ((document as any).status === "draft") {
        newStatus = "draft";
      } else if (dueDate && dueDate.getTime() < now.getTime()) {
        newStatus = "overdue";
      } else {
        newStatus = "pending";
      }
    }
  }

  await tx
    .update(table)
    .set({ 
      status: newStatus,
      paid_amount: (totalAllocated > totalAmount ? totalAmount : totalAllocated).toString(),
      updated_at: new Date() 
    })
    .where(eq(table.id, documentId));
}

/**
 * Get payment allocation history for a document
 */
export async function getDocumentAllocations(
  documentType: "invoice" | "bill",
  documentId: string
) {
  const allocations = await db
    .select()
    .from(payment_allocations)
    .where(
      and(
        eq(payment_allocations.document_type, documentType),
        eq(payment_allocations.document_id, documentId)
      )
    )
    .orderBy(sql`${payment_allocations.allocation_date} DESC`);

  // Enrich with payment/receipt details
  const enriched = [];
  
  for (const allocation of allocations) {
    let paymentDetails = null;
    
    if (allocation.payment_type === "receipt") {
      const [receipt] = await db
        .select()
        .from(receipts)
        .where(eq(receipts.id, allocation.payment_id))
        .limit(1);
      paymentDetails = receipt;
    } else {
      const [payment] = await db
        .select()
        .from(payments)
        .where(eq(payments.id, allocation.payment_id))
        .limit(1);
      paymentDetails = payment;
    }

    enriched.push({
      ...allocation,
      payment_details: paymentDetails,
    });
  }

  return enriched;
}

/**
 * Get unallocated amount for a payment/receipt
 */
export async function getUnallocatedAmount(
  paymentType: "receipt" | "payment",
  paymentId: string
): Promise<number> {
  // Get payment total
  const table = paymentType === "receipt" ? receipts : payments;
  const [payment] = await db
    .select()
    .from(table)
    .where(eq(table.id, paymentId))
    .limit(1);

  if (!payment) return 0;

  const paymentAmount = parseFloat(payment.amount.toString());

  // Get total allocated
  const result = await db
    .select({
      total: sum(payment_allocations.allocated_amount),
    })
    .from(payment_allocations)
    .where(
      and(
        eq(payment_allocations.payment_type, paymentType),
        eq(payment_allocations.payment_id, paymentId)
      )
    );

  const totalAllocated = result[0]?.total ? parseFloat(result[0].total.toString()) : 0;

  return paymentAmount - totalAllocated;
}

/**
 * Delete a specific payment allocation and update related document status
 */
export async function deletePaymentAllocation(allocationId: string): Promise<void> {
  // Load allocation to know affected document
  const [allocation] = await db
    .select()
    .from(payment_allocations)
    .where(eq(payment_allocations.id, allocationId))
    .limit(1);

  if (!allocation) return;

  // Delete allocation
  await db
    .delete(payment_allocations)
    .where(eq(payment_allocations.id, allocationId));

  // Update document payment status after deletion
  await updateDocumentPaymentStatus(
    allocation.document_type as "invoice" | "bill",
    allocation.document_id,
    db
  );
}

/**
 * Get a single allocation by id (minimal fields) or null if not found
 */
export async function getAllocationById(
  allocationId: string
): Promise<Pick<typeof payment_allocations.$inferSelect, 'id' | 'company_id' | 'document_type' | 'document_id'> | null> {
  const [row] = await db
    .select({
      id: payment_allocations.id,
      company_id: payment_allocations.company_id,
      document_type: payment_allocations.document_type,
      document_id: payment_allocations.document_id,
    })
    .from(payment_allocations)
    .where(eq(payment_allocations.id, allocationId))
    .limit(1);
  return row || null;
}

/**
 * Get recent allocations for a company (enriched) for quick history UI
 */
export async function getRecentAllocations(companyId: string, limit = 20) {
  const rows = await db
    .select()
    .from(payment_allocations)
    .where(eq(payment_allocations.company_id, companyId))
    .orderBy(desc(payment_allocations.allocation_date))
    .limit(limit);

  const enriched = [] as any[];
  for (const row of rows) {
    let paymentDetails: any = null;
    let documentDetails: any = null;

    if (row.payment_type === "receipt") {
      const [receipt] = await db
        .select({
          id: receipts.id,
          company_id: receipts.company_id,
          receipt_number: receipts.receipt_number,
          customer_id: receipts.customer_id,
          customer_name: receipts.customer_name,
          date: receipts.date,
          amount: receipts.amount,
          payment_method: receipts.payment_method,
          reference: receipts.reference,
          description: receipts.description,
          bank_account_id: receipts.bank_account_id,
          status: receipts.status,
          currency: receipts.currency,
          fx_rate: receipts.fx_rate,
          journal_id: receipts.journal_id,
          created_by: receipts.created_by,
          created_at: receipts.created_at,
          updated_at: receipts.updated_at,
        })
        .from(receipts)
        .where(eq(receipts.id, row.payment_id))
        .limit(1);
      paymentDetails = receipt;
    } else {
      const [payment] = await db
        .select({
          id: payments.id,
          company_id: payments.company_id,
          payment_number: payments.payment_number,
          vendor_id: payments.vendor_id,
          vendor_name: payments.vendor_name,
          date: payments.date,
          amount: payments.amount,
          payment_method: payments.payment_method,
          reference: payments.reference,
          description: payments.description,
          bank_account_id: payments.bank_account_id,
          status: payments.status,
          currency: payments.currency,
          fx_rate: payments.fx_rate,
          journal_id: payments.journal_id,
          created_by: payments.created_by,
          created_at: payments.created_at,
          updated_at: payments.updated_at,
        })
        .from(payments)
        .where(eq(payments.id, row.payment_id))
        .limit(1);
      paymentDetails = payment;
    }

    if (row.document_type === "invoice") {
      const [inv] = await db
        .select()
        .from(sales_invoices)
        .where(eq(sales_invoices.id, row.document_id))
        .limit(1);
      documentDetails = inv;
    } else {
      const [bill] = await db
        .select()
        .from(bills)
        .where(eq(bills.id, row.document_id))
        .limit(1);
      documentDetails = bill;
    }

    enriched.push({
      ...row,
      payment_details: paymentDetails,
      document_details: documentDetails,
    });
  }

  return enriched;
}
