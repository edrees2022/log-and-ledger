import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import express from 'express';
import session from 'express-session';
import request from 'supertest';
import type { Express } from 'express';

// Mock Firebase admin (used indirectly by some middlewares)
vi.mock('../firebaseAdmin', () => ({
  verifyFirebaseToken: vi.fn(async () => ({ uid: 'u1', email: 'user@example.com' })),
}));

// Storage mocks for orders
const createSalesOrder = vi.fn(async (payload: any) => ({ id: 'so1', ...payload }));
const getSalesOrdersByCompany = vi.fn(async (_companyId: string) => []);
const getSalesOrderById = vi.fn(async (id: string) => (id === 'so1' ? { id: 'so1', company_id: 'c1', order_number: 'SO-ABC', subtotal: '0', tax_total: '0', total: '0' } : null));
const updateSalesOrder = vi.fn(async (id: string, update: any) => (id === 'so1' ? { id: 'so1', company_id: 'c1', ...update } : null));
const deleteSalesOrder = vi.fn(async (_companyId: string, id: string) => id === 'so1');

const createPurchaseOrder = vi.fn(async (payload: any) => ({ id: 'po1', ...payload }));
const getPurchaseOrdersByCompany = vi.fn(async (_companyId: string) => []);
const getPurchaseOrderById = vi.fn(async (id: string) => (id === 'po1' ? { id: 'po1', company_id: 'c1', po_number: 'PO-ABC', subtotal: '0', tax_total: '0', total: '0' } : null));
const updatePurchaseOrder = vi.fn(async (id: string, update: any) => (id === 'po1' ? { id: 'po1', company_id: 'c1', ...update } : null));
const deletePurchaseOrder = vi.fn(async (_companyId: string, id: string) => id === 'po1');

vi.mock('../storage', () => ({
  storage: {
    // RBAC user lookup
    getUserById: vi.fn(async (_id: string) => ({ id: 'u1', role: 'admin' })),
    // Sales
    createSalesOrder,
    getSalesOrdersByCompany,
    getSalesOrderById,
    updateSalesOrder,
    deleteSalesOrder,
    // Purchases
    createPurchaseOrder,
    getPurchaseOrdersByCompany,
    getPurchaseOrderById,
    updatePurchaseOrder,
    deletePurchaseOrder,
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Sales Orders routes', () => {
  it('POST /api/sales/orders creates an order with defaults and validation', async () => {
    const res = await request(server)
      .post('/api/sales/orders')
      .send({ customer_id: 'cust1', currency: 'USD' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe('so1');
    expect(createSalesOrder).toHaveBeenCalled();
    const payload = createSalesOrder.mock.calls[0][0];
    expect(payload.company_id).toBe('c1');
    expect(payload.created_by).toBe('u1');
    // Ensure numeric-like fields exist and are strings
    expect(typeof payload.subtotal).toBe('string');
    expect(typeof payload.tax_total).toBe('string');
    expect(typeof payload.total).toBe('string');
  });

  it('PUT /api/sales/orders/:id coerces numeric fields and updates', async () => {
    const res = await request(server)
      .put('/api/sales/orders/so1')
      .send({ subtotal: 100.25, tax_total: 5.5, total: 105.75, fx_rate: 1 });

    expect(res.status).toBe(200);
    expect(updateSalesOrder).toHaveBeenCalled();
    const update = updateSalesOrder.mock.calls[0][1];
    expect(typeof update.subtotal).toBe('string');
    expect(typeof update.tax_total).toBe('string');
    expect(typeof update.total).toBe('string');
    expect(typeof update.fx_rate).toBe('string');
  });

  it('PUT /api/sales/orders/:id strips sensitive fields from update payload', async () => {
    const res = await request(server)
      .put('/api/sales/orders/so1')
      .send({ company_id: 'evil', created_by: 'attacker', id: 'other', subtotal: 10 });

    expect(res.status).toBe(200);
    expect(updateSalesOrder).toHaveBeenCalled();
    const update = updateSalesOrder.mock.calls[0][1];
    expect(update.company_id).toBeUndefined();
    expect(update.created_by).toBeUndefined();
    expect(update.id).toBeUndefined();
    // keep allowed fields
    expect(update.subtotal).toBe('10');
  });

  it('PUT /api/sales/orders/:id returns 403 for viewer role', async () => {
    const { storage } = await import('../storage');
    (storage.getUserById as any).mockResolvedValueOnce({ id: 'u1', role: 'viewer' });
    const res = await request(server)
      .put('/api/sales/orders/so1')
      .send({ subtotal: '10' });
    expect(res.status).toBe(403);
  });
});

describe('Purchase Orders routes', () => {
  it('POST /api/purchases/orders creates an order', async () => {
    const res = await request(server)
      .post('/api/purchases/orders')
      .send({ supplier_id: 'sup1', currency: 'USD' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe('po1');
    expect(createPurchaseOrder).toHaveBeenCalled();
    const payload = createPurchaseOrder.mock.calls[0][0];
    expect(payload.company_id).toBe('c1');
    expect(payload.created_by).toBe('u1');
  });

  it('GET /api/purchases/orders/:id returns 404 if company mismatch', async () => {
    // Mock a mismatch for this specific call
    getPurchaseOrderById.mockResolvedValueOnce({ id: 'po1', company_id: 'other', po_number: 'X', subtotal: '0', tax_total: '0', total: '0' });
    const res = await request(server).get('/api/purchases/orders/po1');
    expect(res.status).toBe(404);
  });

  it('DELETE /api/purchases/orders/:id returns success when deleted', async () => {
    const res = await request(server).delete('/api/purchases/orders/po1');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true });
    expect(deletePurchaseOrder).toHaveBeenCalledWith('c1', 'po1');
  });

  it('DELETE /api/purchases/orders/:id returns 403 for accountant (owner/admin only)', async () => {
    const { storage } = await import('../storage');
    (storage.getUserById as any).mockResolvedValueOnce({ id: 'u1', role: 'accountant' });
    const res = await request(server).delete('/api/purchases/orders/po1');
    expect(res.status).toBe(403);
  });

  it('PUT /api/purchases/orders/:id strips sensitive fields from update payload', async () => {
    const res = await request(server)
      .put('/api/purchases/orders/po1')
      .send({ company_id: 'evil', created_by: 'attacker', id: 'other', total: 99 });

    expect(res.status).toBe(200);
    expect(updatePurchaseOrder).toHaveBeenCalled();
    const update = updatePurchaseOrder.mock.calls[0][1];
    expect(update.company_id).toBeUndefined();
    expect(update.created_by).toBeUndefined();
    expect(update.id).toBeUndefined();
    expect(update.total).toBe('99');
  });
});
