import re
import os

file_path = "client/src/pages/reports/TaxPage.tsx"

replacements = [
    (r">Actions<", r">{t('common.actions')}<"),
    (r'data-label="Actions"', r'data-label={t(\'common.actions\')}')
]

if os.path.exists(file_path):
    with open(file_path, "r") as f:
        content = f.read()
    
    new_content = content
    for pattern, replacement in replacements:
        new_content = re.sub(pattern, replacement, new_content)
    
    if content != new_content:
        with open(file_path, "w") as f:
            f.write(new_content)
        print(f"Updated {file_path}")
    else:
        print(f"No changes in {file_path}")
else:
    print(f"File not found: {file_path}")
