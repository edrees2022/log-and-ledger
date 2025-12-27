import { db } from "../db";
import { accounts, journal_lines, journals, companies } from "@shared/schema";
import { eq, and, sql, gte, lte, inArray } from "drizzle-orm";

export interface ReportFilters {
  company_id: string;
  start_date?: Date;
  end_date?: Date;
  fiscal_year?: number;
}

export interface AccountBalance {
  account_id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  parent_id: string | null;
  debit: number;
  credit: number;
  balance: number;
}

/**
 * Get account balances for a period
 */
export async function getAccountBalances(
  filters: ReportFilters
): Promise<AccountBalance[]> {
  // Build date conditions
  let dateConditions = eq(journals.company_id, filters.company_id);
  
  if (filters.start_date) {
    dateConditions = and(
      dateConditions,
      gte(journals.date, filters.start_date)
    ) as any;
  }
  
  if (filters.end_date) {
    dateConditions = and(
      dateConditions,
      lte(journals.date, filters.end_date)
    ) as any;
  }

  // Get all journal lines with account info
  const balances = await db
    .select({
      account_id: accounts.id,
      account_code: accounts.code,
      account_name: accounts.name,
      account_type: accounts.account_type,
      parent_id: accounts.parent_id,
      total_debit: sql<number>`COALESCE(SUM(CAST(${journal_lines.debit} AS NUMERIC)), 0)`,
      total_credit: sql<number>`COALESCE(SUM(CAST(${journal_lines.credit} AS NUMERIC)), 0)`,
    })
    .from(accounts)
    .leftJoin(journal_lines, eq(journal_lines.account_id, accounts.id))
    .leftJoin(journals, eq(journal_lines.journal_id, journals.id))
    .where(
      and(
        eq(accounts.company_id, filters.company_id),
        dateConditions
      )
    )
    .groupBy(
      accounts.id,
      accounts.code,
      accounts.name,
      accounts.account_type,
      accounts.parent_id
    );

  return balances.map((row) => {
    const debit = Number(row.total_debit) || 0;
    const credit = Number(row.total_credit) || 0;
    
    // Calculate balance based on account type
    const normalDebitTypes = ['asset', 'expense', 'cost_of_goods_sold'];
    const balance = normalDebitTypes.includes(row.account_type.toLowerCase())
      ? debit - credit
      : credit - debit;

    return {
      account_id: row.account_id,
      account_code: row.account_code,
      account_name: row.account_name,
      account_type: row.account_type,
      parent_id: row.parent_id,
      debit,
      credit,
      balance,
    };
  });
}

/**
 * Generate Balance Sheet
 */
export async function generateBalanceSheet(filters: ReportFilters) {
  const balances = await getAccountBalances(filters);

  const assets = balances.filter((b) => b.account_type.toLowerCase() === 'asset');
  const liabilities = balances.filter((b) => b.account_type.toLowerCase() === 'liability');
  const equity = balances.filter((b) => b.account_type.toLowerCase() === 'equity');

  const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.balance, 0);
  const totalEquity = equity.reduce((sum, e) => sum + e.balance, 0);

  return {
    report_name: "Balance Sheet",
    as_of_date: filters.end_date || new Date(),
    company_id: filters.company_id,
    assets: {
      accounts: assets,
      total: totalAssets,
    },
    liabilities: {
      accounts: liabilities,
      total: totalLiabilities,
    },
    equity: {
      accounts: equity,
      total: totalEquity,
    },
    total_liabilities_equity: totalLiabilities + totalEquity,
    balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
  };
}

/**
 * Generate Profit & Loss Statement (Income Statement)
 */
export async function generateProfitLoss(filters: ReportFilters) {
  const balances = await getAccountBalances(filters);

  const revenue = balances.filter((b) => 
    b.account_type.toLowerCase() === 'revenue' || 
    b.account_type.toLowerCase() === 'income'
  );
  
  const expenses = balances.filter((b) => b.account_type.toLowerCase() === 'expense');
  const cogs = balances.filter((b) => b.account_type.toLowerCase() === 'cost_of_goods_sold');

  const totalRevenue = revenue.reduce((sum, r) => sum + r.balance, 0);
  const totalCOGS = cogs.reduce((sum, c) => sum + c.balance, 0);
  const grossProfit = totalRevenue - totalCOGS;
  
  const totalExpenses = expenses.reduce((sum, e) => sum + e.balance, 0);
  const netIncome = grossProfit - totalExpenses;

  return {
    report_name: "Profit & Loss Statement",
    period_start: filters.start_date,
    period_end: filters.end_date || new Date(),
    company_id: filters.company_id,
    revenue: {
      accounts: revenue,
      total: totalRevenue,
    },
    cost_of_goods_sold: {
      accounts: cogs,
      total: totalCOGS,
    },
    gross_profit: grossProfit,
    expenses: {
      accounts: expenses,
      total: totalExpenses,
    },
    net_income: netIncome,
  };
}

/**
 * Generate Trial Balance
 */
export async function generateTrialBalance(filters: ReportFilters) {
  const balances = await getAccountBalances(filters);

  const totalDebits = balances.reduce((sum, b) => sum + b.debit, 0);
  const totalCredits = balances.reduce((sum, b) => sum + b.credit, 0);

  return {
    report_name: "Trial Balance",
    as_of_date: filters.end_date || new Date(),
    company_id: filters.company_id,
    accounts: balances,
    total_debits: totalDebits,
    total_credits: totalCredits,
    balanced: Math.abs(totalDebits - totalCredits) < 0.01,
    difference: totalDebits - totalCredits,
  };
}

/**
 * Generate Cash Flow Statement (simplified)
 */
export async function generateCashFlow(filters: ReportFilters) {
  const balances = await getAccountBalances(filters);

  // This is a simplified version - a full cash flow would require indirect method calculations
  const cashAccounts = balances.filter((b) => 
    b.account_name.toLowerCase().includes('cash') ||
    b.account_name.toLowerCase().includes('bank')
  );

  const totalCashFlow = cashAccounts.reduce((sum, c) => sum + c.balance, 0);

  return {
    report_name: "Cash Flow Statement",
    period_start: filters.start_date,
    period_end: filters.end_date || new Date(),
    company_id: filters.company_id,
    cash_accounts: cashAccounts,
    total_cash: totalCashFlow,
    // TODO: Add operating, investing, financing activities breakdown
  };
}

/**
 * Generate Accounts Receivable Aging Report
 */
export async function generateARAgingReport(companyId: string, asOfDate: Date = new Date()) {
  const { sales_invoices } = await import("../../shared/schema");
  
  const invoices = await db
    .select()
    .from(sales_invoices)
    .where(
      and(
        eq(sales_invoices.company_id, companyId),
        inArray(sales_invoices.status, ['sent', 'partial', 'overdue'])
      )
    );

  const aging = {
    current: [] as any[],        // 0-30 days
    days_31_60: [] as any[],     // 31-60 days
    days_61_90: [] as any[],     // 61-90 days
    over_90: [] as any[],        // 90+ days
  };

  for (const invoice of invoices) {
    const daysOverdue = Math.floor(
      (asOfDate.getTime() - invoice.due_date.getTime()) / (1000 * 60 * 60 * 24)
    );

    const outstanding = parseFloat(invoice.total.toString()) - 
                       parseFloat(invoice.paid_amount.toString());

    const item = {
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      customer_id: invoice.customer_id,
      due_date: invoice.due_date,
      total: parseFloat(invoice.total.toString()),
      paid: parseFloat(invoice.paid_amount.toString()),
      outstanding,
      days_overdue: daysOverdue,
    };

    if (daysOverdue <= 0) {
      aging.current.push(item);
    } else if (daysOverdue <= 30) {
      aging.current.push(item);
    } else if (daysOverdue <= 60) {
      aging.days_31_60.push(item);
    } else if (daysOverdue <= 90) {
      aging.days_61_90.push(item);
    } else {
      aging.over_90.push(item);
    }
  }

  return {
    report_name: "Accounts Receivable Aging",
    as_of_date: asOfDate,
    company_id: companyId,
    aging,
    totals: {
      current: aging.current.reduce((sum, i) => sum + i.outstanding, 0),
      days_31_60: aging.days_31_60.reduce((sum, i) => sum + i.outstanding, 0),
      days_61_90: aging.days_61_90.reduce((sum, i) => sum + i.outstanding, 0),
      over_90: aging.over_90.reduce((sum, i) => sum + i.outstanding, 0),
    },
  };
}
