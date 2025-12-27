import { db } from "../db";
import { journals, journal_lines, accounts } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { getNextDocumentNumber } from "./documentSequence";

export interface JournalLineInput {
  account_id: string;
  debit: number;
  credit: number;
  description?: string;
  project_id?: string;
}

export interface JournalEntryInput {
  company_id: string;
  date: Date;
  source_type?: string; // 'invoice', 'bill', 'payment', 'receipt', 'manual'
  source_id?: string;
  description: string;
  lines: JournalLineInput[];
  created_by?: string;
  currency?: string;
  fx_rate?: number;
}

/**
 * Create a journal entry with multiple lines
 * Validates that debits = credits before saving
 */
export async function createJournalEntry(
  input: JournalEntryInput
): Promise<{ id: string; journal_number: string }> {
  // Validate debits = credits
  const totalDebits = input.lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredits = input.lines.reduce((sum, line) => sum + line.credit, 0);
  
  const epsilon = 0.01;
  if (Math.abs(totalDebits - totalCredits) > epsilon) {
    throw new Error(
      `Journal entry must balance: Debits=${totalDebits.toFixed(2)}, Credits=${totalCredits.toFixed(2)}`
    );
  }

  // Generate journal number
  const journalNumber = await getNextDocumentNumber(
    input.company_id,
    "payment", // Using payment as journal type
    "JE"
  );

  const currency = input.currency || "USD";
  const fxRate = input.fx_rate || 1;

  // Create journal header
  const [journal] = await db
    .insert(journals)
    .values({
      company_id: input.company_id,
      journal_number: journalNumber,
      date: input.date,
      source_type: input.source_type || "manual",
      source_id: input.source_id,
      description: input.description,
      total_amount: totalDebits.toString(),
      created_by: input.created_by,
    })
    .returning();

  // Create journal lines
  const lineValues = input.lines.map((line, index) => ({
    journal_id: journal.id,
    line_number: index + 1,
    account_id: line.account_id,
    debit: line.debit.toString(),
    credit: line.credit.toString(),
    description: line.description || input.description,
    currency: currency,
    fx_rate: fxRate.toString(),
    base_debit: (line.debit * fxRate).toString(),
    base_credit: (line.credit * fxRate).toString(),
    project_id: line.project_id,
  }));

  await db.insert(journal_lines).values(lineValues);

  return { id: journal.id, journal_number: journalNumber };
}

/**
 * Create journal entry for a sales invoice
 * DR: Accounts Receivable
 * CR: Sales Revenue
 * CR: Tax Payable (if applicable)
 */
export async function createInvoiceJournalEntry(
  companyId: string,
  invoiceId: string,
  customerId: string,
  invoiceNumber: string,
  subtotal: number,
  taxTotal: number,
  total: number,
  date: Date,
  userId?: string,
  currency: string = "USD",
  fxRate: number = 1,
  invoiceLines?: any[]
): Promise<{ id: string; journal_number: string } | null> {
  try {
    // Find default accounts
    const accountsList = await db
      .select()
      .from(accounts)
      .where(eq(accounts.company_id, companyId));

    const arAccount = accountsList.find(
      (a) => a.account_subtype === "accounts_receivable" || a.code === "1200"
    );
    const revenueAccount = accountsList.find(
      (a) => a.account_subtype === "sales_revenue" || a.code === "4000"
    );
    const taxPayableAccount = accountsList.find(
      (a) => a.account_type === "liability" && a.name.toLowerCase().includes("tax")
    );

    if (!arAccount || !revenueAccount) {
      console.warn("Missing default accounts for invoice journal entry");
      return null;
    }

    const lines: JournalLineInput[] = [
      {
        account_id: arAccount.id,
        debit: total,
        credit: 0,
        description: `Invoice ${invoiceNumber} - Customer Receivable`,
      }
    ];

    // If we have invoice lines with project IDs, we should split the revenue
    if (invoiceLines && invoiceLines.length > 0) {
      for (const line of invoiceLines) {
        const lineAmount = parseFloat(line.amount || line.line_total || 0);
        if (lineAmount > 0) {
          lines.push({
            account_id: revenueAccount.id, // Could be overridden per line if we had item accounts
            debit: 0,
            credit: lineAmount,
            description: `Invoice ${invoiceNumber} - ${line.description}`,
            project_id: line.project_id
          });
        }
      }
    } else {
      // Fallback to single revenue line
      lines.push({
        account_id: revenueAccount.id,
        debit: 0,
        credit: subtotal,
        description: `Invoice ${invoiceNumber} - Sales Revenue`,
      });
    }

    // Add tax line if applicable
    if (taxTotal > 0 && taxPayableAccount) {
      lines.push({
        account_id: taxPayableAccount.id,
        debit: 0,
        credit: taxTotal,
        description: `Invoice ${invoiceNumber} - Tax Payable`,
      });
    }

    return await createJournalEntry({
      company_id: companyId,
      date: date,
      source_type: "invoice",
      source_id: invoiceId,
      description: `Sales Invoice ${invoiceNumber}`,
      lines,
      created_by: userId,
      currency,
      fx_rate: fxRate,
    });
  } catch (error) {
    console.error("Error creating invoice journal entry:", error);
    return null;
  }
}

/**
 * Create journal entry for a bill/purchase
 * DR: Expense/Inventory
 * DR: Tax Receivable (if applicable)
 * CR: Accounts Payable
 */
export async function createBillJournalEntry(
  companyId: string,
  billId: string,
  vendorId: string,
  billNumber: string,
  subtotal: number,
  taxTotal: number,
  total: number,
  date: Date,
  userId?: string,
  currency: string = "USD",
  fxRate: number = 1,
  projectId?: string
): Promise<{ id: string; journal_number: string } | null> {
  try {
    const accountsList = await db
      .select()
      .from(accounts)
      .where(eq(accounts.company_id, companyId));

    const apAccount = accountsList.find(
      (a) => a.account_subtype === "accounts_payable" || a.code === "2100"
    );
    const expenseAccount = accountsList.find(
      (a) => a.account_subtype === "operating_expense" || a.code === "5000"
    );
    const taxReceivableAccount = accountsList.find(
      (a) => a.account_type === "asset" && a.name.toLowerCase().includes("tax")
    );

    if (!apAccount || !expenseAccount) {
      console.warn("Missing default accounts for bill journal entry");
      return null;
    }

    const lines: JournalLineInput[] = [
      {
        account_id: expenseAccount.id,
        debit: subtotal,
        credit: 0,
        description: `Bill ${billNumber} - Purchase Expense`,
        project_id: projectId,
      },
    ];

    // Add tax line if applicable
    if (taxTotal > 0 && taxReceivableAccount) {
      lines.push({
        account_id: taxReceivableAccount.id,
        debit: taxTotal,
        credit: 0,
        description: `Bill ${billNumber} - Input Tax`,
      });
    }

    lines.push({
      account_id: apAccount.id,
      debit: 0,
      credit: total,
      description: `Bill ${billNumber} - Accounts Payable`,
    });

    return await createJournalEntry({
      company_id: companyId,
      date: date,
      source_type: "bill",
      source_id: billId,
      description: `Purchase Bill ${billNumber}`,
      lines,
      created_by: userId,
      currency,
      fx_rate: fxRate,
    });
  } catch (error) {
    console.error("Error creating bill journal entry:", error);
    return null;
  }
}

/**
 * Create journal entry for a payment received (receipt)
 * DR: Bank/Cash
 * CR: Accounts Receivable
 */
export async function createReceiptJournalEntry(
  companyId: string,
  receiptId: string,
  receiptNumber: string,
  amount: number,
  bankAccountId: string,
  date: Date,
  userId?: string,
  currency: string = "USD",
  fxRate: number = 1
): Promise<{ id: string; journal_number: string } | null> {
  try {
    const accountsList = await db
      .select()
      .from(accounts)
      .where(eq(accounts.company_id, companyId));

    const arAccount = accountsList.find(
      (a) => a.account_subtype === "accounts_receivable"
    );
    const cashAccount = accountsList.find(
      (a) => a.account_subtype === "cash" || a.code === "1100"
    );

    if (!arAccount || !cashAccount) {
      console.warn("Missing default accounts for receipt journal entry");
      return null;
    }

    const lines: JournalLineInput[] = [
      {
        account_id: cashAccount.id,
        debit: amount,
        credit: 0,
        description: `Receipt ${receiptNumber} - Cash Received`,
      },
      {
        account_id: arAccount.id,
        debit: 0,
        credit: amount,
        description: `Receipt ${receiptNumber} - Reduce Receivable`,
      },
    ];

    return await createJournalEntry({
      company_id: companyId,
      date: date,
      source_type: "receipt",
      source_id: receiptId,
      description: `Customer Receipt ${receiptNumber}`,
      lines,
      created_by: userId,
      currency,
      fx_rate: fxRate,
    });
  } catch (error) {
    console.error("Error creating receipt journal entry:", error);
    return null;
  }
}

/**
 * Create journal entry for a payment made
 * DR: Accounts Payable
 * CR: Bank/Cash
 */
export async function createPaymentJournalEntry(
  companyId: string,
  paymentId: string,
  paymentNumber: string,
  amount: number,
  bankAccountId: string,
  date: Date,
  userId?: string,
  currency: string = "USD",
  fxRate: number = 1
): Promise<{ id: string; journal_number: string } | null> {
  try {
    const accountsList = await db
      .select()
      .from(accounts)
      .where(eq(accounts.company_id, companyId));

    const apAccount = accountsList.find(
      (a) => a.account_subtype === "accounts_payable"
    );
    const cashAccount = accountsList.find(
      (a) => a.account_subtype === "cash" || a.code === "1100"
    );

    if (!apAccount || !cashAccount) {
      console.warn("Missing default accounts for payment journal entry");
      return null;
    }

    const lines: JournalLineInput[] = [
      {
        account_id: apAccount.id,
        debit: amount,
        credit: 0,
        description: `Payment ${paymentNumber} - Reduce Payable`,
      },
      {
        account_id: cashAccount.id,
        debit: 0,
        credit: amount,
        description: `Payment ${paymentNumber} - Cash Paid`,
      },
    ];

    return await createJournalEntry({
      company_id: companyId,
      date: date,
      source_type: "payment",
      source_id: paymentId,
      description: `Vendor Payment ${paymentNumber}`,
      lines,
      created_by: userId,
      currency,
      fx_rate: fxRate,
    });
  } catch (error) {
    console.error("Error creating payment journal entry:", error);
    return null;
  }
}

/**
 * Get journal entries for a company
 */
export async function getJournalEntries(companyId: string) {
  return await db
    .select()
    .from(journals)
    .where(eq(journals.company_id, companyId))
    .orderBy(journals.date);
}

/**
 * Get journal lines for a journal
 */
export async function getJournalLines(journalId: string) {
  return await db
    .select()
    .from(journal_lines)
    .where(eq(journal_lines.journal_id, journalId));
}

/**
 * Reverse a journal entry (create offsetting entry)
 */
export async function reverseJournalEntry(
  journalId: string,
  reversalDate: Date,
  reason: string,
  userId?: string
): Promise<{ id: string; journal_number: string }> {
  const [journal] = await db
    .select()
    .from(journals)
    .where(eq(journals.id, journalId))
    .limit(1);

  if (!journal) {
    throw new Error("Journal entry not found");
  }

  const lines = await getJournalLines(journalId);

  // Reverse debits and credits
  const reversedLines: JournalLineInput[] = lines.map((line) => ({
    account_id: line.account_id,
    debit: parseFloat(line.credit),
    credit: parseFloat(line.debit),
    description: `Reversal: ${line.description}`,
  }));

  return await createJournalEntry({
    company_id: journal.company_id,
    date: reversalDate,
    source_type: "reversal",
    source_id: journalId,
    description: `Reversal of ${journal.journal_number}: ${reason}`,
    lines: reversedLines,
    created_by: userId,
  });
}
