/**
 * Auto I18n Script - Automatic Internationalization
 * يقوم بتعريب الصفحات تلقائياً
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// قائمة الصفحات المراد تعريبها
const pagesToTranslate = [
  // Banking
  'client/src/pages/banking/PaymentsPage.tsx',
  'client/src/pages/banking/ReceiptsPage.tsx',
  'client/src/pages/banking/AccountsPage.tsx',
  
  // Reports
  'client/src/pages/reports/ProfitLossPage.tsx',
  'client/src/pages/reports/TrialBalancePage.tsx',
  'client/src/pages/reports/BalanceSheetPage.tsx',
  'client/src/pages/reports/CashFlowPage.tsx',
  'client/src/pages/reports/InventoryPage.tsx',
  
  // Sales
  'client/src/pages/sales/InvoicesPage.tsx',
  'client/src/pages/sales/OrdersPage.tsx',
  'client/src/pages/sales/QuotationsPage.tsx',
  'client/src/pages/sales/CreditNotesPage.tsx',
  'client/src/pages/sales/RecurringInvoicesPage.tsx',
  
  // Purchases
  'client/src/pages/purchases/BillsPage.tsx',
  'client/src/pages/purchases/OrdersPage.tsx',
  'client/src/pages/purchases/ExpensesPage.tsx',
  'client/src/pages/purchases/DebitNotesPage.tsx',
  
  // Settings
  'client/src/pages/settings/GeneralSettingsPage.tsx',
  'client/src/pages/settings/LanguageSettingsPage.tsx',
  'client/src/pages/settings/UsersPage.tsx',
];

// Pattern للعثور على النصوص الإنجليزية
const patterns = {
  // JSX text content
  jsxText: />([A-Z][a-zA-Z\s]{2,})</g,
  
  // String literals in JSX
  jsxStrings: /["']([A-Z][a-zA-Z\s]{3,})["']/g,
  
  // Common UI labels
  labels: /(Add|Edit|Delete|Create|Update|Save|Cancel|Search|Filter|Export|Import|Print|Back|Next|Previous|Close|Submit|View|Details|Settings|Total|Status|Actions|Date|Amount|Description|Name|Type|Category)/g,
  
  // Status badges
  statuses: /(Draft|Pending|Paid|Unpaid|Overdue|Active|Inactive|Completed|Failed|Processing|Success|Error|Warning)/g,
};

// القاموس الافتراضي للترجمات الشائعة
const commonTranslations = {
  // Actions
  'Add': 'common.add',
  'Edit': 'common.edit',
  'Delete': 'common.delete',
  'Create': 'common.create',
  'Update': 'common.update',
  'Save': 'common.save',
  'Cancel': 'common.cancel',
  'Search': 'common.search',
  'Filter': 'common.filter',
  'Export': 'common.export',
  'Import': 'common.import',
  'Print': 'common.print',
  'Close': 'common.close',
  'Back': 'common.back',
  'Next': 'common.next',
  'Previous': 'common.previous',
  'Submit': 'common.submit',
  'View': 'common.view',
  
  // Status
  'Draft': 'sales.draft',
  'Pending': 'sales.pending',
  'Paid': 'sales.paid',
  'Unpaid': 'sales.unpaid',
  'Overdue': 'sales.overdue',
  'Active': 'common.active',
  'Inactive': 'common.inactive',
  'Success': 'common.success',
  'Error': 'common.error',
  'Warning': 'common.warning',
  
  // Common fields
  'Name': 'common.name',
  'Description': 'common.description',
  'Date': 'common.date',
  'Amount': 'common.amount',
  'Total': 'common.total',
  'Status': 'common.status',
  'Actions': 'common.actions',
  'Type': 'common.type',
  'Category': 'common.category',
  'Details': 'common.details',
  'Settings': 'settings.title',
  
  // Loading states
  'Loading': 'common.loading',
  'No Data': 'common.noData',
  'Loading data...': 'common.loading',
  
  // Buttons
  'Try Again': 'common.tryAgain',
  'View All': 'common.viewAll',
  
  // Banking
  'Payments': 'banking.payments',
  'Receipts': 'banking.receipts',
  'Bank Accounts': 'banking.bankAccount',
  'Payment': 'banking.payment',
  'Receipt': 'banking.receipt',
  
  // Sales
  'Invoices': 'sales.invoices',
  'Sales Orders': 'sales.orders',
  'Quotations': 'sales.quotations',
  'Credit Notes': 'sales.creditNotes',
  'Customer': 'sales.customerName',
  'Invoice': 'invoice.createInvoice',
  
  // Purchases
  'Bills': 'purchases.bills',
  'Purchase Orders': 'purchases.orders',
  'Debit Notes': 'purchases.debitNotes',
  'Expenses': 'purchases.expenses',
  'Supplier': 'purchases.supplierName',
  
  // Reports
  'Balance Sheet': 'reports.balanceSheet',
  'Profit & Loss': 'reports.profitLoss',
  'Trial Balance': 'reports.trialBalance',
  'Cash Flow': 'reports.cashFlow',
  'Tax Report': 'reports.tax',
  'Inventory Report': 'reports.inventory',
  
  // Settings
  'General Settings': 'settings.general',
  'Language Settings': 'settings.language',
  'Users': 'settings.users',
};

function analyzeFile(filePath) {
  console.log(`\n📄 Analyzing: ${filePath}`);
  
  const fullPath = path.join(path.dirname(__dirname), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`   ⚠️  File not found, skipping...`);
    return null;
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8');
  
  // تحقق من وجود useTranslation
  const hasUseTranslation = content.includes('useTranslation');
  
  // استخراج النصوص الإنجليزية
  const englishTexts = new Set();
  
  // JSX text content
  const jsxMatches = content.matchAll(/>([A-Z][a-zA-Z\s]{2,50})</g);
  for (const match of jsxMatches) {
    englishTexts.add(match[1].trim());
  }
  
  // String literals
  const stringMatches = content.matchAll(/["']([A-Z][a-zA-Z\s]{3,50})["']/g);
  for (const match of stringMatches) {
    if (!match[1].includes('http') && !match[1].includes('/')) {
      englishTexts.add(match[1].trim());
    }
  }
  
  const results = {
    filePath,
    hasUseTranslation,
    englishTexts: Array.from(englishTexts).slice(0, 20), // أول 20 نص
    totalTexts: englishTexts.size,
    needsTranslation: !hasUseTranslation && englishTexts.size > 0,
  };
  
  console.log(`   📊 Found ${results.totalTexts} English texts`);
  console.log(`   ${hasUseTranslation ? '✅' : '❌'} useTranslation hook`);
  
  if (results.englishTexts.length > 0) {
    console.log(`   📝 Sample texts:`);
    results.englishTexts.slice(0, 5).forEach(text => {
      console.log(`      - "${text}"`);
    });
  }
  
  return results;
}

function generateTranslationKeys(texts, moduleNamemoduleName) {
  const keys = {};
  
  texts.forEach(text => {
    // تحقق من القاموس الشائع أولاً
    if (commonTranslations[text]) {
      keys[text] = commonTranslations[text];
      return;
    }
    
    // إنشاء key جديد
    const key = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30);
    
    keys[text] = `${moduleName}.${key}`;
  });
  
  return keys;
}

function addImportIfNeeded(content) {
  if (content.includes('useTranslation')) {
    return content;
  }
  
  // أضف import في أول import statement
  const importMatch = content.match(/^import .+;$/m);
  if (importMatch) {
    const importStatement = "import { useTranslation } from 'react-i18next';\n";
    return content.replace(importMatch[0], importMatch[0] + '\n' + importStatement);
  }
  
  return content;
}

function addTranslationHook(content) {
  if (content.includes('useTranslation()')) {
    return content;
  }
  
  // أضف hook في بداية الكومبوننت
  const functionMatch = content.match(/export default function \w+\(\) \{/);
  if (functionMatch) {
    const hookStatement = "\n  const { t } = useTranslation();";
    return content.replace(functionMatch[0], functionMatch[0] + hookStatement);
  }
  
  return content;
}

// الدالة الرئيسية
async function main() {
  console.log('🚀 Auto I18n Script - Starting...\n');
  console.log('═══════════════════════════════════════\n');
  
  const results = [];
  
  // تحليل جميع الصفحات
  for (const filePath of pagesToTranslate) {
    const result = analyzeFile(filePath);
    if (result) {
      results.push(result);
    }
  }
  
  // إحصائيات
  console.log('\n═══════════════════════════════════════');
  console.log('📊 SUMMARY STATISTICS\n');
  
  const needsTranslation = results.filter(r => r.needsTranslation);
  const alreadyTranslated = results.filter(r => !r.needsTranslation);
  
  console.log(`✅ Already translated: ${alreadyTranslated.length} files`);
  console.log(`⏳ Needs translation: ${needsTranslation.length} files`);
  console.log(`📝 Total English texts found: ${results.reduce((sum, r) => sum + r.totalTexts, 0)}`);
  
  if (needsTranslation.length > 0) {
    console.log('\n⚠️  Files needing translation:');
    needsTranslation.forEach(r => {
      console.log(`   - ${r.filePath} (${r.totalTexts} texts)`);
    });
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('\n💡 Next Steps:');
  console.log('   1. Review the analysis above');
  console.log('   2. Run: node scripts/auto-i18n-apply.js (to apply translations)');
  console.log('   3. Test the application\n');
  
  // حفظ النتائج
  const reportPath = path.join(path.dirname(__dirname), 'scripts/i18n-analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 Full report saved to: ${reportPath}\n`);
}

main().catch(console.error);
