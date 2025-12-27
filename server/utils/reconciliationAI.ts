import { db } from "../db";
import { payments, receipts, bank_statement_lines, accounts, contacts, ai_providers } from "@shared/schema";
import { eq, and, or, sql, desc } from "drizzle-orm";
import { callAIProvider } from "./aiProviders";

interface StatementLine {
  date: Date;
  amount: number;
  description: string;
  currency: string;
}

interface MatchCandidate {
  id: string;
  type: 'payment' | 'receipt';
  date: Date;
  amount: number;
  description: string | null;
  reference: string | null;
  score: number;
  reason: string;
}

export async function findMatches(
  companyId: string,
  bankAccountId: string,
  line: StatementLine,
  options: {
    amountTolerance?: number; // default 0.01
    dateToleranceDays?: number; // default 5
  } = {}
): Promise<MatchCandidate[]> {
  const amountTolerance = options.amountTolerance ?? 0.01;
  const dateToleranceDays = options.dateToleranceDays ?? 5;

  // Determine if it's a payment (negative) or receipt (positive)
  // Note: Bank statement conventions vary. Assuming negative = money out (payment), positive = money in (receipt).
  const isPayment = line.amount < 0;
  const absAmount = Math.abs(line.amount);

  const startDate = new Date(line.date);
  startDate.setDate(startDate.getDate() - dateToleranceDays);
  
  const endDate = new Date(line.date);
  endDate.setDate(endDate.getDate() + dateToleranceDays);

  let candidates: MatchCandidate[] = [];

  if (isPayment) {
    // Search payments
    const rows = await db.select()
      .from(payments)
      .where(and(
        eq(payments.company_id, companyId),
        eq(payments.bank_account_id, bankAccountId),
        eq(payments.reconciled, false),
        sql`${payments.amount} BETWEEN ${absAmount - amountTolerance} AND ${absAmount + amountTolerance}`,
        sql`${payments.date} BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}`
      ));
    
    candidates = rows.map(r => ({
      id: r.id,
      type: 'payment',
      date: r.date,
      amount: Number(r.amount),
      description: r.description,
      reference: r.payment_number,
      score: 0,
      reason: ''
    }));
  } else {
    // Search receipts
    const rows = await db.select()
      .from(receipts)
      .where(and(
        eq(receipts.company_id, companyId),
        eq(receipts.bank_account_id, bankAccountId),
        eq(receipts.reconciled, false),
        sql`${receipts.amount} BETWEEN ${absAmount - amountTolerance} AND ${absAmount + amountTolerance}`,
        sql`${receipts.date} BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}`
      ));

    candidates = rows.map(r => ({
      id: r.id,
      type: 'receipt',
      date: r.date,
      amount: Number(r.amount),
      description: r.description,
      reference: r.receipt_number,
      score: 0,
      reason: ''
    }));
  }

  // Score candidates
  for (const c of candidates) {
    let score = 0;
    const reasons: string[] = [];

    // 1. Exact Amount Match
    if (Math.abs(c.amount - absAmount) < 0.001) {
      score += 50;
      reasons.push('Exact amount');
    } else {
      score += 30; // Close amount
      reasons.push('Close amount');
    }

    // 2. Date Proximity
    const daysDiff = Math.abs((new Date(c.date).getTime() - new Date(line.date).getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff === 0) {
      score += 30;
      reasons.push('Same date');
    } else if (daysDiff <= 1) {
      score += 20;
      reasons.push('±1 day');
    } else {
      score += Math.max(0, 10 - daysDiff);
    }

    // 3. Description Similarity (Simple token match)
    if (line.description && c.description) {
      const lineTokens = line.description.toLowerCase().split(/\W+/);
      const descTokens = c.description.toLowerCase().split(/\W+/);
      const matches = lineTokens.filter(t => t.length > 3 && descTokens.includes(t));
      if (matches.length > 0) {
        score += 20 + (matches.length * 5);
        reasons.push(`Matched words: ${matches.join(', ')}`);
      }
    }

    c.score = Math.min(100, score);
    c.reason = reasons.join(', ');
  }

  return candidates.sort((a, b) => b.score - a.score);
}

export async function suggestClassification(
  companyId: string,
  line: StatementLine
) {
  // 1. Rule-based / History-based (Simple)
  // TODO: Check past reconciliations for similar descriptions

  // 2. AI-based
  try {
    // Fetch active AI provider
    const providers = await db.select().from(ai_providers).where(eq(ai_providers.company_id, companyId));
    const activeProvider = providers[0];

    if (!activeProvider || !activeProvider.api_key) {
      return { category: 'Uncategorized', confidence: 0, reason: 'No AI provider configured' };
    }

    // Fetch context: Expense accounts and Contacts
    const expenseAccounts = await db.select({ name: accounts.name, code: accounts.code })
      .from(accounts)
      .where(and(eq(accounts.company_id, companyId), eq(accounts.account_type, 'expense')))
      .limit(50);
      
    const recentContacts = await db.select({ name: contacts.name })
      .from(contacts)
      .where(eq(contacts.company_id, companyId))
      .limit(50);

    const prompt = `
      Classify this bank transaction:
      Description: "${line.description}"
      Amount: ${line.amount} ${line.currency}
      
      Available Expense Accounts: ${expenseAccounts.map(a => a.name).join(', ')}
      Available Contacts: ${recentContacts.map(c => c.name).join(', ')}
      
      Return JSON with:
      - category (best matching expense account name or "Uncategorized")
      - counterparty (best matching contact name or suggest a new one)
      - confidence (0-1)
      - reason (short explanation)
    `;

    const response = await callAIProvider({
      provider: (activeProvider.provider || 'openai').toLowerCase() as any,
      model: activeProvider.default_model || 'gpt-4o-mini',
      apiKey: activeProvider.api_key,
      baseUrl: activeProvider.base_url || undefined
    }, [{ role: 'user', content: prompt }]);

    if (response.content) {
      try {
        const json = JSON.parse(response.content.replace(/```json|```/g, '').trim());
        return json;
      } catch (e) {
        console.warn('Failed to parse AI classification', e);
      }
    }
  } catch (e) {
    console.error('AI classification failed', e);
  }

  return null;
}
