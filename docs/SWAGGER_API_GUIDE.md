# 📚 دليل استخدام Swagger API Documentation

## نظرة عامة
واجهة Swagger تتيح لك:
- 📖 قراءة توثيق API كامل
- 🧪 اختبار endpoints مباشرة من المتصفح
- 🔐 المصادقة والتفويض
- 📥 تصدير OpenAPI spec

---

## الوصول إلى Swagger UI

### محلياً (Development):
```
http://localhost:3000/api-docs
```

### الإنتاج (Production):
```
https://api.logledger-pro.com/api-docs
```

### روابط بديلة:
- `/api/docs` - يوجه إلى `/api-docs`
- `/api/swagger.json` - ملف OpenAPI spec الخام

---

## مميزات الواجهة 🎨

### 1. التصفح السهل
- **Tags**: الـ APIs مجموعة حسب الفئات (Sales, Purchases, Reports, etc.)
- **Endpoints**: كل endpoint يظهر مع:
  - HTTP Method (GET, POST, PUT, DELETE)
  - Path
  - Description
  - Parameters
  - Responses

### 2. المصادقة 🔐

#### Firebase JWT (bearerAuth):
1. اضغط على **Authorize** 🔓 في أعلى الصفحة
2. أدخل Firebase JWT token:
   ```
   Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...
   ```
3. اضغط **Authorize**

#### Session Cookie (sessionCookie):
- يتم تلقائياً إذا كنت مسجل دخول في التطبيق
- Cookie name: `ledger.sid`

### 3. اختبار Endpoints 🧪

مثال: اختبار GET /api/sales/invoices

1. **افتح Endpoint**:
   - ابحث عن "Sales Invoices" tag
   - اضغط على `GET /api/sales/invoices`

2. **جهز المعاملات** (Parameters):
   ```
   companyId: 1
   limit: 10
   offset: 0
   status: pending
   ```

3. **اضغط "Try it out"** ثم **"Execute"**

4. **شاهد النتيجة**:
   ```json
   {
     "invoices": [...],
     "total": 25,
     "page": 1,
     "pageSize": 10
   }
   ```

### 4. فهم Responses 📊

كل endpoint يوضح:

#### Success (200/201):
```json
{
  "id": 1,
  "invoiceNumber": "INV-001",
  "contactName": "John Doe",
  "total": 1500.00
}
```

#### Error (400):
```json
{
  "error": "Validation Error",
  "message": "Missing required field: contactId",
  "details": {...}
}
```

#### Unauthorized (401):
```json
{
  "error": "Unauthorized",
  "message": "Please log in to access this resource"
}
```

---

## أمثلة عملية 💡

### مثال 1: إنشاء فاتورة جديدة

1. **Endpoint**: `POST /api/sales/invoices`

2. **Request Body**:
   ```json
   {
     "companyId": 1,
     "contactId": 5,
     "invoiceDate": "2025-11-10",
     "dueDate": "2025-12-10",
     "invoiceNumber": "INV-123",
     "status": "pending",
     "subtotal": 1000.00,
     "taxAmount": 150.00,
     "total": 1150.00,
     "lines": [
       {
         "itemId": 3,
         "description": "Product A",
         "quantity": 10,
         "unitPrice": 100.00,
         "taxId": 1,
         "lineTotal": 1000.00
       }
     ]
   }
   ```

3. **Response (201)**:
   ```json
   {
     "id": 42,
     "invoiceNumber": "INV-123",
     "total": 1150.00,
     "createdAt": "2025-11-10T12:00:00Z"
   }
   ```

### مثال 2: البحث عن فواتير

1. **Endpoint**: `GET /api/sales/invoices`

2. **Query Parameters**:
   ```
   companyId: 1
   status: pending
   startDate: 2025-01-01
   endDate: 2025-12-31
   limit: 50
   ```

3. **Response (200)**:
   ```json
   {
     "invoices": [
       {
         "id": 1,
         "invoiceNumber": "INV-001",
         "contactName": "Client A",
         "total": 5000.00,
         "status": "pending"
       }
     ],
     "total": 15,
     "page": 1
   }
   ```

---

## Component Schemas 📋

### Account
```json
{
  "id": 1,
  "accountNumber": "1010",
  "nameEn": "Cash",
  "nameAr": "النقد",
  "type": "asset",
  "category": "current",
  "balance": 50000.00
}
```

### Tax
```json
{
  "id": 1,
  "nameEn": "VAT 15%",
  "nameAr": "ضريبة القيمة المضافة 15%",
  "rate": 15.0,
  "isActive": true
}
```

### Invoice
```json
{
  "id": 1,
  "invoiceNumber": "INV-001",
  "companyId": 1,
  "contactId": 5,
  "invoiceDate": "2025-11-10",
  "dueDate": "2025-12-10",
  "status": "pending",
  "subtotal": 1000.00,
  "taxAmount": 150.00,
  "total": 1150.00,
  "lines": [...]
}
```

---

## تصدير OpenAPI Spec 📤

### JSON Format:
```
http://localhost:3000/api/swagger.json
```

### استخدامات:
- ✅ استيراد في Postman
- ✅ توليد Client SDKs
- ✅ API Testing automation
- ✅ مشاركة مع Frontend team

### في Postman:
1. افتح Postman
2. **Import** → **Link**
3. أدخل: `http://localhost:3000/api/swagger.json`
4. اضغط **Import**

---

## Rate Limiting ⚡

**الحدود الافتراضية:**
- API calls: 100 req/15min per IP
- Heavy operations: 10 req/15min per IP
- Reports: 20 req/15min per IP
- Bulk operations: 5 req/15min per IP

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699632000
```

**عند تجاوز الحد (429)**:
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 15 minutes.",
  "retryAfter": 900
}
```

---

## Error Handling 🚨

### Standard Error Format:
```json
{
  "error": "Error Type",
  "message": "Human-readable description",
  "details": {
    "field": "Additional context"
  },
  "timestamp": "2025-11-10T12:00:00Z"
}
```

### HTTP Status Codes:
- `200` - Success (GET)
- `201` - Created (POST)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

## Best Practices ✅

### 1. استخدم Authentication دائماً
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/sales/invoices
```

### 2. احترم Rate Limits
- استخدم caching عند الإمكان
- لا تعمل polling سريع جداً

### 3. التعامل مع Errors
```javascript
try {
  const response = await fetch('/api/sales/invoices');
  if (response.status === 429) {
    // Wait and retry
    await sleep(15 * 60 * 1000);
  }
} catch (error) {
  console.error('API Error:', error);
}
```

### 4. استخدم Pagination
```
GET /api/sales/invoices?limit=50&offset=0
```

---

## للمطورين (Frontend Team) 👨‍💻

### استخدام Swagger لتطوير Frontend:

1. **افتح Swagger UI** أثناء التطوير
2. **اختبر Endpoints** قبل كتابة الكود
3. **انسخ Request/Response examples** للـ TypeScript types
4. **استخدم Try it out** للتأكد من البيانات

### TypeScript Types من Swagger:

```typescript
// مثال: من Swagger schema
interface Invoice {
  id: number;
  invoiceNumber: string;
  companyId: number;
  contactId: number;
  invoiceDate: string;
  dueDate: string;
  status: 'draft' | 'pending' | 'paid' | 'cancelled';
  subtotal: number;
  taxAmount: number;
  total: number;
  lines: InvoiceLine[];
}

interface InvoiceLine {
  itemId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxId?: number;
  lineTotal: number;
}
```

---

## الخطوات التالية 🚀

### للتطوير المحلي:
1. ✅ السيرفر يعمل على `localhost:3000`
2. ✅ Swagger UI متاح على `/api-docs`
3. ✅ جرب endpoints مختلفة

### للإنتاج:
1. Deploy الكود على Render
2. افتح `https://api.logledger-pro.com/api-docs`
3. شارك الرابط مع الفريق

### تحسينات مستقبلية:
- [ ] إضافة أمثلة لكل endpoint
- [ ] توثيق Webhooks
- [ ] توثيق Batch operations
- [ ] إضافة Postman Collection

---

## الدعم والمساعدة 💬

**أسئلة شائعة:**

**Q: كيف أحصل على Firebase token؟**
A: من Firebase console أو عبر تسجيل دخول في التطبيق

**Q: لماذا أحصل على 401؟**
A: تأكد من إضافة Authorization header أو Session cookie

**Q: كيف أزيد Rate limit؟**
A: اتصل بالدعم الفني أو عدّل في `server/middleware/rateLimiter.ts`

---

## ✅ Checklist

- [ ] فتحت Swagger UI على `localhost:3000/api-docs`
- [ ] اختبرت GET endpoint بنجاح
- [ ] اختبرت POST endpoint بنجاح
- [ ] فهمت Error responses
- [ ] فهمت Rate limiting
- [ ] صدّرت OpenAPI spec إلى Postman
- [ ] شاركت الرابط مع الفريق

---

**🎉 الآن لديك توثيق API احترافي كامل!**

**مميزات:**
- ✅ Interactive testing
- ✅ Authentication support
- ✅ Full schema documentation
- ✅ Error handling examples
- ✅ Rate limiting info
- ✅ Production-ready

**استمتع بـ API documentation من الدرجة الأولى! 🚀**
