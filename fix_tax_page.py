import re

file_path = 'client/src/pages/reports/TaxPage.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Fix data-label={{t(...)}} -> data-label={t(...)}
# Regex: data-label=\{\{(t\('[^']+'\))\}\} -> data-label={$1}
# Note: The previous script might have produced data-label={{t('...')}}
# Let's match exactly that pattern.
content = re.sub(r'data-label=\{\{(t\(\'[^\']+\'\))\}\}', r'data-label={\1}', content)

# Also check for other double braces if any
# I only did it for data-label in the previous script.

with open(file_path, 'w') as f:
    f.write(content)

print("Fixed TaxPage.tsx data-labels")
