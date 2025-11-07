import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import {
  loadThemePreferences,
  applyThemePreferences,
  setThemeMode as persistThemeMode,
  setThemeName as persistThemeName,
  setPrimaryHue as persistPrimaryHue,
  setRadius as persistRadius,
  setWallpaper as persistWallpaper,
  setWallpaperOpacity as persistWallpaperOpacity,
  setWallpaperBlur as persistWallpaperBlur,
  setUseHueOverride as persistUseHueOverride,
  setHighContrastMode as persistHighContrastMode,
  setHudOpacity as persistHudOpacity,
  setHudBlur as persistHudBlur,
  setShowHud as persistShowHud,
  setHudPreset as persistHudPreset,
  setHudAnimationsEnabled as persistHudAnimationsEnabled,
  setHudLayoutPreset as persistHudLayoutPreset,
  setHudPosition as persistHudPosition,
  setHudSize as persistHudSize,
  setHudPinned as persistHudPinned,
  saveCustomLayout as persistSaveCustomLayout,
  loadCustomLayout as persistLoadCustomLayout,
  deleteCustomLayout as persistDeleteCustomLayout,
  setHudTransitionPreset as persistHudTransitionPreset,
  setHudMiniMode as persistHudMiniMode,
  setHudAutoHide as persistHudAutoHide,
  setHudAutoHideDelay as persistHudAutoHideDelay,
  setHudThemeVariant as persistHudThemeVariant,
  resetThemePreferences,
  type ThemePreferences,
  type ThemeMode,
  type ThemeName,
  type ThemeWallpaperSelection,
  type HudPresetMode,
  type HudLayoutPreset,
  type HudPosition,
  type HudSize,
  type HudTransitionPreset,
  type HudThemeVariant,
} from '@/lib/theme';

interface ThemeContextValue {
  preferences: ThemePreferences;
  setMode: (mode: ThemeMode) => void;
  setTheme: (name: ThemeName) => void;
  setPrimaryHue: (hue: number) => void;
  setRadius: (radius: number) => void;
  setUseHueOverride: (enabled: boolean) => void;
  setWallpaper: (selection: ThemeWallpaperSelection) => void;
  setWallpaperOpacity: (opacity: number) => void;
  setWallpaperBlur: (blur: number) => void;
  setHighContrast: (enabled: boolean) => void;
  setHudOpacity: (opacity: number) => void;
  setHudBlur: (blur: number) => void;
  setShowHud: (enabled: boolean) => void;
  setHudPreset: (preset: HudPresetMode) => void;
  setHudAnimationsEnabled: (enabled: boolean) => void;
  setHudLayoutPreset: (preset: HudLayoutPreset) => void;
  setHudPosition: (position: HudPosition) => void;
  setHudSize: (size: HudSize) => void;
  setHudPinned: (pinned: boolean) => void;
  saveCustomLayout: (name: string) => void;
  loadCustomLayout: (name: string) => void;
  deleteCustomLayout: (name: string) => void;
  setHudTransitionPreset: (preset: HudTransitionPreset) => void;
  setHudMiniMode: (enabled: boolean) => void;
  setHudAutoHide: (enabled: boolean) => void;
  setHudAutoHideDelay: (delay: number) => void;
  setHudThemeVariant: (variant: HudThemeVariant) => void;
  reset: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<ThemePreferences>(loadThemePreferences);

  useEffect(() => {
    applyThemePreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'pps:theme') {
        setPreferences(loadThemePreferences());
      }
    };
    
    const handleToggleHud = () => {
      persistShowHud(!preferences.showHud);
      syncPreferences();
    };
    
    window.addEventListener('storage', handleStorage);
    window.addEventListener('toggleHud', handleToggleHud);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('toggleHud', handleToggleHud);
    };
  }, [preferences.showHud]);

  const syncPreferences = () => {
    setPreferences(loadThemePreferences());
  };

  const value: ThemeContextValue = {
    preferences,
    setMode: (mode) => {
      persistThemeMode(mode);
      syncPreferences();
    },
    setTheme: (name) => {
      persistThemeName(name);
      syncPreferences();
    },
    setPrimaryHue: (hue) => {
      persistPrimaryHue(hue);
      syncPreferences();
    },
    setRadius: (radius) => {
      persistRadius(radius);
      syncPreferences();
    },
    setUseHueOverride: (enabled) => {
      persistUseHueOverride(enabled);
      syncPreferences();
    },
    setWallpaper: (selection) => {
      persistWallpaper(selection);
      syncPreferences();
    },
    setWallpaperOpacity: (opacity) => {
      persistWallpaperOpacity(opacity);
      syncPreferences();
    },
    setWallpaperBlur: (blur) => {
      persistWallpaperBlur(blur);
      syncPreferences();
    },
    setHighContrast: (enabled) => {
      persistHighContrastMode(enabled);
      syncPreferences();
    },
    setHudOpacity: (opacity) => {
      persistHudOpacity(opacity);
      syncPreferences();
    },
    setHudBlur: (blur) => {
      persistHudBlur(blur);
      syncPreferences();
    },
    setShowHud: (enabled) => {
      persistShowHud(enabled);
      syncPreferences();
    },
    setHudPreset: (preset) => {
      persistHudPreset(preset);
      syncPreferences();
    },
    setHudAnimationsEnabled: (enabled) => {
      persistHudAnimationsEnabled(enabled);
      syncPreferences();
    },
    setHudLayoutPreset: (preset) => {
      persistHudLayoutPreset(preset);
      syncPreferences();
    },
    setHudPosition: (position) => {
      persistHudPosition(position);
      syncPreferences();
    },
    setHudSize: (size) => {
      persistHudSize(size);
      syncPreferences();
    },
    setHudPinned: (pinned) => {
      persistHudPinned(pinned);
      syncPreferences();
    },
    saveCustomLayout: (name) => {
      persistSaveCustomLayout(name);
      syncPreferences();
    },
    loadCustomLayout: (name) => {
      persistLoadCustomLayout(name);
      syncPreferences();
    },
    deleteCustomLayout: (name) => {
      persistDeleteCustomLayout(name);
      syncPreferences();
    },
    setHudTransitionPreset: (preset) => {
      persistHudTransitionPreset(preset);
      syncPreferences();
    },
    setHudMiniMode: (enabled) => {
      persistHudMiniMode(enabled);
      syncPreferences();
    },
    setHudAutoHide: (enabled) => {
      persistHudAutoHide(enabled);
      syncPreferences();
    },
    setHudAutoHideDelay: (delay) => {
      persistHudAutoHideDelay(delay);
      syncPreferences();
    },
    setHudThemeVariant: (variant) => {
      persistHudThemeVariant(variant);
      syncPreferences();
    },
    reset: () => {
      const defaults = resetThemePreferences();
      setPreferences(defaults);
    },
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
