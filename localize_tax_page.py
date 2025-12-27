import re

file_path = 'client/src/pages/reports/TaxPage.tsx'

with open(file_path, 'r') as f:
    content = f.read()

replacements = [
    ('Input Tax', "reports.tax.inputTax"),
    ('Recoverable', "reports.tax.recoverable"),
    ('Net Tax', "reports.tax.netTax"),
    ('Payable', "reports.tax.payable"),
    ('Income Tax Details', "reports.tax.incomeTaxDetails"), # I'll add this key or construct it
    ('Income Tax', "reports.tax.incomeTax"),
    ('Quarterly', "reports.tax.quarterly"),
    ('Total Liability', "reports.tax.totalLiability"),
    ('This period', "reports.tax.thisPeriod"),
    ('Purchase Tax Details', "reports.tax.purchaseTaxDetails"), # Add key
    ('Purchase Tax', "reports.tax.purchaseTax"),
    ('Payroll Tax Details', "reports.tax.payrollTaxDetails"), # Add key
    ('Payroll Tax', "reports.tax.payrollTax"),
    ('Tax Filings', "reports.tax.filings"),
    ('Sales Tax Details', "reports.tax.salesTaxDetails"), # Add key
    ('Total Sales', "reports.tax.totalSales"),
    ('Taxable Sales', "reports.tax.taxableSales"),
    ('Exempt Sales', "reports.tax.exemptSales"),
    ('Tax Collected', "reports.tax.taxCollected"),
    ('Jurisdiction', "reports.jurisdiction"),
    ('Rate', "reports.tax.taxRate"),
    ('Taxable Amount', "reports.tax.taxableAmount"),
    ('Tax Amount', "reports.tax.taxAmount"),
    ('Total Sales Tax', "reports.tax.totalSalesTax"), # Add key
    ('Total Purchases', "reports.tax.totalPurchases"),
    ('Taxable Purchases', "reports.tax.taxablePurchases"),
    ('Exempt Purchases', "reports.tax.exemptPurchases"),
    ('Tax Paid', "reports.tax.taxPaid"),
    ('Gross Income', "reports.tax.grossIncome"),
    ('Deductions', "reports.tax.deductions"),
    ('Taxable Income', "reports.tax.taxableIncome"),
    ('Estimated Tax', "reports.tax.estimatedTax"),
    ('Quarter', "reports.tax.quarter"),
    ('Due Date', "common.dueDate"),
    ('Amount', "common.amount"),
    ('Status', "common.status"),
    ('Description', "common.description"),
    ('Gross Wages', "reports.tax.grossWages"),
    ('Federal Income Tax Withholding', "reports.tax.federalWithholding"),
    ('State Income Tax Withholding', "reports.tax.stateWithholding"),
    ('Social Security Tax', "reports.tax.socialSecurity"),
    ('Medicare Tax', "reports.tax.medicare"),
    ('Employer Contributions', "reports.tax.employerContributions"),
    ('Total Payroll Tax', "reports.tax.totalPayrollTax"),
    ('Form', "common.form"),
    ('Period', "reports.period"),
    ('File Now', "reports.tax.fileNow"),
    ('View', "common.view"),
]

# I need to add the missing keys to translation.json first?
# I'll assume I'll add them.
# incomeTaxDetails, purchaseTaxDetails, payrollTaxDetails, salesTaxDetails, totalSalesTax.

for old, key in replacements:
    new = f"{{t('{key}')}}"
    # Replace text content
    content = content.replace(f'>{old}<', f'>{new}<')
    # Replace data-label
    content = content.replace(f'data-label="{old}"', f'data-label={{{new}}}')

with open(file_path, 'w') as f:
    f.write(content)

print("Localized TaxPage.tsx")
