import { db } from "../db";
import { document_sequences, companies } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export type DocumentType = 
  | "invoice" 
  | "bill" 
  | "quote" 
  | "order" 
  | "payment" 
  | "receipt" 
  | "expense"
  | "credit_note"
  | "debit_note"
  | "journal";

interface DocumentConfig {
  prefix: string;
  padLength: number;
}

const documentConfigs: Record<DocumentType, DocumentConfig> = {
  invoice: { prefix: "INV", padLength: 5 },
  bill: { prefix: "BILL", padLength: 5 },
  quote: { prefix: "QT", padLength: 5 },
  order: { prefix: "SO", padLength: 5 },
  payment: { prefix: "PAY", padLength: 5 },
  receipt: { prefix: "RCPT", padLength: 5 },
  expense: { prefix: "EXP", padLength: 5 },
  credit_note: { prefix: "CN", padLength: 5 },
  debit_note: { prefix: "DN", padLength: 5 },
  journal: { prefix: "JE", padLength: 5 },
};

/**
 * Get next document number for a company and document type
 * Format: PREFIX-FISCALYEAR-NUMBER (e.g., INV-2025-00001)
 */
export async function getNextDocumentNumber(
  companyId: string,
  documentType: DocumentType,
  customPrefix?: string
): Promise<string> {
  // Get company fiscal year
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  if (!company) {
    throw new Error("Company not found");
  }

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();
  
  // Calculate fiscal year based on fiscal_year_start (1=Jan, 4=Apr, etc.)
  const fiscalYearStart = company.fiscal_year_start || 1;
  let fiscalYear = currentYear;
  if (currentMonth < fiscalYearStart) {
    fiscalYear = currentYear - 1;
  }

  const config = documentConfigs[documentType];
  const prefix = customPrefix || config.prefix;

  // Try to find existing sequence
  const [existingSeq] = await db
    .select()
    .from(document_sequences)
    .where(
      and(
        eq(document_sequences.company_id, companyId),
        eq(document_sequences.document_type, documentType),
        eq(document_sequences.fiscal_year, fiscalYear)
      )
    )
    .limit(1);

  let nextNumber: number;

  if (existingSeq) {
    // Increment existing sequence
    nextNumber = existingSeq.next_number;
    await db
      .update(document_sequences)
      .set({ 
        next_number: nextNumber + 1,
        updated_at: new Date()
      })
      .where(eq(document_sequences.id, existingSeq.id));
  } else {
    // Create new sequence
    nextNumber = 1;
    await db.insert(document_sequences).values({
      company_id: companyId,
      document_type: documentType,
      prefix: prefix,
      next_number: 2, // Next call will get 2
      fiscal_year: fiscalYear,
    });
  }

  // Format number with padding
  const paddedNumber = String(nextNumber).padStart(config.padLength, "0");
  
  return `${prefix}-${fiscalYear}-${paddedNumber}`;
}

/**
 * Reset sequence for a specific document type and fiscal year
 * (Admin only - typically done at year-end)
 */
export async function resetDocumentSequence(
  companyId: string,
  documentType: DocumentType,
  fiscalYear: number
): Promise<void> {
  await db
    .delete(document_sequences)
    .where(
      and(
        eq(document_sequences.company_id, companyId),
        eq(document_sequences.document_type, documentType),
        eq(document_sequences.fiscal_year, fiscalYear)
      )
    );
}

/**
 * Get all sequences for a company
 */
export async function getDocumentSequences(companyId: string) {
  return await db
    .select()
    .from(document_sequences)
    .where(eq(document_sequences.company_id, companyId));
}
