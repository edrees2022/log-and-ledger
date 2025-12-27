# 🔐 إعداد Google Sign-In الكامل - خطوة بخطوة

## 📋 المعلومات الجاهزة

### ✅ لديك بالفعل:
- ✅ Firebase Project: `log-and-ledger`
- ✅ Firebase Project ID: `log-and-ledger`
- ✅ Firebase App ID: `1:808599419586:web:2f3f1754703d652987595b`
- ✅ SHA-1 للأندرويد: `56:6F:90:14:87:45:7B:33:60:FD:28:14:B8:9F:4E:BA:5C:EE:10:78`
- ✅ Package Name: `com.logandledger.app`
- ✅ Bundle ID (iOS): `com.logandledger.app`

---

## 🚀 الخطوة 1: تفعيل Google Sign-In في Firebase

### افتح Firebase Console:
**الرابط المباشر:** https://console.firebase.google.com/project/log-and-ledger/authentication/providers

### الخطوات:
1. ابحث عن **Google** في قائمة Sign-in providers
2. إذا كان مفعّل (Enabled) بالفعل → تخطى للخطوة 2
3. إذا لم يكن مفعّل:
   - انقر على Google
   - فعّل المفتاح (Enable)
   - **Web SDK configuration:** سيظهر Web Client ID تلقائياً
   - انسخ هذا Web Client ID (مهم جداً!)
   - احفظ

**مثال Web Client ID:**
```
808599419586-xxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

---

## 🔧 الخطوة 2: إنشاء OAuth Client IDs في Google Cloud

### افتح Google Cloud Console:
**الرابط المباشر:** https://console.cloud.google.com/apis/credentials?project=log-and-ledger

### أ) إنشاء Android Client ID

1. انقر **Create Credentials** → **OAuth client ID**
2. Application type: **Android**
3. Name: `Log & Ledger Android`
4. Package name: `com.logandledger.app`
5. SHA-1 certificate fingerprint:
   ```
   56:6F:90:14:87:45:7B:33:60:FD:28:14:B8:9F:4E:BA:5C:EE:10:78
   ```
6. انقر **Create**
7. ستظهر رسالة نجاح (لا تحتاج حفظ Client ID للأندرويد)

### ب) إنشاء iOS Client ID

1. انقر **Create Credentials** → **OAuth client ID**
2. Application type: **iOS**
3. Name: `Log & Ledger iOS`
4. Bundle ID: `com.logandledger.app`
5. انقر **Create**
6. **⚠️ مهم:** احفظ iOS Client ID الذي سيظهر!

**مثال iOS Client ID:**
```
808599419586-yyyyyyyyyyyyyyyy.apps.googleusercontent.com
```

---

## 📝 الخطوة 3: تحديث الكود

### أ) في ملف `client/src/lib/firebase.ts`

**ابحث عن السطر 48 تقريباً:**
```typescript
clientId: '808599419586-YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
```

**استبدله بـ iOS Client ID من الخطوة 2(ب):**
```typescript
clientId: '808599419586-yyyyyyyyyyyyyyyy.apps.googleusercontent.com',
```

### ب) في ملف `capacitor.config.ts`

**ابحث عن السطر 9 تقريباً:**
```typescript
serverClientId: '808599419586-YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
```

**استبدله بـ Web Client ID من الخطوة 1:**
```typescript
serverClientId: '808599419586-xxxxxxxxxxxxxxxxx.apps.googleusercontent.com',
```

---

## 🍎 الخطوة 4: إعدادات iOS (في Xcode)

### افتح المشروع:
```bash
npx cap open ios
```

### في Xcode:

1. **افتح ملف Info.plist:**
   - في المجلد: App → App → Info.plist

2. **أضف URL Scheme:**
   - انقر بزر الماوس الأيمن → Open As → Source Code
   - ابحث عن `</dict>` قبل `</plist>` في نهاية الملف
   - أضف هذا الكود قبل `</dict>`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <!-- استبدل بـ Reversed iOS Client ID -->
      <string>com.googleusercontent.apps.808599419586-yyyyyyyyyyyyyyyy</string>
    </array>
  </dict>
</array>
```

**⚠️ مهم:** استبدل `808599419586-yyyyyyyyyyyyyyyy` بـ iOS Client ID الخاص بك بدون `.apps.googleusercontent.com`

**مثال:**
- إذا كان iOS Client ID: `808599419586-abc123def456.apps.googleusercontent.com`
- استخدم: `com.googleusercontent.apps.808599419586-abc123def456`

---

## 🏗️ الخطوة 5: إعادة البناء

### أ) بناء المشروع:
```bash
cd "/Users/omar.matouki/TibrCode Apps/log_and_ledger_main"

# بناء الويب
npm run build

# مزامنة مع Capacitor
npx cap sync
```

### ب) بناء Android:
```bash
cd android
./gradlew clean assembleDebug

# نسخ APK إلى سطح المكتب
cp app/build/outputs/apk/debug/app-debug.apk ~/Desktop/LogAndLedger-GoogleAuth.apk
```

### ج) بناء iOS (في Xcode):
```bash
npx cap open ios
```
ثم في Xcode:
- Product → Build
- أو شغّل على Simulator/جهاز حقيقي

---

## 🧪 الخطوة 6: الاختبار

### على Android:
1. ثبّت APK الجديد: `LogAndLedger-GoogleAuth.apk`
2. افتح التطبيق
3. اضغط **"Sign in with Google"**
4. اختر حساب Google
5. ✅ يجب أن يسجل الدخول بنجاح!

### على iOS:
1. شغّل من Xcode (على Simulator أو جهاز)
2. اضغط **"Sign in with Google"**
3. سيفتح Safari أو صفحة Google
4. اختر حساب Google
5. ✅ يرجع للتطبيق تلقائياً مع تسجيل دخول ناجح!

---

## 🔍 استكشاف الأخطاء

### خطأ: "12501: Sign in cancelled"
**السبب:** SHA-1 غير صحيح أو Package Name خاطئ
**الحل:**
1. تأكد من SHA-1 في Google Cloud Console
2. تأكد من Package Name = `com.logandledger.app`
3. أعد إنشاء Android Client ID

### خطأ: "Unable to process request"
**السبب:** Client IDs غير محدثة في الكود
**الحل:**
1. تحقق من `firebase.ts` → iOS Client ID
2. تحقق من `capacitor.config.ts` → Web Client ID
3. أعد البناء

### خطأ: "API not enabled"
**السبب:** Google Sign-In API غير مفعل
**الحل:**
1. افتح: https://console.cloud.google.com/apis/library
2. ابحث عن "Google Sign-In"
3. فعّله

### iOS: لا يفتح Safari
**السبب:** URL Scheme غير صحيح في Info.plist
**الحل:**
1. تحقق من Reversed Client ID
2. تأكد أنه بدون `.apps.googleusercontent.com`

---

## ✅ Checklist النهائي

قبل الاختبار تأكد من:

- [ ] ✅ تم تفعيل Google في Firebase Console
- [ ] ✅ تم حفظ Web Client ID
- [ ] ✅ تم إنشاء Android Client ID (مع SHA-1)
- [ ] ✅ تم إنشاء iOS Client ID
- [ ] ✅ تم تحديث `firebase.ts` بـ iOS Client ID
- [ ] ✅ تم تحديث `capacitor.config.ts` بـ Web Client ID
- [ ] ✅ تم إضافة URL Scheme في Info.plist (iOS)
- [ ] ✅ تم إعادة البناء (`npm run build && npx cap sync`)
- [ ] ✅ تم بناء APK جديد للأندرويد

---

## 🎉 النتيجة النهائية

بعد إكمال جميع الخطوات:

✅ **Android:** Google Sign-In يعمل بشكل مثالي
✅ **iOS:** Google Sign-In يعمل بشكل مثالي  
✅ **Web:** Google Sign-In يعمل بشكل مثالي

**مجاني 100%، موثوق، سريع!**

---

## 📞 إذا احتجت مساعدة

1. تحقق من الـ Checklist أعلاه
2. راجع رسائل الخطأ
3. تأكد من Client IDs صحيحة
4. أعد البناء والاختبار

**الوقت المتوقع للإعداد الكامل: 15-20 دقيقة** ⏱️
