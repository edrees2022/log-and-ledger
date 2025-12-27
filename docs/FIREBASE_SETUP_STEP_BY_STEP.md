# 🔴 حل مشكلة [28444] - خطوة بخطوة مع الصور

## ⚠️ المشكلة الحالية:

```
[28444] Developer console is not set up correctly.
فشل تسجيل الدخول بجوجل.
```

**السبب**: `google-services.json` الحالي **مزيّف** ويحتوي على:
```json
"client_id": "808599419586-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
```

## 📋 خطوات الحل (10 دقائق):

---

### الخطوة 1️⃣: افتح Firebase Console

🔗 **الرابط المباشر**: https://console.firebase.google.com/project/log-and-ledger/settings/general

يجب أن تسجل دخول بحساب Google الذي يملك المشروع.

---

### الخطوة 2️⃣: اذهب لإعدادات المشروع

في صفحة Firebase:
- اضغط على **⚙️ رمز الإعدادات** (أعلى اليسار بجانب "Project Overview")
- اختر **"Project settings"** من القائمة

---

### الخطوة 3️⃣: أضف Android App

ستجد في الصفحة قسم **"Your apps"**.

**إذا لم يكن هناك Android app**:
1. اضغط زر **"Add app"** أو **Android icon (🤖)**
2. ستفتح نافذة "Add Firebase to your Android app"

**إذا كان هناك Android app بالفعل**:
- تخطى للخطوة 4️⃣

---

### الخطوة 4️⃣: أدخل معلومات التطبيق

املأ النموذج:

#### **Android package name** (مطلوب):
```
com.logandledger.app
```
⚠️ **يجب أن يكون مطابق بالضبط!** انسخه والصقه.

#### **App nickname** (اختياري):
```
Log & Ledger Android
```

#### **Debug signing certificate SHA-1** (مطلوب):
```
56:6F:90:14:87:45:7B:33:60:FD:28:14:B8:9F:4E:BA:5C:EE:10:78
```
⚠️ **انسخه بالكامل والصقه في الحقل**

---

### الخطوة 5️⃣: سجّل التطبيق

اضغط زر **"Register app"** أو **"Next"**.

Firebase سيعالج التسجيل (5-10 ثواني).

---

### الخطوة 6️⃣: حمّل google-services.json

بعد التسجيل مباشرة، ستظهر صفحة **"Download config file"**:

1. اضغط زر **"Download google-services.json"**
2. الملف سيتم تحميله في مجلد **Downloads** على جهازك
3. اضغط **"Next"** في Firebase (يمكنك تخطي باقي الخطوات)

---

### الخطوة 7️⃣: تحقق من الملف المحمّل

افتح الملف في محرر نصوص (مثل TextEdit أو VS Code):

```bash
# في Terminal:
cat ~/Downloads/google-services.json | grep client_id
```

يجب أن ترى شيء مثل:
```json
"client_id": "808599419586-abc123def456ghi789jkl012mno345pqr.apps.googleusercontent.com"
```

⚠️ **إذا رأيت xxxxxx، الملف خاطئ! حمّله مرة أخرى.**

---

### الخطوة 8️⃣: استبدل الملف في المشروع

#### الطريقة 1 - باستخدام Terminal:

```bash
# اذهب لمجلد المشروع
cd "/Users/omar.matouki/TibrCode Apps/log_and_ledger_main"

# احذف الملف القديم المزيّف
rm android/app/google-services.json

# انسخ الملف الحقيقي من Downloads
cp ~/Downloads/google-services.json android/app/

# تحقق من النسخ
ls -lh android/app/google-services.json
```

#### الطريقة 2 - باستخدام Finder:

1. افتح **Finder**
2. اذهب إلى **Downloads**
3. اسحب ملف `google-services.json`
4. أفلته في مجلد `android/app/` في VS Code

---

### الخطوة 9️⃣: تحقق من المحتوى

```bash
# تأكد أن الملف لا يحتوي على xxxxx
grep "client_id" android/app/google-services.json
```

يجب أن **لا ترى** أي `xxxxx` - فقط أرقام وحروف حقيقية.

---

### الخطوة 🔟: أبني APK جديد

```bash
# بناء Frontend
npm run build:frontend

# مزامنة Capacitor
npx cap sync android

# بناء APK
cd android && ./gradlew assembleDebug

# APK الجديد سيكون في:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## ✅ اختبار النتيجة:

1. انقل APK الجديد للموبايل
2. ثبّته (سيستبدل النسخة القديمة)
3. افتح التطبيق
4. اضغط **"Sign in with Google"**
5. اختر حسابك
6. ✅ **يجب أن يعمل بدون أي أخطاء!**

---

## 🔍 إذا ما زالت المشكلة موجودة:

### تحقق من الخطوات التالية:

#### 1. هل الملف تم استبداله فعلاً؟
```bash
cat android/app/google-services.json | grep client_id
```
إذا رأيت `xxxxx` → **لم يتم الاستبدال!**

#### 2. هل Package Name صحيح؟
```bash
grep applicationId android/app/build.gradle
```
يجب أن يظهر: `applicationId "com.logandledger.app"`

#### 3. هل SHA-1 تم إضافته في Firebase؟
اذهب إلى Firebase Console > Project Settings > Your apps > Android app
يجب أن ترى SHA-1 في قسم "SHA certificate fingerprints"

#### 4. هل APK الجديد تم تثبيته؟
تحقق من **تاريخ ووقت** APK:
```bash
ls -lh android/app/build/outputs/apk/debug/app-debug.apk
```

يجب أن يكون التاريخ **بعد** استبدال google-services.json

---

## 🆘 مساعدة إضافية:

### لا يمكنني الوصول إلى Firebase Console
- تحقق أنك مسجل دخول بالحساب الصحيح
- الحساب يجب أن يكون Owner أو Editor للمشروع

### لا أجد "Add app" في Firebase
- تأكد أنك في صفحة "Project Settings"
- ابحث عن قسم "Your apps"
- قد يكون Android app موجود بالفعل - ابحث عن `com.logandledger.app`

### الملف المحمّل ما زال يحتوي على xxxxx
- هذا يعني أن Firebase لم يُنشئ التطبيق بعد
- تأكد من إضافة SHA-1 بشكل صحيح
- جرّب حذف التطبيق وإضافته مرة أخرى

### كيف أعرف أن الملف صحيح؟
الملف الصحيح سيحتوي على شيء مثل:
```json
{
  "project_info": {
    "project_number": "808599419586",
    "project_id": "log-and-ledger"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:808599419586:android:...",
        "android_client_info": {
          "package_name": "com.logandledger.app"
        }
      },
      "oauth_client": [
        {
          "client_id": "808599419586-abc123...xyz789.apps.googleusercontent.com",
          "client_type": 1
        },
        {
          "client_id": "808599419586-def456...uvw012.apps.googleusercontent.com",
          "client_type": 3
        }
      ]
    }
  ]
}
```

الأرقام والحروف يجب أن تكون **حقيقية**، ليس `xxx`.

---

## 📞 إذا احتجت مساعدة:

أرسل لي:
1. Screenshot من Firebase Console (صفحة Project Settings > Your apps)
2. نتيجة هذا الأمر:
   ```bash
   cat android/app/google-services.json | grep -A5 "oauth_client"
   ```

وسأساعدك مباشرة! 🤝

---

**🔥 لا يمكن تجاوز هذه الخطوة - google-services.json الحقيقي مطلوب 100%!**

**بدونه، Google Sign-In لن يعمل أبداً.**
