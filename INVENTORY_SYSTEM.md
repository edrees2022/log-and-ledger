# نظام إدارة المخزون المتقدم (Advanced Inventory System)

## نظرة عامة
نظام لتتبع حركة المخزون، إدارة المستودعات، وتقييم المخزون بدقة.

## الميزات المنفذة

### 1. إدارة المستودعات (Warehouse Management)
- دعم مستودعات متعددة.
- تتبع الكميات لكل مستودع على حدة.

### 2. حركات المخزون (Stock Movements)
- تسجيل جميع الحركات:
  - **شراء (Purchase)**: زيادة المخزون (من فواتير الشراء).
  - **بيع (Sale)**: نقص المخزون (من فواتير المبيعات).
  - **تسوية (Adjustment)**: تعديل يدوي (جرد، تالف، إلخ).
  - **نقل (Transfer)**: نقل بين المستودعات.
- تتبع التكلفة لكل حركة (Unit Cost).

### 3. تقييم المخزون (Inventory Valuation)
- **FIFO (First-In, First-Out)**: النظام يدعم منطق FIFO لحساب قيمة المخزون المتبقي وتكلفة البضاعة المباعة (COGS).
- **متوسط التكلفة (Average Cost)**: حساب متوسط التكلفة المرجح.

### 4. الهيكلية البرمجية

#### جداول قاعدة البيانات
- `warehouses`: تعريف المستودعات.
- `stock_movements`: سجل الحركات التفصيلي.
- `items`: (تحديث) حقل `stock_quantity` يتم تحديثه تلقائياً.

#### الملفات
- `server/utils/inventory.ts`: منطق تسجيل الحركات وحساب التقييم.
- `server/routes/inventory.ts`: واجهة برمجة التطبيقات (API).

### 5. API Endpoints

- **GET /api/inventory/warehouses**: قائمة المستودعات.
- **POST /api/inventory/warehouses**: إضافة مستودع.
- **GET /api/inventory/levels**: مستويات المخزون الحالية (لكل صنف ومستودع).
- **GET /api/inventory/items/:id/history**: سجل حركات الصنف.
- **GET /api/inventory/items/:id/valuation**: تقييم الصنف (الكمية، القيمة الإجمالية، متوسط التكلفة).
- **POST /api/inventory/adjustments**: إنشاء حركة تسوية يدوية.

## التكامل
- يجب ربط فواتير الشراء (Bills) وفواتير المبيعات (Invoices) لاستدعاء `recordStockMovement` تلقائياً عند اعتماد الفاتورة.

