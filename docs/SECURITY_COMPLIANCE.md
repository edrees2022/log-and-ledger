# Security & Compliance (Phase 0)

This initial document outlines the foundational controls planned for AI-assisted extraction.

## Objectives
- Minimize exposure of sensitive user data to external AI providers.
- Provide auditability for redactions and consent events.
- Establish boundaries for rate limits and usage governance.

## Current Additions
- `server/ai/redaction.ts`: Basic regex-driven redaction for emails, phones, IBANs, card-like numbers, tax IDs. Returns redacted text + entries (each entry type, original, replacement, index).
- Not yet wired into extraction endpoint text/vision calls (vision images cannot be redacted pre-OCR). Integration deferred until LLM text refinement path is added.

## Planned Controls (Next Phases)
1. Redaction Integration
   - Apply `redactForAI` to any raw text sent to LLM (including future PDF refinement step).
   - Log audit record with count per redaction type (no original values) for transparency.
2. Consent & Disclosure
   - UI banner indicating which provider receives data + last updated privacy link.
   - User-level setting: "Allow external AI processing"; hard block if disabled.
3. Rate Limiting / Quotas
   - Company daily cap for AI extractions (e.g., 500 operations) with soft warning at 80% threshold.
   - Per-user short-term burst limit (e.g., 30 requests / 15 min) to prevent abuse.
4. Data Minimization
   - Strip large free-form notes before sending to LLM; only structured segments and minimal context instructions.
   - Truncate extremely long documents beyond enforced page selection.
5. Provider Isolation
   - Support proxying external calls through a central service layer; forbid direct client-side provider keys.
6. Secure Key Handling
   - Keys stored encrypted at rest; rotated on schedule; hashed fingerprint for detection of drift.
7. Logging Enhancements
   - Add audit entries: `ai_redaction_apply`, `ai_consent_toggle`, `ai_rate_limit_exceed`.
8. Monitoring & Alerts
   - Emit metrics: redaction counts/type distribution, blocked requests, consent disabled usage attempts.

## Edge Cases / Risks
- Over-redaction may reduce extraction quality (balance required). Future: allow per-type toggle or partial masking vs removal.
- Vision images containing sensitive info: require OCR pipeline to enable redaction; mark limitation until implemented.
- Multi-language patterns (phone formats, tax IDs) need iterative refinement.

## Roadmap Mapping
- Phase 0 (now): utility + documentation.
- Phase 1: integrate into text LLM extraction path + audits.
- Phase 2: OCR integration enabling vision redaction.
- Phase 3: Dynamic policy controls & dashboard metrics.

## Testing Strategy (Upcoming)
- Unit tests: ensure redaction preserves length context semantics for indexing (if needed) and masks expected patterns.
- False positive sampling: verify ordinary numeric fields (invoice totals) are not masked.
- Performance: redaction regex on large (50k chars) text within acceptable latency (<50ms typical).

---
Initial baseline created. Pending integration work.
