import { describe, it, expect, beforeEach } from 'vitest';
import { isEnabled, setFlag } from '@/lib/flags';

describe('feature flags', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaults when no overrides present', () => {
    expect(isEnabled('aiAssistant')).toBe(true);
    expect(isEnabled('imageAreaAnalyzer')).toBe(true);
    expect(isEnabled('pwa')).toBe(true);
    expect(isEnabled('i18n')).toBe(true);
    expect(isEnabled('ownerMode')).toBe(false);
    expect(isEnabled('receipts')).toBe(true);
  });

  it('honors localStorage flag overrides', () => {
    setFlag('receipts', false);
    expect(isEnabled('receipts')).toBe(false);
    setFlag('receipts', true);
    expect(isEnabled('receipts')).toBe(true);
  });
});
