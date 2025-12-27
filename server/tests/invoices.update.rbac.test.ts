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
const updateSalesInvoice = vi.fn(async (_id: string, body: any) => ({ id: _id, ...body }));

vi.mock('../storage', () => ({
  storage: {
    getCompaniesByUserId,
    getUserById,
    updateSalesInvoice,
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

describe('RBAC on updating sales invoices', () => {
  const auth = { Authorization: 'Bearer test' };

  it('forbids viewer from updating an invoice', async () => {
    getUserById.mockResolvedValueOnce({ id: 'u1', role: 'viewer' });
    const res = await request(server).put('/api/sales/invoices/si1').set(auth).send({ status: 'approved' });
    expect(res.status).toBe(403);
  });

  it('allows accountant to update an invoice', async () => {
    getUserById.mockResolvedValueOnce({ id: 'u1', role: 'accountant' });
    const res = await request(server).put('/api/sales/invoices/si1').set(auth).send({ status: 'approved' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 'si1', status: 'approved' });
  });
});
