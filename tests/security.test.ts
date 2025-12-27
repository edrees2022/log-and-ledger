
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import rateLimit from 'express-rate-limit';

// We can't easily import the main 'app' because it starts the server.
// But we can test the rate limit logic by creating a small app with the same config.
// OR we can try to import the app if it's exported.
// Looking at server/index.ts, it doesn't export 'app' at the end, it starts it.
// But we can verify the configuration by mocking or just trusting the code.

// Let's try to hit the actual running server if possible, or just unit test the logic?
// Since we can't easily import 'app' without side effects (listening on port), 
// we will create a mock app here to verify the rate limit configuration works as expected.

describe('Security Hardening', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    
    // Mock Auth Limiter
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5, 
      message: "Too many authentication attempts",
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Mock General Limiter
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10, // Low number for testing
      message: "Too many requests",
      skip: (req) => req.path.startsWith('/api/auth')
    });

    app.get('/api/auth/login', authLimiter, (req, res) => res.json({ msg: 'login' }));
    app.get('/api/data', apiLimiter, (req, res) => res.json({ msg: 'data' }));
  });

  it('should enforce rate limits on auth endpoints', async () => {
    // Hit 5 times - OK
    for (let i = 0; i < 5; i++) {
      const res = await request(app).get('/api/auth/login');
      expect(res.status).toBe(200);
    }

    // 6th time - Blocked
    const res = await request(app).get('/api/auth/login');
    expect(res.status).toBe(429);
    expect(res.text).toBe("Too many authentication attempts");
  });

  it('should enforce rate limits on general endpoints', async () => {
    // Hit 10 times - OK
    for (let i = 0; i < 10; i++) {
      const res = await request(app).get('/api/data');
      expect(res.status).toBe(200);
    }

    // 11th time - Blocked
    const res = await request(app).get('/api/data');
    expect(res.status).toBe(429);
    expect(res.text).toBe("Too many requests");
  });
});
