import json

file_path = 'client/src/locales/en/translation.json'

with open(file_path, 'r') as f:
    content = f.read()

# Add keys to aiAnalytics
target_str = '      "notes": "Notes"\n    },'
replacement_str = """      "notes": "Notes",
      "byCategory": "By Category",
      "trend": "Trend (daily)",
      "pipelineExtracts": "Pipeline",
      "acceptanceRate": "Acceptance %",
      "dualAxisHint": "Left: total count · Right: acceptance rate",
      "recentFeedback": "Recent Feedback",
      "pipelineModes": "Pipeline Mode Breakdown",
      "count": "Count",
      "tokensIn": "Tokens In",
      "totalCost": "Total Cost (USD)",
      "avgCost": "Avg Cost (USD)"
    },"""

content = content.replace(target_str, replacement_str)

# Add keys to common
target_common = '"approved": "Approved",'
replacement_common = '"approved": "Approved",\n    "accepted": "Accepted",'

content = content.replace(target_common, replacement_common)

# Add unknown to common
target_nodata = '"noData": "No data available",'
replacement_nodata = '"noData": "No data available",\n    "unknown": "Unknown",'

content = content.replace(target_nodata, replacement_nodata)

with open(file_path, 'w') as f:
    f.write(content)
