import Redis from 'ioredis';
import { logger } from './logger';

/**
 * Redis cache client for high-performance data caching
 * Optional - gracefully degrades if Redis not available
 */

let redis: Redis | null = null;
let isRedisAvailable = false;

// Initialize Redis only if REDIS_URL is provided
if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      lazyConnect: true, // Don't connect immediately
    });

    redis.on('connect', () => {
      isRedisAvailable = true;
      logger.info('Redis connected successfully');
    });

    redis.on('error', (err) => {
      isRedisAvailable = false;
      logger.warn({ err }, 'Redis connection error - caching disabled');
    });

    // Attempt connection
    redis.connect().catch((err) => {
      logger.warn({ err }, 'Failed to connect to Redis - caching disabled');
      isRedisAvailable = false;
    });
  } catch (error) {
    logger.warn({ error }, 'Redis initialization failed - caching disabled');
    redis = null;
  }
} else {
  logger.info('REDIS_URL not set - caching disabled');
}

/**
 * Get cached value
 * Returns null if cache miss or Redis unavailable
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis || !isRedisAvailable) return null;

  try {
    const value = await redis.get(key);
    if (!value) return null;

    return JSON.parse(value) as T;
  } catch (error) {
    logger.debug({ error, key }, 'Cache get failed');
    return null;
  }
}

/**
 * Set cached value with TTL (time to live in seconds)
 * Silently fails if Redis unavailable
 */
export async function setCache(
  key: string,
  value: any,
  ttlSeconds: number = 300
): Promise<boolean> {
  if (!redis || !isRedisAvailable) return false;

  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.debug({ error, key }, 'Cache set failed');
    return false;
  }
}

/**
 * Delete cached value
 */
export async function deleteCache(key: string): Promise<boolean> {
  if (!redis || !isRedisAvailable) return false;

  try {
    await redis.del(key);
    return true;
  } catch (error) {
    logger.debug({ error, key }, 'Cache delete failed');
    return false;
  }
}

/**
 * Delete all cached values matching pattern
 * Example: deleteCachePattern('company:123:*')
 */
export async function deleteCachePattern(pattern: string): Promise<number> {
  if (!redis || !isRedisAvailable) return 0;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;

    await redis.del(...keys);
    return keys.length;
  } catch (error) {
    logger.debug({ error, pattern }, 'Cache pattern delete failed');
    return 0;
  }
}

/**
 * Check if Redis is available
 */
export function isRedisCacheAvailable(): boolean {
  return isRedisAvailable;
}

/**
 * Graceful shutdown
 */
export async function disconnectRedis(): Promise<void> {
  if (redis) {
    try {
      await redis.quit();
      logger.info('Redis disconnected');
    } catch (error) {
      logger.warn({ error }, 'Redis disconnect failed');
    }
  }
}

// Cache key generators for consistency
export const CacheKeys = {
  // Accounts
  accounts: (companyId: string) => `company:${companyId}:accounts`,
  accountById: (companyId: string, accountId: string) =>
    `company:${companyId}:account:${accountId}`,
  
  // Taxes
  taxes: (companyId: string) => `company:${companyId}:taxes`,
  taxById: (companyId: string, taxId: string) => `company:${companyId}:tax:${taxId}`,
  
  // Company
  companySettings: (companyId: string) => `company:${companyId}:settings`,
  companyById: (companyId: string) => `company:${companyId}:info`,
  
  // Users
  userByEmail: (email: string) => `user:email:${email}`,
  userById: (userId: string) => `user:id:${userId}`,
  userPermissions: (userId: string) => `user:${userId}:permissions`,
  
  // Dashboard
  dashboard: (companyId: string) => `dashboard:${companyId}`,
  globalDashboard: (companyId: string) => `global-dashboard:${companyId}`,
  
  // Reports (with date range hash)
  trialBalance: (companyId: string, startDate: string, endDate: string) => 
    `report:${companyId}:trial-balance:${startDate}:${endDate}`,
  balanceSheet: (companyId: string, date: string) => 
    `report:${companyId}:balance-sheet:${date}`,
  incomeStatement: (companyId: string, startDate: string, endDate: string) => 
    `report:${companyId}:income-statement:${startDate}:${endDate}`,
  cashFlow: (companyId: string, startDate: string, endDate: string) => 
    `report:${companyId}:cash-flow:${startDate}:${endDate}`,
  generalLedger: (companyId: string, accountId: string, startDate: string, endDate: string) => 
    `report:${companyId}:general-ledger:${accountId}:${startDate}:${endDate}`,
  
  // Contacts & Items (frequently accessed for dropdowns)
  contacts: (companyId: string) => `company:${companyId}:contacts`,
  contactById: (companyId: string, contactId: string) => 
    `company:${companyId}:contact:${contactId}`,
  items: (companyId: string) => `company:${companyId}:items`,
  itemById: (companyId: string, itemId: string) => 
    `company:${companyId}:item:${itemId}`,
  
  // Inventory
  warehouses: (companyId: string) => `company:${companyId}:warehouses`,
  inventoryValuation: (companyId: string) => `company:${companyId}:inventory-valuation`,
  
  // Bank Accounts
  bankAccounts: (companyId: string) => `company:${companyId}:bank-accounts`,
  
  // Exchange Rates
  exchangeRates: (companyId: string) => `company:${companyId}:exchange-rates`,
  
  // Document Numbers (short TTL to prevent collisions)
  documentSequence: (companyId: string, docType: string, fiscalYear: number) =>
    `doc-seq:${companyId}:${docType}:${fiscalYear}`,
};

// Cache TTLs (in seconds)
export const CacheTTL = {
  INSTANT: 10,        // 10 seconds - for rapidly changing data
  SHORT: 60,          // 1 minute - for lists that change often
  MEDIUM: 300,        // 5 minutes - for dashboard data
  LONG: 1800,         // 30 minutes - for reports
  VERY_LONG: 7200,    // 2 hours - for rarely changing master data
  DAY: 86400,         // 24 hours - for static data
};

/**
 * Invalidate all company-related caches
 * Call this when company data changes significantly
 */
export async function invalidateCompanyCaches(companyId: string): Promise<void> {
  await deleteCachePattern(`company:${companyId}:*`);
  await deleteCachePattern(`dashboard:${companyId}`);
  await deleteCachePattern(`report:${companyId}:*`);
}
