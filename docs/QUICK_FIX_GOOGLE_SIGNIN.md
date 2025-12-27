# ⚡ إصلاح سريع - Google Sign-In

## 🎯 الخطوات المطلوبة الآن

### 1️⃣ SHA-1 للأندرويد (جاهز)
```
56:6F:90:14:87:45:7B:33:60:FD:28:14:B8:9F:4E:BA:5C:EE:10:78
```

### 2️⃣ اذهب إلى Google Cloud Console

**الرابط:** https://console.cloud.google.com/apis/credentials?project=log-and-ledger

**أنشئ 2 Client IDs:**

#### أ) Android Client ID
1. انقر "Create Credentials" → "OAuth client ID"
2. Application type: **Android**
3. Name: `Log & Ledger Android`
4. Package name: `com.logandledger.app`
5. SHA-1: `56:6F:90:14:87:45:7B:33:60:FD:28:14:B8:9F:4E:BA:5C:EE:10:78`
6. انقر Create
7. **احفظ Client ID** الذي سيظهر

#### ب) iOS Client ID
1. انقر "Create Credentials" → "OAuth client ID"
2. Application type: **iOS**
3. Name: `Log & Ledger iOS`
4. Bundle ID: `com.logandledger.app`
5. انقر Create
6. **احفظ Client ID** الذي سيظهر

### 3️⃣ تحديث الكود

**في ملف:** `client/src/lib/firebase.ts` (سطر 48)

استبدل:
```typescript
clientId: '808599419586-YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
```

بـ:
```typescript
clientId: 'YOUR_ACTUAL_IOS_CLIENT_ID_HERE.apps.googleusercontent.com',
```

**في ملف:** `capacitor.config.ts` (سطر 9)

استبدل:
```typescript
serverClientId: '808599419586-YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
```

بـ Web Client ID الموجود حالياً في Firebase (من: https://console.firebase.google.com/project/log-and-ledger/authentication/providers)

### 4️⃣ تفعيل في Firebase

1. اذهب: https://console.firebase.google.com/project/log-and-ledger/authentication/providers
2. انقر على Google
3. تأكد أنه **Enabled** (مفعّل)
4. إذا لم يكن مفعّل:
   - انقر Edit
   - فعّله
   - احفظ

### 5️⃣ إعادة البناء

```bash
cd "/Users/omar.matouki/TibrCode Apps/log_and_ledger_main"

# بناء المشروع
npm run build

# مزامنة
npx cap sync android

# بناء APK جديد
cd android
./gradlew clean assembleDebug

# نسخ للسطح المكتب
cp app/build/outputs/apk/debug/app-debug.apk ~/Desktop/LogAndLedger-FIXED.apk
```

### 6️⃣ تجربة

1. ثبّت APK الجديد على الهاتف
2. اضغط "Sign in with Google"
3. اختر حسابك
4. ✅ يجب أن يعمل!

## 🔍 إذا لم يعمل

تحقق من:
1. ✅ SHA-1 مضاف بشكل صحيح
2. ✅ Package name = `com.logandledger.app`
3. ✅ Client IDs محدثة في الكود
4. ✅ Google مفعّل في Firebase

---

**الوقت المتوقع:** 10-15 دقيقة ✨
