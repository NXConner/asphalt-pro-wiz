import { useCallback, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';

import { CANVAS_WALLPAPERS, DEFAULT_WALLPAPER, type CanvasWallpaper } from '@/modules/layout/wallpapers';
import type { CanvasTone } from '@/modules/layout/CanvasPanel';

export type WallpaperSource = 'builtin' | 'custom';

export interface WallpaperAsset extends CanvasWallpaper {
  source: WallpaperSource;
  /**
   * Raw data URL or CSS gradient string that represents the wallpaper surface.
   * Built-in presets use gradient strings, uploads use data URLs.
   */
  dataUrl: string;
  createdAt: string;
}

const STORAGE_KEY = 'pps:wallpapers.custom';

const hasBrowserStorage = () => typeof window !== 'undefined' && !!window.localStorage;

const serialise = (wallpapers: WallpaperAsset[]): void => {
  if (!hasBrowserStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wallpapers));
  } catch (error) {
    console.warn('[PPS] Failed to persist custom wallpapers.', error);
  }
};

const parseStored = (): WallpaperAsset[] => {
  if (!hasBrowserStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WallpaperAsset[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry) => typeof entry?.id === 'string' && typeof entry?.dataUrl === 'string')
      .map((entry) => ({
        ...entry,
        source: 'custom',
        accentTone: entry.accentTone ?? 'dusk',
        createdAt: entry.createdAt ?? new Date().toISOString(),
      }));
  } catch (error) {
    console.warn('[PPS] Failed to parse custom wallpapers.', error);
    return [];
  }
};

const TONE_TO_PARTICLE: Record<CanvasTone, WallpaperAsset['particlePreset']> = {
  dusk: 'ember',
  aurora: 'tech',
  ember: 'rogue',
  lagoon: 'command',
};

const normaliseBuiltin = (wallpaper: CanvasWallpaper): WallpaperAsset => ({
  ...wallpaper,
  source: 'builtin',
  dataUrl: wallpaper.gradient,
  createdAt: '1970-01-01T00:00:00.000Z',
});

const BUILTIN_LIBRARY: WallpaperAsset[] = CANVAS_WALLPAPERS.map(normaliseBuiltin);

export const getDefaultWallpaperAsset = (): WallpaperAsset => normaliseBuiltin(DEFAULT_WALLPAPER);

export const listCustomWallpapers = (): WallpaperAsset[] => parseStored();

export const listWallpaperAssets = (): WallpaperAsset[] => [
  ...BUILTIN_LIBRARY,
  ...listCustomWallpapers(),
];

export const getWallpaperAssetById = (id: string): WallpaperAsset | undefined => {
  if (!id) return undefined;
  const builtin = BUILTIN_LIBRARY.find((entry) => entry.id === id);
  if (builtin) return builtin;
  return listCustomWallpapers().find((entry) => entry.id === id);
};

export interface CreateWallpaperInput {
  name?: string;
  description?: string;
  dataUrl: string;
  accentTone?: CanvasWallpaper['accentTone'];
}

export const addCustomWallpaper = (input: CreateWallpaperInput): WallpaperAsset => {
  const id = `custom-${nanoid(10)}`;
  const now = new Date().toISOString();
  const accentTone: CanvasTone = input.accentTone ?? 'dusk';
  const asset: WallpaperAsset = {
    id,
    name: input.name?.trim() || 'Custom Upload',
    description: input.description?.trim() || 'User uploaded wallpaper',
    gradient: input.dataUrl,
    particlePreset: TONE_TO_PARTICLE[accentTone] ?? 'command',
    accentTone,
    source: 'custom',
    dataUrl: input.dataUrl,
    createdAt: now,
  };

  const existing = listCustomWallpapers();
  const next = [...existing.filter((entry) => entry.id !== id), asset];
  serialise(next);
  return asset;
};

export const removeCustomWallpaper = (id: string): void => {
  if (!id) return;
  const filtered = listCustomWallpapers().filter((entry) => entry.id !== id);
  serialise(filtered);
};

export interface WallpaperLibraryHook {
  builtin: WallpaperAsset[];
  custom: WallpaperAsset[];
  wallpapers: WallpaperAsset[];
  addWallpaper: (input: CreateWallpaperInput) => WallpaperAsset;
  removeWallpaper: (id: string) => void;
  refresh: () => void;
  getById: (id: string) => WallpaperAsset | undefined;
}

export const useWallpaperLibrary = (): WallpaperLibraryHook => {
  const builtin = useMemo(() => BUILTIN_LIBRARY, []);
  const [custom, setCustom] = useState<WallpaperAsset[]>(() => listCustomWallpapers());

  const addWallpaper = useCallback((input: CreateWallpaperInput) => {
    const created = addCustomWallpaper(input);
    setCustom((prev) => [...prev.filter((entry) => entry.id !== created.id), created]);
    return created;
  }, []);

  const removeWallpaperHandler = useCallback((id: string) => {
    removeCustomWallpaper(id);
    setCustom((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const refresh = useCallback(() => {
    setCustom(listCustomWallpapers());
  }, []);

  const wallpapers = useMemo(() => [...builtin, ...custom], [builtin, custom]);

  return {
    builtin,
    custom,
    wallpapers,
    addWallpaper,
    removeWallpaper: removeWallpaperHandler,
    refresh,
    getById: getWallpaperAssetById,
  };
};

