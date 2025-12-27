import { Redis } from '@upstash/redis';

// Redis client for caching (optional - gracefully degrades if not configured)
let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log('✅ Redis cache initialized (Upstash)');
  } catch (error) {
    console.warn('⚠️ Redis initialization failed, continuing without cache:', error);
  }
} else {
  console.log('ℹ️ Redis not configured - running without cache layer');
}

/**
 * Get cached data
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  
  try {
    const data = await redis.get<T>(key);
    return data;
  } catch (error) {
    console.warn(`Cache read error for key ${key}:`, error);
    return null;
  }
}

/**
 * Set cached data with TTL (in seconds)
 */
export async function setCache(key: string, value: any, ttl: number = 3600): Promise<boolean> {
  if (!redis) return false;
  
  try {
    await redis.set(key, value, { ex: ttl });
    return true;
  } catch (error) {
    console.warn(`Cache write error for key ${key}:`, error);
    return false;
  }
}

/**
 * Delete cached data
 */
export async function deleteCache(key: string): Promise<boolean> {
  if (!redis) return false;
  
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.warn(`Cache delete error for key ${key}:`, error);
    return false;
  }
}

/**
 * Delete multiple keys matching pattern
 */
export async function deleteCachePattern(pattern: string): Promise<boolean> {
  if (!redis) return false;
  
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    return true;
  } catch (error) {
    console.warn(`Cache pattern delete error for ${pattern}:`, error);
    return false;
  }
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return redis !== null;
}

export { redis };
