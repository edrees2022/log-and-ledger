import { db } from "../db";
import { document_sequences } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const DOCUMENT_PREFIXES: Record<string, string> = {
  invoice: "INV-",
  bill: "BILL-",
  quote: "QT-",
  order: "SO-",
  purchase_order: "PO-",
  payment: "PAY-",
  receipt: "RCV-",
  expense: "EXP-",
  journal: "JE-",
};

/**
 * Generate next document number with proper sequence
 * Format: PREFIX-YEAR-NUMBER (e.g., INV-2025-00001)
 */
export async function generateDocumentNumber(
  companyId: string,
  documentType: string,
  tx?: typeof db
): Promise<string> {
  const dbConnection = tx || db;
  const currentYear = new Date().getFullYear();
  const prefix = DOCUMENT_PREFIXES[documentType] || `${documentType.toUpperCase()}-`;

  // Find or create sequence for this document type and year
  const existingSequence = await dbConnection
    .select()
    .from(document_sequences)
    .where(
      and(
        eq(document_sequences.company_id, companyId),
        eq(document_sequences.document_type, documentType),
        eq(document_sequences.fiscal_year, currentYear)
      )
    )
    .limit(1);

  let nextNumber: number;

  if (existingSequence.length === 0) {
    // Create new sequence
    const [newSequence] = await dbConnection
      .insert(document_sequences)
      .values({
        company_id: companyId,
        document_type: documentType,
        prefix: prefix,
        next_number: 2, // Next one will be 2
        fiscal_year: currentYear,
      })
      .returning();
    
    nextNumber = 1;
  } else {
    // Update existing sequence
    const currentNumber = existingSequence[0].next_number;
    
    await dbConnection
      .update(document_sequences)
      .set({ 
        next_number: currentNumber + 1,
        updated_at: new Date()
      })
      .where(eq(document_sequences.id, existingSequence[0].id));
    
    nextNumber = currentNumber;
  }

  // Format: INV-2025-00001
  const paddedNumber = nextNumber.toString().padStart(5, '0');
  return `${prefix}${currentYear}-${paddedNumber}`;
}

/**
 * Reset all sequences for a new fiscal year
 */
export async function resetSequencesForNewYear(
  companyId: string,
  newFiscalYear: number
): Promise<void> {
  // This would typically be run at the start of a new fiscal year
  // All sequences reset to 1
  const allDocTypes = Object.keys(DOCUMENT_PREFIXES);
  
  for (const docType of allDocTypes) {
    await db.insert(document_sequences).values({
      company_id: companyId,
      document_type: docType,
      prefix: DOCUMENT_PREFIXES[docType],
      next_number: 1,
      fiscal_year: newFiscalYear,
    }).onConflictDoNothing();
  }
}
