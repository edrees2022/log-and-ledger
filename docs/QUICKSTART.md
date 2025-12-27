# 🚀 Quick Start Guide - دليل البدء السريع

## ✅ ما تم إنجازه

تم تطوير Log & Ledger ليصبح نظام محاسبي **عالمي احترافي** مع:

- ✅ 5 تقارير مالية كاملة
- ✅ إدارة مخزون FIFO
- ✅ تخصيص مدفوعات
- ✅ ترقيم تلقائي
- ✅ حماية شاملة
- ✅ موازنات + قوالب متكررة

---

## 🎯 كيف تختبر الميزات الجديدة

### 1. افتح المتصفح 🌐
```
http://localhost:3000
```

### 2. سجل الدخول 🔐
استخدم حسابك الموجود أو سجل حساب جديد

### 3. اذهب للتقارير المالية 📊
```
Dashboard → Reports (من القائمة) → Financial Reports
```

### 4. جرّب التقارير! 🎉

#### Balance Sheet (الميزانية العمومية)
- اضغط **Generate Report** على بطاقة Balance Sheet
- شاهد:
  - الأصول (Assets)
  - الخصوم (Liabilities)
  - حقوق الملكية (Equity)
  - حالة التوازن ✓

#### Profit & Loss (قائمة الدخل)
- اضغط **Generate Report** على بطاقة Profit & Loss
- شاهد:
  - الإيرادات (Revenue)
  - تكلفة البضاعة (COGS)
  - إجمالي الربح (Gross Profit)
  - المصاريف (Expenses)
  - صافي الربح/الخسارة (Net Income)

#### Trial Balance (ميزان المراجعة)
- اضغط **Generate Report**
- شاهد جميع الحسابات مع المدين والدائن
- التحقق من التوازن

#### Cash Flow (التدفقات النقدية)
- اضغط **Generate Report**
- شاهد حركة النقد والبنوك

#### AR Aging (أعمار الذمم)
- اضغط **Generate Report**
- شاهد الفواتير المستحقة حسب العمر:
  - الحالية (0-30 يوم)
  - 31-60 يوم
  - 61-90 يوم
  - أكثر من 90 يوم

---

## 🗄️ الجداول الجديدة في قاعدة البيانات

### لمشاهدة البيانات (Neon Console):
1. افتح https://console.neon.tech
2. اذهب لمشروع Log & Ledger
3. افتح SQL Editor
4. جرّب هذه الاستعلامات:

```sql
-- حركة المخزون
SELECT * FROM stock_movements;

-- تخصيص المدفوعات
SELECT * FROM payment_allocations;

-- ترقيم المستندات
SELECT * FROM document_sequences;

-- الفترات المالية
SELECT * FROM fiscal_periods;

-- القوالب المتكررة
SELECT * FROM recurring_templates;

-- الموازنات
SELECT * FROM budgets;
```

---

## 🛡️ اختبار الحماية (Input Sanitization)

### جرّب هذا:
1. اذهب لإنشاء Contact جديد
2. جرّب إدخال:
   ```
   <script>alert('test')</script>
   ```
3. النتيجة: سيتم تنظيف المدخل تلقائياً! ✅

### كشف SQL Injection:
1. جرّب إدخال:
   ```
   ' OR '1'='1
   ```
2. النتيجة: سيتم رفض الطلب! ✅

---

## 📊 اختبار API Endpoints مباشرة

### استخدم Postman أو curl:

```bash
# احصل على Token من Firebase أولاً
# ثم:

# Balance Sheet
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/reports/balance-sheet"

# Profit & Loss
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/reports/profit-loss?start_date=2025-01-01&end_date=2025-12-31"

# Trial Balance
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/reports/trial-balance"

# Cash Flow
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/reports/cash-flow"

# AR Aging
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/reports/ar-aging"
```

---

## 🔧 الملفات المهمة للمراجعة

### Backend
```
server/
├── utils/
│   ├── transaction.ts         ← معاملات ذرية
│   ├── documentNumber.ts      ← ترقيم تلقائي
│   ├── inventory.ts           ← إدارة مخزون
│   ├── paymentAllocation.ts   ← تخصيص مدفوعات
│   └── sanitization.ts        ← حماية مدخلات
├── middleware/
│   └── sanitize.ts            ← Middleware تلقائي
└── reports/
    └── financialReports.ts    ← محرك التقارير
```

### Frontend
```
client/src/pages/
└── FinancialReports.tsx       ← واجهة التقارير
```

### Database
```
shared/
└── schema.ts                  ← الجداول الجديدة (6)
```

---

## 🎓 فهم البنية الجديدة

### 1. Transaction Management
```typescript
import { withTransaction } from './utils/transaction';

// استخدام
await withTransaction(async (tx) => {
  await tx.insert(journals).values({...});
  await tx.insert(journal_lines).values([...]);
  // كل شيء أو لا شيء!
});
```

### 2. Document Numbering
```typescript
import { generateDocumentNumber } from './utils/documentNumber';

// استخدام
const invoiceNumber = await generateDocumentNumber(
  companyId,
  'invoice',
  tx
);
// النتيجة: INV-2025-00001
```

### 3. Stock Management
```typescript
import { recordStockMovement } from './utils/inventory';

// استخدام
await recordStockMovement({
  company_id: 'xxx',
  item_id: 'yyy',
  warehouse_id: 'zzz',
  transaction_type: 'purchase',
  quantity: 10,
  unit_cost: 50.00,
  ...
});
```

### 4. Payment Allocation
```typescript
import { allocatePayment } from './utils/paymentAllocation';

// استخدام
await allocatePayment({
  company_id: 'xxx',
  payment_type: 'receipt',
  payment_id: 'yyy',
  document_type: 'invoice',
  document_id: 'zzz',
  allocated_amount: 1000.00,
});
```

---

## 📝 أمثلة عملية

### مثال 1: إنشاء فاتورة مع ترقيم تلقائي
```typescript
const invoiceNumber = await generateDocumentNumber(
  companyId,
  'invoice'
);

await db.insert(sales_invoices).values({
  invoice_number: invoiceNumber, // INV-2025-00001
  customer_id: customerId,
  ...
});
```

### مثال 2: تسجيل حركة مخزون
```typescript
await recordStockMovement({
  company_id: companyId,
  item_id: itemId,
  warehouse_id: warehouseId,
  transaction_type: 'sale',
  quantity: 5,
  unit_cost: 100.00,
  reference_type: 'invoice',
  reference_id: invoiceId,
});
```

### مثال 3: تخصيص دفعة لفاتورة
```typescript
await allocatePayment({
  company_id: companyId,
  payment_type: 'receipt',
  payment_id: receiptId,
  document_type: 'invoice',
  document_id: invoiceId,
  allocated_amount: 500.00, // دفعة جزئية
});
```

---

## 🐛 حل المشاكل المحتملة

### المشكلة: التقرير فارغ
**الحل**: أضف بيانات تجريبية:
1. أنشئ Accounts
2. أنشئ Journal Entries
3. جرّب التقرير مرة أخرى

### المشكلة: خطأ في التوازن
**الحل**: تحقق من Journal Lines:
```sql
SELECT 
  SUM(debit) as total_debit,
  SUM(credit) as total_credit
FROM journal_lines;
```
المدين يجب = الدائن

### المشكلة: Session Timeout
**الحل**: سجل الدخول مرة أخرى
(للإنتاج: استخدم Redis)

---

## 🎯 الخطوة التالية

### للتطوير
- [ ] أضف بيانات تجريبية أكثر
- [ ] اختبر جميع التقارير
- [ ] جرّب إنشاء فواتير
- [ ] اختبر المخزون

### للإنتاج
- [ ] Redis للـ Sessions
- [ ] تطبيق Transactions على Invoices
- [ ] SSL Certificate
- [ ] Domain Name
- [ ] Email Notifications

### للتكامل العالمي
- [ ] E-Invoicing (ZATCA)
- [ ] Bank APIs
- [ ] Tax Reporting
- [ ] Multi-currency

---

## 📞 الدعم والمراجع

### التوثيق
- `README_COMPREHENSIVE.md` - الدليل الشامل
- `UPDATES.md` - تفاصيل التحديثات
- `SUMMARY.md` - الملخص النهائي

### الكود
- `shared/schema.ts` - بنية قاعدة البيانات
- `server/routes.ts` - جميع الـ APIs
- `server/reports/` - محرك التقارير

---

## ✨ نصائح احترافية

### 1. استخدم Transactions دائماً
```typescript
// ✅ صحيح
await withTransaction(async (tx) => {
  await tx.insert(...);
  await tx.update(...);
});

// ❌ خطأ (بدون transaction)
await db.insert(...);
await db.update(...);
```

### 2. تحقق من القيد المزدوج
```typescript
import { validateDoubleEntry } from './utils/transaction';

const validation = validateDoubleEntry(journalLines);
if (!validation.isValid) {
  throw new Error(validation.error);
}
```

### 3. نظف المدخلات
```typescript
import { sanitizeObject } from './utils/sanitization';

const cleanData = sanitizeObject(req.body);
```

---

## 🎊 مبروك!

أنت الآن تملك نظام محاسبي **احترافي عالمي**! 🚀

**افتح المتصفح وجرّب الآن!**

http://localhost:3000

---

**Happy Coding! 💻**
