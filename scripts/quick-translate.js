#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Quick translation mappings (exact text -> key)
const translations = {
  // Banking
  "Failed to load receipts": "t('banking.failedToLoadReceipts')",
  "Failed to load payments": "t('banking.failedToLoadPayments')",
  "Failed to load accounts": "t('banking.failedToLoadAccounts')",
  "Receipts": "t('banking.receipts')",
  "Payments": "t('banking.payments')",
  "New Receipt": "t('banking.newReceipt')",
  "New Payment": "t('banking.newPayment')",
  "Total Receipts": "t('banking.totalReceipts')",
  "Total Payments": "t('banking.totalPayments')",
  "All Receipts": "t('banking.allReceipts')",
  "All Payments": "t('banking.allPayments')",
  "Manage receipts": "t('banking.manageReceipts')",
  "Manage payments": "t('banking.managePayments')",
  "Manage incoming receipts from customers": "t('banking.manageIncomingReceipts')",
  "Manage outgoing payments to vendors": "t('banking.manageOutgoingPayments')",
  "Receipt #": "t('banking.receiptNumber')",
  "Payment #": "t('banking.paymentNumber')",
  
  // Payment methods
  "Bank Transfer": "t('common.bankTransfer')",
  "Credit Card": "t('common.creditCard')",
  "Check": "t('common.check')",
  "Online Payment": "t('common.onlinePayment')",
  "Cash": "t('common.cash')",
  
  // Status
  "Collected": "t('common.collected')",
  "Received": "t('common.received')",
  "Cleared": "t('common.cleared')",
  "Bounced": "t('common.bounced')",
  
  // Placeholders
  "Select customer": "t('common.pleaseSelectCustomer')",
  "Select vendor": "t('common.pleaseSelectVendor')",
  "Select method": "t('common.selectMethod')",
  "Enter receipt description": "t('common.enterDescription')",
  "Enter payment description": "t('common.enterDescription')",
  "Enter reference number": "t('common.enterReferenceNumber')",
  "Search receipts...": "t('common.searchReceipts')",
  "Search payments...": "t('common.searchPayments')",
  "Additional notes...": "t('common.additionalNotes')",
  
  // Common UI
  "This month": "t('common.thisMonth')",
  "Today": "t('common.today')",
  "Successfully paid": "t('common.successfullyPaid')",
  "Successfully collected": "t('common.successfullyCollected')",
  "In process": "t('common.inProcess')",
  "Need attention": "t('common.needAttention')",
  "Actions": "t('common.actions')",
  "View Details": "t('common.viewDetails')",
  "Duplicate": "t('common.duplicate')",
  "Reference Number (Optional)": "t('common.referenceNumber') + ' (' + t('common.optional') + ')'",
  "Notes (Optional)": "t('common.notes') + ' (' + t('common.optional') + ')'",
  
  // Reports
  "Generate Report": "t('reports.generateReport')",
  "Download PDF": "t('common.downloadPDF')",
  "Export Excel": "t('reports.exportExcel')",
  "Profit Loss": "t('reports.profitLoss')",
  "Balance Sheet": "t('reports.balanceSheet')",
  "Trial Balance": "t('reports.trialBalance')",
  "Cash Flow": "t('reports.cashFlow')",
  "Custom Range": "t('common.customRange')",
  
  // Sales
  "Invoices": "t('sales.invoices')",
  "Orders": "t('sales.orders')",
  "Quotations": "t('sales.quotations')",
  "Credit Notes": "t('sales.creditNotes')",
  "New Invoice": "t('sales.newInvoice')",
  "Total Invoices": "t('sales.totalInvoices')",
  
  // Purchases
  "Bills": "t('purchases.bills')",
  "Purchase Orders": "t('purchases.orders')",
  "Expenses": "t('purchases.expenses')",
  "Debit Notes": "t('purchases.debitNotes')",
  "New Bill": "t('purchases.newBill')",
  
  // Settings
  "General Settings": "t('settings.general')",
  "Language Settings": "t('settings.language')",
  "Users": "t('settings.users')",
  "Tax Configuration": "t('settings.tax')",
  "Roles": "t('common.roles')",
  "Active": "t('common.active')",
  "Inactive": "t('common.inactive')",
  "Locked": "t('common.locked')",
  "Phone": "t('common.phone')",
  "Department": "t('common.department')",
  "Module": "t('common.module')",
  "Admin": "t('common.admin')",
  "Accountant": "t('common.accountant')",
  "Viewer": "t('common.viewer')",
  "Email": "t('common.email')",
  "Language": "t('common.language')",
  "Region": "t('common.region')",
  "Default": "t('common.default')",
  "Translated": "t('common.translated')",
  "Total": "t('common.total')",
  "Coverage": "t('common.coverage')",
  "Company": "t('settings.company')",
  "Regional": "t('settings.regional')",
  "Invoice": "t('settings.invoice')",
  "Notifications": "t('settings.notifications')",
  "Security": "t('settings.security')",
  "Address": "t('common.address')",
  "Country": "t('common.country')",
  "Canada": "t('countries.canada')",
  "Australia": "t('countries.australia')",
  "Germany": "t('countries.germany')",
  "France": "t('countries.france')",
  "Currency": "t('common.currency')",
  "January": "t('months.january')",
  "April": "t('months.april')",
  "October": "t('months.october')",
  "Never": "t('common.never')",
  
  // Status
  "Draft": "t('common.draft')",
  "Approved": "t('common.approved')",
  "Rejected": "t('common.rejected')",
  "Reimbursable": "t('purchases.reimbursable')",
  "Payment": "t('common.payment')",
  "Receipt": "t('common.receipt')",
  "Outstanding": "t('common.outstanding')",
  "Overdue": "t('common.overdue')",
  "General": "t('common.general')",
  "Applied": "t('common.applied')",
  "Reason": "t('common.reason')",
  "Processing": "t('common.processing')",
  "Shipped": "t('common.shipped')",
  "Delivered": "t('common.delivered')",
  "Cancelled": "t('common.cancelled')",
  "Accepted": "t('common.accepted')",
  "Expired": "t('common.expired')",
  "Paused": "t('common.paused')",
  "Template": "t('common.template')",
  "Items": "t('common.items')",
  "Approval": "t('common.approval')",
  "Account": "t('common.account')",
  "Description": "t('common.description')",
  "Quantity": "t('common.quantity')",
  "Location": "t('common.location')",
  "Overview": "t('common.overview')",
  "Valuation": "t('common.valuation')",
  "Percentage": "t('common.percentage')",
  "Recoverable": "t('reports.recoverable')",
  "Deductions": "t('reports.deductions')",
  "Quarter": "t('reports.quarter')",
  "Period": "t('reports.period')",
  "Difference": "t('reports.difference')",
  "Balanced": "t('reports.balanced')",
  "Unbalanced": "t('reports.unbalanced')",
  "Debit": "t('reports.debit')",
  "Credit": "t('reports.credit')",
  "Balance": "t('common.balance')",
  "TOTAL": "t('common.total').toUpperCase()",
  "REVENUE": "t('common.revenue').toUpperCase()",
  "Electronics": "t('categories.electronics')",
  "Accessories": "t('categories.accessories')",
  "Services": "t('categories.services')",
  "Firebase": "Firebase", // Keep as-is - brand name
  "Status": "t('common.status')",
  "Amount": "t('common.amount')",
  "Actions": "t('common.actions')",
  "Quarter": "t('reports.quarter')",
  "Period": "t('reports.period')",
};

// Function to translate a file
function translateFile(filePath) {
  console.log(`\n📄 Processing: ${filePath}`);
  
  let content = readFileSync(filePath, 'utf-8');
  let changes = 0;
  
  // Replace each translation
  for (const [english, code] of Object.entries(translations)) {
    // Try different patterns
    const patterns = [
      // JSX content: >Text<
      new RegExp(`>([\\s\\n]*)${escapeRegex(english)}([\\s\\n]*)<`, 'g'),
      // Placeholder: placeholder="Text"
      new RegExp(`placeholder="(${escapeRegex(english)})"`, 'g'),
      // Title: title="Text"
      new RegExp(`title="(${escapeRegex(english)})"`, 'g'),
    ];
    
    for (const pattern of patterns) {
      const before = content;
      if (pattern.source.includes('placeholder=') || pattern.source.includes('title=')) {
        content = content.replace(pattern, (match, captured) => {
          return match.replace(captured, `{${code}}`);
        });
      } else {
        content = content.replace(pattern, (match, ws1, ws2) => {
          return `>${ws1}{${code}}${ws2}<`;
        });
      }
      
      if (content !== before) {
        changes++;
      }
    }
  }
  
  if (changes > 0) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Applied ${changes} translations`);
  } else {
    console.log(`⚠️  No changes made`);
  }
  
  return changes;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Get files to translate
const files = [
  'client/src/pages/banking/ReceiptsPage.tsx',
  'client/src/pages/banking/AccountsPage.tsx',
  'client/src/pages/reports/ProfitLossPage.tsx',
  'client/src/pages/reports/TrialBalancePage.tsx',
  'client/src/pages/reports/BalanceSheetPage.tsx',
  'client/src/pages/reports/CashFlowPage.tsx',
  'client/src/pages/reports/InventoryPage.tsx',
  'client/src/pages/sales/InvoicesPage.tsx',
  'client/src/pages/sales/OrdersPage.tsx',
  'client/src/pages/sales/QuotationsPage.tsx',
  'client/src/pages/sales/CreditNotesPage.tsx',
  'client/src/pages/sales/RecurringInvoicesPage.tsx',
  'client/src/pages/purchases/BillsPage.tsx',
  'client/src/pages/purchases/OrdersPage.tsx',
  'client/src/pages/purchases/ExpensesPage.tsx',
  'client/src/pages/purchases/DebitNotesPage.tsx',
  'client/src/pages/settings/GeneralSettingsPage.tsx',
  'client/src/pages/settings/LanguageSettingsPage.tsx',
  'client/src/pages/settings/UsersPage.tsx',
];

console.log('🚀 Quick Translation Tool\n' + '='.repeat(50));

let totalChanges = 0;
for (const file of files) {
  const fullPath = join(process.cwd(), file);
  try {
    const changes = translateFile(fullPath);
    totalChanges += changes;
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
}

console.log('\n' + '='.repeat(50));
console.log(`📊 Summary: ${totalChanges} total translations applied`);
console.log('✅ Done!');
