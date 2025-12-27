import { describe, it, expect, beforeAll, vi } from 'vitest';
import express from 'express';
import session from 'express-session';
import request from 'supertest';
import type { Express } from 'express';

// Mock Firebase admin (not used in taxes, but keeps consistency)
vi.mock('../firebaseAdmin', () => ({
  verifyFirebaseToken: vi.fn(async () => ({ uid: 'u1', email: 'user@example.com' })),
}));

const getCompaniesByUserId = vi.fn(async (_uid: string) => [{ id: 'c1' }]);
const getTaxesByCompany = vi.fn(async (_cid: string) => ([]));
const createTax = vi.fn(async (payload: any) => ({ id: 'tax1', ...payload }));
const updateTax = vi.fn(async (_id: string, payload: any) => ({ id: 'tax1', ...payload }));
const deleteTax = vi.fn(async (_id: string) => true);

vi.mock('../storage', () => ({
  storage: {
    getCompaniesByUserId,
    getTaxesByCompany,
    createTax,
    updateTax,
    deleteTax,
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

describe('Taxes CRUD routes', () => {
  it('GET /api/taxes returns list', async () => {
    const res = await request(server).get('/api/taxes');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(getTaxesByCompany).toHaveBeenCalledWith('c1');
  });

  it('POST /api/taxes creates new tax', async () => {
    const res = await request(server).post('/api/taxes').send({ name: 'VAT 15%', rate: '15', tax_type: 'vat', calculation_type: 'exclusive' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe('tax1');
    expect(createTax).toHaveBeenCalled();
  });

  it('PUT /api/taxes/:id updates a tax', async () => {
    const res = await request(server).put('/api/taxes/tax1').send({ name: 'VAT 10%' });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('tax1');
    expect(updateTax).toHaveBeenCalledWith('tax1', { name: 'VAT 10%' });
  });

  it('PUT /api/taxes/:id strips sensitive fields and coerces numeric rate', async () => {
    const res = await request(server)
      .put('/api/taxes/tax1')
      .send({ company_id: 'evil', created_by: 'attacker', id: 'other', rate: 7.5, name: 'VAT 7.5%' });

    expect(res.status).toBe(200);
    expect(updateTax).toHaveBeenCalled();
    const [, payload] = updateTax.mock.calls[0];
    expect(payload.company_id).toBeUndefined();
    expect(payload.created_by).toBeUndefined();
    expect(payload.id).toBeUndefined();
    expect(payload.rate).toBe('7.5');
    expect(payload.name).toBe('VAT 7.5%');
  });

  it('DELETE /api/taxes/:id deletes a tax', async () => {
    const res = await request(server).delete('/api/taxes/tax1');
    expect(res.status).toBe(200);
    expect(deleteTax).toHaveBeenCalledWith('tax1');
  });
});
