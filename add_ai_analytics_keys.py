import json

file_path = 'client/src/locales/en/translation.json'

with open(file_path, 'r') as f:
    content = f.read()

target_str = '      "inStock": "inStock"\n    },'
replacement_str = """      "inStock": "inStock"
    },
    "aiAnalytics": {
      "title": "AI Analytics",
      "description": "Track AI suggestion quality and user feedback across categories.",
      "provider": "Provider",
      "mode": "Mode",
      "exportTrendCsv": "Export Trend CSV",
      "exportSummaryCsv": "Export Summary CSV",
      "exportPipelineModesCsv": "Export Pipeline Modes CSV",
      "exportPipelineTrendCsv": "Export Pipeline Trend CSV",
      "exportPipelineTrendXlsx": "Export Pipeline Trend XLSX",
      "exportPipelineTrendPdf": "Export Pipeline Trend PDF",
      "exportPipelineModesXlsx": "Export Pipeline Modes XLSX",
      "exportPipelineModesPdf": "Export Pipeline Modes PDF",
      "totalFeedback": "Total Feedback",
      "entries": "entries",
      "overallAcceptance": "Overall Acceptance",
      "topCategory": "Top Category",
      "acceptance": "Acceptance",
      "pipelineTotalExtractions": "Pipeline Extractions",
      "total": "Total",
      "pipelineTotalCost": "Pipeline Total Cost (USD)",
      "pipelineAvgCost": "Pipeline Avg Cost (USD)",
      "pipelineTotalTokens": "Pipeline Total Tokens",
      "feedbackTrend": "Feedback Trend",
      "feedbackSummary": "Feedback Summary",
      "category": "Category",
      "accepted": "Accepted",
      "rate": "Rate",
      "pipelineModeBreakdown": "Pipeline Mode Breakdown",
      "count": "Count",
      "tokensIn": "Tokens In",
      "totalCost": "Total Cost",
      "avgCost": "Avg Cost",
      "recentFeedback": "Recent Feedback",
      "confidence": "Confidence",
      "notes": "Notes"
    },"""

content = content.replace(target_str, replacement_str)

with open(file_path, 'w') as f:
    f.write(content)
