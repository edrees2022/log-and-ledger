# 🔐 إعداد Google Sign-In للتطبيق

## ⚠️ المشكلة الحالية
Google Sign-In لا يعمل على الموبايل (Android/iOS) لأنه يحتاج إعداد خاص.

## ✅ الحل المطبق

### 1. تثبيت Plugin
```bash
npm install @codetrix-studio/capacitor-google-auth --legacy-peer-deps
```

### 2. تحديث الكود
✅ تم تحديث `client/src/lib/firebase.ts`:
- استخدام Capacitor Google Auth للـ Native
- استخدام Popup للـ Web

## 🔧 خطوات الإعداد المطلوبة

### خطوة 1: إنشاء OAuth Client IDs في Google Cloud Console

1. **افتح:** https://console.cloud.google.com
2. **اختر المشروع:** `log-and-ledger`
3. **اذهب إلى:** APIs & Services → Credentials
4. **أنشئ 3 Client IDs:**

#### أ) Web Client ID (للموقع الإلكتروني)
- Type: Web application
- Name: `Log & Ledger Web`
- Authorized JavaScript origins:
  - `http://localhost:5173`
  - `https://yourdomain.com` (عند النشر)
- Authorized redirect URIs:
  - `http://localhost:5173/__/auth/handler`
  - `https://yourdomain.com/__/auth/handler`

#### ب) iOS Client ID
- Type: iOS
- Name: `Log & Ledger iOS`
- Bundle ID: `com.logandledger.app`

#### ج) Android Client ID
- Type: Android
- Name: `Log & Ledger Android`
- Package name: `com.logandledger.app`
- SHA-1 certificate fingerprint:
```bash
# للحصول على SHA-1:
cd android
./gradlew signingReport
# انسخ SHA-1 من debug أو release
```

### خطوة 2: تحديث Firebase Configuration

1. في `client/src/lib/firebase.ts` سطر 48:
```typescript
GoogleAuth.initialize({
  clientId: 'YOUR_IOS_CLIENT_ID_HERE.apps.googleusercontent.com', // من الخطوة 1(ب)
  scopes: ['profile', 'email'],
  grantOfflineAccess: true,
});
```

2. في `capacitor.config.ts`:
```typescript
GoogleAuth: {
  scopes: ['profile', 'email'],
  serverClientId: 'YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com', // من الخطوة 1(أ)
  forceCodeForRefreshToken: true,
},
```

### خطوة 3: تفعيل Google Sign-In في Firebase

1. افتح: https://console.firebase.google.com
2. اختر المشروع: `log-and-ledger`
3. اذهب إلى: Authentication → Sign-in method
4. فعّل Google:
   - انقر على Google
   - Enable
   - Web SDK configuration → اختر Web Client ID من الخطوة 1(أ)
   - احفظ

### خطوة 4: إعدادات iOS (في Xcode)

1. افتح المشروع:
```bash
npx cap open ios
```

2. في `Info.plist` أضف:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR_REVERSED_IOS_CLIENT_ID</string>
    </array>
  </dict>
</array>
```

**ملاحظة:** `YOUR_REVERSED_IOS_CLIENT_ID` = عكس iOS Client ID
مثال: إذا كان `123456-abc.apps.googleusercontent.com`
استخدم: `com.googleusercontent.apps.123456-abc`

### خطوة 5: إعدادات Android

1. افتح `android/app/build.gradle`
2. تأكد من وجود:
```gradle
dependencies {
    // ... existing dependencies
}
```

2. في `android/app/src/main/AndroidManifest.xml` لا حاجة لتعديلات (Plugin يتعامل تلقائياً)

### خطوة 6: إعادة البناء

```bash
# بناء المشروع
npm run build

# مزامنة مع Capacitor
npx cap sync

# بناء Android
cd android
./gradlew clean assembleDebug

# بناء iOS
npx cap open ios
# ثم Build في Xcode
```

## 🧪 الاختبار

### على Web:
```bash
npm run dev
# افتح http://localhost:5173
# جرّب Google Sign-In
```

### على Android:
1. ثبّت APK الجديد
2. اضغط "Sign in with Google"
3. يجب أن تظهر قائمة حسابات Google
4. اختر حساب
5. يجب أن يسجل الدخول بنجاح

### على iOS:
1. شغّل من Xcode
2. اضغط "Sign in with Google"
3. يجب أن تفتح Safari لإكمال المصادقة
4. يرجع للتطبيق تلقائياً

## 🔍 استكشاف الأخطاء

### خطأ: "12501: Sign in cancelled"
**السبب:** SHA-1 غير مطابق أو Client ID خاطئ
**الحل:** 
1. تأكد من SHA-1 في Google Console
2. تأكد من Package Name مطابق

### خطأ: "Unable to process request due to missing initial state"
**السبب:** sessionStorage غير متاح (ظهر في الصورة)
**الحل:** ✅ تم الحل بتطبيق Capacitor Google Auth

### خطأ: "API not enabled"
**السبب:** Google Sign-In API غير مفعل
**الحل:**
1. https://console.cloud.google.com
2. APIs & Services → Library
3. ابحث عن "Google+ API" وفعّله

## 📋 Checklist للتأكد

- [ ] تم إنشاء 3 Client IDs (Web, iOS, Android)
- [ ] تم تحديث `clientId` في firebase.ts
- [ ] تم تحديث `serverClientId` في capacitor.config.ts
- [ ] تم تفعيل Google Sign-In في Firebase Console
- [ ] تم إضافة URL Scheme في Info.plist (iOS)
- [ ] تم الحصول على SHA-1 وإضافته (Android)
- [ ] تم إعادة بناء المشروع
- [ ] تم اختبار التطبيق

## 🚀 بعد الإعداد

عند اكتمال جميع الخطوات:
```bash
npm run build
npx cap sync
cd android && ./gradlew assembleDebug
```

ثم ثبّت APK الجديد وجرّب Google Sign-In - يجب أن يعمل! ✅

---

**ملاحظة هامة:** هذه الخطوات ضرورية مرة واحدة فقط. بعدها Google Sign-In سيعمل على كل المنصات.
