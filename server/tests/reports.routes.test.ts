import { describe, it, expect, beforeAll, vi } from 'vitest';
import express from 'express';
import session from 'express-session';
import request from 'supertest';
import type { Express } from 'express';

// Mock Firebase admin verification to always succeed
vi.mock('../firebaseAdmin', () => ({
  verifyFirebaseToken: vi.fn(async () => ({ uid: 'u1', email: 'user@example.com' })),
}));

// Mock storage minimal functions used by report routes
vi.mock('../storage', () => ({
  storage: {
    getCompaniesByUserId: vi.fn(async (_uid: string) => [{ id: 'c1' }]),
  }
}));

// Mock report generators to return simple payloads
const trialBalanceMock = vi.fn(async (_args: any) => ({ as_of_date: new Date().toISOString(), accounts: [], total_debits: 0, total_credits: 0 }));
const balanceSheetMock = vi.fn(async (_args: any) => ({ as_of_date: new Date().toISOString(), assets: { accounts: [] }, liabilities: { accounts: [] }, equity: { accounts: [] } }));
const profitLossMock = vi.fn(async (_args: any) => ({ start_date: new Date().toISOString(), end_date: new Date().toISOString(), revenue: {}, expenses: {} }));
const cashFlowMock = vi.fn(async (_args: any) => ({ startDate: new Date().toISOString(), endDate: new Date().toISOString(), beginningCash: 0 }));

vi.mock('../reports/financialReports', () => ({
  generateTrialBalance: trialBalanceMock,
  generateBalanceSheet: balanceSheetMock,
  generateProfitLoss: profitLossMock,
  generateCashFlow: cashFlowMock,
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

describe('Report routes', () => {
  const auth = { Authorization: 'Bearer test' };

  it('GET /api/reports/trial-balance returns data', async () => {
    const res = await request(server).get('/api/reports/trial-balance').set(auth);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('as_of_date');
    expect(trialBalanceMock).toHaveBeenCalled();
  });

  it('GET /api/reports/balance-sheet returns data', async () => {
    const res = await request(server).get('/api/reports/balance-sheet').set(auth);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('assets');
    expect(balanceSheetMock).toHaveBeenCalled();
  });

  it('GET /api/reports/profit-loss returns data', async () => {
    const res = await request(server).get('/api/reports/profit-loss').set(auth);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('end_date');
    expect(profitLossMock).toHaveBeenCalled();
  });

  it('GET /api/reports/cash-flow returns data', async () => {
    const res = await request(server).get('/api/reports/cash-flow').set(auth);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('beginningCash');
    expect(cashFlowMock).toHaveBeenCalled();
  });
});
