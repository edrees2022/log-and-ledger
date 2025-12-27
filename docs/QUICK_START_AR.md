# 🚀 دليل سريع - نشر التطبيق

## الخطوات البسيطة:

### 1️⃣ نشر Backend على Railway (5 دقائق)

1. **افتح**: https://railway.app
2. **سجل دخول** بحساب GitHub
3. **اضغط**: "New Project"
4. **اختر**: "Deploy from GitHub repo"
5. **اختر**: `tibrcode/log-and-ledger`
6. **أضف Environment Variables**:
   - اضغط على المشروع → Variables → Raw Editor
   - انسخ الصق:
   ```
   DATABASE_URL=نفس_قيمة_Vercel_هنا
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account"...}
   NODE_ENV=production
   ```
7. **انتظر 3 دقائق** للـ deployment

### 2️⃣ احصل على الـ Domain

1. **في Railway**: اضغط على المشروع
2. **Settings → Domains**
3. **اضغط**: "Generate Domain"
4. **انسخ الـ URL**: مثلاً `https://log-and-ledger-production.up.railway.app`

### 3️⃣ حدّث Frontend على Vercel

1. **افتح**: https://vercel.com
2. **اضغط على**: log-and-ledger project
3. **Settings → Environment Variables**
4. **أضف**:
   ```
   Name: VITE_API_URL
   Value: https://log-and-ledger-production.up.railway.app
   ```
   (استخدم الـ URL من الخطوة السابقة)
5. **اضغط**: Save
6. **Deployments → Redeploy** (أحدث deployment)

### 4️⃣ جرب الموقع! 🎉

افتح: https://www.logledger-pro.com

يجب أن يعمل الآن بدون أخطاء! ✅

---

## 🌐 إضافة Domain مخصص (اختياري)

إذا تريد استخدام `api.logledger-pro.com` بدلاً من Railway domain:

### في Railway:
1. **Settings → Domains → Custom Domain**
2. **أدخل**: `api.logledger-pro.com`
3. **انسخ الـ CNAME** الذي يعطيك Railway

### في Namecheap/GoDaddy (مزود الدومين):
1. **اذهب إلى**: DNS Management
2. **أضف CNAME Record**:
   ```
   Type: CNAME
   Host: api
   Value: <Railway CNAME من الخطوة السابقة>
   TTL: Automatic
   ```
3. **اضغط**: Save
4. **انتظر 10 دقائق** للـ DNS propagation

### حدّث Vercel:
في Environment Variables، غيّر:
```
VITE_API_URL=https://api.logledger-pro.com
```

---

## 💡 نصائح

### التكلفة:
- **Railway**: $5 شهرياً مجاناً (كافي لتطبيق صغير)
- **Vercel**: مجاني للـ Frontend
- **المجموع**: مجاني! 🎉

### إذا واجهت مشكلة:
1. تأكد من Environment Variables صحيحة
2. تأكد من Railway deployment نجح (شيك logs)
3. جرب الـ API مباشرة: `https://your-railway-app.up.railway.app/api/companies`

---

## 📞 المساعدة

إذا لم يعمل شيء، أرسل لي:
1. Railway deployment logs
2. Vercel deployment logs
3. Browser console errors

وسأساعدك فوراً! 🚀
