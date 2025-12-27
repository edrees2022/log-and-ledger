import re
import json

# 1. Add keys to translation.json
json_path = 'client/src/locales/en/translation.json'
with open(json_path, 'r') as f:
    json_content = f.read()

target = '"totalPayrollTax": "Total Payroll Tax",'
replacement = '"totalPayrollTax": "Total Payroll Tax",\n    "ratesBreakdown": "Rates Breakdown",\n    "quarterlyPayments": "Quarterly Payments",\n    "payrollTaxSummary": "Payroll Tax Summary",'

if '"ratesBreakdown": "Rates Breakdown"' not in json_content:
    json_content = json_content.replace(target, replacement)
    with open(json_path, 'w') as f:
        f.write(json_content)

# 2. Localize TaxTypeReportPage.tsx
file_path = 'client/src/pages/reports/TaxTypeReportPage.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Remove defaultValue props
content = re.sub(r",\s*\{\s*defaultValue:\s*['\"].*?['\"]\s*\}", "", content)

# Replacements
replacements = [
    (r">Input Tax<", ">{t('tax.inputTax')}<"),
    (r">Recoverable<", ">{t('tax.recoverable')}<"),
    (r">Net VAT<", ">{t('tax.netTax')}<"),
    (r">Payable<", ">{t('tax.payable')}<"),
    (r">Rates Breakdown<", ">{t('tax.ratesBreakdown')}<"),
    (r">Jurisdiction<", ">{t('tax.jurisdiction')}<"),
    (r">Rate<", ">{t('tax.rate')}<"),
    (r">Taxable<", ">{t('tax.taxableAmount')}<"),
    (r">Tax<", ">{t('common.tax')}<"),
    (r">Gross Income<", ">{t('tax.grossIncome')}<"),
    (r">Deductions<", ">{t('tax.deductions')}<"),
    (r">Taxable Income<", ">{t('tax.taxableIncome')}<"),
    (r">Estimated Tax<", ">{t('tax.estimatedTax')}<"),
    (r">Quarterly Payments<", ">{t('tax.quarterlyPayments')}<"),
    (r">Quarter<", ">{t('tax.quarter')}<"),
    (r">Due Date<", ">{t('common.dueDate')}<"),
    (r">Amount<", ">{t('common.amount')}<"),
    (r">Status<", ">{t('common.status')}<"),
    (r">Payroll Tax Summary<", ">{t('tax.payrollTaxSummary')}<"),
    (r">Description<", ">{t('common.description')}<"),
    (r">Gross Wages<", ">{t('tax.grossWages')}<"),
    (r">Federal Withholding<", ">{t('tax.federalWithholding')}<"),
    (r">State Withholding<", ">{t('tax.stateWithholding')}<"),
    (r">Social Security<", ">{t('tax.socialSecurity')}<"),
    (r">Medicare<", ">{t('tax.medicare')}<"),
    (r">Employer Contributions<", ">{t('tax.employerContributions')}<"),
    (r">Total Payroll Tax<", ">{t('tax.totalPayrollTax')}<"),
    (r"data-label=\"Jurisdiction\"", "data-label={t('tax.jurisdiction')}"),
    (r"data-label=\"Rate\"", "data-label={t('tax.rate')}"),
    (r"data-label=\"Taxable\"", "data-label={t('tax.taxableAmount')}"),
    (r"data-label=\"Tax\"", "data-label={t('common.tax')}"),
    (r"data-label=\"Quarter\"", "data-label={t('tax.quarter')}"),
    (r"data-label=\"Status\"", "data-label={t('common.status')}"),
    (r"data-label=\"Description\"", "data-label={t('common.description')}"),
    (r"data-label=\"Amount\"", "data-label={t('common.amount')}"),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open(file_path, 'w') as f:
    f.write(content)
