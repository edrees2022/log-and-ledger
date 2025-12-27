import type { } from 'drizzle-orm';

// Lightweight compliance formatter for tax reports.
// It augments the raw report object with a `compliance` section based on jurisdiction.
export function formatTaxCompliance(report: any, jurisdiction?: string) {
  if (!jurisdiction) return report;
  const j = jurisdiction.toLowerCase();

  const safeNum = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const out: any = { ...report };

  if (j === 'sa' || j === 'saudi' || j === 'saudi-arabia' || j === 'ksa') {
    const collected = safeNum(report?.salesTax?.collectedTax);
    const recoverable = safeNum(report?.purchaseTax?.recoverable);
    const net = collected - recoverable;

    out.compliance = {
      jurisdiction: 'SA',
      form: 'VAT Return (ZATCA)',
      sections: [
        { code: 'VAT_COLLECTED', label: 'Output VAT (Sales)', amount: collected },
        { code: 'VAT_RECOVERABLE', label: 'Input VAT (Purchases)', amount: recoverable },
        { code: 'VAT_NET', label: 'Net VAT Payable', amount: net },
      ],
      summary: { payable: net > 0 ? net : 0, refundable: net < 0 ? Math.abs(net) : 0 },
    };
  } else if (j === 'eu' || j === 'euvat' || j === 'eu-vat') {
    const taxable = safeNum(report?.salesTax?.taxableSales);
    const collected = safeNum(report?.salesTax?.collectedTax);
    const paid = safeNum(report?.purchaseTax?.paidTax);
    const net = collected - paid;

    out.compliance = {
      jurisdiction: 'EU',
      form: 'VAT Return (Generic EU)',
      sections: [
        { code: 'SUPPLIES_TAXABLE', label: 'Taxable Supplies', amount: taxable },
        { code: 'OUTPUT_VAT', label: 'Output VAT', amount: collected },
        { code: 'INPUT_VAT', label: 'Input VAT', amount: paid },
        { code: 'NET_VAT', label: 'Net VAT', amount: net },
      ],
      summary: { payable: net > 0 ? net : 0, refundable: net < 0 ? Math.abs(net) : 0 },
    };
  } else {
    // Unknown jurisdiction; attach minimal structure
    out.compliance = { jurisdiction: jurisdiction, sections: [], summary: {} };
  }

  return out;
}
