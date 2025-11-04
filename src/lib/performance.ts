import { logEvent, type WebVitalName } from './logging';

/**
 * Performance monitoring utilities
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Report web vital metrics
 */
export function reportWebVitals(): void {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
    const reportMetric = (metric: { name: WebVitalName; value: number; id: string }) => {
      logEvent('web_vital', {
        name: metric.name,
        value: Math.round(metric.value),
        id: metric.id,
      });
    };

    onCLS(reportMetric);
    onFCP(reportMetric);
    onLCP(reportMetric);
    onTTFB(reportMetric);
    onINP(reportMetric);
  }).catch(() => {
    // web-vitals not available
  });
}

/**
 * Mark performance points for custom metrics
 */
export function mark(name: string): void {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(name);
  }
}

/**
 * Measure duration between two marks
 */
export function measure(name: string, startMark: string, endMark?: string): number | null {
  if (typeof performance === 'undefined' || !performance.measure) return null;

  try {
    const entry = performance.measure(name, startMark, endMark);
    logEvent('performance_measure', {
      name,
      duration: Math.round(entry.duration),
      startTime: Math.round(entry.startTime),
    });
    return entry.duration;
  } catch {
    return null;
  }
}

/**
 * Get performance rating based on thresholds
 */
export function getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    CLS: [0.1, 0.25],
    FCP: [1800, 3000],
    LCP: [2500, 4000],
    TTFB: [800, 1800],
    INP: [200, 500],
  };

  const [good, poor] = thresholds[metricName] || [0, Infinity];
  
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Monitor component render performance
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  componentName: string
): T {
  return ((...args: any[]) => {
    const startMark = `${componentName}-start`;
    const endMark = `${componentName}-end`;
    
    mark(startMark);
    const result = fn(...args);
    mark(endMark);
    measure(`${componentName}-render`, startMark, endMark);
    
    return result;
  }) as T;
}
