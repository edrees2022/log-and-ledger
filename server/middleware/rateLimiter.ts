import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis, isRedisAvailable } from '../redis';
import { logger } from '../logger';

// Custom handler to log rate limit violations
const rateLimitHandler = (req: any, res: any) => {
  logger.warn(
    {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get('user-agent'),
    },
    'Rate limit exceeded'
  );
  res.status(429).json({
    error: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  });
};

// Create Redis store if available, otherwise use in-memory
function createStore() {
  if (isRedisAvailable() && redis) {
    console.log('✅ Using Redis-backed rate limiting (distributed)');
    return new RedisStore({
      // @ts-expect-error - Upstash Redis is compatible
      sendCommand: (...args: string[]) => redis.call(...args),
    });
  }
  console.log('ℹ️ Using in-memory rate limiting (single instance)');
  return undefined; // Falls back to memory store
}

// حماية تسجيل الدخول - 5 محاولات كل 15 دقيقة
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 محاولات فقط
  message: {
    error: 'Too many login attempts from this IP, please try again after 15 minutes',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: rateLimitHandler,
  store: createStore(),
});

// حماية التسجيل - 3 حسابات كل ساعة
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 3, // 3 حسابات فقط
  message: {
    error: 'Too many accounts created from this IP, please try again later',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: createStore(),
});

// حماية API العامة - 100 طلب في الدقيقة
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // دقيقة واحدة
  max: 100, // 100 طلب/دقيقة
  message: {
    error: 'Too many requests from this IP, please slow down',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  // Skip rate limit for health checks
  skip: (req) => req.path.startsWith('/api/health'),
  store: createStore(),
});

// حماية API الحساسة (حذف، تعديل) - 30 طلب في الدقيقة
export const sensitiveLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // دقيقة واحدة
  max: 30, // 30 طلب/دقيقة
  message: {
    error: 'Too many sensitive operations, please slow down',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: createStore(),
});

// حماية استرجاع كلمة المرور - 3 محاولات كل ساعة
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 3, // 3 محاولات فقط
  message: {
    error: 'Too many password reset attempts, please try again later',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: createStore(),
});

// حماية سجلّات الأخطاء من العميل - 20 طلب/دقيقة
export const logsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // دقيقة واحدة
  max: 20,
  message: {
    error: 'Too many error reports, please slow down',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: createStore(),
});

// حماية التقارير - 20 طلب/دقيقة (التقارير عمليات مكلفة)
export const reportsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // دقيقة واحدة
  max: 20,
  message: {
    error: 'Too many report requests, please slow down',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: createStore(),
});

// حماية العمليات الجماعية - 10 طلبات كل دقيقة
export const bulkOperationsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // دقيقة واحدة
  max: 10,
  message: {
    error: 'Too many bulk operations, please slow down',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: createStore(),
});

// AI Usage Limiter - 10 requests per minute (Burst protection)
export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  message: {
    error: 'Too many AI requests, please slow down',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: createStore(),
});
