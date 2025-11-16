import { runtimeEnv } from '@/lib/runtimeEnv';

import { logEvent } from './logging';

/**
 * Analytics wrapper for tracking user interactions
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

const TRUEISH = new Set(['1', 'true', 'yes', 'on']);
const LOVABLE_HOST_PATTERN = /(lovable\.app|lovable\.dev|lovableproject\.com)$/i;

let hasLoggedSuppression = false;
let lastSuppressionReason: string | undefined;

const recordSuppression = (reason: string, eventName: string) => {
  lastSuppressionReason = reason;
  if (hasLoggedSuppression) return;
  hasLoggedSuppression = true;
  logEvent(
    'analytics.third_party.suppressed',
    {
      reason,
      event: eventName,
    },
    'warn',
  );
};

export function shouldSendThirdPartyAnalytics(): boolean {
  if (typeof window === 'undefined') {
    lastSuppressionReason = 'no-window';
    return false;
  }

  const disableFlag = String(runtimeEnv.VITE_DISABLE_THIRD_PARTY_ANALYTICS ?? '')
    .trim()
    .toLowerCase();
  if (TRUEISH.has(disableFlag)) {
    lastSuppressionReason = 'flagged';
    return false;
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    lastSuppressionReason = 'offline';
    return false;
  }

  const host = window.location?.hostname ?? '';
  if (LOVABLE_HOST_PATTERN.test(host)) {
    lastSuppressionReason = 'lovable-host';
    return false;
  }

  lastSuppressionReason = undefined;
  return true;
}

const dispatchThirdPartyEvent = (event: string, payload?: Record<string, any>) => {
  if (!shouldSendThirdPartyAnalytics()) {
    recordSuppression(lastSuppressionReason ?? 'unknown', event);
    return;
  }

  if (typeof window === 'undefined') return;
  const globalWindow = window as typeof window & {
    gtag?: (...args: any[]) => void;
    ttq?: { track?: (eventName: string, params?: Record<string, any>) => void };
  };

  if (typeof globalWindow.gtag === 'function') {
    try {
      globalWindow.gtag('event', event, payload ?? {});
    } catch (error) {
      logEvent(
        'analytics.third_party.failure',
        { provider: 'gtag', message: (error as Error).message ?? String(error) },
        'warn',
      );
    }
  }

  const tikTok = globalWindow.ttq;
  if (tikTok?.track) {
    try {
      tikTok.track(event, payload ?? {});
    } catch (error) {
      logEvent(
        'analytics.third_party.failure',
        { provider: 'ttq', message: (error as Error).message ?? String(error) },
        'warn',
      );
    }
  }
};

export function trackEvent(name: string, properties?: Record<string, any>) {
  try {
    logEvent(name, properties);
    dispatchThirdPartyEvent(name, properties);
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

export function __resetAnalyticsTestState() {
  hasLoggedSuppression = false;
  lastSuppressionReason = undefined;
}
