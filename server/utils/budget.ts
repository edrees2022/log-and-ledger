import { db } from "../db";
import { budgets, journal_lines, journals, accounts } from "@shared/schema";
import { eq, and, sql, sum, gte, lte } from "drizzle-orm";

export interface BudgetVsActualLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  monthlyBudget: Record<string, number>;
  monthlyActual: Record<string, number>;
}

export interface BudgetVsActualSummary {
  totalRevenueBudget: number;
  totalRevenueActual: number;
  totalExpenseBudget: number;
  totalExpenseActual: number;
  netBudget: number;
  netActual: number;
  netVariance: number;
}

export interface BudgetVsActualReport {
  lines: BudgetVsActualLine[];
  summary: BudgetVsActualSummary;
}

export async function getBudgetVsActual(
  companyId: string,
  fiscalYear: number,
  period?: number // 1-12, if null then full year
): Promise<BudgetVsActualReport> {
  
  // 1. Get Budgets for the year with account details
  const budgetRecords = await db.select()
    .from(budgets)
    .innerJoin(accounts, eq(budgets.account_id, accounts.id))
    .where(and(
      eq(budgets.company_id, companyId),
      eq(budgets.fiscal_year, fiscalYear)
    ));

  // 2. Get Actuals per month
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                  'july', 'august', 'september', 'october', 'november', 'december'];
  
  // Build date filter
  let startDate: Date;
  let endDate: Date;
  
  if (period) {
    startDate = new Date(fiscalYear, period - 1, 1);
    endDate = new Date(fiscalYear, period, 0);
  } else {
    startDate = new Date(fiscalYear, 0, 1);
    endDate = new Date(fiscalYear, 11, 31);
  }

  // Get actuals grouped by account
  // For expense accounts: debit increases, credit decreases
  // For revenue accounts: credit increases, debit decreases
  const actuals = await db.select({
    accountId: journal_lines.account_id,
    debitSum: sum(journal_lines.base_debit),
    creditSum: sum(journal_lines.base_credit)
  })
  .from(journal_lines)
  .innerJoin(journals, eq(journal_lines.journal_id, journals.id))
  .where(and(
    eq(journals.company_id, companyId),
    gte(journals.date, startDate),
    lte(journals.date, endDate)
  ))
  .groupBy(journal_lines.account_id);

  const actualMap = new Map<string, { debit: number; credit: number }>();
  actuals.forEach(a => {
    actualMap.set(a.accountId, {
      debit: parseFloat(a.debitSum || '0'),
      credit: parseFloat(a.creditSum || '0')
    });
  });

  // 3. Build report lines
  const lines: BudgetVsActualLine[] = budgetRecords.map(record => {
    const b = record.budgets;
    const acc = record.accounts;
    
    // Get budget amount
    let budgetAmount = 0;
    const monthlyBudget: Record<string, number> = {};
    
    months.forEach((month, idx) => {
      const monthCol = month as keyof typeof b;
      const val = parseFloat(b[monthCol]?.toString() || '0');
      monthlyBudget[month] = val;
      
      if (period) {
        if (idx === period - 1) {
          budgetAmount = val;
        }
      } else {
        budgetAmount += val;
      }
    });

    // Get actual amount based on account type
    const actualData = actualMap.get(acc.id) || { debit: 0, credit: 0 };
    let actualAmount = 0;
    
    if (acc.account_type === 'expense') {
      // Expenses: Debit increases expense
      actualAmount = actualData.debit - actualData.credit;
    } else if (acc.account_type === 'revenue') {
      // Revenue: Credit increases revenue
      actualAmount = actualData.credit - actualData.debit;
    } else {
      // Other types: Use net debit
      actualAmount = actualData.debit - actualData.credit;
    }

    // Calculate variance
    // For Expense: Positive variance (Budget > Actual) is GOOD (under budget)
    // For Revenue: Negative variance (Budget < Actual) is GOOD (over budget)
    const variance = budgetAmount - actualAmount;
    const variancePercentage = budgetAmount !== 0 ? (variance / budgetAmount) * 100 : 0;

    return {
      accountId: acc.id,
      accountCode: acc.code,
      accountName: acc.name,
      accountType: acc.account_type,
      budgetAmount,
      actualAmount,
      variance,
      variancePercentage,
      monthlyBudget,
      monthlyActual: {} // Could be enhanced to show monthly actuals
    };
  });

  // 4. Calculate summary
  const summary: BudgetVsActualSummary = {
    totalRevenueBudget: 0,
    totalRevenueActual: 0,
    totalExpenseBudget: 0,
    totalExpenseActual: 0,
    netBudget: 0,
    netActual: 0,
    netVariance: 0
  };

  lines.forEach(line => {
    if (line.accountType === 'revenue') {
      summary.totalRevenueBudget += line.budgetAmount;
      summary.totalRevenueActual += line.actualAmount;
    } else if (line.accountType === 'expense') {
      summary.totalExpenseBudget += line.budgetAmount;
      summary.totalExpenseActual += line.actualAmount;
    }
  });

  summary.netBudget = summary.totalRevenueBudget - summary.totalExpenseBudget;
  summary.netActual = summary.totalRevenueActual - summary.totalExpenseActual;
  summary.netVariance = summary.netActual - summary.netBudget;

  return { lines, summary };
}


