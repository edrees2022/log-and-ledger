/*
  Provider Strategy: selection + simple cost estimate
  - Normalizes ai_providers rows into ProviderCandidate
  - Selects a pipeline based on mime/type, size, pages
  - Provides a stub cost estimate for visibility (currently 0)
*/

export type ProviderCandidate = {
  id: string;
  provider: string; // e.g., 'openai', 'anthropic', 'azure-openai'
  baseUrl?: string | null;
  apiKeyMasked?: boolean; // do not expose actual key
  defaultModel?: string | null;
  visionModel?: string | null;
  enabled?: boolean | null;
};

export type SelectParams = {
  mimeType?: string | null;
  sizeBytes?: number | null;
  pagesCount?: number | null;
  imageProvided?: boolean; // true if image_base64 present (including PDFs)
  wantsVision?: boolean; // UI intent to use vision if possible
  locale?: string | null;
  candidates: ProviderCandidate[];
};

export type PipelinePlan = {
  mode: 'text' | 'pdf' | 'vision' | 'ocr+llm';
  reason: string;
  steps: string[];
  provider?: ProviderCandidate;
  model?: string;
  warnings: string[];
  estimated_cost_usd: number;
};

export function normalizeProviders(rows: any[]): ProviderCandidate[] {
  return (rows || []).map((r) => ({
    id: String(r.id ?? ''),
    provider: String((r.provider || '').toLowerCase() || 'openai'),
    baseUrl: r.base_url || undefined,
    apiKeyMasked: !!r.api_key ? true : false,
    defaultModel: r.default_model || null,
    visionModel: r.vision_model || null,
    enabled: r.enabled ?? true,
  }));
}

export type ProviderScore = {
  provider: string;
  acceptanceRate: number; // 0 to 1
  totalFeedback: number;
};

export function adjustCandidatesWithFeedback(candidates: ProviderCandidate[], scores: ProviderScore[]): ProviderCandidate[] {
  if (!scores.length) return candidates;
  const scoreMap = new Map(scores.map(s => [s.provider.toLowerCase(), s]));
  
  // Sort by acceptance rate (descending), then by total feedback (descending)
  return [...candidates].sort((a, b) => {
    const sA = scoreMap.get(a.provider.toLowerCase());
    const sB = scoreMap.get(b.provider.toLowerCase());
    
    const rateA = sA ? sA.acceptanceRate : 0.5; // Default neutral if no data
    const rateB = sB ? sB.acceptanceRate : 0.5;
    
    if (Math.abs(rateA - rateB) > 0.1) return rateB - rateA; // Significant difference
    
    // If rates are similar, prefer one with more data
    const countA = sA ? sA.totalFeedback : 0;
    const countB = sB ? sB.totalFeedback : 0;
    return countB - countA;
  });
}

export function estimateCostUsd(plan: Omit<PipelinePlan, 'estimated_cost_usd'> & { bytes?: number; inputTokens?: number; outputTokens?: number; }): number {
  // Lightweight heuristic using pricing map from costing.ts where available.
  // For text/pdf without a provider, cost stays 0 (heuristic extraction is local).
  // For vision, apply the image flat component + rough input token estimate (~ instructions+image eq).
  try {
    if (!plan.provider || !plan.model) return 0;
    const { calcCost } = require('./costing');
    // Derive crude input tokens: use provided inputTokens or estimate from bytes/pages if present.
    const inputTokens = plan.inputTokens || (plan.bytes ? Math.ceil((plan.bytes || 0) / 4) : 0);
    const outputTokens = plan.outputTokens || 0;
    const est = calcCost(plan.provider.provider.toLowerCase(), plan.model, inputTokens, outputTokens, plan.mode === 'vision' ? 600 : 0);
    return est.totalUSD;
  } catch {
    return 0;
  }
}

export function selectPipeline(params: SelectParams): PipelinePlan {
  const { mimeType, pagesCount, imageProvided, wantsVision, candidates } = params;
  const warnings: string[] = [];
  const mt = (mimeType || '').toLowerCase();
  const isPdf = /pdf/.test(mt);

  // Find enabled candidate with vision support (respecting input order which may be feedback-weighted)
  const visionCand = candidates.find(c => (c.enabled ?? true) && c.visionModel);

  if (imageProvided && !isPdf) {
    if (visionCand) {
      const model = visionCand.visionModel || visionCand.defaultModel || 'gpt-4o-mini';
      const plan: PipelinePlan = {
        mode: 'vision',
        reason: 'Image input and a vision-capable provider is configured',
        steps: ['vision'],
        provider: visionCand,
        model,
        warnings,
        estimated_cost_usd: 0,
      };
      plan.estimated_cost_usd = estimateCostUsd(plan);
      return plan;
    }
    warnings.push('No vision-capable provider configured; vision not available.');
    return {
      mode: 'ocr+llm',
      reason: 'Image input but no vision provider; using OCR then optional LLM refinement',
      steps: ['ocr', 'llm-extract'],
      warnings,
      estimated_cost_usd: 0,
    };
  }

  if (isPdf) {
    const longDoc = (pagesCount ?? 0) > 10;
    return {
      mode: 'pdf',
      reason: longDoc ? 'PDF with many pages; using text extraction heuristics' : 'PDF provided; using pdf-parse to extract text then heuristics',
      steps: ['pdf-parse', 'text-heuristics'],
      provider: undefined,
      model: undefined,
      warnings,
      estimated_cost_usd: 0,
    };
  }

  // Default: plain text path
  return {
    mode: 'text',
    reason: 'Plain text provided; using lightweight heuristics',
    steps: ['text-heuristics'],
    provider: undefined,
    model: undefined,
    warnings,
    estimated_cost_usd: 0,
  };
}
