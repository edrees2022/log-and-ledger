import json
import os

file_path = "client/src/locales/en/translation.json"

new_keys = {
  "settings": {
    "tabs": {
      "company": "Company",
      "regional": "Regional",
      "invoice": "Invoice",
      "notifications": "Notifications",
      "security": "Security"
    },
    "company": {
      "title": "Company Profile",
      "description": "Manage your company details and branding",
      "logo": "Company Logo",
      "logoHelp": "Upload a square logo for best results (PNG, JPG)",
      "uploadLogo": "Upload Logo",
      "name": "Company Name",
      "taxId": "Tax ID / VAT Number",
      "email": "Email Address",
      "phone": "Phone Number",
      "address": "Street Address",
      "city": "City",
      "country": "Country",
      "zip": "Zip / Postal Code"
    },
    "regional": {
      "title": "Regional Settings",
      "description": "Configure currency, date format, and timezone preferences",
      "currency": "Base Currency",
      "dateFormat": "Date Format",
      "timeZone": "Time Zone",
      "fiscalYearStart": "Fiscal Year Start"
    },
    "invoice": {
      "title": "Invoice Settings",
      "description": "Configure invoice numbering and default terms",
      "prefix": "Invoice Prefix",
      "nextNumber": "Next Invoice Number",
      "paymentTerms": "Default Payment Terms",
      "taxRate": "Default Tax Rate (%)"
    },
    "notifications": {
      "title": "Notification Preferences",
      "description": "Manage how you receive alerts and updates",
      "email": "Email Notifications",
      "emailDesc": "Receive daily summaries and important alerts via email",
      "sms": "SMS Notifications",
      "smsDesc": "Receive critical alerts via SMS (charges may apply)",
      "invoiceReminders": "Invoice Reminders",
      "invoiceRemindersDesc": "Automatically send reminders for overdue invoices",
      "paymentAlerts": "Payment Alerts",
      "paymentAlertsDesc": "Get notified when a payment is received",
      "lowStockAlerts": "Low Stock Alerts",
      "lowStockAlertsDesc": "Get notified when inventory levels are low"
    },
    "security": {
      "title": "Security Settings",
      "description": "Manage account security and access controls",
      "2fa": "Two-Factor Authentication",
      "2faDesc": "Require a verification code when logging in",
      "ipRestriction": "IP Restriction",
      "ipRestrictionDesc": "Restrict access to specific IP addresses",
      "sessionTimeout": "Session Timeout",
      "passwordExpiry": "Password Expiry"
    },
    "logoUploaded": "Logo Uploaded",
    "logoUploadedDesc": "Company logo has been updated successfully."
  },
  "countries": {
    "unitedStates": "United States",
    "canada": "Canada",
    "unitedKingdom": "United Kingdom",
    "australia": "Australia",
    "germany": "Germany",
    "france": "France"
  },
  "months": {
    "january": "January",
    "april": "April",
    "july": "July",
    "october": "October"
  },
  "paymentTerms": {
    "dueOnReceipt": "Due on Receipt",
    "net15": "Net 15",
    "net30": "Net 30",
    "net45": "Net 45",
    "net60": "Net 60",
    "net90": "Net 90"
  },
  "time": {
    "minutes": "{{count}} Minutes",
    "hours": "{{count}} Hours",
    "days": "{{count}} Days",
    "years": "{{count}} Years"
  },
  "timezones": {
    "eastern": "Eastern Time (ET)",
    "central": "Central Time (CT)",
    "mountain": "Mountain Time (MT)",
    "pacific": "Pacific Time (PT)",
    "london": "London (GMT)",
    "paris": "Paris (CET)"
  },
  "backup": {
    "autoBackupNever": "Never",
    "autoBackupCompleted": "Auto-Backup Completed",
    "autoBackupSuccess": "Your data has been successfully backed up.",
    "success": "Backup Successful",
    "downloadComplete": "Backup file has been downloaded.",
    "error": "Backup Failed",
    "failed": "An error occurred while creating the backup.",
    "mergeSuccess": "Data Merged Successfully",
    "restoreSuccess": "Data Restored Successfully",
    "dataMerged": "Data merged",
    "newAccounts": "new accounts",
    "newContacts": "new contacts",
    "newItems": "new items",
    "dataRestored": "Data restored",
    "accounts": "accounts",
    "contacts": "contacts",
    "items": "items",
    "invalidFile": "Invalid backup file selected.",
    "merge": "Merge Data",
    "restoreWarning": "Restoring will replace all current data with the backup data. This action cannot be undone.",
    "infoTitle": "Backup Information",
    "infoDescription": "The backup file includes:",
    "infoCompanies": "Company profiles and settings",
    "infoAccounts": "Chart of accounts and balances",
    "infoContacts": "Customers and suppliers",
    "infoItems": "Inventory items and services",
    "infoTimestamp": "The backup file includes a timestamp to help you identify versions.",
    "continueQuestion": "Do you want to continue?",
    "mergeWarning": "Merging will add new records from the backup. Existing records with same IDs will be updated.",
    "noCompanyWarning": "You need to create a company before you can backup or restore data.",
    "createCompanyNow": "Create Company Now"
  }
}

def deep_merge(source, destination):
    for key, value in source.items():
        if isinstance(value, dict):
            node = destination.setdefault(key, {})
            deep_merge(value, node)
        else:
            destination[key] = value
    return destination

if os.path.exists(file_path):
    with open(file_path, "r") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            print("Error decoding JSON")
            exit(1)
    
    deep_merge(new_keys, data)
    
    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Updated {file_path}")
else:
    print(f"File not found: {file_path}")
