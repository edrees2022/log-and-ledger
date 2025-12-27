import { describe, it, expect } from 'vitest';
import { normalizeTrialBalanceAccounts } from '../src/utils/reports';

describe('normalizeTrialBalanceAccounts', () => {
  it('maps account_code/name and lowercases account_type', () => {
    const raw = [{
      account_code: '1000',
      account_name: 'Cash',
      account_type: 'Asset',
      debit: '150.50',
      credit: 0,
    }, {
      code: '2000',
      name: 'Accounts Payable',
      type: 'LIABILITY',
      debit: 0,
      credit: '90',
    }];

    const out = normalizeTrialBalanceAccounts(raw);
    expect(out).toEqual([
      { code: '1000', name: 'Cash', account_type: 'asset', debit: 150.5, credit: 0 },
      { code: '2000', name: 'Accounts Payable', account_type: 'liability', debit: 0, credit: 90 },
    ]);
  });

  it('handles invalid input gracefully', () => {
    const out = normalizeTrialBalanceAccounts(null as any);
    expect(out).toEqual([]);
  });
});
