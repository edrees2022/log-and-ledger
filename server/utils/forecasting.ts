import { db } from "../db";
import { 
  sales_invoices, bills, recurring_templates, bank_accounts, 
  payments, receipts, contacts, ai_providers
} from "@shared/schema";
import { eq, and, gte, lte, or, sql } from "drizzle-orm";
import { callAIProvider } from "./aiProviders";

export interface ForecastItem {
  date: string;
  description: string;
  amount: number;
  type: 'inflow' | 'outflow';
  source: 'invoice' | 'bill' | 'recurring_invoice' | 'recurring_bill' | 'prediction';
  confidence?: number; // 0-1, 1 for actual due dates, <1 for predictions
}

export interface CashFlowForecast {
  currentBalance: number;
  projectedBalance: number;
  timeline: {
    date: string;
    balance: number;
    inflow: number;
    outflow: number;
    items: ForecastItem[];
  }[];
  summary: {
    totalInflow: number;
    totalOutflow: number;
    netChange: number;
    lowestBalance: number;
    lowestBalanceDate: string;
  };
  aiAnalysis?: string;
}

export async function generateCashFlowForecast(
  companyId: string, 
  months: number = 3,
  useAI: boolean = false
): Promise<CashFlowForecast> {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setMonth(today.getMonth() + months);

  // 1. Get Current Balance (Sum of all bank accounts)
  const accounts = await db.select().from(bank_accounts).where(eq(bank_accounts.company_id, companyId));
  let currentBalance = 0;

  for (const acc of accounts) {
    // Get total receipts
    const [receiptsResult] = await db
      .select({ total: sql<string>`sum(amount)` })
      .from(receipts)
      .where(and(
        eq(receipts.bank_account_id, acc.id),
        eq(receipts.status, 'cleared') // Only cleared funds count for actual cash
      ));
    
    // Get total payments
    const [paymentsResult] = await db
      .select({ total: sql<string>`sum(amount)` })
      .from(payments)
      .where(and(
        eq(payments.bank_account_id, acc.id),
        eq(payments.status, 'completed') // Only completed payments
      ));

    const r = parseFloat(receiptsResult?.total || '0');
    const p = parseFloat(paymentsResult?.total || '0');
    currentBalance += (r - p);
  }

  // 2. Collect Forecast Items
  const items: ForecastItem[] = [];

  // A. Receivables (Unpaid Invoices)
  const unpaidInvoices = await db
    .select({
      invoice: sales_invoices,
      customerName: contacts.name
    })
    .from(sales_invoices)
    .leftJoin(contacts, eq(sales_invoices.customer_id, contacts.id))
    .where(and(
      eq(sales_invoices.company_id, companyId),
      or(eq(sales_invoices.status, 'sent'), eq(sales_invoices.status, 'overdue'), eq(sales_invoices.status, 'partially_paid'))
    ));

  for (const { invoice, customerName } of unpaidInvoices) {
    if (invoice.due_date && new Date(invoice.due_date) <= endDate) {
      // Use due date, or today if overdue
      let date = new Date(invoice.due_date);
      if (date < today) date = today; 

      const total = parseFloat(invoice.total.toString());
      const paid = parseFloat(invoice.paid_amount.toString());
      const remaining = total - paid;

      if (remaining > 0) {
        items.push({
          date: date.toISOString().split('T')[0],
          description: `Invoice #${invoice.invoice_number} (${customerName || 'Unknown Customer'})`,
          amount: remaining,
          type: 'inflow',
          source: 'invoice',
          confidence: 0.9
        });
      }
    }
  }

  // B. Payables (Unpaid Bills)
  const unpaidBills = await db
    .select({
      bill: bills,
      vendorName: contacts.name
    })
    .from(bills)
    .leftJoin(contacts, eq(bills.supplier_id, contacts.id))
    .where(and(
      eq(bills.company_id, companyId),
      or(eq(bills.status, 'received'), eq(bills.status, 'overdue'), eq(bills.status, 'partially_paid'))
    ));

  for (const { bill, vendorName } of unpaidBills) {
    if (bill.due_date && new Date(bill.due_date) <= endDate) {
      let date = new Date(bill.due_date);
      if (date < today) date = today;

      const total = parseFloat(bill.total.toString());
      const paid = parseFloat(bill.paid_amount.toString());
      const remaining = total - paid;

      if (remaining > 0) {
        items.push({
          date: date.toISOString().split('T')[0],
          description: `Bill #${bill.bill_number} (${vendorName || 'Unknown Vendor'})`,
          amount: remaining,
          type: 'outflow',
          source: 'bill',
          confidence: 0.9
        });
      }
    }
  }

  // C. Recurring Templates
  const templates = await db.select().from(recurring_templates).where(and(
    eq(recurring_templates.company_id, companyId),
    eq(recurring_templates.is_active, true)
  ));

  for (const tmpl of templates) {
    let nextDate = new Date(tmpl.next_run_date);
    while (nextDate <= endDate) {
      if (nextDate >= today) {
        const data = tmpl.template_data as any;
        const amount = parseFloat(data.total || '0');
        
        if (tmpl.document_type === 'invoice') {
          items.push({
            date: nextDate.toISOString().split('T')[0],
            description: `Recurring Invoice: ${tmpl.template_name}`,
            amount,
            type: 'inflow',
            source: 'recurring_invoice',
            confidence: 0.8
          });
        } else if (tmpl.document_type === 'bill' || tmpl.document_type === 'expense') {
          items.push({
            date: nextDate.toISOString().split('T')[0],
            description: `Recurring ${tmpl.document_type}: ${tmpl.template_name}`,
            amount,
            type: 'outflow',
            source: 'recurring_bill',
            confidence: 0.8
          });
        }
      }

      // Advance date
      if (tmpl.frequency === 'daily') nextDate.setDate(nextDate.getDate() + (tmpl.interval || 1));
      else if (tmpl.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + (7 * (tmpl.interval || 1)));
      else if (tmpl.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + (tmpl.interval || 1));
      else if (tmpl.frequency === 'quarterly') nextDate.setMonth(nextDate.getMonth() + (3 * (tmpl.interval || 1)));
      else if (tmpl.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + (tmpl.interval || 1));
      else break; // Safety
    }
  }

  // 3. Build Timeline
  items.sort((a, b) => a.date.localeCompare(b.date));

  const timeline: CashFlowForecast['timeline'] = [];
  let runningBalance = currentBalance;
  let totalInflow = 0;
  let totalOutflow = 0;
  let lowestBalance = currentBalance;
  let lowestBalanceDate = today.toISOString().split('T')[0];

  // Group by day
  const groupedByDate: Record<string, ForecastItem[]> = {};
  items.forEach(item => {
    if (!groupedByDate[item.date]) groupedByDate[item.date] = [];
    groupedByDate[item.date].push(item);
  });

  const dates = Object.keys(groupedByDate).sort();
  
  // Add today if not present
  const todayStr = today.toISOString().split('T')[0];
  if (!dates.includes(todayStr)) dates.unshift(todayStr);

  for (const dateStr of dates) {
    const dayItems = groupedByDate[dateStr] || [];
    let dayInflow = 0;
    let dayOutflow = 0;

    dayItems.forEach(item => {
      if (item.type === 'inflow') dayInflow += item.amount;
      else dayOutflow += item.amount;
    });

    runningBalance += (dayInflow - dayOutflow);
    totalInflow += dayInflow;
    totalOutflow += dayOutflow;

    if (runningBalance < lowestBalance) {
      lowestBalance = runningBalance;
      lowestBalanceDate = dateStr;
    }

    timeline.push({
      date: dateStr,
      balance: runningBalance,
      inflow: dayInflow,
      outflow: dayOutflow,
      items: dayItems
    });
  }

  // 4. AI Analysis (Optional)
  let aiAnalysis: string | undefined;
  if (useAI) {
    try {
      // Find a provider
      const [provider] = await db.select().from(ai_providers).where(eq(ai_providers.company_id, companyId));
      if (provider?.api_key) {
        const summaryText = `
Current Balance: ${currentBalance}
Projected Balance (in ${months} months): ${runningBalance}
Total Inflow: ${totalInflow}
Total Outflow: ${totalOutflow}
Lowest Balance: ${lowestBalance} on ${lowestBalanceDate}
Timeline Summary:
${timeline.map(t => `${t.date}: Bal ${t.balance} (+${t.inflow}, -${t.outflow})`).join('\n')}
        `.trim();

        const prompt = `Analyze this cash flow forecast summary. Identify potential risks (e.g., negative balance, low liquidity) and opportunities. Be concise (max 3 sentences).`;
        
        const response = await callAIProvider({
          provider: (provider.provider || 'openai') as any,
          apiKey: provider.api_key,
          baseUrl: provider.base_url || undefined,
          model: provider.default_model || 'gpt-4o-mini'
        }, [
          { role: 'system', content: 'You are a financial analyst.' },
          { role: 'user', content: prompt + '\n\nData:\n' + summaryText }
        ]);
        
        aiAnalysis = response.content;
      }
    } catch (e) {
      console.error('AI Forecast Analysis failed:', e);
    }
  }

  return {
    currentBalance,
    projectedBalance: runningBalance,
    timeline,
    summary: {
      totalInflow,
      totalOutflow,
      netChange: totalInflow - totalOutflow,
      lowestBalance,
      lowestBalanceDate
    },
    aiAnalysis
  };
}
