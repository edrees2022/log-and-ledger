import express from 'express';
import request from 'supertest';
import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';

// Mock firebase admin verification to always succeed (must be declared before importing routes)
vi.mock('../../server/firebaseAdmin', () => ({
  verifyFirebaseToken: vi.fn(async (_token: string) => ({
    uid: 'test-uid',
    email: 'tester@example.com',
  })),
}));

// Mock DB pool module to avoid requiring a real DATABASE_URL
vi.mock('../../server/db', () => ({
  pool: {
    query: vi.fn(async () => ({})),
  },
}));

// Mock storage module BEFORE importing routes to avoid initializing DB
const getCompaniesByUserId = vi.fn(async (_uid: string) => [{ id: 'comp_1' }]);
const getTaxReport = vi.fn(async () => ({ ok: true }));
const getTaxReportByTaxId = vi.fn(async () => ({ ok: true }));
const getWarehousesByCompany = vi.fn(async () => [{ id: 'wh1' }]);

vi.mock('../../server/storage', () => ({
  storage: {
    getCompaniesByUserId,
    getTaxReport,
    getTaxReportByTaxId,
    getWarehousesByCompany,
  },
}));

const authHeader = { Authorization: 'Bearer FAKE_TOKEN' };

describe('Tax Reports routes', () => {
  let app: express.Express;
  let registerRoutes: any;

  beforeAll(async () => {
    // Dynamically import after mocks are set up
    ({ registerRoutes } = await import('../../server/routes'));
    app = express();
    app.set('trust proxy', 1);
    await registerRoutes(app);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/reports/tax requires auth', async () => {
    const res = await request(app).get('/api/reports/tax');
    expect(res.status).toBe(401);
  });

  it('GET /api/reports/tax returns raw report without jurisdiction', async () => {
    getCompaniesByUserId.mockResolvedValueOnce([{ id: 'comp_1' }]);
    const reportStub = {
      salesTax: { taxableSales: 1000, collectedTax: 150 },
      purchaseTax: { taxablePurchases: 400, recoverable: 60, paidTax: 60 },
      period: { start: null, end: null },
    };
    getTaxReport.mockResolvedValueOnce(reportStub as any);

    const res = await request(app).get('/api/reports/tax').set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(reportStub);
    expect(getTaxReport).toHaveBeenCalled();
  });

  it('GET /api/reports/taxes/:taxId respects filters', async () => {
    getCompaniesByUserId.mockResolvedValueOnce([{ id: 'comp_1' }]);
    getTaxReportByTaxId.mockResolvedValueOnce({ taxId: 'vat', total: 10 } as any);

    const res = await request(app)
      .get('/api/reports/taxes/vat')
      .query({ startDate: '2024-02-01', endDate: '2024-02-29', customerId: 'c1', currency: 'USD', warehouseId: 'wh1' })
      .set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('taxId', 'vat');
    const [companyId, taxId, start, end, filters] = (getTaxReportByTaxId as any).mock.calls[0];
    expect(companyId).toBe('comp_1');
    expect(taxId).toBe('vat');
    expect(start instanceof Date).toBe(true);
    expect(end instanceof Date).toBe(true);
    expect(filters).toMatchObject({ customerId: 'c1', currency: 'USD', warehouseId: 'wh1' });
  });

  it('GET /api/warehouses returns list', async () => {
    getCompaniesByUserId.mockResolvedValueOnce([{ id: 'comp_1' }]);
    getWarehousesByCompany.mockResolvedValueOnce([{ id: 'wh1' }, { id: 'wh2' }] as any);

    const res = await request(app).get('/api/warehouses').set(authHeader);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it('GET /api/reports/tax with jurisdiction=sa adds compliance summary', async () => {
    getCompaniesByUserId.mockResolvedValueOnce([{ id: 'comp_1' }]);
    // collected 150, recoverable 60 => net 90 payable
    getTaxReport.mockResolvedValueOnce({
      salesTax: { taxableSales: 1000, collectedTax: 150 },
      purchaseTax: { taxablePurchases: 400, recoverable: 60, paidTax: 60 },
      period: { start: null, end: null },
    } as any);

    const res = await request(app)
      .get('/api/reports/tax')
      .query({ jurisdiction: 'sa' })
      .set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('compliance');
    expect(res.body.compliance).toMatchObject({ jurisdiction: 'SA' });
    expect(res.body.compliance.summary).toMatchObject({ payable: 90 });
  });
});
