import { THEME_PRESETS, getThemePreset, type ThemeNameFromTokens } from '@/lib/designSystem';
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
  timestamp: number;
}

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
  
  if (resolved.hudAnimationsEnabled) {
    root.classList.remove('reduce-motion');
  } else {
    root.classList.add('reduce-motion');
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
  const next = coerceWallpaper({
    ...prefs,
    hudLayoutPreset: preset,
    hudPosition: position,
  });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudPosition(position: HudPosition): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({
    ...prefs,
    hudPosition: position,
    hudLayoutPreset: 'custom',
  });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudPinned(pinned: boolean): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({ ...prefs, hudPinned: pinned });
  saveThemePreferences(next);
  applyThemePreferences(next);
}

export function setHudSize(size: HudSize): void {
  const prefs = loadThemePreferences();
  const next = coerceWallpaper({
    ...prefs,
    hudSize: {
      width: Math.max(300, Math.min(800, size.width)),
      height: Math.max(400, Math.min(1000, size.height)),
    },
  });
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
  
  const next = coerceWallpaper({
    ...prefs,
    hudPosition: layout.position,
    hudSize: layout.size || { width: 384, height: 600 },
    hudPinned: layout.isPinned,
    hudLayoutPreset: 'custom',
  });
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
  const next = coerceWallpaper({ ...prefs, hudMiniMode: enabled });
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
  
  const next = coerceWallpaper({
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
  });
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
