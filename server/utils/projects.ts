import { db } from "../db";
import { projects, journal_lines, accounts, expenses as expensesTable } from "@shared/schema";
import { eq, and, sum, desc, isNull } from "drizzle-orm";

export async function getProjectFinancials(projectId: string) {
  // Get all journal lines associated with this project
  const lines = await db
    .select({
      accountType: accounts.account_type,
      accountCategory: accounts.account_subtype,
      debit: journal_lines.base_debit,
      credit: journal_lines.base_credit,
    })
    .from(journal_lines)
    .innerJoin(accounts, eq(journal_lines.account_id, accounts.id))
    .where(eq(journal_lines.project_id, projectId));

  let revenue = 0;
  let expenses = 0;
  let assets = 0;
  let liabilities = 0;
  let equity = 0;

  for (const line of lines) {
    const amount = Number(line.debit) - Number(line.credit);
    // In accounting:
    // Assets/Expenses: Debit is positive
    // Liabilities/Equity/Revenue: Credit is positive (so Debit - Credit is negative)

    if (line.accountType === "asset") {
      assets += amount;
    } else if (line.accountType === "liability") {
      liabilities += -amount; // Flip sign
    } else if (line.accountType === "equity") {
      equity += -amount; // Flip sign
    } else if (line.accountType === "revenue") {
      revenue += -amount; // Flip sign
    } else if (line.accountType === "expense") {
      expenses += amount;
    }
  }

  // Get direct expenses not yet journaled
  const directExpenses = await db
    .select({
      amount: expensesTable.amount,
    })
    .from(expensesTable)
    .where(and(
      eq(expensesTable.project_id, projectId),
      isNull(expensesTable.journal_id)
    ));

  for (const exp of directExpenses) {
    expenses += Number(exp.amount);
  }

  return {
    revenue,
    expenses,
    profit: revenue - expenses,
    assets,
    liabilities,
    equity
  };
}

export async function getProjectTransactions(projectId: string) {
  const journalLines = await db.query.journal_lines.findMany({
    where: eq(journal_lines.project_id, projectId),
    with: {
      account: true,
      journal: true
    },
    orderBy: [desc(journal_lines.id)]
  });

  const directExpenses = await db
    .select()
    .from(expensesTable)
    .where(and(
      eq(expensesTable.project_id, projectId),
      isNull(expensesTable.journal_id)
    ));

  // Map expenses to match journal line structure
  const expenseLines = directExpenses.map(exp => ({
    id: exp.id,
    description: exp.description || `Expense: ${exp.category}`,
    base_debit: exp.amount,
    base_credit: "0",
    account: { name: exp.category || "Expense" },
    journal: { date: exp.date, description: exp.description }
  }));

  // Combine and sort by date (descending)
  return [...journalLines, ...expenseLines].sort((a, b) => {
    const dateA = new Date(a.journal?.date || 0).getTime();
    const dateB = new Date(b.journal?.date || 0).getTime();
    return dateB - dateA;
  });
}
