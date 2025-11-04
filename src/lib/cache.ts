import { logEvent } from './logging';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * In-memory cache with TTL support
 */
class MemoryCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    logEvent('cache_set', { key, ttl, size: this.cache.size });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      logEvent('cache_miss', { key });
      return null;
    }

    const now = Date.now();
    const isExpired = now - item.timestamp > item.ttl;

    if (isExpired) {
      this.cache.delete(key);
      logEvent('cache_expired', { key, age: now - item.timestamp });
      return null;
    }

    logEvent('cache_hit', { key, age: now - item.timestamp });
    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    logEvent('cache_cleared');
  }

  size(): number {
    return this.cache.size;
  }
}

export const memoryCache = new MemoryCache(200);

/**
 * Cache wrapper for async functions
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    keyGenerator: (...args: Parameters<T>) => string;
    ttl?: number;
  }
): T {
  return (async (...args: Parameters<T>) => {
    const cacheKey = options.keyGenerator(...args);
    const cached = memoryCache.get(cacheKey);

    if (cached !== null) {
      return cached;
    }

    const result = await fn(...args);
    memoryCache.set(cacheKey, result, options.ttl);
    
    return result;
  }) as T;
}
