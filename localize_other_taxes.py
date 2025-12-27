import re

file_path = 'client/src/pages/reports/OtherTaxesPage.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Remove defaultValue props
content = re.sub(r",\s*\{\s*defaultValue:\s*['\"].*?['\"]\s*\}", "", content)

# Replacements
replacements = [
    (r">Code<", ">{t('tax.code')}<"),
    (r">Name<", ">{t('tax.name')}<"),
    (r">Type<", ">{t('tax.type')}<"),
    (r">Rate<", ">{t('tax.rate')}<"),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open(file_path, 'w') as f:
    f.write(content)
