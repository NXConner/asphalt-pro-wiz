/**
 * Advanced cache management with TTL, size limits, and persistence
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

interface CacheOptions {
  maxSize?: number;
  defaultTTL?: number;
  persistToLocalStorage?: boolean;
  storageKey?: string;
}

export class CacheManager<T = any> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private defaultTTL: number;
  private persistToLocalStorage: boolean;
  private storageKey: string;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize ?? 200;
    this.defaultTTL = options.defaultTTL ?? 5 * 60 * 1000; // 5 minutes
    this.persistToLocalStorage = options.persistToLocalStorage ?? false;
    this.storageKey = options.storageKey ?? 'app-cache';

    if (this.persistToLocalStorage) {
      this.loadFromStorage();
    }
  }

  /**
   * Set a value in cache with optional TTL
   */
  set(key: string, value: T, ttl?: number): void {
    // Check size limit
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL,
      hits: 0,
    });

    if (this.persistToLocalStorage) {
      this.saveToStorage();
    }
  }

  /**
   * Get a value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      if (this.persistToLocalStorage) {
        this.saveToStorage();
      }
      return null;
    }

    // Increment hit counter
    entry.hits++;

    return entry.data;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    if (result && this.persistToLocalStorage) {
      this.saveToStorage();
    }
    return result;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    if (this.persistToLocalStorage) {
      this.saveToStorage();
    }
  }

  /**
   * Get cache statistics
   */
  stats() {
    let totalHits = 0;
    let expiredCount = 0;

    this.cache.forEach((entry) => {
      totalHits += entry.hits;
      if (this.isExpired(entry)) {
        expiredCount++;
      }
    });

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalHits,
      expiredCount,
      hitRate: totalHits > 0 ? totalHits / this.cache.size : 0,
    };
  }

  /**
   * Remove expired entries
   */
  prune(): number {
    let removed = 0;
    const now = Date.now();

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        removed++;
      }
    });

    if (removed > 0 && this.persistToLocalStorage) {
      this.saveToStorage();
    }

    return removed;
  }

  /**
   * Get or set pattern: get from cache or fetch and cache
   */
  async getOrSet(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Evict least recently used (LRU) entry
   */
  private evictLRU(): void {
    let minHits = Infinity;
    let lruKey: string | null = null;

    this.cache.forEach((entry, key) => {
      if (entry.hits < minHits) {
        minHits = entry.hits;
        lruKey = key;
      }
    });

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    try {
      const data: Record<string, CacheEntry<T>> = {};
      this.cache.forEach((value, key) => {
        data[key] = value;
      });
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored) as Record<string, CacheEntry<T>>;
        Object.entries(data).forEach(([key, entry]) => {
          if (!this.isExpired(entry)) {
            this.cache.set(key, entry);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }
}

// Global cache instances
export const apiCache = new CacheManager<any>({
  maxSize: 100,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  persistToLocalStorage: true,
  storageKey: 'api-cache',
});

export const queryCache = new CacheManager<any>({
  maxSize: 50,
  defaultTTL: 10 * 60 * 1000, // 10 minutes
  persistToLocalStorage: true,
  storageKey: 'query-cache',
});
