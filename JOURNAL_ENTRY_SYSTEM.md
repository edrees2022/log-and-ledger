# نظام القيود اليومية (Journal Entry System)

## نظرة عامة
تم إضافة نظام محاسبي متكامل للقيود اليومية (Double-Entry Bookkeeping) الذي يسجل تلقائياً جميع المعاملات المالية.

## الميزات المنفذة

### 1. إنشاء قيود يومية تلقائية
يتم إنشاء القيود اليومية تلقائياً عند:

#### **الفواتير (Invoices)**
- **مدين (DR)**: حسابات العملاء (Accounts Receivable)
- **دائن (CR)**: إيرادات المبيعات (Sales Revenue)
- **دائن (CR)**: الضرائب المستحقة (Tax Payable) - إن وجدت

#### **الفواتير الشرائية (Bills)**
- **مدين (DR)**: حساب المصروفات (Expense)
- **مدين (DR)**: الضرائب المستردة (Tax Receivable) - إن وجدت
- **دائن (CR)**: حسابات الموردين (Accounts Payable)

#### **الإيصالات (Receipts)**
- **مدين (DR)**: النقدية/البنك (Cash/Bank)
- **دائن (CR)**: حسابات العملاء (Accounts Receivable)

#### **المدفوعات (Payments)**
- **مدين (DR)**: حسابات الموردين (Accounts Payable)
- **دائن (CR)**: النقدية/البنك (Cash/Bank)

### 2. الملفات المُنشأة والمُعدّلة

#### ملفات جديدة:
```
server/utils/journalEntry.ts         # نظام إنشاء القيود اليومية
server/routes/journals.ts            # API endpoints للقيود اليومية
```

#### ملفات مُحدّثة:
```
server/routes/sales.ts               # إضافة قيود فواتير المبيعات
server/routes/purchases.ts           # إضافة قيود المشتريات
server/routes/banking.ts             # إضافة قيود الإيصالات والمدفوعات
server/routes.ts                     # تسجيل مسارات القيود اليومية
```

### 3. API Endpoints الجديدة

#### عرض القيود
- **GET /api/journals** - عرض جميع القيود اليومية
- **GET /api/journals/:id** - عرض قيد معين مع تفاصيل السطور
- **GET /api/journals/by-reference/:refType/:refId** - عرض القيود المرتبطة بمستند معين

#### إنشاء قيود يدوية
- **POST /api/journals** - إنشاء قيد يومية يدوي
```json
{
  "entry_date": "2025-01-15",
  "description": "Manual Journal Entry",
  "lines": [
    {
      "account_id": "account-1",
      "debit": 1000,
      "credit": 0,
      "description": "Debit line"
    },
    {
      "account_id": "account-2",
      "debit": 0,
      "credit": 1000,
      "description": "Credit line"
    }
  ]
}
```

#### عكس القيود
- **POST /api/journals/:id/reverse** - عكس قيد يومية (إنشاء قيد معاكس)
```json
{
  "reason": "Reason for reversal"
}
```

#### حذف القيود
- **DELETE /api/journals/:id** - حذف قيد يومي يدوي فقط (القيود التلقائية لا يمكن حذفها)

### 4. وظائف مساعدة في `server/utils/journalEntry.ts`

```typescript
// إنشاء قيد يومية أساسي
createJournalEntry(input: JournalEntryInput)

// قيود تلقائية
createInvoiceJournalEntry(...)  // قيد فاتورة مبيعات
createBillJournalEntry(...)     // قيد فاتورة شراء
createReceiptJournalEntry(...)  // قيد إيصال استلام
createPaymentJournalEntry(...)  // قيد مدفوعات

// وظائف إضافية
reverseJournalEntry(...)        // عكس قيد يومية
getJournalEntries(...)          // عرض القيود
getJournalLines(...)            // عرض سطور القيد
```

### 5. التحقق من التوازن المحاسبي

النظام يتحقق تلقائياً من:
- ✅ مجموع المدين = مجموع الدائن
- ✅ على الأقل سطرين في كل قيد
- ✅ جميع الحسابات موجودة في النظام

### 6. ترقيم القيود التلقائي

يستخدم النظام تسلسل رقمي تلقائي بالصيغة:
```
JE-2025-00001
JE-2025-00002
...
```

### 7. أنواع القيود (source_type)

- `invoice` - من فاتورة مبيعات
- `bill` - من فاتورة شراء
- `receipt` - من إيصال استلام
- `payment` - من مدفوعات
- `manual` - قيد يدوي
- `reversal` - قيد عكسي

### 8. معالجة الأخطاء

- إذا فشل إنشاء القيد اليومي، لا يتم إلغاء المعاملة الأصلية
- يتم تسجيل الخطأ في السجلات (console.error)
- يستمر النظام في العمل بشكل طبيعي

### 9. الصلاحيات المطلوبة

- **إنشاء قيد يدوي**: `accounting:create`
- **عكس قيد**: `owner`, `admin`, `accountant`
- **حذف قيد**: `owner`, `admin`
- **عرض القيود**: `requireAuth` (أي مستخدم مصادق)

## المراجع

### جداول قاعدة البيانات
```sql
journals:
  - id (PK)
  - company_id (FK)
  - journal_number (رقم القيد)
  - date (تاريخ القيد)
  - source_type (نوع المصدر)
  - source_id (معرف المصدر)
  - description (الوصف)
  - total_amount (المجموع)
  - created_by (FK)
  - created_at, updated_at

journal_lines:
  - id (PK)
  - journal_id (FK)
  - account_id (FK)
  - description (وصف السطر)
  - debit (مدين)
  - credit (دائن)
  - currency (العملة)
  - fx_rate (سعر الصرف)
  - base_debit, base_credit (بالعملة الأساسية)
```

## الخطوات التالية (Future Enhancements)

1. **تقرير دفتر اليومية العام** (General Ledger Report)
2. **تقرير ميزان المراجعة** (Trial Balance)
3. **دعم العملات المتعددة** في القيود
4. **الموافقات** على القيود اليدوية (Approval Workflow)
5. **ربط القيود بمراكز التكلفة** (Cost Centers)
6. **تقارير تحليلية** للقيود اليومية

## اختبار النظام

### 1. إنشاء فاتورة مبيعات
```bash
POST /api/sales/invoices
```
سيتم إنشاء قيد يومية تلقائياً

### 2. عرض القيود المرتبطة
```bash
GET /api/journals/by-reference/invoice/{invoice_id}
```

### 3. إنشاء قيد يدوي
```bash
POST /api/journals
{
  "entry_date": "2025-01-15",
  "description": "Adjustment Entry",
  "lines": [
    {"account_id": "acc1", "debit": 500, "credit": 0},
    {"account_id": "acc2", "debit": 0, "credit": 500}
  ]
}
```

### 4. عكس قيد
```bash
POST /api/journals/{id}/reverse
{
  "reason": "Error correction"
}
```

## ملاحظات مهمة

- ✅ جميع الأكواد اجتازت فحص TypeScript بنجاح
- ✅ النظام يعمل بشكل آمن مع معالجة الأخطاء
- ✅ القيود التلقائية لا يمكن حذفها (يجب عكسها فقط)
- ✅ القيود اليدوية يمكن حذفها بصلاحيات Owner/Admin
- ✅ النظام يدعم تتبع المعاملات بالكامل (Audit Trail)

## التحديثات الأخيرة

- ✅ تصحيح أسماء الحقول لتطابق schema الفعلي
- ✅ استخدام `date`, `source_type`, `source_id` بدلاً من `entry_date`, `reference_type`, `reference_id`
- ✅ إزالة `line_number` من orderBy (غير موجود في schema)
- ✅ تصحيح استيرادات الأنواع من `@shared/schema`
