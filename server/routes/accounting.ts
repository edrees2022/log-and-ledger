import { Router } from "express";
import { storage } from "../storage";
import { insertAccountSchema, accounts, journals, journal_lines } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { requireAuth } from "../middleware/permissions";
import { badRequest, notFound, serverError } from '../utils/sendError';
import { getFinancialInsights } from "../utils/accountingInsights";
import { getCache, setCache } from "../redis";
import { logCreate, logUpdate, logDelete } from "../utils/auditLog";
import { createDefaultAccounts, DEFAULT_ACCOUNTS } from "../utils/defaultAccounts";
import { db } from "../db";
import { eq, sql, and } from "drizzle-orm";

const router = Router();

// === Chart of Accounts ===

// Get accounts with balances
router.get("/accounts", requireAuth, async (req, res) => {
  try {
    // Use company from session instead of user's default company
    const companyId = (req as any).session.companyId;
    const includeBalances = req.query.include_balances === 'true';
    
    const accountsList = await storage.getAccountsByCompany(companyId);
    
    if (includeBalances && accountsList.length > 0) {
      // Calculate balances from journal lines
      const balances = await db.select({
        accountId: journal_lines.account_id,
        debit: sql<string>`COALESCE(SUM(${journal_lines.debit}), 0)`,
        credit: sql<string>`COALESCE(SUM(${journal_lines.credit}), 0)`,
      })
      .from(journal_lines)
      .innerJoin(journals, eq(journal_lines.journal_id, journals.id))
      .where(eq(journals.company_id, companyId))
      .groupBy(journal_lines.account_id);
      
      const balanceMap = new Map<string, { debit: number; credit: number }>();
      balances.forEach(b => {
        balanceMap.set(b.accountId, {
          debit: parseFloat(b.debit || '0'),
          credit: parseFloat(b.credit || '0'),
        });
      });
      
      // Add balance to each account
      const accountsWithBalances = accountsList.map(acc => {
        const bal = balanceMap.get(acc.id) || { debit: 0, credit: 0 };
        // Calculate balance based on account type (normal balance)
        const normalDebitTypes = ['asset', 'expense'];
        const balance = normalDebitTypes.includes(acc.account_type)
          ? bal.debit - bal.credit
          : bal.credit - bal.debit;
        
        return {
          ...acc,
          debit: bal.debit,
          credit: bal.credit,
          balance,
        };
      });
      
      return res.json(accountsWithBalances);
    }
    
    res.json(accountsList);
  } catch (error: any) {
    console.error("Error fetching accounts:", error);
    return serverError(res, "Failed to fetch accounts");
  }
});

// Initialize default accounts for a company
router.post("/accounts/initialize-defaults", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    
    // Get existing accounts to avoid duplicates
    const existingAccounts = await storage.getAccountsByCompany(companyId);
    const existingCodesMap = existingAccounts.map((a: any) => ({ code: a.code, id: a.id }));
    
    // Create default accounts (will skip existing codes)
    const result = await createDefaultAccounts(companyId, storage, existingCodesMap);
    
    // Get all accounts after initialization
    const allAccounts = await storage.getAccountsByCompany(companyId);
    
    res.status(201).json({
      message: `تم إنشاء ${result.created} حساب جديد${result.skipped > 0 ? ` (تم تخطي ${result.skipped} حساب موجود)` : ''}`,
      created: result.created,
      skipped: result.skipped,
      accounts: allAccounts,
    });
  } catch (error: any) {
    console.error("Error initializing default accounts:", error);
    return serverError(res, "Failed to initialize default accounts");
  }
});

// Update Arabic names for existing accounts
router.post("/accounts/update-arabic-names", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    
    // Get existing accounts
    const existingAccounts = await storage.getAccountsByCompany(companyId);
    
    // Create a map of code -> Arabic name from default accounts
    const codeToArabicName = new Map<string, string>();
    for (const acc of DEFAULT_ACCOUNTS) {
      codeToArabicName.set(acc.code, acc.name_ar);
    }
    
    let updated = 0;
    
    // Update each account with Arabic name if it matches a default account code
    for (const account of existingAccounts) {
      const arabicName = codeToArabicName.get(account.code);
      if (arabicName && (!account.name_ar || account.name_ar !== arabicName)) {
        try {
          await storage.updateAccount(account.id, { name_ar: arabicName });
          updated++;
        } catch (error) {
          console.error(`Failed to update Arabic name for account ${account.code}:`, error);
        }
      }
    }
    
    // Clear cache and get updated accounts
    const updatedAccounts = await storage.getAccountsByCompany(companyId);
    
    res.json({
      message: `تم تحديث ${updated} حساب بالأسماء العربية`,
      updated,
      accounts: updatedAccounts,
    });
  } catch (error: any) {
    console.error("Error updating Arabic names:", error);
    return serverError(res, "Failed to update Arabic names");
  }
});

router.post("/accounts", requireAuth, async (req, res) => {
  try {
    // Use company from session
    const companyId = (req as any).session.companyId;
    
    const validatedData = insertAccountSchema.parse({
      ...req.body,
      company_id: companyId
    });
    const account = await storage.createAccount(validatedData);
    
    // Audit log
    const userId = (req as any).session.userId;
    await logCreate({
      companyId,
      entityType: 'account',
      entityId: account.id,
      createdData: { code: account.code, name: account.name, account_type: account.account_type },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json(account);
  } catch (error: any) {
    if (error.name === "ZodError") {
      const validationError = fromZodError(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error creating account:", error);
      return serverError(res, "Failed to create account");
    }
  }
});

router.put("/accounts/:id", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    
    // Get old data for audit
    const oldAccount = await storage.getAccountById(req.params.id);
    
    const account = await storage.updateAccount(req.params.id, req.body);
    if (!account) return notFound(res, "Account not found");
    
    // Audit log
    await logUpdate({
      companyId,
      entityType: 'account',
      entityId: account.id,
      oldData: oldAccount || {},
      newData: req.body,
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json(account);
  } catch (error: any) {
    console.error("Error updating account:", error);
    return serverError(res, "Failed to update account");
  }
});

router.delete("/accounts/:id", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    
    // Get data before deletion for audit
    const account = await storage.getAccountById(req.params.id);
    
    const success = await storage.deleteAccount(req.params.id);
    if (!success) return notFound(res, "Account not found");
    
    // Audit log
    await logDelete({
      companyId,
      entityType: 'account',
      entityId: req.params.id,
      deletedData: account ? { code: account.code, name: account.name } : {},
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ message: "Account deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return serverError(res, "Failed to delete account");
  }
});

// Account Ledger - Get all journal entries for a specific account
router.get("/accounts/:id/ledger", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const accountId = req.params.id;
    const startDate = req.query.start_date ? new Date(req.query.start_date as string) : null;
    const endDate = req.query.end_date ? new Date(req.query.end_date as string) : null;
    
    // Get the account
    const account = await storage.getAccountById(accountId);
    if (!account || account.company_id !== companyId) {
      return notFound(res, "Account not found");
    }
    
    // Get all journal entry lines for this account
    const entries = await storage.getAccountLedger(accountId, startDate, endDate);
    
    // Calculate opening balance (sum of all entries before startDate)
    let openingBalance = 0;
    if (startDate) {
      openingBalance = await storage.getAccountBalanceBeforeDate(accountId, startDate);
    }
    
    // Calculate running balance
    let runningBalance = openingBalance;
    const entriesWithBalance = entries.map(entry => {
      const debit = parseFloat(entry.debit_amount || '0');
      const credit = parseFloat(entry.credit_amount || '0');
      runningBalance = runningBalance + debit - credit;
      return {
        id: entry.id,
        date: entry.journal_date || entry.created_at,
        journal_number: entry.journal_number,
        description: entry.description || entry.journal_description,
        reference: entry.reference,
        debit: debit,
        credit: credit,
        balance: runningBalance,
        document_type: entry.document_type,
        document_id: entry.document_id,
      };
    });
    
    res.json({
      entries: entriesWithBalance,
      opening_balance: openingBalance,
    });
  } catch (error: any) {
    console.error("Error fetching account ledger:", error);
    return serverError(res, "Failed to fetch account ledger");
  }
});

// === REPORTS ===

router.get("/reports/balance-sheet", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const endDate = req.query.date ? new Date(req.query.date as string) : new Date();
    
    // Cache Key: companyId:balance-sheet:YYYY-MM-DD
    const cacheKey = `report:${companyId}:balance-sheet:${endDate.toISOString().split('T')[0]}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const data = await storage.getBalanceSheet(companyId, endDate);
    
    // Cache for 1 hour (3600 seconds)
    await setCache(cacheKey, data, 3600);
    
    res.json(data);
  } catch (error: any) {
    console.error("Error generating balance sheet:", error);
    return serverError(res, "Failed to generate balance sheet");
  }
});

router.get("/reports/profit-loss", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const startDate = req.query.start_date ? new Date(req.query.start_date as string) : undefined;
    const endDate = req.query.end_date ? new Date(req.query.end_date as string) : new Date();
    
    // Cache Key: companyId:profit-loss:START:END
    const startStr = startDate ? startDate.toISOString().split('T')[0] : 'all';
    const endStr = endDate.toISOString().split('T')[0];
    const cacheKey = `report:${companyId}:profit-loss:${startStr}:${endStr}`;
    
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const data = await storage.getProfitLoss(companyId, startDate, endDate);
    
    // Cache for 1 hour
    await setCache(cacheKey, data, 3600);

    res.json(data);
  } catch (error: any) {
    console.error("Error generating profit & loss:", error);
    return serverError(res, "Failed to generate profit & loss");
  }
});

router.get("/reports/cash-flow", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const startDate = req.query.start_date ? new Date(req.query.start_date as string) : undefined;
    const endDate = req.query.end_date ? new Date(req.query.end_date as string) : new Date();
    const data = await storage.getCashFlow(companyId, startDate, endDate);
    res.json(data);
  } catch (error: any) {
    console.error("Error generating cash flow:", error);
    return serverError(res, "Failed to generate cash flow");
  }
});

router.get("/reports/trial-balance", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const endDate = req.query.date ? new Date(req.query.date as string) : new Date();
    const data = await storage.getTrialBalance(companyId, endDate);
    res.json(data);
  } catch (error: any) {
    console.error("Error generating trial balance:", error);
    return serverError(res, "Failed to generate trial balance");
  }
});

router.get("/reports/tax", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    const filters = {
      customerId: req.query.customerId as string,
      vendorId: req.query.vendorId as string,
      currency: req.query.currency as string,
      warehouseId: req.query.warehouseId as string
    };
    const data = await storage.getTaxReport(companyId, startDate, endDate, filters);
    res.json(data);
  } catch (error: any) {
    console.error("Error generating tax report:", error);
    return serverError(res, "Failed to generate tax report");
  }
});

// === FINANCIAL INSIGHTS ===

router.get("/insights", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const enableAI = req.query.ai === 'true';
    const insights = await getFinancialInsights(companyId, enableAI);
    res.json(insights);
  } catch (error: any) {
    console.error("Error fetching insights:", error);
    serverError(res, `Failed to fetch financial insights: ${error.message}`);
  }
});

export default router;
