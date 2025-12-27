# 📱 دليل البناء والنشر - Log & Ledger Pro

**التاريخ:** 26 أكتوبر 2025  
**الإصدار:** 1.0.0

---

## ✅ الوضع الحالي

### 📦 البناء المستقل (Standalone)
تم تكوين التطبيق ليعمل **بشكل مستقل تماماً** بدون الحاجة لخادم خارجي:
- ✅ جميع الملفات مدمجة في APK/IPA
- ✅ البيانات تُحفظ محلياً (IndexedDB + Firebase)
- ✅ يعمل offline بعد التحميل الأول
- ✅ جاهز للنشر على Google Play و App Store

---

## 🌐 النسخ الثلاث

### 1️⃣ نسخة Android (APK)
**الملف:** `LogAndLedger-Android-Standalone.apk`  
**الحجم:** 8.6 MB  
**الموقع:** سطح المكتب

**البناء:**
```bash
npm run build
npx cap sync android
cd android
./gradlew assembleRelease  # للنشر
# أو
./gradlew assembleDebug    # للتجربة
```

**الملف الناتج:**
```
android/app/build/outputs/apk/release/app-release.apk
# أو
android/app/build/outputs/apk/debug/app-debug.apk
```

### 2️⃣ نسخة iOS (IPA)
**البناء:**
```bash
npm run build
npx cap sync ios
npx cap open ios
```
ثم في Xcode:
1. اختر Product → Archive
2. Distribute App → App Store Connect
3. أو Export لـ Ad-Hoc/Enterprise

**متطلبات:**
- حساب Apple Developer ($99/سنة)
- شهادة توقيع (Signing Certificate)
- Provisioning Profile

### 3️⃣ نسخة Web
**البناء:**
```bash
npm run build
```

**الملفات الناتجة:**
```
dist/public/
├── index.html
└── assets/
    ├── index-[hash].js
    └── index-[hash].css
```

**الرفع:**
انسخ محتويات `dist/public/` إلى:
- Vercel
- Netlify
- Firebase Hosting
- أي استضافة ويب

---

## 🔧 ملف الإعدادات

### capacitor.config.ts
```typescript
const config: CapacitorConfig = {
  appId: 'com.logandledger.app',
  appName: 'Log & Ledger Pro',
  webDir: 'dist/public',
  // لا يوجد server config = standalone
};
```

---

## 📊 الميزات المكتملة

### 🌍 الترجمات
✅ **17 لغة كاملة 100%:**
- 🇬🇧 English | 🇸🇦 العربية | 🇫🇷 Français
- ��🇪 Deutsch | 🇪🇸 Español | 🇵🇹 Português
- 🇨🇳 中文 | 🇯🇵 日本語 | 🇰🇷 한국어
- 🇷🇺 Русский | 🇮🇳 हिन्दी | 🇵🇰 اردو
- 🇧🇩 বাংলা | 🇹🇷 Türkçe | 🇵🇭 Tagalog
- 🇲🇾 Bahasa Melayu | 🇮🇩 Bahasa Indonesia

**إجمالي:** 41,189 مفتاح ترجمة (2,574 × 16 لغة)

### 💼 المحاسبة
- ✅ دفتر اليومية (Journal)
- ✅ دفتر الأستاذ (Ledger)
- ✅ الحسابات (Chart of Accounts)
- ✅ التقارير المالية
- ✅ الميزانية العمومية
- ✅ قائمة الدخل
- ✅ التدفقات النقدية

### 🚀 التقنيات
- React 18 + TypeScript
- TailwindCSS + shadcn/ui
- i18next (تعدد اللغات)
- IndexedDB (تخزين محلي)
- Firebase (السحابة)
- Capacitor (Native Mobile)
- AdMob (الإعلانات)

---

## 📲 متطلبات النشر

### Google Play Store
1. **حساب مطور:** $25 (دفعة واحدة)
2. **التطبيق موقّع:** استخدم `assembleRelease`
3. **ملف Keystore:**
```bash
keytool -genkey -v -keystore my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 \
  -validity 10000
```
4. **رفع AAB:** (أفضل من APK)
```bash
./gradlew bundleRelease
```

### Apple App Store
1. **حساب مطور:** $99/سنة
2. **Xcode:** أحدث إصدار
3. **شهادات:** في developer.apple.com
4. **App Store Connect:** إنشاء التطبيق
5. **TestFlight:** تجربة قبل النشر

### موقع ويب
1. **Domain:** (اختياري)
2. **Hosting:** مجاني على:
   - Vercel (موصى به)
   - Netlify
   - Firebase Hosting
   - GitHub Pages

---

## 🔐 ملاحظات الأمان

### للإنتاج (Production):
1. **أزل console.log** من الكود
2. **فعّل minification** (مفعل افتراضياً)
3. **غيّر Firebase config** في `client/src/lib/firebase.ts`
4. **أضف API Keys** الخاصة بك:
   - Firebase
   - AdMob
5. **فعّل HTTPS** للويب

---

## 🎯 خطوات النشر السريع

### للتجربة الآن:
✅ الملف جاهز على سطح المكتب:
```
~/Desktop/LogAndLedger-Android-Standalone.apk
```
- انسخه للهاتف
- ثبّته
- جرّب جميع الميزات

### للنشر الرسمي:
1. **Android:**
```bash
cd android
./gradlew bundleRelease
# الملف: android/app/build/outputs/bundle/release/app-release.aab
# ارفعه على play.google.com/console
```

2. **iOS:**
```bash
npx cap open ios
# في Xcode: Product → Archive → Distribute
```

3. **Web:**
```bash
npm run build
# ارفع dist/public/ على Vercel أو Netlify
```

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. **Android:** تحقق من `android/build/outputs/logs/`
2. **iOS:** راجع Xcode Console
3. **Web:** افتح Developer Tools (F12)

---

**✨ التطبيق جاهز للنشر!**

كل النسخ الثلاث (Android + iOS + Web) تعمل من نفس الكود المصدري.

---

## 📘 مرجع واجهات البرمجة (API)

### شكل الاستجابات الموحد
- نجاح 2xx: تُلف الاستجابة تلقائياً داخل { data }.
- حذف DELETE: تُرجع { success: true }.
- الأخطاء: شكل موحد { error, message } مع أكواد HTTP مناسبة.

للتفاصيل والأمثلة، راجع الملف:
- `API_RESPONSE_CONTRACT.md`
