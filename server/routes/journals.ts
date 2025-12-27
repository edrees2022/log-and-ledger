import { Router } from "express";
import { storage } from "../storage";
import { fromZodError } from "zod-validation-error";
import { requireAuth, requirePermission, requireRole } from "../middleware/permissions";
import { badRequest, notFound, serverError } from '../utils/sendError';
import { normalize, sanitizeUpdate } from "../utils/sanitize";
import { createJournalEntry, reverseJournalEntry } from "../utils/journalEntry";
import { draftJournalFromText } from "../utils/journalAI";
import { db } from "../db";
import { journals, journal_lines } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { logCreate, logDelete, logAudit } from "../utils/auditLog";

const router = Router();

// === JOURNAL ENTRIES ===

/**
 * Get all journal entries for a company
 * @route GET /api/journals
 * @query include_lines - Include journal lines with account info
 * @query start_date - Filter by start date
 * @query end_date - Filter by end date
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const includeLines = req.query.include_lines === 'true';
    const startDate = req.query.start_date ? new Date(req.query.start_date as string) : null;
    const endDate = req.query.end_date ? new Date(req.query.end_date as string) : null;
    
    let entries = await db
      .select()
      .from(journals)
      .where(eq(journals.company_id, companyId))
      .orderBy(desc(journals.date));
    
    // Filter by date range
    if (startDate || endDate) {
      entries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        if (startDate && entryDate < startDate) return false;
        if (endDate && entryDate > endDate) return false;
        return true;
      });
    }
    
    // Include lines with account info if requested
    if (includeLines) {
      const entriesWithLines = await Promise.all(
        entries.map(async (entry) => {
          const lines = await storage.getJournalLinesWithAccounts(entry.id);
          return { ...entry, lines };
        })
      );
      return res.json(entriesWithLines);
    }
    
    res.json(entries);
  } catch (error: any) {
    console.error("Error fetching journal entries:", error);
    return serverError(res, "Failed to fetch journal entries");
  }
});

/**
 * Get a specific journal entry with its lines
 * @route GET /api/journals/:id
 */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    
    const journal = await db
      .select()
      .from(journals)
      .where(
        and(
          eq(journals.id, id),
          eq(journals.company_id, companyId)
        )
      )
      .limit(1);
    
    if (!journal.length) {
      return notFound(res, "Journal entry not found");
    }
    
    const lines = await db
      .select()
      .from(journal_lines)
      .where(eq(journal_lines.journal_id, id));
    
    res.json({
      ...journal[0],
      lines
    });
  } catch (error: any) {
    console.error("Error fetching journal entry:", error);
    return serverError(res, "Failed to fetch journal entry");
  }
});

/**
 * Draft a journal entry from natural language
 * @route POST /api/journals/draft-from-nl
 */
router.post("/draft-from-nl", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { text, date } = req.body;

    if (!text) {
      return badRequest(res, "Text description is required");
    }

    const draft = await draftJournalFromText(companyId, text, date ? new Date(date) : new Date());
    res.json(draft);
  } catch (error: any) {
    console.error("Error drafting journal from NL:", error);
    return serverError(res, error.message || "Failed to draft journal");
  }
});

/**
 * Get journal entries by reference (invoice, bill, receipt, payment)
 * @route GET /api/journals/by-reference/:refType/:refId
 */
router.get("/by-reference/:refType/:refId", requireAuth, async (req, res) => {
  try {
    const { refType, refId } = req.params;
    const companyId = (req as any).session.companyId;
    
    const entries = await db
      .select()
      .from(journals)
      .where(
        and(
          eq(journals.company_id, companyId),
          eq(journals.source_type, refType),
          eq(journals.source_id, refId)
        )
      );
    
    // Get lines for each entry
    const entriesWithLines = await Promise.all(
      entries.map(async (entry) => {
        const lines = await db
          .select()
          .from(journal_lines)
          .where(eq(journal_lines.journal_id, entry.id));
        
        return {
          ...entry,
          lines
        };
      })
    );
    
    res.json(entriesWithLines);
  } catch (error: any) {
    console.error("Error fetching journal entries by reference:", error);
    return serverError(res, "Failed to fetch journal entries");
  }
});

/**
 * Create a manual journal entry
 * @route POST /api/journals
 */
router.post("/", requireAuth, requirePermission('accounting', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const body = normalize(req.body);
    
    // Validate required fields
    if (!body.entry_date) {
      return badRequest(res, "Entry date is required");
    }
    
    if (!body.lines || !Array.isArray(body.lines) || body.lines.length < 2) {
      return badRequest(res, "At least 2 journal lines are required");
    }
    
    // Calculate total debits and credits
    let totalDebits = 0;
    let totalCredits = 0;
    
    body.lines.forEach((line: any) => {
      const debit = parseFloat(line.debit || '0');
      const credit = parseFloat(line.credit || '0');
      totalDebits += debit;
      totalCredits += credit;
    });
    
    // Ensure debits equal credits
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return badRequest(
        res, 
        `Debits (${totalDebits}) must equal credits (${totalCredits})`
      );
    }
    
    // Create journal entry
    const result = await createJournalEntry({
      company_id: companyId,
      date: new Date(body.entry_date),
      source_type: body.source_type || 'manual',
      source_id: body.source_id || null,
      description: body.description || 'Manual Journal Entry',
      lines: body.lines.map((line: any) => ({
        account_id: line.account_id,
        debit: parseFloat(line.debit || '0'),
        credit: parseFloat(line.credit || '0'),
        description: line.description || '',
        project_id: line.project_id || null,
      })),
      created_by: userId,
    });
    
    if (!result) {
      return serverError(res, "Failed to create journal entry");
    }
    
    // Fetch the created entry with lines
    const entry = await db
      .select()
      .from(journals)
      .where(eq(journals.id, result.id))
      .limit(1);
    
    const lines = await db
      .select()
      .from(journal_lines)
      .where(eq(journal_lines.journal_id, result.id));

    await logCreate({
      companyId,
      entityType: 'journal',
      entityId: result.id,
      createdData: { journal_number: result.journal_number, description: body.description, total: totalDebits },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json({
      ...entry[0],
      lines
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      const validationError = fromZodError(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error creating journal entry:", error);
      return serverError(res, "Failed to create journal entry");
    }
  }
});

/**
 * Reverse a journal entry (create offsetting entry)
 * @route POST /api/journals/:id/reverse
 */
router.post("/:id/reverse", requireAuth, requireRole(['owner', 'admin', 'accountant']), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const { reason } = req.body;
    
    // Verify journal exists
    const journal = await db
      .select()
      .from(journals)
      .where(
        and(
          eq(journals.id, id),
          eq(journals.company_id, companyId)
        )
      )
      .limit(1);
    
    if (!journal.length) {
      return notFound(res, "Journal entry not found");
    }
    
    // Create reversing entry
    const result = await reverseJournalEntry(
      id,
      new Date(),
      reason || 'Reversal of journal entry',
      userId
    );
    
    if (!result) {
      return serverError(res, "Failed to reverse journal entry");
    }

    await logAudit({
      companyId,
      entityType: 'journal',
      entityId: id,
      action: 'update',
      changes: { action: 'reverse', reversing_entry_id: result.id, reason },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({
      success: true,
      reversing_entry_id: result.id,
      journal_number: result.journal_number
    });
  } catch (error: any) {
    console.error("Error reversing journal entry:", error);
    return serverError(res, "Failed to reverse journal entry");
  }
});

/**
 * Delete a journal entry (only manual entries)
 * @route DELETE /api/journals/:id
 */
router.delete("/:id", requireAuth, requireRole(['owner', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    
    // Verify journal exists and is manual
    const journal = await db
      .select()
      .from(journals)
      .where(
        and(
          eq(journals.id, id),
          eq(journals.company_id, companyId)
        )
      )
      .limit(1);
    
    if (!journal.length) {
      return notFound(res, "Journal entry not found");
    }
    
    // Only allow deletion of manual entries
    if (journal[0].source_type !== 'manual') {
      return badRequest(
        res, 
        "Cannot delete system-generated journal entries. Use reverse instead."
      );
    }
    
    // Delete lines first
    await db.delete(journal_lines).where(eq(journal_lines.journal_id, id));
    
    // Delete journal
    await db.delete(journals).where(eq(journals.id, id));

    await logDelete({
      companyId,
      entityType: 'journal',
      entityId: id,
      deletedData: { journal_number: journal[0].journal_number, description: journal[0].description },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting journal entry:", error);
    return serverError(res, "Failed to delete journal entry");
  }
});

export default router;
