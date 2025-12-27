/**
 * Unit Tests for Utility Functions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock formatters
const formatCurrency = (amount: number, currency: string = 'SAR') => {
  return `${amount.toFixed(2)} ${currency}`;
};

const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const formatNumber = (value: number, decimals: number = 2) => {
  return value.toFixed(decimals);
};

describe('Currency Formatting', () => {
  describe('formatCurrency', () => {
    it('should format SAR correctly', () => {
      const result = formatCurrency(1000, 'SAR');
      expect(result).toContain('1000.00');
      expect(result).toContain('SAR');
    });

    it('should format USD correctly', () => {
      const result = formatCurrency(1000, 'USD');
      expect(result).toContain('1000.00');
    });

    it('should handle zero', () => {
      const result = formatCurrency(0, 'SAR');
      expect(result).toContain('0.00');
    });

    it('should handle negative values', () => {
      const result = formatCurrency(-500.5, 'SAR');
      expect(result).toContain('-500.50');
    });

    it('should round to 2 decimal places', () => {
      const result = formatCurrency(100.999, 'SAR');
      expect(result).toContain('101.00');
    });

    it('should handle large numbers', () => {
      const result = formatCurrency(1000000, 'SAR');
      expect(result).toContain('1000000.00');
    });
  });
});

describe('Date Formatting', () => {
  describe('formatDate', () => {
    it('should format ISO date string', () => {
      const result = formatDate('2024-01-15T12:00:00Z');
      expect(result).toBe('2024-01-15');
    });

    it('should format Date object', () => {
      const date = new Date('2024-06-20');
      const result = formatDate(date);
      expect(result).toContain('2024');
    });

    it('should handle different date formats', () => {
      const result = formatDate('2024/03/25');
      expect(result).toContain('2024');
    });
  });
});

describe('Number Formatting', () => {
  describe('formatNumber', () => {
    it('should format with default decimals', () => {
      const result = formatNumber(1234.5678);
      expect(result).toBe('1234.57');
    });

    it('should format with custom decimals', () => {
      const result = formatNumber(1234.5678, 1);
      expect(result).toBe('1234.6');
    });

    it('should format integers', () => {
      const result = formatNumber(1000, 2);
      expect(result).toBe('1000.00');
    });

    it('should handle zero decimals', () => {
      const result = formatNumber(1234.5678, 0);
      expect(result).toBe('1235');
    });
  });
});

describe('Validation Functions', () => {
  describe('Email validation', () => {
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('should reject email without @', () => {
      expect(isValidEmail('testexample.com')).toBe(false);
    });

    it('should reject email without domain', () => {
      expect(isValidEmail('test@')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('Phone validation', () => {
    const isValidSaudiPhone = (phone: string) => {
      const digits = phone.replace(/\D/g, '');
      // Saudi mobile: 10 digits starting with 05, or 9 digits starting with 5
      return (digits.length === 10 && digits.startsWith('05')) || 
             (digits.length === 9 && digits.startsWith('5'));
    };

    it('should validate Saudi mobile number', () => {
      expect(isValidSaudiPhone('0501234567')).toBe(true);
    });

    it('should validate with spaces', () => {
      expect(isValidSaudiPhone('050 123 4567')).toBe(true);
    });

    it('should reject non-mobile numbers', () => {
      expect(isValidSaudiPhone('0112345678')).toBe(false);
    });
  });

  describe('Tax number validation', () => {
    const isValidSaudiVAT = (vatNumber: string) => {
      return vatNumber.length === 15 && vatNumber.startsWith('3');
    };

    it('should validate Saudi VAT number', () => {
      expect(isValidSaudiVAT('300000000000003')).toBe(true);
    });

    it('should reject short VAT number', () => {
      expect(isValidSaudiVAT('30000000000')).toBe(false);
    });

    it('should reject wrong prefix', () => {
      expect(isValidSaudiVAT('100000000000003')).toBe(false);
    });
  });
});

describe('Calculation Functions', () => {
  describe('Tax calculations', () => {
    const calculateTax = (amount: number, rate: number) => amount * (rate / 100);
    const calculateTaxInclusive = (total: number, rate: number) => total - (total / (1 + rate / 100));

    it('should calculate VAT correctly', () => {
      const tax = calculateTax(1000, 15);
      expect(tax).toBe(150);
    });

    it('should calculate tax from inclusive amount', () => {
      const tax = calculateTaxInclusive(1150, 15);
      expect(tax).toBeCloseTo(150, 2);
    });

    it('should handle zero rate', () => {
      const tax = calculateTax(1000, 0);
      expect(tax).toBe(0);
    });
  });

  describe('Discount calculations', () => {
    const calculatePercentageDiscount = (amount: number, percentage: number) => 
      amount * (percentage / 100);
    
    const calculateFixedDiscount = (amount: number, discount: number) => 
      Math.min(amount, discount);

    it('should calculate percentage discount', () => {
      const discount = calculatePercentageDiscount(1000, 10);
      expect(discount).toBe(100);
    });

    it('should limit fixed discount to amount', () => {
      const discount = calculateFixedDiscount(100, 150);
      expect(discount).toBe(100);
    });
  });

  describe('Invoice calculations', () => {
    interface InvoiceLine {
      quantity: number;
      unitPrice: number;
      discount?: number;
      taxRate: number;
    }

    const calculateLineTotal = (line: InvoiceLine) => {
      const subtotal = line.quantity * line.unitPrice - (line.discount || 0);
      const tax = subtotal * (line.taxRate / 100);
      return { subtotal, tax, total: subtotal + tax };
    };

    it('should calculate line totals', () => {
      const line: InvoiceLine = { quantity: 2, unitPrice: 100, discount: 10, taxRate: 15 };
      const result = calculateLineTotal(line);
      
      expect(result.subtotal).toBe(190);
      expect(result.tax).toBe(28.5);
      expect(result.total).toBe(218.5);
    });

    it('should handle line without discount', () => {
      const line: InvoiceLine = { quantity: 5, unitPrice: 50, taxRate: 15 };
      const result = calculateLineTotal(line);
      
      expect(result.subtotal).toBe(250);
      expect(result.tax).toBe(37.5);
      expect(result.total).toBe(287.5);
    });
  });
});

describe('String Utilities', () => {
  describe('Truncation', () => {
    const truncate = (text: string, maxLength: number) => {
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength - 3) + '...';
    };

    it('should truncate long text', () => {
      const result = truncate('This is a very long text', 15);
      expect(result).toBe('This is a ve...');
      expect(result.length).toBe(15);
    });

    it('should not truncate short text', () => {
      const result = truncate('Short', 10);
      expect(result).toBe('Short');
    });
  });

  describe('Slug generation', () => {
    const generateSlug = (text: string) => {
      return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
    };

    it('should generate slug from text', () => {
      const slug = generateSlug('Hello World');
      expect(slug).toBe('hello-world');
    });

    it('should remove special characters', () => {
      const slug = generateSlug('Test @#$ String!');
      expect(slug).toBe('test-string');
    });
  });
});

describe('Array Utilities', () => {
  describe('Grouping', () => {
    const groupBy = <T>(array: T[], key: keyof T) => {
      return array.reduce((groups, item) => {
        const value = String(item[key]);
        (groups[value] = groups[value] || []).push(item);
        return groups;
      }, {} as Record<string, T[]>);
    };

    it('should group items by key', () => {
      const items = [
        { type: 'a', value: 1 },
        { type: 'b', value: 2 },
        { type: 'a', value: 3 },
      ];
      
      const grouped = groupBy(items, 'type');
      
      expect(grouped['a'].length).toBe(2);
      expect(grouped['b'].length).toBe(1);
    });
  });

  describe('Sorting', () => {
    const sortByDate = <T extends { date: string }>(items: T[], order: 'asc' | 'desc' = 'asc') => {
      return [...items].sort((a, b) => {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return order === 'asc' ? diff : -diff;
      });
    };

    it('should sort by date ascending', () => {
      const items = [
        { date: '2024-03-01' },
        { date: '2024-01-01' },
        { date: '2024-02-01' },
      ];
      
      const sorted = sortByDate(items, 'asc');
      
      expect(sorted[0].date).toBe('2024-01-01');
      expect(sorted[2].date).toBe('2024-03-01');
    });

    it('should sort by date descending', () => {
      const items = [
        { date: '2024-01-01' },
        { date: '2024-03-01' },
        { date: '2024-02-01' },
      ];
      
      const sorted = sortByDate(items, 'desc');
      
      expect(sorted[0].date).toBe('2024-03-01');
      expect(sorted[2].date).toBe('2024-01-01');
    });
  });

  describe('Pagination', () => {
    const paginate = <T>(items: T[], page: number, pageSize: number) => {
      const startIndex = (page - 1) * pageSize;
      return {
        items: items.slice(startIndex, startIndex + pageSize),
        total: items.length,
        page,
        pageSize,
        totalPages: Math.ceil(items.length / pageSize),
      };
    };

    it('should return correct page', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = paginate(items, 2, 3);
      
      expect(result.items).toEqual([4, 5, 6]);
      expect(result.totalPages).toBe(4);
    });

    it('should handle last page with fewer items', () => {
      const items = [1, 2, 3, 4, 5, 6, 7];
      const result = paginate(items, 3, 3);
      
      expect(result.items).toEqual([7]);
    });
  });
});

describe('Cache Utilities', () => {
  describe('LRU Cache', () => {
    class SimpleLRUCache<K, V> {
      private cache: Map<K, V>;
      private maxSize: number;

      constructor(maxSize: number) {
        this.cache = new Map();
        this.maxSize = maxSize;
      }

      get(key: K): V | undefined {
        const value = this.cache.get(key);
        if (value !== undefined) {
          // Move to end (most recently used)
          this.cache.delete(key);
          this.cache.set(key, value);
        }
        return value;
      }

      set(key: K, value: V): void {
        if (this.cache.has(key)) {
          this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
          const firstKey = this.cache.keys().next().value;
          if (firstKey !== undefined) {
            this.cache.delete(firstKey);
          }
        }
        this.cache.set(key, value);
      }

      get size(): number {
        return this.cache.size;
      }
    }

    it('should cache values', () => {
      const cache = new SimpleLRUCache<string, number>(3);
      cache.set('a', 1);
      cache.set('b', 2);
      
      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBe(2);
    });

    it('should evict oldest when full', () => {
      const cache = new SimpleLRUCache<string, number>(2);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
    });

    it('should update access order on get', () => {
      const cache = new SimpleLRUCache<string, number>(2);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.get('a'); // Access 'a' to make it most recent
      cache.set('c', 3);
      
      expect(cache.get('a')).toBe(1); // 'a' should still be there
      expect(cache.get('b')).toBeUndefined(); // 'b' should be evicted
    });
  });
});

describe('Date Utilities', () => {
  describe('Date ranges', () => {
    const isWithinRange = (date: Date, start: Date, end: Date) => {
      return date >= start && date <= end;
    };

    it('should check if date is within range', () => {
      const date = new Date('2024-06-15');
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      
      expect(isWithinRange(date, start, end)).toBe(true);
    });

    it('should return false for date outside range', () => {
      const date = new Date('2025-01-01');
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      
      expect(isWithinRange(date, start, end)).toBe(false);
    });
  });

  describe('Date calculations', () => {
    const addDays = (date: Date, days: number) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    const daysBetween = (date1: Date, date2: Date) => {
      const diff = Math.abs(date2.getTime() - date1.getTime());
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    it('should add days to date', () => {
      const date = new Date('2024-01-01');
      const result = addDays(date, 30);
      
      expect(result.toISOString().split('T')[0]).toBe('2024-01-31');
    });

    it('should calculate days between dates', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-31');
      
      expect(daysBetween(date1, date2)).toBe(30);
    });
  });
});

describe('Accounting Utilities', () => {
  describe('Balance calculations', () => {
    const calculateBalance = (debits: number[], credits: number[]) => {
      const totalDebit = debits.reduce((sum, d) => sum + d, 0);
      const totalCredit = credits.reduce((sum, c) => sum + c, 0);
      return { totalDebit, totalCredit, balance: totalDebit - totalCredit };
    };

    it('should calculate account balance', () => {
      const result = calculateBalance([1000, 500], [300, 200]);
      
      expect(result.totalDebit).toBe(1500);
      expect(result.totalCredit).toBe(500);
      expect(result.balance).toBe(1000);
    });

    it('should handle negative balance', () => {
      const result = calculateBalance([100], [500]);
      
      expect(result.balance).toBe(-400);
    });
  });

  describe('Aging calculations', () => {
    const calculateAging = (dueDate: Date, asOfDate: Date = new Date()) => {
      const diffDays = Math.floor(
        (asOfDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays <= 0) return 'current';
      if (diffDays <= 30) return '1-30';
      if (diffDays <= 60) return '31-60';
      if (diffDays <= 90) return '61-90';
      return '90+';
    };

    it('should categorize current invoices', () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);
      
      expect(calculateAging(dueDate)).toBe('current');
    });

    it('should categorize overdue invoices', () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() - 45);
      
      expect(calculateAging(dueDate)).toBe('31-60');
    });

    it('should categorize severely overdue invoices', () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() - 120);
      
      expect(calculateAging(dueDate)).toBe('90+');
    });
  });
});
