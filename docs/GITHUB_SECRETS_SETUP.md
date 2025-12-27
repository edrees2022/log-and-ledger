# 🔐 GitHub Secrets Setup Guide

## نظرة عامة
هذا الدليل يشرح كيفية إعداد GitHub Secrets المطلوبة للـ CI/CD automation.

---

## الخطوات التفصيلية

### 1. الانتقال إلى إعدادات GitHub Repository

1. افتح المتصفح واذهب إلى: https://github.com/tibrcode/log-and-ledger
2. اضغط على **Settings** (في شريط القوائم العلوي)
3. من القائمة الجانبية اليسرى، اضغط على **Secrets and variables** → **Actions**

---

### 2. إضافة Secrets المطلوبة

اضغط على **"New repository secret"** لكل secret من القائمة التالية:

#### 🔴 **Secret 1: PRODUCTION_DATABASE_URL** (مطلوب - P0)

**الاسم:**
```
PRODUCTION_DATABASE_URL
```

**القيمة:**
```
postgresql://username:password@host/database?sslmode=require
```

**كيفية الحصول عليها:**
- إذا كنت تستخدم **Neon**: 
  1. افتح https://console.neon.tech
  2. اختر المشروع الخاص بك
  3. اضغط على **Connection Details**
  4. انسخ **Connection string** (يبدأ بـ `postgresql://`)

- إذا كنت تستخدم **Render Postgres**:
  1. افتح https://dashboard.render.com
  2. اختر قاعدة البيانات الخاصة بك
  3. انسخ **External Connection String**

**الأهمية:** 🔴 مطلوب لتشغيل migrations على الإنتاج قبل deployment

---

#### 🔴 **Secret 2: RENDER_DEPLOY_HOOK_URL** (مطلوب - P0)

**الاسم:**
```
RENDER_DEPLOY_HOOK_URL
```

**القيمة:**
```
https://api.render.com/deploy/srv-xxxxxxxxxxxxx?key=yyyyyyyyyyy
```

**كيفية الحصول عليها:**
1. افتح https://dashboard.render.com
2. اختر الـ **Web Service** الخاص بالـ Backend
3. اذهب إلى **Settings**
4. انزل إلى **Deploy Hook**
5. اضغط **Create Deploy Hook**
6. انسخ الـ URL الذي يظهر

**الأهمية:** 🔴 مطلوب لتفعيل deployment تلقائياً بعد نجاح migrations

---

#### 🟡 **Secret 3: SENTRY_DSN** (اختياري - P2)

**الاسم:**
```
SENTRY_DSN
```

**القيمة:**
```
https://xxxxxxxxxxxxxxxxxxxxx@xxxxx.ingest.sentry.io/xxxxxxx
```

**كيفية الحصول عليها:**
1. افتح https://sentry.io (أو أنشئ حساب جديد مجاني)
2. اضغط **Create Project**
3. اختر **Node.js** كـ Platform
4. سمّي المشروع: `log-and-ledger-backend`
5. بعد إنشاء المشروع، انسخ **DSN** من Settings

**الخطة المجانية:**
- ✅ 5,000 خطأ شهرياً
- ✅ Performance monitoring
- ✅ 1 user
- ✅ 90 days history

**الأهمية:** 🟡 اختياري لكن موصى به بشدة - يتيح تتبع الأخطاء والأداء

---

#### 🟢 **Secret 4: REDIS_URL** (اختياري - P2)

**الاسم:**
```
REDIS_URL
```

**القيمة:**
```
redis://default:xxxxxxxxxxxxxx@region.upstash.io:port
```

**كيفية الحصول عليها:**

**خيار A: Upstash (موصى به)**
1. افتح https://upstash.com (أو أنشئ حساب مجاني)
2. اضغط **Create Database**
3. اختر:
   - Type: **Regional**
   - Region: قريب من موقع Render الخاص بك
   - Name: `log-ledger-cache`
4. بعد الإنشاء، اذهب إلى **Details**
5. انسخ **Redis Connect URL**

**الخطة المجانية:**
- ✅ 10,000 commands يومياً
- ✅ 256 MB memory
- ✅ TLS encryption

**خيار B: Redis Cloud**
1. افتح https://redis.com/try-free/
2. أنشئ حساب وقاعدة بيانات جديدة
3. انسخ Connection String

**الأهمية:** 🟢 اختياري - يحسن الأداء بنسبة 50% عبر caching

---

## 3. التحقق من الإعداد

بعد إضافة كل Secrets:

1. يجب أن تظهر في القائمة تحت **Actions secrets**
2. لن تستطيع رؤية القيم بعد الحفظ (هذا طبيعي للأمان)
3. يمكنك تحديثها بالضغط على **Update** بجانب كل secret

---

## 4. اختبار CI/CD

بعد إضافة جميع Secrets:

1. اعمل commit جديد ثم push:
   ```bash
   git add .
   git commit -m "test: verify CI/CD pipeline"
   git push
   ```

2. اذهب إلى: https://github.com/tibrcode/log-and-ledger/actions

3. ستشاهد workflows يتم تشغيلها:
   - ✅ **CI** - يختبر الكود والـ migrations
   - ✅ **Deploy** - يطبق migrations ثم ينشر على Render

---

## 5. الحد الأدنى المطلوب

**للبدء الآن (P0):**
- ✅ `PRODUCTION_DATABASE_URL`
- ✅ `RENDER_DEPLOY_HOOK_URL`

**للإنتاج الاحترافي (P2):**
- ✅ `SENTRY_DSN` (تتبع الأخطاء)
- ✅ `REDIS_URL` (تحسين الأداء)

---

## 6. ملاحظات أمنية 🔒

- ❌ **لا تشارك** هذه القيم أبداً في الكود
- ✅ **استخدم** `.env` للتطوير المحلي فقط
- ✅ **استخدم** GitHub Secrets للإنتاج
- ✅ **غيّر** Secrets إذا تم تسريبها
- ✅ **استخدم** sslmode=require في DATABASE_URL

---

## ✅ Checklist

- [ ] PRODUCTION_DATABASE_URL مضاف
- [ ] RENDER_DEPLOY_HOOK_URL مضاف
- [ ] SENTRY_DSN مضاف (اختياري)
- [ ] REDIS_URL مضاف (اختياري)
- [ ] تم اختبار CI/CD بعمل push
- [ ] الـ workflows تعمل بنجاح

---

**بعد إتمام هذه الخطوات، سيكون لديك:**
- ✅ Automated testing على كل push
- ✅ Migration safety (لن ينشر كود إذا فشلت migrations)
- ✅ Zero-downtime deployments
- ✅ Error tracking (مع Sentry)
- ✅ Performance optimization (مع Redis)

**🎉 نظام CI/CD احترافي كامل!**
