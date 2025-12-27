import re
import os

file_path = "client/src/pages/reports/TaxPage.tsx"

replacements = [
    (r"(\s+)Recoverable(\s+)", r"\1{t('reports.tax.recoverable')}\2"),
    (r"(\s+)Payable(\s+)", r"\1{t('reports.tax.payable')}\2"),
    (r"(\s+)Quarterly(\s+)", r"\1{t('reports.tax.quarterly')}\2"),
    (r"(\s+)This period(\s+)", r"\1{t('reports.tax.thisPeriod')}\2")
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
