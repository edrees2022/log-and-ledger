import json

file_path = 'client/src/locales/en/translation.json'

with open(file_path, 'r') as f:
    content = f.read()

# Find the start of trialBalancePage
start_marker = '"trialBalancePage": {'
start_index = content.find(start_marker)

if start_index == -1:
    print("Could not find trialBalancePage")
    exit(1)

# Find the end of the file (last closing brace)
end_index = content.rfind('}')

# We want to keep everything up to start_marker, and then append a clean trialBalancePage object
# But wait, we need to make sure we are replacing the right thing.
# The file structure is:
# {
#   ...
#   "cashFlowPage": { ... },
#   "trialBalancePage": { ... }
# }

# So we can just truncate at start_index and append the clean object.
# But we need to handle the comma before it.
# If we remove trialBalancePage, we should remove the comma before it.

# Let's look at the content before start_index
# It should be "  },\n  " or similar.

# Let's just parse the JSON up to that point? No, it's a single file.

# I will replace the whole trialBalancePage block with a clean one.
clean_trial_balance = {
    "title": "Trial Balance",
    "description": "View debits and credits for all accounts in the selected period",
    "generateReport": "Generate Trial Balance Report",
    "asOf": "As of",
    "from": "From",
    "to": "To",
    "totalDebits": "Total Debits",
    "totalCredits": "Total Credits",
    "debitCreditSummary": "Debit and Credit Summary",
    "account": "Account",
    "accounts": "Accounts",
    "balance": "Balance",
    "unbalanced": "Unbalanced",
    "currentPeriod": "Current Period",
    "yearEnd": "Year End",
    "customDate": "Custom Date",
    "allAccounts": "All Accounts",
    "assetsOnly": "Assets Only",
    "liabilitiesOnly": "Liabilities Only",
    "equityOnly": "Equity Only",
    "revenueOnly": "Revenue Only",
    "expensesOnly": "Expenses Only",
    "allDebitEntries": "All debit entries",
    "allCreditEntries": "All credit entries",
    "trialBalanceDetails": "Trial Balance Details",
    "noAccountData": "No account data available. Please add some transactions first.",
    "accountsList": "Accounts List",
    "debit": "Debit",
    "credit": "Credit",
    "total": "Total",
    "date": "Date",
    "description": "Description",
    "reference": "Reference",
    "status": "Status",
    "actions": "Actions",
    "viewDetails": "View Details",
    "downloadPDF": "Download PDF",
    "exportCSV": "Export CSV",
    "print": "Print",
    "refresh": "Refresh",
    "confirmDelete": "Are you sure you want to delete this trial balance entry?",
    "deleteSuccess": "Trial balance entry deleted successfully",
    "deleteError": "Failed to delete trial balance entry",
    "noData": "No trial balance data available for the selected period",
    "loading": "Loading trial balance data...",
    "errorLoading": "Error loading trial balance data",
    "failedToLoad": "Failed to load trial balance data. Please try again.",
    "viewAccountDetails": "View Account Details",
    "accountCode": "Account Code",
    "accountName": "Account Name"
}

# Construct the new content
# We keep content up to start_index
new_content = content[:start_index]
# Append the new key and object
new_content += '"trialBalancePage": ' + json.dumps(clean_trial_balance, indent=4)
# Append the closing brace of the main object
new_content += '\n}'

# Write back
with open(file_path, 'w') as f:
    f.write(new_content)

print("Fixed translation.json")
