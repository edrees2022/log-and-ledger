# 🔑 الحصول على Firebase Service Account Key

## الخطوات:

### 1️⃣ افتح Firebase Console
اذهب إلى: https://console.firebase.google.com/

### 2️⃣ اختر مشروعك
- اختر مشروع: **log-and-ledger**

### 3️⃣ اذهب إلى Project Settings
- اضغط على **⚙️ (الترس)** في الأعلى اليسار
- اختر **Project Settings**

### 4️⃣ اذهب إلى Service Accounts
- اضغط على تبويب **Service accounts**

### 5️⃣ أنشئ Private Key جديد
- اضغط على زر **Generate new private key**
- اضغط **Generate key**
- سيتم تنزيل ملف JSON

### 6️⃣ افتح الملف المنزّل
الملف سيكون مثل:
```
log-and-ledger-firebase-adminsdk-xxxxx-xxxxxxxxxx.json
```

### 7️⃣ انسخ محتوى الملف بالكامل
الملف سيكون بهذا الشكل:
```json
{
  "type": "service_account",
  "project_id": "log-and-ledger",
  "private_key_id": "xxxxxxxxxxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@log-and-ledger.iam.gserviceaccount.com",
  "client_id": "xxxxxxxxxxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40log-and-ledger.iam.gserviceaccount.com"
}
```

---

## ✅ استخدام المفتاح في DigitalOcean:

بعد الحصول على الملف:

1. **افتح الملف واضغط `Cmd+A` لتحديد كل المحتوى**
2. **انسخه `Cmd+C`**
3. **في DigitalOcean Environment Variables:**
   - Key: `FIREBASE_SERVICE_ACCOUNT_KEY`
   - Value: **الصق المحتوى بالكامل** (JSON كامل)
   - Encrypt: ✅ **نعم** (مهم جداً!)

---

## ⚠️ ملاحظات أمان:

- ❌ **لا تشارك هذا الملف أبداً**
- ❌ **لا ترفعه على GitHub**
- ✅ **استخدمه فقط في Environment Variables**
- ✅ **فعّل Encrypt في DigitalOcean**

---

## 🔄 البديل السريع:

إذا كنت تريد، يمكنني مساعدتك في تحديث كود Backend ليستخدم **Application Default Credentials** بدلاً من Service Account Key، وهذا أسهل وأكثر أماناً!

لكن لـ DigitalOcean، **Service Account Key هو الطريقة القياسية**.
