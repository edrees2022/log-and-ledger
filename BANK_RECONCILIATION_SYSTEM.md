# نظام مطابقة الحسابات البنكية (Bank Reconciliation System)

## نظرة عامة
تم إضافة نظام متكامل لمطابقة الحسابات البنكية يسمح بمطابقة كشوف الحسابات البنكية مع الحركات المالية المسجلة في النظام.

## الميزات المنفذة

### 1. إدارة المطابقات البنكية

#### **إنشاء مطابقة بنكية**
- تحديد الحساب البنكي وتاريخ المطابقة
- إدخال رصيد كشف الحساب البنكي (Statement Balance)
- اختيار المعاملات المسجلة (Cleared/Uncleared)
- إضافة معاملات إضافية:
  - مصاريف بنكية (Bank Charges)
  - فوائد بنكية (Bank Interest)
  - تعديلات (Adjustments)
- حساب الفرق تلقائياً
- تحديد حالة المطابقة (In Progress / Completed / Cancelled)

#### **تتبع المعاملات غير المطابقة**
- عرض جميع المدفوعات والإيصالات غير المطابقة
- تصفية حسب الفترة الزمنية
- فصل المدفوعات عن الإيصالات
- ترتيب حسب التاريخ

#### **حساب الأرصدة**
- رصيد افتتاحي (Opening Balance)
- مجموع الإيصالات (Total Receipts)
- مجموع المدفوعات (Total Payments)
- الرصيد الحالي (Current Balance)
- الرصيد في تاريخ محدد (As of Date)

### 2. الملفات المُنشأة والمُعدّلة

#### ملفات جديدة:
```
server/utils/bankReconciliation.ts         # نظام المطابقة البنكية
server/routes/bankReconciliation.ts        # API endpoints للمطابقة
```

#### ملفات مُحدّثة:
```
shared/schema.ts                           # إضافة جداول المطابقة
  - bank_reconciliations                   # جدول المطابقات
  - bank_reconciliation_items              # جدول بنود المطابقة
  - payments (+ reconciled field)          # إضافة حقل المطابقة
  - receipts (+ reconciled field)          # إضافة حقل المطابقة
server/routes.ts                           # تسجيل مسارات المطابقة
```

### 3. API Endpoints الجديدة

#### عرض البيانات
- **GET /api/bank-reconciliation/unreconciled/:bankAccountId**
  - عرض المعاملات غير المطابقة لحساب بنكي
  - Query params: `startDate`, `endDate`

- **GET /api/bank-reconciliation/balance/:bankAccountId**
  - حساب رصيد الحساب البنكي
  - Query params: `asOfDate`

- **GET /api/bank-reconciliation/account/:bankAccountId**
  - عرض جميع المطابقات لحساب بنكي

- **GET /api/bank-reconciliation/:id**
  - عرض مطابقة محددة مع البنود

#### إدارة المطابقات
- **POST /api/bank-reconciliation**
  - إنشاء مطابقة بنكية جديدة
```json
{
  "bank_account_id": "account-id",
  "reconciliation_date": "2025-01-15",
  "statement_balance": 50000,
  "items": [
    {
      "transaction_type": "payment",
      "transaction_id": "payment-id",
      "amount": 1000,
      "date": "2025-01-10",
      "description": "Supplier Payment",
      "cleared": true
    },
    {
      "transaction_type": "bank_charge",
      "amount": 25,
      "date": "2025-01-15",
      "description": "Bank Service Charge",
      "cleared": true
    }
  ],
  "notes": "January reconciliation"
}
```

- **PATCH /api/bank-reconciliation/:id/status**
  - تحديث حالة المطابقة
```json
{
  "status": "completed"
}
```

- **DELETE /api/bank-reconciliation/:id**
  - حذف مطابقة وإلغاء تأشير المعاملات

### 4. وظائف مساعدة في `server/utils/bankReconciliation.ts`

```typescript
// عرض المعاملات غير المطابقة
getUnreconciledTransactions(companyId, bankAccountId, startDate?, endDate?)

// حساب ملخص المطابقة
calculateReconciliationSummary(bankAccountId, statementBalance, items)

// إنشاء مطابقة بنكية
createBankReconciliation(companyId, input, userId?)

// عرض مطابقة محددة
getReconciliationById(reconciliationId)

// عرض مطابقات حساب بنكي
getReconciliationsByBankAccount(companyId, bankAccountId)

// تحديث حالة المطابقة
updateReconciliationStatus(reconciliationId, status)

// حذف مطابقة
deleteReconciliation(companyId, reconciliationId)

// حساب رصيد الحساب البنكي
getBankAccountBalance(companyId, bankAccountId, asOfDate?)
```

### 5. أنواع المعاملات (transaction_type)

- `payment` - مدفوعات للموردين
- `receipt` - إيصالات من العملاء
- `bank_charge` - مصاريف بنكية
- `bank_interest` - فوائد بنكية
- `adjustment` - تعديلات

### 6. حسابات المطابقة

النظام يحسب تلقائياً:

```
Book Balance = Statement Balance 
             + Outstanding Receipts 
             - Outstanding Payments 
             + Bank Interest 
             - Bank Charges 
             + Adjustments
```

### 7. حالات المطابقة (Status)

- `in_progress` - جارية
- `completed` - مكتملة (الفرق = 0)
- `cancelled` - ملغاة

### 8. الصلاحيات المطلوبة

- **إنشاء مطابقة**: `banking:create`
- **تحديث مطابقة**: `banking:edit`
- **حذف مطابقة**: `owner`, `admin`, `accountant`
- **عرض المطابقات**: `requireAuth`

## جداول قاعدة البيانات

### bank_reconciliations
```sql
id                    (PK)
company_id            (FK → companies)
bank_account_id       (FK → bank_accounts)
reconciliation_date   (تاريخ المطابقة)
statement_balance     (رصيد كشف الحساب)
book_balance          (الرصيد الدفتري)
difference            (الفرق)
status                (in_progress/completed/cancelled)
notes                 (ملاحظات)
created_by            (FK → users)
created_at, updated_at
```

### bank_reconciliation_items
```sql
id                    (PK)
reconciliation_id     (FK → bank_reconciliations)
transaction_type      (نوع المعاملة)
transaction_id        (معرف المعاملة)
amount                (المبلغ)
transaction_date      (تاريخ المعاملة)
description           (الوصف)
cleared               (مطابق/غير مطابق)
created_at
```

### تحديثات payments & receipts
```sql
-- حقول جديدة:
reconciled            (boolean - مطابق؟)
reconciliation_id     (FK → bank_reconciliations)
```

## مثال على استخدام النظام

### 1. عرض المعاملات غير المطابقة
```bash
GET /api/bank-reconciliation/unreconciled/bank-account-123?startDate=2025-01-01&endDate=2025-01-31
```

**Response:**
```json
{
  "payments": [
    {
      "id": "pay-1",
      "type": "payment",
      "date": "2025-01-10",
      "amount": "1000.00",
      "reference": "PAY-2025-00001",
      "description": "Supplier Payment",
      "reconciled": false
    }
  ],
  "receipts": [
    {
      "id": "rcpt-1",
      "type": "receipt",
      "date": "2025-01-12",
      "amount": "5000.00",
      "reference": "RCPT-2025-00001",
      "description": "Customer Payment",
      "reconciled": false
    }
  ],
  "all": [ /* جميع المعاملات مرتبة */ ]
}
```

### 2. إنشاء مطابقة بنكية
```bash
POST /api/bank-reconciliation
Content-Type: application/json

{
  "bank_account_id": "bank-account-123",
  "reconciliation_date": "2025-01-31",
  "statement_balance": 45000,
  "items": [
    {
      "transaction_type": "payment",
      "transaction_id": "pay-1",
      "amount": 1000,
      "date": "2025-01-10",
      "description": "Supplier Payment",
      "cleared": true
    },
    {
      "transaction_type": "receipt",
      "transaction_id": "rcpt-1",
      "amount": 5000,
      "date": "2025-01-12",
      "description": "Customer Payment",
      "cleared": true
    },
    {
      "transaction_type": "bank_charge",
      "amount": 50,
      "date": "2025-01-31",
      "description": "Monthly Bank Charges",
      "cleared": true
    }
  ],
  "notes": "January 2025 reconciliation"
}
```

**Response:**
```json
{
  "id": "recon-1",
  "company_id": "company-1",
  "bank_account_id": "bank-account-123",
  "reconciliation_date": "2025-01-31T00:00:00.000Z",
  "statement_balance": "45000.00",
  "book_balance": "44950.00",
  "difference": "50.00",
  "status": "in_progress",
  "summary": {
    "statement_balance": 45000,
    "book_balance": 44950,
    "outstanding_payments": 0,
    "outstanding_receipts": 0,
    "bank_charges": 50,
    "bank_interest": 0,
    "adjustments": 0,
    "difference": 50
  }
}
```

### 3. تأكيد المطابقة
```bash
PATCH /api/bank-reconciliation/recon-1/status
Content-Type: application/json

{
  "status": "completed"
}
```

## الخطوات التالية

### تحسينات مقترحة:
1. **استيراد كشوف الحسابات البنكية** (CSV/Excel)
2. **مطابقة تلقائية ذكية** باستخدام AI
3. **تقارير المطابقة** (PDF/Excel)
4. **إشعارات** عند اكتمال المطابقة
5. **تكامل مع البنوك** (Open Banking API)
6. **مطابقة متعددة العملات**
7. **سجل التدقيق** (Audit Trail) للمطابقات

## ملاحظات مهمة

- ✅ جميع الأكواد اجتازت فحص TypeScript
- ✅ النظام يدعم المعاملات بالعملات المختلفة
- ✅ عند حذف مطابقة، يتم إلغاء تأشير المعاملات تلقائياً
- ✅ المعاملات المطابقة لا يمكن مطابقتها مرة أخرى
- ✅ النظام يحسب الفرق تلقائياً
- ✅ دعم المصاريف والفوائد البنكية
- ✅ تتبع كامل للمطابقات السابقة

## الحالة الحالية

✅ **مكتمل بالكامل**:
- Schema جاهز
- API Endpoints جاهزة
- Utility Functions جاهزة
- Type Checking نجح
- جاهز للاستخدام

🔄 **التالي**: إضافة واجهة المستخدم (Frontend) للمطابقة البنكية
