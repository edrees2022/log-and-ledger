import { describe, it, expect, beforeAll, vi } from 'vitest';
import express from 'express';
import session from 'express-session';
import request from 'supertest';
import type { Express } from 'express';

// Mock Firebase admin (not used by these routes, but keeps requireAuth happy)
vi.mock('../firebaseAdmin', () => ({
  verifyFirebaseToken: vi.fn(async () => ({ uid: 'u1', email: 'user@example.com' })),
}));

const createContact = vi.fn(async (payload: any) => ({ id: 'ct1', ...payload }));
const createItem = vi.fn(async (payload: any) => ({ id: 'it1', ...payload }));
const getTaxById = vi.fn(async (_id: string) => null);
const getAccountById = vi.fn(async (_id: string) => null);

vi.mock('../storage', () => ({
  storage: {
    createContact,
    createItem,
    getTaxById,
    getAccountById,
  }
}));

import { registerRoutes } from '../routes';

let server: any;

function makeApp(): Express {
  const app = express();
  app.use(express.json());
  app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));
  // Seed a fake session for requireAuth flows
  app.use((req, _res, next) => {
    (req as any).session = { userId: 'u1', companyId: 'c1' } as any;
    next();
  });
  return app;
}

beforeAll(async () => {
  const app = makeApp();
  server = await registerRoutes(app);
});

describe('Contacts & Items create routes', () => {
  it('POST /api/contacts creates a contact with sane defaults', async () => {
    const res = await request(server)
      .post('/api/contacts')
      .send({ name: 'Acme LLC', type: 'customer' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe('ct1');
    expect(createContact).toHaveBeenCalled();
    const payload = createContact.mock.calls[0][0];
    expect(payload.company_id).toBe('c1');
    expect(payload.currency).toBeDefined();
  });

  it('POST /api/items coerces numeric fields to strings and succeeds', async () => {
    const res = await request(server)
      .post('/api/items')
      .send({
        type: 'service',
        sku: 'SVC-1',
        name: 'Consulting',
        sales_price: 100,
        cost_price: 40,
        stock_quantity: 0,
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe('it1');
    expect(createItem).toHaveBeenCalled();
    const payload = createItem.mock.calls[0][0];
    // Drizzle decimal columns are strings; ensure coercion happened
    expect(typeof payload.sales_price).toBe('string');
    expect(typeof payload.cost_price).toBe('string');
    expect(payload.company_id).toBe('c1');
  });
});
