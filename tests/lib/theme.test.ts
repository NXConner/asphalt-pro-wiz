import { describe, it, expect } from 'vitest';
import { getDefaultPreferences, applyThemePreferences } from '@/lib/theme';

describe('theme', () => {
  it('applies theme variables to document', () => {
    const prefs = getDefaultPreferences();
    applyThemePreferences(prefs);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
