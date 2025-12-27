# ⚡ البداية السريعة - Google Sign-In

## 🎯 3 خطوات رئيسية فقط!

---

## 🔥 الخطوة 1: Firebase (5 دقائق)

### افتح هذا الرابط:
👉 **https://console.firebase.google.com/project/log-and-ledger/authentication/providers**

### ما ستفعله:
1. ابحث عن **Google** في القائمة
2. إذا كان مفعّل → انسخ **Web Client ID** (احتفظ به!)
3. إذا لم يكن مفعّل → فعّله وانسخ **Web Client ID**

**Web Client ID سيكون بهذا الشكل:**
```
808599419586-xxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

✅ **احفظ هذا في ملف نصي!**

---

## ☁️ الخطوة 2: Google Cloud (5 دقائق)

### افتح هذا الرابط:
👉 **https://console.cloud.google.com/apis/credentials?project=log-and-ledger**

### ما ستفعله:

#### أ) Android Client ID:
1. Create Credentials → OAuth client ID
2. Type: **Android**
3. Name: `Log & Ledger Android`
4. Package: `com.logandledger.app`
5. SHA-1: `56:6F:90:14:87:45:7B:33:60:FD:28:14:B8:9F:4E:BA:5C:EE:10:78`
6. Create → تم! ✅

#### ب) iOS Client ID:
1. Create Credentials → OAuth client ID
2. Type: **iOS**
3. Name: `Log & Ledger iOS`
4. Bundle ID: `com.logandledger.app`
5. Create
6. **احفظ iOS Client ID** الذي سيظهر!

**iOS Client ID سيكون بهذا الشكل:**
```
808599419586-yyyyyyyyyyyyyyyy.apps.googleusercontent.com
```

✅ **احفظ هذا في نفس الملف النصي!**

---

## 💻 الخطوة 3: تحديث الكود (5 دقائق)

### طريقة 1: السكريبت التلقائي ⚡

```bash
cd "/Users/omar.matouki/TibrCode Apps/log_and_ledger_main"
./update-client-ids.sh
```

السكريبت سيطلب منك:
1. Web Client ID (من الخطوة 1)
2. iOS Client ID (من الخطوة 2)

ويحدث الملفات تلقائياً! ✨

### طريقة 2: يدوياً 📝

#### في ملف `client/src/lib/firebase.ts`:
ابحث عن السطر 48 وغيّر:
```typescript
clientId: 'YOUR_IOS_CLIENT_ID_HERE.apps.googleusercontent.com',
```

#### في ملف `capacitor.config.ts`:
ابحث عن السطر 9 وغيّر:
```typescript
serverClientId: 'YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com',
```

---

## �� البناء والتجربة

```bash
# بناء المشروع
npm run build

# مزامنة
npx cap sync

# بناء Android
cd android
./gradlew clean assembleDebug

# نسخ APK
cp app/build/outputs/apk/debug/app-debug.apk ~/Desktop/LogAndLedger-GoogleAuth.apk
```

---

## ✅ Checklist السريع

قبل الاختبار:
- [ ] ✅ حصلت على Web Client ID من Firebase
- [ ] ✅ أنشأت Android Client ID في Google Cloud
- [ ] ✅ أنشأت iOS Client ID في Google Cloud
- [ ] ✅ حدثت الكود (عبر السكريبت أو يدوياً)
- [ ] ✅ بنيت المشروع (`npm run build && npx cap sync`)
- [ ] ✅ بنيت APK جديد

---

## 📞 المساعدة

**إذا واجهت مشكلة:**
1. راجع `COMPLETE_GOOGLE_SETUP.md` للتفاصيل الكاملة
2. تأكد من نسخ Client IDs بالكامل (بدون مسافات)
3. أعد بناء المشروع بعد التحديث

---

## 🎉 النتيجة

بعد التثبيت:
✅ اضغط "Sign in with Google"
✅ اختر حسابك
✅ تسجيل دخول فوري!

**الوقت الإجمالي: ~15 دقيقة** ⏱️
**مجاني 100%** 💰
**يعمل على Android + iOS + Web** 🌍
