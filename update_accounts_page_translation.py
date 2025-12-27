import json
import os

def update_translation():
    file_path = 'client/src/locales/en/translation.json'
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: File not found at {file_path}")
        return
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {file_path}")
        return

    # Ensure 'accounting' key exists
    if 'accounting' not in data:
        data['accounting'] = {}

    # Ensure 'accounts' key exists under 'accounting'
    if 'accounts' not in data['accounting']:
        data['accounting']['accounts'] = {}

    accounts_data = {
        "title": "Chart of Accounts",
        "description": "Manage your chart of accounts and financial structure",
        "add": "Add Account",
        "create": "Create Account",
        "edit": "Edit Account",
        "code": "Account Code",
        "name": "Account Name",
        "type": "Account Type",
        "subtype": "Account Subtype",
        "descriptionLabel": "Description",
        "active": "Active Account",
        "activeDesc": "Inactive accounts cannot be used in transactions",
        "messages": {
            "created": "Account created successfully",
            "createFailed": "Failed to create account",
            "updated": "Account updated successfully",
            "updateFailed": "Failed to update account",
            "deleted": "Account deleted successfully",
            "deleteFailed": "Failed to delete account",
            "deleteConfirm": "Are you sure you want to delete this account?",
            "deleteWarning": "This action cannot be undone.",
            "noAccounts": "No accounts found",
            "startAdding": "Start by adding your first account"
        },
        "types": {
            "asset": "Asset",
            "liability": "Liability",
            "equity": "Equity",
            "revenue": "Revenue",
            "expense": "Expense"
        },
        "subtypes": {
            "CurrentAsset": "Current Asset",
            "Cash": "Cash",
            "AccountsReceivable": "Accounts Receivable",
            "Inventory": "Inventory",
            "FixedAsset": "Fixed Asset",
            "OtherAsset": "Other Asset",
            "CurrentLiability": "Current Liability",
            "AccountsPayable": "Accounts Payable",
            "CreditCard": "Credit Card",
            "LongTermLiability": "Long Term Liability",
            "OtherLiability": "Other Liability",
            "OwnersEquity": "Owner's Equity",
            "RetainedEarnings": "Retained Earnings",
            "ShareCapital": "Share Capital",
            "Dividends": "Dividends",
            "SalesRevenue": "Sales Revenue",
            "ServiceRevenue": "Service Revenue",
            "OtherRevenue": "Other Revenue",
            "InterestIncome": "Interest Income",
            "CostOfGoods": "Cost of Goods Sold",
            "OperatingExpense": "Operating Expense",
            "SalaryExpense": "Salary Expense",
            "RentExpense": "Rent Expense",
            "UtilityExpense": "Utility Expense",
            "OtherExpense": "Other Expense"
        }
    }

    # Merge accounts_data into data['accounting']['accounts']
    # We use a recursive merge or just update if we want to overwrite/add
    # Since we want to ensure these keys exist, we can just update.
    # But we should be careful not to overwrite existing keys if they are already there and correct?
    # The user wants to add features, so I assume these keys are missing or need to be set.
    
    # Helper to merge dictionaries
    def merge_dicts(d1, d2):
        for k, v in d2.items():
            if k in d1 and isinstance(d1[k], dict) and isinstance(v, dict):
                merge_dicts(d1[k], v)
            else:
                d1[k] = v

    merge_dicts(data['accounting']['accounts'], accounts_data)

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully updated {file_path}")

if __name__ == "__main__":
    update_translation()
