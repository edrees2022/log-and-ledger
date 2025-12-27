import { describe, it, expect, beforeAll, vi } from 'vitest';
import express from 'express';
import session from 'express-session';
import request from 'supertest';
import type { Express } from 'express';

vi.mock('../firebaseAdmin', () => ({
  verifyFirebaseToken: vi.fn(async () => ({ uid: 'u1', email: 'user@example.com' })),
}));

const getCompaniesByUserId = vi.fn(async (_uid: string) => [{ id: 'c1' }]);
const getUserById = vi.fn(async (_uid: string) => ({ id: 'u1', role: 'viewer' }));
const deletePayment = vi.fn(async (_companyId: string, _id: string) => true);
const deleteReceipt = vi.fn(async (_companyId: string, _id: string) => true);

vi.mock('../storage', () => ({
  storage: {
    getCompaniesByUserId,
    getUserById,
    deletePayment,
    deleteReceipt,
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

describe('RBAC on deleting payments/receipts', () => {
  const auth = { Authorization: 'Bearer test' };

  it('forbids viewer from deleting a payment', async () => {
    getUserById.mockResolvedValueOnce({ id: 'u1', role: 'viewer' });
    const res = await request(server).delete('/api/banking/payments/p1').set(auth);
    expect(res.status).toBe(403);
  });

  it('allows accountant to delete a payment', async () => {
    getUserById.mockResolvedValueOnce({ id: 'u1', role: 'accountant' });
    deletePayment.mockResolvedValueOnce(true);
    const res = await request(server).delete('/api/banking/payments/p1').set(auth);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true });
  });

  it('forbids viewer from deleting a receipt', async () => {
    getUserById.mockResolvedValueOnce({ id: 'u1', role: 'viewer' });
    const res = await request(server).delete('/api/banking/receipts/r1').set(auth);
    expect(res.status).toBe(403);
  });

  it('allows accountant to delete a receipt', async () => {
    getUserById.mockResolvedValueOnce({ id: 'u1', role: 'accountant' });
    deleteReceipt.mockResolvedValueOnce(true);
    const res = await request(server).delete('/api/banking/receipts/r1').set(auth);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true });
  });
});
