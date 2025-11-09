import {
  THEME_PRESETS,
  getThemePreset,
  listThemePresets,
  type ThemeCategory,
  type ThemeNameFromTokens,
  type ThemePresetMeta,
} from '@/lib/designSystem';
import {
  getDefaultWallpaperAsset,
  getWallpaperAssetById,
  type WallpaperSource,
} from '@/modules/layout/wallpaperLibrary';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeName = ThemeNameFromTokens;

export type HudPresetMode = 'minimal' | 'standard' | 'full' | 'custom';
export type HudLayoutPreset = 'top-right' | 'bottom-right' | 'bottom-left' | 'center' | 'custom';

export interface HudPosition {
  x: number;
  y: number;
}

export interface HudSize {
  width: number;
  height: number;
}

export type HudTransitionPreset = 'smooth' | 'instant' | 'bouncy' | 'slow';

export type HudThemeVariant = 'default' | 'minimal' | 'tactical' | 'glass' | 'solid';

export type HudAlertAnimation = 'pulse' | 'shake' | 'slide' | 'bounce' | 'glow' | 'none';

export type HudAnimationPresetId = 'deploy' | 'patrol' | 'stealth' | 'recon' | 'command';

export type HudGestureSensitivity = 'conservative' | 'standard' | 'aggressive';

export type HudMultiMonitorStrategy = 'auto' | 'single' | 'persist-latest';

export interface SavedHudDisplayLayout {
  position: HudPosition | null;
  size: HudSize;
  pinned: boolean;
  miniMode: boolean;
  profileName?: string;
  timestamp: number;
}

export interface SavedHudLayout {
  name: string;
  position: HudPosition;
  size: HudSize;
  isPinned: boolean;
  timestamp: number;
}

export interface HudConfigurationProfile {
  name: string;
  hudOpacity: number;
  hudBlur: number;
  showHud: boolean;
  hudPreset: HudPresetMode;
  hudAnimationsEnabled: boolean;
  hudLayoutPreset: HudLayoutPreset;
  hudSize: HudSize;
  hudTransitionPreset: HudTransitionPreset;
  hudMiniMode: boolean;
  hudAutoHide: boolean;
  hudAutoHideDelay: number;
  hudThemeVariant: HudThemeVariant;
  hudProximityEffect: boolean;
  hudProximityDistance: number;
  hudAlertAnimation: HudAlertAnimation;
  hudAnimationPreset: HudAnimationPresetId;
  hudGestureSensitivity: HudGestureSensitivity;
  hudMultiMonitorStrategy: HudMultiMonitorStrategy;
  hudKeyboardNavigation: boolean;
  timestamp: number;
}

export interface ThemePreferences {
  mode: ThemeMode;
  name: ThemeName;
  primaryHue: number;
  useHueOverride: boolean;
  accentHue: number;
  useAccentOverride: boolean;
  wallpaperId: string | null;
  wallpaperSource: WallpaperSource | null;
  wallpaperDataUrl: string;
  wallpaperOpacity: number;
  wallpaperBlur: number;
  radius: number;
  highContrast?: boolean;
  wallpaperName?: string | null;
  wallpaperDescription?: string | null;
  hudOpacity: number;
  hudBlur: number;
  showHud: boolean;
  hudPreset: HudPresetMode;
  hudAnimationsEnabled: boolean;
  hudLayoutPreset: HudLayoutPreset;
  hudPosition: HudPosition | null;
  hudSize: HudSize;
  hudPinned: boolean;
  savedLayouts: SavedHudLayout[];
  hudTransitionPreset: HudTransitionPreset;
  hudMiniMode: boolean;
  hudAutoHide: boolean;
  hudAutoHideDelay: number;
  hudThemeVariant: HudThemeVariant;
  hudProximityEffect: boolean;
  hudProximityDistance: number;
  hudAlertAnimation: HudAlertAnimation;
  hudQuickShortcuts: boolean;
  hudProfiles: HudConfigurationProfile[];
  hudGridSnap: boolean;
  hudGridSize: number;
  hudCollisionDetection: boolean;
  hudAnimationPreset: HudAnimationPresetId;
  hudGestureSensitivity: HudGestureSensitivity;
  hudMultiMonitorStrategy: HudMultiMonitorStrategy;
  hudDisplayLayouts: Record<string, SavedHudDisplayLayout>;
  hudKeyboardNavigation: boolean;
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
const DEFAULT_THEME_PRESET = getThemePreset(DEFAULT_THEME_NAME);

const normalizeHue = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  const mod = value % 360;
  return mod < 0 ? Math.round(mod + 360) : Math.round(mod);
};

const extractHue = (token: string | undefined, fallback: number): number => {
  if (!token) return fallback;
  const match = token.trim().match(/^(-?\d+(\.\d+)?)/);
  if (!match) return fallback;
  const parsed = Number.parseFloat(match[1] ?? `${fallback}`);
  return Number.isFinite(parsed) ? normalizeHue(parsed) : fallback;
};

const DEFAULT_PRIMARY_HUE = extractHue(DEFAULT_THEME_PRESET.tokens['--primary'], 210);
const DEFAULT_ACCENT_HUE = extractHue(
  DEFAULT_THEME_PRESET.tokens['--accent'],
  extractHue(DEFAULT_THEME_PRESET.tokens['--primary'], 210),
);

const formatHueColor = (hue: number, saturation = 92, lightness = 58): string =>
  `${normalizeHue(hue)} ${saturation}% ${lightness}%`;

const formatForegroundColor = (hue: number): string => `${normalizeHue(hue)} 16% 96%`;

const DISPLAY_LAYOUT_RETENTION = 8;

const createDefaults = (): ThemePreferences => {
  const fallback = getDefaultWallpaperAsset();
    return {
      mode: 'dark',
      name: DEFAULT_THEME_NAME,
      primaryHue: DEFAULT_PRIMARY_HUE,
      useHueOverride: false,
      accentHue: DEFAULT_ACCENT_HUE,
      useAccentOverride: false,
    wallpaperId: fallback.id,
    wallpaperSource: fallback.source,
    wallpaperDataUrl: fallback.dataUrl,
    wallpaperOpacity: 0.25,
    wallpaperBlur: 0,
    radius: 8,
    highContrast: false,
    wallpaperName: fallback.name,
    wallpaperDescription: fallback.description,
    hudOpacity: 0.8,
    hudBlur: 12,
    showHud: true,
    hudPreset: 'standard',
    hudAnimationsEnabled: true,
    hudLayoutPreset: 'top-right',
    hudPosition: null,
    hudSize: { width: 384, height: 600 },
    hudPinned: false,
    savedLayouts: [],
    hudTransitionPreset: 'smooth',
    hudMiniMode: false,
    hudAutoHide: false,
    hudAutoHideDelay: 3000,
    hudThemeVariant: 'default',
    hudProximityEffect: false,
    hudProximityDistance: 150,
    hudAlertAnimation: 'pulse',
    hudQuickShortcuts: true,
    hudProfiles: [],
    hudGridSnap: true,
    hudGridSize: 20,
    hudCollisionDetection: true,
    hudAnimationPreset: 'deploy',
    hudGestureSensitivity: 'standard',
    hudMultiMonitorStrategy: 'auto',
    hudDisplayLayouts: {},
    hudKeyboardNavigation: true,
  };
};

const coerceWallpaper = (prefs: ThemePreferences): ThemePreferences => {
  let normalized: ThemePreferences = {
    ...prefs,
    primaryHue: Number.isFinite(prefs.primaryHue) ? normalizeHue(prefs.primaryHue) : DEFAULT_PRIMARY_HUE,
    accentHue: Number.isFinite(prefs.accentHue) ? normalizeHue(prefs.accentHue) : DEFAULT_ACCENT_HUE,
  };

  if (!normalized.wallpaperId) {
    const fallback = getDefaultWallpaperAsset();
    return {
      ...normalized,
      wallpaperId: fallback.id,
      wallpaperSource: fallback.source,
      wallpaperDataUrl: fallback.dataUrl,
      wallpaperName: fallback.name,
      wallpaperDescription: fallback.description,
    };
  }
  let resolvedAsset = getWallpaperAssetById(normalized.wallpaperId);
  if (!resolvedAsset) {
    const fallback = getDefaultWallpaperAsset();
    normalized = {
      ...normalized,
      wallpaperId: fallback.id,
      wallpaperSource: fallback.source,
      wallpaperDataUrl: fallback.dataUrl,
      wallpaperName: fallback.name,
      wallpaperDescription: fallback.description,
    };
    resolvedAsset = fallback;
  }
  return {
    ...normalized,
    wallpaperSource: resolvedAsset.source,
    wallpaperDataUrl: resolvedAsset.dataUrl,
    wallpaperName: normalized.wallpaperName ?? resolvedAsset.name,
    wallpaperDescription: normalized.wallpaperDescription ?? resolvedAsset.description,
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
    if (!raw) return applyDisplayStrategy(getDefaultPreferences());
    const parsed = JSON.parse(raw) as Partial<ThemePreferences>;
    return applyDisplayStrategy(normalisePreferences(parsed));
  } catch {
    return applyDisplayStrategy(getDefaultPreferences());
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
  
  if (resolved.hudAnimationsEnabled) {
    root.classList.remove('reduce-motion');
  } else {
    root.classList.add('reduce-motion');
  }

    if (resolved.useHueOverride && Number.isFinite(resolved.primaryHue)) {
      const primary = formatHueColor(resolved.primaryHue, 92, 56);
      root.style.setProperty('--primary', primary);
      root.style.setProperty('--primary-hover', primary);
      root.style.setProperty('--primary-foreground', formatForegroundColor(resolved.primaryHue));
    } else {
      if (tokens['--primary']) {
        root.style.setProperty('--primary', tokens['--primary']);
      }
      if (tokens['--primary-hover']) {
        root.style.setProperty('--primary-hover', tokens['--primary-hover']);
      } else if (tokens['--primary']) {
        root.style.setProperty('--primary-hover', tokens['--primary']);
      }
      if (tokens['--primary-foreground']) {
        root.style.setProperty('--primary-foreground', tokens['--primary-foreground']);
      }
    }

    if (resolved.useAccentOverride && Number.isFinite(resolved.accentHue)) {
      const accent = formatHueColor(resolved.accentHue, 90, 62);
      root.style.setProperty('--accent', accent);
      root.style.setProperty('--accent-hover', accent);
      root.style.setProperty('--accent-foreground', formatForegroundColor(resolved.accentHue));
    } else {
      if (tokens['--accent']) {
        root.style.setProperty('--accent', tokens['--accent']);
      }
      if (tokens['--accent-hover']) {
        root.style.setProperty('--accent-hover', tokens['--accent-hover']);
      } else if (tokens['--accent']) {
        root.style.setProperty('--accent-hover', tokens['--accent']);
      }
      if (tokens['--accent-foreground']) {
        root.style.setProperty('--accent-foreground', tokens['--accent-foreground']);
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

  root.dataset.hudAnimationPreset = resolved.hudAnimationPreset;
  root.dataset.hudGestureSensitivity = resolved.hudGestureSensitivity;
  root.dataset.hudKeyboardNavigation = resolved.hudKeyboardNavigation ? 'on' : 'off';
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
    primaryHue: normalizeHue(hue),
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

export function setAccentHue(hue: number): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({
    ...prefs,
    accentHue: normalizeHue(hue),
    useAccentOverride: true,
  });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setUseAccentOverride(enabled: boolean): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({ ...prefs, useAccentOverride: enabled });
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

export interface RandomizePaletteOptions {
  category?: ThemeCategory | 'all';
  syncWallpaper?: boolean;
  allowHighContrast?: boolean;
}

export function randomizeMissionPalette(
  options?: RandomizePaletteOptions,
): ThemePresetMeta | null {
  const category =
    options?.category && options.category !== 'all' ? (options.category as ThemeCategory) : undefined;
  const presets = listThemePresets(category);
  if (presets.length === 0) {
    return null;
  }

  const preset = presets[Math.floor(Math.random() * presets.length)];
  const prefs = loadThemePreferences();
  const primaryHue = extractHue(preset.tokens['--primary'], prefs.primaryHue ?? DEFAULT_PRIMARY_HUE);
  const accentHue = extractHue(preset.tokens['--accent'], prefs.accentHue ?? DEFAULT_ACCENT_HUE);

  const highContrastEnabled =
    options?.allowHighContrast === false
      ? Boolean(prefs.highContrast)
      : Math.random() < 0.18;

  let next: ThemePreferences = {
    ...prefs,
    name: preset.id,
    useHueOverride: false,
    primaryHue,
    useAccentOverride: false,
    accentHue,
    highContrast: highContrastEnabled,
  };

  if (options?.syncWallpaper !== false && preset.recommendedWallpaperId) {
    const wallpaper =
      getWallpaperAssetById(preset.recommendedWallpaperId) ?? getDefaultWallpaperAsset();
    next = {
      ...next,
      wallpaperId: wallpaper.id,
      wallpaperSource: wallpaper.source,
      wallpaperDataUrl: wallpaper.dataUrl,
      wallpaperName: wallpaper.name,
      wallpaperDescription: wallpaper.description,
    };
  }

  const coerced = coerceWallpaper(next);
  saveThemePreferences(coerced);
  applyThemePreferences(coerced);
  return preset;
}

export function setHudOpacity(opacity: number): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({
    ...prefs,
    hudOpacity: Math.max(0.3, Math.min(1, opacity)),
  });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudBlur(px: number): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({
    ...prefs,
    hudBlur: Math.max(0, Math.min(24, Math.round(px))),
  });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setShowHud(enabled: boolean): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({ ...prefs, showHud: enabled });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudPreset(preset: HudPresetMode): void {
  const prefs = loadThemePreferences();
  let next: ThemePreferences;
  
  switch (preset) {
    case 'minimal':
      next = { ...prefs, hudOpacity: 0.5, hudBlur: 4, hudPreset: preset };
      break;
    case 'standard':
      next = { ...prefs, hudOpacity: 0.8, hudBlur: 12, hudPreset: preset };
      break;
    case 'full':
      next = { ...prefs, hudOpacity: 0.95, hudBlur: 20, hudPreset: preset };
      break;
    default:
      next = { ...prefs, hudPreset: 'custom' };
  }
  
  next = coerceWallpaper(next);
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudAnimationsEnabled(enabled: boolean): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({ ...prefs, hudAnimationsEnabled: enabled });
  saveThemePreferences(next);
  applyThemePreferences(next);
  
  // Apply animation state to document
  if (enabled) {
    document.documentElement.classList.remove('reduce-motion');
  } else {
    document.documentElement.classList.add('reduce-motion');
  }
}

const LAYOUT_PRESETS: Record<HudLayoutPreset, HudPosition | null> = {
  'top-right': { x: window.innerWidth - 420, y: 20 },
  'bottom-right': { x: window.innerWidth - 420, y: window.innerHeight - 600 },
  'bottom-left': { x: 20, y: window.innerHeight - 600 },
  'center': { x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 300 },
  'custom': null,
};

export function setHudLayoutPreset(preset: HudLayoutPreset): void {
  const prefs = loadThemePreferences();
  const position = LAYOUT_PRESETS[preset];
  let working: ThemePreferences = {
    ...prefs,
    hudLayoutPreset: preset,
    hudPosition: position,
  };

  if (position) {
    working = withDisplayLayout(working, { position });
  }

  const next = coerceWallpaper(working);
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudPosition(position: HudPosition): void {
  const prefs = loadThemePreferences();
  const working = withDisplayLayout(
    {
      ...prefs,
      hudPosition: position,
      hudLayoutPreset: 'custom',
    },
    { position },
  );
  const next = coerceWallpaper(working);
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudPinned(pinned: boolean): void {
  const prefs = loadThemePreferences();
  const working = withDisplayLayout({ ...prefs, hudPinned: pinned }, { pinned });
  const next = coerceWallpaper(working);
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudSize(size: HudSize): void {
  const prefs = loadThemePreferences();
  const boundedSize = {
    width: Math.max(300, Math.min(800, size.width)),
    height: Math.max(400, Math.min(1000, size.height)),
  };
  const working = withDisplayLayout(
    {
      ...prefs,
      hudSize: boundedSize,
    },
    { size: boundedSize },
  );
  const next = coerceWallpaper(working);
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function saveCustomLayout(name: string): void {
  const prefs = loadThemePreferences();
  if (!prefs.hudPosition) return;
  
  const newLayout: SavedHudLayout = {
    name,
    position: prefs.hudPosition,
    size: prefs.hudSize,
    isPinned: prefs.hudPinned,
    timestamp: Date.now(),
  };
  
  const savedLayouts = [...prefs.savedLayouts.filter(l => l.name !== name), newLayout];
  const next = coerceWallpaper({ ...prefs, savedLayouts });
  saveThemePreferences(next);
}

export function loadCustomLayout(name: string): void {
  const prefs = loadThemePreferences();
  const layout = prefs.savedLayouts.find(l => l.name === name);
  if (!layout) return;
  
  const working = withDisplayLayout(
    {
      ...prefs,
      hudPosition: layout.position,
      hudSize: layout.size || { width: 384, height: 600 },
      hudPinned: layout.isPinned,
      hudLayoutPreset: 'custom',
    },
    {
      position: layout.position,
      size: layout.size,
      pinned: layout.isPinned,
      profileName: name,
    },
  );
  const next = coerceWallpaper(working);
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function deleteCustomLayout(name: string): void {
  const prefs = loadThemePreferences();
  const savedLayouts = prefs.savedLayouts.filter(l => l.name !== name);
  const next = coerceWallpaper({ ...prefs, savedLayouts });
  saveThemePreferences(next);
}

export function setHudTransitionPreset(preset: HudTransitionPreset): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({ ...prefs, hudTransitionPreset: preset });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudMiniMode(enabled: boolean): void {
  const prefs = loadThemePreferences();
  const working = withDisplayLayout({ ...prefs, hudMiniMode: enabled }, { miniMode: enabled });
  const next = coerceWallpaper(working);
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudAutoHide(enabled: boolean): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({ ...prefs, hudAutoHide: enabled });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudAutoHideDelay(delay: number): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({
    ...prefs,
    hudAutoHideDelay: Math.max(1000, Math.min(10000, delay)),
  });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudThemeVariant(variant: HudThemeVariant): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({ ...prefs, hudThemeVariant: variant });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudProximityEffect(enabled: boolean): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({ ...prefs, hudProximityEffect: enabled });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudProximityDistance(distance: number): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({
    ...prefs,
    hudProximityDistance: Math.max(50, Math.min(300, distance)),
  });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudAlertAnimation(animation: HudAlertAnimation): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({ ...prefs, hudAlertAnimation: animation });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudQuickShortcuts(enabled: boolean): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({ ...prefs, hudQuickShortcuts: enabled });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudAnimationPreset(preset: HudAnimationPresetId): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({ ...prefs, hudAnimationPreset: preset });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudGestureSensitivity(sensitivity: HudGestureSensitivity): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({ ...prefs, hudGestureSensitivity: sensitivity });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudMultiMonitorStrategy(strategy: HudMultiMonitorStrategy): void {
  const prefs = loadThemePreferences();
  const adjusted = applyDisplayStrategy({
    ...prefs,
    hudMultiMonitorStrategy: strategy,
  });
  const next = coerceWallpaper(adjusted);
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudKeyboardNavigation(enabled: boolean): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({ ...prefs, hudKeyboardNavigation: enabled });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function saveHudProfile(name: string): void {
  const prefs = loadThemePreferences();
  
  const newProfile: HudConfigurationProfile = {
    name,
    hudOpacity: prefs.hudOpacity,
    hudBlur: prefs.hudBlur,
    showHud: prefs.showHud,
    hudPreset: prefs.hudPreset,
    hudAnimationsEnabled: prefs.hudAnimationsEnabled,
    hudLayoutPreset: prefs.hudLayoutPreset,
    hudSize: prefs.hudSize,
    hudTransitionPreset: prefs.hudTransitionPreset,
    hudMiniMode: prefs.hudMiniMode,
    hudAutoHide: prefs.hudAutoHide,
    hudAutoHideDelay: prefs.hudAutoHideDelay,
    hudThemeVariant: prefs.hudThemeVariant,
    hudProximityEffect: prefs.hudProximityEffect,
    hudProximityDistance: prefs.hudProximityDistance,
    hudAlertAnimation: prefs.hudAlertAnimation,
    hudAnimationPreset: prefs.hudAnimationPreset,
    hudGestureSensitivity: prefs.hudGestureSensitivity,
    hudMultiMonitorStrategy: prefs.hudMultiMonitorStrategy,
    hudKeyboardNavigation: prefs.hudKeyboardNavigation,
    timestamp: Date.now(),
  };
  
  const hudProfiles = [...prefs.hudProfiles.filter(p => p.name !== name), newProfile];
  const next = coerceWallpaper({ ...prefs, hudProfiles });
  saveThemePreferences(next);
}

export function loadHudProfile(name: string): void {
  const prefs = loadThemePreferences();
  const profile = prefs.hudProfiles.find(p => p.name === name);
  if (!profile) return;
  
  const working = withDisplayLayout(
    {
      ...prefs,
      hudOpacity: profile.hudOpacity,
      hudBlur: profile.hudBlur,
      showHud: profile.showHud,
      hudPreset: profile.hudPreset,
      hudAnimationsEnabled: profile.hudAnimationsEnabled,
      hudLayoutPreset: profile.hudLayoutPreset,
      hudSize: profile.hudSize,
      hudTransitionPreset: profile.hudTransitionPreset,
      hudMiniMode: profile.hudMiniMode,
      hudAutoHide: profile.hudAutoHide,
      hudAutoHideDelay: profile.hudAutoHideDelay,
      hudThemeVariant: profile.hudThemeVariant,
      hudProximityEffect: profile.hudProximityEffect,
      hudProximityDistance: profile.hudProximityDistance,
      hudAlertAnimation: profile.hudAlertAnimation,
      hudAnimationPreset: profile.hudAnimationPreset,
      hudGestureSensitivity: profile.hudGestureSensitivity,
      hudMultiMonitorStrategy: profile.hudMultiMonitorStrategy,
      hudKeyboardNavigation: profile.hudKeyboardNavigation,
    },
    {
      size: profile.hudSize,
      miniMode: profile.hudMiniMode,
      profileName: profile.name,
    },
  );
  const next = coerceWallpaper(working);
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function deleteHudProfile(name: string): void {
  const prefs = loadThemePreferences();
  const hudProfiles = prefs.hudProfiles.filter(p => p.name !== name);
  const next = coerceWallpaper({ ...prefs, hudProfiles });
  saveThemePreferences(next);
}

export function setHudGridSnap(enabled: boolean): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({ ...prefs, hudGridSnap: enabled });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudGridSize(size: number): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({
    ...prefs,
    hudGridSize: Math.max(10, Math.min(50, size)),
  });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudCollisionDetection(enabled: boolean): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({ ...prefs, hudCollisionDetection: enabled });
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

function applyDisplayStrategy(prefs: ThemePreferences): ThemePreferences {
  if (typeof window === 'undefined') return prefs;
  const strategy = prefs.hudMultiMonitorStrategy ?? 'auto';
  const key = getCurrentDisplayKey();

  if (!key) {
    return clampHudToViewport(prefs);
  }

  const currentLayout = prefs.hudDisplayLayouts?.[key];
  if (currentLayout) {
    return applyLayoutSnapshot(prefs, currentLayout);
  }

  if (strategy === 'persist-latest') {
    const latest = getMostRecentDisplayLayout(prefs);
    if (latest) {
      return applyLayoutSnapshot(prefs, latest);
    }
  }

  if (strategy === 'auto') {
    return clampHudToViewport(prefs);
  }

  return prefs;
}

function applyLayoutSnapshot(prefs: ThemePreferences, layout: SavedHudDisplayLayout): ThemePreferences {
  return {
    ...prefs,
    hudPosition: layout.position ?? prefs.hudPosition,
    hudSize: layout.size ?? prefs.hudSize,
    hudPinned: layout.pinned ?? prefs.hudPinned,
    hudMiniMode: layout.miniMode ?? prefs.hudMiniMode,
    hudLayoutPreset: 'custom',
  };
}

function clampHudToViewport(prefs: ThemePreferences): ThemePreferences {
  if (typeof window === 'undefined') return prefs;
  const viewportWidth = Math.max(window.innerWidth || 0, 1);
  const viewportHeight = Math.max(window.innerHeight || 0, 1);
  const size = prefs.hudSize ?? { width: 384, height: 600 };
  const { width, height } = size;
  const position = prefs.hudPosition ?? LAYOUT_PRESETS['top-right'] ?? { x: viewportWidth - width - 20, y: 20 };
  const clampedPosition = {
    x: Math.max(0, Math.min(position.x, viewportWidth - width)),
    y: Math.max(0, Math.min(position.y, viewportHeight - height)),
  };

  if (clampedPosition.x === position.x && clampedPosition.y === position.y) {
    return prefs;
  }

  return {
    ...prefs,
    hudPosition: clampedPosition,
    hudLayoutPreset: 'custom',
  };
}

function getMostRecentDisplayLayout(prefs: ThemePreferences): SavedHudDisplayLayout | null {
  const layouts = prefs.hudDisplayLayouts;
  if (!layouts || Object.keys(layouts).length === 0) return null;
  return Object.values(layouts).sort((a, b) => b.timestamp - a.timestamp)[0] ?? null;
}

function withDisplayLayout(
  prefs: ThemePreferences,
  overrides: Partial<SavedHudDisplayLayout> & { position?: HudPosition | null; size?: HudSize },
): ThemePreferences {
  if (typeof window === 'undefined') return prefs;
  const key = getCurrentDisplayKey();
  if (!key) return prefs;

  const existingLayouts = prefs.hudDisplayLayouts ?? {};
  const baseline: SavedHudDisplayLayout =
    existingLayouts[key] ?? {
      position: prefs.hudPosition,
      size: prefs.hudSize,
      pinned: prefs.hudPinned,
      miniMode: prefs.hudMiniMode,
      profileName: undefined,
      timestamp: Date.now(),
    };

  const nextLayout: SavedHudDisplayLayout = {
    position: overrides.position ?? baseline.position ?? prefs.hudPosition,
    size: overrides.size ?? baseline.size ?? prefs.hudSize,
    pinned: overrides.pinned ?? baseline.pinned ?? prefs.hudPinned,
    miniMode: overrides.miniMode ?? baseline.miniMode ?? prefs.hudMiniMode,
    profileName: overrides.profileName ?? baseline.profileName,
    timestamp: Date.now(),
  };

  const updatedLayouts = { ...existingLayouts, [key]: nextLayout };
  const trimmedLayouts = trimDisplayLayouts(updatedLayouts);

  return {
    ...prefs,
    hudDisplayLayouts: trimmedLayouts,
  };
}

function trimDisplayLayouts(layouts: Record<string, SavedHudDisplayLayout>): Record<string, SavedHudDisplayLayout> {
  const entries = Object.entries(layouts).sort((a, b) => b[1].timestamp - a[1].timestamp);
  if (entries.length <= DISPLAY_LAYOUT_RETENTION) {
    return layouts;
  }

  return entries.slice(0, DISPLAY_LAYOUT_RETENTION).reduce<Record<string, SavedHudDisplayLayout>>((acc, [key, layout]) => {
    acc[key] = layout;
    return acc;
  }, {});
}

export function getCurrentDisplayKey(): string | null {
  if (typeof window === 'undefined') return null;
  const screen = window.screen;
  if (!screen) return null;

  const width = Math.round(screen.width || window.innerWidth || 0);
  const height = Math.round(screen.height || window.innerHeight || 0);
  if (width === 0 || height === 0) return null;

  const availWidth = Math.round(screen.availWidth || width);
  const availHeight = Math.round(screen.availHeight || height);
  const pixelRatio =
    typeof window.devicePixelRatio === 'number'
      ? Number(window.devicePixelRatio.toFixed(2))
      : 1;
  const orientation =
    screen.orientation?.type ??
    (width >= height ? 'landscape-primary' : 'portrait-primary');
  const offsetX = Math.round(window.screenLeft ?? (window as typeof window & { screenX?: number }).screenX ?? 0);
  const offsetY = Math.round(window.screenTop ?? (window as typeof window & { screenY?: number }).screenY ?? 0);

  return [
    `w${width}`,
    `h${height}`,
    `aw${availWidth}`,
    `ah${availHeight}`,
    `pr${pixelRatio}`,
    `o${orientation}`,
    `x${offsetX}`,
    `y${offsetY}`,
  ].join('-');
}
