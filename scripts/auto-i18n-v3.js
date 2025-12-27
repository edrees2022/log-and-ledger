import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// قراءة تحليل الملفات
const analysisPath = path.join(__dirname, 'i18n-analysis-report.json');
const analysisResults = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));

// Enhanced translation map with context-aware patterns
const translationMap = {
  // Validation Messages
  'Account name must be at least 2 characters': { key: 'validation.accountNameMin', ar: 'اسم الحساب يجب أن يكون حرفين على الأقل' },
  'Account number is required': { key: 'validation.accountNumberRequired', ar: 'رقم الحساب مطلوب' },
  'Bank name is required': { key: 'validation.bankNameRequired', ar: 'اسم البنك مطلوب' },
  'Failed to load': { key: 'common.failedToLoad', ar: 'فشل التحميل' },
  'Error loading': { key: 'common.errorLoading', ar: 'خطأ في التحميل' },
  'Please try refreshing the page': { key: 'common.tryRefresh', ar: 'يرجى تحديث الصفحة' },
  'Failed to load payments': { key: 'banking.failedToLoadPayments', ar: 'فشل تحميل المدفوعات' },
  'Failed to load receipts': { key: 'banking.failedToLoadReceipts', ar: 'فشل تحميل المقبوضات' },
  'Failed to load quotations': { key: 'sales.failedToLoadQuotations', ar: 'فشل تحميل عروض الأسعار' },
  'Failed to load invoices': { key: 'sales.failedToLoadInvoices', ar: 'فشل تحميل الفواتير' },
  'Error loading invoices': { key: 'sales.errorLoadingInvoices', ar: 'خطأ في تحميل الفواتير' },
  'Error loading bills': { key: 'purchases.errorLoadingBills', ar: 'خطأ في تحميل الفواتير' },
  'Error loading balance sheet data': { key: 'reports.errorLoadingBalanceSheet', ar: 'خطأ في تحميل بيانات الميزانية' },
  'Failed to load balance sheet data': { key: 'reports.failedToLoadBalanceSheet', ar: 'فشل تحميل بيانات الميزانية' },
  'Error loading cash flow data': { key: 'reports.errorLoadingCashFlow', ar: 'خطأ في تحميل بيانات التدفق النقدي' },
  'Error loading accounts': { key: 'banking.errorLoadingAccounts', ar: 'خطأ في تحميل الحسابات' },
  
  // Banking - Detailed
  'Bank Accounts': { key: 'banking.bankAccounts', ar: 'الحسابات البنكية' },
  'Payments': { key: 'banking.payments', ar: 'المدفوعات' },
  'Receipts': { key: 'banking.receipts', ar: 'المقبوضات' },
  'Create New Payment': { key: 'banking.createNewPayment', ar: 'إنشاء دفعة جديدة' },
  'Create New Receipt': { key: 'banking.createNewReceipt', ar: 'إنشاء إيصال جديد' },
  'Total Payments': { key: 'banking.totalPayments', ar: 'إجمالي المدفوعات' },
  'Total Receipts': { key: 'banking.totalReceipts', ar: 'إجمالي المقبوضات' },
  'All Payments': { key: 'banking.allPayments', ar: 'جميع المدفوعات' },
  'All Receipts': { key: 'banking.allReceipts', ar: 'جميع المقبوضات' },
  'Payment Date': { key: 'banking.paymentDate', ar: 'تاريخ الدفع' },
  'Receipt Date': { key: 'banking.receiptDate', ar: 'تاريخ الإيصال' },
  'Payment Method': { key: 'banking.paymentMethod', ar: 'طريقة الدفع' },
  'Payment Amount': { key: 'banking.paymentAmount', ar: 'مبلغ الدفعة' },
  'Receipt Amount': { key: 'banking.receiptAmount', ar: 'مبلغ الإيصال' },
  'Bank Transfer': { key: 'banking.bankTransfer', ar: 'تحويل بنكي' },
  'Online Payment': { key: 'common.onlinePayment', ar: 'دفع إلكتروني' },
  'Checking Account': { key: 'banking.checkingAccount', ar: 'حساب جاري' },
  'Savings Account': { key: 'banking.savingsAccountType', ar: 'حساب توفير' },
  'Credit Card': { key: 'banking.creditCard', ar: 'بطاقة ائتمان' },
  'Investment': { key: 'banking.investment', ar: 'استثمار' },
  'Branch': { key: 'banking.branch', ar: 'الفرع' },
  'SWIFT Code': { key: 'banking.swiftCode', ar: 'رمز SWIFT' },
  'IBAN': { key: 'banking.iban', ar: 'رقم IBAN' },
  'Opening Balance': { key: 'banking.openingBalance', ar: 'الرصيد الافتتاحي' },
  'Current Balance': { key: 'banking.currentBalance', ar: 'الرصيد الحالي' },
  'Is Active': { key: 'banking.isActive', ar: 'نشط' },
  'Is Default': { key: 'banking.isDefault', ar: 'افتراضي' },
  'Account Number': { key: 'banking.accountNumber', ar: 'رقم الحساب' },
  'Bank Name': { key: 'banking.bankName', ar: 'اسم البنك' },
  'Account Type': { key: 'banking.accountType', ar: 'نوع الحساب' },
  'Currency': { key: 'common.currency', ar: 'العملة' },
  'Check': { key: 'common.check', ar: 'شيك' },
  'Cash': { key: 'banking.cash', ar: 'نقداً' },
  'Method': { key: 'common.method', ar: 'الطريقة' },
  'Today': { key: 'common.today', ar: 'اليوم' },
  'Collected': { key: 'common.collected', ar: 'محصّل' },
  'Scheduled': { key: 'common.scheduled', ar: 'مجدول' },
  'Please select a vendor': { key: 'common.pleaseSelectVendor', ar: 'يرجى اختيار المورد' },
  'Please select a customer': { key: 'common.pleaseSelectCustomer', ar: 'يرجى اختيار العميل' },
  
  // Sales - Comprehensive
  'Sales Invoices': { key: 'sales.salesInvoices', ar: 'فواتير المبيعات' },
  'Sales Orders': { key: 'sales.salesOrders', ar: 'طلبات البيع' },
  'Quotations': { key: 'sales.quotations', ar: 'عروض الأسعار' },
  'Credit Notes': { key: 'sales.creditNotes', ar: 'إشعارات الائتمان' },
  'Recurring Invoices': { key: 'sales.recurringInvoices', ar: 'الفواتير المتكررة' },
  'Total Invoices': { key: 'sales.totalInvoices', ar: 'إجمالي الفواتير' },
  'Total Amount': { key: 'common.totalAmount', ar: 'المبلغ الإجمالي' },
  'Paid Amount': { key: 'sales.paidAmount', ar: 'المبلغ المدفوع' },
  'Create New Invoice': { key: 'sales.createNewInvoice', ar: 'إنشاء فاتورة جديدة' },
  'Create New Sales Order': { key: 'sales.createNewOrder', ar: 'إنشاء طلب بيع جديد' },
  'Create New Quotation': { key: 'sales.createNewQuotation', ar: 'إنشاء عرض سعر جديد' },
  'Create New Credit Note': { key: 'sales.createNewCreditNote', ar: 'إنشاء إشعار ائتمان جديد' },
  'Create Recurring Invoice Template': { key: 'sales.createRecurringTemplate', ar: 'إنشاء قالب فاتورة متكررة' },
  'Template Name': { key: 'sales.templateName', ar: 'اسم القالب' },
  'Frequency': { key: 'sales.frequency', ar: 'التكرار' },
  'Related Invoice': { key: 'sales.relatedInvoice', ar: 'الفاتورة المرتبطة' },
  'Delivery Date': { key: 'sales.deliveryDate', ar: 'تاريخ التسليم' },
  'Customer Name': { key: 'sales.customerName', ar: 'اسم العميل' },
  'Customer': { key: 'common.customer', ar: 'العميل' },
  'Invoice Number': { key: 'sales.invoiceNumber', ar: 'رقم الفاتورة' },
  'Issue Date': { key: 'sales.issueDate', ar: 'تاريخ الإصدار' },
  'Due Date': { key: 'sales.dueDate', ar: 'تاريخ الاستحقاق' },
  'Order Date': { key: 'common.orderDate', ar: 'تاريخ الطلب' },
  
  // Purchases - Comprehensive
  'Bills': { key: 'purchases.bills', ar: 'الفواتير الواردة' },
  'Purchase Orders': { key: 'purchases.orders', ar: 'أوامر الشراء' },
  'Expenses': { key: 'purchases.expenses', ar: 'المصروفات' },
  'Debit Notes': { key: 'purchases.debitNotes', ar: 'إشعارات الخصم' },
  'Create New Bill': { key: 'purchases.createNewBill', ar: 'إنشاء فاتورة واردة جديدة' },
  'Create New Purchase Order': { key: 'purchases.createNewPurchaseOrder', ar: 'إنشاء أمر شراء جديد' },
  'Create New Expense': { key: 'purchases.createNewExpense', ar: 'إنشاء مصروف جديد' },
  'Create New Debit Note': { key: 'purchases.createNewDebitNote', ar: 'إنشاء إشعار خصم جديد' },
  'Supplier Reference': { key: 'purchases.supplierReference', ar: 'مرجع المورد' },
  'Expected Delivery': { key: 'purchases.expectedDelivery', ar: 'التسليم المتوقع' },
  'Related Bill': { key: 'purchases.relatedBill', ar: 'الفاتورة المرتبطة' },
  'Vendor': { key: 'purchases.vendor', ar: 'المورد' },
  'Supplier': { key: 'common.supplier', ar: 'المورد' },
  'Supplier Name': { key: 'purchases.supplierName', ar: 'اسم المورد' },
  'Bill Number': { key: 'purchases.billNumber', ar: 'رقم الفاتورة' },
  'Bill Date': { key: 'purchases.billDate', ar: 'تاريخ الفاتورة' },
  'Expense Category': { key: 'purchases.expenseCategory', ar: 'فئة المصروف' },
  
  // Reports - Comprehensive
  'Balance Sheet': { key: 'reports.balanceSheet', ar: 'الميزانية العمومية' },
  'Trial Balance': { key: 'reports.trialBalance', ar: 'ميزان المراجعة' },
  'This Month': { key: 'reports.thisMonth', ar: 'هذا الشهر' },
  'This Quarter': { key: 'reports.thisQuarter', ar: 'هذا الربع' },
  'This Year': { key: 'reports.thisYear', ar: 'هذه السنة' },
  'Last Month': { key: 'reports.lastMonth', ar: 'الشهر الماضي' },
  'Custom Range': { key: 'reports.customRange', ar: 'نطاق مخصص' },
  'Custom Date': { key: 'reports.customDate', ar: 'تاريخ مخصص' },
  'Current Period': { key: 'reports.currentPeriod', ar: 'الفترة الحالية' },
  'Previous Period': { key: 'reports.previousPeriod', ar: 'الفترة السابقة' },
  'Year End': { key: 'reports.yearEnd', ar: 'نهاية السنة' },
  'Current Month': { key: 'reports.currentMonth', ar: 'الشهر الحالي' },
  'Total Revenue': { key: 'reports.totalRevenue', ar: 'إجمالي الإيرادات' },
  'Inventory Report': { key: 'reports.inventoryReport', ar: 'تقرير المخزون' },
  'Add New Inventory Item': { key: 'reports.addNewInventoryItem', ar: 'إضافة صنف جديد' },
  'Product Name': { key: 'reports.productName', ar: 'اسم المنتج' },
  'Cash Flow Statement': { key: 'reports.cashFlowStatement', ar: 'قائمة التدفقات النقدية' },
  'Debit': { key: 'reports.debit', ar: 'مدين' },
  'Credit': { key: 'reports.credit', ar: 'دائن' },
  
  // Settings - Comprehensive
  'General Settings': { key: 'settings.general', ar: 'الإعدادات العامة' },
  'Language Settings': { key: 'settings.language', ar: 'إعدادات اللغة' },
  'Language Configuration': { key: 'settings.languageConfig', ar: 'تكوين اللغة' },
  'Default Language': { key: 'settings.defaultLanguage', ar: 'اللغة الافتراضية' },
  'Fallback Language': { key: 'settings.fallbackLanguage', ar: 'اللغة البديلة' },
  'Available Languages': { key: 'settings.availableLanguages', ar: 'اللغات المتاحة' },
  'Total Users': { key: 'settings.totalUsers', ar: 'إجمالي المستخدمين' },
  'Active Users': { key: 'settings.activeUsers', ar: 'المستخدمون النشطون' },
  'Last Activity': { key: 'settings.lastActivity', ar: 'آخر نشاط' },
  'Company': { key: 'settings.company', ar: 'الشركة' },
  'Regional': { key: 'settings.regional', ar: 'الإقليمية' },
  'Invoice': { key: 'settings.invoice', ar: 'الفاتورة' },
  'Notifications': { key: 'settings.notifications', ar: 'الإشعارات' },
  
  // Common Actions & UI
  'Add': { key: 'common.add', ar: 'إضافة' },
  'Edit': { key: 'common.edit', ar: 'تعديل' },
  'Delete': { key: 'common.delete', ar: 'حذف' },
  'Create': { key: 'common.create', ar: 'إنشاء' },
  'Update': { key: 'common.update', ar: 'تحديث' },
  'Save': { key: 'common.save', ar: 'حفظ' },
  'Cancel': { key: 'common.cancel', ar: 'إلغاء' },
  'Search': { key: 'common.search', ar: 'بحث' },
  'Filter': { key: 'common.filter', ar: 'تصفية' },
  'Export': { key: 'common.export', ar: 'تصدير' },
  'Import': { key: 'common.import', ar: 'استيراد' },
  'Print': { key: 'common.print', ar: 'طباعة' },
  'Close': { key: 'common.close', ar: 'إغلاق' },
  'Back': { key: 'common.back', ar: 'رجوع' },
  'Next': { key: 'common.next', ar: 'التالي' },
  'Previous': { key: 'common.previous', ar: 'السابق' },
  'Submit': { key: 'common.submit', ar: 'إرسال' },
  'Actions': { key: 'common.actions', ar: 'الإجراءات' },
  'Status': { key: 'common.status', ar: 'الحالة' },
  'Active': { key: 'common.active', ar: 'نشط' },
  'Inactive': { key: 'common.inactive', ar: 'غير نشط' },
  'Loading': { key: 'common.loading', ar: 'جاري التحميل...' },
  'Loading...': { key: 'common.loading', ar: 'جاري التحميل...' },
  'No Data': { key: 'common.noData', ar: 'لا توجد بيانات' },
  'No data available': { key: 'common.noData', ar: 'لا توجد بيانات' },
  'Error': { key: 'common.error', ar: 'خطأ' },
  'Success': { key: 'common.success', ar: 'نجح' },
  'Warning': { key: 'common.warning', ar: 'تحذير' },
  'Name': { key: 'common.name', ar: 'الاسم' },
  'Description': { key: 'common.description', ar: 'الوصف' },
  'Date': { key: 'common.date', ar: 'التاريخ' },
  'Amount': { key: 'common.amount', ar: 'المبلغ' },
  'Total': { key: 'common.total', ar: 'الإجمالي' },
  'Subtotal': { key: 'common.subtotal', ar: 'المجموع الفرعي' },
  'Tax': { key: 'common.tax', ar: 'الضريبة' },
  'Reference': { key: 'common.reference', ar: 'المرجع' },
  'Type': { key: 'common.type', ar: 'النوع' },
  'Category': { key: 'common.category', ar: 'الفئة' },
  'Details': { key: 'common.details', ar: 'التفاصيل' },
  'View': { key: 'common.view', ar: 'عرض' },
  'View All': { key: 'common.viewAll', ar: 'عرض الكل' },
  'Try Again': { key: 'common.tryAgain', ar: 'حاول مرة أخرى' },
  'Pending': { key: 'common.pending', ar: 'معلق' },
  'Completed': { key: 'common.completed', ar: 'مكتمل' },
  'Failed': { key: 'common.failed', ar: 'فشل' },
  'Yes': { key: 'common.yes', ar: 'نعم' },
  'No': { key: 'common.no', ar: 'لا' },
  'All': { key: 'common.all', ar: 'الكل' },
  'Select': { key: 'common.select', ar: 'اختر' },
  'User': { key: 'common.user', ar: 'المستخدم' },
  'Users': { key: 'settings.users', ar: 'إدارة المستخدمين' },
  'Email': { key: 'common.email', ar: 'البريد الإلكتروني' },
  'Password': { key: 'common.password', ar: 'كلمة المرور' },
  'Role': { key: 'common.role', ar: 'الدور' },
  'Roles': { key: 'common.roles', ar: 'الأدوار' },
  'Admin': { key: 'common.admin', ar: 'مدير' },
  'Permissions': { key: 'common.permissions', ar: 'الصلاحيات' },
  'SKU': { key: 'common.sku', ar: 'رمز المنتج' },
  'Order': { key: 'common.order', ar: 'الطلب' },
  'Notes': { key: 'common.notes', ar: 'ملاحظات' },
  'Quantity': { key: 'common.quantity', ar: 'الكمية' },
  'Price': { key: 'common.price', ar: 'السعر' },
  'Unit Price': { key: 'common.unitPrice', ar: 'سعر الوحدة' },
  'Discount': { key: 'common.discount', ar: 'الخصم' },
  'Balance': { key: 'common.balance', ar: 'الرصيد' },
};

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyAdvancedTranslation(content, filePath) {
  let modified = content;
  let changeCount = 0;
  const appliedTranslations = [];
  const stats = {
    jsxContent: 0,
    titleAttr: 0,
    labelAttr: 0,
    placeholderAttr: 0,
    stringLiterals: 0,
  };
  
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
    const functionRegex = /export default function \w+\([^)]*\) \{/;
    const match = modified.match(functionRegex);
    if (match) {
      modified = modified.replace(
        match[0],
        match[0] + "\n  const { t } = useTranslation();"
      );
      changeCount++;
    }
  }
  
  // 3. Sort by length (longest first) to avoid partial replacements
  const sortedEntries = Object.entries(translationMap).sort((a, b) => b[0].length - a[0].length);
  
  for (const [english, translation] of sortedEntries) {
    const escaped = escapeRegex(english);
    
    // Pattern 1: JSX text content >{Text}<
    // Match with optional whitespace and newlines
    const jsxPattern = new RegExp(`>([\\s\\n]*)(${escaped})([\\s\\n]*)<`, 'gm');
    const matches = modified.match(jsxPattern);
    
    if (matches) {
      for (const match of matches) {
        const matchStart = modified.indexOf(match);
        if (matchStart === -1) continue;
        
        const beforeMatch = modified.substring(Math.max(0, matchStart - 150), matchStart);
        
        // Skip if inside an attribute - check for = or quotes before >
        const lastEquals = beforeMatch.lastIndexOf('=');
        const lastGT = beforeMatch.lastIndexOf('>');
        const lastQuote = Math.max(beforeMatch.lastIndexOf('"'), beforeMatch.lastIndexOf("'"));
        
        // If = or quote appears after last >, we're in an attribute
        if (lastEquals > lastGT || lastQuote > lastGT) {
          continue;
        }
        
        // Extract whitespace
        const wsMatch = match.match(/>([\\s\\n]*)(.*?)([\\s\\n]*)</);
        if (wsMatch) {
          const [, ws1, , ws2] = wsMatch;
          const replacement = `>${ws1}{t('${translation.key}')}${ws2}<`;
          modified = modified.substring(0, matchStart) + replacement + modified.substring(matchStart + match.length);
          
          appliedTranslations.push({ english, key: translation.key, type: 'JSX content' });
          stats.jsxContent++;
          changeCount++;
        }
      }
    }
    
    // Pattern 2: title attribute
    const titlePattern = new RegExp(`title=["']${escaped}["']`, 'g');
    if (modified.match(titlePattern)) {
      modified = modified.replace(titlePattern, `title={t('${translation.key}')}`);
      appliedTranslations.push({ english, key: translation.key, type: 'title attribute' });
      stats.titleAttr++;
      changeCount++;
    }
    
    // Pattern 3: label attribute
    const labelPattern = new RegExp(`label=["']${escaped}["']`, 'g');
    if (modified.match(labelPattern)) {
      modified = modified.replace(labelPattern, `label={t('${translation.key}')}`);
      appliedTranslations.push({ english, key: translation.key, type: 'label attribute' });
      stats.labelAttr++;
      changeCount++;
    }
    
    // Pattern 4: placeholder attribute
    const placeholderPattern = new RegExp(`placeholder=["']${escaped}["']`, 'g');
    if (modified.match(placeholderPattern)) {
      modified = modified.replace(placeholderPattern, `placeholder={t('${translation.key}')}`);
      appliedTranslations.push({ english, key: translation.key, type: 'placeholder attribute' });
      stats.placeholderAttr++;
      changeCount++;
    }
    
    // Pattern 5: String literals in arrays/objects (e.g., status config)
    // label: "Text" or label: 'Text'
    const labelColonPattern = new RegExp(`label:\\s*["']${escaped}["']`, 'g');
    if (modified.match(labelColonPattern)) {
      modified = modified.replace(labelColonPattern, `label: t('${translation.key}')`);
      appliedTranslations.push({ english, key: translation.key, type: 'object label' });
      stats.stringLiterals++;
      changeCount++;
    }
  }
  
  return { modified, changeCount, appliedTranslations, stats };
}

// Extract unique translation keys to add to JSON
function extractMissingKeys(appliedTranslations) {
  const keysByCategory = {
    validation: [],
    banking: [],
    sales: [],
    purchases: [],
    reports: [],
    settings: [],
    common: [],
  };
  
  const uniqueKeys = new Set();
  
  for (const trans of appliedTranslations) {
    if (!uniqueKeys.has(trans.key)) {
      uniqueKeys.add(trans.key);
      const category = trans.key.split('.')[0];
      const keyName = trans.key.split('.')[1];
      
      if (keysByCategory[category]) {
        keysByCategory[category].push({
          key: keyName,
          fullKey: trans.key,
          english: trans.english,
        });
      }
    }
  }
  
  return keysByCategory;
}

async function main() {
  console.log('🚀 Advanced Auto I18n Apply - Starting...\n');
  console.log('═══════════════════════════════════════\n');
  
  let totalChanges = 0;
  let filesModified = 0;
  const allAppliedTranslations = [];
  const globalStats = {
    jsxContent: 0,
    titleAttr: 0,
    labelAttr: 0,
    placeholderAttr: 0,
    stringLiterals: 0,
  };
  
  for (const result of analysisResults) {
    // Process all files regardless of needsTranslation flag
    // to catch remaining English texts
    
    console.log(`\n🔧 Processing: ${result.filePath}`);
    
    const fullPath = path.join(path.dirname(__dirname), result.filePath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    const { modified, changeCount, appliedTranslations, stats } = applyAdvancedTranslation(content, result.filePath);
    
    if (changeCount > 0) {
      // Save backup
      const backupPath = fullPath + '.backup-v3';
      fs.writeFileSync(backupPath, content);
      
      // Save modified file
      fs.writeFileSync(fullPath, modified);
      
      console.log(`   ✅ Applied ${changeCount} translation patterns`);
      console.log(`   📝 Breakdown:`);
      console.log(`      - JSX Content: ${stats.jsxContent}`);
      console.log(`      - Title Attrs: ${stats.titleAttr}`);
      console.log(`      - Label Attrs: ${stats.labelAttr}`);
      console.log(`      - Placeholder: ${stats.placeholderAttr}`);
      console.log(`      - String Literals: ${stats.stringLiterals}`);
      console.log(`   💾 Backup: ${path.basename(backupPath)}`);
      
      allAppliedTranslations.push(...appliedTranslations);
      totalChanges += changeCount;
      filesModified++;
      
      // Update global stats
      Object.keys(globalStats).forEach(key => {
        globalStats[key] += stats[key];
      });
    } else {
      console.log(`   ⚠️  No changes applied`);
    }
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('📊 COMPLETION SUMMARY\n');
  console.log(`✅ Files modified: ${filesModified}`);
  console.log(`📝 Total translations applied: ${totalChanges}`);
  console.log(`\n📈 Pattern Distribution:`);
  console.log(`   - JSX Content: ${globalStats.jsxContent}`);
  console.log(`   - Title Attributes: ${globalStats.titleAttr}`);
  console.log(`   - Label Attributes: ${globalStats.labelAttr}`);
  console.log(`   - Placeholder Attributes: ${globalStats.placeholderAttr}`);
  console.log(`   - String Literals: ${globalStats.stringLiterals}`);
  
  // Extract and display missing keys
  const missingKeys = extractMissingKeys(allAppliedTranslations);
  console.log(`\n🔑 Translation Keys Used:`);
  Object.entries(missingKeys).forEach(([category, keys]) => {
    if (keys.length > 0) {
      console.log(`   ${category}: ${keys.length} keys`);
    }
  });
  
  // Save detailed report
  const reportPath = path.join(__dirname, 'translation-report-v3.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    summary: {
      filesModified,
      totalChanges,
      stats: globalStats,
    },
    appliedTranslations: allAppliedTranslations,
    missingKeys,
  }, null, 2));
  console.log(`\n📄 Detailed report: ${reportPath}`);
  
  console.log(`\n💡 Next Steps:`);
  console.log(`   1. Review the changes carefully`);
  console.log(`   2. Add missing keys to translation.json`);
  console.log(`   3. Test: npm run dev`);
  console.log(`   4. Verify in Arabic mode`);
  console.log(`\n⚠️  Backup files (.backup-v3) - delete after testing`);
}

main().catch(console.error);
