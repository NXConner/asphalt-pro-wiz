import { logEvent } from './logging';

/**
 * Analytics wrapper for tracking user interactions
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

export function trackEvent(name: string, properties?: Record<string, any>) {
  try {
    logEvent(name, properties);
    
    // Add Google Analytics if configured
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', name, properties);
    }
  } catch (error) {
    // Silent fail for analytics
    console.warn('Analytics tracking failed:', error);
  }
}

export function trackPageView(path: string) {
  trackEvent('page_view', { page_path: path });
}

export function trackError(error: Error, context?: Record<string, any>) {
  trackEvent('error', {
    error_message: error.message,
    error_stack: error.stack,
    ...context,
  });
}

export function trackTiming(name: string, duration: number) {
  trackEvent('timing', {
    name,
    duration,
  });
}

export function trackUserAction(action: string, category: string, label?: string) {
  trackEvent('user_action', {
    action,
    category,
    label,
  });
}
