import { describe, it, expect, beforeAll, vi } from 'vitest';
import express from 'express';
import session from 'express-session';
import request from 'supertest';
import type { Express } from 'express';

// Mock Firebase admin verification to always succeed
vi.mock('../firebaseAdmin', () => ({
  verifyFirebaseToken: vi.fn(async () => ({ uid: 'u1', email: 'user@example.com' })),
}));

// Mock storage minimal functions used by bill routes
const getBillById = vi.fn(async (id: string) => (id === 'b1' ? { id: 'b1', company_id: 'c1', bill_number: 'BILL-1', total: '100' } : null));
vi.mock('../storage', () => ({
  storage: {
    getCompaniesByUserId: vi.fn(async (_uid: string) => [{ id: 'c1' }]),
    getBillById,
  }
}));

import { registerRoutes } from '../routes';

let server: any;

function makeApp(): Express {
  const app = express();
  app.use(express.json());
  app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));
  return app;
}

beforeAll(async () => {
  const app = makeApp();
  server = await registerRoutes(app);
});

describe('Bills routes', () => {
  const auth = { Authorization: 'Bearer test' };

  it('GET /api/purchases/bills/:id returns bill when found', async () => {
    const res = await request(server).get('/api/purchases/bills/b1').set(auth);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 'b1', bill_number: 'BILL-1' });
  });

  it('GET /api/purchases/bills/:id returns 404 when not found', async () => {
    const res = await request(server).get('/api/purchases/bills/unknown').set(auth);
    expect(res.status).toBe(404);
  });
});
