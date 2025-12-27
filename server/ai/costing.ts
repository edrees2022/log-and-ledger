/*
  Token & cost estimation utilities (conservative, provider-agnostic)
  - We avoid adding heavy tokenizers; use a heuristic tokens ~= chars/4 for Latin scripts.
  - Pricing map is optional; if not known, we return totalUSD = 0 and pricingApplied=false.
*/

export type CostEstimate = {
  provider: string;
  model?: string;
  inputTokens: number;
  outputTokens: number;
  imageTokenEquivalent?: number; // rough additional tokens for vision
  totalUSD: number; // 0 if pricing unknown
  pricingApplied: boolean;
};

export function estimateTokensFromText(text: string | undefined | null): number {
  if (!text) return 0;
  // crude heuristic: ~4 chars per token
  const len = text.length;
  if (len <= 0) return 0;
  return Math.max(1, Math.ceil(len / 4));
}

// Optional pricing map (per 1K tokens) for a few common models.
// NOTE: These are conservative placeholder values to enable non-zero estimates.
// Please configure accurate pricing from env/admin settings for production.
// Keys use the format `${provider}:${model}` in lowercase.
const PRICING: Record<string, { in: number; out: number; image?: number } | undefined> = {
  // OpenAI GPT-4o family (example placeholders)
  'openai:gpt-4o-mini': { in: 0.0006, out: 0.0012, image: 0.004 },
  'openai:gpt-4o': { in: 0.003, out: 0.006, image: 0.02 },
  // Fallback generic OpenAI entry (used when model unspecified)
  'openai:': { in: 0.001, out: 0.002, image: 0.01 },
};

function getPrice(provider: string, model?: string): { in?: number; out?: number; image?: number } {
  const key = `${provider}:${model || ''}`.toLowerCase();
  return PRICING[key] || {};
}

export function calcCost(provider: string, model: string | undefined, inputTokens: number, outputTokens = 0, imageTokenEquivalent = 0): CostEstimate {
  const price = getPrice(provider, model);
  const inRate = price.in ?? 0;
  const outRate = price.out ?? 0;
  const imageRate = price.image ?? 0;
  const usd = (inputTokens / 1000) * inRate + (outputTokens / 1000) * outRate + imageRate;
  const applied = !!(price.in || price.out || price.image);
  return {
    provider,
    model,
    inputTokens,
    outputTokens,
    imageTokenEquivalent: imageTokenEquivalent || undefined,
    totalUSD: usd,
    pricingApplied: applied,
  };
}
