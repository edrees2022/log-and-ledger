/**
 * Performance Optimization Utilities
 * Caching, memoization, and performance monitoring tools
 */

// Cache configuration
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items in cache
}

interface CacheEntry<T> {
  value: T;
  expiry: number;
  hits: number;
}

/**
 * LRU Cache with TTL support
 */
export class LRUCache<K, V> {
  private cache: Map<K, CacheEntry<V>>;
  private config: CacheConfig;
  private stats = { hits: 0, misses: 0 };

  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new Map();
    this.config = {
      ttl: config.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: config.maxSize || 100,
    };
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.stats.misses++;
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    entry.hits++;
    this.cache.set(key, entry);
    this.stats.hits++;
    
    return entry.value;
  }

  set(key: K, value: V, ttl?: number): void {
    // Remove oldest entry if at max size
    if (this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttl || this.config.ttl),
      hits: 0,
    });
  }

  has(key: K): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
    };
  }

  // Clean up expired entries
  cleanup(): number {
    const now = Date.now();
    let removed = 0;
    
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      const entry = this.cache.get(key);
      if (entry && now > entry.expiry) {
        this.cache.delete(key);
        removed++;
      }
    }
    
    return removed;
  }
}

/**
 * Memoize function with cache
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    keyFn?: (...args: Parameters<T>) => string;
    ttl?: number;
    maxSize?: number;
  } = {}
): T {
  const cache = new LRUCache<string, ReturnType<T>>({
    ttl: options.ttl,
    maxSize: options.maxSize,
  });

  const memoized = ((...args: Parameters<T>): ReturnType<T> => {
    const key = options.keyFn 
      ? options.keyFn(...args)
      : JSON.stringify(args);

    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const result = fn(...args);
    
    // Handle promises
    if (result instanceof Promise) {
      return result.then((value) => {
        cache.set(key, value);
        return value;
      }) as ReturnType<T>;
    }

    cache.set(key, result);
    return result;
  }) as T;

  // Attach cache methods
  (memoized as any).cache = cache;
  (memoized as any).clear = () => cache.clear();
  (memoized as any).getStats = () => cache.getStats();

  return memoized;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T & { cancel: () => void } {
  const { leading = false, trailing = true } = options;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime = 0;
  let hasLeadingCall = false;

  const debounced = ((...args: Parameters<T>) => {
    lastArgs = args;
    const now = Date.now();

    if (leading && !hasLeadingCall && now - lastCallTime >= delay) {
      hasLeadingCall = true;
      lastCallTime = now;
      return fn(...args);
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      if (trailing && lastArgs) {
        lastCallTime = Date.now();
        hasLeadingCall = false;
        fn(...lastArgs);
      }
      timeoutId = null;
    }, delay);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): T & { cancel: () => void } {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const throttled = ((...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      
      timeoutId = setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  }) as T & { cancel: () => void };

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    inThrottle = false;
  };

  return throttled;
}

/**
 * Virtual list helper for large datasets
 */
export function createVirtualList<T>(
  items: T[],
  options: {
    itemHeight: number;
    containerHeight: number;
    overscan?: number;
  }
) {
  const { itemHeight, containerHeight, overscan = 3 } = options;
  const visibleCount = Math.ceil(containerHeight / itemHeight);

  return {
    getTotalHeight: () => items.length * itemHeight,
    
    getVisibleItems: (scrollTop: number) => {
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const endIndex = Math.min(
        items.length - 1,
        startIndex + visibleCount + overscan * 2
      );

      return {
        startIndex,
        endIndex,
        items: items.slice(startIndex, endIndex + 1),
        offsetY: startIndex * itemHeight,
      };
    },

    scrollToIndex: (index: number) => index * itemHeight,
  };
}

/**
 * Batch DOM updates using requestAnimationFrame
 */
export function batchUpdate<T>(
  items: T[],
  batchSize: number,
  processFn: (item: T, index: number) => void,
  onComplete?: () => void
): () => void {
  let currentIndex = 0;
  let cancelled = false;

  const processBatch = () => {
    if (cancelled) return;

    const end = Math.min(currentIndex + batchSize, items.length);
    
    for (let i = currentIndex; i < end; i++) {
      processFn(items[i], i);
    }

    currentIndex = end;

    if (currentIndex < items.length) {
      requestAnimationFrame(processBatch);
    } else {
      onComplete?.();
    }
  };

  requestAnimationFrame(processBatch);

  return () => {
    cancelled = true;
  };
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number[]> = new Map();

  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();

    if (start === undefined) {
      console.warn(`Start mark "${startMark}" not found`);
      return 0;
    }

    const duration = (end || performance.now()) - start;
    
    if (!this.measures.has(name)) {
      this.measures.set(name, []);
    }
    this.measures.get(name)!.push(duration);

    return duration;
  }

  getStats(name: string) {
    const values = this.measures.get(name) || [];
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    
    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
    };
  }

  getAllStats() {
    const stats: Record<string, ReturnType<typeof this.getStats>> = {};
    const names = Array.from(this.measures.keys());
    for (const name of names) {
      stats[name] = this.getStats(name);
    }
    return stats;
  }

  clear(): void {
    this.marks.clear();
    this.measures.clear();
  }
}

/**
 * Request queue with concurrency control
 */
export class RequestQueue<T> {
  private queue: Array<() => Promise<T>> = [];
  private running = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent: number = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  async add(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const request = this.queue.shift()!;

    try {
      await request();
    } finally {
      this.running--;
      this.processQueue();
    }
  }

  get pending(): number {
    return this.queue.length;
  }

  get active(): number {
    return this.running;
  }

  clear(): void {
    this.queue = [];
  }
}

/**
 * Lazy initialization
 */
export function lazy<T>(factory: () => T): () => T {
  let value: T;
  let initialized = false;

  return () => {
    if (!initialized) {
      value = factory();
      initialized = true;
    }
    return value;
  };
}

/**
 * Chunk array for batch processing
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Deep comparison for React.memo
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  if (obj1 === null || obj2 === null) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

// Global cache instances
export const apiCache = new LRUCache<string, any>({ ttl: 5 * 60 * 1000, maxSize: 200 });
export const queryCache = new LRUCache<string, any>({ ttl: 30 * 1000, maxSize: 50 });

// Performance monitor instance
export const perfMonitor = new PerformanceMonitor();

export default {
  LRUCache,
  memoize,
  debounce,
  throttle,
  createVirtualList,
  batchUpdate,
  PerformanceMonitor,
  RequestQueue,
  lazy,
  chunk,
  deepEqual,
  apiCache,
  queryCache,
  perfMonitor,
};
