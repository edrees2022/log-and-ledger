// Utility helpers for input normalization and update sanitization

/**
 * Recursively normalize an incoming JSON-like object by:
 * - Dropping null and empty-string values so schema defaults can apply
 * - Preserving arrays and Date objects as-is
 */
export function normalize(obj: any): any {
  const out: any = Array.isArray(obj) ? [] : {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (v === null || v === "") {
      // drop null/empty so zod defaults/db defaults can apply
      continue;
    }
    // Preserve Date objects as-is
    if (v instanceof Date) {
      out[k] = v;
    } else if (typeof v === "object" && !Array.isArray(v)) {
      out[k] = normalize(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

/**
 * Sanitize update payloads consistently across routes:
 * - Normalizes the payload (drops null/empty, preserves arrays)
 * - Strips sensitive/ownership keys
 * - Coerces numeric fields to strings for decimal DB columns
 */
export function sanitizeUpdate(
  input: any,
  stripKeys: string[] = ["company_id", "created_by", "id"],
  numericKeys: string[] = []
) {
  const u = normalize(input || {});
  for (const k of stripKeys) {
    if (k in u) delete (u as any)[k];
  }
  for (const k of numericKeys) {
    if ((u as any)[k] !== undefined && typeof (u as any)[k] === "number") {
      (u as any)[k] = String((u as any)[k]);
    }
  }
  return u;
}
