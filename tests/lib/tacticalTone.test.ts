import { describe, expect, it } from 'vitest';

import { resolveTacticalTone } from '@/lib/tacticalTone';

describe('resolveTacticalTone', () => {
  it('returns tone defaults for Division palettes', () => {
    const ember = resolveTacticalTone({ tone: 'ember' });
    expect(ember.accent).toContain('rgba');
    expect(ember.background).toContain('rgba');
    expect(ember.gridOpacity).toBeGreaterThan(0);
    expect(ember.scanOpacity).toBeGreaterThan(0);
    expect(ember.cornerOpacity).toBeGreaterThan(0);
  });

  it('falls back to neutral when tone missing', () => {
    const fallback = resolveTacticalTone();
    expect(fallback.accent).toBeDefined();
    expect(fallback.background).toBeDefined();
  });

  it('applies overrides and clamps numeric values', () => {
    const tone = resolveTacticalTone({
      tone: 'accent',
      accentOverride: '#fff',
      backgroundOverride: '#000',
      gridOpacity: 4,
      scanOpacity: -1,
      cornerOpacity: 1.4,
    });
    expect(tone.accent).toBe('#fff');
    expect(tone.background).toBe('#000');
    expect(tone.gridOpacity).toBe(1);
    expect(tone.scanOpacity).toBe(0);
    expect(tone.cornerOpacity).toBe(1);
  });
});

