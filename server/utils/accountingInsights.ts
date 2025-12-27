import { db } from "../db";
import { sales_invoices, checks, expenses, ai_providers, budgets, journal_lines, journals, accounts } from "@shared/schema";
import { eq, and, sql, desc, lt, isNull, gte, lte, sum } from "drizzle-orm";
import { callAIProvider } from "./aiProviders";

export async function getFinancialInsights(companyId: string, enableAI: boolean = false) {
  const insights = [];

  // --- RULE BASED CHECKS (No AI required) ---

  // 1. Check for potential duplicate invoices (same amount, same customer, within last 30 days)
  const duplicates = await db.execute(sql`
    SELECT t1.invoice_number, t1.total as amount, t1.customer_id, t1.date
    FROM sales_invoices t1
    JOIN sales_invoices t2 ON t1.customer_id = t2.customer_id 
      AND t1.total = t2.total 
      AND t1.id != t2.id
      AND t1.company_id = ${companyId}
      AND t2.company_id = ${companyId}
      AND ABS(EXTRACT(EPOCH FROM (t1.date - t2.date))) < 86400
    WHERE t1.date > NOW() - INTERVAL '30 days'
    LIMIT 5
  `);

  if (duplicates.rows.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Potential Duplicate Invoices',
      description: `Found ${duplicates.rows.length} invoices with same amount and customer within 24 hours.`,
      action: 'Review these invoices to avoid double billing.',
      data: duplicates.rows
    });
  }

  // 2. High Value Expenses (Top 5% of expenses)
  const avgExpense = await db.execute(sql`
    SELECT AVG(amount) as avg_amount FROM expenses WHERE company_id = ${companyId}
  `);
  
  const threshold = (avgExpense.rows[0] as any)?.avg_amount * 3; // 3x average

  if (threshold) {
    const highValue = await db.select().from(expenses)
      .where(and(
        eq(expenses.company_id, companyId),
        sql`amount > ${threshold}`
      ))
      .limit(5);

    if (highValue.length > 0) {
      insights.push({
        type: 'info',
        title: 'Unusual High Expenses',
        description: `Found ${highValue.length} expenses significantly higher than your average (${Number(threshold).toFixed(2)}).`,
        action: 'Verify these large transactions are authorized.',
        data: highValue
      });
    }
  }

  // 3. Overdue Invoices (Cash Flow Risk)
  const overdue = await db.select().from(sales_invoices)
    .where(and(
      eq(sales_invoices.company_id, companyId),
      eq(sales_invoices.status, 'sent'),
      lt(sales_invoices.due_date, new Date())
    ))
    .limit(5);

  if (overdue.length > 0) {
    insights.push({
      type: 'critical',
      title: 'Overdue Invoices Detected',
      description: `You have ${overdue.length} overdue invoices that need attention.`,
      action: 'Send reminders to these customers immediately.',
      data: overdue
    });
  }

  // 4. Uncategorized Expenses (Tax Risk)
  const uncategorized = await db.select().from(expenses)
    .where(and(
      eq(expenses.company_id, companyId),
      isNull(expenses.category)
    ))
    .limit(5);

  if (uncategorized.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Uncategorized Expenses',
      description: `Found ${uncategorized.length} expenses without a category.`,
      action: 'Categorize these to ensure accurate tax reporting.',
      data: uncategorized
    });
  }

  // 5. Smart Anomalies (Seasonality/Trend Check)
  // Compare current month's category spend vs average of previous 3 months
  const anomalies = await db.execute(sql`
    WITH monthly_stats AS (
      SELECT 
        category, 
        to_char(date, 'YYYY-MM') as month,
        SUM(amount) as total
      FROM expenses 
      WHERE company_id = ${companyId} 
        AND date >= NOW() - INTERVAL '4 months'
        AND category IS NOT NULL
      GROUP BY category, to_char(date, 'YYYY-MM')
    ),
    averages AS (
      SELECT 
        category, 
        AVG(total) as avg_amount
      FROM monthly_stats
      WHERE month < to_char(NOW(), 'YYYY-MM')
      GROUP BY category
    )
    SELECT 
      m.category, 
      m.total as current_amount, 
      a.avg_amount
    FROM monthly_stats m
    JOIN averages a ON m.category = a.category
    WHERE m.month = to_char(NOW(), 'YYYY-MM')
      AND m.total > a.avg_amount * 1.4
  `);

  if (anomalies.rows.length > 0) {
    for (const row of anomalies.rows as any[]) {
      const percent = Math.round(((row.current_amount - row.avg_amount) / row.avg_amount) * 100);
      insights.push({
        type: 'warning',
        title: 'Spending Anomaly Detected',
        description: `Spending on ${row.category} is ${percent}% higher than the 3-month average.`,
        action: 'Investigate if this increase is justified.',
        data: [row]
      });
    }
  }

  // 6. Spending Insights (Vendor Consolidation)
  // Find categories with multiple vendors in the last 3 months
  const fragmentation = await db.execute(sql`
    SELECT 
      category, 
      COUNT(DISTINCT payee) as vendor_count,
      SUM(amount) as total_spend
    FROM expenses
    WHERE company_id = ${companyId}
      AND date >= NOW() - INTERVAL '3 months'
      AND category IS NOT NULL
    GROUP BY category
    HAVING COUNT(DISTINCT payee) > 2
  `);

  if (fragmentation.rows.length > 0) {
    for (const row of fragmentation.rows as any[]) {
      insights.push({
        type: 'info',
        title: 'Vendor Consolidation Opportunity',
        description: `You have ${row.vendor_count} different vendors for '${row.category}'.`,
        action: 'Consolidating vendors could save ~10-15% in negotiated rates.',
        data: [row]
      });
    }
  }

  // 7. Fraud Detection: New Vendor Payments
  // Flag payments made to vendors created within 48 hours of the payment
  const newVendorPayments = await db.execute(sql`
    SELECT p.payment_number, p.amount, c.name as vendor_name, c.created_at as vendor_created_at
    FROM payments p
    JOIN contacts c ON p.vendor_id = c.id
    WHERE p.company_id = ${companyId}
      AND p.date > NOW() - INTERVAL '30 days'
      AND c.created_at > p.date - INTERVAL '48 hours'
    LIMIT 5
  `);

  if (newVendorPayments.rows.length > 0) {
    insights.push({
      type: 'critical',
      title: 'Potential Fraud: New Vendor Payment',
      description: `Found ${newVendorPayments.rows.length} payments to vendors created less than 48 hours before payment.`,
      action: 'Verify legitimacy of these vendors immediately.',
      data: newVendorPayments.rows
    });
  }

  // 8. Fraud Detection: Benford's Law Analysis
  // Analyze first digit distribution of expenses
  const digitStats = await db.execute(sql`
    SELECT 
      SUBSTRING(amount::text, 1, 1) as first_digit,
      COUNT(*) as count
    FROM expenses
    WHERE company_id = ${companyId}
      AND amount >= 10
    GROUP BY SUBSTRING(amount::text, 1, 1)
  `);

  const totalExpenses = digitStats.rows.reduce((sum: number, row: any) => sum + parseInt(row.count), 0);
  
  if (totalExpenses > 30) { // Only run if we have enough data
    const benford = { '1': 0.301, '2': 0.176, '3': 0.125, '4': 0.097, '5': 0.079, '6': 0.067, '7': 0.058, '8': 0.051, '9': 0.046 };
    let maxDeviation = 0;
    let suspiciousDigit = '';

    for (const row of digitStats.rows as any[]) {
      const digit = row.first_digit;
      if (digit === '0' || !benford[digit as keyof typeof benford]) continue;
      
      const actualFreq = parseInt(row.count) / totalExpenses;
      const expectedFreq = benford[digit as keyof typeof benford];
      const deviation = Math.abs(actualFreq - expectedFreq);

      if (deviation > 0.10) { // 10% deviation threshold
        if (deviation > maxDeviation) {
          maxDeviation = deviation;
          suspiciousDigit = digit;
        }
      }
    }

    if (suspiciousDigit) {
      insights.push({
        type: 'warning',
        title: 'Statistical Anomaly (Benford\'s Law)',
        description: `Expense amounts starting with '${suspiciousDigit}' appear ${Math.round(maxDeviation * 100)}% more/less often than expected naturally.`,
        action: 'Audit expenses for fabricated numbers.',
        data: []
      });
    }
  }

  // 9. Budget Overspending Alerts
  // Check if any expense accounts have exceeded their budget
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-indexed
  
  const budgetRecords = await db.select()
    .from(budgets)
    .innerJoin(accounts, eq(budgets.account_id, accounts.id))
    .where(and(
      eq(budgets.company_id, companyId),
      eq(budgets.fiscal_year, currentYear),
      eq(accounts.account_type, 'expense')
    ));

  if (budgetRecords.length > 0) {
    // Get current year actuals
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);
    
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

    const actualMap = new Map<string, number>();
    actuals.forEach(a => {
      const debit = parseFloat(a.debitSum || '0');
      const credit = parseFloat(a.creditSum || '0');
      actualMap.set(a.accountId, debit - credit); // Net expense
    });

    const overspentAccounts: any[] = [];
    const nearLimitAccounts: any[] = [];

    for (const record of budgetRecords) {
      const b = record.budgets;
      const acc = record.accounts;
      
      const budgetTotal = parseFloat(b.total?.toString() || '0');
      const actualAmount = actualMap.get(acc.id) || 0;
      
      if (budgetTotal > 0) {
        const percentage = (actualAmount / budgetTotal) * 100;
        
        if (percentage > 100) {
          overspentAccounts.push({
            accountName: acc.name,
            accountCode: acc.code,
            budget: budgetTotal,
            actual: actualAmount,
            overBy: actualAmount - budgetTotal,
            percentage: percentage.toFixed(1)
          });
        } else if (percentage >= 85) {
          nearLimitAccounts.push({
            accountName: acc.name,
            accountCode: acc.code,
            budget: budgetTotal,
            actual: actualAmount,
            remaining: budgetTotal - actualAmount,
            percentage: percentage.toFixed(1)
          });
        }
      }
    }

    if (overspentAccounts.length > 0) {
      insights.push({
        type: 'critical',
        title: 'Budget Exceeded',
        description: `${overspentAccounts.length} expense account(s) have exceeded their annual budget.`,
        action: 'Review spending immediately and consider budget adjustments.',
        data: overspentAccounts.slice(0, 5)
      });
    }

    if (nearLimitAccounts.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Approaching Budget Limit',
        description: `${nearLimitAccounts.length} expense account(s) are at 85%+ of their annual budget.`,
        action: 'Monitor spending closely to stay within budget.',
        data: nearLimitAccounts.slice(0, 5)
      });
    }
  }

  // --- AI ANALYSIS (Optional) ---
  let aiAdvice = null;
  if (enableAI && insights.length > 0) {
    try {
      const providers = await db.select().from(ai_providers).where(eq(ai_providers.company_id, companyId));
      const activeProvider = providers[0];

      if (activeProvider && activeProvider.api_key) {
        const prompt = `
          You are an expert CFO and Accountant. Review these financial alerts for a company and provide a brief, professional summary and 1 strategic recommendation.
          
          Alerts:
          ${JSON.stringify(insights.map(i => ({ title: i.title, description: i.description })))}
          
          Format:
          Summary: [One sentence summary]
          Recommendation: [One strategic action]
        `;

        const response = await callAIProvider({
          provider: (activeProvider.provider || 'openai').toLowerCase() as any,
          model: activeProvider.default_model || 'gpt-4o',
          apiKey: activeProvider.api_key,
          baseUrl: activeProvider.base_url || undefined
        }, [{ role: 'user', content: prompt }]);

        aiAdvice = response.content;
      }
    } catch (e) {
      console.error("AI Accountant failed to generate advice", e);
    }
  }

  return {
    alerts: insights,
    ai_advice: aiAdvice
  };
}
