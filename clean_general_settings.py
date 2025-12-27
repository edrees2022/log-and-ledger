import re
import os

file_path = "client/src/pages/settings/GeneralSettingsPage.tsx"

def clean_file(content):
    # Remove second argument string literal: t('key', 'Default Value') -> t('key')
    # Be careful not to match t('key', { ... })
    # Regex: t\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)
    content = re.sub(r"t\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)", r"t('\1')", content)
    
    # Remove defaultValue in options object: t('key', { defaultValue: 'Val' }) -> t('key')
    content = re.sub(r"t\(\s*'([^']+)'\s*,\s*\{\s*defaultValue\s*:\s*'[^']+'\s*\}\s*\)", r"t('\1')", content)
    
    # Replace timezones
    replacements = {
        r">Eastern Time \(ET\)<": "> {t('timezones.eastern')} <",
        r">Central Time \(CT\)<": "> {t('timezones.central')} <",
        r">Mountain Time \(MT\)<": "> {t('timezones.mountain')} <",
        r">Pacific Time \(PT\)<": "> {t('timezones.pacific')} <",
        r">London \(GMT\)<": "> {t('timezones.london')} <",
        r">Paris \(CET\)<": "> {t('timezones.paris')} <"
    }
    
    for pattern, replacement in replacements.items():
        content = re.sub(pattern, replacement, content)
        
    return content

if os.path.exists(file_path):
    with open(file_path, "r") as f:
        content = f.read()
    
    new_content = clean_file(content)
    
    if content != new_content:
        with open(file_path, "w") as f:
            f.write(new_content)
        print(f"Updated {file_path}")
    else:
        print(f"No changes in {file_path}")
else:
    print(f"File not found: {file_path}")
