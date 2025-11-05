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
  resetThemePreferences,
  type ThemePreferences,
  type ThemeMode,
  type ThemeName,
  type ThemeWallpaperSelection,
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
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

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
