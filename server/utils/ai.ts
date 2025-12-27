/**
 * Lightweight AI-ish helpers for on-device heuristics.
 * No external model dependency; deterministic and testable.
 */

export type ClassificationInput = {
  description: string;
  amount?: number;
  merchant?: string;
  notes?: string;
  currency?: string;
};

export type ClassificationResult = {
  category: string;
  confidence: number; // 0..1
  suggestedAccounts: {
    debit: string[];
    credit: string[];
  };
  signals: {
    matchedCategory: string;
    scores: Record<string, number>;
    tokens: string[];
  };
};

// Curated keyword map per category (lowercase tokens only)
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Income/Sales": ["payment", "sale", "invoice", "stripe", "paypal", "gateway", "payout", "deposit", "customer"],
  "Meals & Entertainment": ["restaurant", "cafe", "coffee", "meal", "food", "dining", "ubereats", "doordash", "takeaway"],
  "Travel": ["uber", "lyft", "taxi", "airbnb", "hotel", "flight", "airlines", "train", "metro", "transport"],
  "Office Supplies": ["stationery", "paper", "ink", "toner", "office", "staples", "office depot", "pens", "notebook"],
  "Utilities": ["electric", "electricity", "water", "gas", "internet", "isp", "wifi", "utility", "phone", "mobile", "sim"],
  "Rent": ["rent", "lease", "landlord", "office rent", "workspace", "cowork", "wework"],
  "Software": ["saas", "subscription", "software", "license", "github", "gitlab", "vercel", "aws", "gcp", "azure", "notion", "slack", "zoom"],
  "Payroll": ["salary", "payroll", "wage", "stipend", "bonus", "employee", "hr", "benefits"],
  "Taxes": ["tax", "vat", "gst", "withholding", "irs", "zakat"],
  "Transfers": ["transfer", "internal", "between accounts", "owner draw", "capital", "intercompany"],
  "Other Expense": ["misc", "general", "other"]
};

const CATEGORY_DEFAULT_ACCOUNTS: Record<string, { debit: string[]; credit: string[] }> = {
  "Income/Sales": { debit: ["Accounts Receivable", "Cash"], credit: ["Sales" ] },
  "Meals & Entertainment": { debit: ["Meals & Entertainment"], credit: ["Cash", "Bank" ] },
  "Travel": { debit: ["Travel Expense"], credit: ["Cash", "Bank" ] },
  "Office Supplies": { debit: ["Office Supplies"], credit: ["Cash", "Bank" ] },
  "Utilities": { debit: ["Utilities"], credit: ["Cash", "Bank" ] },
  "Rent": { debit: ["Rent Expense"], credit: ["Cash", "Bank" ] },
  "Software": { debit: ["Software Subscriptions"], credit: ["Cash", "Bank" ] },
  "Payroll": { debit: ["Payroll Expense"], credit: ["Cash", "Bank" ] },
  "Taxes": { debit: ["Taxes & Licenses"], credit: ["Cash", "Bank" ] },
  "Transfers": { debit: ["Intercompany Receivable", "Owner's Draw"], credit: ["Intercompany Payable", "Owner's Equity" ] },
  "Other Expense": { debit: ["General Expenses"], credit: ["Cash", "Bank" ] }
};

// Basic tokenizer: lowercase, split on non-letters/numbers, filter short tokens
function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter(t => t.length >= 3);
}

// Jaccard similarity between two token sets (0..1)
export function textSimilarity(a: string, b: string): number {
  const A = new Set(tokenize(a));
  const B = new Set(tokenize(b));
  if (A.size === 0 && B.size === 0) return 0;
  let inter = 0;
  A.forEach((t) => { if (B.has(t)) inter++; });
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

export function classifyTransaction(input: ClassificationInput): ClassificationResult {
  const baseText = [input.description, input.merchant, input.notes]
    .filter(Boolean)
    .join(' ');

  const tokens = tokenize(baseText);

  // Score each category by max similarity of its keywords to the input
  const scores: Record<string, number> = {};
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let best = 0;
    for (const k of keywords) {
      const s = textSimilarity(baseText, k);
      if (s > best) best = s;
    }
    scores[category] = best;
  }

  // If amount is negative/positive, nudge towards expense/income
  if (typeof input.amount === 'number') {
    const amt = input.amount;
    if (amt < 0) {
      // Expense leaning: boost non-Income categories slightly
      for (const c of Object.keys(scores)) {
        if (c !== 'Income/Sales') scores[c] += 0.05;
      }
      scores['Income/Sales'] -= 0.05;
    } else if (amt > 0) {
      scores['Income/Sales'] += 0.05;
    }
  }

  // Pick best category
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [matchedCategory, rawScore] = entries[0];

  // Normalize a soft confidence between 0.3 and 0.95 based on rank gap
  const second = entries[1]?.[1] ?? 0;
  const gap = Math.max(0, rawScore - second);
  const confidence = Math.max(0.3, Math.min(0.95, 0.5 + rawScore * 0.5 + gap * 0.4));

  const accounts = CATEGORY_DEFAULT_ACCOUNTS[matchedCategory] || CATEGORY_DEFAULT_ACCOUNTS['Other Expense'];

  return {
    category: matchedCategory,
    confidence: Number(confidence.toFixed(2)),
    suggestedAccounts: accounts,
    signals: {
      matchedCategory,
      scores,
      tokens,
    },
  };
}

export default {
  classifyTransaction,
  textSimilarity,
};
