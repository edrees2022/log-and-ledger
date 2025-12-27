import { db } from "../db";
import { fixed_assets, asset_depreciation_entries, journals, journal_lines, accounts } from "@shared/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { getNextDocumentNumber } from "./documentSequence";

export async function calculateDepreciation(
  assetId: string,
  targetDate: Date
): Promise<{ amount: number; months: number; startDate: Date; endDate: Date }> {
  
  const asset = await db.query.fixed_assets.findFirst({
    where: eq(fixed_assets.id, assetId)
  });

  if (!asset) throw new Error("Asset not found");
  if (!asset.is_active) return { amount: 0, months: 0, startDate: targetDate, endDate: targetDate };

  const cost = parseFloat(asset.cost?.toString() || '0');
  const salvage = parseFloat(asset.salvage_value?.toString() || '0');
  const lifeYears = asset.useful_life_years;
  const accumulated = parseFloat(asset.accumulated_depreciation?.toString() || '0');
  
  const depreciableAmount = cost - salvage;
  if (accumulated >= depreciableAmount) {
    return { amount: 0, months: 0, startDate: targetDate, endDate: targetDate };
  }

  // Find last depreciation date
  const lastEntry = await db.query.asset_depreciation_entries.findFirst({
    where: eq(asset_depreciation_entries.asset_id, assetId),
    orderBy: [desc(asset_depreciation_entries.date)]
  });

  let startDate: Date;
  if (lastEntry) {
    startDate = new Date(lastEntry.date);
  } else {
    startDate = new Date(asset.acquisition_date);
    // Adjust start date logic
    if (startDate.getDate() > 15) {
      startDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
    } else {
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    }
  }

  if (targetDate <= startDate) {
     return { amount: 0, months: 0, startDate, endDate: targetDate };
  }

  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();

  let months = (targetYear - startYear) * 12 + (targetMonth - startMonth);
  
  if (!lastEntry) {
     months += 1;
  }

  if (months <= 0) return { amount: 0, months: 0, startDate, endDate: targetDate };

  let amount = 0;

  if (asset.depreciation_method === 'straight_line') {
    const annualDepreciation = depreciableAmount / lifeYears;
    const monthlyDepreciation = annualDepreciation / 12;
    amount = monthlyDepreciation * months;
  } else if (asset.depreciation_method === 'declining_balance') {
    // Double Declining Balance
    const rate = 2 / lifeYears;
    const bookValue = cost - accumulated;
    const annualDepreciation = bookValue * rate;
    const monthlyDepreciation = annualDepreciation / 12;
    amount = monthlyDepreciation * months;
  }

  // Cap at remaining depreciable amount
  const remaining = depreciableAmount - accumulated;
  if (amount > remaining) {
    amount = remaining;
  }

  // Round to 2 decimals
  amount = Math.round(amount * 100) / 100;

  return { amount, months, startDate, endDate: targetDate };
}

export async function postDepreciation(
  companyId: string,
  assetId: string,
  date: Date,
  userId: string
) {
  const calculation = await calculateDepreciation(assetId, date);
  
  if (calculation.amount <= 0) {
    return null;
  }

  const asset = await db.query.fixed_assets.findFirst({
    where: eq(fixed_assets.id, assetId)
  });
  if (!asset) throw new Error("Asset not found");

  // Create Journal
  const journalNumber = await getNextDocumentNumber(companyId, 'journal');
  const [journal] = await db.insert(journals).values({
    company_id: companyId,
    journal_number: journalNumber,
    date: date,
    description: `Depreciation - ${asset.name} - ${calculation.months} months`,
    reference: `DEP-${asset.asset_code}`,
    source_type: 'depreciation',
    source_id: asset.id,
    total_amount: calculation.amount.toString(),
    created_by: userId
  }).returning();

  // Debit Expense
  if (asset.expense_account_id) {
    await db.insert(journal_lines).values({
      journal_id: journal.id,
      account_id: asset.expense_account_id,
      description: `Depreciation Expense - ${asset.name}`,
      debit: calculation.amount.toString(),
      credit: "0",
      base_debit: calculation.amount.toString(),
      base_credit: "0"
    });
  }

  // Credit Accumulated Depreciation
  if (asset.depreciation_account_id) {
    await db.insert(journal_lines).values({
      journal_id: journal.id,
      account_id: asset.depreciation_account_id,
      description: `Accumulated Depreciation - ${asset.name}`,
      debit: "0",
      credit: calculation.amount.toString(),
      base_debit: "0",
      base_credit: calculation.amount.toString()
    });
  }

  // Update Asset
  await db.update(fixed_assets)
    .set({ 
      accumulated_depreciation: sql`${fixed_assets.accumulated_depreciation} + ${calculation.amount}`,
      updated_at: new Date()
    })
    .where(eq(fixed_assets.id, assetId));

  // Record Entry
  await db.insert(asset_depreciation_entries).values({
    asset_id: assetId,
    date: date,
    amount: calculation.amount.toString(),
    journal_id: journal.id,
    fiscal_year: date.getFullYear()
  });

  return journal;
}

export async function disposeAsset(
  companyId: string,
  assetId: string,
  disposalDate: Date,
  proceeds: number,
  depositAccountId: string,
  gainLossAccountId: string,
  userId: string
) {
  // 1. Run depreciation up to disposal date
  try {
    await postDepreciation(companyId, assetId, disposalDate, userId);
  } catch (e) {
    // Ignore errors if depreciation fails (e.g. accounts not set, or already fully depreciated)
    // But we should probably log it. For now, proceed with disposal.
    console.warn("Auto-depreciation before disposal failed or skipped:", e);
  }

  const asset = await db.query.fixed_assets.findFirst({
    where: eq(fixed_assets.id, assetId)
  });

  if (!asset) throw new Error("Asset not found");
  if (!asset.is_active) throw new Error("Asset is already inactive");

  const cost = parseFloat(asset.cost?.toString() || '0');
  const accumulated = parseFloat(asset.accumulated_depreciation?.toString() || '0');
  const bookValue = cost - accumulated;
  const gainOrLoss = proceeds - bookValue;

  // 2. Create Journal Entry
  const journalNumber = await getNextDocumentNumber(companyId, 'journal');
  const [journal] = await db.insert(journals).values({
    company_id: companyId,
    journal_number: journalNumber,
    date: disposalDate,
    description: `Disposal - ${asset.name}`,
    reference: `DISP-${asset.asset_code}`,
    source_type: 'asset_disposal',
    source_id: asset.id,
    total_amount: cost.toString(), // The total value being moved
    created_by: userId
  }).returning();

  // 3. Journal Lines
  
  // Credit Asset (Remove Cost)
  if (asset.asset_account_id) {
    await db.insert(journal_lines).values({
      journal_id: journal.id,
      account_id: asset.asset_account_id,
      description: `Asset Cost Reversal - ${asset.name}`,
      debit: "0",
      credit: cost.toString(),
      base_debit: "0",
      base_credit: cost.toString()
    });
  }

  // Debit Accumulated Depreciation (Remove Accumulated)
  if (asset.depreciation_account_id) {
    await db.insert(journal_lines).values({
      journal_id: journal.id,
      account_id: asset.depreciation_account_id,
      description: `Accumulated Depreciation Reversal - ${asset.name}`,
      debit: accumulated.toString(),
      credit: "0",
      base_debit: accumulated.toString(),
      base_credit: "0"
    });
  }

  // Debit Bank/Receivable (Proceeds)
  if (proceeds > 0) {
    await db.insert(journal_lines).values({
      journal_id: journal.id,
      account_id: depositAccountId,
      description: `Disposal Proceeds - ${asset.name}`,
      debit: proceeds.toString(),
      credit: "0",
      base_debit: proceeds.toString(),
      base_credit: "0"
    });
  }

  // Record Gain or Loss
  // If Gain (Proceeds > Book Value): Credit Gain Account
  // If Loss (Proceeds < Book Value): Debit Loss Account
  // Note: gainOrLoss = Proceeds - Book Value
  
  if (gainOrLoss !== 0) {
    if (gainOrLoss > 0) {
      // Gain -> Credit
      await db.insert(journal_lines).values({
        journal_id: journal.id,
        account_id: gainLossAccountId,
        description: `Gain on Disposal - ${asset.name}`,
        debit: "0",
        credit: Math.abs(gainOrLoss).toString(),
        base_debit: "0",
        base_credit: Math.abs(gainOrLoss).toString()
      });
    } else {
      // Loss -> Debit
      await db.insert(journal_lines).values({
        journal_id: journal.id,
        account_id: gainLossAccountId,
        description: `Loss on Disposal - ${asset.name}`,
        debit: Math.abs(gainOrLoss).toString(),
        credit: "0",
        base_debit: Math.abs(gainOrLoss).toString(),
        base_credit: "0"
      });
    }
  }

  // 4. Update Asset Status
  await db.update(fixed_assets)
    .set({ 
      is_active: false,
      disposal_date: disposalDate,
      disposal_proceeds: proceeds.toString(),
      updated_at: new Date()
    })
    .where(eq(fixed_assets.id, assetId));

  return journal;
}
