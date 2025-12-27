import { db } from "../db";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type * as schema from "@shared/schema";

/**
 * Execute a function within a database transaction
 * Ensures atomicity of operations - all succeed or all fail
 */
export async function withTransaction<T>(
  callback: (tx: NeonDatabase<typeof schema>) => Promise<T>
): Promise<T> {
  return await db.transaction(async (tx) => {
    return await callback(tx);
  });
}

/**
 * Validate double-entry accounting rule: Debits must equal Credits
 */
export function validateDoubleEntry(
  journalLines: Array<{ debit: string; credit: string }>
): { isValid: boolean; error?: string } {
  let totalDebits = 0;
  let totalCredits = 0;

  for (const line of journalLines) {
    totalDebits += parseFloat(line.debit) || 0;
    totalCredits += parseFloat(line.credit) || 0;
  }

  const difference = Math.abs(totalDebits - totalCredits);
  
  // Allow for floating point precision errors (less than 0.01)
  if (difference > 0.01) {
    return {
      isValid: false,
      error: `Double-entry validation failed: Debits (${totalDebits.toFixed(2)}) must equal Credits (${totalCredits.toFixed(2)}). Difference: ${difference.toFixed(2)}`
    };
  }

  return { isValid: true };
}

/**
 * Calculate balance for an account based on its type
 */
export function calculateAccountBalance(
  accountType: string,
  debit: number,
  credit: number
): number {
  const normalDebitAccounts = ['asset', 'expense', 'cost_of_goods_sold'];
  const normalCreditAccounts = ['liability', 'equity', 'revenue', 'income'];

  if (normalDebitAccounts.includes(accountType.toLowerCase())) {
    return debit - credit;
  } else if (normalCreditAccounts.includes(accountType.toLowerCase())) {
    return credit - debit;
  }

  // Default to debit - credit
  return debit - credit;
}

/**
 * Validate fiscal period is open before posting
 */
export async function validateFiscalPeriod(
  companyId: string,
  transactionDate: Date
): Promise<{ isValid: boolean; error?: string }> {
  // TODO: Query fiscal_periods table once it's populated
  // For now, allow all transactions
  return { isValid: true };
}
