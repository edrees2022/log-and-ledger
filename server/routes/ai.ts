import { Router } from "express";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { db, pool } from "../db";
import { storage } from "../storage";
import { ai_providers, insertAIProviderSchema, ai_feedback, audit_logs } from "@shared/schema";
import { requirePermission } from "../middleware/permissions";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import { bulkOperationsLimiter } from "../middleware/rateLimiter";
import { badRequest, serverError, notFound } from "../utils/sendError";
import { logError } from "../logger";
import { setCache } from "../redis";
import { extractCheckFromImage } from "../utils/checkExtraction";
import { extractDocumentData } from "../utils/documentExtraction";

const router = Router();

// Pipeline mode distribution metrics with aggregated estimated tokens and cost
router.get('/metrics/pipeline-summary', requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { from, to, source, provider, mode } = req.query as { from?: string; to?: string; source?: string; provider?: string; mode?: string };
    let fromDate: Date | null = null;
    let toDate: Date | null = null;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (from && dateRegex.test(from)) {
      fromDate = new Date(from + 'T00:00:00Z');
      if (isNaN(fromDate.getTime())) fromDate = null;
    }
    if (to && dateRegex.test(to)) {
      toDate = new Date(to + 'T23:59:59Z'); // inclusive end of day
      if (isNaN(toDate.getTime())) toDate = null;
    }
    
    // Build dynamic filters (created_at stored in audit_logs)
    const rows: any = await db.execute(sql`SELECT 
        (changes->>'mode') AS mode,
        COUNT(*)::int AS count,
        COALESCE(SUM( (changes->>'estimated_cost_usd')::numeric ), 0)::float AS total_cost_usd,
        COALESCE(SUM( (changes->>'estimated_tokens_in')::numeric ), 0)::float AS total_tokens_in
      FROM audit_logs
      WHERE company_id = ${companyId}
        AND entity_type = 'ai_invoice_extract'
        ${fromDate ? sql`AND created_at >= ${fromDate.toISOString()}` : sql``}
        ${toDate ? sql`AND created_at <= ${toDate.toISOString()}` : sql``}
        ${source ? sql`AND (changes->>'source') = ${source}` : sql``}
        ${provider ? sql`AND (changes->>'provider') = ${provider}` : sql``}
        ${mode ? sql`AND (changes->>'mode') = ${mode}` : sql``}
      GROUP BY (changes->>'mode')`);
    const data = rows.rows || rows || [];
    return res.json({ ok: true, modes: data });
  } catch (error: any) {
    console.error('Pipeline summary metrics error:', error);
    return serverError(res, 'Failed to load pipeline summary');
  }
});

// Pipeline simulation: returns selection plan for given input characteristics
router.post('/providers/pipeline-simulate', requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { mime_type, size_bytes, pages_count, image_provided, wants_vision, locale } = req.body || {};
    const { selectPipeline, normalizeProviders } = await import('../ai/providerStrategy');
    const rows = await db.select().from(ai_providers).where(eq(ai_providers.company_id, companyId));
    const candidates = normalizeProviders(rows as any[]);
    const plan = selectPipeline({
      mimeType: mime_type,
      sizeBytes: typeof size_bytes === 'number' ? size_bytes : undefined,
      pagesCount: typeof pages_count === 'number' ? pages_count : undefined,
      imageProvided: !!image_provided,
      wantsVision: !!wants_vision,
      locale: (locale || (req.headers['accept-language'] as string | undefined) || 'en') as string,
      candidates,
    });
    return res.json({ ok: true, plan });
  } catch (error: any) {
    console.error('Pipeline simulate failed:', error);
    return serverError(res, 'Failed to simulate provider pipeline');
  }
});

// Redaction Preview Endpoint
router.post('/redact-preview', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return badRequest(res, "Text is required");

    const { redactForAI } = await import('../ai/redaction');
    const result = redactForAI(text);
    
    // Calculate stats from entries
    const stats = {
      emails: result.entries.filter(e => e.type === 'email').length,
      phones: result.entries.filter(e => e.type === 'phone').length,
      creditCards: result.entries.filter(e => e.type === 'card').length,
      ibans: result.entries.filter(e => e.type === 'iban').length,
      taxIds: result.entries.filter(e => e.type === 'tax_id').length,
    };

    res.json({
      original: text,
      redacted: result.text,
      stats
    });
  } catch (error: any) {
    console.error('Redaction preview failed:', error);
    return serverError(res, 'Failed to redact text');
  }
});

// === AI Utilities ===
router.post('/classify-transaction', requireAuth, async (req, res) => {
  try {
    const schema = z.object({
      description: z.string().min(1),
      amount: z.number().optional(),
      merchant: z.string().optional(),
      notes: z.string().optional(),
      currency: z.string().optional(),
    });
    const payload = schema.parse(req.body || {});

    // Dynamic import to avoid eager loading
    const ai = await import('../utils/ai');
    const result = ai.classifyTransaction(payload as any);
    return res.json(result);
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      const validationError = fromZodError(error);
      return badRequest(res, validationError.message);
    }
    console.error('AI classify error:', error?.message || error);
    return serverError(res, 'Failed to classify transaction');
  }
});

// Batch classification for multiple transactions
router.post('/classify-transaction/batch', requireAuth, bulkOperationsLimiter, async (req, res) => {
  try {
    const schema = z.object({
      items: z.array(z.object({
        description: z.string().min(1),
        amount: z.number().optional(),
        merchant: z.string().optional(),
        notes: z.string().optional(),
        currency: z.string().optional(),
      })).min(1)
    });
    const { items } = schema.parse(req.body || {});

    const ai = await import('../utils/ai');
    const results = items.map((it: any) => ai.classifyTransaction(it));
    return res.json({ items: results });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      const validationError = fromZodError(error);
      return badRequest(res, validationError.message);
    }
    console.error('AI batch classify error:', error?.message || error);
    return serverError(res, 'Failed to classify transactions');
  }
});

// AI feedback endpoint (persists lightweight feedback for analytics)
router.post('/feedback', requireAuth, async (req, res) => {
  try {
    const schema = z.object({
      transactionId: z.string().optional(),
      source: z.string().default('bank-statement'),
      accepted: z.boolean(),
      category: z.string(),
      confidence: z.number().min(0).max(1).optional(),
      suggestedAccounts: z.object({ debit: z.array(z.string()), credit: z.array(z.string()) }).partial().optional(),
      notes: z.string().optional(),
      description: z.string().optional(),
      amount: z.number().optional(),
    });
    const payload = schema.parse(req.body || {});

    const userId = (req as any).session?.userId || (req as any).firebaseUser?.uid || 'anonymous';
    const companyId = (req as any).session?.companyId || (req as any).session?.company?.id || undefined;
    // Persist to ai_feedback table
    try {
      const row = await storage.createAIFeedback({
        company_id: companyId,
        user_id: userId,
        source: payload.source,
        transaction_id: payload.transactionId,
        accepted: payload.accepted,
        category: payload.category,
        confidence: payload.confidence !== undefined ? String(payload.confidence) as any : undefined,
        suggested_accounts: payload.suggestedAccounts as any,
        notes: payload.notes,
        description: payload.description,
        amount: payload.amount !== undefined ? String(payload.amount) as any : undefined,
      });
      return res.json({ success: true, id: row.id });
    } catch (e) {
      // Fail-soft: log but don't block UX
      const entry = {
        ts: new Date().toISOString(),
        userId,
        companyId,
        ...payload,
      };
      console.log('[AI_FEEDBACK:FALLBACK_LOG]', JSON.stringify(entry));
      return res.json({ success: true, persisted: false });
    }
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      const validationError = fromZodError(error);
      return badRequest(res, validationError.message);
    }
    console.error('AI feedback error:', error?.message || error);
    return serverError(res, 'Failed to record feedback');
  }
});

// Recent AI feedback (for the active company)
router.get('/feedback/recent', requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session?.companyId || (req as any).session?.company?.id;
    if (!companyId) return res.json([]);
    const fromParam = req.query.from as string | undefined;
    const toParam = req.query.to as string | undefined;
    const sourceParam = req.query.source as string | undefined;
    const limitParam = req.query.limit as string | undefined;
    const fromDate = fromParam && !isNaN(Date.parse(fromParam)) ? new Date(fromParam) : undefined;
    const toDate = toParam && !isNaN(Date.parse(toParam)) ? new Date(toParam) : undefined;
    const limit = limitParam ? Math.max(1, Math.min(500, parseInt(limitParam, 10) || 50)) : 50;

    const conditions: any[] = [eq(ai_feedback.company_id, companyId)];
    if (fromDate) conditions.push(gte(ai_feedback.created_at, fromDate));
    if (toDate) conditions.push(lte(ai_feedback.created_at, toDate));
    if (sourceParam && sourceParam.trim()) conditions.push(eq(ai_feedback.source, sourceParam.trim()));

    const rows = await db
      .select()
      .from(ai_feedback)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(desc(ai_feedback.created_at))
      .limit(limit);
    return res.json(rows);
  } catch (error: any) {
    const msg = String(error?.message || '');
    if (msg.includes('relation "ai_feedback" does not exist') || error?.code === '42P01') {
      return res.json([]);
    }
    console.error('AI feedback recent error:', error?.message || error);
    return serverError(res, 'Failed to fetch AI feedback');
  }
});

// AI feedback summary (acceptance rate per category)
router.get('/feedback/summary', requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session?.companyId || (req as any).session?.company?.id;
    if (!companyId) return res.json({ total: 0, categories: [] });
    const fromParam = req.query.from as string | undefined;
    const toParam = req.query.to as string | undefined;
    const sourceParam = req.query.source as string | undefined;
    const fromDate = fromParam && !isNaN(Date.parse(fromParam)) ? new Date(fromParam) : undefined;
    const toDate = toParam && !isNaN(Date.parse(toParam)) ? new Date(toParam) : undefined;

    const conditions: any[] = [eq(ai_feedback.company_id, companyId)];
    if (fromDate) conditions.push(gte(ai_feedback.created_at, fromDate));
    if (toDate) conditions.push(lte(ai_feedback.created_at, toDate));
    if (sourceParam && sourceParam.trim()) conditions.push(eq(ai_feedback.source, sourceParam.trim()));

    const rows = await db
      .select()
      .from(ai_feedback)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0]);
    const byCategory: Record<string, { total: number; accepted: number }> = {};
    for (const r of rows as any[]) {
      const cat = r.category || 'uncategorized';
      if (!byCategory[cat]) byCategory[cat] = { total: 0, accepted: 0 };
      byCategory[cat].total += 1;
      if (r.accepted) byCategory[cat].accepted += 1;
    }
    const categories = Object.entries(byCategory)
      .map(([category, s]) => ({ category, total: s.total, accepted: s.accepted, acceptanceRate: s.total ? s.accepted / s.total : 0 }))
      .sort((a, b) => b.total - a.total);
    return res.json({ total: (rows as any[]).length, categories });
  } catch (error: any) {
    const msg = String(error?.message || '');
    if (msg.includes('relation "ai_feedback" does not exist') || error?.code === '42P01') {
      return res.json({ total: 0, categories: [] });
    }
    console.error('AI feedback summary error:', error?.message || error);
    return serverError(res, 'Failed to summarize AI feedback');
  }
});

// AI feedback trend (daily buckets)
router.get('/feedback/trend', requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session?.companyId || (req as any).session?.company?.id;
    if (!companyId) return res.json([]);
    const fromParam = req.query.from as string | undefined;
    const toParam = req.query.to as string | undefined;
    const sourceParam = req.query.source as string | undefined;
    const fromDate = fromParam && !isNaN(Date.parse(fromParam)) ? new Date(fromParam) : undefined;
    const toDate = toParam && !isNaN(Date.parse(toParam)) ? new Date(toParam) : undefined;

    const conditions: string[] = ['company_id = $1'];
    const values: any[] = [companyId];
    let idx = 2;
    if (fromDate) { conditions.push(`created_at >= $${idx++}`); values.push(fromDate); }
    if (toDate) { conditions.push(`created_at <= $${idx++}`); values.push(toDate); }
    if (sourceParam && sourceParam.trim()) { conditions.push(`source = $${idx++}`); values.push(sourceParam.trim()); }

    const sql = `
      SELECT 
        to_char(created_at::date, 'YYYY-MM-DD') as day,
        COUNT(*)::int as total,
        SUM(CASE WHEN accepted THEN 1 ELSE 0 END)::int as accepted
      FROM ai_feedback
      WHERE ${conditions.join(' AND ')}
      GROUP BY created_at::date
      ORDER BY day ASC
    `;
    const rows = await pool.query(sql, values).then(r => r.rows);
    return res.json(rows);
  } catch (error: any) {
    const msg = String(error?.message || '');
    if (msg.includes('relation "ai_feedback" does not exist') || error?.code === '42P01') {
      return res.json([]);
    }
    console.error('AI feedback trend error:', error?.message || error);
    return serverError(res, 'Failed to fetch AI feedback trend');
  }
});

// AI pipeline extraction trend (daily buckets) with cost & tokens
router.get('/metrics/pipeline-trend', requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session?.companyId || (req as any).session?.company?.id;
    if (!companyId) return res.json([]);
    const fromParam = req.query.from as string | undefined;
    const toParam = req.query.to as string | undefined;
    const sourceParam = req.query.source as string | undefined;
    const providerParam = req.query.provider as string | undefined;
    const modeParam = req.query.mode as string | undefined;
    const fromDate = fromParam && !isNaN(Date.parse(fromParam)) ? new Date(fromParam) : undefined;
    const toDate = toParam && !isNaN(Date.parse(toParam)) ? new Date(toParam) : undefined;

    const conditions: string[] = ['company_id = $1', "entity_type = 'ai_invoice_extract'"];
    const values: any[] = [companyId];
    let idx = 2;
    if (fromDate) { conditions.push(`timestamp >= $${idx++}`); values.push(fromDate); }
    if (toDate) { conditions.push(`timestamp <= $${idx++}`); values.push(toDate); }
    if (sourceParam && sourceParam.trim()) { conditions.push(`(changes->>'source') = $${idx++}`); values.push(sourceParam.trim()); }
    if (providerParam && providerParam.trim()) { conditions.push(`(changes->>'provider') = $${idx++}`); values.push(providerParam.trim()); }
    if (modeParam && modeParam.trim()) { conditions.push(`(changes->>'mode') = $${idx++}`); values.push(modeParam.trim()); }

    const sql = `
      SELECT 
        to_char(timestamp::date, 'YYYY-MM-DD') as day,
        COUNT(*)::int as extractions,
        COALESCE(SUM( (changes->>'estimated_cost_usd')::numeric ), 0)::float AS total_cost_usd,
        COALESCE(SUM( (changes->>'estimated_tokens_in')::numeric ), 0)::float AS total_tokens_in,
        CASE WHEN COUNT(*) > 0 THEN COALESCE(SUM( (changes->>'estimated_cost_usd')::numeric ),0)::float / COUNT(*) ELSE 0 END AS avg_cost_usd
      FROM audit_logs
      WHERE ${conditions.join(' AND ')}
      GROUP BY timestamp::date
      ORDER BY day ASC
    `;
    const rows = await pool.query(sql, values).then(r => r.rows);
    return res.json(rows);
  } catch (error: any) {
    console.error('AI pipeline trend error:', error?.message || error);
    return serverError(res, 'Failed to fetch AI pipeline trend');
  }
});

// Facets for AI metrics (distinct providers and modes) to drive filters
router.get('/metrics/facets', requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session?.companyId || (req as any).session?.company?.id;
    if (!companyId) return res.json({ providers: [], modes: [] });
    const fromParam = req.query.from as string | undefined;
    const toParam = req.query.to as string | undefined;
    const sourceParam = req.query.source as string | undefined;
    const fromDate = fromParam && !isNaN(Date.parse(fromParam)) ? new Date(fromParam) : undefined;
    const toDate = toParam && !isNaN(Date.parse(toParam)) ? new Date(toParam) : undefined;
    const conditions: string[] = ['company_id = $1', "entity_type = 'ai_invoice_extract'"];
    const values: any[] = [companyId];
    let idx = 2;
    if (fromDate) { conditions.push(`timestamp >= $${idx++}`); values.push(fromDate); }
    if (toDate) { conditions.push(`timestamp <= $${idx++}`); values.push(toDate); }
    if (sourceParam && sourceParam.trim()) { conditions.push(`(changes->>'source') = $${idx++}`); values.push(sourceParam.trim()); }
    const whereClause = conditions.join(' AND ');
    const providersSql = `SELECT DISTINCT (changes->>'provider') AS provider FROM audit_logs WHERE ${whereClause} AND (changes->>'provider') IS NOT NULL`;
    const modesSql = `SELECT DISTINCT (changes->>'mode') AS mode FROM audit_logs WHERE ${whereClause} AND (changes->>'mode') IS NOT NULL`;
    
    const [pRes, mRes] = await Promise.all([
      pool.query(providersSql, values),
      pool.query(modesSql, values)
    ]);
    return res.json({
      providers: pRes.rows.map(r => r.provider).sort(),
      modes: mRes.rows.map(r => r.mode).sort()
    });
  } catch (error: any) {
    console.error('AI metrics facets error:', error?.message || error);
    return serverError(res, 'Failed to fetch AI metrics facets');
  }
});

// === AI PROVIDERS & MODELS ===
// List configured AI providers (sanitized)
router.get('/providers', requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const rows = await db.select().from(ai_providers).where(eq(ai_providers.company_id, companyId));
    const sanitized = rows.map((r: any) => ({
      ...r,
      api_key: r.api_key ? `${String(r.api_key).slice(0, 3)}********${String(r.api_key).slice(-2)}` : null,
    }));
    res.json(sanitized);
  } catch (error: any) {
    console.error('Error listing AI providers:', error);
    return serverError(res, 'Failed to list AI providers');
  }
});

// Create or update an AI provider (restricted to owner/admin)
router.post('/providers', requireAuth, requireRole(['owner','admin']), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const payload = { ...(req.body || {}), company_id: companyId };
    const id = (payload as any).id as string | undefined;
    // Validate (allow partial when updating by id)
    const data = id ? (insertAIProviderSchema.partial().parse(payload)) : insertAIProviderSchema.parse(payload);
    let row: any;
    if (id) {
      const [updated] = await db
        .update(ai_providers)
        .set({ ...(data as any), updated_at: new Date() })
        .where(and(eq(ai_providers.id, id), eq(ai_providers.company_id, companyId)))
        .returning();
      if (!updated) return notFound(res, 'AI provider not found');
      row = updated;
    } else {
      const [created] = await db.insert(ai_providers).values(data as any).returning();
      row = created;
    }
    const sanitized = {
      ...row,
      api_key: row.api_key ? `${String(row.api_key).slice(0, 3)}********${String(row.api_key).slice(-2)}` : null,
    };
    res.json(sanitized);
  } catch (error: any) {
    console.error('Error saving AI provider:', error);
    return serverError(res, 'Failed to save AI provider');
  }
});

// Delete an AI provider (restricted to owner/admin)
router.delete('/providers/:id', requireAuth, requireRole(['owner','admin']), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const id = req.params.id;
    const [deleted] = await db
      .delete(ai_providers)
      .where(and(eq(ai_providers.id, id), eq(ai_providers.company_id, companyId)))
      .returning();
    if (!deleted) return notFound(res, 'AI provider not found');
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting AI provider:', error);
    return serverError(res, 'Failed to delete AI provider');
  }
});

// Simple in-memory cache for model catalogs per company/provider
const modelCatalogCache: Record<string, { ts: number; models: { id: string }[] }> = {};

// List models for a provider (tries live for OpenAI if key exists, falls back to curated)
router.get('/models', requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const providerId = (req.query.providerId as string) || undefined;
    const wantedProvider = ((req.query.provider as string) || '').toLowerCase();
    const forceLive = String(req.query.live || '').toLowerCase() === 'true';
    let provider: any | undefined;
    if (providerId) {
      const [row] = await db
        .select()
        .from(ai_providers)
        .where(and(eq(ai_providers.id, providerId), eq(ai_providers.company_id, companyId)));
      provider = row;
    }
    const p = (provider?.provider || wantedProvider || '').toLowerCase();

    // Attempt live fetch for OpenAI if API key exists
    if (p === 'openai') {
      if (!provider) {
        const rows = await db.select().from(ai_providers).where(eq(ai_providers.company_id, companyId));
        provider = rows.find(r => (r.provider || '').toLowerCase() === 'openai') || rows[0];
      }
      if (provider?.api_key) {
        const cacheKey = `${companyId}:openai:${provider.base_url || 'https://api.openai.com'}`;
        const cached = modelCatalogCache[cacheKey];
        const now = Date.now();
        if (!forceLive && cached && (now - cached.ts) < 10 * 60 * 1000) {
          return res.json(cached.models);
        }
        try {
          const baseUrl = (provider.base_url || 'https://api.openai.com').replace(/\/$/, '');
          const resp = await fetch(`${baseUrl}/v1/models`, {
            headers: { 'Authorization': `Bearer ${provider.api_key}` }
          });
          if (resp.ok) {
            const payload = await resp.json();
            const data = Array.isArray(payload?.data) ? payload.data : [];
            // Map to simple id list; optionally filter to chat/embedding-like ids
            const models = data
              .map((m: any) => ({ id: m?.id }))
              .filter((m: any) => typeof m.id === 'string' && m.id.length > 0);
            if (models.length) {
              modelCatalogCache[cacheKey] = { ts: now, models };
              return res.json(models);
            }
          }
        } catch (e) {
          console.warn('Live OpenAI model list failed, using curated fallback:', e);
        }
      }
    }
    const catalogs: Record<string, string[]> = {
      'openai': ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1', 'o3-mini', 'text-embedding-3-small', 'text-embedding-3-large'],
      'openrouter': ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'google/gemini-1.5-pro', 'google/gemini-1.5-flash'],
      'google': ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash-exp'],
      'anthropic': ['claude-3.5-sonnet', 'claude-3.5-haiku', 'claude-3-opus'],
      'groq': ['llama-3.1-70b-versatile', 'mixtral-8x7b-32768'],
      'mistral': ['mistral-large-latest', 'mistral-medium-latest', 'ministral-8b-latest'],
      'azure': ['gpt-4o', 'gpt-35-turbo'],
    };
    const list = catalogs[p] || catalogs['openai'];
    return res.json(list.map(id => ({ id })));
  } catch (error: any) {
    console.error('Error listing AI models:', error);
    return serverError(res, 'Failed to list AI models');
  }
});

// Connectivity and configuration health-check for an AI provider
// Returns a lightweight diagnostic without exposing secrets
router.get('/providers/health', requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const providerId = (req.query.providerId as string) || undefined;
    const wantedProvider = ((req.query.provider as string) || '').toLowerCase();
    let row: any | undefined;
    if (providerId) {
      const [r] = await db
        .select()
        .from(ai_providers)
        .where(and(eq(ai_providers.id, providerId), eq(ai_providers.company_id, companyId)));
      row = r;
    } else {
      const rows = await db.select().from(ai_providers).where(eq(ai_providers.company_id, companyId));
      row = rows.find(r => (r.provider || '').toLowerCase() === wantedProvider) || rows.find(r => (r.provider || '').toLowerCase() === 'openai') || rows[0];
    }
    if (!row) {
      return res.json({ ok: false, reason: 'No AI provider configured for this company' });
    }
    const p = (row.provider || '').toLowerCase();
    if (!row.api_key) {
      return res.json({ ok: false, provider: p, reason: 'Missing API key' });
    }
    // Attempt a minimal live call for supported providers
    if (p === 'openai') {
      try {
        const baseUrl = (row.base_url || 'https://api.openai.com').replace(/\/$/, '');
        const r = await fetch(`${baseUrl}/v1/models`, {
          headers: { 'Authorization': `Bearer ${row.api_key}` },
          method: 'GET',
        });
        if (!r.ok) {
          const body = await r.text();
          return res.json({ ok: false, provider: p, upstream_status: r.status, reason: 'Upstream returned error', detail: body.slice(0, 500) });
        }
        return res.json({ ok: true, provider: p, reachable: true });
      } catch (e: any) {
        return res.json({ ok: false, provider: p, reason: 'Network or DNS failure', detail: e?.message || String(e) });
      }
    }
    // Unsupported providers for health-check -> return config-only status
    return res.json({ ok: true, provider: p, reachable: false, note: 'Health check not implemented for this provider' });
  } catch (error: any) {
    console.error('AI provider health check failed:', error);
    return serverError(res, 'Failed to perform provider health check');
  }
});

// Check extraction from image (AI-powered)
router.post('/extract/check', requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { image } = req.body;

    if (!image) {
      return badRequest(res, "Image data is required");
    }

    const result = await extractCheckFromImage(companyId, image);
    
    // Log the usage
    await db.insert(audit_logs).values({
      company_id: companyId,
      actor_id: (req as any).user.id,
      action: 'ai_extract_check',
      entity_type: 'check',
      entity_id: 'temp',
      changes: {
        provider: 'ai',
        success: !!result
      }
    });

    res.json({ ok: true, data: result });
  } catch (error) {
    logError('AI Check Extraction Error', error);
    serverError(res, "Failed to extract check data");
  }
});

// Generic Document Extraction (Universal Data Entry)
router.post('/extract/document', requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { image, type } = req.body;

    if (!image || !type) {
      return badRequest(res, "Image data and document type are required");
    }

    const result = await extractDocumentData(companyId, image, type);
    
    // Log the usage
    await db.insert(audit_logs).values({
      company_id: companyId,
      actor_id: (req as any).user.id,
      action: `ai_extract_${type}`,
      entity_type: type,
      entity_id: 'temp',
      changes: {
        provider: 'ai',
        success: !!result
      }
    });

    res.json({ ok: true, data: result });
  } catch (error) {
    logError(`AI ${req.body.type} Extraction Error`, error);
    serverError(res, "Failed to extract document data");
  }
});

export default router;
