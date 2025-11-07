import { beforeEach, describe, expect, it } from 'vitest';

import { applyThemePreferences, getDefaultPreferences, setHighContrastMode } from '@/lib/theme';

describe('theme', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    document.documentElement.style.cssText = '';
    document.body.className = '';
  });

  it('applies theme variables to document', () => {
    const prefs = getDefaultPreferences();
    applyThemePreferences(prefs);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.getPropertyValue('--primary')).not.toBe('');
    expect(document.documentElement.style.getPropertyValue('--radius')).toBe('8px');
    expect(document.documentElement.classList.contains('reduce-motion')).toBe(false);
  });

  it('hydrates wallpaper variables and body class', () => {
    const prefs = {
      ...getDefaultPreferences(),
      wallpaperOpacity: 0.6,
      wallpaperBlur: 12,
    };
    applyThemePreferences(prefs);

    const wallpaper = document.documentElement.style.getPropertyValue('--app-wallpaper');
    expect(wallpaper).toContain('radial-gradient');
    expect(document.documentElement.style.getPropertyValue('--wallpaper-blur')).toBe('12px');
    expect(document.documentElement.style.getPropertyValue('--wallpaper-opacity')).toBe('0.6');
    expect(document.body.classList.contains('has-wallpaper')).toBe(true);
  });

  it('toggles high contrast mode via context setter', () => {
    const prefs = getDefaultPreferences();
    applyThemePreferences(prefs);
    expect(document.documentElement.classList.contains('high-contrast')).toBe(false);

    setHighContrastMode(true);
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
  });
});
