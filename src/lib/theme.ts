import { THEME_PRESETS, getThemePreset, type ThemeNameFromTokens } from '@/lib/designSystem';
import {
  getDefaultWallpaperAsset,
  getWallpaperAssetById,
  type WallpaperSource,
} from '@/modules/layout/wallpaperLibrary';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeName = ThemeNameFromTokens;

export interface ThemePreferences {
  mode: ThemeMode;
  name: ThemeName;
  primaryHue: number;
  useHueOverride: boolean;
  wallpaperId: string | null;
  wallpaperSource: WallpaperSource | null;
  wallpaperDataUrl: string;
  wallpaperOpacity: number;
  wallpaperBlur: number;
  radius: number;
  highContrast?: boolean;
  wallpaperName?: string | null;
  wallpaperDescription?: string | null;
}

export type ThemeWallpaperSelection =
  | string
  | {
      id?: string | null;
      dataUrl?: string;
      source?: WallpaperSource | null;
      name?: string | null;
      description?: string | null;
    };

const STORAGE_KEY = 'pps:theme';
const DEFAULT_THEME_NAME: ThemeName = 'division-agent';

const createDefaults = (): ThemePreferences => {
  const fallback = getDefaultWallpaperAsset();
  return {
    mode: 'dark',
    name: DEFAULT_THEME_NAME,
    primaryHue: 210,
    useHueOverride: false,
    wallpaperId: fallback.id,
    wallpaperSource: fallback.source,
    wallpaperDataUrl: fallback.dataUrl,
    wallpaperOpacity: 0.25,
    wallpaperBlur: 0,
    radius: 8,
    highContrast: false,
    wallpaperName: fallback.name,
    wallpaperDescription: fallback.description,
  };
};

const coerceWallpaper = (prefs: ThemePreferences): ThemePreferences => {
  if (!prefs.wallpaperId) {
    const fallback = getDefaultWallpaperAsset();
    return {
      ...prefs,
      wallpaperId: fallback.id,
      wallpaperSource: fallback.source,
      wallpaperDataUrl: fallback.dataUrl,
      wallpaperName: fallback.name,
      wallpaperDescription: fallback.description,
    };
  }
  const asset = getWallpaperAssetById(prefs.wallpaperId);
  if (!asset) {
    const fallback = getDefaultWallpaperAsset();
    return {
      ...prefs,
      wallpaperId: fallback.id,
      wallpaperSource: fallback.source,
      wallpaperDataUrl: fallback.dataUrl,
      wallpaperName: fallback.name,
      wallpaperDescription: fallback.description,
    };
  }
  return {
    ...prefs,
    wallpaperSource: asset.source,
    wallpaperDataUrl: asset.dataUrl,
    wallpaperName: prefs.wallpaperName ?? asset.name,
    wallpaperDescription: prefs.wallpaperDescription ?? asset.description,
  };
};

const normalisePreferences = (partial?: Partial<ThemePreferences>): ThemePreferences =>
  coerceWallpaper({ ...createDefaults(), ...(partial ?? {}) } as ThemePreferences);

export function getDefaultPreferences(): ThemePreferences {
  return createDefaults();
}

export function loadThemePreferences(): ThemePreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultPreferences();
    const parsed = JSON.parse(raw) as Partial<ThemePreferences>;
    return normalisePreferences(parsed);
  } catch {
    return getDefaultPreferences();
  }
}

export function saveThemePreferences(prefs: ThemePreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

const getTokensForTheme = (name: ThemeName): Record<string, string> =>
  THEME_PRESETS[name]?.tokens ?? getThemePreset(DEFAULT_THEME_NAME).tokens;

const resolveWallpaperValue = (prefs: ThemePreferences): string => {
  if (prefs.wallpaperId) {
    const asset = getWallpaperAssetById(prefs.wallpaperId);
    if (asset) return asset.dataUrl;
  }
  if (prefs.wallpaperDataUrl && prefs.wallpaperDataUrl.trim().length > 0) {
    return prefs.wallpaperDataUrl;
  }
  return getDefaultWallpaperAsset().dataUrl;
};

export function applyThemePreferences(prefs: ThemePreferences): void {
  const resolved = coerceWallpaper(prefs);
  const root = document.documentElement;
  const body = document.body;

  const mode = resolved.mode === 'system' ? getSystemMode() : resolved.mode;
  root.classList.remove('light', 'dark');
  root.classList.add(mode);

  const tokens = getTokensForTheme(resolved.name);
  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  root.style.setProperty('--radius', `${resolved.radius}px`);

  if (resolved.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }

  if (resolved.useHueOverride && Number.isFinite(resolved.primaryHue)) {
    root.style.setProperty('--primary', `${resolved.primaryHue} 100% 50%`);
    root.style.setProperty('--primary-foreground', `${resolved.primaryHue} 10% 95%`);
  } else {
    if (tokens['--primary']) {
      root.style.setProperty('--primary', tokens['--primary']);
    }
    if (tokens['--primary-foreground']) {
      root.style.setProperty('--primary-foreground', tokens['--primary-foreground']);
    }
  }

  const wallpaperValue = resolveWallpaperValue(resolved);
  if (wallpaperValue) {
    const trimmed = wallpaperValue.trim();
    const isGradient =
      trimmed.startsWith('linear-gradient') || trimmed.startsWith('radial-gradient');
    root.style.setProperty('--app-wallpaper', isGradient ? trimmed : `url('${trimmed}')`);
    root.style.setProperty('--wallpaper-opacity', `${resolved.wallpaperOpacity}`);
    root.style.setProperty('--wallpaper-blur', `${resolved.wallpaperBlur}px`);
    body.classList.add('has-wallpaper');
  } else {
    root.style.removeProperty('--app-wallpaper');
    root.style.removeProperty('--wallpaper-opacity');
    root.style.removeProperty('--wallpaper-blur');
    body.classList.remove('has-wallpaper');
  }
}

export function setThemeMode(mode: ThemeMode): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({ ...prefs, mode });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setThemeName(name: ThemeName): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({ ...prefs, name, useHueOverride: false });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setPrimaryHue(hue: number): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({
    ...prefs,
    primaryHue: Math.max(0, Math.min(360, Math.round(hue))),
    useHueOverride: true,
  });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setUseHueOverride(enabled: boolean): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({ ...prefs, useHueOverride: enabled });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setRadius(px: number): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({
    ...prefs,
    radius: Math.max(0, Math.min(24, Math.round(px))),
  });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setWallpaper(selection: ThemeWallpaperSelection): void {
  const prefs = loadThemePreferences();
  let next: ThemePreferences = { ...prefs };

  if (typeof selection === 'string') {
    const trimmed = selection.trim();
    if (trimmed.length === 0) {
      next = {
        ...next,
        wallpaperId: null,
        wallpaperSource: null,
        wallpaperDataUrl: '',
        wallpaperName: null,
        wallpaperDescription: null,
      };
    } else {
      next = {
        ...next,
        wallpaperId: null,
        wallpaperSource: 'custom',
        wallpaperDataUrl: trimmed,
        wallpaperName: 'Custom Wallpaper',
        wallpaperDescription: 'Manual selection',
      };
    }
  } else {
    const asset = selection.id ? getWallpaperAssetById(selection.id) : null;
    if (asset) {
      next = {
        ...next,
        wallpaperId: asset.id,
        wallpaperSource: asset.source,
        wallpaperDataUrl: asset.dataUrl,
        wallpaperName: selection.name ?? asset.name,
        wallpaperDescription: selection.description ?? asset.description,
      };
    } else {
      next = {
        ...next,
        wallpaperId: selection.id ?? null,
        wallpaperSource: selection.source ?? null,
        wallpaperDataUrl: selection.dataUrl ?? '',
        wallpaperName: selection.name ?? null,
        wallpaperDescription: selection.description ?? null,
      };
    }
  }

  next = coerceWallpaper(next);
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setWallpaperOpacity(opacity: number): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({
    ...prefs,
    wallpaperOpacity: Math.max(0, Math.min(1, opacity)),
  });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setWallpaperBlur(px: number): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({
    ...prefs,
    wallpaperBlur: Math.max(0, Math.min(30, Math.round(px))),
  });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHighContrastMode(enabled: boolean): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({ ...prefs, highContrast: enabled });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function resetThemePreferences(): ThemePreferences {
  const defaults = getDefaultPreferences();
  saveThemePreferences(defaults);
  applyThemePreferences(defaults);
  return defaults;
}

function getSystemMode(): 'light' | 'dark' {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}
