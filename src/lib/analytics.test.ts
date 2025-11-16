import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { runtimeEnv } from '@/lib/runtimeEnv';

import { __resetAnalyticsTestState, shouldSendThirdPartyAnalytics } from './analytics';

const originalWindow = globalThis.window;
const originalNavigator = globalThis.navigator;

describe('shouldSendThirdPartyAnalytics', () => {
  beforeEach(() => {
    runtimeEnv.VITE_DISABLE_THIRD_PARTY_ANALYTICS = undefined;
    (globalThis as any).window = {
      location: { hostname: 'localhost' },
    };
    (globalThis as any).navigator = { onLine: true };
    __resetAnalyticsTestState();
  });

  afterEach(() => {
    runtimeEnv.VITE_DISABLE_THIRD_PARTY_ANALYTICS = undefined;
    (globalThis as any).window = originalWindow;
    (globalThis as any).navigator = originalNavigator;
  });

  it('returns false when flag disables third-party analytics', () => {
    runtimeEnv.VITE_DISABLE_THIRD_PARTY_ANALYTICS = '1';
    expect(shouldSendThirdPartyAnalytics()).toBe(false);
  });

  it('returns false when offline', () => {
    (globalThis.navigator as any).onLine = false;
    expect(shouldSendThirdPartyAnalytics()).toBe(false);
  });

  it('returns false on Lovable preview hosts', () => {
    (globalThis.window as any).location.hostname = 'preview--abc.lovable.app';
    expect(shouldSendThirdPartyAnalytics()).toBe(false);
  });

  it('returns true for standard hosts when online and flag disabled', () => {
    expect(shouldSendThirdPartyAnalytics()).toBe(true);
  });
});
