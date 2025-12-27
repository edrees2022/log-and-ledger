import { describe, it, expect, beforeAll, vi } from 'vitest';
import express from 'express';
import session from 'express-session';
import request from 'supertest';
import type { Express } from 'express';

// Mock Firebase admin verification to always succeed
vi.mock('../firebaseAdmin', () => ({
  verifyFirebaseToken: vi.fn(async () => ({ uid: 'u1', email: 'user@example.com' })),
}));

// Minimal storage mock
vi.mock('../storage', () => ({
  storage: {
    getCompaniesByUserId: vi.fn(async (_uid: string) => [{ id: 'c1' }]),
    getReceiptsByCompany: vi.fn(async (_cid: string) => ([{ id: 'r1', company_id: 'c1', customer_id: 'cust1', amount: '100', date: new Date().toISOString() }])),
    getPaymentsByCompany: vi.fn(async (_cid: string) => ([])),
    getSalesInvoicesByCompany: vi.fn(async (_cid: string) => ([{ id: 'inv1', company_id: 'c1', customer_id: 'cust1', total: '100', date: new Date().toISOString(), invoice_number: 'INV-1' }])),
    getBillsByCompany: vi.fn(async (_cid: string) => ([])),
    getSalesInvoiceById: vi.fn(async (id: string) => ({ id, total: '100' })),
    getBillById: vi.fn(async (id: string) => ({ id, total: '100' })),
  }
}));

// Mock payment allocation helpers used by routes
const allocatePaymentSpy = vi.fn(async () => {});
const getUnallocatedAmountMock = vi.fn(async (_type: 'receipt'|'payment', _id: string) => 100);
const getTotalAllocatedMock = vi.fn(async (_docType: 'invoice'|'bill', _id: string) => 0);
const getRecentAllocationsMock = vi.fn(async (_companyId: string, _limit?: number) => ([{
  id: 'alloc1',
  company_id: 'c1',
  payment_type: 'receipt',
  payment_id: 'r1',
  document_type: 'invoice',
  document_id: 'inv1',
  allocated_amount: '100',
  allocation_date: new Date().toISOString(),
  payment_details: { id: 'r1', amount: '100' },
  document_details: { id: 'inv1', invoice_number: 'INV-1', total: '100' },
}]));
const deletePaymentAllocationMock = vi.fn(async (_id: string) => {});
const getAllocationByIdMock = vi.fn(async (id: string) => ({ id, company_id: 'c1', document_type: 'invoice', document_id: 'inv1' }));

vi.mock('../utils/paymentAllocation', () => ({
  allocatePayment: allocatePaymentSpy,
  getUnallocatedAmount: getUnallocatedAmountMock,
  getTotalAllocated: getTotalAllocatedMock,
  getRecentAllocations: getRecentAllocationsMock,
  deletePaymentAllocation: deletePaymentAllocationMock,
  getAllocationById: getAllocationByIdMock,
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

describe('Reconciliation routes', () => {
  const auth = { Authorization: 'Bearer test' };

  it('returns suggestions for matching receipts to invoices', async () => {
    const res = await request(server)
      .get('/api/banking/reconciliation/suggestions')
      .set(auth);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.receipts)).toBe(true);
    expect(res.body.receipts.length).toBeGreaterThan(0);
    expect(res.body.receipts[0].suggestions[0].documentType).toBe('invoice');
  });

  it('allocates a match successfully', async () => {
    const res = await request(server)
      .post('/api/banking/reconciliation/allocate')
      .set(auth)
      .send({ paymentType: 'receipt', paymentId: 'r1', documentType: 'invoice', documentId: 'inv1', amount: 100 });
    expect(res.status).toBe(200);
    expect(allocatePaymentSpy).toHaveBeenCalledOnce();
  });

  it('rejects allocation when receipt is not owned by company', async () => {
    allocatePaymentSpy.mockClear();
    // storage.getReceiptsByCompany mocked to return only r1, so using rX should 404
    const res = await request(server)
      .post('/api/banking/reconciliation/allocate')
      .set(auth)
      .send({ paymentType: 'receipt', paymentId: 'rX', documentType: 'invoice', documentId: 'inv1', amount: 100 });
    expect(res.status).toBe(404);
    expect(allocatePaymentSpy).not.toHaveBeenCalled();
  });

  it('rejects allocation when target invoice belongs to another company', async () => {
    allocatePaymentSpy.mockClear();
    const { storage } = await import('../storage');
    // Mock getSalesInvoiceById temporarily to return foreign company
    const original = (storage.getSalesInvoiceById as any);
    (storage.getSalesInvoiceById as any) = vi.fn(async (id: string) => ({ id, total: '100', company_id: 'c2' }));

    const res = await request(server)
      .post('/api/banking/reconciliation/allocate')
      .set(auth)
      .send({ paymentType: 'receipt', paymentId: 'r1', documentType: 'invoice', documentId: 'invX', amount: 100 });
    expect(res.status).toBe(404);
    expect(allocatePaymentSpy).not.toHaveBeenCalled();

    // restore
    (storage.getSalesInvoiceById as any) = original;
  });

  it('lists recent allocations and supports unmatch', async () => {
    const list = await request(server)
      .get('/api/banking/reconciliation/allocations/recent')
      .set(auth);
    expect(list.status).toBe(200);
    expect(list.body[0].id).toBe('alloc1');

    const del = await request(server)
      .delete('/api/banking/reconciliation/allocations/alloc1')
      .set(auth);
    expect(del.status).toBe(200);
    expect(deletePaymentAllocationMock).toHaveBeenCalledWith('alloc1');
  });

  it('supports batch undo of allocations', async () => {
    deletePaymentAllocationMock.mockClear();
    getAllocationByIdMock.mockImplementation(async (id: string) => ({ id, company_id: 'c1', document_type: 'invoice', document_id: 'inv1' }));
    const res = await request(server)
      .post('/api/banking/reconciliation/allocations/undo-batch')
      .set(auth)
      .send({ ids: ['alloc1', 'alloc2', 'alloc1'] }); // includes duplicate to test de-duplication
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ attempted: 2 });
    // Called for each unique id
    expect(deletePaymentAllocationMock).toHaveBeenCalledTimes(2);
    expect(deletePaymentAllocationMock).toHaveBeenCalledWith('alloc1');
    expect(deletePaymentAllocationMock).toHaveBeenCalledWith('alloc2');
  });

  it('denies single undo for allocation outside company', async () => {
    deletePaymentAllocationMock.mockClear();
    getAllocationByIdMock.mockImplementationOnce(async (id: string) => ({ id, company_id: 'c2', document_type: 'invoice', document_id: 'invX' }));
    const res = await request(server)
      .delete('/api/banking/reconciliation/allocations/allocX')
      .set(auth);
    expect(res.status).toBe(404);
    expect(deletePaymentAllocationMock).not.toHaveBeenCalled();
  });

  it('reports forbidden/not_found in batch when ownership fails', async () => {
    deletePaymentAllocationMock.mockClear();
    // First id belongs to other company, second ok
    getAllocationByIdMock.mockImplementation(async (id: string) => (
      id === 'bad' ? { id, company_id: 'c2', document_type: 'invoice', document_id: 'invX' } : { id, company_id: 'c1', document_type: 'invoice', document_id: 'inv1' }
    ));
    const res = await request(server)
      .post('/api/banking/reconciliation/allocations/undo-batch')
      .set(auth)
      .send({ ids: ['bad', 'good'] });
    expect(res.status).toBe(200);
    expect(res.body.failed).toBe(1);
    expect(res.body.undone).toBe(1);
    expect(deletePaymentAllocationMock).toHaveBeenCalledTimes(1);
    expect(deletePaymentAllocationMock).toHaveBeenCalledWith('good');
    const errs = res.body.errors || [];
    expect(errs.find((e: any) => e.id === 'bad')).toBeTruthy();
  });
});
