import { Router } from "express";
import { db } from "../db";
import { journals, journal_lines, journals_archive, journal_lines_archive, fiscal_periods } from "@shared/schema";
import { eq, and, lte, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import { serverError, badRequest } from "../utils/sendError";
import { logAudit } from "../utils/auditLog";

const router = Router();

// Archive a closed fiscal year
router.post("/archive-year", requireAuth, requireRole(['owner', 'admin']), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { fiscalYear } = req.body;

    if (!fiscalYear) return badRequest(res, "Fiscal year is required");

    // 1. Verify Fiscal Year is Closed
    const period = await db.query.fiscal_periods.findFirst({
      where: and(
        eq(fiscal_periods.company_id, companyId),
        eq(fiscal_periods.fiscal_year, fiscalYear),
        eq(fiscal_periods.period_type, 'year')
      )
    });

    if (!period) return badRequest(res, "Fiscal year not found");
    if (!period.is_closed) return badRequest(res, "Fiscal year must be closed before archiving");

    // 2. Select Data to Archive (Journals & Lines)
    // We archive journals dated within that year
    const startDate = new Date(fiscalYear, 0, 1);
    const endDate = new Date(fiscalYear, 11, 31, 23, 59, 59);

    const journalsToArchive = await db.query.journals.findMany({
      where: and(
        eq(journals.company_id, companyId),
        lte(journals.date, endDate),
        sql`${journals.date} >= ${startDate.toISOString()}`
      ),
      with: {
        lines: true
      }
    });

    if (journalsToArchive.length === 0) {
      return res.json({ message: "No journals found to archive for this year" });
    }

    // 3. Move to Archive Tables (Transaction)
    await db.transaction(async (tx) => {
      // Insert into Archive
      for (const journal of journalsToArchive) {
        await tx.insert(journals_archive).values({
          id: journal.id,
          company_id: journal.company_id,
          journal_number: journal.journal_number,
          date: journal.date,
          description: journal.description,
          reference: journal.reference,
          source_type: journal.source_type,
          source_id: journal.source_id,
          total_amount: journal.total_amount,
          created_by: journal.created_by,
          created_at: journal.created_at,
          updated_at: journal.updated_at,
          fiscal_year: fiscalYear
        });

        if (journal.lines && journal.lines.length > 0) {
          await tx.insert(journal_lines_archive).values(
            journal.lines.map(line => ({
              id: line.id,
              journal_id: line.journal_id,
              account_id: line.account_id,
              description: line.description,
              debit: line.debit,
              credit: line.credit,
              currency: line.currency,
              fx_rate: line.fx_rate,
              base_debit: line.base_debit,
              base_credit: line.base_credit,
              project_id: line.project_id,
              cost_center_id: line.cost_center_id
            }))
          );
        }
      }

      // Delete from Main Tables
      // Deleting journal cascades to lines usually, but let's be safe
      const journalIds = journalsToArchive.map(j => j.id);
      
      // Delete in chunks if too many? For now, simple delete
      // Note: Drizzle doesn't support 'WHERE IN' with large arrays well in all drivers, 
      // but let's assume it works or loop.
      for (const id of journalIds) {
        await tx.delete(journals).where(eq(journals.id, id));
      }
    });

    await logAudit({
      companyId,
      entityType: 'fiscal_year',
      entityId: fiscalYear.toString(),
      action: 'update',
      changes: { archivedCount: journalsToArchive.length, action: 'archive_year' },
      actorId: (req as any).session.userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ 
      success: true, 
      message: `Successfully archived ${journalsToArchive.length} journals for FY ${fiscalYear}`,
      archivedCount: journalsToArchive.length
    });

  } catch (error) {
    console.error("Error archiving fiscal year:", error);
    serverError(res, "Failed to archive fiscal year");
  }
});

export default router;
