import { db } from '../db';
import { ai_providers, contacts, accounts } from '@shared/schema';
import { eq, and, ilike } from 'drizzle-orm';
import { callAIProvider, buildInvoiceExtractionMessages } from './aiProviders';

export async function extractInvoiceFromText(
  text: string,
  companyId: string,
  options: {
    provider_id?: string;
    provider?: string;
    model?: string;
    prompt?: string;
    refine_llm?: boolean;
  }
) {
  const { provider_id, provider, model, prompt, refine_llm } = options;
  const warnings: string[] = [];
  let costInfo: { totalUSD?: number, inputTokens?: number, outputTokens?: number } | undefined;

  const src = text.replace(/\r/g, '').split('\n').map((l: string) => l.trim()).filter(Boolean).join('\n');
  
  // Heuristic Extraction
  const pick = (reList: RegExp[]): string | undefined => {
    for (const re of reList) {
      const m = src.match(re);
      if (m && m[1]) return m[1].trim();
    }
    return undefined;
  };
  const dateRegex = /(?:(?:\bdate\b|\bissued?\b)\s*[:\-]*\s*)?(\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2}|\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4})/i;
  const dueDateRegex = /(?:due\s*date|payment\s*due)\s*[:\-]*\s*(\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2}|\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4})/i;
  const invNo = pick([
    /(?:invoice\s*(?:no\.|number|#)\s*[:\-]*\s*)([A-Za-z0-9\-_/]+)\b/i,
    /\bINV[-_ ]?([A-Za-z0-9\-_/]+)/i,
  ]);
  const currencySymbol = pick([
    /(SAR|AED|USD|EUR|GBP|KWD|BHD|OMR|QAR)\b/i,
    /([€$£])\s*\d+[\d,]*(?:[.][\d]+)?/,
  ]);
  const toNumberStr = (s?: string) => s ? s.replace(/[^0-9.,-]/g, '').replace(/,(?=\d{3}(\D|$))/g, '').replace(/,(?=\d{1,2}$)/, '.').trim() : undefined;
  const total = pick([/(?:\btotal\b|\bamount\s*due\b)\s*[:\-]*\s*([€$£]?[\s]*[0-9][\d,]*(?:[.][\d]+)?)/i]);
  const subtotal = pick([/\bsub\s*total\b\s*[:\-]*\s*([€$£]?[\s]*[0-9][\d,]*(?:[.][\d]+)?)/i]);
  const tax = pick([/\b(?:tax|vat)\b\s*[:\-]*\s*([€$£]?[\s]*[0-9][\d,]*(?:[.][\d]+)?)/i]);

  const firstLines = src.split('\n');
  let vendorName: string | undefined;
  for (let i = 0; i < Math.min(5, firstLines.length); i++) {
    const l = firstLines[i];
    if (/invoice|bill|receipt|number|date|due|total|amount|tax|vat/i.test(l)) continue;
    if (l.length >= 3) { vendorName = l.replace(/[^A-Za-z0-9 &.'\-]/g, '').trim(); if (vendorName) break; }
  }

  const dateMatch = src.match(dateRegex);
  const dueDateMatch = src.match(dueDateRegex);
  let result = {
    vendor_name: vendorName || undefined,
    invoice_number: invNo || undefined,
    date: dateMatch?.[1] || undefined,
    due_date: dueDateMatch?.[1] || undefined,
    currency: currencySymbol?.toUpperCase?.() || undefined,
    subtotal: toNumberStr(subtotal),
    tax_total: toNumberStr(tax),
    total: toNumberStr(total),
    line_items: [] as any[],
    category: undefined as string | undefined,
    notes: 'Parsed from plain text. OCR/vision integration pending.'
  };

  if (!result.invoice_number) warnings.push('Missing invoice_number');
  if (!result.total) warnings.push('Missing total');
  if (!result.date) warnings.push('Missing date');
  if (!result.due_date) warnings.push('Missing due_date');

  // Fetch expense accounts for categorization (Phase 6)
  let expenseCategories = '';
  try {
    const expenseAccounts = await db.select({ name: accounts.name })
      .from(accounts)
      .where(and(
        eq(accounts.company_id, companyId),
        eq(accounts.account_type, 'expense')
      ));
    expenseCategories = expenseAccounts.map(a => a.name).join(', ');
  } catch (e) {
    console.warn('Failed to fetch expense accounts for AI context', e);
  }

  // Optional LLM refinement on plain text
  let usedProvider: any = undefined;
  
  if (refine_llm) {
    try {
      // Resolve provider for text LLM
      let rowLLM: any | undefined;
      if (provider_id) {
        const [r] = await db.select().from(ai_providers).where(and(eq(ai_providers.id, provider_id), eq(ai_providers.company_id, companyId)));
        rowLLM = r;
      } else {
        const provName = (provider || '').toString().toLowerCase();
        const rows2 = await db.select().from(ai_providers).where(eq(ai_providers.company_id, companyId));
        rowLLM = rows2.find(r => (r.provider || '').toLowerCase() === (provName || 'openai')) || rows2.find(r => (r.provider || '').toLowerCase() === 'openai') || rows2[0];
      }
      
      if (rowLLM?.api_key) {
        usedProvider = rowLLM;
        const baseUrl2 = (rowLLM.base_url || 'https://api.openai.com').replace(/\/$/, '');
        const useModel2 = model || rowLLM.default_model || rowLLM.vision_model || 'gpt-4o-mini';
        const instructions2 = prompt || `Extract invoice fields and return strict JSON with keys: vendor_name, invoice_number, date, due_date, currency, subtotal, tax_total, total, notes, line_items, category. 
        line_items should be an array of objects with keys: description, quantity, unit_price, total.
        category should be one of the following if applicable: [${expenseCategories}]. If none match, suggest a generic category.
        Dates must be ISO (YYYY-MM-DD). Currency as code if possible. Only output the JSON.`;
        
        const cfgText: any = { provider: (rowLLM.provider || 'openai').toLowerCase(), apiKey: rowLLM.api_key, baseUrl: baseUrl2, model: useModel2 };
        
        // Pass raw src, callAIProvider handles redaction
        const msgsText = buildInvoiceExtractionMessages(src, undefined, undefined, instructions2);
        const aiText = await callAIProvider(cfgText, msgsText);
        
        if (aiText?.content != null) {
          const content2 = aiText.content || '';
          const tryParse = (s: string) => { try { return JSON.parse(s); } catch { const m = s.match(/\{[\s\S]*\}/); if (m) { try { return JSON.parse(m[0]); } catch {} } return null; } };
          const json2 = typeof content2 === 'string' ? tryParse(content2) : null;
          if (json2) {
            const refined = {
              vendor_name: json2.vendor_name || undefined,
              invoice_number: json2.invoice_number || undefined,
              date: json2.date || undefined,
              due_date: json2.due_date || undefined,
              currency: json2.currency || undefined,
              subtotal: json2.subtotal || undefined,
              tax_total: json2.tax_total || undefined,
              total: json2.total || undefined,
              notes: json2.notes || undefined,
              line_items: Array.isArray(json2.line_items) ? json2.line_items : [],
              category: json2.category || undefined
            };
            result = { ...refined, ...result, line_items: refined.line_items?.length ? refined.line_items : result.line_items, category: refined.category || result.category } as any;
            
            if (aiText.redaction?.redacted) {
              warnings.push(`Applied redaction before LLM: ${aiText.redaction.count} items`);
            }
            if (aiText.cost?.totalUSD != null) {
              warnings.push(`Estimated LLM refine cost: $${aiText.cost.totalUSD.toFixed(4)}`);
              costInfo = {
                totalUSD: aiText.cost.totalUSD,
                inputTokens: aiText.usage?.prompt_tokens,
                outputTokens: aiText.usage?.completion_tokens
              };
            }
          } else {
            warnings.push('LLM refinement failed to parse JSON');
          }
        } else {
          warnings.push('LLM refinement upstream error');
        }
      } else {
        warnings.push('No AI provider configured for LLM refinement');
      }
    } catch (e: any) {
      console.error('Text LLM refine exception:', e);
      warnings.push('LLM refinement exception');
    }
  }

  // Phase 6: Auto-match vendor
  if (result.vendor_name) {
    try {
      const [match] = await db.select().from(contacts)
        .where(and(
           eq(contacts.company_id, companyId),
           ilike(contacts.name, result.vendor_name)
        ))
        .limit(1);
      
      if (match) {
        (result as any).vendor_id = match.id;
        (result as any).vendor_match_type = 'auto_name_match';
      }
    } catch (e) {
      console.warn('Vendor auto-match failed:', e);
    }
  }

  return {
    result,
    meta: {
      mode: 'text',
      provider: usedProvider?.provider,
      model: usedProvider?.default_model || usedProvider?.vision_model,
      warnings,
      cost: costInfo
    }
  };
}
