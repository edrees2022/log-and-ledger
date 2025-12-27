import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// قراءة تحليل الملفات
const analysisPath = path.join(__dirname, 'i18n-analysis-report.json');
const analysisResults = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));

// Translation mappings (improved)
const translationMap = {
  // Banking
  'Payments': { key: 'banking.payments', category: 'banking' },
  'Receipts': { key: 'banking.receipts', category: 'banking' },
  'Accounts': { key: 'banking.accounts', category: 'banking' },
  'Reconciliation': { key: 'banking.reconciliation', category: 'banking' },
  'Bank Statements': { key: 'banking.bankStatements', category: 'banking' },
  'Payment Method': { key: 'banking.paymentMethod', category: 'banking' },
  'Payment Date': { key: 'banking.paymentDate', category: 'banking' },
  'Payment Number': { key: 'banking.paymentNumber', category: 'banking' },
  'Payment Amount': { key: 'banking.paymentAmount', category: 'banking' },
  'Receipt Date': { key: 'banking.receiptDate', category: 'banking' },
  'Receipt Number': { key: 'banking.receiptNumber', category: 'banking' },
  'Account Name': { key: 'banking.accountName', category: 'banking' },
  'Account Number': { key: 'banking.accountNumber', category: 'banking' },
  'Account Type': { key: 'banking.accountType', category: 'banking' },
  'Account Balance': { key: 'banking.accountBalance', category: 'banking' },
  'Opening Balance': { key: 'banking.openingBalance', category: 'banking' },
  'Closing Balance': { key: 'banking.closingBalance', category: 'banking' },
  'Bank': { key: 'banking.bank', category: 'banking' },
  'Cash': { key: 'banking.cash', category: 'banking' },
  'Credit Card': { key: 'banking.creditCard', category: 'banking' },
  'Debit Card': { key: 'banking.debitCard', category: 'banking' },
  'Cheque': { key: 'banking.cheque', category: 'banking' },
  'Wire Transfer': { key: 'banking.wireTransfer', category: 'banking' },
  
  // Sales
  'Invoices': { key: 'sales.invoices', category: 'sales' },
  'Orders': { key: 'sales.orders', category: 'sales' },
  'Quotations': { key: 'sales.quotations', category: 'sales' },
  'Credit Notes': { key: 'sales.creditNotes', category: 'sales' },
  'Recurring Invoices': { key: 'sales.recurringInvoices', category: 'sales' },
  'Invoice': { key: 'sales.invoice', category: 'sales' },
  'Invoice Number': { key: 'sales.invoiceNumber', category: 'sales' },
  'Invoice Date': { key: 'sales.invoiceDate', category: 'sales' },
  'Issue Date': { key: 'sales.issueDate', category: 'sales' },
  'Due Date': { key: 'sales.dueDate', category: 'sales' },
  'Customer': { key: 'sales.customer', category: 'sales' },
  'Customer Name': { key: 'sales.customerName', category: 'sales' },
  'Draft': { key: 'sales.draft', category: 'sales' },
  'Sent': { key: 'sales.sent', category: 'sales' },
  'Paid': { key: 'sales.paid', category: 'sales' },
  'Partially Paid': { key: 'sales.partial', category: 'sales' },
  'Overdue': { key: 'sales.overdue', category: 'sales' },
  'Cancelled': { key: 'sales.cancelled', category: 'sales' },
  'Payment Status': { key: 'sales.paymentStatus', category: 'sales' },
  
  // Purchases
  'Bills': { key: 'purchases.bills', category: 'purchases' },
  'Purchase Orders': { key: 'purchases.orders', category: 'purchases' },
  'Expenses': { key: 'purchases.expenses', category: 'purchases' },
  'Debit Notes': { key: 'purchases.debitNotes', category: 'purchases' },
  'Bill': { key: 'purchases.bill', category: 'purchases' },
  'Bill Number': { key: 'purchases.billNumber', category: 'purchases' },
  'Bill Date': { key: 'purchases.billDate', category: 'purchases' },
  'Supplier': { key: 'purchases.supplier', category: 'purchases' },
  'Vendor': { key: 'purchases.vendor', category: 'purchases' },
  'Expense': { key: 'purchases.expense', category: 'purchases' },
  'Expense Category': { key: 'purchases.expenseCategory', category: 'purchases' },
  'Expense Date': { key: 'purchases.expenseDate', category: 'purchases' },
  
  // Reports
  'Profit & Loss': { key: 'reports.profitLoss', category: 'reports' },
  'Balance Sheet': { key: 'reports.balanceSheet', category: 'reports' },
  'Trial Balance': { key: 'reports.trialBalance', category: 'reports' },
  'Cash Flow': { key: 'reports.cashFlow', category: 'reports' },
  'Inventory Report': { key: 'reports.inventoryReport', category: 'reports' },
  'Revenue': { key: 'reports.revenue', category: 'reports' },
  'Cost of Goods Sold': { key: 'reports.cogs', category: 'reports' },
  'Gross Profit': { key: 'reports.grossProfit', category: 'reports' },
  'Operating Expenses': { key: 'reports.operatingExpenses', category: 'reports' },
  'Net Income': { key: 'reports.netIncome', category: 'reports' },
  'Assets': { key: 'reports.assets', category: 'reports' },
  'Liabilities': { key: 'reports.liabilities', category: 'reports' },
  'Equity': { key: 'reports.equity', category: 'reports' },
  'Current Assets': { key: 'reports.currentAssets', category: 'reports' },
  'Fixed Assets': { key: 'reports.fixedAssets', category: 'reports' },
  'Current Liabilities': { key: 'reports.currentLiabilities', category: 'reports' },
  'Long-term Liabilities': { key: 'reports.longTermLiabilities', category: 'reports' },
  'Debit': { key: 'reports.debit', category: 'reports' },
  'Credit': { key: 'reports.credit', category: 'reports' },
  'Operating Activities': { key: 'reports.operatingActivities', category: 'reports' },
  'Investing Activities': { key: 'reports.investingActivities', category: 'reports' },
  'Financing Activities': { key: 'reports.financingActivities', category: 'reports' },
  
  // Common
  'Add': { key: 'common.add', category: 'common' },
  'Edit': { key: 'common.edit', category: 'common' },
  'Delete': { key: 'common.delete', category: 'common' },
  'Create': { key: 'common.create', category: 'common' },
  'Update': { key: 'common.update', category: 'common' },
  'Save': { key: 'common.save', category: 'common' },
  'Cancel': { key: 'common.cancel', category: 'common' },
  'Search': { key: 'common.search', category: 'common' },
  'Filter': { key: 'common.filter', category: 'common' },
  'Export': { key: 'common.export', category: 'common' },
  'Import': { key: 'common.import', category: 'common' },
  'Print': { key: 'common.print', category: 'common' },
  'Close': { key: 'common.close', category: 'common' },
  'Back': { key: 'common.back', category: 'common' },
  'Next': { key: 'common.next', category: 'common' },
  'Previous': { key: 'common.previous', category: 'common' },
  'Submit': { key: 'common.submit', category: 'common' },
  'Actions': { key: 'common.actions', category: 'common' },
  'Status': { key: 'common.status', category: 'common' },
  'Active': { key: 'common.active', category: 'common' },
  'Inactive': { key: 'common.inactive', category: 'common' },
  'Loading': { key: 'common.loading', category: 'common' },
  'Loading...': { key: 'common.loading', category: 'common' },
  'No Data': { key: 'common.noData', category: 'common' },
  'No data available': { key: 'common.noData', category: 'common' },
  'Error': { key: 'common.error', category: 'common' },
  'Success': { key: 'common.success', category: 'common' },
  'Warning': { key: 'common.warning', category: 'common' },
  'Name': { key: 'common.name', category: 'common' },
  'Description': { key: 'common.description', category: 'common' },
  'Date': { key: 'common.date', category: 'common' },
  'Amount': { key: 'common.amount', category: 'common' },
  'Total': { key: 'common.total', category: 'common' },
  'Subtotal': { key: 'common.subtotal', category: 'common' },
  'Tax': { key: 'common.tax', category: 'common' },
  'Reference': { key: 'common.reference', category: 'common' },
  'Type': { key: 'common.type', category: 'common' },
  'Category': { key: 'common.category', category: 'common' },
  'Details': { key: 'common.details', category: 'common' },
  'View': { key: 'common.view', category: 'common' },
  'View All': { key: 'common.viewAll', category: 'common' },
  'Try Again': { key: 'common.tryAgain', category: 'common' },
  'Pending': { key: 'common.pending', category: 'common' },
  'Completed': { key: 'common.completed', category: 'common' },
  'Failed': { key: 'common.failed', category: 'common' },
  'Yes': { key: 'common.yes', category: 'common' },
  'No': { key: 'common.no', category: 'common' },
  'All': { key: 'common.all', category: 'common' },
  'Select': { key: 'common.select', category: 'common' },
  'Settings': { key: 'common.settings', category: 'common' },
  'Language': { key: 'common.language', category: 'common' },
  'Theme': { key: 'common.theme', category: 'common' },
  'Users': { key: 'common.users', category: 'common' },
  'User': { key: 'common.user', category: 'common' },
  'Email': { key: 'common.email', category: 'common' },
  'Password': { key: 'common.password', category: 'common' },
  'Role': { key: 'common.role', category: 'common' },
  'Admin': { key: 'common.admin', category: 'common' },
  'Permissions': { key: 'common.permissions', category: 'common' },
};

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applySmartTranslation(content, filePath) {
  let modified = content;
  let changeCount = 0;
  const appliedTranslations = [];
  
  // 1. Add import if not present
  if (!modified.includes('useTranslation')) {
    const importRegex = /^import .+ from ['"]react['"];?\s*$/m;
    const match = modified.match(importRegex);
    if (match) {
      modified = modified.replace(
        match[0],
        match[0] + "\nimport { useTranslation } from 'react-i18next';"
      );
      changeCount++;
    }
  }
  
  // 2. Add hook if not present
  if (!modified.includes('const { t } = useTranslation()')) {
    // Find function component
    const functionRegex = /export default function \w+\(\) \{/;
    const match = modified.match(functionRegex);
    if (match) {
      modified = modified.replace(
        match[0],
        match[0] + "\n  const { t } = useTranslation();"
      );
      changeCount++;
    }
  }
  
  // 3. Replace English texts SAFELY
  // Sort by length (longest first) to avoid partial replacements
  const sortedEntries = Object.entries(translationMap).sort((a, b) => b[0].length - a[0].length);
  
  for (const [english, translation] of sortedEntries) {
    const escaped = escapeRegex(english);
    
    // Pattern 1: JSX text content ONLY (not in attributes)
    // >{English Text}<
    const jsxPattern = new RegExp(`>([\\s]*)(${escaped})([\\s]*)<`, 'g');
    const jsxMatches = modified.match(jsxPattern);
    if (jsxMatches) {
      modified = modified.replace(jsxPattern, (match, ws1, text, ws2) => {
        // Check if this is inside an attribute (simple heuristic)
        const beforeMatch = modified.substring(0, modified.indexOf(match));
        const lastOpenTag = beforeMatch.lastIndexOf('<');
        const lastCloseTag = beforeMatch.lastIndexOf('>');
        
        if (lastOpenTag > lastCloseTag) {
          // We're inside a tag (attribute area), skip
          return match;
        }
        
        appliedTranslations.push({ english, key: translation.key, type: 'JSX content' });
        return `>${ws1}{t('${translation.key}')}${ws2}<`;
      });
      changeCount++;
    }
    
    // Pattern 2: String literals in labels/titles (NOT in data-label or className)
    // title="English Text" or label="English Text" or placeholder="English Text"
    const labelPattern = new RegExp(`(title|label|placeholder)=["'](${escaped})["']`, 'g');
    const labelMatches = modified.match(labelPattern);
    if (labelMatches) {
      modified = modified.replace(labelPattern, (match, attr, text) => {
        appliedTranslations.push({ english, key: translation.key, type: `${attr} attribute` });
        return `${attr}={t('${translation.key}')}`;
      });
      changeCount++;
    }
  }
  
  return { modified, changeCount, appliedTranslations };
}

async function main() {
  console.log('🚀 Smart Auto I18n Apply - Starting...\n');
  console.log('═══════════════════════════════════════\n');
  
  let totalChanges = 0;
  let filesModified = 0;
  
  for (const result of analysisResults) {
    if (!result.needsTranslation) {
      console.log(`⏭️  Skipping ${result.filePath} (already translated)`);
      continue;
    }
    
    console.log(`\n🔧 Processing: ${result.filePath}`);
    
    const fullPath = path.join(path.dirname(__dirname), result.filePath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    const { modified, changeCount, appliedTranslations } = applySmartTranslation(content, result.filePath);
    
    if (changeCount > 0) {
      // Save backup
      const backupPath = fullPath + '.backup2';
      fs.writeFileSync(backupPath, content);
      
      // Save modified file
      fs.writeFileSync(fullPath, modified);
      
      console.log(`   ✅ Applied ${changeCount} translation groups`);
      console.log(`   📝 Total translations: ${appliedTranslations.length}`);
      console.log(`   💾 Backup saved to: ${backupPath}`);
      
      totalChanges += appliedTranslations.length;
      filesModified++;
    } else {
      console.log(`   ⚠️  No changes applied`);
    }
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('📊 COMPLETION SUMMARY\n');
  console.log(`✅ Files modified: ${filesModified}`);
  console.log(`📝 Total translations applied: ${totalChanges}`);
  console.log(`\n💡 Next Steps:`);
  console.log(`   1. Review the changes`);
  console.log(`   2. Run: npm run dev`);
  console.log(`   3. Test all pages in Arabic`);
  console.log(`\n⚠️  Backup files created (.backup2) - delete after testing`);
}

main().catch(console.error);
