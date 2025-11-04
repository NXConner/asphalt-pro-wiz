/**
 * Performance optimization utilities
 */

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastResult: any;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      lastResult = func(...args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }

    return lastResult;
  };
}

/**
 * Request idle callback polyfill
 */
const requestIdleCallbackPolyfill =
  typeof requestIdleCallback !== 'undefined'
    ? requestIdleCallback
    : (callback: IdleRequestCallback) => {
        const start = Date.now();
        return setTimeout(() => {
          callback({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
          });
        }, 1);
      };

/**
 * Schedule low-priority work
 */
export function scheduleIdleWork(callback: () => void) {
  return requestIdleCallbackPolyfill(callback);
}

/**
 * Lazy load images with intersection observer
 */
export function lazyLoadImages(selector: string = 'img[data-src]') {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll(selector).forEach((img) => {
      imageObserver.observe(img);
    });

    return () => {
      imageObserver.disconnect();
    };
  }

  return () => {};
}

/**
 * Preload critical resources
 */
export function preloadResource(url: string, type: 'script' | 'style' | 'font' | 'image') {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;

  switch (type) {
    case 'script':
      link.as = 'script';
      break;
    case 'style':
      link.as = 'style';
      break;
    case 'font':
      link.as = 'font';
      link.crossOrigin = 'anonymous';
      break;
    case 'image':
      link.as = 'image';
      break;
  }

  document.head.appendChild(link);
}

/**
 * Prefetch resources for next navigation
 */
export function prefetchResource(url: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Batch DOM updates using requestAnimationFrame
 */
export function batchDOMUpdates(updates: Array<() => void>) {
  requestAnimationFrame(() => {
    updates.forEach((update) => update());
  });
}

/**
 * Memoize expensive function results
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Clear memoize cache
 */
export function clearMemoizeCache() {
  // This would need to be implemented per memoized function
  // For now, it's a placeholder
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get device memory (if available)
 */
export function getDeviceMemory(): number | null {
  if ('deviceMemory' in navigator) {
    return (navigator as any).deviceMemory;
  }
  return null;
}

/**
 * Check network connection quality
 */
export function getNetworkQuality(): 'slow' | 'fast' | 'unknown' {
  if ('connection' in navigator) {
    const conn = (navigator as any).connection;
    const effectiveType = conn.effectiveType;

    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      return 'slow';
    } else if (effectiveType === '3g' || effectiveType === '4g') {
      return 'fast';
    }
  }
  return 'unknown';
}

/**
 * Dynamically import module with retry
 */
export async function dynamicImportWithRetry<T>(
  importFn: () => Promise<T>,
  retries = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await importFn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Failed to import module');
}
