import { describe, it, expect, vi, beforeEach } from 'vitest';

import { mark, measure, getRating, withPerformanceMonitoring } from '@/lib/performance';

describe('Performance Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('mark', () => {
    it('should create performance mark', () => {
      const mockMark = vi.fn();
      global.performance.mark = mockMark;

      mark('test-mark');

      expect(mockMark).toHaveBeenCalledWith('test-mark');
    });
  });

  describe('getRating', () => {
    it('should return good rating for low values', () => {
      expect(getRating('LCP', 2000)).toBe('good');
    });

    it('should return needs-improvement for medium values', () => {
      expect(getRating('LCP', 3000)).toBe('needs-improvement');
    });

    it('should return poor rating for high values', () => {
      expect(getRating('LCP', 5000)).toBe('poor');
    });
  });

  describe('withPerformanceMonitoring', () => {
    it('should wrap function with performance monitoring', () => {
      const testFn = vi.fn(() => 'result');
      const wrapped = withPerformanceMonitoring(testFn, 'TestComponent');

      const result = wrapped();

      expect(result).toBe('result');
      expect(testFn).toHaveBeenCalled();
    });
  });
});
