# AI Rollout Roadmap

This roadmap outlines the phased rollout of AI-assisted extraction and finance workflows.

## Phase 1 — Foundations (Done)
- Unified ingestion (AIIngestDialog) + structured preview (ExtractionPreview)
- Extraction schemas, normalization, completeness
- Feedback loop (apply + correction)

## Phase 1.5 — Provider Strategy (In progress)
- Pipeline selection plan (text/pdf/vision/ocr+llm)
- Simulation endpoint for UI hints
- Optional LLM refinement for text/PDF with redaction
- Cost estimation stubs (tokens + pricing hook)

## Phase 2 — Security & Compliance (In progress)
- Redaction utility (baseline)
- Integrate redaction to every LLM text call
- Consent & disclosure banner per provider
- Rate limits: per-user burst + per-company daily cap

## Phase 3 — OCR & Vision Enhancements
- OCR path for images without vision provider (e.g., Tesseract)
- Enable redaction for OCR text before LLM
- Layout-aware parsing for invoices/receipts

## Phase 4 — Provider Optimization & Fallbacks
- Real pricing table + token accounting
- Fallback policy: retry with heuristics when vision fails
- Dynamic provider/model weighting from feedback/corrections

## Phase 5 — Metrics & Quality
- KPI dashboards: accuracy %, correction rate, completeness distribution, time saved
- Pipeline mode distribution API (added), enrich with cost aggregation
- A/B prompts and model choices with opt-in cohorts

## Phase 6 — Document Line Items & Classification
- Line-item extraction for invoices/bills
- Category suggestions for receipts/expenses
- Auto-match vendors/customers

## Phase 7 — Bank Statements & Reconciliation
- Statement parsing, transaction classification, counterparty suggestions
- Assistive reconciliation with match confidence

## Phase 8 — Natural-Language Journals
- Draft journal entries from NL instructions
- Backtesting and guardrails for postings

## Operational Considerations
- Keys stored encrypted at rest; rotation and fingerprint checks
- Dedicated analytics report for AI quality
- Feature flags for per-company rollout

---
This roadmap will evolve based on usage data and feedback captured in the AI Analytics report.
