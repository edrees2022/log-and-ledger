import { Router } from "express";
import { storage } from "../storage";
import { fromZodError } from "zod-validation-error";
import { requirePermission } from "../middleware/permissions";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import { badRequest, notFound, serverError } from '../utils/sendError';
import { normalize } from "../utils/sanitize";
import {
  getUnreconciledTransactions,
  createBankReconciliation,
  getReconciliationById,
  getReconciliationsByBankAccount,
  updateReconciliationStatus,
  deleteReconciliation,
  getBankAccountBalance
} from "../utils/bankReconciliation";
import { findMatches, suggestClassification } from "../utils/reconciliationAI";

const router = Router();

/**
 * Get unreconciled transactions for a bank account
 * @route GET /api/bank-reconciliation/unreconciled/:bankAccountId
 */
router.get("/unreconciled/:bankAccountId", requireAuth, async (req, res) => {
  try {
    const { bankAccountId } = req.params;
    const { startDate, endDate } = req.query;
    const companyId = (req as any).session.companyId;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const transactions = await getUnreconciledTransactions(
      companyId,
      bankAccountId,
      start,
      end
    );

    res.json(transactions);
  } catch (error: any) {
    console.error("Error fetching unreconciled transactions:", error);
    return serverError(res, "Failed to fetch unreconciled transactions");
  }
});

/**
 * Get bank account balance
 * @route GET /api/bank-reconciliation/balance/:bankAccountId
 */
router.get("/balance/:bankAccountId", requireAuth, async (req, res) => {
  try {
    const { bankAccountId } = req.params;
    const { asOfDate } = req.query;
    const companyId = (req as any).session.companyId;

    const asOf = asOfDate ? new Date(asOfDate as string) : undefined;

    const balance = await getBankAccountBalance(companyId, bankAccountId, asOf);

    res.json(balance);
  } catch (error: any) {
    console.error("Error fetching bank account balance:", error);
    return serverError(res, "Failed to fetch bank account balance");
  }
});

/**
 * Get reconciliations for a bank account
 * @route GET /api/bank-reconciliation/account/:bankAccountId
 */
router.get("/account/:bankAccountId", requireAuth, async (req, res) => {
  try {
    const { bankAccountId } = req.params;
    const companyId = (req as any).session.companyId;

    const reconciliations = await getReconciliationsByBankAccount(
      companyId,
      bankAccountId
    );

    res.json(reconciliations);
  } catch (error: any) {
    console.error("Error fetching reconciliations:", error);
    return serverError(res, "Failed to fetch reconciliations");
  }
});

/**
 * Get a specific reconciliation with items
 * @route GET /api/bank-reconciliation/:id
 */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const reconciliation = await getReconciliationById(id);

    if (!reconciliation) {
      return notFound(res, "Reconciliation not found");
    }

    res.json(reconciliation);
  } catch (error: any) {
    console.error("Error fetching reconciliation:", error);
    return serverError(res, "Failed to fetch reconciliation");
  }
});

/**
 * Find matches for a bank statement line
 * @route POST /api/bank-reconciliation/match
 */
router.post("/match", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { bankAccountId, line, options } = req.body;

    if (!bankAccountId || !line) {
      return badRequest(res, "bankAccountId and line are required");
    }

    const candidates = await findMatches(companyId, bankAccountId, line, options);
    res.json(candidates);
  } catch (error: any) {
    console.error("Error finding matches:", error);
    return serverError(res, "Failed to find matches");
  }
});

/**
 * Suggest classification for a bank statement line
 * @route POST /api/bank-reconciliation/classify
 */
router.post("/classify", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { line } = req.body;

    if (!line) {
      return badRequest(res, "line is required");
    }

    const suggestion = await suggestClassification(companyId, line);
    res.json(suggestion);
  } catch (error: any) {
    console.error("Error classifying transaction:", error);
    return serverError(res, "Failed to classify transaction");
  }
});

export default router;
