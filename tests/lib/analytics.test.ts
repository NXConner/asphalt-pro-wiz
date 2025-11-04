import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  trackEvent,
  trackPageView,
  trackError,
  trackTiming,
  trackUserAction,
} from '@/lib/analytics';

vi.mock('@/lib/logging', () => ({
  logEvent: vi.fn(),
}));

describe('Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('trackEvent', () => {
    it('should track events with properties', () => {
      const { logEvent } = require('@/lib/logging');

      trackEvent('test_event', { prop1: 'value1' });

      expect(logEvent).toHaveBeenCalledWith('test_event', { prop1: 'value1' });
    });

    it('should handle errors silently', () => {
      const { logEvent } = require('@/lib/logging');
      logEvent.mockImplementation(() => {
        throw new Error('Test error');
      });

      expect(() => trackEvent('test_event')).not.toThrow();
    });
  });

  describe('trackPageView', () => {
    it('should track page views with path', () => {
      const { logEvent } = require('@/lib/logging');

      trackPageView('/test-path');

      expect(logEvent).toHaveBeenCalledWith('page_view', { page_path: '/test-path' });
    });
  });

  describe('trackError', () => {
    it('should track errors with context', () => {
      const { logEvent } = require('@/lib/logging');
      const error = new Error('Test error');

      trackError(error, { context: 'test' });

      expect(logEvent).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          error_message: 'Test error',
          context: 'test',
        }),
      );
    });
  });

  describe('trackTiming', () => {
    it('should track timing metrics', () => {
      const { logEvent } = require('@/lib/logging');

      trackTiming('render_time', 150);

      expect(logEvent).toHaveBeenCalledWith('timing', {
        name: 'render_time',
        duration: 150,
      });
    });
  });

  describe('trackUserAction', () => {
    it('should track user actions with category and label', () => {
      const { logEvent } = require('@/lib/logging');

      trackUserAction('click', 'button', 'submit');

      expect(logEvent).toHaveBeenCalledWith('user_action', {
        action: 'click',
        category: 'button',
        label: 'submit',
      });
    });
  });
});
