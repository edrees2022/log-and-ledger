// Phase 1: Foundational AI extraction schemas & utilities
// These types standardize the structure of data returned by /api/ai/extract/* endpoints
// and provide helper functions for downstream staging + mobile-friendly review UIs.

import { z } from 'zod';

// ---- Base meta schema (common to all extraction results) ----
export const extractionMetaSchema = z.object({
  mode: z.string().optional(),           // text | pdf | vision | ocr
  provider: z.string().optional(),       // openai | azure-openai | etc
  model: z.string().optional(),
  mime_type: z.string().optional(),
  page_range: z.string().optional(),
  warnings: z.array(z.string()).optional(),
  duration_ms: z.number().optional(),
  locale: z.string().optional(),
});
export type ExtractionMeta = z.infer<typeof extractionMetaSchema>;

// ---- Line item (generic) ----
export const lineItemSchema = z.object({
  description: z.string().optional(),
  quantity: z.number().optional(),
  unit_price: z.number().optional(),
  total: z.number().optional(),
  // Optional raw text for fallback visualization
  raw: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});
export type LineItem = z.infer<typeof lineItemSchema>;

// ---- Invoice / Bill common fields ----
const invoiceCoreFields = {
  vendor_name: z.string().optional(),
  invoice_number: z.string().optional(),
  date: z.string().optional(),        // ISO or raw; normalize later
  due_date: z.string().optional(),
  currency: z.string().optional(),
  subtotal: z.string().optional(),    // keep as string until numeric normalization
  tax_total: z.string().optional(),
  total: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
  line_items: z.array(lineItemSchema).optional(),
  confidence: z.record(z.string(), z.number().min(0).max(1)).optional(), // field->confidence
};

export const invoiceExtractionSchema = z.object({
  ...invoiceCoreFields,
  meta: extractionMetaSchema.optional(),
});
export type InvoiceExtraction = z.infer<typeof invoiceExtractionSchema>;

// Bills may eventually have purchase order references, etc.
export const billExtractionSchema = invoiceExtractionSchema.extend({
  purchase_order_ref: z.string().optional(),
});
export type BillExtraction = z.infer<typeof billExtractionSchema>;

// ---- Receipt extraction (simplified) ----
export const receiptExtractionSchema = z.object({
  vendor_name: z.string().optional(),
  date: z.string().optional(),
  currency: z.string().optional(),
  total: z.string().optional(),
  tax_total: z.string().optional(),
  payment_method: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
  line_items: z.array(lineItemSchema).optional(),
  confidence: z.record(z.string(), z.number().min(0).max(1)).optional(),
  meta: extractionMetaSchema.optional(),
});
export type ReceiptExtraction = z.infer<typeof receiptExtractionSchema>;

// ---- Bank statement line extraction ----
export const bankStatementLineSchema = z.object({
  date: z.string().optional(),
  description: z.string().optional(),
  amount: z.string().optional(),      // retain original formatting first
  currency: z.string().optional(),
  debit_credit: z.enum(['debit','credit']).optional(),
  balance: z.string().optional(),
  notes: z.string().optional(),
  confidence: z.record(z.string(), z.number().min(0).max(1)).optional(),
  meta: extractionMetaSchema.optional(),
});
export type BankStatementLineExtraction = z.infer<typeof bankStatementLineSchema>;

// ---- Contact extraction ----
export const contactExtractionSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  vat_number: z.string().optional(),
  address_lines: z.array(z.string()).optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  confidence: z.record(z.string(), z.number().min(0).max(1)).optional(),
  meta: extractionMetaSchema.optional(),
});
export type ContactExtraction = z.infer<typeof contactExtractionSchema>;

// ---- Item extraction ----
export const itemExtractionSchema = z.object({
  name: z.string().optional(),
  sku: z.string().optional(),
  description: z.string().optional(),
  unit_price: z.string().optional(),
  currency: z.string().optional(),
  tax_rate: z.string().optional(),
  notes: z.string().optional(),
  confidence: z.record(z.string(), z.number().min(0).max(1)).optional(),
  meta: extractionMetaSchema.optional(),
});
export type ItemExtraction = z.infer<typeof itemExtractionSchema>;

// ---- Union type for generic handling ----
export type AnyExtraction =
  | InvoiceExtraction
  | BillExtraction
  | ReceiptExtraction
  | BankStatementLineExtraction
  | ContactExtraction
  | ItemExtraction;

export type ExtractionKind = 'invoice' | 'bill' | 'receipt' | 'statement_line' | 'contact' | 'item';

// ---- Utilities ----

// Normalize various date formats to YYYY-MM-DD (lenient, keeps original if impossible)
export function normalizeDate(input?: string): string | undefined {
  if (!input) return undefined;
  const raw = input.trim();
  // Direct ISO
  const direct = new Date(raw);
  if (!isNaN(direct.getTime())) return direct.toISOString().split('T')[0];
  // dd/mm/yyyy or mm/dd/yyyy
  const m = raw.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
  if (m) {
    let a = parseInt(m[1], 10);
    let b = parseInt(m[2], 10);
    let y = parseInt(m[3], 10);
    if (y < 100) y += 2000;
    // Heuristic: if first part > 12 treat as day first
    if (a > 12) {
      const d = a; const mo = b;
      const dt = new Date(y, mo - 1, d);
      if (!isNaN(dt.getTime())) return dt.toISOString().split('T')[0];
    } else {
      // Assume month/day/year
      const mo = a; const d = b;
      const dt = new Date(y, mo - 1, d);
      if (!isNaN(dt.getTime())) return dt.toISOString().split('T')[0];
    }
  }
  return raw; // fallback (UI can highlight uncertain)
}

// Compute completeness metrics for a result given a required field set
export function computeCompleteness<T extends Record<string, any>>(obj: T, required: string[]): { count: number; total: number; percent: number } {
  const total = required.length;
  const count = required.reduce((acc, k) => acc + (obj && obj[k] ? 1 : 0), 0);
  return { count, total, percent: total === 0 ? 0 : Math.round((count / total) * 100) };
}

// Merge user corrections (delta map) into original extraction preserving meta + confidences
export function applyCorrections<T extends AnyExtraction>(original: T, corrections: Partial<T>): T {
  return { ...original, ...corrections, meta: original.meta };
}

// Pick canonical mapping from extraction to bill form field names (extendable per kind)
export function mapExtractionToBillForm(e: BillExtraction) {
  return {
    supplier_reference: e.invoice_number || '',
    bill_date: normalizeDate(e.date) || '',
    due_date: normalizeDate(e.due_date) || '',
    amount: e.total || '',
    description: e.notes?.split('\n')[0] || '',
    notes: e.notes || '',
  };
}

// Mobile friendly heuristics: flag long fields for collapse
export function isLongField(value: string | undefined, max = 40): boolean {
  return !!value && value.length > max;
}

// Prepare a generic preview list for rendering (label, value, key, confidence)
export function toPreviewRows(e: AnyExtraction, kind: ExtractionKind) {
  const rows: Array<{ key: string; label: string; value: any; confidence?: number }> = [];
  const push = (key: string, label: string, value: any) => {
    if (value === undefined || value === null || value === '') return;
    rows.push({ key, label, value, confidence: (e as any).confidence?.[key] });
  };
  switch (kind) {
    case 'invoice':
    case 'bill':
      push('vendor_name', 'Vendor', (e as any).vendor_name);
      push('invoice_number', 'Invoice #', (e as any).invoice_number);
      push('date', 'Date', normalizeDate((e as any).date));
      push('due_date', 'Due Date', normalizeDate((e as any).due_date));
      push('currency', 'Currency', (e as any).currency);
      push('subtotal', 'Subtotal', (e as any).subtotal);
      push('tax_total', 'Tax', (e as any).tax_total);
      push('total', 'Total', (e as any).total);
      push('category', 'Category', (e as any).category);
      push('notes', 'Notes', (e as any).notes);
      break;
    case 'receipt':
      push('vendor_name', 'Vendor', (e as any).vendor_name);
      push('date', 'Date', normalizeDate((e as any).date));
      push('currency', 'Currency', (e as any).currency);
      push('total', 'Total', (e as any).total);
      push('tax_total', 'Tax', (e as any).tax_total);
      push('payment_method', 'Payment Method', (e as any).payment_method);
      push('category', 'Category', (e as any).category);
      push('notes', 'Notes', (e as any).notes);
      break;
    case 'statement_line':
      push('date', 'Date', normalizeDate((e as any).date));
      push('description', 'Description', (e as any).description);
      push('amount', 'Amount', (e as any).amount);
      push('currency', 'Currency', (e as any).currency);
      push('debit_credit', 'Side', (e as any).debit_credit);
      push('balance', 'Balance', (e as any).balance);
      break;
    case 'contact':
      push('name', 'Name', (e as any).name);
      push('email', 'Email', (e as any).email);
      push('phone', 'Phone', (e as any).phone);
      push('vat_number', 'VAT', (e as any).vat_number);
      if (Array.isArray((e as any).address_lines)) push('address_lines', 'Address', (e as any).address_lines.join(', '));
      push('country', 'Country', (e as any).country);
      push('notes', 'Notes', (e as any).notes);
      break;
    case 'item':
      push('name', 'Name', (e as any).name);
      push('sku', 'SKU', (e as any).sku);
      push('description', 'Description', (e as any).description);
      push('unit_price', 'Unit Price', (e as any).unit_price);
      push('currency', 'Currency', (e as any).currency);
      push('tax_rate', 'Tax Rate', (e as any).tax_rate);
      push('notes', 'Notes', (e as any).notes);
      break;
  }
  return rows;
}

// Phase 1 Note: Future phases will add structured validation, auto-splitting of multi-value lines, and locale-aware number parsing.
