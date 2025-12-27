import re

file_path = 'client/src/pages/reports/AIAnalyticsPage.tsx'

with open(file_path, 'r') as f:
    content = f.read()

replacements = [
    (r"['Mode', 'Count', 'Tokens In', 'Total Cost USD', 'Avg Cost USD']", "[t('reports.aiAnalytics.mode'), t('reports.aiAnalytics.count'), t('reports.aiAnalytics.tokensIn'), t('reports.aiAnalytics.totalCost'), t('reports.aiAnalytics.avgCost')]"),
    (r"['Date', 'Extractions', 'Total Cost USD', 'Avg Cost USD', 'Tokens In']", "[t('common.date'), t('reports.aiAnalytics.pipelineTotalExtractions'), t('reports.aiAnalytics.totalCost'), t('reports.aiAnalytics.avgCost'), t('reports.aiAnalytics.tokensIn')]"),
    (r"['Date', 'Total', 'Accepted', 'Acceptance %']", "[t('common.date'), t('reports.aiAnalytics.total'), t('reports.aiAnalytics.accepted'), t('reports.aiAnalytics.acceptanceRate')]"),
    (r"['Category', 'Total', 'Accepted', 'Acceptance %']", "[t('reports.aiAnalytics.category'), t('reports.aiAnalytics.total'), t('reports.aiAnalytics.accepted'), t('reports.aiAnalytics.acceptanceRate')]"),
    (r"['Date', 'Source', 'Category', 'Accepted', 'Confidence', 'Amount', 'Notes']", "[t('common.date'), t('common.source'), t('reports.aiAnalytics.category'), t('reports.aiAnalytics.accepted'), t('reports.aiAnalytics.confidence'), t('common.amount'), t('reports.aiAnalytics.notes')]"),
]

for old, new in replacements:
    content = content.replace(old, new)

with open(file_path, 'w') as f:
    f.write(content)
