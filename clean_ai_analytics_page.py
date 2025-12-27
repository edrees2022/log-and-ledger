import re

file_path = 'client/src/pages/reports/AIAnalyticsPage.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Remove defaultValue props from t() calls
# Pattern: , { defaultValue: '...' }
# Or , { defaultValue: "..." }
# Be careful not to match too much.
# The defaultValue string might contain escaped quotes.

# Regex: , { defaultValue: '...' }
# We assume the default value doesn't contain the closing quote of the string literal used for defaultValue.
# And we assume the object closing brace follows immediately.

content = re.sub(r",\s*\{\s*defaultValue:\s*['\"].*?['\"]\s*\}", "", content)

with open(file_path, 'w') as f:
    f.write(content)
