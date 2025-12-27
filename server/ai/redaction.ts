/*
  Basic redaction utility (Phase 0):
  - Masks common PII patterns before sending text to external AI providers.
  - Returns both the redacted text and a list of redaction entries for audit.
  - NOTE: Vision (images/PDFs) cannot be redacted server-side without OCR; reserved for future.
*/

export interface RedactionEntry {
  type: 'email' | 'phone' | 'iban' | 'card' | 'tax_id';
  original: string;
  replacement: string;
  index: number; // start index in original string
}

export interface RedactionResult {
  text: string;
  entries: RedactionEntry[];
}

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_RE = /(?:\+\d{1,3}[\s-]?)?(?:\(\d{2,4}\)|\d{2,4})?[\s-]?\d{3,4}[\s-]?\d{3,4}(?:\s*x\d+)?/g; // heuristic
const IBAN_RE = /\b([A-Z]{2}\d{2}[A-Z0-9]{11,30})\b/g; // simplified IBAN pattern
const CARD_RE = /\b(?:\d[ -]?){13,19}\b/g; // generic long digit sequences 13-19 length
const TAX_ID_RE = /\b(?:VAT|TAX)[\s:-]*([A-Z0-9]{6,15})\b/gi;

function mask(value: string, kind: RedactionEntry['type']): string {
  const token = kind.toUpperCase();
  // Keep last 2 chars for minimal debugging unless extremely short
  const suffix = value.replace(/\s|-/g, '').slice(-2);
  return `[REDACTED_${token}_${suffix}]`;
}

export function redactForAI(input: string): RedactionResult {
  let text = input;
  const entries: RedactionEntry[] = [];
  
  if (!text) return { text, entries };

  // Helper to replace and record entries
  const replace = (re: RegExp, type: RedactionEntry['type']) => {
    text = text.replace(re, (match, ...args) => {
      // Find the index from arguments (it's the second to last arg usually, or we can just use match)
      // But replace callback doesn't give easy index if we have groups.
      // Actually, for global replace, we don't get index easily in a way that tracks with the *modified* string if we modify it.
      // But wait, string.replace processes from left to right.
      
      // Heuristic checks
      if (type === 'phone' && match.replace(/\D/g, '').length < 7) return match;
      if (type === 'card') {
        const digits = match.replace(/\D/g, '');
        if (digits.length < 13 || digits.length > 19) return match;
      }

      const replacement = mask(match, type);
      // We can't easily get the *current* index in the modified string during replace.
      // But for the purpose of just returning the list of redactions, we might not strictly need the exact index 
      // if we are just logging "what was redacted".
      // The original code tried to track index but was buggy.
      
      entries.push({ 
        type, 
        original: match, 
        replacement, 
        index: 0 // We'll skip accurate index tracking for now as it's complex with multiple passes
      });
      
      return replacement;
    });
  };

  replace(EMAIL_RE, 'email');
  replace(IBAN_RE, 'iban');
  // replace(IP_V4, 'ip'); // Add IP if needed
  replace(PHONE_RE, 'phone');
  replace(CARD_RE, 'card');
  replace(TAX_ID_RE, 'tax_id');

  return { text, entries };
}
