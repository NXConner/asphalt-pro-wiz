import { logEvent, logError, logVital } from './logging';
import type { WebVitalName } from './logging';

/**
 * Monitoring and observability utilities
 */

interface PerformanceEntry {
  name: string;
  duration: number;
  startTime: number;
}

/**
 * Track custom performance metrics
 */
export function trackPerformance(name: string, duration: number) {
  logEvent('performance_metric', {
    name,
    duration: Math.round(duration),
    timestamp: Date.now(),
  });
}

/**
 * Monitor API request performance
 */
export function monitorAPIRequest(endpoint: string, duration: number, status: number) {
  logEvent('api_request', {
    endpoint,
    duration: Math.round(duration),
    status,
    timestamp: Date.now(),
  });

  // Alert on slow requests (> 3 seconds)
  if (duration > 3000) {
    logEvent('slow_api_request', {
      endpoint,
      duration: Math.round(duration),
      level: 'warn',
    });
  }

  // Alert on failed requests
  if (status >= 400) {
    logEvent('api_error', {
      endpoint,
      status,
      level: 'error',
    });
  }
}

/**
 * Monitor component render performance
 */
export function monitorComponentRender(componentName: string, renderTime: number) {
  logEvent('component_render', {
    component: componentName,
    duration: Math.round(renderTime),
    timestamp: Date.now(),
  });

  // Alert on slow renders (> 50ms)
  if (renderTime > 50) {
    logEvent('slow_component_render', {
      component: componentName,
      duration: Math.round(renderTime),
      level: 'warn',
    });
  }
}

/**
 * Monitor user interactions
 */
export function trackUserInteraction(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  logEvent('user_interaction', {
    action,
    category,
    label,
    value,
    timestamp: Date.now(),
  });
}

/**
 * Monitor resource loading
 */
export function monitorResourceLoading() {
  if (typeof performance === 'undefined') return;

  const resources = performance.getEntriesByType('resource');

  resources.forEach((resource: any) => {
    const duration = resource.duration;
    const size = resource.transferSize;

    // Alert on large resources (> 1MB)
    if (size > 1024 * 1024) {
      logEvent('large_resource', {
        name: resource.name,
        size: Math.round(size / 1024),
        duration: Math.round(duration),
        level: 'warn',
      });
    }

    // Alert on slow resources (> 2 seconds)
    if (duration > 2000) {
      logEvent('slow_resource', {
        name: resource.name,
        duration: Math.round(duration),
        level: 'warn',
      });
    }
  });
}

/**
 * Monitor memory usage (if available)
 */
export function monitorMemoryUsage() {
  if (typeof performance === 'undefined' || !(performance as any).memory) return;

  const memory = (performance as any).memory;

  logEvent('memory_usage', {
    used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
    total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
    limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
  });

  // Alert if memory usage is high (> 80% of limit)
  if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.8) {
    logEvent('high_memory_usage', {
      usage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100),
      level: 'warn',
    });
  }
}

/**
 * Create performance observer for long tasks
 */
export function observeLongTasks() {
  if (typeof PerformanceObserver === 'undefined') return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          logEvent('long_task', {
            duration: Math.round(entry.duration),
            startTime: Math.round(entry.startTime),
            level: 'warn',
          });
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch {
    // PerformanceObserver not supported
  }
}

/**
 * Monitor page visibility changes
 */
export function monitorPageVisibility() {
  let startTime = Date.now();

  const handleVisibilityChange = () => {
    if (document.hidden) {
      const visibleDuration = Date.now() - startTime;
      logEvent('page_hidden', {
        duration: Math.round(visibleDuration),
        timestamp: Date.now(),
      });
    } else {
      startTime = Date.now();
      logEvent('page_visible', {
        timestamp: Date.now(),
      });
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}

/**
 * Initialize all monitoring
 */
export function initializeMonitoring() {
  // Monitor web vitals
  if (typeof window !== 'undefined') {
    import('web-vitals').then(({ onCLS, onLCP, onFCP, onTTFB, onINP }) => {
      onCLS((metric) => logVital('CLS', metric.value, metric.id));
      onLCP((metric) => logVital('LCP', metric.value, metric.id));
      onFCP?.((metric: any) => logVital('FCP', metric.value, metric.id));
      onTTFB?.((metric: any) => logVital('TTFB', metric.value, metric.id));
      onINP?.((metric: any) => logVital('INP', metric.value, metric.id));
    }).catch(() => {});
  }

  // Monitor long tasks
  observeLongTasks();

  // Monitor page visibility
  const cleanupVisibility = monitorPageVisibility();

  // Monitor resources on load
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(monitorResourceLoading, 0);
      setTimeout(monitorMemoryUsage, 0);
    });
  }

  return () => {
    cleanupVisibility();
  };
}
