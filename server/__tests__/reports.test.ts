import express from 'express';
import request from 'supertest';
import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import { registerRoutes } from '../routes';
import { storage } from '../storage';

// Mock firebase admin verification to always succeed
vi.mock('../firebaseAdmin', () => ({
  verifyFirebaseToken: vi.fn(async (_token: string) => ({
    uid: 'test-uid',
    email: 'tester@example.com',
  })),
}));

// Some helpers
const authHeader = { Authorization: 'Bearer FAKE_TOKEN' };

describe('Reports API smoke tests', () => {
  let app: express.Express;

  beforeAll(async () => {
    app = express();
    // Important to match server/index.ts middleware expectations
    app.set('trust proxy', 1);
    await registerRoutes(app);
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects unauthenticated access to /api/reports/tax', async () => {
    const res = await request(app).get('/api/reports/tax');
    expect(res.status).toBe(401);
  });

  it('returns tax overview report with default filters', async () => {
    // Arrange: companies and report stub
    vi.spyOn(storage, 'getCompaniesByUserId').mockResolvedValueOnce([{ id: 'comp_1' } as any]);
    const reportStub = {
      salesTax: { taxableSales: 1000, collectedTax: 150 },
      purchaseTax: { taxablePurchases: 400, recoverable: 60, paidTax: 60 },
      period: { start: null, end: null },
    };
    const spy = vi.spyOn(storage, 'getTaxReport').mockResolvedValueOnce(reportStub as any);

    // Act
    const res = await request(app)
      .get('/api/reports/tax')
      .set(authHeader);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(reportStub);
    expect(spy).toHaveBeenCalledWith('comp_1', undefined, undefined, { customerId: undefined, vendorId: undefined, currency: undefined, warehouseId: undefined });
  });

  it('passes query filters through to storage.getTaxReport', async () => {
    vi.spyOn(storage, 'getCompaniesByUserId').mockResolvedValueOnce([{ id: 'comp_1' } as any]);
    vi.spyOn(storage, 'getTaxReport').mockResolvedValueOnce({ ok: true } as any);

    const res = await request(app)
      .get('/api/reports/tax')
      .query({ startDate: '2024-01-01', endDate: '2024-01-31', customerId: 'cust_1', vendorId: 'vend_2', currency: 'SAR', warehouseId: 'wh_3' })
      .set(authHeader);

    expect(res.status).toBe(200);
    // ensure was called with parsed dates and filters
    const calls = (storage.getTaxReport as any).mock.calls;
    expect(calls.length).toBe(1);
    const [companyId, start, end, filters] = calls[0];
    expect(companyId).toBe('comp_1');
    expect(start instanceof Date).toBe(true);
    expect(end instanceof Date).toBe(true);
    expect(filters).toMatchObject({ customerId: 'cust_1', vendorId: 'vend_2', currency: 'SAR', warehouseId: 'wh_3' });
  });

  it('returns tax report by taxId and respects filters', async () => {
    vi.spyOn(storage, 'getCompaniesByUserId').mockResolvedValueOnce([{ id: 'comp_1' } as any]);
    const spy = vi.spyOn(storage, 'getTaxReportByTaxId').mockResolvedValueOnce({ taxId: 'tax_vat', total: 123 } as any);

    const res = await request(app)
      .get('/api/reports/taxes/tax_vat')
      .query({ startDate: '2024-02-01', endDate: '2024-02-29', customerId: 'cust_X', currency: 'USD', warehouseId: 'wh_X' })
      .set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ taxId: 'tax_vat' });
    const [companyId, taxId, start, end, filters] = spy.mock.calls[0];
    expect(companyId).toBe('comp_1');
    expect(taxId).toBe('tax_vat');
    expect(start instanceof Date).toBe(true);
    expect(end instanceof Date).toBe(true);
    expect(filters).toMatchObject({ customerId: 'cust_X', vendorId: undefined, currency: 'USD', warehouseId: 'wh_X' });
  });

  it('lists warehouses for current company', async () => {
    vi.spyOn(storage, 'getCompaniesByUserId').mockResolvedValueOnce([{ id: 'comp_1' } as any]);
    vi.spyOn(storage, 'getWarehousesByCompany').mockResolvedValueOnce([
      { id: 'wh_1', name: 'Main' },
      { id: 'wh_2', name: 'Secondary' },
    ] as any);

    const res = await request(app)
      .get('/api/warehouses')
      .set(authHeader);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });
});
