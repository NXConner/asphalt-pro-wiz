import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  loadThemePreferences,
  saveThemePreferences,
  applyThemePreferences,
  type ThemePreferences,
  type ThemeMode,
  type ThemeName,
} from '@/lib/theme';

interface ThemeContextValue {
  preferences: ThemePreferences;
  setMode: (mode: ThemeMode) => void;
  setTheme: (name: ThemeName) => void;
  setPrimaryHue: (hue: number) => void;
  setRadius: (radius: number) => void;
  setWallpaper: (dataUrl: string) => void;
  setWallpaperOpacity: (opacity: number) => void;
  setWallpaperBlur: (blur: number) => void;
  toggleHighContrast: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<ThemePreferences>(loadThemePreferences);

  useEffect(() => {
    applyThemePreferences(preferences);
  }, [preferences]);

  const updatePreferences = (updates: Partial<ThemePreferences>) => {
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);
    saveThemePreferences(newPrefs);
  };

  const value: ThemeContextValue = {
    preferences,
    setMode: (mode) => updatePreferences({ mode }),
    setTheme: (name) => updatePreferences({ name, useHueOverride: false }),
    setPrimaryHue: (hue) => updatePreferences({ primaryHue: hue, useHueOverride: true }),
    setRadius: (radius) => updatePreferences({ radius }),
    setWallpaper: (dataUrl) => updatePreferences({ wallpaperDataUrl: dataUrl }),
    setWallpaperOpacity: (opacity) => updatePreferences({ wallpaperOpacity: opacity }),
    setWallpaperBlur: (blur) => updatePreferences({ wallpaperBlur: blur }),
    toggleHighContrast: () => updatePreferences({ highContrast: !preferences.highContrast }),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
