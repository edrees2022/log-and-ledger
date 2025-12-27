import re
import os

files = [
    "client/src/pages/reports/BalanceSheetPage.tsx",
    "client/src/pages/reports/ProfitLossPage.tsx",
    "client/src/pages/reports/TaxPage.tsx"
]

def remove_default_value(content):
    # Regex to match t('key', { defaultValue: 'value' }) and replace with t('key')
    # Also handles multiline
    pattern = r"t\(\s*'([^']+)'\s*,\s*\{\s*defaultValue\s*:\s*'[^']+'\s*\}\s*\)"
    return re.sub(pattern, r"t('\1')", content)

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            content = f.read()
        
        new_content = remove_default_value(content)
        
        if content != new_content:
            with open(file_path, "w") as f:
                f.write(new_content)
            print(f"Updated {file_path}")
        else:
            print(f"No changes in {file_path}")
    else:
        print(f"File not found: {file_path}")
