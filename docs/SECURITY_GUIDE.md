# 🛡️ دليل الحماية الأمنية - Log & Ledger

## نظرة عامة

هذا الدليل يشرح **كيفية تطبيق الحماية الأمنية** في التطبيق عملياً.

---

## 1. ✅ الإجراءات المطبقة حالياً

### الأمان الأساسي (موجود):
```typescript
// server/index.ts
✅ Helmet.js
✅ CSRF Protection  
✅ Express Session
✅ Firebase Authentication
✅ Drizzle ORM (SQL Injection Protection)
✅ HTTPS/TLS
```

---

## 2. 🔨 التحسينات المطلوبة

### المرحلة 1: تحسينات فورية (ضرورية!)

#### أ) تحسين Rate Limiting

**احمِ من:**
- Brute Force Attacks (محاولات تسجيل دخول متكررة)
- DDoS Attacks
- API Abuse

**كيف:**
```bash
npm install express-rate-limit
```

**الكود:**
```typescript
// server/security/rateLimiter.ts
import rateLimit from 'express-rate-limit';

// حماية تسجيل الدخول
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 محاولات فقط
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// حماية API العامة
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // دقيقة واحدة
  max: 100, // 100 طلب/دقيقة
  message: 'Too many requests, please slow down',
});

// حماية التسجيل
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة
  max: 3, // 3 حسابات فقط/ساعة
  message: 'Too many accounts created, please try again later',
});
```

**الاستخدام:**
```typescript
// server/routes.ts
import { loginLimiter, apiLimiter, registerLimiter } from './security/rateLimiter';

// تطبيق على جميع API
app.use('/api/', apiLimiter);

// تطبيق على تسجيل الدخول
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  // ...
});

// تطبيق على التسجيل
app.post('/api/auth/register', registerLimiter, async (req, res) => {
  // ...
});
```

---

#### ب) Audit Logs (سجل التدقيق)

**لماذا:**
- معرفة من فعل ماذا ومتى
- التحقيق في الأنشطة المشبوهة
- الامتثال القانوني

**الكود:**
```typescript
// server/utils/auditLog.ts
import { db } from './db';

export async function logAudit({
  userId,
  action,
  resource,
  resourceId,
  details,
  ipAddress,
  userAgent,
}: {
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  resource: string; // 'invoice', 'user', 'company'
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  await db.insert(auditLogs).values({
    userId,
    action,
    resource,
    resourceId,
    details: JSON.stringify(details),
    ipAddress,
    userAgent,
    timestamp: new Date(),
  });
}
```

**جدول قاعدة البيانات:**
```typescript
// shared/schema.ts
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 50 }).notNull(),
  resource: varchar('resource', { length: 100 }).notNull(),
  resourceId: uuid('resource_id'),
  details: jsonb('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});
```

**الاستخدام:**
```typescript
// مثال: عند حذف فاتورة
await logAudit({
  userId: req.user.id,
  action: 'DELETE',
  resource: 'sales_invoice',
  resourceId: invoiceId,
  details: { invoiceNumber: invoice.invoiceNumber },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

---

#### ج) Input Sanitization المتقدم

**احمِ من:**
- XSS Attacks
- NoSQL Injection
- Code Injection

**الكود:**
```bash
npm install validator dompurify isomorphic-dompurify
```

```typescript
// server/utils/sanitize.ts
import validator from 'validator';
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeInput(input: string): string {
  // إزالة HTML/JavaScript
  let clean = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
  
  // Trim whitespace
  clean = clean.trim();
  
  // Escape special characters
  clean = validator.escape(clean);
  
  return clean;
}

export function sanitizeEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  return validator.isEmail(trimmed) ? trimmed : null;
}

export function sanitizeNumber(input: any): number | null {
  const num = Number(input);
  return !isNaN(num) && isFinite(num) ? num : null;
}

export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  schema: Record<keyof T, 'string' | 'number' | 'email'>
): Partial<T> {
  const sanitized: Partial<T> = {};
  
  for (const [key, type] of Object.entries(schema)) {
    const value = obj[key as keyof T];
    
    switch (type) {
      case 'string':
        sanitized[key as keyof T] = sanitizeInput(String(value)) as any;
        break;
      case 'number':
        sanitized[key as keyof T] = sanitizeNumber(value) as any;
        break;
      case 'email':
        sanitized[key as keyof T] = sanitizeEmail(String(value)) as any;
        break;
    }
  }
  
  return sanitized;
}
```

**الاستخدام:**
```typescript
// مثال: في API endpoint
app.post('/api/invoices', async (req, res) => {
  const sanitized = sanitizeObject(req.body, {
    customerName: 'string',
    amount: 'number',
    email: 'email',
  });
  
  // استخدم البيانات النظيفة
  const invoice = await createInvoice(sanitized);
  res.json(invoice);
});
```

---

#### د) Security Headers محسنة

**الكود:**
```typescript
// server/security/headers.ts
import helmet from 'helmet';

export const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // للـ Vite في dev mode
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://pagead2.googlesyndication.com", // AdSense
      ],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: [
        "'self'",
        "https://*.firebase.com",
        "https://*.googleapis.com",
      ],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: [
        "'self'",
        "https://www.google.com", // AdSense
        "https://googleads.g.doubleclick.net",
      ],
    },
  },
  
  // Strict Transport Security (HTTPS only)
  hsts: {
    maxAge: 31536000, // سنة
    includeSubDomains: true,
    preload: true,
  },
  
  // No frame embedding (Clickjacking protection)
  frameguard: {
    action: 'deny',
  },
  
  // No MIME type sniffing
  noSniff: true,
  
  // XSS Filter
  xssFilter: true,
  
  // Hide X-Powered-By
  hidePoweredBy: true,
});
```

---

### المرحلة 2: ميزات إضافية (مستقبلاً)

#### هـ) المصادقة الثنائية (2FA)

**الكود (مثال):**
```typescript
// server/auth/2fa.ts
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export async function generate2FASecret(userId: string) {
  const secret = speakeasy.generateSecret({
    name: `Log & Ledger (${userId})`,
  });
  
  // حفظ secret في قاعدة البيانات
  await db.update(users)
    .set({ twoFactorSecret: secret.base32 })
    .where(eq(users.id, userId));
  
  // إنشاء QR Code
  const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
  
  return { secret: secret.base32, qrCode };
}

export function verify2FAToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // السماح بـ ±2 فترات زمنية
  });
}
```

---

#### و) IP Whitelisting (للشركات)

**الكود:**
```typescript
// server/middleware/ipWhitelist.ts
export function ipWhitelist(allowedIPs: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.socket.remoteAddress;
    
    if (allowedIPs.includes(clientIP!)) {
      next();
    } else {
      res.status(403).json({ error: 'Access denied from this IP' });
    }
  };
}

// الاستخدام
const companyIPs = ['192.168.1.100', '10.0.0.50'];
app.use('/api/companies/:id', ipWhitelist(companyIPs));
```

---

## 3. 🧪 اختبارات الأمان

### أ) اختبارات يدوية بسيطة

```bash
# 1. اختبار Rate Limiting
# جرب 10 محاولات login سريعة - يجب أن يُحظر
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done

# 2. اختبار SQL Injection
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{"customerName":"'; DROP TABLE users; --"}'
# يجب أن يفشل ولا يحذف الجدول

# 3. اختبار XSS
curl -X POST http://localhost:3000/api/companies \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert('hacked')</script>"}'
# يجب أن يُنظف أو يُرفض
```

### ب) أدوات اختبار احترافية

```bash
# OWASP ZAP (مجاني)
# https://www.zaproxy.org/

# Burp Suite Community (مجاني)
# https://portswigger.net/burp/communitydownload

# npm audit (للتحقق من ثغرات الحزم)
npm audit
npm audit fix
```

---

## 4. 📋 Checklist الأمان الشامل

### قبل الإطلاق:
- [ ] تحديث جميع الحزم (`npm audit fix`)
- [ ] تفعيل HTTPS (SSL Certificate)
- [ ] تغيير جميع كلمات المرور الافتراضية
- [ ] إزالة console.log من production
- [ ] تفعيل Rate Limiting
- [ ] مراجعة الصلاحيات (permissions)
- [ ] اختبار النسخ الاحتياطي والاستعادة
- [ ] إضافة Audit Logs
- [ ] مراجعة Security Headers
- [ ] اختبار Input Sanitization

### بعد الإطلاق:
- [ ] مراقبة Logs يومياً
- [ ] فحص أمني شهري
- [ ] تحديث الحزم أسبوعياً
- [ ] مراجعة Audit Logs أسبوعياً
- [ ] Backup Testing شهرياً
- [ ] Security Scan ربع سنوي

---

## 5. 🚨 خطة الطوارئ (Incident Response)

### إذا حدث اختراق:

#### خطوات فورية (خلال ساعة):
1. **عزل المشكلة:**
   ```bash
   # أوقف الخادم فوراً
   pkill -f "tsx server/index.ts"
   ```

2. **تغيير جميع كلمات المرور:**
   - قاعدة البيانات
   - Firebase
   - Hosting
   - جميع API Keys

3. **الإشعار:**
   - أخطر جميع المستخدمين عبر البريد الإلكتروني
   - انشر إشعاراً في التطبيق

#### خطوات التحقيق (خلال 24 ساعة):
4. **مراجعة Logs:**
   ```bash
   # فحص Audit Logs
   SELECT * FROM audit_logs 
   WHERE timestamp > NOW() - INTERVAL '24 hours'
   ORDER BY timestamp DESC;
   
   # فحص محاولات تسجيل الدخول
   SELECT * FROM audit_logs 
   WHERE action = 'LOGIN' 
   AND timestamp > NOW() - INTERVAL '24 hours';
   ```

5. **تحديد الثغرة:**
   - من أين دخل المخترق؟
   - ما الذي تم الوصول إليه؟
   - هل تم سرقة بيانات؟

6. **الإصلاح:**
   - أصلح الثغرة فوراً
   - نشر تحديث أمني
   - اختبر الإصلاح جيداً

#### خطوات ما بعد الحادث (خلال أسبوع):
7. **التقرير:**
   - اكتب تقرير مفصل
   - أخطر الجهات المعنية (إن لزم قانونياً)

8. **التحسين:**
   - حسّن الإجراءات الأمنية
   - أضف اختبارات جديدة
   - دَرِّب الفريق

---

## 6. 📚 مصادر إضافية

### دورات مجانية:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Academy](https://portswigger.net/web-security)
- [Google Security Best Practices](https://cloud.google.com/security/best-practices)

### أدوات مفيدة:
- [Security Headers](https://securityheaders.com/) - اختبر headers
- [SSL Labs](https://www.ssllabs.com/ssltest/) - اختبر SSL
- [Observatory by Mozilla](https://observatory.mozilla.org/) - فحص شامل

---

## 7. الخلاصة

### ✅ الأولويات:
1. **فوراً:** Rate Limiting + Input Sanitization
2. **هذا الأسبوع:** Audit Logs + Security Headers
3. **هذا الشهر:** 2FA + IP Whitelisting
4. **دائماً:** المراقبة والتحديث

### ⚠️ تذكر:
- **لا يوجد أمان مثالي 100%**
- **الأمان عملية مستمرة وليس حالة**
- **الوقاية خير من العلاج**

---

**أسئلة؟** security@logandledger.com
