# نظام العملات المتعددة (Multi-Currency System)

## نظرة عامة
تم إضافة نظام لدعم العملات المتعددة، مما يسمح بتسجيل المعاملات بعملات مختلفة عن العملة الأساسية للشركة، مع إدارة أسعار الصرف.

## الميزات المنفذة

### 1. إدارة العملات وأسعار الصرف

#### **العملات (Currencies)**
- جدول لتخزين العملات المتاحة (رمز، اسم، رمز العملة)
- يتم إدراج العملات الافتراضية تلقائياً (USD, EUR, SAR, etc.)

#### **أسعار الصرف (Exchange Rates)**
- تخزين أسعار الصرف بين العملات
- تاريخ سريان السعر
- دعم الأسعار اليدوية

### 2. الملفات المُنشأة والمُعدّلة

#### ملفات جديدة:
```
server/utils/currency.ts           # منطق تحويل العملات
server/routes/currencies.ts        # API endpoints للعملات
```

#### ملفات مُحدّثة:
```
shared/schema.ts                   # إضافة جداول العملات وأسعار الصرف
server/routes.ts                   # تسجيل مسارات العملات
```

### 3. API Endpoints الجديدة

#### عرض البيانات
- **GET /api/currencies**
  - عرض جميع العملات المتاحة

- **GET /api/currencies/rates**
  - عرض سجل أسعار الصرف للشركة

#### العمليات
- **POST /api/currencies/rates**
  - إضافة سعر صرف جديد
```json
{
  "from_currency": "USD",
  "to_currency": "SAR",
  "rate": 3.75,
  "date": "2025-01-01"
}
```

- **POST /api/currencies/convert**
  - تحويل مبلغ بين عملتين
```json
{
  "amount": 100,
  "from": "USD",
  "to": "SAR",
  "date": "2025-01-01"
}
```

### 4. وظائف مساعدة في `server/utils/currency.ts`

```typescript
// إدراج العملات الافتراضية
seedCurrencies()

// الحصول على سعر الصرف في تاريخ معين
getExchangeRate(companyId, fromCurrency, toCurrency, date?)

// تحويل مبلغ
convertCurrency(companyId, amount, fromCurrency, toCurrency, date?)

// الحصول على العملة الأساسية للشركة
getCompanyBaseCurrency(companyId)
```

### 5. منطق تحديد سعر الصرف

عند طلب سعر صرف بين عملتين (مثلاً USD -> SAR):
1. البحث عن سعر مباشر (USD -> SAR) في التاريخ المحدد أو قبله (الأحدث).
2. إذا لم يوجد، البحث عن سعر عكسي (SAR -> USD) وقلبه (1 / Rate).
3. إذا لم يوجد، يتم افتراض السعر 1 (مع تحذير).

### 6. جداول قاعدة البيانات

#### currencies
```sql
code        (PK) -- USD, EUR
name        -- US Dollar
symbol      -- $
is_active   -- boolean
```

#### exchange_rates
```sql
id              (PK)
company_id      (FK)
from_currency   (FK)
to_currency     (FK)
rate            -- decimal
date            -- timestamp
source          -- manual/api
created_by      (FK)
created_at
```

## الخطوات التالية

1. **تكامل مع الفواتير والمشتريات**: استخدام `getExchangeRate` تلقائياً عند إنشاء فاتورة بعملة أجنبية.
2. **تقارير الأرباح والخسائر من فروقات العملة**: حساب الفروقات عند الدفع بسعر صرف مختلف عن وقت الفاتورة.
3. **تحديث تلقائي للأسعار**: ربط مع API خارجي لتحديث أسعار الصرف يومياً.

## ملاحظات

- النظام الحالي يعتمد على الإدخال اليدوي لأسعار الصرف أو استخدام السعر 1 كافتراضي.
- تم تصميم النظام ليكون مرناً وقابلاً للتوسع.
