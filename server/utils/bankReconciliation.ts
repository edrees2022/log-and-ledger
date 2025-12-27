import { db } from "../db";
import { bank_reconciliations, bank_reconciliation_items, payments, receipts, bank_accounts } from "@shared/schema";
import { eq, and, between, sql } from "drizzle-orm";

export interface ReconciliationItemInput {
  transaction_type: 'payment' | 'receipt' | 'bank_charge' | 'bank_interest' | 'adjustment';
  transaction_id?: string;
  amount: number;
  date: Date;
  description: string;
  cleared: boolean;
}

export interface BankReconciliationInput {
  bank_account_id: string;
  reconciliation_date: Date;
  statement_balance: number;
  book_balance: number;
  items: ReconciliationItemInput[];
  notes?: string;
}

/**
 * Get unreconciled transactions for a bank account
 */
export async function getUnreconciledTransactions(
  companyId: string,
  bankAccountId: string,
  startDate?: Date,
  endDate?: Date
) {
  const conditions = [
    eq(payments.company_id, companyId),
    eq(payments.bank_account_id, bankAccountId),
    eq(payments.reconciled, false)
  ];

  if (startDate && endDate) {
    conditions.push(between(payments.date, startDate, endDate));
  }

  const unreconciledPayments = await db
    .select({
      id: payments.id,
      type: sql<string>`'payment'`,
      date: payments.date,
      amount: payments.amount,
      reference: payments.payment_number,
      description: payments.description,
      reconciled: payments.reconciled
    })
    .from(payments)
    .where(and(...conditions));

  const receiptConditions = [
    eq(receipts.company_id, companyId),
    eq(receipts.bank_account_id, bankAccountId),
    eq(receipts.reconciled, false)
  ];

  if (startDate && endDate) {
    receiptConditions.push(between(receipts.date, startDate, endDate));
  }

  const unreconciledReceipts = await db
    .select({
      id: receipts.id,
      type: sql<string>`'receipt'`,
      date: receipts.date,
      amount: receipts.amount,
      reference: receipts.receipt_number,
      description: receipts.description,
      reconciled: receipts.reconciled
    })
    .from(receipts)
    .where(and(...receiptConditions));

  return {
    payments: unreconciledPayments,
    receipts: unreconciledReceipts,
    all: [...unreconciledPayments, ...unreconciledReceipts].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  };
}

/**
 * Calculate reconciliation summary
 */
export async function calculateReconciliationSummary(
  bankAccountId: string,
  statementBalance: number,
  items: ReconciliationItemInput[]
) {
  let bookBalance = 0;
  let outstandingPayments = 0;
  let outstandingReceipts = 0;
  let bankCharges = 0;
  let bankInterest = 0;
  let adjustments = 0;

  items.forEach(item => {
    const amount = parseFloat(item.amount.toString());
    
    if (!item.cleared) {
      if (item.transaction_type === 'payment') {
        outstandingPayments += amount;
      } else if (item.transaction_type === 'receipt') {
        outstandingReceipts += amount;
      }
    }

    if (item.transaction_type === 'bank_charge') {
      bankCharges += amount;
    } else if (item.transaction_type === 'bank_interest') {
      bankInterest += amount;
    } else if (item.transaction_type === 'adjustment') {
      adjustments += amount;
    }
  });

  // Book balance = Statement balance + Outstanding receipts - Outstanding payments + Interest - Charges + Adjustments
  bookBalance = statementBalance + outstandingReceipts - outstandingPayments + bankInterest - bankCharges + adjustments;

  return {
    statement_balance: statementBalance,
    book_balance: bookBalance,
    outstanding_payments: outstandingPayments,
    outstanding_receipts: outstandingReceipts,
    bank_charges: bankCharges,
    bank_interest: bankInterest,
    adjustments: adjustments,
    difference: Math.abs(bookBalance - statementBalance)
  };
}

/**
 * Create bank reconciliation
 */
export async function createBankReconciliation(
  companyId: string,
  input: BankReconciliationInput,
  userId?: string
) {
  // Calculate summary
  const summary = await calculateReconciliationSummary(
    input.bank_account_id,
    input.statement_balance,
    input.items
  );

  // Create reconciliation header
  const [reconciliation] = await db
    .insert(bank_reconciliations)
    .values({
      company_id: companyId,
      bank_account_id: input.bank_account_id,
      reconciliation_date: input.reconciliation_date,
      statement_balance: input.statement_balance.toString(),
      book_balance: summary.book_balance.toString(),
      difference: summary.difference.toString(),
      status: summary.difference < 0.01 ? 'completed' : 'in_progress',
      notes: input.notes,
      created_by: userId
    })
    .returning();

  // Create reconciliation items
  const itemsToInsert = input.items.map(item => ({
    reconciliation_id: reconciliation.id,
    transaction_type: item.transaction_type,
    transaction_id: item.transaction_id,
    amount: item.amount.toString(),
    transaction_date: item.date,
    description: item.description,
    cleared: item.cleared
  }));

  await db.insert(bank_reconciliation_items).values(itemsToInsert);

  // Mark cleared transactions as reconciled
  const clearedItems = input.items.filter(item => item.cleared && item.transaction_id);
  
  for (const item of clearedItems) {
    if (item.transaction_type === 'payment') {
      await db
        .update(payments)
        .set({ reconciled: true, reconciliation_id: reconciliation.id })
        .where(eq(payments.id, item.transaction_id!));
    } else if (item.transaction_type === 'receipt') {
      await db
        .update(receipts)
        .set({ reconciled: true, reconciliation_id: reconciliation.id })
        .where(eq(receipts.id, item.transaction_id!));
    }
  }

  return {
    ...reconciliation,
    summary
  };
}

/**
 * Get reconciliation by ID with items
 */
export async function getReconciliationById(reconciliationId: string) {
  const [reconciliation] = await db
    .select()
    .from(bank_reconciliations)
    .where(eq(bank_reconciliations.id, reconciliationId))
    .limit(1);

  if (!reconciliation) {
    return null;
  }

  const items = await db
    .select()
    .from(bank_reconciliation_items)
    .where(eq(bank_reconciliation_items.reconciliation_id, reconciliationId));

  return {
    ...reconciliation,
    items
  };
}

/**
 * Get reconciliations for a bank account
 */
export async function getReconciliationsByBankAccount(
  companyId: string,
  bankAccountId: string
) {
  return await db
    .select()
    .from(bank_reconciliations)
    .where(
      and(
        eq(bank_reconciliations.company_id, companyId),
        eq(bank_reconciliations.bank_account_id, bankAccountId)
      )
    )
    .orderBy(sql`${bank_reconciliations.reconciliation_date} DESC`);
}

/**
 * Update reconciliation status
 */
export async function updateReconciliationStatus(
  reconciliationId: string,
  status: 'in_progress' | 'completed' | 'cancelled'
) {
  const [updated] = await db
    .update(bank_reconciliations)
    .set({ status })
    .where(eq(bank_reconciliations.id, reconciliationId))
    .returning();

  return updated;
}

/**
 * Delete reconciliation (and unmark transactions)
 */
export async function deleteReconciliation(
  companyId: string,
  reconciliationId: string
) {
  // Get items first
  const items = await db
    .select()
    .from(bank_reconciliation_items)
    .where(eq(bank_reconciliation_items.reconciliation_id, reconciliationId));

  // Unmark transactions
  for (const item of items) {
    if (item.transaction_id) {
      if (item.transaction_type === 'payment') {
        await db
          .update(payments)
          .set({ reconciled: false, reconciliation_id: null })
          .where(eq(payments.id, item.transaction_id));
      } else if (item.transaction_type === 'receipt') {
        await db
          .update(receipts)
          .set({ reconciled: false, reconciliation_id: null })
          .where(eq(receipts.id, item.transaction_id));
      }
    }
  }

  // Delete items
  await db
    .delete(bank_reconciliation_items)
    .where(eq(bank_reconciliation_items.reconciliation_id, reconciliationId));

  // Delete reconciliation
  const deleted = await db
    .delete(bank_reconciliations)
    .where(
      and(
        eq(bank_reconciliations.id, reconciliationId),
        eq(bank_reconciliations.company_id, companyId)
      )
    )
    .returning();

  return deleted.length > 0;
}

/**
 * Get bank account balance
 */
export async function getBankAccountBalance(
  companyId: string,
  bankAccountId: string,
  asOfDate?: Date
) {
  let receiptTotal = 0;
  let paymentTotal = 0;

  const receiptConditions = [
    eq(receipts.company_id, companyId),
    eq(receipts.bank_account_id, bankAccountId),
    eq(receipts.status, 'received')
  ];

  if (asOfDate) {
    receiptConditions.push(sql`${receipts.date} <= ${asOfDate}`);
  }

  const receiptsResult = await db
    .select({
      total: sql<string>`COALESCE(SUM(${receipts.amount}::numeric), 0)`
    })
    .from(receipts)
    .where(and(...receiptConditions));

  receiptTotal = parseFloat(receiptsResult[0]?.total || '0');

  const paymentConditions = [
    eq(payments.company_id, companyId),
    eq(payments.bank_account_id, bankAccountId),
    eq(payments.status, 'paid')
  ];

  if (asOfDate) {
    paymentConditions.push(sql`${payments.date} <= ${asOfDate}`);
  }

  const paymentsResult = await db
    .select({
      total: sql<string>`COALESCE(SUM(${payments.amount}::numeric), 0)`
    })
    .from(payments)
    .where(and(...paymentConditions));

  paymentTotal = parseFloat(paymentsResult[0]?.total || '0');

  // Get bank account opening balance
  const [bankAccount] = await db
    .select()
    .from(bank_accounts)
    .where(eq(bank_accounts.id, bankAccountId))
    .limit(1);

  const openingBalance = parseFloat(bankAccount?.opening_balance || '0');

  return {
    opening_balance: openingBalance,
    total_receipts: receiptTotal,
    total_payments: paymentTotal,
    current_balance: openingBalance + receiptTotal - paymentTotal
  };
}
