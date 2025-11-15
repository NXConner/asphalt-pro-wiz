import { describe, it, expect } from 'vitest';

import {
  assessContrast,
  contrastRatio,
  hslToRgb,
  parseHsl,
  relativeLuminance,
  summarizeThemeAccessibility,
} from '@/lib/color';
import { DESIGN_SYSTEM } from '@/lib/designSystem';

describe('color utilities', () => {
  it('parses HSL strings into numeric components', () => {
    const parsed = parseHsl('200 65% 42%');
    expect(parsed.h).toBeCloseTo(200);
    expect(parsed.s).toBeCloseTo(0.65);
    expect(parsed.l).toBeCloseTo(0.42);
  });

  it('converts HSL to RGB', () => {
    const rgb = hslToRgb({ h: 0, s: 1, l: 0.5 });
    expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('computes relative luminance', () => {
    const lum = relativeLuminance({ r: 255, g: 255, b: 255 });
    expect(lum).toBeCloseTo(1);
  });

  it('derives contrast ratios between two colors', () => {
    const ratio = contrastRatio('0 0% 0%', '0 0% 100%');
    expect(ratio).toBeCloseTo(21);
  });

  it('assesses WCAG contrast compliance', () => {
    const result = assessContrast('0 0% 0%', '0 0% 100%');
    expect(result.level).toBe('AAA');
    expect(result.largeTextPass).toBe(true);
  });

  it('summarizes theme accessibility for current tokens', () => {
    const summary = summarizeThemeAccessibility({
      ...DESIGN_SYSTEM.colors,
      background: DESIGN_SYSTEM.colors['--background'],
      foreground: DESIGN_SYSTEM.colors['--foreground'],
      primary: DESIGN_SYSTEM.colors['--primary'],
      primaryForeground: DESIGN_SYSTEM.colors['--primary-foreground'],
      secondary: DESIGN_SYSTEM.colors['--secondary'],
      secondaryForeground: DESIGN_SYSTEM.colors['--secondary-foreground'],
      accent: DESIGN_SYSTEM.colors['--accent'],
      accentForeground: DESIGN_SYSTEM.colors['--accent-foreground'],
      muted: DESIGN_SYSTEM.colors['--muted'],
      mutedForeground: DESIGN_SYSTEM.colors['--muted-foreground'],
      destructive: DESIGN_SYSTEM.colors['--destructive'],
      destructiveForeground: DESIGN_SYSTEM.colors['--destructive-foreground'],
      border: DESIGN_SYSTEM.colors['--border'],
      input: DESIGN_SYSTEM.colors['--input'],
      ring: DESIGN_SYSTEM.colors['--ring'],
      card: DESIGN_SYSTEM.colors['--card'],
      cardForeground: DESIGN_SYSTEM.colors['--card-foreground'],
      radiusPx: 8,
    });

    expect(summary.items.length).toBeGreaterThan(0);
    expect(summary.weakest).not.toBeNull();
  });
});
