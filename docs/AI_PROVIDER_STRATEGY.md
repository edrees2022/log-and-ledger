# AI Provider Strategy (Initial Implementation)

This document outlines the initial provider selection approach integrated into the `/api/ai/extract/invoice` endpoint.

## Goals
- Surface structured pipeline metadata (mode, steps, chosen provider/model) to clients for transparency.
- Prepare for future cost tracking, fallback logic, and dynamic optimization using feedback metrics.
- Keep changes non-invasive: existing behavior remains the same; only metadata is enriched.

## Current Modes
| Mode | Trigger | Steps | Notes |
|------|---------|-------|-------|
| text | Plain text input (no image/pdf) | text-heuristics | Regex + heuristic parsing only. |
| pdf | PDF file provided | pdf-parse, text-heuristics | Page selection honored; large PDFs trimmed. |
| vision | Image (non-PDF) + vision-capable provider (OpenAI) | vision | Calls provider vision model (default `gpt-4o-mini`). |
| ocr+llm | Image (non-PDF) but no vision provider | ocr, llm-extract | Placeholder; OCR not yet implemented. |

## Selection Heuristics (Simplified)
1. Non-PDF image: attempt vision if a provider has a `vision_model`. Otherwise fall back to planned `ocr+llm` pipeline (warning only).
2. PDF: always `pdf` mode (text extraction + heuristics). Long PDFs (>10 pages) add a reason highlighting heavy document.
3. Plain text: `text` mode.

## Future Enhancements
- Add OCR integration (Tesseract or external service) for `ocr+llm` pathway.
- Implement secondary LLM refinement pass for PDF/text when completeness < threshold.
- Token accounting + real cost estimation per provider/model.
- Fallback retry: if primary vision fails, auto attempt pdf/text heuristics + log both attempts.
- Dynamic provider weighting based on recent feedback acceptance rates (e.g., boost providers with higher correction-success ratios).

## Data Shapes
```
PipelinePlan {
  mode: 'text' | 'pdf' | 'vision' | 'ocr+llm';
  reason: string;
  steps: string[]; // sequential conceptual steps
  provider?: { id: string; provider: string; visionModel?: string | null; defaultModel?: string | null; };
  model?: string; // selected model identifier
  warnings: string[]; // non-fatal guidance
  estimated_cost_usd: number; // currently placeholder (0)
}
```

Returned under `response.meta.pipeline` when available.

## Files Added / Modified
- `server/ai/providerStrategy.ts`: Selection + normalization + cost stub.
- `server/routes.ts`: Preflight selection; pipeline metadata added to invoice extraction responses.
- `AI_PROVIDER_STRATEGY.md`: This explanatory document.

## Next Steps
1. Add simulate endpoint: `/api/ai/providers/pipeline-simulate`.
2. Integrate feedback-derived adjustments (e.g., if correction rate high for a provider, consider alternate model).
3. Add cost table + token counting utility.
4. Implement OCR path for non-vision images.

## Usage
Clients can inspect `meta.pipeline` to adapt UI (e.g., show a banner: "Vision extraction" vs "Heuristic parse"), or decide to offer a manual refinement option when pipeline lacks a provider.

---
Initial version committed: placeholder cost + no fallback yet.
