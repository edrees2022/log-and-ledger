import { describe, it, expect, beforeAll, vi } from 'vitest';
import express from 'express';
import session from 'express-session';
import request from 'supertest';
import type { Express } from 'express';

// Mock Firebase admin verification to always succeed
vi.mock('../firebaseAdmin', () => ({
  verifyFirebaseToken: vi.fn(async () => ({ uid: 'u1', email: 'user@example.com' })),
}));

// Storage mocks configurable per-test
const getCompaniesByUserId = vi.fn(async (_uid: string) => [{ id: 'c1' }]);
const getUserById = vi.fn(async (_uid: string) => ({ id: 'u1', role: 'viewer' }));
const deleteBill = vi.fn(async (_companyId: string, _id: string) => true);

vi.mock('../storage', () => ({
  storage: {
    getCompaniesByUserId,
    getUserById,
    deleteBill,
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

describe('RBAC on deleting bills', () => {
  const auth = { Authorization: 'Bearer test' };

  it('forbids viewer from deleting a bill', async () => {
    getUserById.mockResolvedValueOnce({ id: 'u1', role: 'viewer' });
    const res = await request(server).delete('/api/purchases/bills/b1').set(auth);
    expect(res.status).toBe(403);
  });

  it('allows admin to delete a bill', async () => {
    getUserById.mockResolvedValueOnce({ id: 'u1', role: 'admin' });
    deleteBill.mockResolvedValueOnce(true);
    const res = await request(server).delete('/api/purchases/bills/b1').set(auth);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true });
  });
});
