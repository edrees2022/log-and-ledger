/**
 * Auto I18n Apply Script - يطبق الترجمات تلقائياً
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// قراءة تقرير التحليل
const reportPath = path.join(__dirname, 'i18n-analysis-report.json');

if (!fs.existsSync(reportPath)) {
  console.error('❌ Error: Run auto-i18n.js first to generate analysis report');
  process.exit(1);
}

const analysisResults = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

// القاموس الشامل للترجمات
const translationMap = {
  // Banking Module
  'Payments': { key: 'banking.payments', ar: 'المدفوعات' },
  'Receipts': { key: 'banking.receipts', ar: 'المقبوضات' },
  'Bank Accounts': { key: 'banking.bankAccount', ar: 'الحسابات البنكية' },
  'Add Payment': { key: 'banking.addPayment', ar: 'إضافة دفعة' },
  'Add Receipt': { key: 'banking.addReceipt', ar: 'إضافة إيصال' },
  'Payment Date': { key: 'banking.paymentDate', ar: 'تاريخ الدفع' },
  'Receipt Date': { key: 'banking.receiptDate', ar: 'تاريخ الإيصال' },
  'Payment Method': { key: 'banking.paymentMethod', ar: 'طريقة الدفع' },
  'Bank Account': { key: 'banking.bankAccount', ar: 'الحساب البنكي' },
  'Cash': { key: 'banking.cash', ar: 'نقداً' },
  'Check': { key: 'banking.check', ar: 'شيك' },
  'Bank Transfer': { key: 'banking.bankTransfer', ar: 'تحويل بنكي' },
  'Credit Card': { key: 'banking.creditCard', ar: 'بطاقة ائتمان' },
  
  // Sales Module
  'Invoices': { key: 'sales.invoices', ar: 'الفواتير' },
  'Sales Orders': { key: 'sales.orders', ar: 'أوامر البيع' },
  'Quotations': { key: 'sales.quotations', ar: 'عروض الأسعار' },
  'Credit Notes': { key: 'sales.creditNotes', ar: 'إشعارات الائتمان' },
  'Add Invoice': { key: 'sales.addInvoice', ar: 'إضافة فاتورة' },
  'Invoice Number': { key: 'sales.invoiceNumber', ar: 'رقم الفاتورة' },
  'Customer': { key: 'sales.customerName', ar: 'العميل' },
  'Customer Name': { key: 'sales.customerName', ar: 'اسم العميل' },
  'Due Date': { key: 'sales.dueDate', ar: 'تاريخ الاستحقاق' },
  'Issue Date': { key: 'sales.issueDate', ar: 'تاريخ الإصدار' },
  'Draft': { key: 'sales.draft', ar: 'مسودة' },
  'Sent': { key: 'sales.sent', ar: 'مرسل' },
  'Paid': { key: 'sales.paid', ar: 'مدفوع' },
  'Unpaid': { key: 'sales.unpaid', ar: 'غير مدفوع' },
  'Overdue': { key: 'sales.overdue', ar: 'متأخر' },
  'Partial': { key: 'sales.partial', ar: 'جزئي' },
  
  // Purchases Module
  'Bills': { key: 'purchases.bills', ar: 'الفواتير الواردة' },
  'Purchase Orders': { key: 'purchases.orders', ar: 'أوامر الشراء' },
  'Debit Notes': { key: 'purchases.debitNotes', ar: 'إشعارات الخصم' },
  'Expenses': { key: 'purchases.expenses', ar: 'المصروفات' },
  'Add Bill': { key: 'purchases.addBill', ar: 'إضافة فاتورة واردة' },
  'Add Expense': { key: 'purchases.addExpense', ar: 'إضافة مصروف' },
  'Supplier': { key: 'purchases.supplierName', ar: 'المورد' },
  'Supplier Name': { key: 'purchases.supplierName', ar: 'اسم المورد' },
  'Bill Number': { key: 'purchases.billNumber', ar: 'رقم الفاتورة' },
  'Expense Category': { key: 'purchases.expenseCategory', ar: 'فئة المصروف' },
  
  // Reports Module
  'Tax Reports': { key: 'reports.taxReports', ar: 'التقارير الضريبية' },
  'Balance Sheet': { key: 'reports.balanceSheet', ar: 'الميزانية العمومية' },
  'Profit & Loss': { key: 'reports.profitLoss', ar: 'قائمة الدخل' },
  'Trial Balance': { key: 'reports.trialBalance', ar: 'ميزان المراجعة' },
  'Cash Flow': { key: 'reports.cashFlow', ar: 'قائمة التدفقات النقدية' },
  'Inventory Report': { key: 'reports.inventory', ar: 'تقرير المخزون' },
  'This Month': { key: 'reports.thisMonth', ar: 'هذا الشهر' },
  'This Quarter': { key: 'reports.thisQuarter', ar: 'هذا الربع' },
  'This Year': { key: 'reports.thisYear', ar: 'هذه السنة' },
  'Custom Range': { key: 'reports.customRange', ar: 'نطاق مخصص' },
  
  // Common
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
};

function applyTranslation(content, filePath) {
  let modified = content;
  let changeCount = 0;
  
  // 1. أضف import إذا لم يكن موجوداً
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
  
  // 2. أضف hook إذا لم يكن موجوداً
  if (!modified.includes('useTranslation()')) {
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
  
  // 3. استبدل النصوص الإنجليزية
  Object.entries(translationMap).forEach(([english, translation]) => {
    // استبدل في JSX: >{English Text}<
    const jsxRegex = new RegExp(`>\\s*${english}\\s*<`, 'g');
    const jsxReplacement = `>{t('${translation.key}')}<`;
    if (modified.match(jsxRegex)) {
      modified = modified.replace(jsxRegex, jsxReplacement);
      changeCount++;
    }
    
    // استبدل في strings: "English Text"
    const stringRegex = new RegExp(`["']${english}["']`, 'g');
    const stringReplacement = `t('${translation.key}')`;
    if (modified.match(stringRegex)) {
      modified = modified.replace(stringRegex, stringReplacement);
      changeCount++;
    }
  });
  
  return { modified, changeCount };
}

async function main() {
  console.log('🚀 Auto I18n Apply - Starting...\n');
  console.log('═══════════════════════════════════════\n');
  
  let totalChanges = 0;
  let filesModified = 0;
  
  // معالجة كل ملف
  for (const result of analysisResults) {
    if (!result.needsTranslation) {
      console.log(`⏭️  Skipping ${result.filePath} (already translated)`);
      continue;
    }
    
    console.log(`\n🔧 Processing: ${result.filePath}`);
    
    const fullPath = path.join(path.dirname(__dirname), result.filePath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    const { modified, changeCount } = applyTranslation(content, result.filePath);
    
    if (changeCount > 0) {
      // حفظ نسخة احتياطية
      const backupPath = fullPath + '.backup';
      fs.writeFileSync(backupPath, content);
      
      // حفظ الملف المعدل
      fs.writeFileSync(fullPath, modified);
      
      console.log(`   ✅ Applied ${changeCount} translations`);
      console.log(`   💾 Backup saved to: ${backupPath}`);
      
      totalChanges += changeCount;
      filesModified++;
    } else {
      console.log(`   ⚠️  No changes applied`);
    }
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('📊 COMPLETION SUMMARY\n');
  console.log(`✅ Files modified: ${filesModified}`);
  console.log(`📝 Total translations applied: ${totalChanges}`);
  console.log('\n💡 Next Steps:');
  console.log('   1. Review the changes');
  console.log('   2. Run: npm run dev');
  console.log('   3. Test all pages in Arabic\n');
  console.log('⚠️  Backup files created (.backup) - delete after testing\n');
}

main().catch(console.error);
