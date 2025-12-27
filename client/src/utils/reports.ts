export type NormalizedTrialAccount = {
  code: string;
  name: string;
  account_type: string; // lowercased: asset|liability|equity|revenue|expense
  debit: number;
  credit: number;
};

/**
 * Normalize trial balance accounts to a consistent shape and casing.
 */
export function normalizeTrialBalanceAccounts(raw: any[] | undefined | null): NormalizedTrialAccount[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((acc: any) => ({
    code: acc?.account_code ?? acc?.code ?? "",
    name: acc?.account_name ?? acc?.name ?? "",
    account_type: (acc?.account_type ?? acc?.type ?? "").toString().toLowerCase(),
    debit: Number(acc?.debit) || 0,
    credit: Number(acc?.credit) || 0,
  }));
}
