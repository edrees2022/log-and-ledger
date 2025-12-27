# 🚀 Deployment Guide - Backend على Railway

## المشكلة
Vercel Serverless **لا يدعم**:
- ❌ WebSocket connections
- ❌ Long-running processes
- ❌ Database connection pooling

## الحل: Railway.app

### الخطوات:

#### 1️⃣ إنشاء حساب على Railway
- اذهب إلى: https://railway.app
- سجل دخول بـ GitHub

#### 2️⃣ Deploy Backend
```bash
# في Railway Dashboard:
1. اضغط "New Project"
2. اختر "Deploy from GitHub repo"
3. اختر: tibrcode/log-and-ledger
4. انتظر البناء (2-3 دقائق)
```

#### 3️⃣ إضافة Environment Variables
في Railway Dashboard → Variables:
```
DATABASE_URL=postgresql://...
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account"...}
NODE_ENV=production
PORT=3000
```

#### 4️⃣ الحصول على Backend URL

بعد النشر، Railway سيعطيك URL مجاني:

**الطريقة 1: Domain مجاني من Railway**
1. في Railway → Settings → Domains
2. اضغط "Generate Domain"
3. ستحصل على: `https://log-and-ledger-production.up.railway.app`

**الطريقة 2: Custom Domain (اختياري)**
1. في Railway → Settings → Domains → "Custom Domain"
2. أدخل: `api.logledger-pro.com`
3. Railway سيعطيك CNAME
4. أضف CNAME في مزود الدومين:
   ```
   Type: CNAME
   Name: api
   Value: <Railway CNAME>
   TTL: Auto
   ```
5. انتظر 5-10 دقائق للـ DNS propagation

#### 5️⃣ تحديث Frontend

في Vercel → Settings → Environment Variables:
```
VITE_API_URL=https://your-railway-app.up.railway.app
```

أو للـ custom domain:
```
VITE_API_URL=https://api.logledger-pro.com
```

ثم أعد deploy الـ Frontend:
```bash
# في Vercel Dashboard:
Deployments → Redeploy
```

#### 6️⃣ Deploy Frontend على Vercel
```bash
git add -A
git commit -m "Update API URL to Railway backend"
git push
```

## ✅ النتيجة
- **Backend**: Railway (يدعم كل شيء) ✅
- **Frontend**: Vercel (سريع وممتاز) ✅
- **Database**: Neon PostgreSQL ✅

## 💰 التكلفة
Railway يعطي:
- **$5 credit شهرياً مجاناً**
- كافي لتطبيق صغير/متوسط

## 🔄 البديل: Render.com
نفس الخطوات، لكن على: https://render.com
- مجاني 100% (لكن أبطأ قليلاً)
- نفس التوافق مع WebSocket

---

## 📞 المساعدة
إذا واجهت مشكلة، أخبرني وسأساعدك خطوة بخطوة! 🚀
