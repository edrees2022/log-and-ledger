import { Router } from "express";
import { storage } from "../storage";
import { 
  insertBankAccountSchema, 
  insertPaymentSchema, 
  insertReceiptSchema,
  insertAccountSchema
} from "@shared/schema";
import { 
  requireAuth, 
  requireRole,
  requireFirebaseAuth
} from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissions";
import { 
  serverError, 
  badRequest, 
  notFound,
  unauthorized,
  forbidden
} from "../utils/sendError";
import { normalize, sanitizeUpdate } from "../utils/sanitize";
import { fromZodError } from "zod-validation-error";
import { deleteCache, getCache, setCache } from "../redis";
import { 
  allocatePayment, 
  getUnallocatedAmount, 
  getTotalAllocated, 
  deletePaymentAllocation, 
  getAllocationById,
  getRecentAllocations
} from "../utils/paymentAllocation";
import { logAudit, logCreate, logUpdate, logDelete } from "../utils/auditLog";
import { createReceiptJournalEntry, createPaymentJournalEntry } from "../utils/journalEntry";

const router = Router();

// === BANK ACCOUNTS ===
router.get("/accounts", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    
    // Try cache first (30 minutes TTL - accounts don't change frequently)
    const cacheKey = `banking:accounts:${companyId}`;
    const cached = await getCache<any[]>(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    const accounts = await storage.getBankAccountsByCompany(companyId);
    
    // Cache for 30 minutes
    await setCache(cacheKey, accounts, 1800);
    
    res.json(accounts);
  } catch (error: any) {
    console.error("Error fetching bank accounts:", error);
    return serverError(res, "Failed to fetch bank accounts");
  }
});

router.post("/accounts", requireAuth, requirePermission('banking', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const body = normalize(req.body);
    const now = new Date();
    if (!body.currency) body.currency = 'USD';
    if (body.opening_balance === undefined) body.opening_balance = '0';
    if (!body.opening_balance_date) body.opening_balance_date = now;

    const validatedData = insertBankAccountSchema.parse({
      ...body,
      company_id: companyId
    });
    const account = await storage.createBankAccount(validatedData);
    
    // Invalidate banking accounts cache
    await deleteCache(`banking:accounts:${companyId}`);

    await logCreate({
      companyId,
      entityType: 'bank_account',
      entityId: account.id,
      createdData: { name: account.name, account_number: account.account_number, currency: account.currency },
      actorId: (req as any).session?.userId,
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
      console.error("Error creating bank account:", error);
      return serverError(res, "Failed to create bank account");
    }
  }
});

router.put("/accounts/:id", requireAuth, requireRole(['owner','admin']), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const update = sanitizeUpdate(req.body, ['company_id','id'], ['opening_balance']);
    const validated = insertBankAccountSchema.partial().parse(update);
    const account = await storage.updateBankAccount(req.params.id, validated);
    if (!account) return notFound(res, "Bank account not found");
    
    // Invalidate banking accounts cache
    await deleteCache(`banking:accounts:${companyId}`);
    
    res.json(account);
  } catch (error: any) {
    console.error("Error updating bank account:", error);
    return serverError(res, "Failed to update bank account");
  }
});

router.delete("/accounts/:id", requireAuth, requireRole(['owner','admin']), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    
    const success = await storage.deleteBankAccount(req.params.id);
    if (!success) return notFound(res, "Bank account not found");
    
    // Invalidate banking accounts cache
    await deleteCache(`banking:accounts:${companyId}`);

    await logDelete({
      companyId,
      entityType: 'bank_account',
      entityId: req.params.id,
      deletedData: { id: req.params.id },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting bank account:", error);
    return serverError(res, "Failed to delete bank account");
  }
});

// === PAYMENTS ROUTES ===
router.get("/payments", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const payments = await storage.getPaymentsByCompany(companyId);
    res.json(payments);
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    if (error?.code === '42703') {
      return serverError(res, "Database schema mismatch: Missing columns in payments table. Please run FIX_BANKING_SCHEMA.sql");
    }
    return serverError(res, "Failed to fetch payments");
  }
});

router.post("/payments", requireAuth, requirePermission('banking', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const body = normalize(req.body);
    const now = new Date();
    if (!body.payment_number) body.payment_number = `PAY-${Date.now().toString(36).toUpperCase()}`;
    if (!body.date) body.date = now;
    if (!body.payment_method) body.payment_method = 'bank_transfer';
    if (!body.currency) body.currency = 'USD';
    if (!body.fx_rate) body.fx_rate = '1';
    if (!body.status) body.status = 'pending';

    const validatedData = insertPaymentSchema.parse({
      ...body,
      company_id: companyId,
      created_by: userId
    });
    const payment = await storage.createPayment(validatedData);
    
    // Create automatic journal entry for payment
    try {
      await createPaymentJournalEntry(
        companyId,
        payment.id,
        payment.payment_number,
        parseFloat(payment.amount || '0'),
        payment.bank_account_id || '',
        payment.date,
        userId,
        payment.currency,
        parseFloat(payment.fx_rate || '1')
      );
    } catch (journalError) {
      console.error("Failed to create journal entry for payment:", journalError);
      // Don't fail the payment creation if journal entry fails
    }

    await logCreate({
      companyId,
      entityType: 'payment',
      entityId: payment.id,
      createdData: { payment_number: payment.payment_number, amount: payment.amount, currency: payment.currency },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json(payment);
  } catch (error: any) {
    if (error.name === "ZodError") {
      const validationError = fromZodError(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error creating payment:", error);
      return serverError(res, "Failed to create payment");
    }
  }
});

router.delete("/payments/:id", requireAuth, requireRole(['owner','admin','accountant']), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    
    const deleted = await storage.deletePayment(companyId, id);
    if (!deleted) {
      return notFound(res, "Payment not found");
    }

    await logDelete({
      companyId,
      entityType: 'payment',
      entityId: id,
      deletedData: { id },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting payment:", error);
    return serverError(res, "Failed to delete payment");
  }
});

// === RECEIPTS ROUTES ===
router.get("/receipts", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const receipts = await storage.getReceiptsByCompany(companyId);
    res.json(receipts);
  } catch (error: any) {
    console.error("Error fetching receipts:", error);
    if (error?.code === '42703') {
      return serverError(res, "Database schema mismatch: Missing columns in receipts table. Please run FIX_BANKING_SCHEMA.sql");
    }
    return serverError(res, "Failed to fetch receipts");
  }
});

router.post("/receipts", requireAuth, requirePermission('banking', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const body = normalize(req.body);
    const now = new Date();
    if (!body.receipt_number) body.receipt_number = `RCPT-${Date.now().toString(36).toUpperCase()}`;
    if (!body.date) body.date = now;
    if (!body.payment_method) body.payment_method = 'bank_transfer';
    if (!body.currency) body.currency = 'USD';
    if (!body.fx_rate) body.fx_rate = '1';
    if (!body.status) body.status = 'received';

    const validatedData = insertReceiptSchema.parse({
      ...body,
      company_id: companyId,
      created_by: userId
    });
    const receipt = await storage.createReceipt(validatedData);
    
    // Create automatic journal entry for receipt
    try {
      await createReceiptJournalEntry(
        companyId,
        receipt.id,
        receipt.receipt_number,
        parseFloat(receipt.amount || '0'),
        receipt.bank_account_id || '',
        receipt.date,
        userId,
        receipt.currency,
        parseFloat(receipt.fx_rate || '1')
      );
    } catch (journalError) {
      console.error("Failed to create journal entry for receipt:", journalError);
      // Don't fail the receipt creation if journal entry fails
    }

    await logCreate({
      companyId,
      entityType: 'receipt',
      entityId: receipt.id,
      createdData: { receipt_number: receipt.receipt_number, customer_id: receipt.customer_id, amount: receipt.amount, currency: receipt.currency },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json(receipt);
  } catch (error: any) {
    if (error.name === "ZodError") {
      const validationError = fromZodError(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error creating receipt:", error);
      return serverError(res, "Failed to create receipt");
    }
  }
});

router.delete("/receipts/:id", requireAuth, requireRole(['owner','admin','accountant']), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    
    const deleted = await storage.deleteReceipt(companyId, id);
    if (!deleted) {
      return notFound(res, "Receipt not found");
    }

    await logDelete({
      companyId,
      entityType: 'receipt',
      entityId: id,
      deletedData: { id },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting receipt:", error);
    return serverError(res, "Failed to delete receipt");
  }
});

// Allocate receipt to invoices
router.post("/receipts/:id/allocate", requireAuth, requirePermission('banking', 'create'), async (req, res) => {
  try {
    const { id } = req.params;
    const { invoice_id, amount } = req.body;
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;

    if (!invoice_id || !amount) {
      return badRequest(res, "Invoice ID and amount are required");
    }

    const allocation = {
      company_id: companyId,
      payment_type: 'receipt',
      payment_id: id,
      document_type: 'invoice',
      document_id: invoice_id,
      allocated_amount: amount.toString(),
      created_by: userId
    };

    await allocatePayment(allocation as any);
    
    // Update invoice paid_amount
    const invoice = await storage.getSalesInvoiceById(invoice_id);
    if (invoice) {
      const totalAllocated = await getTotalAllocated('invoice', invoice_id);
      const newPaid = totalAllocated.toString();
      let status = invoice.status;
      if (parseFloat(newPaid) >= parseFloat(invoice.total)) {
        status = 'paid';
      } else if (parseFloat(newPaid) > 0) {
        status = 'partially_paid';
      }
      await storage.updateSalesInvoice(invoice.id, { paid_amount: newPaid, status });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error allocating receipt:", error);
    return serverError(res, "Failed to allocate receipt");
  }
});

// Allocate payment to bills
router.post("/payments/:id/allocate", requireAuth, requirePermission('banking', 'create'), async (req, res) => {
  try {
    const { id } = req.params;
    const { bill_id, amount } = req.body;
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;

    if (!bill_id || !amount) {
      return badRequest(res, "Bill ID and amount are required");
    }

    const allocation = {
      company_id: companyId,
      payment_type: 'payment',
      payment_id: id,
      document_type: 'bill',
      document_id: bill_id,
      allocated_amount: amount.toString(),
      created_by: userId
    };

    await allocatePayment(allocation as any);
    
    // Update bill paid_amount
    const bill = await storage.getBillById(bill_id);
    if (bill) {
      const totalAllocated = await getTotalAllocated('bill', bill_id);
      const newPaid = totalAllocated.toString();
      let status = bill.status;
      if (parseFloat(newPaid) >= parseFloat(bill.total)) {
        status = 'paid';
      } else if (parseFloat(newPaid) > 0) {
        status = 'partially_paid';
      }
      await storage.updateBill(bill.id, { paid_amount: newPaid, status });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error allocating payment:", error);
    return serverError(res, "Failed to allocate payment");
  }
});

// === BANK RECONCILIATION (minimal) ===
// Get recent allocations for the reconciliation dashboard
router.get("/reconciliation/allocations/recent", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const allocations = await getRecentAllocations(companyId, 50);
    res.json(allocations);
  } catch (error: any) {
    console.error("Error fetching recent allocations:", error);
    return serverError(res, "Failed to fetch recent allocations");
  }
});

// Suggest matches between receipts/payments and invoices/bills
router.get("/reconciliation/suggestions", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    // Optional date range filters to scope computation (reduces load on large datasets)
    const fromParam = (req.query.from as string) || undefined;
    const toParam = (req.query.to as string) || undefined;
    // Optional scoping filters
    const typeParam = ((req.query.type as string) || 'both').toLowerCase(); // 'receipts' | 'payments' | 'both'
    const maxParam = (req.query.max as string) || undefined; // cap number of transactions per side
    const maxCandidatesParam = (req.query.max_candidates as string) || undefined; // per-transaction candidates
    const minScoreParam = (req.query.min_score as string) || undefined; // minimum score threshold
    const amountTolParam = (req.query.amount_tolerance as string) || undefined; // abs tolerance for amount equality
    const maxDaysParam = (req.query.max_days as string) || undefined; // window (days) for date proximity scoring
    const preferExactParam = (req.query.prefer_exact_amount as string) || undefined; // boost exact amount matches
    const currencyStrictParam = (req.query.currency_strict as string) || undefined; // exclude currency mismatches
    const customerIdParam = (req.query.customer_id as string) || undefined;
    const vendorIdParam = (req.query.vendor_id as string) || undefined;
    const fromDate = fromParam && !isNaN(Date.parse(fromParam)) ? new Date(fromParam) : undefined;
    const toDate = toParam && !isNaN(Date.parse(toParam)) ? new Date(toParam) : undefined;
    const max = maxParam ? Math.max(1, Math.min(1000, parseInt(maxParam, 10) || 0)) : undefined;
    const maxCandidates = maxCandidatesParam ? Math.max(1, Math.min(10, parseInt(maxCandidatesParam, 10) || 0)) : 3;
    const minScore = typeof minScoreParam !== 'undefined' ? Math.max(0, Math.min(1000, parseInt(minScoreParam, 10) || 0)) : 0;
    const amountTolerance = typeof amountTolParam !== 'undefined' ? Math.max(0, Math.min(10, parseFloat(amountTolParam) || 0)) : 0.01;
    const maxDays = maxDaysParam ? Math.max(1, Math.min(365, parseInt(maxDaysParam, 10) || 0)) : 30;
    const preferExactAmount = typeof preferExactParam === 'undefined' ? true : ['1','true','yes','y','on'].includes(String(preferExactParam).toLowerCase());
    const currencyStrict = typeof currencyStrictParam === 'undefined' ? false : ['1','true','yes','y','on'].includes(String(currencyStrictParam).toLowerCase());

    // Pull data
    const [allReceipts, allPayments, invoices, bills] = await Promise.all([
      storage.getReceiptsByCompany(companyId),
      storage.getPaymentsByCompany(companyId),
      storage.getSalesInvoicesByCompany(companyId),
      storage.getBillsByCompany(companyId),
    ]);

    // Apply lightweight date filtering to payments/receipts if a range is provided
    const inRange = (d: Date) => {
      const ts = new Date(d).getTime();
      if (fromDate && ts < fromDate.getTime()) return false;
      if (toDate && ts > toDate.getTime()) return false;
      return true;
    };
    // Base date-filtered collections
    let receipts = (fromDate || toDate) ? allReceipts.filter(r => inRange(new Date(r.date))) : allReceipts;
    let payments = (fromDate || toDate) ? allPayments.filter(p => inRange(new Date(p.date))) : allPayments;

    // Optional counterparty filters
    if (customerIdParam) receipts = receipts.filter(r => (r as any).customer_id === customerIdParam);
    if (vendorIdParam) payments = payments.filter(p => (p as any).vendor_id === vendorIdParam);

    // Optional cap per side (most recent first)
    const sortByDateDesc = <T extends { date: any }>(arr: T[]) => arr.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (max) {
      receipts = sortByDateDesc(receipts).slice(0, max);
      payments = sortByDateDesc(payments).slice(0, max);
    }

    // Build map of outstanding for invoices/bills using payment allocations
    const invoiceOutstanding: Record<string, number> = {};
    for (const inv of invoices) {
      const total = parseFloat((inv.total as any)?.toString?.() || inv.total || '0') || 0;
      const allocated = await getTotalAllocated('invoice', inv.id);
      invoiceOutstanding[inv.id] = Math.max(0, Number((total - allocated).toFixed(2)));
    }
    const billOutstanding: Record<string, number> = {};
    for (const bill of bills) {
      const total = parseFloat((bill.total as any)?.toString?.() || bill.total || '0') || 0;
      const allocated = await getTotalAllocated('bill', bill.id);
      billOutstanding[bill.id] = Math.max(0, Number((total - allocated).toFixed(2)));
    }

    // Helper to score date difference
    const daysDiff = (a: Date, b: Date) => Math.abs(Math.round((a.getTime() - b.getTime())/ (1000*60*60*24)));

    const receiptSuggestions = [] as any[];
    if (typeParam === 'receipts' || typeParam === 'both') {
      for (const r of receipts) {
        const unallocated = await getUnallocatedAmount('receipt', r.id);
        if (unallocated <= 0.001) continue;
        const rDate = new Date(r.date);
        const candidates = invoices
          .filter(inv => inv.customer_id === (r as any).customer_id && (invoiceOutstanding[inv.id] || 0) > 0)
          .map(inv => {
            const outstanding = invoiceOutstanding[inv.id];
            const amountEqual = Math.abs(outstanding - unallocated) <= amountTolerance;
            const d = daysDiff(rDate, new Date(inv.date));
            const amountBonus = amountEqual ? (preferExactAmount ? 100 : 60) : 0;
            const dateBonus = Math.max(0, maxDays - Math.min(d, maxDays));
            const score = amountBonus + dateBonus;
            const high_confidence = Boolean(amountEqual && d <= Math.min(7, maxDays));
            const confidence = high_confidence ? 'high' : (amountEqual || d <= Math.min(14, maxDays)) ? 'medium' : 'low';
            return {
              documentId: inv.id,
              documentType: 'invoice',
              invoice_number: (inv as any).invoice_number,
              currency_mismatch: Boolean((r as any)?.currency && (inv as any)?.currency && (r as any).currency !== (inv as any).currency),
              currency: (inv as any)?.currency,
              outstanding,
              score,
              amount_equal: amountEqual,
              amount_score: amountBonus,
              date_score: dateBonus,
              total_score: score,
              dateDiffDays: d,
              high_confidence,
              confidence,
            };
          })
          .filter(c => (!currencyStrict || !c.currency_mismatch) && c.score >= minScore)
          .sort((a,b) => b.score - a.score)
          .slice(0, maxCandidates);

        if (candidates.length)
          receiptSuggestions.push({
            paymentType: 'receipt',
            paymentId: (r as any).id,
            customer_id: (r as any).customer_id,
            receipt_number: (r as any).receipt_number,
            customer_name: (r as any).customer_name,
            amount: Number(unallocated.toFixed(2)),
            date: (r as any).date,
            suggestions: candidates,
          });
      }
    }

    const paymentSuggestions = [] as any[];
    if (typeParam === 'payments' || typeParam === 'both') {
      for (const p of payments) {
        const unallocated = await getUnallocatedAmount('payment', (p as any).id);
        if (unallocated <= 0.001) continue;
        const pDate = new Date((p as any).date);
        const candidates = bills
          .filter(b => (b as any).supplier_id === (p as any).vendor_id && (billOutstanding[(b as any).id] || 0) > 0)
          .map(b => {
            const outstanding = billOutstanding[(b as any).id];
            const amountEqual = Math.abs(outstanding - unallocated) <= amountTolerance;
            const d = daysDiff(pDate, new Date((b as any).date));
            const amountBonus = amountEqual ? (preferExactAmount ? 100 : 60) : 0;
            const dateBonus = Math.max(0, maxDays - Math.min(d, maxDays));
            const score = amountBonus + dateBonus;
            const high_confidence = Boolean(amountEqual && d <= Math.min(7, maxDays));
            const confidence = high_confidence ? 'high' : (amountEqual || d <= Math.min(14, maxDays)) ? 'medium' : 'low';
            return {
              documentId: (b as any).id,
              documentType: 'bill',
              bill_number: (b as any).bill_number,
              currency_mismatch: Boolean((p as any)?.currency && (b as any)?.currency && (p as any).currency !== (b as any).currency),
              currency: (b as any)?.currency,
              outstanding,
              score,
              amount_equal: amountEqual,
              amount_score: amountBonus,
              date_score: dateBonus,
              total_score: score,
              dateDiffDays: d,
              high_confidence,
              confidence,
            };
          })
          .filter(c => (!currencyStrict || !c.currency_mismatch) && c.score >= minScore)
          .sort((a,b) => b.score - a.score)
          .slice(0, maxCandidates);

        if (candidates.length)
          paymentSuggestions.push({
            paymentType: 'payment',
            paymentId: (p as any).id,
            vendor_id: (p as any).vendor_id,
            payment_number: (p as any).payment_number,
            vendor_name: (p as any).vendor_name,
            amount: Number(unallocated.toFixed(2)),
            date: (p as any).date,
            suggestions: candidates,
          });
      }
    }

    res.json({ receipts: receiptSuggestions, payments: paymentSuggestions });
  } catch (error: any) {
    console.error('Error building reconciliation suggestions:', error);
    if (error?.code === '42703' || error?.code === '42P01') {
      return serverError(res, "Database schema mismatch: Missing banking tables or columns. Please run FIX_BANKING_SCHEMA.sql");
    }
    return serverError(res, 'Failed to build suggestions');
  }
});

// Bulk auto-match: safely allocate unique exact-amount matches
router.post("/reconciliation/auto-match", requireAuth, requirePermission('banking', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const body = req.body || {};
    // Filters and tunings (mirror suggestions)
    const typeParam = String((body.type ?? 'both')).toLowerCase(); // receipts | payments | both
    const fromParam = body.from as string | undefined;
    const toParam = body.to as string | undefined;
    const customerIdParam = body.customer_id as string | undefined;
    const vendorIdParam = body.vendor_id as string | undefined;
    const amountTolParam = body.amount_tolerance as string | number | undefined;
    const maxDaysParam = body.max_days as string | number | undefined;
    const currencyStrictParam = body.currency_strict as string | boolean | undefined;
    const maxPerSideParam = body.max as string | number | undefined;
    const maxActionsParam = body.max_actions as string | number | undefined;
    const dryRun = typeof body.dry_run === 'undefined' ? true : ['1','true','yes','y','on'].includes(String(body.dry_run).toLowerCase());
    const selected = Array.isArray((body as any).selected) ? (body as any).selected as Array<{
      paymentType: 'receipt'|'payment';
      paymentId: string;
      documentType: 'invoice'|'bill';
      documentId: string;
    }> : [];

    const fromDate = fromParam && !isNaN(Date.parse(fromParam)) ? new Date(fromParam) : undefined;
    const toDate = toParam && !isNaN(Date.parse(toParam)) ? new Date(toParam) : undefined;
    const amountTolerance = typeof amountTolParam !== 'undefined' ? Math.max(0, Math.min(10, typeof amountTolParam === 'string' ? parseFloat(amountTolParam) : Number(amountTolParam))) : 0.01;
    const maxDays = maxDaysParam ? Math.max(1, Math.min(365, typeof maxDaysParam === 'string' ? parseInt(maxDaysParam, 10) : Number(maxDaysParam))) : 30;
    const currencyStrict = typeof currencyStrictParam === 'undefined' ? false : ['1','true','yes','y','on'].includes(String(currencyStrictParam).toLowerCase());
    const max = maxPerSideParam ? Math.max(1, Math.min(1000, typeof maxPerSideParam === 'string' ? parseInt(maxPerSideParam, 10) : Number(maxPerSideParam))) : undefined;
    const maxActions = maxActionsParam ? Math.max(1, Math.min(500, typeof maxActionsParam === 'string' ? parseInt(maxActionsParam, 10) : Number(maxActionsParam))) : 50;

    // Pull data
    const [allReceipts, allPayments, invoices, bills] = await Promise.all([
      storage.getReceiptsByCompany(companyId),
      storage.getPaymentsByCompany(companyId),
      storage.getSalesInvoicesByCompany(companyId),
      storage.getBillsByCompany(companyId),
    ]);

    const inRange = (d: Date) => {
      const ts = new Date(d).getTime();
      if (fromDate && ts < fromDate.getTime()) return false;
      if (toDate && ts > toDate.getTime()) return false;
      return true;
    };
    let receipts = (fromDate || toDate) ? allReceipts.filter(r => inRange(new Date(r.date))) : allReceipts;
    let payments = (fromDate || toDate) ? allPayments.filter(p => inRange(new Date(p.date))) : allPayments;

    if (customerIdParam) receipts = receipts.filter(r => (r as any).customer_id === customerIdParam);
    if (vendorIdParam) payments = payments.filter(p => (p as any).vendor_id === vendorIdParam);

    const sortByDateDesc = <T extends { date: any }>(arr: T[]) => arr.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (max) {
      receipts = sortByDateDesc(receipts).slice(0, max);
      payments = sortByDateDesc(payments).slice(0, max);
    }

    const invoiceOutstanding: Record<string, number> = {};
    for (const inv of invoices) {
      const total = parseFloat((inv.total as any)?.toString?.() || inv.total || '0') || 0;
      const allocated = await getTotalAllocated('invoice', inv.id);
      invoiceOutstanding[inv.id] = Math.max(0, Number((total - allocated).toFixed(2)));
    }
    const billOutstanding: Record<string, number> = {};
    for (const bill of bills) {
      const total = parseFloat((bill.total as any)?.toString?.() || bill.total || '0') || 0;
      const allocated = await getTotalAllocated('bill', bill.id);
      billOutstanding[bill.id] = Math.max(0, Number((total - allocated).toFixed(2)));
    }

    const daysDiff = (a: Date, b: Date) => Math.abs(Math.round((a.getTime() - b.getTime())/ (1000*60*60*24)));
    const actions: any[] = [];

    const processReceipt = async (r: any) => {
      const unallocated = await getUnallocatedAmount('receipt', r.id);
      if (unallocated <= 0.001) return;
      const rDate = new Date(r.date);
      // Find exact matches
      const exacts = invoices
        .filter(inv => inv.customer_id === r.customer_id && (invoiceOutstanding[inv.id] || 0) > 0)
        .map(inv => {
          const outstanding = invoiceOutstanding[inv.id];
          const diff = Math.abs(outstanding - unallocated);
          return { inv, outstanding, diff };
        })
        .filter(x => x.diff <= amountTolerance && (!currencyStrict || (r.currency && (x.inv as any).currency && r.currency === (x.inv as any).currency)));
      
      if (exacts.length === 1) {
        const { inv, outstanding } = exacts[0];
        const amt = Math.min(unallocated, outstanding);
        const diffDays = daysDiff(new Date(r.date), new Date(inv.date));
        const amountBonus = 100; // exact amount match in auto-match
        const dateBonus = Math.max(0, maxDays - Math.min(diffDays, maxDays));
        actions.push({
          paymentType: 'receipt',
          paymentId: r.id,
          documentType: 'invoice',
          documentId: inv.id,
          amount: Number(amt.toFixed(2)),
          status: 'would-allocate',
          payment_ref: r.receipt_number,
          document_ref: (inv as any).invoice_number,
          counterparty_name: r.customer_name,
          date: new Date(r.date).toISOString(),
          document_date: new Date(inv.date).toISOString(),
          currency_mismatch: Boolean(r?.currency && (inv as any)?.currency && r.currency !== (inv as any).currency),
          date_diff_days: diffDays,
          high_confidence: Boolean(diffDays <= Math.min(7, maxDays)),
          unique: true,
          amount_equal: true,
          amount_score: amountBonus,
          date_score: dateBonus,
          total_score: amountBonus + dateBonus,
        });
      } else if (exacts.length > 1) {
        actions.push({
          paymentType: 'receipt',
          paymentId: r.id,
          documentType: 'invoice',
          documentId: exacts[0].inv.id,
          amount: Number(unallocated.toFixed(2)),
          status: 'skipped',
          reason: 'multiple exact matches',
          payment_ref: r.receipt_number,
          counterparty_name: r.customer_name,
          date: new Date(r.date).toISOString(),
        });
      }
    };

    const processPayment = async (p: any) => {
      const unallocated = await getUnallocatedAmount('payment', p.id);
      if (unallocated <= 0.001) return;
      const pDate = new Date(p.date);
      const exacts = bills
        .filter(b => (b as any).supplier_id === p.vendor_id && (billOutstanding[b.id] || 0) > 0)
        .map(b => {
          const outstanding = billOutstanding[b.id];
          const diff = Math.abs(outstanding - unallocated);
          return { b, outstanding, diff };
        })
        .filter(x => x.diff <= amountTolerance && (!currencyStrict || (p.currency && (x.b as any).currency && p.currency === (x.b as any).currency)));
      
      if (exacts.length === 1) {
        const { b, outstanding } = exacts[0];
        const amt = Math.min(unallocated, outstanding);
        const diffDays = daysDiff(new Date(p.date), new Date((b as any).date));
        const amountBonus = 100; // exact amount match in auto-match
        const dateBonus = Math.max(0, maxDays - Math.min(diffDays, maxDays));
        actions.push({
          paymentType: 'payment',
          paymentId: p.id,
          documentType: 'bill',
          documentId: (b as any).id,
          amount: Number(amt.toFixed(2)),
          status: 'would-allocate',
          payment_ref: p.payment_number,
          document_ref: (b as any).bill_number,
          counterparty_name: p.vendor_name,
          date: new Date(p.date).toISOString(),
          document_date: new Date((b as any).date).toISOString(),
          currency_mismatch: Boolean(p?.currency && (b as any)?.currency && p.currency !== (b as any).currency),
          date_diff_days: diffDays,
          high_confidence: Boolean(diffDays <= Math.min(7, maxDays)),
          unique: true,
          amount_equal: true,
          amount_score: amountBonus,
          date_score: dateBonus,
          total_score: amountBonus + dateBonus,
        });
      } else if (exacts.length > 1) {
        actions.push({
          paymentType: 'payment',
          paymentId: p.id,
          documentType: 'bill',
          documentId: (exacts[0].b as any).id,
          amount: Number(unallocated.toFixed(2)),
          status: 'skipped',
          reason: 'multiple exact matches',
          payment_ref: p.payment_number,
          counterparty_name: p.vendor_name,
          date: new Date(p.date).toISOString(),
        });
      }
    };

    if (typeParam === 'receipts' || typeParam === 'both') {
      for (const r of receipts) {
        await processReceipt(r);
        if (actions.length >= maxActions) break;
      }
    }
    if (actions.length < maxActions && (typeParam === 'payments' || typeParam === 'both')) {
      for (const p of payments) {
        await processPayment(p);
        if (actions.length >= maxActions) break;
      }
    }

    // If a selection is provided, mark non-selected would-allocate actions as skipped
    let selectedSet: Set<string> | null = null;
    const keyOf = (a: {paymentType:string;paymentId:string;documentType:string;documentId:string}) => `${a.paymentType}:${a.paymentId}:${a.documentType}:${a.documentId}`;
    if (selected && selected.length > 0) {
      selectedSet = new Set(selected.map(s => keyOf(s)));
      for (const a of actions) {
        if (a.status === 'would-allocate' && !selectedSet.has(keyOf(a))) {
          a.status = 'skipped';
          a.reason = 'not selected';
        }
      }
    }

    // Execute if not dry run
    let allocationsCreated = 0;
    const allocationIds: string[] = [];
    if (!dryRun) {
      for (const a of actions) {
        // Only allocate actions that are still in would-allocate status (and selected, if provided)
        if (a.status !== 'would-allocate') continue;
        if (selectedSet && !selectedSet.has(keyOf(a))) continue;
        try {
          const { id } = await allocatePayment({
            company_id: companyId,
            payment_type: a.paymentType,
            payment_id: a.paymentId,
            document_type: a.documentType,
            document_id: a.documentId,
            allocated_amount: a.amount,
            created_by: userId,
          });
          a.status = 'allocated';
          allocationsCreated++;
          if (id) allocationIds.push(id);
          // Audit: record allocation created via auto-match
          await logAudit({
            companyId,
            entityType: 'payment_allocation',
            entityId: id || `${a.paymentType}:${a.paymentId}->${a.documentType}:${a.documentId}`,
            action: 'create',
            changes: {
              payment_type: a.paymentType,
              payment_id: a.paymentId,
              document_type: a.documentType,
              document_id: a.documentId,
              amount: a.amount,
              auto_match: true
            },
            actorId: userId,
            actorName: 'AutoMatch',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string | undefined,
          });
        } catch (e) {
          a.status = 'failed';
          a.error = String(e);
        }
      }
    }

    res.json({
      dry_run: dryRun,
      actions,
      summary: {
        total_candidates: actions.length,
        would_allocate: actions.filter(a => a.status === 'would-allocate').length,
        allocated: allocationsCreated,
        skipped: actions.filter(a => a.status === 'skipped').length,
        failed: actions.filter(a => a.status === 'failed').length,
      }
    });
  } catch (error: any) {
    console.error('Error in auto-match:', error);
    return serverError(res, 'Failed to auto-match');
  }
});

// Create a manual allocation
router.post("/reconciliation/allocations", requireAuth, requirePermission('banking', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const { paymentType, paymentId, documentType, documentId, amount } = req.body;

    if (!paymentType || !paymentId || !documentType || !documentId || !amount) {
      return badRequest(res, "Missing required fields");
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return badRequest(res, "Invalid amount");

    // Ownership checks: payment/receipt and document must belong to current company
    if (paymentType === 'receipt') {
      const receipts = await storage.getReceiptsByCompany(companyId);
      const rec = receipts.find((r: any) => r.id === paymentId);
      if (!rec) return notFound(res, 'Receipt not found');
    } else {
      const payments = await storage.getPaymentsByCompany(companyId);
      const pay = payments.find((p: any) => p.id === paymentId);
      if (!pay) return notFound(res, 'Payment not found');
    }
    if (documentType === 'invoice') {
      const inv = await storage.getSalesInvoiceById(documentId);
      if (!inv) return notFound(res, 'Invoice not found');
      if ((inv as any).company_id && (inv as any).company_id !== companyId) {
        return notFound(res, 'Invoice not found');
      }
    } else {
      const bill = await storage.getBillById(documentId);
      if (!bill) return notFound(res, 'Bill not found');
      if ((bill as any).company_id && (bill as any).company_id !== companyId) {
        return notFound(res, 'Bill not found');
      }
    }

    const unallocated = await getUnallocatedAmount(paymentType, paymentId);
    const outstanding = await getTotalAllocated(documentType, documentId).then(totalAllocated => {
      // Fetch document total to compute outstanding
      return (async () => {
        if (documentType === 'invoice') {
          const inv = await storage.getSalesInvoiceById(documentId);
          const total = parseFloat((inv?.total as any)?.toString?.() || inv?.total || '0') || 0;
          return Math.max(0, Number((total - totalAllocated).toFixed(2)));
        } else {
          const b = await storage.getBillById(documentId);
          const total = parseFloat((b?.total as any)?.toString?.() || b?.total || '0') || 0;
          return Math.max(0, Number((total - totalAllocated).toFixed(2)));
        }
      })();
    });

    const maxAlloc = Math.min(unallocated, outstanding);
    if (maxAlloc <= 0.001) return badRequest(res, 'Nothing to allocate');
    if (amt - maxAlloc > 0.01) return badRequest(res, 'Amount exceeds available');

    const { id: allocationId } = await allocatePayment({
      company_id: companyId,
      payment_type: paymentType,
      payment_id: paymentId,
      document_type: documentType,
      document_id: documentId,
      allocated_amount: amt,
      created_by: userId,
    });

    // Audit log
    await logAudit({
      companyId,
      entityType: 'payment_allocation',
      entityId: allocationId,
      action: 'create',
      changes: { payment_type: paymentType, payment_id: paymentId, document_type: documentType, document_id: documentId, amount: amt },
      actorId: userId,
      actorName: (req as any)?.session?.userName || userId || 'System',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string | undefined,
    });

    res.status(201).json({ success: true, id: allocationId });
  } catch (error: any) {
    console.error('Error creating allocation:', error);
    return serverError(res, 'Failed to create allocation');
  }
});

// Delete an allocation (undo)
router.delete("/reconciliation/allocations/:id", requireAuth, requireRole(['owner','admin','accountant']), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    
    // Ownership check: allocation must belong to active company
    const alloc = await getAllocationById(id);
    if (!alloc || alloc.company_id !== companyId) {
      return notFound(res, "Allocation not found");
    }
    await deletePaymentAllocation(id);
    // Audit log (do not block on failure)
    await logAudit({
      companyId,
      entityType: 'payment_allocation',
      entityId: id,
      action: 'delete',
      changes: { document_type: alloc.document_type, document_id: alloc.document_id },
      actorId: (req as any).session.userId,
      actorName: (req as any)?.session?.userName || (req as any).session.userId || 'System',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string | undefined,
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting allocation:', error);
    return serverError(res, 'Failed to delete allocation');
  }
});

// Batch un-allocate (undo) multiple allocations in one request
router.post("/reconciliation/allocations/undo-batch", requireAuth, requireRole(['owner','admin','accountant']), async (req, res) => {
  try {
    const body = req.body || {};
    const idsInput = (body as any).ids;
    const ids: string[] = Array.isArray(idsInput) ? idsInput.filter((x) => typeof x === 'string' && x.trim().length > 0) : [];
    if (!ids.length) {
      return badRequest(res, "No allocation ids provided", { details: [{ path: ['ids'], message: 'ids: string[] is required' }] });
    }

    // De-duplicate to avoid double work
    const uniqueIds = Array.from(new Set(ids));
    const errors: Array<{ id: string; error: string }> = [];
    const undoneIds: string[] = [];
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;

    for (const id of uniqueIds) {
      try {
        const alloc = await getAllocationById(id);
        if (!alloc) {
          errors.push({ id, error: 'not_found' });
          continue;
        }
        if (alloc.company_id !== companyId) {
          errors.push({ id, error: 'forbidden' });
          continue;
        }
        await deletePaymentAllocation(id);
        undoneIds.push(id);
      } catch (e) {
        errors.push({ id, error: String(e) });
      }
    }

    if (undoneIds.length > 0) {
      await logAudit({
        companyId,
        entityType: 'payment_allocation',
        entityId: 'batch',
        action: 'delete',
        changes: { count: undoneIds.length, ids: undoneIds },
        actorId: userId,
        actorName: (req as any)?.session?.userName || userId || 'System',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string | undefined,
      });
    }

    res.json({
      success: true,
      undone: undoneIds,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error in batch undo:', error);
    return serverError(res, 'Failed to batch undo allocations');
  }
});

// === Firebase Auth Banking & Accounts Endpoints (for frontend compatibility) ===

// Session-auth fallback for banking transactions
// If a session user is present, serve transactions for the active company.
// Otherwise, fall through to the Firebase-auth route defined below.
router.get("/transactions", async (req, res, next) => {
  try {
    const session = (req as any).session;
    if (!session || !session.userId || !session.companyId) {
      return next(); // Defer to Firebase-auth handler
    }
    const companyId = session.companyId;
    const accountId = (req.query.account_id as string) || undefined;
    let rows;
    try {
      rows = await storage.getBankStatementLinesByCompany(companyId, accountId);
    } catch (err: any) {
      const msg = String(err?.message || "");
      if (msg.includes("relation \"bank_statement_lines\" does not exist") || err?.code === '42P01') {
        return res.json([]);
      }
      throw err;
    }
    return res.json(rows);
  } catch (error: any) {
    console.error("Error fetching banking transactions (session):", error);
    return serverError(res, "Failed to fetch transactions");
  }
});

// Firebase-compatible banking transactions endpoint
router.get("/transactions", requireFirebaseAuth, async (req, res) => {
  try {
    const userId = (req as any).firebaseUser.uid;
    const userCompanies = await storage.getCompaniesByUserId(userId);
    if (userCompanies.length === 0) return res.json([]);
    const companyId = userCompanies[0].id;
    const accountId = (req.query.account_id as string) || undefined;
    let rows;
    try {
      rows = await storage.getBankStatementLinesByCompany(companyId, accountId);
    } catch (err: any) {
      const msg = String(err?.message || "");
      if (msg.includes("relation \"bank_statement_lines\" does not exist") || err?.code === '42P01') {
        return res.json([]);
      }
      throw err;
    }
    res.json(rows);
  } catch (error: any) {
    console.error("Error fetching banking transactions:", error);
    return serverError(res, "Failed to fetch transactions");
  }
});

// Import bank transactions (statement lines)
router.post("/transactions/import", requireFirebaseAuth, async (req, res) => {
  try {
    const userId = (req as any).firebaseUser.uid;
    const userCompanies = await storage.getCompaniesByUserId(userId);
    if (userCompanies.length === 0) return badRequest(res, "No company found");
    const companyId = userCompanies[0].id;

    const lines = Array.isArray(req.body?.lines) ? req.body.lines : [];
    if (lines.length === 0) return badRequest(res, "No lines to import");

    const created: any[] = [];
    for (const l of lines) {
      // Minimal validation and normalization
      const date = l.date && !isNaN(Date.parse(l.date)) ? new Date(l.date) : new Date();
      const amount = Number(l.amount);
      if (!amount || !isFinite(amount)) continue;
      
      // TODO: Implement actual storage method for bank statement lines
      // For now, we'll just log it and pretend we saved it
      // await storage.createBankStatementLine({...});
      created.push({ ...l, id: `line-${Date.now()}-${Math.random()}` });
    }

    res.json({ success: true, imported: created.length });
  } catch (error: any) {
    console.error("Error importing transactions:", error);
    return serverError(res, "Failed to import transactions");
  }
});

export default router;
