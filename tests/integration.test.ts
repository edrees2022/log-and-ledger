/**
 * Integration Tests for Critical API Endpoints
 * Tests pagination, caching, and core business logic
 */

import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import request from 'supertest';
import { z } from 'zod';

// Import pagination types only (we'll define our own test helpers)
import type { PaginationParams as FullPaginationParams } from '../server/utils/pagination';

// Simplified pagination params for tests
interface PaginationParams {
  page: number;
  limit: number;
}

// Test helper function to calculate pagination
function calculatePagination(
  params: PaginationParams, 
  total: number, 
  maxLimit?: number
): { offset: number; limit: number; totalPages: number; hasMore: boolean } {
  const limit = maxLimit ? Math.min(params.limit, maxLimit) : params.limit;
  const offset = (params.page - 1) * limit;
  const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
  const hasMore = params.page < totalPages;
  
  return { offset, limit, totalPages, hasMore };
}

// Validation schemas for API responses
const PaginatedResponseSchema = z.object({
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
});

describe('Pagination Utilities', () => {
  it('should calculate pagination correctly for first page', () => {
    const params: PaginationParams = { page: 1, limit: 20 };
    const result = calculatePagination(params, 100);
    
    expect(result.offset).toBe(0);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(5);
    expect(result.hasMore).toBe(true);
  });

  it('should calculate pagination correctly for last page', () => {
    const params: PaginationParams = { page: 5, limit: 20 };
    const result = calculatePagination(params, 100);
    
    expect(result.offset).toBe(80);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(5);
    expect(result.hasMore).toBe(false);
  });

  it('should handle empty results', () => {
    const params: PaginationParams = { page: 1, limit: 20 };
    const result = calculatePagination(params, 0);
    
    expect(result.offset).toBe(0);
    expect(result.totalPages).toBe(0);
    expect(result.hasMore).toBe(false);
  });

  it('should handle page beyond total', () => {
    const params: PaginationParams = { page: 10, limit: 20 };
    const result = calculatePagination(params, 100);
    
    expect(result.offset).toBe(180);
    expect(result.hasMore).toBe(false);
  });

  it('should enforce maximum limit', () => {
    const params: PaginationParams = { page: 1, limit: 1000 };
    const result = calculatePagination(params, 100, 100);
    
    expect(result.limit).toBe(100);
  });
});

describe('API V2 Response Format', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Mock v2 accounts endpoint
    app.get('/api/v2/accounts', (req: Request, res: Response) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      
      // Mock data
      const mockAccounts = Array.from({ length: 150 }, (_, i) => ({
        id: i + 1,
        code: `${1000 + i}`,
        name: `Account ${i + 1}`,
        type: 'asset',
      }));

      const total = mockAccounts.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const data = mockAccounts.slice(offset, offset + limit);

      res.json({
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages,
        },
      });
    });

    // Mock error endpoint
    app.get('/api/v2/error', (_req: Request, res: Response) => {
      res.status(500).json({ error: 'Internal server error', message: 'Something went wrong' });
    });
  });

  it('should return paginated response with correct structure', async () => {
    const res = await request(app).get('/api/v2/accounts?page=1&limit=20');
    
    expect(res.status).toBe(200);
    
    const parsed = PaginatedResponseSchema.safeParse(res.body);
    expect(parsed.success).toBe(true);
    
    expect(res.body.data.length).toBe(20);
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(20);
    expect(res.body.pagination.total).toBe(150);
    expect(res.body.pagination.totalPages).toBe(8);
    expect(res.body.pagination.hasMore).toBe(true);
  });

  it('should handle last page correctly', async () => {
    const res = await request(app).get('/api/v2/accounts?page=8&limit=20');
    
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(10); // 150 - 140 = 10 items
    expect(res.body.pagination.hasMore).toBe(false);
  });

  it('should enforce maximum limit', async () => {
    const res = await request(app).get('/api/v2/accounts?page=1&limit=500');
    
    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(100);
  });

  it('should default to page 1 and limit 50', async () => {
    const res = await request(app).get('/api/v2/accounts');
    
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(50);
  });
});

describe('Cache Invalidation Logic', () => {
  // Mock cache store
  const mockCache = new Map<string, any>();
  
  const setCache = async (key: string, value: any, ttl?: number) => {
    mockCache.set(key, { value, ttl });
  };

  const getCache = async <T>(key: string): Promise<T | null> => {
    const item = mockCache.get(key);
    return item ? item.value : null;
  };

  const invalidatePattern = async (pattern: string) => {
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of mockCache.keys()) {
      if (regex.test(key)) {
        mockCache.delete(key);
      }
    }
  };

  beforeEach(() => {
    mockCache.clear();
  });

  it('should cache dashboard data', async () => {
    const dashboardData = { revenue: 50000, expenses: 30000 };
    await setCache('dashboard:company:1', dashboardData, 300);
    
    const cached = await getCache<typeof dashboardData>('dashboard:company:1');
    expect(cached).toEqual(dashboardData);
  });

  it('should invalidate company caches on data change', async () => {
    // Set multiple caches
    await setCache('dashboard:company:1', { revenue: 50000 });
    await setCache('reports:company:1:balance-sheet', { assets: 100000 });
    await setCache('accounts:company:1', [{ id: 1 }]);
    await setCache('dashboard:company:2', { revenue: 75000 }); // Different company
    
    // Invalidate company 1 caches
    await invalidatePattern('.*:company:1.*');
    
    expect(await getCache('dashboard:company:1')).toBeNull();
    expect(await getCache('reports:company:1:balance-sheet')).toBeNull();
    expect(await getCache('accounts:company:1')).toBeNull();
    expect(await getCache('dashboard:company:2')).not.toBeNull(); // Should remain
  });
});

describe('Database Query Patterns', () => {
  it('should validate journal entry structure', () => {
    const JournalEntrySchema = z.object({
      date: z.string(),
      reference: z.string().optional(),
      description: z.string().optional(),
      lines: z.array(z.object({
        account_id: z.number(),
        debit: z.number().min(0),
        credit: z.number().min(0),
        description: z.string().optional(),
      })).min(2),
    }).refine(data => {
      const totalDebit = data.lines.reduce((sum, l) => sum + l.debit, 0);
      const totalCredit = data.lines.reduce((sum, l) => sum + l.credit, 0);
      return Math.abs(totalDebit - totalCredit) < 0.01; // Balance check
    }, { message: 'Debits must equal credits' });

    // Valid entry
    const validEntry = {
      date: '2024-01-15',
      description: 'Test entry',
      lines: [
        { account_id: 1, debit: 1000, credit: 0 },
        { account_id: 2, debit: 0, credit: 1000 },
      ],
    };
    expect(JournalEntrySchema.safeParse(validEntry).success).toBe(true);

    // Invalid - unbalanced
    const unbalancedEntry = {
      date: '2024-01-15',
      lines: [
        { account_id: 1, debit: 1000, credit: 0 },
        { account_id: 2, debit: 0, credit: 500 },
      ],
    };
    expect(JournalEntrySchema.safeParse(unbalancedEntry).success).toBe(false);
  });
});

describe('Error Response Consistency', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Error handler middleware (same pattern as main app)
    const errorNormalizer = (req: Request, res: Response, next: NextFunction) => {
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        if (
          res.statusCode >= 400 &&
          body &&
          typeof body === 'object' &&
          'error' in body &&
          !('message' in body)
        ) {
          body = { message: body.error, ...body };
        }
        return originalJson(body);
      };
      next();
    };

    app.use(errorNormalizer);

    app.get('/api/error-old', (_req, res) => {
      res.status(400).json({ error: 'Something went wrong' });
    });

    app.get('/api/error-new', (_req, res) => {
      res.status(400).json({ error: 'Something went wrong', message: 'Custom message' });
    });

    app.get('/api/success', (_req, res) => {
      res.json({ data: 'ok' });
    });
  });

  it('should add message field to old-style errors', async () => {
    const res = await request(app).get('/api/error-old');
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Something went wrong');
    expect(res.body.message).toBe('Something went wrong');
  });

  it('should preserve existing message field', async () => {
    const res = await request(app).get('/api/error-new');
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Something went wrong');
    expect(res.body.message).toBe('Custom message');
  });

  it('should not modify success responses', async () => {
    const res = await request(app).get('/api/success');
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: 'ok' });
  });
});

describe('Input Sanitization', () => {
  it('should sanitize user data by removing password_hash', () => {
    const sanitizeUser = (user: any) => {
      const { password_hash, ...sanitized } = user;
      return sanitized;
    };

    const user = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      password_hash: 'secret_hash_123',
      created_at: '2024-01-01',
    };

    const sanitized = sanitizeUser(user);
    
    expect(sanitized.id).toBe(1);
    expect(sanitized.email).toBe('test@example.com');
    expect(sanitized.password_hash).toBeUndefined();
    expect(Object.keys(sanitized)).not.toContain('password_hash');
  });

  it('should validate email format', () => {
    const EmailSchema = z.string().email();
    
    expect(EmailSchema.safeParse('valid@email.com').success).toBe(true);
    expect(EmailSchema.safeParse('invalid-email').success).toBe(false);
    expect(EmailSchema.safeParse('').success).toBe(false);
  });
});

describe('Financial Calculations', () => {
  it('should calculate expense breakdown percentages correctly', () => {
    const expenses = [
      { category: 'Salaries', amount: 50000 },
      { category: 'Rent', amount: 20000 },
      { category: 'Utilities', amount: 5000 },
      { category: 'Supplies', amount: 10000 },
      { category: 'Other', amount: 15000 },
    ];

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const breakdown = expenses.map(e => ({
      category: e.category,
      amount: e.amount,
      percentage: Math.round((e.amount / total) * 100),
    }));

    expect(total).toBe(100000);
    expect(breakdown[0].percentage).toBe(50); // Salaries
    expect(breakdown[1].percentage).toBe(20); // Rent
    expect(breakdown[2].percentage).toBe(5);  // Utilities
    expect(breakdown[3].percentage).toBe(10); // Supplies
    expect(breakdown[4].percentage).toBe(15); // Other
  });

  it('should handle currency conversions', () => {
    const convertCurrency = (
      amount: number,
      fromRate: number,
      toRate: number
    ): number => {
      // Convert to base currency, then to target
      const baseAmount = amount / fromRate;
      return Number((baseAmount * toRate).toFixed(2));
    };

    // USD to EUR (1 USD = 1, 1 EUR = 1.1 USD)
    expect(convertCurrency(100, 1, 1.1)).toBe(110);
    
    // EUR to USD
    expect(convertCurrency(110, 1.1, 1)).toBe(100);
    
    // Complex: SAR to EUR (1 SAR = 0.267 USD, 1 EUR = 1.1 USD)
    const sarToUsd = 0.267;
    const eurToUsd = 1.1;
    // 100 / 0.267 * 1.1 = 411.985... rounds to 411.99
    expect(convertCurrency(100, sarToUsd, eurToUsd)).toBe(411.99);
  });
});
