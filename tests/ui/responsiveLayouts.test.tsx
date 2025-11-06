import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ThemeWallpaperManager } from '@/components/theme/ThemeWallpaperManager';
import type { WallpaperAsset } from '@/modules/layout/wallpaperLibrary';

const stubWallpaper = (overrides: Partial<WallpaperAsset> = {}): WallpaperAsset => ({
  id: 'test-wallpaper',
  name: 'Test Wallpaper',
  description: 'Synthetic wallpaper for responsive checks',
  gradient: 'linear-gradient(90deg, rgba(255,128,0,0.4), rgba(0,0,0,0.8))',
  particlePreset: 'command',
  accentTone: 'dusk',
  source: 'builtin',
  dataUrl: 'linear-gradient(90deg, rgba(255,128,0,0.4), rgba(0,0,0,0.8))',
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('responsive layouts', () => {
  it('ThemeWallpaperManager renders responsive grid classes', () => {
    const builtin = [stubWallpaper({ id: 'a' }), stubWallpaper({ id: 'b' })];
    const custom: WallpaperAsset[] = [];

    const onUpload = vi.fn().mockResolvedValue(undefined);
    const onRemove = vi.fn();
    const onSelect = vi.fn();
    const onOpacityChange = vi.fn();
    const onBlurChange = vi.fn();

    const { container } = render(
      <ThemeWallpaperManager
        builtin={builtin}
        custom={custom}
        activeWallpaperId={builtin[0].id}
        opacity={0.4}
        blur={6}
        onSelect={onSelect}
        onUpload={onUpload}
        onRemove={onRemove}
        onOpacityChange={onOpacityChange}
        onBlurChange={onBlurChange}
      />,
    );

    const grid = container.querySelector('.grid');
    expect(grid).not.toBeNull();
    expect(grid?.className).toContain('sm:grid-cols-2');
  });
});

