import { withTransaction, validateDoubleEntry } from '../utils/transaction';
import { db } from '../db';
import { journals, journal_lines } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import type { Journal } from '@shared/schema';
import { logger } from '../logger';

/**
 * Create journal entry with lines in a single transaction
 * Validates double-entry accounting (debits = credits)
 */
export async function createJournalWithLines(
  journalData: typeof journals.$inferInsert,
  lines: Array<{
    account_id: string;
    description?: string;
    debit: string;
    credit: string;
    currency?: string;
    fx_rate?: string;
  }>
): Promise<Journal> {
  // Validate double-entry before starting transaction
  const validation = validateDoubleEntry(lines);
  if (!validation.isValid) {
    logger.error({ validation, journalData }, 'Double-entry validation failed');
    throw new Error(validation.error);
  }

  return withTransaction(async (tx) => {
    // 1. Create journal header
    const [journal] = await tx
      .insert(journals)
      .values(journalData)
      .returning();

    logger.info(
      {
        journalId: journal.id,
        companyId: journal.company_id,
        sourceType: journal.source_type,
      },
      'Created journal entry'
    );

    // 2. Create journal lines
    const lineValues = lines.map((line) => ({
      journal_id: journal.id,
      ...line,
    }));

    await tx.insert(journal_lines).values(lineValues);
    logger.info({ journalId: journal.id, lineCount: lines.length }, 'Created journal lines');

    return journal;
  });
}

/**
 * Delete journal entry and all lines atomically
 */
export async function deleteJournalWithLines(
  journalId: string,
  companyId: string
): Promise<boolean> {
  return withTransaction(async (tx) => {
    // Cascade delete will handle journal_lines automatically
    await tx
      .delete(journals)
      .where(
        and(
          eq(journals.id, journalId),
          eq(journals.company_id, companyId)
        )
      );

    logger.info({ journalId, companyId }, 'Deleted journal entry with lines');
    return true;
  });
}

/**
 * Reverse a journal entry by creating opposite entries
 * Used for corrections and cancellations
 */
export async function reverseJournalEntry(
  originalJournalId: string,
  companyId: string,
  reversingDate: Date,
  reason: string
): Promise<Journal> {
  return withTransaction(async (tx) => {
    // 1. Get original journal and lines
    const [originalJournal] = await tx
      .select()
      .from(journals)
      .where(
        and(
          eq(journals.id, originalJournalId),
          eq(journals.company_id, companyId)
        )
      );

    if (!originalJournal) {
      throw new Error(`Journal ${originalJournalId} not found`);
    }

    const originalLines = await tx
      .select()
      .from(journal_lines)
      .where(eq(journal_lines.journal_id, originalJournalId));

    // 2. Create reversing journal
    const [reversingJournal] = await tx
      .insert(journals)
      .values({
        company_id: companyId,
        journal_number: `REV-${originalJournal.journal_number}`,
        date: reversingDate,
        description: `Reversal: ${reason}`,
        reference: `Reverses ${originalJournal.journal_number}`,
        source_type: 'reversal',
        source_id: originalJournalId,
        total_amount: originalJournal.total_amount,
        created_by: originalJournal.created_by,
      })
      .returning();

    // 3. Create reversing lines (swap debits and credits)
    const reversingLines = originalLines.map((line) => ({
      journal_id: reversingJournal.id,
      account_id: line.account_id,
      description: `Reversal of: ${line.description || ''}`,
      debit: line.credit, // Swap!
      credit: line.debit, // Swap!
      currency: line.currency,
      fx_rate: line.fx_rate,
    }));

    await tx.insert(journal_lines).values(reversingLines);

    logger.info(
      {
        originalJournalId,
        reversingJournalId: reversingJournal.id,
        reason,
      },
      'Created reversing journal entry'
    );

    return reversingJournal;
  });
}
