# خطة استخراج النصوص الثابتة / Hardcoded Strings Extraction Plan

## التاريخ: 2025-10-22

## الهدف
استخراج جميع النصوص الإنجليزية الثابتة من الكود وتحويلها إلى مفاتيح ترجمة i18n.

---

## 1. النصوص المكتشفة في AuthPage.tsx

### ✅ تم الإصلاح
- ~~`'Failed to sign in with Google'`~~ → تم إضافة `auth.googleLoginError`

---

## 2. النصوص المكتشفة في InvoiceForm.tsx

### Labels (التسميات)
- `"Invoice Number"` → السطر 163
- `"Invoice Date"` → السطر 172  
- `"Due Date"` → السطر 182
- `"Customer"` → السطر 203
- `"Notes & Terms"` → السطر 344

### Table Headers (رؤوس الجداول)
- `"Description"` → السطر 250
- `"Rate"` → السطر 252
- `"Tax"` → السطر 253
- `"Amount"` → السطر 254

### Placeholders
- `"Select a customer"` → السطر 206
- `"Add any additional notes or terms..."` → السطر 348

### Calculations
- `"Subtotal:"` → السطر 325
- `"Tax:"` → السطر 329
- `"Total:"` → السطر 333

### Mock Data (بيانات تجريبية - ليست أولوية)
- `"No Tax"` → السطر 55 (في taxRates)

---

## 3. النصوص المكتشفة في TaxConfiguration.tsx

### Dialog Titles
- `"Edit Tax Rate"` → السطر 309
- `"Add New Tax Rate"` → السطر 309

### Table Headers
- `"Actions"` → السطر 222

---

## 4. النصوص المكتشفة في InventoryPage.tsx

### Messages
- `"New inventory item has been added successfully."` → السطر 193
- `"Adding..."` → السطر 472
- `"Add Item"` → السطر 472

### Placeholders
- `"Select category"` → السطر 344
- `"Search by SKU or name..."` → السطر 542

### Card Titles
- `"Total Items"` → السطر 493
- `"Total Value"` → السطر 504
- `"Total Quantity"` → السطر 516

### Table Headers
- `"Total Value"` → السطر 585, 717
- `"Actions"` → السطر 587

---

## 5. النصوص المكتشفة في Reports Pages

### Loading States
- `"Loading tax data..."` → TaxPage.tsx السطر 136
- `"Loading tax reports..."` → TaxPage.tsx السطر 141
- `"Loading balance sheet data..."` → BalanceSheetPage.tsx السطر 139
- `"Loading profit & loss data..."` → ProfitLossPage.tsx السطر 135
- `"Loading cash flow data..."` → CashFlowPage.tsx السطر 110
- `"Loading cash flow statement..."` → CashFlowPage.tsx السطر 115
- `"Loading trial balance..."` → TrialBalancePage.tsx السطر 247

### Error States
- `"Error loading tax data"` → TaxPage.tsx السطر 154
- `"Error loading balance sheet data"` → BalanceSheetPage.tsx السطر 200
- `"Error loading profit & loss data"` → ProfitLossPage.tsx السطر 196
- `"Error loading cash flow data"` → CashFlowPage.tsx السطر 128

### Card Titles
- `"Total Liability"` → TaxPage.tsx السطر 287
- `"Total Sales"` → TaxPage.tsx السطر 318
- `"Total Purchases"` → TaxPage.tsx السطر 377
- `"Total Revenue"` → ProfitLossPage.tsx السطر 254
- `"Total Debits"` → TrialBalancePage.tsx السطر 180
- `"Total Credits"` → TrialBalancePage.tsx السطر 191
- `"Status"` → TrialBalancePage.tsx السطر 215

### Table Headers
- `"Amount"` → TaxPage.tsx السطور 434, 467, 519
- `"Actions"` → TaxPage.tsx السطر 521
- `"Amount (USD)"` → BalanceSheetPage.tsx السطور 334, ProfitLossPage.tsx السطر 313
- `"Previous Period"` → BalanceSheetPage.tsx السطر 336
- `"Description"` → CashFlowPage.tsx السطر 285

### Balance Sheet Specific
- `"Non-Current Assets"` → BalanceSheetPage.tsx السطر 383
- `"Total Current Liabilities"` → BalanceSheetPage.tsx السطر 449
- `"Non-Current Liabilities"` → BalanceSheetPage.tsx السطر 462
- `"Total Non-Current Liabilities"` → BalanceSheetPage.tsx السطر 480
- `"Total Liabilities"` → BalanceSheetPage.tsx السطر 490
- `"Total Equity"` → BalanceSheetPage.tsx السطر 521
- `"TOTAL LIABILITIES & EQUITY"` → BalanceSheetPage.tsx السطر 531

---

## 6. النصوص المكتشفة في Settings Pages

### GeneralSettingsPage.tsx
- `"New York"` → السطر 41 (قيمة افتراضية)

### UsersPage.tsx
- `"Edit user"` → السطر 202

### LanguageSettingsPage.tsx
- `"Add new language"` → السطر 159

---

## 7. النصوص المكتشفة في App.tsx

### Loading State
- `"Loading Log & Ledger Pro..."` → السطر 399

---

## خطة التنفيذ

### المرحلة 1: الملفات ذات الأولوية العالية ✅
- [x] AuthPage.tsx - تم إصلاح googleLoginError

### المرحلة 2: نماذج الإدخال الأساسية
- [ ] InvoiceForm.tsx - جميع النصوص (15+ نص)
- [ ] TaxConfiguration.tsx - العناوين والأزرار

### المرحلة 3: صفحات التقارير
- [ ] TaxPage.tsx
- [ ] BalanceSheetPage.tsx
- [ ] ProfitLossPage.tsx
- [ ] CashFlowPage.tsx
- [ ] TrialBalancePage.tsx
- [ ] InventoryPage.tsx

### المرحلة 4: صفحات الإعدادات
- [ ] GeneralSettingsPage.tsx
- [ ] UsersPage.tsx
- [ ] LanguageSettingsPage.tsx

### المرحلة 5: الملفات المتفرقة
- [ ] App.tsx
- [ ] Dashboard.tsx (التحقق من وجود نصوص إضافية)

---

## ملاحظات

1. **البيانات التجريبية**: بيانات مثل أسماء الشركات والعملاء في mockData لا تحتاج للترجمة حالياً
2. **رسائل Console**: رسائل console.log/console.error ليست أولوية
3. **الأولوية**: التركيز على واجهة المستخدم المرئية أولاً
4. **التنسيق**: استخدام namespace مناسب (forms, reports, common, etc.)

---

## التقدم

- ✅ تم: 1 نص
- 🔄 قيد العمل: 0
- ⏳ متبقي: ~80+ نص
- 📊 النسبة: ~1%

