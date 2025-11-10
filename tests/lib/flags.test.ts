import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  clearRemoteFlags,
  DEFAULT_FLAGS,
  FEATURE_FLAGS,
  getFlagSnapshot,
  isEnabled,
  setFlag,
  setRemoteFlags,
} from '@/lib/flags';

describe('feature flags', () => {
  beforeEach(() => {
    localStorage.clear();
    clearRemoteFlags();
  });

  afterEach(() => {
    clearRemoteFlags();
    delete (process.env as Record<string, string | undefined>).VITE_FLAG_SCHEDULER;
  });

  it('exposes metadata-driven defaults for every flag', () => {
    expect(FEATURE_FLAGS.length).toBeGreaterThan(0);
    expect(new Set(FEATURE_FLAGS).size).toBe(FEATURE_FLAGS.length);
    expect(DEFAULT_FLAGS).toMatchObject({
      aiAssistant: true,
      commandCenter: true,
      ownerMode: false,
      scheduler: false,
      tacticalMapV2: true,
    });
  });

  it('returns defaults when no overrides present', () => {
    expect(isEnabled('aiAssistant')).toBe(true);
    expect(isEnabled('imageAreaAnalyzer')).toBe(true);
    expect(isEnabled('pwa')).toBe(true);
    expect(isEnabled('i18n')).toBe(true);
    expect(isEnabled('ownerMode')).toBe(false);
    expect(isEnabled('receipts')).toBe(true);
    expect(isEnabled('tacticalMapV2')).toBe(true);
  });

  it('honors localStorage flag overrides', () => {
    setFlag('receipts', false);
    expect(isEnabled('receipts')).toBe(false);
    setFlag('receipts', true);
    expect(isEnabled('receipts')).toBe(true);
  });

  it('honors remote overrides', () => {
    expect(isEnabled('scheduler')).toBe(false);
    setRemoteFlags({ scheduler: true });
    expect(isEnabled('scheduler')).toBe(true);
    expect(getFlagSnapshot().scheduler).toBe(true);
  });

  it('pulls from environment overrides when provided', () => {
    expect(isEnabled('scheduler')).toBe(false);
    process.env.VITE_FLAG_SCHEDULER = 'true';
    clearRemoteFlags();
    localStorage.clear();
    expect(isEnabled('scheduler')).toBe(true);
  });
});
