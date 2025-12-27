import { apiRequest } from '@/lib/queryClient';

export type AIClassificationInput = {
  description: string;
  amount?: number;
  merchant?: string;
  notes?: string;
  currency?: string;
};

export type AIClassificationResult = {
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

export async function classifyTransaction(input: AIClassificationInput): Promise<AIClassificationResult> {
  const res = await apiRequest('POST', '/api/ai/classify-transaction', input);
  return res.json();
}

export async function classifyTransactionsBatch(items: AIClassificationInput[]): Promise<AIClassificationResult[]> {
  const res = await apiRequest('POST', '/api/ai/classify-transaction/batch', { items });
  const payload = await res.json();
  // Batch route returns { items: [...] }, success envelope already unwrapped
  if (payload && typeof payload === 'object' && 'items' in (payload as any)) {
    return (payload as any).items as AIClassificationResult[];
  }
  // Fallback if middleware shape changes
  return payload as any;
}

// Optional convenience hook stub (no React imports to keep this file lean)
// Consumers can create their own react-query hooks around classifyTransaction/Batch
