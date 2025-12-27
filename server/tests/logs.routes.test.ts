// @ts-nocheck
import { describe, it, expect, beforeAll, vi, afterAll } from 'vitest';
import express from 'express';
import session from 'express-session';
import request from 'supertest';
import type { Express } from 'express';

// Minimal storage/auth mocks used by registerRoutes context
vi.mock('../firebaseAdmin', () => ({
  verifyFirebaseToken: vi.fn(async () => ({ uid: 'u1', email: 'user@example.com' })),
}));

vi.mock('../storage', () => ({
  storage: {
    getCompaniesByUserId: vi.fn(async (_uid: string) => [{ id: 'c1' }]),
  }
}));

import { registerRoutes } from '../routes';

let server: any;
let consoleSpy: ReturnType<typeof vi.spyOn>;

function makeApp(): Express {
  const app = express();
  app.use(express.json());
  app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));
  return app;
}

beforeAll(async () => {
  const app = makeApp();
  server = await registerRoutes(app);
  consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  consoleSpy?.mockRestore();
});

describe('Client logs endpoint', () => {
  it('accepts a client error payload and redacts sensitive fields', async () => {
    const payload = {
      message: 'TypeError: x is not a function',
      name: 'TypeError',
      stack: 'TypeError: x is not a function\n    at Component (App.tsx:10:5)',
      componentStack: 'in App > in ErrorBoundary',
      token: 'supersecret',
      password: 'dontlogme',
      nested: { refresh_token: 'ultra-secret' },
    } as any;

    const res = await request(server).post('/api/logs').send(payload);
    expect(res.status).toBe(200);

    // Find the last call to console.log containing CLIENT-ERROR
    const calls = consoleSpy.mock.calls.map(args => (args?.[1] ? String(args[1]) : String(args?.[0] ?? '')));
    const last = calls.reverse().find((s) => s.includes('CLIENT-ERROR')) || '';
    expect(last).toContain('[REDACTED]');
    expect(last).not.toContain('supersecret');
    expect(last).not.toContain('dontlogme');
  });

  it('applies rate limiting after many requests', async () => {
    const payload = { message: 'x', name: 'Error' } as any;
    let got429 = false;
    for (let i = 0; i < 30; i++) {
      const res = await request(server).post('/api/logs').send(payload);
      if (res.status === 429) {
        got429 = true;
        break;
      }
    }
    expect(got429).toBe(true);
  });
});
