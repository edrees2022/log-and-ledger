# 💾 دليل النسخ الاحتياطي والاستعادة
# Backup & Restore Guide

## 🌟 نظرة عامة / Overview

ميزة النسخ الاحتياطي والاستعادة تتيح للمستخدمين حفظ بياناتهم كاملة واستعادتها بسهولة.

The Backup & Restore feature allows users to save all their data and restore it easily.

---

## ✨ الميزات / Features

### 1. 📥 النسخ الاحتياطي (Backup)
- تحميل جميع البيانات في ملف JSON واحد
- اسم الملف يحتوي على التاريخ والوقت الكامل
- صيغة الاسم: `log-ledger-backup_2025-10-27_14-30-45.json`

**English:**
- Download all data to a single JSON file
- Filename includes full date and time
- Format: `log-ledger-backup_2025-10-27_14-30-45.json`

### 2. 🔄 الاستعادة (Restore)
- استبدال جميع البيانات الحالية بالنسخة الاحتياطية
- رسالة تحذير قبل الاستعادة
- إحصائيات كاملة عن البيانات المستعادة

**English:**
- Replace all current data with backup
- Warning message before restore
- Full statistics of restored data

### 3. 🔀 الدمج (Merge)
- دمج البيانات من النسخة الاحتياطية مع البيانات الحالية
- الاحتفاظ بالسجلات الأحدث (حسب `updated_at`)
- عدم فقدان أي بيانات جديدة
- إحصائيات مفصلة: جديد / محدث / متجاوز

**English:**
- Merge backup data with current data
- Keep newer records (by `updated_at`)
- No loss of new data
- Detailed stats: new / updated / skipped

---

## 🗂️ محتوى النسخة الاحتياطية / Backup Contents

```json
{
  "version": "1.0",
  "timestamp": "2025-10-27T14:30:45.123Z",
  "data": {
    "companies": [...],
    "accounts": [...],
    "contacts": [...],
    "items": [...]
  }
}
```

### البيانات المحفوظة / Saved Data:
- ✅ **Companies** - بيانات الشركات
- ✅ **Accounts** - دليل الحسابات
- ✅ **Contacts** - العملاء والموردون
- ✅ **Items** - المنتجات والخدمات

---

## 🚀 كيفية الاستخدام / How to Use

### 📥 حفظ نسخة احتياطية / Create Backup

1. انتقل إلى: **الإعدادات** → **النسخ الاحتياطي والاستعادة**
   - Go to: **Settings** → **Backup & Restore**

2. اضغط على زر **"تحميل النسخة الاحتياطية"**
   - Click **"Download Backup"** button

3. سيتم تحميل ملف JSON بالصيغة:
   - File will download as:
   ```
   log-ledger-backup_2025-10-27_14-30-45.json
   ```

4. احفظ الملف في مكان آمن على جهازك
   - Save file in a safe location on your device

---

### 🔄 استعادة النسخة الاحتياطية / Restore Backup

⚠️ **تحذير / Warning:** هذه العملية ستحذف جميع البيانات الحالية!
**This operation will delete all current data!**

1. في قسم **"استعادة النسخة الاحتياطية"**
   - In the **"Restore Backup"** section

2. اختر ملف النسخة الاحتياطية (`.json`)
   - Select backup file (`.json`)

3. اضغط على زر **"استعادة"** (أحمر)
   - Click **"Restore"** button (red)

4. أكد العملية في النافذة المنبثقة
   - Confirm in popup dialog

5. انتظر حتى تكتمل الاستعادة
   - Wait for restore to complete

6. ستظهر رسالة نجاح مع الإحصائيات:
   - Success message will show with stats:
   ```
   ✅ تمت استعادة البيانات
   123 حسابات، 45 جهات اتصال، 89 عناصر
   
   ✅ Data restored
   123 accounts, 45 contacts, 89 items
   ```

7. سيتم إعادة تحميل الصفحة تلقائياً
   - Page will reload automatically

---

### 🔀 دمج النسخة الاحتياطية / Merge Backup

💡 **أفضل خيار لعدم فقدان البيانات الجديدة!**
**Best option to avoid losing new data!**

1. في قسم **"استعادة النسخة الاحتياطية"**
   - In the **"Restore Backup"** section

2. اختر ملف النسخة الاحتياطية (`.json`)
   - Select backup file (`.json`)

3. اضغط على زر **"دمج"** (رمادي)
   - Click **"Merge"** button (gray)

4. أكد العملية في النافذة المنبثقة
   - Confirm in popup dialog

5. انتظر حتى يكتمل الدمج
   - Wait for merge to complete

6. ستظهر رسالة نجاح مع إحصائيات مفصلة:
   - Success message with detailed stats:
   ```
   ✅ تم دمج البيانات
   15 حسابات جديدة، 8 محدثة، 100 متجاوزة
   
   ✅ Data merged
   15 new accounts, 8 updated, 100 skipped
   ```

---

## 🛡️ آلية الدمج / Merge Logic

### كيف يعمل الدمج؟ / How Merge Works:

```
لكل سجل في النسخة الاحتياطية:
For each record in backup:

1️⃣ إذا لم يكن موجوداً → إضافة كسجل جديد
   If doesn't exist → Add as new

2️⃣ إذا كان موجوداً:
   If exists:
   - مقارنة تاريخ التحديث (updated_at)
   - Compare update date (updated_at)
   
   - إذا النسخة الاحتياطية أحدث → تحديث
     If backup is newer → Update
   
   - إذا البيانات الحالية أحدث → تجاوز
     If current data is newer → Skip
```

---

## 📊 API Endpoints

### POST `/api/restore`
استعادة كاملة (استبدال جميع البيانات)

**Request Body:**
```json
{
  "version": "1.0",
  "timestamp": "...",
  "data": {
    "companies": [...],
    "accounts": [...],
    "contacts": [...],
    "items": [...]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Backup restored successfully",
  "stats": {
    "accounts": 123,
    "contacts": 45,
    "items": 89
  }
}
```

---

### POST `/api/merge`
دمج ذكي (الاحتفاظ بالأحدث)

**Request Body:** (نفس الصيغة / same format)

**Response:**
```json
{
  "success": true,
  "message": "Backup merged successfully",
  "stats": {
    "accounts": {
      "new": 15,
      "updated": 8,
      "skipped": 100
    },
    "contacts": {
      "new": 5,
      "updated": 3,
      "skipped": 37
    },
    "items": {
      "new": 10,
      "updated": 5,
      "skipped": 74
    }
  }
}
```

---

## 🔒 الأمان / Security

### ✅ محمي بالمصادقة / Authentication Protected
- جميع الـ endpoints محمية بـ `requireFirebaseAuth`
- All endpoints protected by `requireFirebaseAuth`

### ✅ التحقق من البيانات / Data Validation
- التحقق من صيغة الملف قبل المعالجة
- File format validation before processing

### ✅ خاص بالشركة / Company-Specific
- كل مستخدم يستعيد/يدمج بيانات شركته فقط
- Each user restores/merges only their company data

---

## ⚠️ تحذيرات مهمة / Important Warnings

### 🔴 الاستعادة (Restore):
- ⚠️ **يحذف جميع البيانات الحالية**
- ⚠️ **لا يمكن التراجع عن العملية**
- ⚠️ **تأكد من صحة الملف قبل الاستعادة**

**English:**
- ⚠️ **Deletes all current data**
- ⚠️ **Cannot be undone**
- ⚠️ **Verify file before restoring**

### 🟡 الدمج (Merge):
- ⚠️ **قد يستغرق وقتاً طويلاً للملفات الكبيرة**
- ⚠️ **يعتمد على `updated_at` لتحديد الأحدث**

**English:**
- ⚠️ **May take time for large files**
- ⚠️ **Relies on `updated_at` for determining newer records**

---

## 💡 نصائح / Tips

### 📅 النسخ الاحتياطي المنتظم / Regular Backups
- احفظ نسخة احتياطية أسبوعياً على الأقل
- Save backup at least weekly

### 💾 حفظ آمن / Safe Storage
- احفظ الملفات في أماكن متعددة (Cloud, USB, etc.)
- Store files in multiple locations

### 🔄 اختبار الاستعادة / Test Restore
- جرب استعادة نسخة احتياطية في بيئة اختبار
- Test restore in a test environment

### 🔀 استخدم الدمج / Use Merge
- إذا لم تكن متأكداً، استخدم "دمج" بدلاً من "استعادة"
- If unsure, use "Merge" instead of "Restore"

---

## 🎯 حالات الاستخدام / Use Cases

### ✅ متى تستخدم الاستعادة؟ / When to Restore?
- عند الانتقال إلى جهاز جديد
- When moving to new device
- بعد فقدان البيانات
- After data loss
- عند الحاجة للعودة لنسخة قديمة كاملة
- When need full rollback to old version

### ✅ متى تستخدم الدمج؟ / When to Merge?
- عند مزامنة البيانات بين جهازين
- When syncing data between devices
- عند إضافة بيانات قديمة لبيانات جديدة
- When adding old data to new data
- عند عدم التأكد من أي الإصدارات أحدث
- When unsure which version is newer

---

## 🐛 استكشاف الأخطاء / Troubleshooting

### ❌ "Invalid backup format"
- تأكد أن الملف JSON صحيح
- Verify JSON file is valid
- تأكد من وجود `version` و `data`
- Ensure `version` and `data` exist

### ❌ "No company found for user"
- تأكد من تسجيل الدخول
- Ensure logged in
- تأكد من وجود شركة في حسابك
- Ensure company exists in account

### ❌ "Operation failed"
- تحقق من الاتصال بالإنترنت
- Check internet connection
- حاول مرة أخرى
- Try again
- إذا استمرت المشكلة، تواصل مع الدعم
- If persists, contact support

---

## 📞 الدعم / Support

إذا واجهتك أي مشكلة:
If you face any issue:

- 📧 Email: support@logledger-pro.com
- 🌐 Website: https://logledger-pro.com
- 💬 في التطبيق: الإعدادات → المساعدة
- 💬 In-app: Settings → Help

---

## 🔄 التحديثات المستقبلية / Future Updates

### قيد التطوير / In Development:
- [ ] نسخ احتياطي تلقائي مجدول
- [ ] Scheduled automatic backups
- [ ] رفع للسحابة (Google Drive, Dropbox)
- [ ] Cloud upload (Google Drive, Dropbox)
- [ ] ضغط الملفات
- [ ] File compression
- [ ] تشفير البيانات
- [ ] Data encryption

---

**آخر تحديث / Last Updated:** 27 أكتوبر 2025
**الإصدار / Version:** 1.0
**الحالة / Status:** ✅ مكتمل / Complete
