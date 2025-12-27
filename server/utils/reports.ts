import { db } from "../db";
import { journals, journal_lines, accounts, companies } from "@shared/schema";
import { eq, and, lte, gte, sql, sum, or } from "drizzle-orm";

export interface TrialBalanceLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  openingBalance: number;
  debit: number;
  credit: number;
  netMovement: number;
  closingBalance: number;
}

export interface BalanceSheetLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType?: string;
  accountSubtype?: string;
  balance: number;
  level?: number;
  children?: BalanceSheetLine[];
}

export async function getTrialBalance(
  companyId: string, 
  startDate: Date, 
  endDate: Date
): Promise<TrialBalanceLine[]> {
  
  // 1. Get all accounts for the company
  const allAccounts = await db.select()
    .from(accounts)
    .where(eq(accounts.company_id, companyId))
    .orderBy(accounts.code);

  // 2. Calculate Opening Balances (before startDate)
  const openingBalances = await db.select({
    accountId: journal_lines.account_id,
    balance: sql<string>`sum(${journal_lines.base_debit} - ${journal_lines.base_credit})`
  })
  .from(journal_lines)
  .innerJoin(journals, eq(journal_lines.journal_id, journals.id))
  .where(and(
    eq(journals.company_id, companyId),
    sql`${journals.date} < ${startDate.toISOString()}`
  ))
  .groupBy(journal_lines.account_id);

  const openingMap = new Map<string, number>();
  openingBalances.forEach(r => {
    openingMap.set(r.accountId, parseFloat(r.balance || '0'));
  });

  // 3. Calculate Period Activity (startDate to endDate)
  const periodActivity = await db.select({
    accountId: journal_lines.account_id,
    debit: sum(journal_lines.base_debit),
    credit: sum(journal_lines.base_credit)
  })
  .from(journal_lines)
  .innerJoin(journals, eq(journal_lines.journal_id, journals.id))
  .where(and(
    eq(journals.company_id, companyId),
    gte(journals.date, startDate),
    lte(journals.date, endDate)
  ))
  .groupBy(journal_lines.account_id);

  const activityMap = new Map<string, { debit: number, credit: number }>();
  periodActivity.forEach(r => {
    activityMap.set(r.accountId, {
      debit: parseFloat(r.debit || '0'),
      credit: parseFloat(r.credit || '0')
    });
  });

  // 4. Combine results
  const report: TrialBalanceLine[] = allAccounts.map(acc => {
    const opening = openingMap.get(acc.id) || 0;
    const activity = activityMap.get(acc.id) || { debit: 0, credit: 0 };
    const netMovement = activity.debit - activity.credit;
    const closing = opening + netMovement;

    // Skip accounts with zero activity and zero balance
    if (Math.abs(opening) < 0.01 && Math.abs(activity.debit) < 0.01 && Math.abs(activity.credit) < 0.01) {
      return null;
    }

    return {
      accountId: acc.id,
      accountCode: acc.code,
      accountName: acc.name,
      accountType: acc.account_type,
      openingBalance: opening,
      debit: activity.debit,
      credit: activity.credit,
      netMovement: netMovement,
      closingBalance: closing
    };
  }).filter((line): line is TrialBalanceLine => line !== null);

  return report;
}

export interface GeneralLedgerLine {
  id: string;
  date: Date;
  journalNumber: string;
  description: string | null;
  reference: string | null;
  debit: number;
  credit: number;
  balance: number;
  accountName: string;
  accountCode: string;
}

export async function getGeneralLedger(
  companyId: string,
  accountId: string,
  startDate: Date,
  endDate: Date
): Promise<{ openingBalance: number; lines: GeneralLedgerLine[]; closingBalance: number }> {
  
  // 1. Calculate Opening Balance
  const openingResult = await db.select({
    balance: sql<string>`sum(${journal_lines.base_debit} - ${journal_lines.base_credit})`
  })
  .from(journal_lines)
  .innerJoin(journals, eq(journal_lines.journal_id, journals.id))
  .where(and(
    eq(journals.company_id, companyId),
    eq(journal_lines.account_id, accountId),
    sql`${journals.date} < ${startDate.toISOString()}`
  ));

  const openingBalance = parseFloat(openingResult[0]?.balance || '0');

  // 2. Get Transactions
  const transactions = await db.select({
    id: journal_lines.id,
    date: journals.date,
    journalNumber: journals.journal_number,
    description: journal_lines.description,
    reference: journals.reference,
    debit: journal_lines.base_debit,
    credit: journal_lines.base_credit,
    accountName: accounts.name,
    accountCode: accounts.code
  })
  .from(journal_lines)
  .innerJoin(journals, eq(journal_lines.journal_id, journals.id))
  .innerJoin(accounts, eq(journal_lines.account_id, accounts.id))
  .where(and(
    eq(journals.company_id, companyId),
    eq(journal_lines.account_id, accountId),
    gte(journals.date, startDate),
    lte(journals.date, endDate)
  ))
  .orderBy(journals.date, journals.created_at);

  // 3. Calculate Running Balance
  let currentBalance = openingBalance;
  const lines: GeneralLedgerLine[] = transactions.map(t => {
    const debit = parseFloat(t.debit?.toString() || '0');
    const credit = parseFloat(t.credit?.toString() || '0');
    currentBalance += (debit - credit);
    
    return {
      id: t.id,
      date: t.date,
      journalNumber: t.journalNumber,
      description: t.description,
      reference: t.reference,
      debit,
      credit,
      balance: currentBalance,
      accountName: t.accountName,
      accountCode: t.accountCode
    };
  });

  return {
    openingBalance,
    lines,
    closingBalance: currentBalance
  };
}

export interface FinancialStatementLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  accountSubtype: string;
  balance: number;
}

export async function getIncomeStatement(
  companyId: string,
  startDate: Date,
  endDate: Date
): Promise<{ revenue: FinancialStatementLine[]; expenses: FinancialStatementLine[]; netIncome: number }> {
  
  // Get balances for Revenue and Expense accounts
  const balances = await db.select({
    accountId: accounts.id,
    accountCode: accounts.code,
    accountName: accounts.name,
    accountType: accounts.account_type,
    accountSubtype: accounts.account_subtype,
    debit: sum(journal_lines.base_debit),
    credit: sum(journal_lines.base_credit)
  })
  .from(accounts)
  .leftJoin(journal_lines, eq(accounts.id, journal_lines.account_id))
  .leftJoin(journals, eq(journal_lines.journal_id, journals.id))
  .where(and(
    eq(accounts.company_id, companyId),
    sql`${accounts.account_type} IN ('revenue', 'expense')`,
    gte(journals.date, startDate),
    lte(journals.date, endDate)
  ))
  .groupBy(accounts.id, accounts.code, accounts.name, accounts.account_type, accounts.account_subtype)
  .orderBy(accounts.code);

  const revenue: FinancialStatementLine[] = [];
  const expenses: FinancialStatementLine[] = [];
  let totalRevenue = 0;
  let totalExpenses = 0;

  balances.forEach(b => {
    const debit = parseFloat(b.debit?.toString() || '0');
    const credit = parseFloat(b.credit?.toString() || '0');
    
    // For Revenue: Credit is positive
    // For Expense: Debit is positive
    let balance = 0;
    
    if (b.accountType === 'revenue') {
      balance = credit - debit;
      if (Math.abs(balance) > 0.01) {
        revenue.push({
          accountId: b.accountId,
          accountCode: b.accountCode,
          accountName: b.accountName,
          accountType: b.accountType,
          accountSubtype: b.accountSubtype,
          balance
        });
        totalRevenue += balance;
      }
    } else {
      balance = debit - credit;
      if (Math.abs(balance) > 0.01) {
        expenses.push({
          accountId: b.accountId,
          accountCode: b.accountCode,
          accountName: b.accountName,
          accountType: b.accountType,
          accountSubtype: b.accountSubtype,
          balance
        });
        totalExpenses += balance;
      }
    }
  });

  return {
    revenue,
    expenses,
    netIncome: totalRevenue - totalExpenses
  };
}

export async function getBalanceSheet(
  companyId: string,
  asOfDate: Date
): Promise<{ assets: FinancialStatementLine[]; liabilities: FinancialStatementLine[]; equity: FinancialStatementLine[]; totals: { assets: number; liabilities: number; equity: number } }> {
  
  // Get cumulative balances for Asset, Liability, Equity accounts up to asOfDate
  const balances = await db.select({
    accountId: accounts.id,
    accountCode: accounts.code,
    accountName: accounts.name,
    accountType: accounts.account_type,
    accountSubtype: accounts.account_subtype,
    debit: sum(journal_lines.base_debit),
    credit: sum(journal_lines.base_credit)
  })
  .from(accounts)
  .leftJoin(journal_lines, eq(accounts.id, journal_lines.account_id))
  .leftJoin(journals, eq(journal_lines.journal_id, journals.id))
  .where(and(
    eq(accounts.company_id, companyId),
    sql`${accounts.account_type} IN ('asset', 'liability', 'equity')`,
    lte(journals.date, asOfDate)
  ))
  .groupBy(accounts.id, accounts.code, accounts.name, accounts.account_type, accounts.account_subtype)
  .orderBy(accounts.code);

  const assets: FinancialStatementLine[] = [];
  const liabilities: FinancialStatementLine[] = [];
  const equity: FinancialStatementLine[] = [];
  
  let totalAssets = 0;
  let totalLiabilities = 0;
  let totalEquity = 0;

  balances.forEach(b => {
    const debit = parseFloat(b.debit?.toString() || '0');
    const credit = parseFloat(b.credit?.toString() || '0');
    let balance = 0;

    if (b.accountType === 'asset') {
      balance = debit - credit;
      if (Math.abs(balance) > 0.01) {
        assets.push({
          accountId: b.accountId,
          accountCode: b.accountCode,
          accountName: b.accountName,
          accountType: b.accountType,
          accountSubtype: b.accountSubtype,
          balance
        });
        totalAssets += balance;
      }
    } else if (b.accountType === 'liability') {
      balance = credit - debit;
      if (Math.abs(balance) > 0.01) {
        liabilities.push({
          accountId: b.accountId,
          accountCode: b.accountCode,
          accountName: b.accountName,
          accountType: b.accountType,
          accountSubtype: b.accountSubtype,
          balance
        });
        totalLiabilities += balance;
      }
    } else if (b.accountType === 'equity') {
      balance = credit - debit;
      if (Math.abs(balance) > 0.01) {
        equity.push({
          accountId: b.accountId,
          accountCode: b.accountCode,
          accountName: b.accountName,
          accountType: b.accountType,
          accountSubtype: b.accountSubtype,
          balance
        });
        totalEquity += balance;
      }
    }
  });

  // Calculate Net Income (Retained Earnings) for the period up to asOfDate
  // This is needed to balance the Balance Sheet (Assets = Liabilities + Equity + Net Income)
  const incomeResult = await db.select({
    debit: sum(journal_lines.base_debit),
    credit: sum(journal_lines.base_credit)
  })
  .from(journal_lines)
  .innerJoin(journals, eq(journal_lines.journal_id, journals.id))
  .innerJoin(accounts, eq(journal_lines.account_id, accounts.id))
  .where(and(
    eq(journals.company_id, companyId),
    sql`${accounts.account_type} IN ('revenue', 'expense')`,
    lte(journals.date, asOfDate)
  ));

  const incomeDebit = parseFloat(incomeResult[0]?.debit?.toString() || '0');
  const incomeCredit = parseFloat(incomeResult[0]?.credit?.toString() || '0');
  // Net Income = Revenue (Credit) - Expenses (Debit)
  // But here we just want the net credit balance of P&L accounts to add to Equity
  const netIncome = incomeCredit - incomeDebit;

  if (Math.abs(netIncome) > 0.01) {
    equity.push({
      accountId: 'calculated-retained-earnings',
      accountCode: 'RE',
      accountName: 'Retained Earnings (Calculated)',
      accountType: 'equity',
      accountSubtype: 'retained_earnings',
      balance: netIncome
    });
    totalEquity += netIncome;
  }

  return {
    assets,
    liabilities,
    equity,
    totals: {
      assets: totalAssets,
      liabilities: totalLiabilities,
      equity: totalEquity
    }
  };
}

export async function getConsolidatedBalanceSheet(parentCompanyId: string, asOfDate: Date) {
  // 1. Get all companies in the group (Parent + Children)
  const groupCompanies = await db.select()
    .from(companies)
    .where(or(
      eq(companies.id, parentCompanyId),
      eq(companies.parent_company_id, parentCompanyId)
    ));

  const consolidatedAssets: BalanceSheetLine[] = [];
  const consolidatedLiabilities: BalanceSheetLine[] = [];
  const consolidatedEquity: BalanceSheetLine[] = [];
  
  let totalAssets = 0;
  let totalLiabilities = 0;
  let totalEquity = 0;

  // 2. Iterate through each company and get its Balance Sheet
  for (const company of groupCompanies) {
    const bs = await getBalanceSheet(company.id, asOfDate);
    
    // 3. Aggregate Assets
    bs.assets.forEach(asset => {
      const existing = consolidatedAssets.find(a => a.accountCode === asset.accountCode);
      if (existing) {
        existing.balance += asset.balance;
      } else {
        consolidatedAssets.push({ ...asset, accountName: `${asset.accountName} (${company.name})` }); // Append company name for clarity for now, or merge by code
      }
      totalAssets += asset.balance;
    });

    // 4. Aggregate Liabilities
    bs.liabilities.forEach(liability => {
      const existing = consolidatedLiabilities.find(l => l.accountCode === liability.accountCode);
      if (existing) {
        existing.balance += liability.balance;
      } else {
        consolidatedLiabilities.push({ ...liability, accountName: `${liability.accountName} (${company.name})` });
      }
      totalLiabilities += liability.balance;
    });

    // 5. Aggregate Equity
    bs.equity.forEach(eqItem => {
      const existing = consolidatedEquity.find(e => e.accountCode === eqItem.accountCode);
      if (existing) {
        existing.balance += eqItem.balance;
      } else {
        consolidatedEquity.push({ ...eqItem, accountName: `${eqItem.accountName} (${company.name})` });
      }
      totalEquity += eqItem.balance;
    });
  }

  // TODO: Implement Elimination Entries here
  // We would look for inter-company balances and remove them.
  // For now, we return the aggregated view.

  return {
    assets: consolidatedAssets,
    liabilities: consolidatedLiabilities,
    equity: consolidatedEquity,
    totals: {
      assets: totalAssets,
      liabilities: totalLiabilities,
      equity: totalEquity
    },
    companies: groupCompanies.map(c => c.name)
  };
}

export async function getGlobalDashboardStats(parentCompanyId: string) {
  const groupCompanies = await db.select()
    .from(companies)
    .where(or(
      eq(companies.id, parentCompanyId),
      eq(companies.parent_company_id, parentCompanyId)
    ));

  const companyStats = [];
  const totals = {
    cash: 0,
    revenue: 0,
    expenses: 0,
    netIncome: 0
  };

  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  for (const company of groupCompanies) {
    // 1. Get Cash Position (Assets -> Cash/Bank)
    // Assets are Debit normal: Balance = Debit - Credit
    const cashBalanceResult = await db.select({
      debit: sum(journal_lines.base_debit),
      credit: sum(journal_lines.base_credit)
    })
    .from(accounts)
    .leftJoin(journal_lines, eq(accounts.id, journal_lines.account_id))
    .where(and(
      eq(accounts.company_id, company.id),
      or(eq(accounts.account_subtype, 'cash'), eq(accounts.account_subtype, 'bank'))
    ));

    const cash = (Number(cashBalanceResult[0]?.debit || 0) - Number(cashBalanceResult[0]?.credit || 0));

    // 2. Get Income Statement for YTD
    const incomeStmt = await getIncomeStatement(company.id, startOfYear, today);
    
    const revenue = incomeStmt.revenue.reduce((acc, curr) => acc + curr.balance, 0);
    const expenses = incomeStmt.expenses.reduce((acc, curr) => acc + curr.balance, 0);
    const netIncome = incomeStmt.netIncome;

    companyStats.push({
      id: company.id,
      name: company.name,
      cash,
      revenue,
      expenses,
      netIncome
    });

    totals.cash += cash;
    totals.revenue += revenue;
    totals.expenses += expenses;
    totals.netIncome += netIncome;
  }

  return {
    totals,
    companies: companyStats
  };
}

// ==== AGING REPORT ====
export interface AgingBucket {
  current: number;     // Not yet due
  days1to30: number;   // 1-30 days overdue
  days31to60: number;  // 31-60 days overdue
  days61to90: number;  // 61-90 days overdue
  over90: number;      // > 90 days overdue
  total: number;
}

export interface AgingLineItem {
  id: string;
  documentNumber: string;
  contactId: string;
  contactName: string;
  date: Date;
  dueDate: Date;
  total: number;
  paidAmount: number;
  balanceDue: number;
  daysOverdue: number;
  bucket: 'current' | '1-30' | '31-60' | '61-90' | 'over90';
  currency: string;
}

export interface AgingContactSummary {
  contactId: string;
  contactName: string;
  contactEmail?: string;
  current: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  over90: number;
  total: number;
  items: AgingLineItem[];
}

export interface AgingReport {
  type: 'receivable' | 'payable';
  asOfDate: Date;
  summary: AgingBucket;
  byContact: AgingContactSummary[];
}

export async function getAgingReport(
  companyId: string,
  type: 'receivable' | 'payable',
  asOfDate: Date
): Promise<AgingReport> {
  const { sales_invoices, bills, contacts } = await import("@shared/schema");
  
  // Select the appropriate table based on type
  const isReceivable = type === 'receivable';
  const documentTable = isReceivable ? sales_invoices : bills;
  
  // Query unpaid or partially paid documents
  const documents = await db.select({
    id: documentTable.id,
    documentNumber: isReceivable 
      ? (documentTable as typeof sales_invoices).invoice_number 
      : (documentTable as typeof bills).bill_number,
    contactId: isReceivable
      ? (documentTable as typeof sales_invoices).customer_id
      : (documentTable as typeof bills).supplier_id,
    date: documentTable.date,
    dueDate: documentTable.due_date,
    total: documentTable.total,
    paidAmount: documentTable.paid_amount,
    currency: documentTable.currency,
    status: documentTable.status,
    contactName: contacts.name,
    contactEmail: contacts.email,
  })
  .from(documentTable)
  .innerJoin(contacts, eq(
    isReceivable
      ? (documentTable as typeof sales_invoices).customer_id
      : (documentTable as typeof bills).supplier_id,
    contacts.id
  ))
  .where(and(
    eq(documentTable.company_id, companyId),
    // Exclude fully paid and cancelled documents
    sql`${documentTable.status} NOT IN ('paid', 'cancelled')`,
    // Only documents with outstanding balance
    sql`(${documentTable.total} - ${documentTable.paid_amount}) > 0`
  ));

  // Initialize summary buckets
  const summary: AgingBucket = {
    current: 0,
    days1to30: 0,
    days31to60: 0,
    days61to90: 0,
    over90: 0,
    total: 0
  };

  // Group by contact
  const contactMap = new Map<string, AgingContactSummary>();

  for (const doc of documents) {
    const total = parseFloat(doc.total?.toString() || '0');
    const paidAmount = parseFloat(doc.paidAmount?.toString() || '0');
    const balanceDue = total - paidAmount;
    
    if (balanceDue <= 0) continue;

    // Calculate days overdue
    const dueDate = new Date(doc.dueDate);
    const diffTime = asOfDate.getTime() - dueDate.getTime();
    const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Determine bucket
    let bucket: AgingLineItem['bucket'];
    if (daysOverdue <= 0) {
      bucket = 'current';
      summary.current += balanceDue;
    } else if (daysOverdue <= 30) {
      bucket = '1-30';
      summary.days1to30 += balanceDue;
    } else if (daysOverdue <= 60) {
      bucket = '31-60';
      summary.days31to60 += balanceDue;
    } else if (daysOverdue <= 90) {
      bucket = '61-90';
      summary.days61to90 += balanceDue;
    } else {
      bucket = 'over90';
      summary.over90 += balanceDue;
    }
    summary.total += balanceDue;

    const lineItem: AgingLineItem = {
      id: doc.id,
      documentNumber: doc.documentNumber,
      contactId: doc.contactId,
      contactName: doc.contactName,
      date: doc.date,
      dueDate: doc.dueDate,
      total,
      paidAmount,
      balanceDue,
      daysOverdue: Math.max(0, daysOverdue),
      bucket,
      currency: doc.currency
    };

    // Add to contact summary
    if (!contactMap.has(doc.contactId)) {
      contactMap.set(doc.contactId, {
        contactId: doc.contactId,
        contactName: doc.contactName,
        contactEmail: doc.contactEmail || undefined,
        current: 0,
        days1to30: 0,
        days31to60: 0,
        days61to90: 0,
        over90: 0,
        total: 0,
        items: []
      });
    }

    const contactSummary = contactMap.get(doc.contactId)!;
    contactSummary.items.push(lineItem);
    contactSummary.total += balanceDue;
    
    if (bucket === 'current') contactSummary.current += balanceDue;
    else if (bucket === '1-30') contactSummary.days1to30 += balanceDue;
    else if (bucket === '31-60') contactSummary.days31to60 += balanceDue;
    else if (bucket === '61-90') contactSummary.days61to90 += balanceDue;
    else contactSummary.over90 += balanceDue;
  }

  // Sort contacts by total amount (descending)
  const byContact = Array.from(contactMap.values())
    .sort((a, b) => b.total - a.total);

  return {
    type,
    asOfDate,
    summary,
    byContact
  };
}

// ==== CONTACT STATEMENT ====
export interface StatementEntry {
  id: string;
  date: Date;
  documentType: string;
  documentNumber: string;
  description: string | null;
  debit: number;
  credit: number;
  balance: number;
}

export interface ContactStatement {
  contact: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    type: string;
  };
  startDate: Date;
  endDate: Date;
  openingBalance: number;
  entries: StatementEntry[];
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
}

export async function getContactStatement(
  companyId: string,
  contactId: string,
  startDate: Date,
  endDate: Date
): Promise<ContactStatement> {
  const { sales_invoices, bills, payments, receipts, contacts } = await import("@shared/schema");
  
  // Get contact info
  const contactResult = await db.select()
    .from(contacts)
    .where(eq(contacts.id, contactId))
    .limit(1);
  
  if (contactResult.length === 0) {
    throw new Error("Contact not found");
  }
  
  const contact = contactResult[0];
  const isCustomer = contact.type === 'customer' || contact.type === 'both';
  
  // Calculate opening balance (transactions before start date)
  let openingBalance = 0;
  
  if (isCustomer) {
    // For customers: invoices increase balance, receipts decrease
    const invoicesBefore = await db.select({
      total: sql<string>`COALESCE(SUM(${sales_invoices.total}), 0)`
    })
    .from(sales_invoices)
    .where(and(
      eq(sales_invoices.company_id, companyId),
      eq(sales_invoices.customer_id, contactId),
      sql`${sales_invoices.date} < ${startDate.toISOString()}`,
      sql`${sales_invoices.status} != 'cancelled'`
    ));
    
    const receiptsBefore = await db.select({
      total: sql<string>`COALESCE(SUM(${receipts.amount}), 0)`
    })
    .from(receipts)
    .where(and(
      eq(receipts.company_id, companyId),
      eq(receipts.customer_id, contactId),
      sql`${receipts.date} < ${startDate.toISOString()}`
    ));
    
    openingBalance = parseFloat(invoicesBefore[0]?.total || '0') - parseFloat(receiptsBefore[0]?.total || '0');
  } else {
    // For suppliers: bills increase what we owe, payments decrease
    const billsBefore = await db.select({
      total: sql<string>`COALESCE(SUM(${bills.total}), 0)`
    })
    .from(bills)
    .where(and(
      eq(bills.company_id, companyId),
      eq(bills.supplier_id, contactId),
      sql`${bills.date} < ${startDate.toISOString()}`,
      sql`${bills.status} != 'cancelled'`
    ));
    
    const paymentsBefore = await db.select({
      total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`
    })
    .from(payments)
    .where(and(
      eq(payments.company_id, companyId),
      eq(payments.vendor_id, contactId),
      sql`${payments.date} < ${startDate.toISOString()}`
    ));
    
    openingBalance = parseFloat(billsBefore[0]?.total || '0') - parseFloat(paymentsBefore[0]?.total || '0');
  }
  
  // Get transactions in the period
  const entries: StatementEntry[] = [];
  let runningBalance = openingBalance;
  let totalDebits = 0;
  let totalCredits = 0;
  
  if (isCustomer) {
    // Get invoices
    const invoicesList = await db.select({
      id: sales_invoices.id,
      date: sales_invoices.date,
      number: sales_invoices.invoice_number,
      total: sales_invoices.total,
      notes: sales_invoices.notes,
    })
    .from(sales_invoices)
    .where(and(
      eq(sales_invoices.company_id, companyId),
      eq(sales_invoices.customer_id, contactId),
      gte(sales_invoices.date, startDate),
      lte(sales_invoices.date, endDate),
      sql`${sales_invoices.status} != 'cancelled'`
    ));
    
    for (const inv of invoicesList) {
      const amount = parseFloat(inv.total?.toString() || '0');
      runningBalance += amount;
      totalDebits += amount;
      entries.push({
        id: inv.id,
        date: inv.date,
        documentType: 'invoice',
        documentNumber: inv.number,
        description: inv.notes,
        debit: amount,
        credit: 0,
        balance: runningBalance
      });
    }
    
    // Get receipts from customer
    const receiptsList = await db.select({
      id: receipts.id,
      date: receipts.date,
      number: receipts.receipt_number,
      amount: receipts.amount,
      notes: receipts.description,
    })
    .from(receipts)
    .where(and(
      eq(receipts.company_id, companyId),
      eq(receipts.customer_id, contactId),
      gte(receipts.date, startDate),
      lte(receipts.date, endDate)
    ));
    
    for (const rec of receiptsList) {
      const amount = parseFloat(rec.amount?.toString() || '0');
      runningBalance -= amount;
      totalCredits += amount;
      entries.push({
        id: rec.id,
        date: rec.date,
        documentType: 'receipt',
        documentNumber: rec.number || '',
        description: rec.notes,
        debit: 0,
        credit: amount,
        balance: runningBalance
      });
    }
  } else {
    // Get bills
    const supplierBills = await db.select({
      id: bills.id,
      date: bills.date,
      number: bills.bill_number,
      total: bills.total,
      notes: bills.notes,
    })
    .from(bills)
    .where(and(
      eq(bills.company_id, companyId),
      eq(bills.supplier_id, contactId),
      gte(bills.date, startDate),
      lte(bills.date, endDate),
      sql`${bills.status} != 'cancelled'`
    ));
    
    for (const bill of supplierBills) {
      const amount = parseFloat(bill.total?.toString() || '0');
      runningBalance += amount;
      totalDebits += amount;
      entries.push({
        id: bill.id,
        date: bill.date,
        documentType: 'bill',
        documentNumber: bill.number,
        description: bill.notes,
        debit: amount,
        credit: 0,
        balance: runningBalance
      });
    }
    
    // Get payments to supplier
    const supplierPayments = await db.select({
      id: payments.id,
      date: payments.date,
      number: payments.payment_number,
      amount: payments.amount,
      notes: payments.description,
    })
    .from(payments)
    .where(and(
      eq(payments.company_id, companyId),
      eq(payments.vendor_id, contactId),
      gte(payments.date, startDate),
      lte(payments.date, endDate)
    ));
    
    for (const pmt of supplierPayments) {
      const amount = parseFloat(pmt.amount?.toString() || '0');
      runningBalance -= amount;
      totalCredits += amount;
      entries.push({
        id: pmt.id,
        date: pmt.date,
        documentType: 'payment',
        documentNumber: pmt.number || '',
        description: pmt.notes,
        debit: 0,
        credit: amount,
        balance: runningBalance
      });
    }
  }
  
  // Sort entries by date
  entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Recalculate running balance in order
  runningBalance = openingBalance;
  for (const entry of entries) {
    runningBalance += entry.debit - entry.credit;
    entry.balance = runningBalance;
  }
  
  return {
    contact: {
      id: contact.id,
      name: contact.name,
      email: contact.email || undefined,
      phone: contact.phone || undefined,
      type: contact.type
    },
    startDate,
    endDate,
    openingBalance,
    entries,
    closingBalance: runningBalance,
    totalDebits,
    totalCredits
  };
}

// ===== Sales Summary Report =====
export async function getSalesSummary(
  companyId: string,
  startDate: Date,
  endDate: Date
) {
  const { sales_invoices, document_lines, items, contacts } = await import("@shared/schema");
  
  // Get all invoices in date range
  const invoices = await db.select({
    id: sales_invoices.id,
    customerId: sales_invoices.customer_id,
    customerName: contacts.name,
    total: sales_invoices.total,
    paidAmount: sales_invoices.paid_amount,
    status: sales_invoices.status,
    date: sales_invoices.date
  })
  .from(sales_invoices)
  .leftJoin(contacts, eq(sales_invoices.customer_id, contacts.id))
  .where(and(
    eq(sales_invoices.company_id, companyId),
    gte(sales_invoices.date, startDate),
    lte(sales_invoices.date, endDate)
  ));
  
  // Calculate totals
  let totalSales = 0;
  let totalPaid = 0;
  let paidInvoiceCount = 0;
  let unpaidInvoiceCount = 0;
  let partialInvoiceCount = 0;
  
  const customerTotals: Record<string, { customerId: string; customerName: string; totalAmount: number; invoiceCount: number }> = {};
  
  for (const inv of invoices) {
    const total = parseFloat(inv.total?.toString() || '0');
    const paid = parseFloat(inv.paidAmount?.toString() || '0');
    
    totalSales += total;
    totalPaid += paid;
    
    if (inv.status === 'paid') paidInvoiceCount++;
    else if (inv.status === 'partially_paid') partialInvoiceCount++;
    else unpaidInvoiceCount++;
    
    // Aggregate by customer
    if (inv.customerId) {
      if (!customerTotals[inv.customerId]) {
        customerTotals[inv.customerId] = {
          customerId: inv.customerId,
          customerName: inv.customerName || 'Unknown',
          totalAmount: 0,
          invoiceCount: 0
        };
      }
      customerTotals[inv.customerId].totalAmount += total;
      customerTotals[inv.customerId].invoiceCount++;
    }
  }
  
  // Get top items sold
  const invoiceIds = invoices.map(i => i.id);
  let topItems: Array<{ itemId: string; itemName: string; quantity: number; totalAmount: number }> = [];
  
  if (invoiceIds.length > 0) {
    const itemSales = await db.select({
      itemId: document_lines.item_id,
      itemName: items.name,
      quantity: sql<string>`sum(${document_lines.quantity})`,
      totalAmount: sql<string>`sum(${document_lines.line_total})`
    })
    .from(document_lines)
    .leftJoin(items, eq(document_lines.item_id, items.id))
    .where(and(
      eq(document_lines.document_type, 'invoice'),
      sql`${document_lines.document_id} IN (${sql.join(invoiceIds.map(id => sql`${id}`), sql`, `)})`
    ))
    .groupBy(document_lines.item_id, items.name)
    .orderBy(sql`sum(${document_lines.line_total}) DESC`)
    .limit(10);
    
    topItems = itemSales.map(item => ({
      itemId: item.itemId || '',
      itemName: item.itemName || 'Unknown',
      quantity: parseFloat(item.quantity || '0'),
      totalAmount: parseFloat(item.totalAmount || '0')
    }));
  }
  
  // Sort customers by total amount
  const topCustomers = Object.values(customerTotals)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);
  
  return {
    totalSales,
    totalPaid,
    totalUnpaid: totalSales - totalPaid,
    invoiceCount: invoices.length,
    paidInvoiceCount,
    unpaidInvoiceCount,
    partialInvoiceCount,
    topCustomers,
    topItems,
    byMonth: [] // Can be implemented later
  };
}

// ===== Purchases Summary Report =====
export async function getPurchasesSummary(
  companyId: string,
  startDate: Date,
  endDate: Date
) {
  const { bills, document_lines, items, contacts } = await import("@shared/schema");
  
  // Get all bills in date range
  const allBills = await db.select({
    id: bills.id,
    supplierId: bills.supplier_id,
    supplierName: contacts.name,
    total: bills.total,
    paidAmount: bills.paid_amount,
    status: bills.status,
    date: bills.date
  })
  .from(bills)
  .leftJoin(contacts, eq(bills.supplier_id, contacts.id))
  .where(and(
    eq(bills.company_id, companyId),
    gte(bills.date, startDate),
    lte(bills.date, endDate)
  ));
  
  // Calculate totals
  let totalPurchases = 0;
  let totalPaid = 0;
  let paidBillCount = 0;
  let unpaidBillCount = 0;
  let partialBillCount = 0;
  
  const supplierTotals: Record<string, { supplierId: string; supplierName: string; totalAmount: number; billCount: number }> = {};
  
  for (const bill of allBills) {
    const total = parseFloat(bill.total?.toString() || '0');
    const paid = parseFloat(bill.paidAmount?.toString() || '0');
    
    totalPurchases += total;
    totalPaid += paid;
    
    if (bill.status === 'paid') paidBillCount++;
    else if (bill.status === 'partially_paid') partialBillCount++;
    else unpaidBillCount++;
    
    // Aggregate by supplier
    if (bill.supplierId) {
      if (!supplierTotals[bill.supplierId]) {
        supplierTotals[bill.supplierId] = {
          supplierId: bill.supplierId,
          supplierName: bill.supplierName || 'Unknown',
          totalAmount: 0,
          billCount: 0
        };
      }
      supplierTotals[bill.supplierId].totalAmount += total;
      supplierTotals[bill.supplierId].billCount++;
    }
  }
  
  // Get top items purchased
  const billIds = allBills.map(b => b.id);
  let topItems: Array<{ itemId: string; itemName: string; quantity: number; totalAmount: number }> = [];
  
  if (billIds.length > 0) {
    const itemPurchases = await db.select({
      itemId: document_lines.item_id,
      itemName: items.name,
      quantity: sql<string>`sum(${document_lines.quantity})`,
      totalAmount: sql<string>`sum(${document_lines.line_total})`
    })
    .from(document_lines)
    .leftJoin(items, eq(document_lines.item_id, items.id))
    .where(and(
      eq(document_lines.document_type, 'bill'),
      sql`${document_lines.document_id} IN (${sql.join(billIds.map(id => sql`${id}`), sql`, `)})`
    ))
    .groupBy(document_lines.item_id, items.name)
    .orderBy(sql`sum(${document_lines.line_total}) DESC`)
    .limit(10);
    
    topItems = itemPurchases.map(item => ({
      itemId: item.itemId || '',
      itemName: item.itemName || 'Unknown',
      quantity: parseFloat(item.quantity || '0'),
      totalAmount: parseFloat(item.totalAmount || '0')
    }));
  }
  
  // Sort suppliers by total amount
  const topSuppliers = Object.values(supplierTotals)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);
  
  return {
    totalPurchases,
    totalPaid,
    totalUnpaid: totalPurchases - totalPaid,
    billCount: allBills.length,
    paidBillCount,
    unpaidBillCount,
    partialBillCount,
    topSuppliers,
    topItems,
    byMonth: [] // Can be implemented later
  };
}

// ========== PROFIT/LOSS COMPARISON ==========

interface ProfitLossItem {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  amount: number;
}

interface ProfitLossPeriod {
  revenue: number;
  costOfSales: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  otherIncome: number;
  otherExpenses: number;
  netIncome: number;
  revenueItems: ProfitLossItem[];
  costItems: ProfitLossItem[];
  expenseItems: ProfitLossItem[];
}

interface ComparisonLine {
  category: string;
  accountCode?: string;
  accountName?: string;
  period1Amount: number;
  period2Amount: number;
  variance: number;
  percentChange: number | null;
}

export interface ProfitLossComparisonResult {
  period1: {
    startDate: string;
    endDate: string;
    data: ProfitLossPeriod;
  };
  period2: {
    startDate: string;
    endDate: string;
    data: ProfitLossPeriod;
  };
  comparison: {
    summary: ComparisonLine[];
    details: {
      revenue: ComparisonLine[];
      costOfSales: ComparisonLine[];
      expenses: ComparisonLine[];
    };
  };
}

async function getProfitLossForPeriod(
  companyId: string,
  startDate: Date,
  endDate: Date
): Promise<ProfitLossPeriod> {
  // Get all account movements for the period
  const movements = await db.select({
    accountId: journal_lines.account_id,
    accountCode: accounts.code,
    accountName: accounts.name,
    accountType: accounts.account_type,
    accountSubtype: accounts.account_subtype,
    debit: sql<string>`sum(${journal_lines.base_debit})`,
    credit: sql<string>`sum(${journal_lines.base_credit})`
  })
  .from(journal_lines)
  .innerJoin(journals, eq(journal_lines.journal_id, journals.id))
  .innerJoin(accounts, eq(journal_lines.account_id, accounts.id))
  .where(and(
    eq(journals.company_id, companyId),
    gte(journals.date, startDate),
    lte(journals.date, endDate),
    or(
      eq(accounts.account_type, 'revenue'),
      eq(accounts.account_type, 'expense'),
      eq(accounts.account_type, 'cost_of_goods_sold')
    )
  ))
  .groupBy(journal_lines.account_id, accounts.code, accounts.name, accounts.account_type, accounts.account_subtype);

  let revenue = 0;
  let costOfSales = 0;
  let operatingExpenses = 0;
  let otherIncome = 0;
  let otherExpenses = 0;
  
  const revenueItems: ProfitLossItem[] = [];
  const costItems: ProfitLossItem[] = [];
  const expenseItems: ProfitLossItem[] = [];

  for (const mov of movements) {
    const debit = parseFloat(mov.debit || '0');
    const credit = parseFloat(mov.credit || '0');
    
    // For revenue accounts: credit increases revenue (positive), debit decreases
    // For expense accounts: debit increases expense (positive), credit decreases
    
    if (mov.accountType === 'revenue') {
      const amount = credit - debit;
      if (mov.accountSubtype === 'other_income') {
        otherIncome += amount;
      } else {
        revenue += amount;
      }
      revenueItems.push({
        accountId: mov.accountId,
        accountCode: mov.accountCode || '',
        accountName: mov.accountName || '',
        accountType: mov.accountType,
        amount
      });
    } else if (mov.accountType === 'cost_of_goods_sold') {
      const amount = debit - credit;
      costOfSales += amount;
      costItems.push({
        accountId: mov.accountId,
        accountCode: mov.accountCode || '',
        accountName: mov.accountName || '',
        accountType: mov.accountType,
        amount
      });
    } else if (mov.accountType === 'expense') {
      const amount = debit - credit;
      if (mov.accountSubtype === 'other_expense') {
        otherExpenses += amount;
      } else {
        operatingExpenses += amount;
      }
      expenseItems.push({
        accountId: mov.accountId,
        accountCode: mov.accountCode || '',
        accountName: mov.accountName || '',
        accountType: mov.accountType,
        amount
      });
    }
  }

  const grossProfit = revenue - costOfSales;
  const operatingIncome = grossProfit - operatingExpenses;
  const netIncome = operatingIncome + otherIncome - otherExpenses;

  return {
    revenue,
    costOfSales,
    grossProfit,
    operatingExpenses,
    operatingIncome,
    otherIncome,
    otherExpenses,
    netIncome,
    revenueItems: revenueItems.filter(i => i.amount !== 0).sort((a, b) => b.amount - a.amount),
    costItems: costItems.filter(i => i.amount !== 0).sort((a, b) => b.amount - a.amount),
    expenseItems: expenseItems.filter(i => i.amount !== 0).sort((a, b) => b.amount - a.amount)
  };
}

function calculatePercentChange(period1: number, period2: number): number | null {
  if (period1 === 0) return period2 === 0 ? 0 : null;
  return ((period2 - period1) / Math.abs(period1)) * 100;
}

export async function getProfitLossComparison(
  companyId: string,
  period1Start: Date,
  period1End: Date,
  period2Start: Date,
  period2End: Date
): Promise<ProfitLossComparisonResult> {
  // Get P&L data for both periods
  const [period1Data, period2Data] = await Promise.all([
    getProfitLossForPeriod(companyId, period1Start, period1End),
    getProfitLossForPeriod(companyId, period2Start, period2End)
  ]);

  // Build summary comparison
  const summaryItems: { key: keyof ProfitLossPeriod; label: string }[] = [
    { key: 'revenue', label: 'Total Revenue' },
    { key: 'costOfSales', label: 'Cost of Sales' },
    { key: 'grossProfit', label: 'Gross Profit' },
    { key: 'operatingExpenses', label: 'Operating Expenses' },
    { key: 'operatingIncome', label: 'Operating Income' },
    { key: 'otherIncome', label: 'Other Income' },
    { key: 'otherExpenses', label: 'Other Expenses' },
    { key: 'netIncome', label: 'Net Income' }
  ];

  const summary: ComparisonLine[] = summaryItems.map(item => {
    const p1 = period1Data[item.key] as number;
    const p2 = period2Data[item.key] as number;
    return {
      category: item.label,
      period1Amount: p1,
      period2Amount: p2,
      variance: p2 - p1,
      percentChange: calculatePercentChange(p1, p2)
    };
  });

  // Build detailed comparison for each category
  const buildDetailComparison = (
    period1Items: ProfitLossItem[],
    period2Items: ProfitLossItem[]
  ): ComparisonLine[] => {
    const allAccounts = new Map<string, { p1: ProfitLossItem | null; p2: ProfitLossItem | null }>();
    
    for (const item of period1Items) {
      allAccounts.set(item.accountId, { p1: item, p2: null });
    }
    for (const item of period2Items) {
      const existing = allAccounts.get(item.accountId);
      if (existing) {
        existing.p2 = item;
      } else {
        allAccounts.set(item.accountId, { p1: null, p2: item });
      }
    }

    const results: ComparisonLine[] = [];
    allAccounts.forEach((value, _key) => {
      const p1Amount = value.p1?.amount || 0;
      const p2Amount = value.p2?.amount || 0;
      const item = value.p1 || value.p2!;
      
      results.push({
        category: item.accountName,
        accountCode: item.accountCode,
        accountName: item.accountName,
        period1Amount: p1Amount,
        period2Amount: p2Amount,
        variance: p2Amount - p1Amount,
        percentChange: calculatePercentChange(p1Amount, p2Amount)
      });
    });

    return results.sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));
  };

  return {
    period1: {
      startDate: period1Start.toISOString(),
      endDate: period1End.toISOString(),
      data: period1Data
    },
    period2: {
      startDate: period2Start.toISOString(),
      endDate: period2End.toISOString(),
      data: period2Data
    },
    comparison: {
      summary,
      details: {
        revenue: buildDetailComparison(period1Data.revenueItems, period2Data.revenueItems),
        costOfSales: buildDetailComparison(period1Data.costItems, period2Data.costItems),
        expenses: buildDetailComparison(period1Data.expenseItems, period2Data.expenseItems)
      }
    }
  };
}
