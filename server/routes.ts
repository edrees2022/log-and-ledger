import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { pool, db } from "./db";
import { verifyFirebaseToken } from "./firebaseAdmin";
import { 
  insertUserSchema, insertCompanySchema, insertAccountSchema,
  insertContactSchema, insertItemSchema, insertTaxSchema,
  insertSalesInvoiceSchema, insertBillSchema, insertExpenseSchema,
  insertPaymentSchema, insertReceiptSchema, insertBankAccountSchema, loginSchema, registrationSchema,
  insertRecurringTemplateSchema,
  insertSalesCreditNoteSchema,
  insertPurchaseDebitNoteSchema,
  insertSalesOrderSchema,
  insertPurchaseOrderSchema,
  insertCostCenterSchema, insertCheckSchema, insertEmployeeSchema, insertDepartmentSchema,
  insertPayrollRunSchema, insertPayslipSchema, insertManufacturingBomSchema,
  insertManufacturingBomItemSchema, insertProductionOrderSchema,
  insertInventoryBatchSchema, insertInventorySerialSchema
} from "@shared/schema";
import { 
  audit_logs, ai_providers, insertAIProviderSchema,
  sales_invoices, bills, payments, receipts, bank_accounts, accounts, user_permissions, legal_consent_logs,
  cost_centers, checks, employees, departments, payroll_runs, payslips,
  manufacturing_boms, manufacturing_bom_items, production_orders,
  inventory_batches, inventory_serials, journals, journal_lines
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { 
  apiLimiter, 
  loginLimiter, 
  registerLimiter, 
  sensitiveLimiter,
  logsLimiter,
  reportsLimiter,
  bulkOperationsLimiter,
  aiLimiter,
} from "./middleware/rateLimiter";
import { checkCompanyAICap } from "./middleware/aiLimits";
import { requirePermission, requireAnyPermission } from "./middleware/permissions";
import { logLogin, logLogout, logCreate, logDelete, logUpdate, logAudit } from "./utils/auditLog";
import { getCache, setCache, deleteCache, deleteCachePattern } from "./redis";
import { allocatePayment, getUnallocatedAmount, getTotalAllocated, deletePaymentAllocation, getRecentAllocations, getDocumentAllocations, getAllocationById } from "./utils/paymentAllocation";
import { log, logError, logWarn, logDebug } from "./logger";
import { redactSensitive } from "./middleware/redact";
import { normalize, sanitizeUpdate } from "./utils/sanitize";
import { badRequest, unauthorized, forbidden, notFound, serverError } from './utils/sendError';
import { recordStockMovement } from "./utils/inventory";
import { and, eq, gte, lte, desc, asc, count, sql } from 'drizzle-orm';
import aiRouter from "./routes/ai";
import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import settingsRouter from "./routes/settings";
import accountingRouter from "./routes/accounting";
import salesRouter from "./routes/sales";
import purchasesRouter from "./routes/purchases";
import bankingRouter from "./routes/banking";
import journalsRouter from "./routes/journals";
import bankReconciliationRouter from "./routes/bankReconciliation";
import currenciesRouter from "./routes/currencies";
import reportsRouter from "./routes/reports";
import fixedAssetsRouter from "./routes/fixedAssets";
import inventoryRouter from "./routes/inventory";
import budgetsRouter from "./routes/budgets";
import projectsRouter from "./routes/projects";
import manufacturingRouter from "./routes/manufacturing";
import hrRouter from "./routes/hr";
import checksRouter from "./routes/checks";
import costCentersRouter from "./routes/costCenters";
import approvalsRouter from "./routes/approvals";
import landedCostRouter from "./routes/landedCost";
import portalRouter from "./routes/portal";
import aiCfoRouter from "./routes/ai_cfo";
import esgRouter from "./routes/esg";
import archivingRouter from "./routes/archiving";
import apiKeysRouter from "./routes/api_keys";
import publicApiRouter from "./routes/public_api";
import twoFactorRouter from "./routes/two_factor";
import v2Router from "./routes/v2";
import { requireAuth, requireRole, requireFirebaseAuth } from "./middleware/authMiddleware";
// Demo seeding removed for production stability and real-data usage

// Helper to sanitize user data (remove password_hash for security)
function sanitizeUser(user: any) {
  const { password_hash, ...sanitized } = user;
  return sanitized;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Normalize error responses: if status >= 400 and payload has `error` but no `message`, add `message` for consistency
  app.use((req, res, next) => {
    const originalJson = res.json.bind(res);
    (res as any).json = (body: any) => {
      try {
        if (
          res.statusCode >= 400 &&
          body &&
          typeof body === 'object' &&
          'error' in (body as any) &&
          !('message' in (body as any))
        ) {
          body = { message: (body as any).error, ...body };
        }
      } catch {}
      return originalJson(body);
    };
    next();
  });

  // Apply API rate limiting to all /api routes
  app.use("/api/", apiLimiter);

  // API Documentation (Swagger UI)
  app.get('/api/docs', async (_req, res) => {
    res.redirect('/api-docs');
  });

  // Serve Swagger UI
  const swaggerUi = await import('swagger-ui-express');
  const { swaggerSpec } = await import('./swagger');
  
  app.use(
    '/api-docs',
    swaggerUi.default.serve,
    swaggerUi.default.setup(swaggerSpec, {
      customSiteTitle: 'Log & Ledger API Docs',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    })
  );

  // Swagger JSON spec (for external tools)
  app.get('/api/swagger.json', (_req, res) => {
    res.json(swaggerSpec);
  });

  // Health check endpoints (no auth required for monitoring)
  app.get('/api/health', async (req, res) => {
    const { healthCheck } = await import('./health');
    return healthCheck(req, res);
  });
  
  app.get('/api/health/ready', async (req, res) => {
    const { readinessCheck } = await import('./health');
    return readinessCheck(req, res);
  });
  
  app.get('/api/health/live', async (req, res) => {
    const { livenessCheck } = await import('./health');
    return livenessCheck(req, res);
  });

  // Get current session information
  app.get('/api/session', requireAuth, async (req, res) => {
    try {
      const session = (req as any).session;
      
      // Return session data for frontend
      res.json({
        userId: session.userId,
        userName: session.userName,
        username: session.username,
        userRole: session.userRole,
        companyId: session.companyId,
        isAuthenticated: true,
      });
    } catch (error: any) {
      console.error('Error fetching session:', error);
      res.status(500).json({ 
        error: 'Failed to fetch session',
        isAuthenticated: false,
      });
    }
  });

  // AI Routes moved to server/routes/ai.ts
  app.use("/api/ai", aiRouter);
  app.use("/api/users", usersRouter);
  app.use("/api", settingsRouter);
  app.use("/api", accountingRouter);
  app.use("/api/sales", salesRouter);
  app.use("/api/purchases", purchasesRouter);
  app.use("/api/banking", bankingRouter);
  app.use("/api/journals", journalsRouter);
  app.use("/api/bank-reconciliation", bankReconciliationRouter);
  app.use("/api/currencies", currenciesRouter);
  app.use("/api/reports", reportsRouter);
  app.use("/api/fixed-assets", fixedAssetsRouter);
  app.use("/api/inventory", inventoryRouter);
  // Also register warehouses at /api/warehouses for backward compatibility
  app.use("/api/warehouses", inventoryRouter);
  app.use("/api/budgets", budgetsRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/manufacturing", manufacturingRouter);
  app.use("/api/hr", hrRouter);
  app.use("/api/checks", checksRouter);
  app.use("/api/cost-centers", costCentersRouter);
  app.use("/api/v1", publicApiRouter);
  app.use("/api/v2", v2Router);  // Internal API v2 with pagination
  app.use("/api/auth/2fa", twoFactorRouter);

  // === Dashboard API ===
  app.get('/api/reports/dashboard', requireAuth, reportsLimiter, async (req, res) => {
    try {
      const companyId = (req as any).session.companyId;
      
      // Try cache first (5 minutes TTL)
      const cacheKey = `dashboard:${companyId}`;
      const cached = await getCache<any>(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      
      // Get current date range (current month)
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Fetch all data with error handling for each table
      const fetchWithFallback = async (tableName: string, queryFn: () => Promise<any[]>) => {
        try {
          return await queryFn();
        } catch (error: any) {
          console.warn(`[Dashboard] Failed to fetch ${tableName}: ${error.message}`);
          return [];
        }
      };

      const [
        invoicesResult,
        billsResult,
        paymentsResult,
        receiptsResult,
        bankAccountsResult,
        accountsResult
      ] = await Promise.all([
        fetchWithFallback('sales_invoices', () => db.select().from(sales_invoices).where(eq(sales_invoices.company_id, companyId))),
        fetchWithFallback('bills', () => db.select().from(bills).where(eq(bills.company_id, companyId))),
        fetchWithFallback('payments', () => db.select().from(payments).where(eq(payments.company_id, companyId))),
        fetchWithFallback('receipts', () => db.select().from(receipts).where(eq(receipts.company_id, companyId))),
        fetchWithFallback('bank_accounts', () => db.select().from(bank_accounts).where(eq(bank_accounts.company_id, companyId))),
        fetchWithFallback('accounts', () => db.select().from(accounts).where(eq(accounts.company_id, companyId)))
      ]);

      // Calculate KPIs
      const totalCash = bankAccountsResult.reduce((sum, acc) => {
        const balance = parseFloat(acc.opening_balance || '0');
        return sum + balance;
      }, 0);

      const accountsReceivable = invoicesResult
        .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
        .reduce((sum, inv) => sum + (parseFloat(inv.total || '0') - parseFloat(inv.paid_amount || '0')), 0);

      const accountsPayable = billsResult
        .filter(bill => bill.status !== 'paid' && bill.status !== 'cancelled')
        .reduce((sum, bill) => sum + (parseFloat(bill.total || '0') - parseFloat(bill.paid_amount || '0')), 0);

      // Current month revenue
      const currentMonthRevenue = invoicesResult
        .filter(inv => {
          const invDate = new Date(inv.date);
          return invDate >= firstDayOfMonth && invDate <= lastDayOfMonth;
        })
        .reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);

      // Last month revenue for comparison
      const lastMonthRevenue = invoicesResult
        .filter(inv => {
          const invDate = new Date(inv.date);
          return invDate >= firstDayOfLastMonth && invDate <= lastDayOfLastMonth;
        })
        .reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);

      const revenueChange = lastMonthRevenue > 0 
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
        : '0';

      // Monthly revenue data for last 6 months
      const monthlyRevenueData = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        
        const monthRevenue = invoicesResult
          .filter(inv => {
            const invDate = new Date(inv.date);
            return invDate >= monthStart && invDate <= monthEnd;
          })
          .reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);

        const monthExpenses = billsResult
          .filter(bill => {
            const billDate = new Date(bill.date);
            return billDate >= monthStart && billDate <= monthEnd;
          })
          .reduce((sum, bill) => sum + parseFloat(bill.total || '0'), 0);

        monthlyRevenueData.push({
          month: monthDate.toLocaleString('en', { month: 'short' }),
          revenue: Math.round(monthRevenue),
          expenses: Math.round(monthExpenses)
        });
      }

      // Expense breakdown by category - calculated from actual journal entries
      const expenseAccounts = accountsResult.filter(acc => acc.account_type === 'expense');
      
      // Fetch actual expense totals from journal lines for this period
      let expenseBreakdown: { name: string; value: number; color: string }[] = [];
      try {
        const expenseAccountIds = expenseAccounts.map(acc => acc.id);
        if (expenseAccountIds.length > 0) {
          // Get expense totals grouped by account for the current fiscal year
          const fiscalYearStart = new Date(now.getFullYear(), 0, 1); // January 1st
          const expenseTotals = await db
            .select({
              accountId: journal_lines.account_id,
              total: sql<string>`COALESCE(SUM(${journal_lines.base_debit}), 0)`,
            })
            .from(journal_lines)
            .innerJoin(journals, eq(journal_lines.journal_id, journals.id))
            .where(
              and(
                eq(journals.company_id, companyId),
                gte(journals.date, fiscalYearStart),
                sql`${journal_lines.account_id} = ANY(${expenseAccountIds})`
              )
            )
            .groupBy(journal_lines.account_id)
            .orderBy(sql`SUM(${journal_lines.base_debit}) DESC`)
            .limit(5);

          // Map account IDs to names and format
          const accountMap = new Map(expenseAccounts.map(acc => [acc.id, acc.name]));
          const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
          
          expenseBreakdown = expenseTotals.map((exp, idx) => ({
            name: accountMap.get(exp.accountId) || 'Other Expenses',
            value: Math.round(parseFloat(exp.total || '0')),
            color: colors[idx % colors.length],
          }));
        }
      } catch (expenseErr) {
        console.warn('[Dashboard] Failed to calculate expense breakdown:', expenseErr);
        // Fallback to empty breakdown
      }

      // Recent transactions (combine invoices, bills, payments, receipts)
      const recentTransactions = [
        ...invoicesResult.slice(0, 3).map(inv => ({
          id: inv.id,
          date: new Date(inv.date).toISOString().split('T')[0],
          type: 'invoice',
          description: `Invoice ${inv.invoice_number}`,
          amount: `$${parseFloat(inv.total || '0').toFixed(2)}`,
          status: inv.status
        })),
        ...billsResult.slice(0, 3).map(bill => ({
          id: bill.id,
          date: new Date(bill.date).toISOString().split('T')[0],
          type: 'bill',
          description: `Bill ${bill.bill_number || bill.supplier_reference}`,
          amount: `$${parseFloat(bill.total || '0').toFixed(2)}`,
          status: bill.status
        })),
        ...paymentsResult.slice(0, 2).map(payment => ({
          id: payment.id,
          date: new Date(payment.date).toISOString().split('T')[0],
          type: 'payment',
          description: payment.description || 'Payment',
          amount: `$${parseFloat(payment.amount || '0').toFixed(2)}`,
          status: payment.status || 'completed'
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

      const dashboardData = {
        kpis: {
          totalCash,
          accountsReceivable,
          accountsPayable,
          monthlyRevenue: currentMonthRevenue,
          revenueChange: parseFloat(revenueChange)
        },
        monthlyRevenueData,
        expenseBreakdown,
        recentTransactions
      };

      // Cache for 5 minutes
      await setCache(cacheKey, dashboardData, 300);

      res.json(dashboardData);

    } catch (error: any) {
      console.error('Dashboard API error:', error);
      return serverError(res, 'Failed to fetch dashboard data');
    }
  });



  // Lightweight client error logging endpoint
  app.post('/api/logs', logsLimiter, async (req, res) => {
    try {
      const { message, name, stack, componentStack, url, tags, ts } = req.body || {};
      
      // Allow empty message if name is present (some errors only have name)
      if (!message && !name && !stack) {
        return badRequest(res, 'Invalid payload - need message, name, or stack');
      }

      // Redact payload and cap sizes
      const safe = redactSensitive({
        message: String(message || name || 'Unknown error').slice(0, 500),
        name: String(name || 'Error').slice(0, 200),
        stack: String(stack || '').split('\n').slice(0, 3).join(' | ').slice(0, 1000),
        componentStack: String(componentStack || '').slice(0, 1500),
        url: String(url || req.headers['referer'] || ''),
        userAgent: String(req.headers['user-agent'] || ''),
        tags: Array.isArray(tags) ? tags.slice(0, 10) : undefined,
        ts: ts || Date.now(),
        ip: req.ip,
      });

      log(`CLIENT-ERROR :: ${JSON.stringify(safe)}`);
      return res.json({ ok: true });
    } catch (e: any) {
      log(`CLIENT-ERROR-FAILED :: ${e?.message || 'unknown error'}`);
  return serverError(res, 'Failed to record error');
    }
  });

  // Authentication routes - Delegated to auth controller
  app.use('/api/auth', authRouter);

  // Lightweight session diagnostics endpoint (safe, no PII)
  // Purpose: help verify that browser received and is sending the session cookie cross-site
  // Auth: none (read-only, reveals only booleans and ids if present)
  app.get('/api/diagnostics/session', async (req, res) => {
    try {
      const sidCookiePresent = typeof req.headers.cookie === 'string' && req.headers.cookie.includes('ledger.sid=');
      const sess: any = (req as any).session || {};
      const hasSession = Boolean(sess.userId && sess.companyId);
      // Only include IDs if a server-side session is actually set
      const payload: any = {
        ok: true,
        cookiePresent: sidCookiePresent,
        hasSession,
        // Expose minimal IDs to correlate without sensitive profile data
        userId: hasSession ? String(sess.userId) : null,
        companyId: hasSession ? String(sess.companyId) : null,
        requestHeaders: {
          origin: (req.headers.origin as string | undefined) || null,
          host: (req.headers.host as string | undefined) || null,
          referer: (req.headers.referer as string | undefined) || null,
        },
      };
      return res.json(payload);
    } catch (e: any) {
      return serverError(res, 'Diagnostics failed');
    }
  });

  // Database schema diagnostics: verify presence of key tables
  app.get('/api/diagnostics/db', async (_req, res) => {
    try {
      const { sql } = await import('drizzle-orm');
      const rows: any = await db.execute(sql`
        SELECT 
          to_regclass('public.users') IS NOT NULL AS has_users,
          to_regclass('public.companies') IS NOT NULL AS has_companies,
          to_regclass('public.accounts') IS NOT NULL AS has_accounts,
          to_regclass('public.audit_logs') IS NOT NULL AS has_audit_logs
      `);
      const r = rows?.rows?.[0] || rows?.[0] || {};
      // Fetch columns for users table if present for deeper diagnostics
      let usersColumns: string[] = [];
      try {
        const colsRes: any = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position`);
        usersColumns = (colsRes.rows || colsRes).map((r: any) => r.column_name);
      } catch {}
      // Explicitly set status to avoid Next.js/Vercel edge caching anomalies
      res.status(200);
      return res.json({ ok: true, tables: r, usersColumns });
    } catch (e: any) {
      console.error('DB diagnostics error:', e);
      return serverError(res, 'DB diagnostics failed');
    }
  });




  // Users (for creating additional users in existing company)
  app.post("/api/users", requireAuth, async (req, res) => {
    try {
      console.log('📝 Creating new user - Session:', {
        userId: (req as any).session?.userId,
        companyId: (req as any).session?.companyId,
        hasSession: !!(req as any).session,
        firebaseUser: (req as any).firebaseUser?.email,
      });
      
      // Get current user and check if owner
      const currentUserId = (req as any).session?.userId;
      if (!currentUserId) {
        return unauthorized(res, "Authentication required");
      }
      
      const currentUser = await storage.getUserById(currentUserId);
      if (!currentUser || currentUser.role !== 'owner') {
        return forbidden(res, "Only owners can create new users");
      }
      
      const validatedData = insertUserSchema.parse(req.body);
      
      // Get company_id from session first, fallback to firebaseUser's companies
      let companyId = (req as any).session?.companyId;
      
      // If session doesn't have companyId (common with Firebase auth), get from firebaseUser
      if (!companyId && (req as any).firebaseUser) {
        const firebaseUser = (req as any).firebaseUser;
        const userCompanies = await storage.getCompaniesByUserId(firebaseUser.uid);
        
        if (userCompanies.length > 0) {
          companyId = userCompanies[0].id;
          console.log(`🏢 Got companyId from Firebase user's companies: ${companyId}`);
        }
      }
      
      if (!companyId) {
        console.error('❌ No companyId found!', {
          session: (req as any).session,
          firebaseUser: (req as any).firebaseUser,
        });
        return badRequest(res, 'Company context not found. Please refresh and try again.');
      }
      
      // Ensure the new user is created in the same company
      // Default role is 'viewer' unless explicitly specified
      const userData = {
        ...validatedData,
        company_id: companyId,
        role: validatedData.role || 'viewer', // Default to viewer for new users
      };
      
      console.log('✅ Creating user with data:', {
        email: userData.email,
        role: userData.role,
        company_id: userData.company_id,
      });
      
      const user = await storage.createUser(userData);
      
      // Log user creation (use the companyId we resolved above)
      await logCreate({
        companyId: companyId, // Use the resolved companyId
        entityType: 'users',
        entityId: user.id,
        createdData: sanitizeUser(user),
        actorId: (req as any).session?.userId || user.id,
        actorName: (req as any).session?.userName || 'System',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      // Invalidate users cache (use resolved companyId)
      await deleteCache(`users:${companyId}`);
      
      // CRITICAL: Remove password_hash from response for security
      res.status(201).json(sanitizeUser(user));
    } catch (error: any) {
      console.error("❌ Error creating user:", error);
      
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return badRequest(res, validationError.message);
      } else if (error.message?.includes('company_id')) {
        // Our validation error from storage.ts
        return badRequest(res, 'Company context is required. Please refresh and try again.');
      } else if (error.code === '23505') {
        // PostgreSQL unique constraint violation
        if (error.constraint === 'users_email_unique') {
          return badRequest(res, 'This email address is already registered. Please use a different email.');
        } else if (error.constraint === 'users_username_unique') {
          return badRequest(res, 'This username is already taken. Please try again.');
        } else {
          return badRequest(res, 'A user with this information already exists.');
        }
      } else {
        return serverError(res, `Failed to create user: ${error.message}`);
      }
    }
  });

  // List users in active company
  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const companyId = (req as any).session.companyId;
      
      // Try cache first (2 minutes TTL)
      const cacheKey = `users:${companyId}`;
      const cached = await getCache<any[]>(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      
      const users = await storage.getUsersByCompany(companyId);
      const sanitizedUsers = users.map(u => sanitizeUser(u));
      
      // Cache for 2 minutes
      await setCache(cacheKey, sanitizedUsers, 120);
      
      res.json(sanitizedUsers);
    } catch (error: any) {
      console.error("Error listing users:", error);
      return serverError(res, "Failed to list users");
    }
  });

  app.get("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const currentUserId = (req as any).session?.userId;
      const requestedId = req.params.id;
      const companyId = (req as any).session?.companyId;
      
      // Debug logging
      console.log('GET /api/users/:id - Access check:', {
        currentUserId,
        requestedId,
        sessionCompanyId: companyId,
      });
      
      const user = await storage.getUser(requestedId);
      if (!user) {
        return notFound(res, "User not found");
      }
      
      console.log('GET /api/users/:id - User found:', {
        userCompanyId: user.company_id,
        isSelf: currentUserId === requestedId,
        isSameCompany: user.company_id === companyId,
      });
      
      // Allow users to view their own profile OR users in same company
      // Also allow if requesting own user ID (regardless of company context)
      const isSelf = currentUserId === requestedId;
      const isSameCompany = user.company_id === companyId;
      
      // If user is fetching their own profile, always allow
      if (isSelf) {
        // Build explicit response (avoid Drizzle proxy issues)
        const userResponse = {
          id: user.id,
          company_id: user.company_id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          language: user.language,
          timezone: user.timezone,
          theme: user.theme,
          is_active: user.is_active,
          legal_consent_accepted: user.legal_consent_accepted,
          legal_consent_date: user.legal_consent_date,
          legal_consent_version: user.legal_consent_version,
          last_login_at: user.last_login_at,
          created_at: user.created_at,
          updated_at: user.updated_at,
        };
        return res.json(userResponse);
      }
      
      // For other users, require same company
      if (!isSameCompany) {
        return forbidden(res, "You can only view users in your company");
      }
      
      // Build explicit response (avoid Drizzle proxy issues)
      const userResponse = {
        id: user.id,
        company_id: user.company_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        language: user.language,
        timezone: user.timezone,
        theme: user.theme,
        is_active: user.is_active,
        legal_consent_accepted: user.legal_consent_accepted,
        legal_consent_date: user.legal_consent_date,
        legal_consent_version: user.legal_consent_version,
        last_login_at: user.last_login_at,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
      res.json(userResponse);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      return serverError(res, "Failed to fetch user");
    }
  });

  // Update user
  app.put("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const currentUserId = (req as any).session?.userId;
      const userId = req.params.id;
      const companyId = (req as any).session.companyId;
      
      // Allow users to update their own profile, or require owner role for updating others
      if (userId !== currentUserId) {
        const currentUser = await storage.getUserById(currentUserId);
        if (!currentUser || currentUser.role !== 'owner') {
          return forbidden(res, "Only owners can update other users");
        }
      }
      
      // Verify user exists and belongs to same company
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return notFound(res, "User not found");
      }
      
      if (existingUser.company_id !== companyId) {
        return forbidden(res, "Cannot update user from different company");
      }
      
      // If password is being updated, hash it first
      const updateData = { ...req.body };
      if (updateData.password_hash) {
        updateData.password_hash = await bcrypt.hash(updateData.password_hash, 10);
      }
      
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return notFound(res, "User not found");
      }
      
      // Log the update
      await logUpdate({
        companyId,
        entityType: 'users',
        entityId: userId,
        oldData: sanitizeUser(existingUser),
        newData: sanitizeUser(updatedUser),
        actorId: (req as any).session.userId,
        actorName: (req as any).session.userName || 'Unknown',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      // Build explicit response object
      const userResponse = {
        id: updatedUser.id,
        company_id: updatedUser.company_id,
        username: updatedUser.username,
        email: updatedUser.email,
        full_name: updatedUser.full_name,
        role: updatedUser.role,
        language: updatedUser.language,
        timezone: updatedUser.timezone,
        theme: updatedUser.theme,
        is_active: updatedUser.is_active,
        legal_consent_accepted: updatedUser.legal_consent_accepted,
        legal_consent_date: updatedUser.legal_consent_date,
        legal_consent_version: updatedUser.legal_consent_version,
        last_login_at: updatedUser.last_login_at,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
      };
      res.json(userResponse);
    } catch (error: any) {
      console.error("Error updating user:", error);
      return serverError(res, "Failed to update user");
    }
  });

  // Delete user
  app.delete("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).session;
      
      // Only owner can delete users
      const user = await storage.getUserById(currentUser.userId);
      if (!user || user.role !== 'owner') {
        return forbidden(res, "Only owners can delete users");
      }
      
      const userId = req.params.id;
      const companyId = currentUser.companyId;
      
      // Verify user exists and belongs to same company
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return notFound(res, "User not found");
      }
      
      if (existingUser.company_id !== companyId) {
        return forbidden(res, "Cannot delete user from different company");
      }
      
      // Prevent deleting yourself
      if (userId === (req as any).session.userId) {
        return badRequest(res, "Cannot delete your own account");
      }
      
      // Soft delete by setting is_active to false
      const deletedUser = await storage.updateUser(userId, { is_active: false });
      
      // Log the deletion
      await logDelete({
        companyId,
        entityType: 'users',
        entityId: userId,
        deletedData: sanitizeUser(existingUser),
        actorId: (req as any).session.userId,
        actorName: (req as any).session.userName || 'Unknown',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      return serverError(res, "Failed to delete user");
    }
  });

  // Accept legal consent (Terms, Privacy, Disclaimer)
  app.post("/api/users/accept-legal-consent", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const companyId = (req as any).session.companyId;
      
      console.log('📨 Legal consent request received:', { 
        userId, 
        companyId,
        hasSession: !!(req as any).session,
        firebaseUser: (req as any).firebaseUser?.email,
        authHeader: req.headers.authorization ? 'present' : 'missing'
      });
      
      if (!userId) {
        console.error('❌ No userId in session:', {
          session: (req as any).session,
          firebaseUser: (req as any).firebaseUser
        });
        return unauthorized(res, "User ID not found in session");
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        console.error('❌ User not found in database:', userId);
        return notFound(res, "User not found");
      }
      
      console.log('👤 Current user:', { 
        id: user.id, 
        email: user.email,
        legal_consent_accepted: user.legal_consent_accepted 
      });
      
      const consentVersion = process.env.LEGAL_CONSENT_VERSION || '2025-11-01';
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];
      
      // Update user to mark legal consent as accepted
      const updatedUser = await storage.updateUser(userId, {
        legal_consent_accepted: true,
        legal_consent_date: new Date(),
        legal_consent_version: consentVersion,
      });
      
      if (!updatedUser) {
        console.error('❌ Failed to update user:', userId);
        return serverError(res, "Failed to update user");
      }
      
      console.log('✅ User updated:', {
        id: updatedUser.id,
        legal_consent_accepted: updatedUser.legal_consent_accepted,
        legal_consent_date: updatedUser.legal_consent_date,
      });
      
      // Create audit log entry for legal proof (non-blocking)
      try {
        await db.insert(legal_consent_logs).values({
          user_id: userId,
          company_id: companyId,
          consent_version: consentVersion,
          terms_accepted: true,
          privacy_accepted: true,
          disclaimer_accepted: true,
          ip_address: typeof ipAddress === 'string' ? ipAddress : (Array.isArray(ipAddress) ? ipAddress[0] : null),
          user_agent: userAgent || null,
        });
        console.log('📝 Audit log created successfully');
      } catch (auditError: any) {
        console.error('⚠️ Failed to create audit log (non-critical):', auditError.message);
        // Continue anyway - audit log is nice-to-have but not critical
      }
      
      // Log this important action (non-blocking)
      try {
        await logUpdate({
          companyId,
          entityType: 'users',
          entityId: userId,
          oldData: { legal_consent_accepted: false },
          newData: { 
            legal_consent_accepted: true, 
            legal_consent_date: new Date(), 
            legal_consent_version: consentVersion,
            ip_address: ipAddress,
          },
          actorId: userId,
          actorName: user.full_name,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        });
        console.log('📋 Update logged successfully');
      } catch (logError: any) {
        console.error('⚠️ Failed to log update (non-critical):', logError.message);
        // Continue anyway
      }
      
      // Return updated user data
      const sanitizedUser = sanitizeUser(updatedUser);
      console.log('📤 Sending response:', { 
        success: true,
        user_legal_consent_accepted: sanitizedUser.legal_consent_accepted,
      });
      
      res.json({ success: true, message: "Legal consent accepted", user: sanitizedUser });
    } catch (error: any) {
      console.error("❌ Error accepting legal consent:", error);
      return serverError(res, "Failed to accept legal consent");
    }
  });





  // Root endpoint - API info
  app.get("/", (req, res) => {
    res.json({ 
      name: "Log & Ledger API",
      version: "1.0.0",
      status: "running",
      endpoints: {
        health: "/api/health",
        auth: "/api/auth/wildcard",
        docs: "https://github.com/tibrcode/log-and-ledger"
      }
    });
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Legal info (current versions)
  app.get('/api/legal/info', (req, res) => {
    res.json({
      consent_version: process.env.LEGAL_CONSENT_VERSION || '2025-11-01',
      terms_url: '/terms',
      privacy_url: '/privacy',
      disclaimer_url: '/disclaimer',
    });
  });

  // Persist explicit AI processing consent (separate from legal terms) - idempotent
  app.post('/api/ai/consent', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const companyId = (req as any).session.companyId;
      const { version } = req.body || {};
      const { db } = await import('./db');
      const { ai_consent } = await import('@shared/schema');
      const { eq, and } = await import('drizzle-orm');
      // Check existing
      const existing = await db.select().from(ai_consent).where(and(eq(ai_consent.company_id, companyId), eq(ai_consent.user_id, userId))).limit(1);
      if (existing[0]) {
        res.json({ success: true, consent: existing[0], existing: true });
        return;
      }
      const versionStr = version || process.env.LEGAL_CONSENT_VERSION || '2025-11-01';
      await db.insert(ai_consent).values({ company_id: companyId, user_id: userId, version: versionStr, accepted: true });
      const inserted = await db.select().from(ai_consent).where(and(eq(ai_consent.company_id, companyId), eq(ai_consent.user_id, userId))).limit(1);
      res.json({ success: true, consent: inserted[0], existing: false });
    } catch (error) {
      console.error('Failed to persist AI consent:', error);
      return serverError(res, 'Failed to persist AI consent');
    }
  });

  // Fetch AI consent status for current user
  app.get('/api/ai/consent', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const companyId = (req as any).session.companyId;
      const { db } = await import('./db');
      const { ai_consent } = await import('@shared/schema');
      const { eq, and } = await import('drizzle-orm');
      const rows = await db.select().from(ai_consent).where(and(eq(ai_consent.company_id, companyId), eq(ai_consent.user_id, userId))).limit(1);
      if (!rows[0]) {
        res.json({ accepted: false, version: null });
        return;
      }
      const c = rows[0] as any;
      res.json({ accepted: c.accepted, version: c.version, accepted_at: c.accepted_at });
    } catch (error) {
      console.error('Failed to fetch AI consent:', error);
      return serverError(res, 'Failed to fetch AI consent');
    }
  });

  // Fetch current user's legal consent info + last acceptance metadata
  app.get('/api/users/consent', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const companyId = (req as any).session.companyId;
      const user = await storage.getUser(userId);
      if (!user) return notFound(res, 'User not found');

      // Try to find the latest audit log entry where user updated with consent
      // We'll query audit_logs by entity_type/users, entity_id, action=update and return latest
      const { db } = await import('./db');
      const { audit_logs } = await import('@shared/schema');
      const { eq, and, desc } = await import('drizzle-orm');

      const rows = await db
        .select()
        .from(audit_logs)
        .where(and(eq(audit_logs.company_id, companyId), eq(audit_logs.entity_type, 'users'), eq(audit_logs.entity_id, userId)))
        .orderBy(desc(audit_logs.timestamp))
        .limit(5);

      const consentLog = rows.find(r => {
        try {
          const changes = (r as any).changes || {};
          return changes.legal_consent_accepted?.new === true || changes.legal_consent_date?.new;
        } catch { return false; }
      }) || null;

      res.json({
        legal_consent_accepted: user.legal_consent_accepted,
        legal_consent_date: user.legal_consent_date,
        legal_consent_version: (user as any).legal_consent_version || null,
        last_ip: consentLog?.ip_address || null,
        last_user_agent: consentLog?.user_agent || null,
      });
    } catch (error) {
      console.error('Failed to fetch consent info:', error);
      return serverError(res, 'Failed to fetch consent info');
    }
  });

  // === AUDIT LOGS ===
  // Owner/Admin can fetch audit logs for their company with optional filters
  app.get('/api/audit-logs', requireAuth, requireRole(['owner','admin']), async (req, res) => {
    try {
      const companyId = (req as any).session.companyId;
      const entityType = (req.query.entity_type as string) || undefined;
      const action = (req.query.action as string) || undefined;
      const actor = (req.query.actor as string) || undefined;
      const entityId = (req.query.entity_id as string) || undefined;
      const fromParam = (req.query.from as string) || undefined;
      const toParam = (req.query.to as string) || undefined;
      const limitParam = (req.query.limit as string) || undefined;
      const offsetParam = (req.query.offset as string) || undefined;
      const sortParam = ((req.query.sort as string) || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

      const fromDate = fromParam && !isNaN(Date.parse(fromParam)) ? new Date(fromParam) : undefined;
      const toDate = toParam && !isNaN(Date.parse(toParam)) ? new Date(toParam) : undefined;
  const limit = limitParam ? Math.max(1, Math.min(500, parseInt(limitParam, 10) || 50)) : 50;
  const offset = offsetParam ? Math.max(0, Math.min(1_000_000, parseInt(offsetParam, 10) || 0)) : 0;

      const whereClauses: any[] = [eq(audit_logs.company_id, companyId)];
      if (entityType) whereClauses.push(eq(audit_logs.entity_type, entityType));
      if (action) whereClauses.push(eq(audit_logs.action, action));
      if (actor) whereClauses.push(eq(audit_logs.actor_name, actor));
      if (entityId) whereClauses.push(eq(audit_logs.entity_id, entityId));
      if (fromDate) whereClauses.push(gte(audit_logs.timestamp, fromDate));
      if (toDate) whereClauses.push(lte(audit_logs.timestamp, toDate));

      const [rows, totalRows] = await Promise.all([
        db
          .select()
          .from(audit_logs)
          .where(and(...whereClauses))
          .orderBy(sortParam === 'asc' ? asc(audit_logs.timestamp) : desc(audit_logs.timestamp))
          .limit(limit)
          .offset(offset),
        db
          .select({ value: count() })
          .from(audit_logs)
          .where(and(...whereClauses)),
      ]);

      const total = Number(totalRows?.[0]?.value ?? 0);
      res.setHeader('X-Total-Count', String(total));
      res.json(rows);
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      return serverError(res, 'Failed to fetch audit logs');
    }
  });

  // Export audit logs as CSV (streams in batches to avoid memory pressure)
  app.get('/api/audit-logs/export', requireAuth, requireRole(['owner','admin']), async (req, res) => {
    try {
      const companyId = (req as any).session.companyId;
      const entityType = (req.query.entity_type as string) || undefined;
      const action = (req.query.action as string) || undefined;
      const actor = (req.query.actor as string) || undefined;
      const entityId = (req.query.entity_id as string) || undefined;
      const fromParam = (req.query.from as string) || undefined;
      const toParam = (req.query.to as string) || undefined;
      const sortParam = ((req.query.sort as string) || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

      const fromDate = fromParam && !isNaN(Date.parse(fromParam)) ? new Date(fromParam) : undefined;
      const toDate = toParam && !isNaN(Date.parse(toParam)) ? new Date(toParam) : undefined;

      const whereClauses: any[] = [eq(audit_logs.company_id, companyId)];
      if (entityType) whereClauses.push(eq(audit_logs.entity_type, entityType));
      if (action) whereClauses.push(eq(audit_logs.action, action));
      if (actor) whereClauses.push(eq(audit_logs.actor_name, actor));
      if (entityId) whereClauses.push(eq(audit_logs.entity_id, entityId));
      if (fromDate) whereClauses.push(gte(audit_logs.timestamp, fromDate));
      if (toDate) whereClauses.push(lte(audit_logs.timestamp, toDate));

      // CSV headers
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
      const escapeCsv = (v: unknown) => {
        if (v === null || v === undefined) return '""';
        const s = String(v);
        return '"' + s.replace(/"/g, '""') + '"';
      };
      res.write(["timestamp","action","entity_type","entity_id","actor_name","ip_address","user_agent","changes"].join(',') + '\n');

      const BATCH = 1000;
      const MAX_ROWS = 100_000;
      let exported = 0;
      let offset = 0;
      while (exported < MAX_ROWS) {
        const rows = await db
          .select()
          .from(audit_logs)
          .where(and(...whereClauses))
          .orderBy(sortParam === 'asc' ? asc(audit_logs.timestamp) : desc(audit_logs.timestamp))
          .limit(BATCH)
          .offset(offset);

        if (!rows.length) break;
        for (const r of rows) {
          const line = [
            escapeCsv((r as any).timestamp?.toISOString?.() || new Date((r as any).timestamp).toISOString()),
            escapeCsv((r as any).action),
            escapeCsv((r as any).entity_type),
            escapeCsv((r as any).entity_id),
            escapeCsv((r as any).actor_name),
            escapeCsv((r as any).ip_address),
            escapeCsv((r as any).user_agent),
            escapeCsv((r as any).changes ? JSON.stringify((r as any).changes) : '')
          ].join(',');
          res.write(line + '\n');
          exported++;
          if (exported >= MAX_ROWS) break;
        }
        if (exported >= MAX_ROWS) break;
        offset += rows.length;
      }
      res.end();
    } catch (error: any) {
      console.error('Error exporting audit logs:', error);
      return serverError(res, 'Failed to export audit logs');
    }
  });

  // === AI ANALYTICS ===
  // Get AI extraction analytics: success rates, costs, trends
  app.get('/api/reports/ai-analytics', requireAuth, reportsLimiter, async (req, res) => {
    try {
      const companyId = (req as any).session.companyId;
      const days = Math.min(365, Math.max(1, parseInt(req.query.days as string) || 30));
      const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get AI extraction audit logs
      const aiLogs = await db
        .select()
        .from(audit_logs)
        .where(
          and(
            eq(audit_logs.company_id, companyId),
            eq(audit_logs.entity_type, 'ai_invoice_extract'),
            gte(audit_logs.timestamp, fromDate)
          )
        )
        .orderBy(desc(audit_logs.timestamp));

      // Calculate statistics
      const totalExtractions = aiLogs.length;
      const successfulExtractions = aiLogs.filter(log => {
        const changes = log.changes as any;
        return changes?.ok === true;
      }).length;
      const failedExtractions = totalExtractions - successfulExtractions;
      const successRate = totalExtractions > 0 ? (successfulExtractions / totalExtractions * 100).toFixed(1) : '0.0';

      // Group by provider
      const providerStats: Record<string, { total: number; success: number; model?: string }> = {};
      const modelStats: Record<string, number> = {};
      const modeStats: Record<string, number> = {};

      aiLogs.forEach(log => {
        const changes = log.changes as any;
        const provider = changes?.provider || 'unknown';
        const model = changes?.model || 'unknown';
        const mode = changes?.mode || 'text';
        const success = changes?.ok === true;

        if (!providerStats[provider]) {
          providerStats[provider] = { total: 0, success: 0, model };
        }
        providerStats[provider].total++;
        if (success) providerStats[provider].success++;

        modelStats[model] = (modelStats[model] || 0) + 1;
        modeStats[mode] = (modeStats[mode] || 0) + 1;
      });

      // Daily trend (last 30 days)
      const dailyTrend: Array<{ date: string; extractions: number; success: number }> = [];
      for (let i = Math.min(days, 30) - 1; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayLogs = aiLogs.filter(log => {
          const logDate = new Date(log.timestamp).toISOString().split('T')[0];
          return logDate === dateStr;
        });
        dailyTrend.push({
          date: dateStr,
          extractions: dayLogs.length,
          success: dayLogs.filter(log => (log.changes as any)?.ok === true).length,
        });
      }

      // Most extracted fields (from successful extractions)
      const fieldCounts: Record<string, number> = {};
      aiLogs.forEach(log => {
        if ((log.changes as any)?.ok !== true) return;
        const entityId = log.entity_id;
        if (entityId && entityId !== 'vision' && entityId !== 'pdf' && entityId !== 'text') {
          fieldCounts['invoice_number'] = (fieldCounts['invoice_number'] || 0) + 1;
        }
      });

      // Estimated costs
      const estimatedCost = aiLogs.reduce((sum, log) => {
        const changes = log.changes as any;
        if (typeof changes?.estimated_cost_usd === 'number') {
          return sum + changes.estimated_cost_usd;
        }
        
        // Fallback: Very rough cost estimates (per 1000 tokens)
        const model = changes?.model || '';
        let costPer1k = 0.0001; // default
        if (model.includes('gpt-4o')) costPer1k = 0.01;
        else if (model.includes('gpt-4')) costPer1k = 0.03;
        else if (model.includes('claude-3-5')) costPer1k = 0.003;
        else if (model.includes('gemini')) costPer1k = 0.0005;
        
        // Estimate ~500 tokens per extraction
        return sum + (costPer1k * 0.5);
      }, 0);

      // Recent extractions (last 10)
      const recentExtractions = aiLogs.slice(0, 10).map(log => {
        const changes = log.changes as any;
        return {
          id: log.id,
          timestamp: log.timestamp,
          entity_id: log.entity_id,
          provider: changes?.provider || 'unknown',
          model: changes?.model || 'unknown',
          mode: changes?.mode || 'text',
          success: changes?.ok === true,
          actor: log.actor_name,
          cost: changes?.estimated_cost_usd,
          tokens: changes?.estimated_tokens_in && changes?.estimated_tokens_out 
            ? { in: changes.estimated_tokens_in, out: changes.estimated_tokens_out } 
            : undefined,
          error: changes?.error
        };
      });

      res.json({
        summary: {
          totalExtractions,
          successfulExtractions,
          failedExtractions,
          successRate: parseFloat(successRate),
          estimatedCost: parseFloat(estimatedCost.toFixed(4)),
          currency: 'USD',
        },
        providers: Object.entries(providerStats).map(([name, stats]) => ({
          name,
          total: stats.total,
          success: stats.success,
          successRate: stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : '0.0',
          model: stats.model,
        })),
        models: Object.entries(modelStats).map(([name, count]) => ({
          name,
          count,
        })).sort((a, b) => b.count - a.count),
        modes: Object.entries(modeStats).map(([name, count]) => ({
          name,
          count,
        })),
        dailyTrend,
        recentExtractions,
      });
    } catch (error: any) {
      logError('Error fetching AI analytics:', error);
      return serverError(res, 'Failed to fetch AI analytics');
    }
  });

  // Extract structured invoice fields from text or image (vision for OpenAI only for now)
  app.post('/api/ai/extract/invoice', requireAuth, aiLimiter, checkCompanyAICap, async (req, res) => {
    try {
      const started = Date.now();
      const companyId = (req as any).session.companyId;
      const userId = (req as any).session.userId;
      const userName = (req as any)?.session?.userName || userId || 'System';
      let { text, image_base64, mime_type, provider_id, provider, model, prompt, page_range, pages, locale, refine_llm } = req.body || {};

      // Provider strategy preflight (non-invasive): compute a pipeline plan for meta & future decisions
      let pipelinePlan: any | undefined;
      try {
        const { selectPipeline, normalizeProviders, adjustCandidatesWithFeedback } = await import('./ai/providerStrategy');
        // Load available providers for this company once for planning
        const rows = await db.select().from(ai_providers).where(eq(ai_providers.company_id, companyId));
        let candidates = normalizeProviders(rows as any[]);

        // Integrate feedback to adjust candidate ordering
        try {
          const feedbackStats: any = await db.execute(sql`
            SELECT 
              (a.changes->>'provider') as provider,
              COUNT(*) as total,
              SUM(CASE WHEN f.accepted THEN 1 ELSE 0 END) as accepted
            FROM ai_feedback f
            JOIN audit_logs a ON a.entity_id = f.transaction_id AND a.entity_type = 'ai_invoice_extract'
            WHERE f.company_id = ${companyId}
            GROUP BY (a.changes->>'provider')
          `);
          
          const scores = (feedbackStats.rows || feedbackStats || []).map((r: any) => ({
            provider: String(r.provider || ''),
            acceptanceRate: Number(r.total) > 0 ? Number(r.accepted) / Number(r.total) : 0.5,
            totalFeedback: Number(r.total)
          })).filter((s: any) => s.provider);
          
          if (scores.length > 0) {
            candidates = adjustCandidatesWithFeedback(candidates, scores);
          }
        } catch (err) {
          // Non-blocking: if feedback query fails, proceed with default order
          console.warn('Feedback adjustment skipped:', err);
        }

        const mt = (mime_type || '').toString().toLowerCase();
        const isPdf = /pdf/.test(mt);
        const imageProvided = !!image_base64;
        const pagesCount = Array.isArray(pages) ? pages.length : undefined;
        pipelinePlan = selectPipeline({
          mimeType: mime_type,
          sizeBytes: typeof image_base64 === 'string' ? image_base64.length : (typeof text === 'string' ? text.length : undefined),
          pagesCount,
          imageProvided,
          wantsVision: true,
          locale: (locale || (req.headers['accept-language'] as string | undefined) || 'en') as string,
          candidates,
        });
      } catch (e) {
        // Strategy module is best-effort; continue even if it fails
        pipelinePlan = undefined;
      }

      // Helper: parse JSON from a model response string
      const tryParseJson = (s: string) => {
        try { return JSON.parse(s); } catch {}
        const m = s.match(/\{[\s\S]*\}/);
        if (m) {
          try { return JSON.parse(m[0]); } catch {}
        }
        return null;
      };

      // OCR Fallback: If pipeline says 'ocr+llm', perform OCR now so it falls into the text path
      if (pipelinePlan?.mode === 'ocr+llm' && image_base64 && (!text || !text.trim())) {
         try {
           const { performOCR } = await import('./ai/ocr');
           const ocrRes = await performOCR(image_base64);
           if (ocrRes.text) {
             text = ocrRes.text;
             if (ocrRes.warnings?.length && pipelinePlan) {
                pipelinePlan.warnings = [...(pipelinePlan.warnings || []), ...ocrRes.warnings];
             }
           }
         } catch (e) {
           console.error('OCR fallback failed:', e);
         }
      }

      // If PDF or Text provided, extract/use text
      const isPdf = image_base64 && typeof image_base64 === 'string' && mime_type && /pdf/i.test(String(mime_type));
      const hasText = typeof text === 'string' && text.trim().length > 0;

      if (isPdf || hasText) {
        try {
          let pdfText = '';

          if (isPdf) {
            // Lazy require to avoid type issues if not installed
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const pdfParse = require('pdf-parse');
            const buf = Buffer.from(image_base64, 'base64');
            // Safety cap ~10MB
            if (buf.length > 10 * 1024 * 1024) {
              return badRequest(res, 'PDF too large');
            }
            // Parse page selection (1-indexed)
            const toPageSet = (): Set<number> | null => {
              try {
                if (Array.isArray(pages) && pages.length) {
                  const s = new Set<number>();
                  for (const p of pages) {
                    const n = Number(p);
                    if (Number.isFinite(n) && n >= 1) s.add(Math.floor(n));
                  }
                  return s.size ? s : null;
                }
                if (typeof page_range === 'string' && page_range.trim()) {
                  const s = new Set<number>();
                  for (const part of page_range.split(',')) {
                    const seg = part.trim();
                    if (!seg) continue;
                    const m = seg.match(/^(\d+)(?:\s*[-–]\s*(\d+))?$/);
                    if (m) {
                      const a = parseInt(m[1], 10);
                      const b = m[2] ? parseInt(m[2], 10) : a;
                      const start = Math.min(a, b);
                      const end = Math.max(a, b);
                      for (let i = start; i <= end; i++) s.add(i);
                    }
                  }
                  return s.size ? s : null;
                }
              } catch {}
              return null;
            };

            const selectedPages = toPageSet();
            let pageCounter = 0;
            const MAX_PAGES_DEFAULT = 2; // default cap when large docs and no selection
            const parsed = await pdfParse(buf, {
              pagerender: (pageData: any) => {
                pageCounter += 1;
                const currentPage = pageCounter;
                // If selection exists, only render selected pages
                if (selectedPages && !selectedPages.has(currentPage)) {
                  return Promise.resolve('');
                }
                return pageData.getTextContent().then((tc: any) =>
                  tc.items.map((it: any) => it.str).join('\n') + '\n'
                );
              },
              // If no explicit selection and doc is huge, pdf-parse will still render all pages.
              // We implement a soft cap by trimming after parse below when needed.
            });
            pdfText = parsed?.text || '';
            if (!selectedPages && parsed?.numpages && parsed.numpages > 10) {
              // Heuristic: if many pages and no selection, keep first MAX_PAGES_DEFAULT pages by splitting on newlines length
              const lines = pdfText.split('\n');
              // crude trim: keep first N lines proportional to pages
              const approxPerPage = Math.max(80, Math.floor(lines.length / parsed.numpages));
              pdfText = lines.slice(0, approxPerPage * MAX_PAGES_DEFAULT).join('\n');
            }
          } else {
            pdfText = text || '';
          }

          if (!pdfText.trim()) return badRequest(res, 'Failed to read text content');

          // Call helper
          const { extractInvoiceFromText } = await import('./utils/invoiceExtraction');
          const extraction = await extractInvoiceFromText(pdfText, companyId, {
             provider_id, provider, model, prompt, refine_llm
          });
          
          // Audit
          await logAudit({
            companyId,
            entityType: 'ai_invoice_extract',
            entityId: extraction.result.invoice_number || 'text',
            action: 'create',
            changes: {
              mode: 'text',
              provider: extraction.meta.provider,
              model: extraction.meta.model,
              text_size: pdfText.length,
              ok: true,
              estimated_cost_usd: extraction.meta.cost?.totalUSD,
              estimated_tokens_in: extraction.meta.cost?.inputTokens,
              estimated_tokens_out: extraction.meta.cost?.outputTokens,
            },
            actorId: userId,
            actorName: userName,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string | undefined,
          });
          
          let finalPipeline2 = pipelinePlan || undefined;
          if (refine_llm) {
            finalPipeline2 = finalPipeline2 ? { ...finalPipeline2, steps: Array.isArray(finalPipeline2.steps) ? [...finalPipeline2.steps, 'llm-refine'] : ['llm-refine'] } : { mode: 'text', reason: 'Refined via LLM', steps: ['text-heuristics','llm-refine'], warnings: [], estimated_cost_usd: 0 };
          }
          
          res.json({ ...extraction.result, meta: { ...extraction.meta, duration_ms: Date.now() - started, pipeline: finalPipeline2 } });
    } catch (e) {
      console.error('PDF processing error:', e);
      return serverError(res, 'Failed to process PDF');
    }
  } else if (image_base64) {
      // === VISION PATH (Images) ===
      try {
        // Resolve provider
        let rowLLM: any | undefined;
        if (provider_id) {
          const [r] = await db.select().from(ai_providers).where(and(eq(ai_providers.id, provider_id), eq(ai_providers.company_id, companyId)));
          rowLLM = r;
        } else {
          const provName = (provider || '').toString().toLowerCase();
          const rows2 = await db.select().from(ai_providers).where(eq(ai_providers.company_id, companyId));
          rowLLM = rows2.find(r => (r.provider || '').toLowerCase() === (provName || 'openai')) || rows2.find(r => (r.provider || '').toLowerCase() === 'openai') || rows2[0];
        }

        if (!rowLLM?.api_key) {
          return badRequest(res, 'No AI provider configured for Vision extraction');
        }

        const baseUrl2 = (rowLLM.base_url || 'https://api.openai.com').replace(/\/$/, '');
        const useModel2 = model || rowLLM.vision_model || rowLLM.default_model || 'gpt-4o'; // Default to vision-capable model
        const instructions2 = prompt || "Extract invoice fields and return strict JSON with keys: vendor_name, invoice_number, date, due_date, currency, subtotal, tax_total, total, notes. Dates must be ISO (YYYY-MM-DD). Currency as code if possible. Only output the JSON.";

        const { callAIProvider, buildInvoiceExtractionMessages } = await import('./utils/aiProviders');
        const cfgVision: any = { provider: (rowLLM.provider || 'openai').toLowerCase(), apiKey: rowLLM.api_key, baseUrl: baseUrl2, model: useModel2 };
        
        const msgsVision = buildInvoiceExtractionMessages(undefined, image_base64, mime_type || 'image/jpeg', instructions2);
        const aiVision = await callAIProvider(cfgVision, msgsVision);

        let result: any = {};
        const warnings: string[] = [];
        let costInfo: { totalUSD?: number, inputTokens?: number, outputTokens?: number } | undefined;

        if (aiVision?.content != null) {
          const content2 = aiVision.content || '';
          const tryParse = (s: string) => { try { return JSON.parse(s); } catch { const m = s.match(/\{[\s\S]*\}/); if (m) { try { return JSON.parse(m[0]); } catch {} } return null; } };
          const json2 = typeof content2 === 'string' ? tryParse(content2) : null;
          
          if (json2) {
            result = {
              vendor_name: json2.vendor_name || undefined,
              invoice_number: json2.invoice_number || undefined,
              date: json2.date || undefined,
              due_date: json2.due_date || undefined,
              currency: json2.currency || undefined,
              subtotal: json2.subtotal ? String(json2.subtotal) : undefined,
              tax_total: json2.tax_total ? String(json2.tax_total) : undefined,
              total: json2.total ? String(json2.total) : undefined,
              notes: json2.notes || undefined,
              line_items: Array.isArray(json2.line_items) ? json2.line_items : []
            };
            
            if (aiVision.cost?.totalUSD != null) {
              costInfo = {
                totalUSD: aiVision.cost.totalUSD,
                inputTokens: aiVision.usage?.prompt_tokens,
                outputTokens: aiVision.usage?.completion_tokens
              };
            }
          } else {
            warnings.push('Vision LLM failed to parse JSON');
          }
        } else {
          warnings.push('Vision LLM upstream error');
        }

        // Audit
        await logAudit({
          companyId,
          entityType: 'ai_invoice_extract',
          entityId: 'vision',
          action: 'create',
          changes: {
            mode: 'vision',
            provider: rowLLM.provider,
            model: useModel2,
            image_size: image_base64.length,
            ok: !!result.invoice_number,
            estimated_cost_usd: costInfo?.totalUSD,
            estimated_tokens_in: costInfo?.inputTokens,
            estimated_tokens_out: costInfo?.outputTokens,
          },
          actorId: userId,
          actorName: userName,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] as string | undefined,
        });

        res.json({ ...result, meta: { mode: 'vision', provider: rowLLM.provider, model: useModel2, warnings, duration_ms: Date.now() - started, cost: costInfo } });

      } catch (e: any) {
        console.error('Vision processing error:', e);
        
        // Fallback to OCR + Text
        try {
           const { performOCR } = await import('./ai/ocr');
           const ocrRes = await performOCR(image_base64);
           if (ocrRes.text) {
              const { extractInvoiceFromText } = await import('./utils/invoiceExtraction');
              const extraction = await extractInvoiceFromText(ocrRes.text, companyId, {
                 provider_id, provider, model, prompt, refine_llm: true
              });
              
              // Audit fallback
              await logAudit({
                companyId,
                entityType: 'ai_invoice_extract',
                entityId: extraction.result.invoice_number || 'ocr-fallback',
                action: 'create',
                changes: {
                  mode: 'ocr+llm',
                  fallback: true,
                  provider: extraction.meta.provider,
                  model: extraction.meta.model,
                  ok: true,
                  estimated_cost_usd: extraction.meta.cost?.totalUSD,
                },
                actorId: userId,
                actorName: userName,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'] as string | undefined,
              });
              
              return res.json({ ...extraction.result, meta: { ...extraction.meta, mode: 'ocr+llm', warnings: [...(extraction.meta.warnings||[]), 'Vision failed, fell back to OCR'], duration_ms: Date.now() - started } });
           }
        } catch (fallbackErr) {
           console.error('Fallback OCR failed:', fallbackErr);
        }

        return serverError(res, 'Failed to process image via Vision API: ' + e.message);
      }
    }
  } catch (error: any) {
      console.error('Error extracting invoice fields:', error);
      // Audit failure (non-blocking)
      try {
        const companyId = (req as any).session.companyId;
        const userId = (req as any).session.userId;
        const userName = (req as any)?.session?.userName || userId || 'System';
        const { text, image_base64, mime_type, provider_id, provider, model } = req.body || {};
        await logAudit({
          companyId,
          entityType: 'ai_invoice_extract',
          entityId: image_base64 ? 'vision' : 'text',
          action: 'create',
          changes: {
            mode: image_base64 ? 'vision' : 'text',
            provider: provider || undefined,
            model: model || undefined,
            mime_type: mime_type || undefined,
            size: image_base64 ? (image_base64.length) : (typeof text === 'string' ? text.length : 0),
            ok: false,
            error: error?.message || String(error),
          },
          actorId: userId,
          actorName: userName,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] as string | undefined,
        });
      } catch {}
      return serverError(res, 'Failed to extract invoice fields');
    }
  });



  // (sanitizeUpdate moved to utils/sanitize)

  // === Contacts (Customers/Suppliers) ===
  app.get("/api/contacts", requireAuth, async (req, res) => {
    try {
      // Use company from session
      const companyId = (req as any).session.companyId;
      const contacts = await storage.getContactsByCompany(companyId);
      res.json(contacts);
    } catch (error: any) {
      console.error("Error fetching contacts:", error);
      return serverError(res, "Failed to fetch contacts");
    }
  });

  app.post("/api/contacts", requireAuth, async (req, res) => {
    try {
      // Use company from session
      const companyId = (req as any).session.companyId;

      const body = normalize(req.body);
      if (!body.type) body.type = 'customer';
      if (!body.currency) body.currency = 'USD';
      if (body.payment_terms_days === undefined) body.payment_terms_days = 30;
      if (body.is_active === undefined) body.is_active = true;

      const validatedData = insertContactSchema.parse({
        ...body,
        company_id: companyId
      });
      const contact = await storage.createContact(validatedData);
      
      // Audit log
      const userId = (req as any).session.userId;
      await logCreate({
        companyId,
        entityType: 'contact',
        entityId: contact.id,
        createdData: { name: contact.name, type: contact.type, email: contact.email },
        actorId: userId,
        actorName: (req as any).session?.userName || 'User',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      res.status(201).json(contact);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return badRequest(res, validationError.message);
      } else {
        console.error("Error creating contact:", error);
        return serverError(res, "Failed to create contact");
      }
    }
  });

  app.put("/api/contacts/:id", requireAuth, requireRole(['owner','admin','accountant']), async (req, res) => {
    try {
      const companyId = (req as any).session.companyId;
      const userId = (req as any).session.userId;
      
      const update = sanitizeUpdate(req.body);
      const validated = insertContactSchema.partial().parse(update);
      const contact = await storage.updateContact(req.params.id, validated);
      if (!contact) return notFound(res, "Contact not found");
      
      // Audit log
      await logUpdate({
        companyId,
        entityType: 'contact',
        entityId: contact.id,
        oldData: {},
        newData: validated,
        actorId: userId,
        actorName: (req as any).session?.userName || 'User',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      res.json(contact);
    } catch (error: any) {
      console.error("Error updating contact:", error);
      return serverError(res, "Failed to update contact");
    }
  });

  app.delete("/api/contacts/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = (req as any).session.companyId;
      const userId = (req as any).session.userId;
      
      const success = await storage.deleteContact(companyId, id);
      if (!success) return notFound(res, "Contact not found");
      
      // Audit log
      await logDelete({
        companyId,
        entityType: 'contact',
        entityId: id,
        deletedData: { id },
        actorId: userId,
        actorName: (req as any).session?.userName || 'User',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting contact:", error);
      return serverError(res, "Failed to delete contact");
    }
  });

  // === Items (Products/Services) ===
  app.get("/api/items", requireAuth, async (req, res) => {
    try {
      // Use company from session
      const companyId = (req as any).session.companyId;
      const items = await storage.getItemsByCompany(companyId);
      res.json(items);
    } catch (error: any) {
      console.error("Error fetching items:", error);
      return serverError(res, "Failed to fetch items");
    }
  });

  app.post("/api/items", requireAuth, async (req, res) => {
    try {
      // Use company from session
      const companyId = (req as any).session.companyId;
      if (!companyId) {
        return unauthorized(res, "No company context for user");
      }

      // Apply sane defaults so forms that omit fields still pass
      const body = normalize(req.body);
      // Coerce numeric decimals to strings for schema compatibility
     

      const decimalFields = [
        "sales_price",
        "cost_price",
        "stock_quantity",
        "reorder_level",
      ];
      for (const f of decimalFields) {
        if (typeof (body as any)[f] === "number") {
          (body as any)[f] = (body as any)[f].toString();
        }
      }
      if (!body.sku) body.sku = "SKU-" + Date.now().toString(36);
      if (!body.type) body.type = 'service'; // default non-inventory
      if (body.stock_quantity === undefined) body.stock_quantity = '0';
      if (!body.unit_of_measure) body.unit_of_measure = 'pcs';

      // Extract warehouse_id before validation (not part of items schema)
      const defaultWarehouseId = body.default_warehouse_id;
      delete body.default_warehouse_id;

      const validatedData = insertItemSchema.parse({
        ...body,
        company_id: companyId,
      });

      // Defensive: prune invalid foreign keys to avoid FK errors on stale client data
      try {
        if ((validatedData as any).default_tax_id) {
          const tax = await storage.getTaxById((validatedData as any).default_tax_id!);
          if (!tax || tax.company_id !== companyId) {
            delete (validatedData as any).default_tax_id;
          }
        }
        if ((validatedData as any).sales_account_id) {
          const acc = await storage.getAccountById((validatedData as any).sales_account_id!);
          if (!acc || acc.company_id !== companyId) {
            delete (validatedData as any).sales_account_id;
          }
        }
        if ((validatedData as any).cost_account_id) {
          const acc = await storage.getAccountById((validatedData as any).cost_account_id!);
          if (!acc || acc.company_id !== companyId) {
            delete (validatedData as any).cost_account_id;
          }
        }
        if ((validatedData as any).inventory_account_id) {
          const acc = await storage.getAccountById((validatedData as any).inventory_account_id!);
          if (!acc || acc.company_id !== companyId) {
            delete (validatedData as any).inventory_account_id;
          }
        }
      } catch (e) {
        // If lookups fail, proceed without optional relations
      }

      const item = await storage.createItem(validatedData);
      
      // Record opening stock if product with initial quantity and warehouse
      const stockQty = parseFloat(body.stock_quantity || '0');
      const costPrice = parseFloat(body.cost_price || '0');
      const isProduct = item.type === 'product' || item.type === 'inventory';
      if (isProduct && stockQty > 0 && defaultWarehouseId) {
        await recordStockMovement({
          company_id: companyId,
          item_id: item.id,
          warehouse_id: defaultWarehouseId,
          transaction_type: 'adjustment',
          transaction_date: new Date(),
          quantity: stockQty,
          unit_cost: costPrice,
          reference_type: 'opening_balance',
          notes: 'Opening stock balance',
          created_by: (req as any).session.userId
        });
      }
      
      // Audit log
      const userId = (req as any).session.userId;
      await logCreate({
        companyId,
        entityType: 'item',
        entityId: item.id,
        createdData: { sku: item.sku, name: item.name, type: item.type },
        actorId: userId,
        actorName: (req as any).session?.userName || 'User',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      res.status(201).json(item);
    } catch (error: any) {
      if (error.name === "ZodError") {

        const validationError = fromZodError(error);
        return badRequest(res, validationError.message);
      } else {
        console.error("Error creating item:", error?.message || error);
               return serverError(res, "Failed to create item");
      }
    }
  });

  app.put("/api/items/:id", requireAuth, requireRole(['owner','admin','accountant']), async (req, res) => {
    try {
      const companyId = (req as any).session.companyId;
      const userId = (req as any).session.userId;
      
      const update = sanitizeUpdate(req.body, ['company_id','created_by','id'], ["sales_price","cost_price","stock_quantity","reorder_level"]);
      const validated = insertItemSchema.partial().parse(update);
      const item = await storage.updateItem(req.params.id, validated);
      if (!item) return notFound(res, "Item not found");
      
      // Audit log
      await logUpdate({
        companyId,
        entityType: 'item',
        entityId: item.id,
        oldData: {},
        newData: validated,
        actorId: userId,
        actorName: (req as any).session?.userName || 'User',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      res.json(item);
    } catch (error: any) {
      console.error("Error updating item:", error);
      return serverError(res, "Failed to update item");
    }
  });

  app.delete("/api/items/:id", requireAuth, async (req, res) => {
    try {
      const companyId = (req as any).session.companyId;
      const userId = (req as any).session.userId;
      
      const success = await storage.deleteItem(req.params.id);
      if (!success) return notFound(res, "Item not found");
      
      // Audit log
      await logDelete({
        companyId,
        entityType: 'item',
        entityId: req.params.id,
        deletedData: { id: req.params.id },
        actorId: userId,
        actorName: (req as any).session?.userName || 'User',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      
  res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting item:", error);
      return serverError(res, "Failed to delete item");
    }
  });

  // === SALES INVOICES ===
  // Moved to server/routes/sales.ts

  // === SALES QUOTATIONS ===
  // Moved to server/routes/sales.ts

  // === SALES CREDIT NOTES ===
  // Moved to server/routes/sales.ts

  // === SALES RECURRING INVOICES ===
  // Moved to server/routes/sales.ts

  // === SALES ORDERS ===
  
  app.use("/api/landed-cost", requireAuth, landedCostRouter);
  app.use("/api/portal", portalRouter); // No requireAuth here, it has its own middleware
  app.use("/api/approvals", approvalsRouter);
  app.use("/api/ai-cfo", aiCfoRouter);
  app.use("/api/esg", esgRouter);
  app.use("/api/archiving", archivingRouter);
  app.use("/api/api-keys", requireAuth, apiKeysRouter);
  app.use("/api/public", publicApiRouter);
  app.use("/api/2fa", twoFactorRouter);

  const httpServer = createServer(app);
  return httpServer;
}
