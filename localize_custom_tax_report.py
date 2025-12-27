import re
import json

# 1. Add 'lines' to translation.json
json_path = 'client/src/locales/en/translation.json'
with open(json_path, 'r') as f:
    json_content = f.read()

if '"lines": "Lines"' not in json_content:
    target = '"details": "Details",'
    replacement = '"details": "Details",\n    "lines": "Lines",'
    json_content = json_content.replace(target, replacement)
    with open(json_path, 'w') as f:
        f.write(json_content)

# 2. Localize CustomTaxReportPage.tsx
file_path = 'client/src/pages/reports/CustomTaxReportPage.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Remove defaultValue props
content = re.sub(r",\s*\{\s*defaultValue:\s*['\"].*?['\"]\s*\}", "", content)

# Replacements
replacements = [
    (r">Sales Tax<", ">{t('tax.salesTax')}<"),
    (r">Collected<", ">{t('tax.collected')}<"),
    (r">Purchase Tax<", ">{t('tax.purchaseTax')}<"),
    (r">Paid<", ">{t('common.paid')}<"),
    (r">Net<", ">{t('tax.netTax')}<"),
    (r">Payable<", ">{t('tax.payable')}<"),
    (r">Tax Rate<", ">{t('tax.taxRate')}<"),
    (r">Invoice Lines<", ">{t('invoice.lineItems')}<"),
    (r">Invoice<", ">{t('sales.invoices.invoiceNumber')}<"),
    (r">Date<", ">{t('common.date')}<"),
    (r">Taxable<", ">{t('tax.taxableAmount')}<"),
    (r">Tax<", ">{t('common.tax')}<"),
    (r">Bill Lines<", ">{t('purchases.bills.title')} {t('common.lines')}<"),
    (r">Bill<", ">{t('purchases.bills.billNumber')}<"),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open(file_path, 'w') as f:
    f.write(content)
