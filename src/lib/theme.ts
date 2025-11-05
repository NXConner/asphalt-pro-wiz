import {
  DIVISION_THEMES,
  DIVISION_THEME_IDS,
  composeThemeVariables,
  type DivisionThemeId,
} from '@/design';
export type ThemeMode = "light" | "dark" | "system";
export type ThemeName =
  | 'default'
  | 'emerald'
  | 'sunset'
  | 'royal'
  | 'crimson'
  | 'forest'
  | 'ocean'
  | 'amber'
  | 'mono'
  | 'cyber'
  | 'division-agent'
  | 'division-rogue'
  | 'division-darkzone'
  | 'division-tech'
  | 'division-stealth'
  | 'division-combat'
  | 'division-tactical'
  | 'division-hunter';

export interface ThemePreferences {
  mode: ThemeMode;
  name: ThemeName;
  /**
   * Primary color hue override in degrees (0-360).
   * When {@link useHueOverride} is false, this value is ignored so that theme presets take effect.
   */
  primaryHue: number; // 0-360
  /**
   * Controls whether {@link primaryHue} should override the active theme preset.
   * This prevents inline style precedence from blocking theme changes.
   */
  useHueOverride: boolean;
  wallpaperDataUrl: string; // data URL or empty
  wallpaperOpacity: number; // 0-1
  wallpaperBlur: number; // px
  radius: number; // px
  /** High-contrast accessibility mode */
  highContrast?: boolean;
}

const STORAGE_KEY = "pps:theme";

export function getDefaultPreferences(): ThemePreferences {
  return {
    mode: "dark",
      name: 'division-agent',
    primaryHue: 210,
    useHueOverride: false,
    wallpaperDataUrl: "",
    wallpaperOpacity: 0.25,
    wallpaperBlur: 0,
    radius: 8,
    highContrast: false,
  };
}

export function loadThemePreferences(): ThemePreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultPreferences();
    const parsed = JSON.parse(raw);
    return { ...getDefaultPreferences(), ...parsed } as ThemePreferences;
  } catch {
    return getDefaultPreferences();
  }
}

export function saveThemePreferences(prefs: ThemePreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

const BASE_THEME_TOKENS = composeThemeVariables({});

const LEGACY_THEME_TOKENS: Record<Exclude<ThemeName, `division-${string}`>, Record<string, string>> = {
  default: BASE_THEME_TOKENS,
  emerald: composeThemeVariables({
    '--primary': '142 76% 40%',
    '--accent': '142 76% 40%',
  }),
  sunset: composeThemeVariables({
    '--primary': '25 95% 55%',
    '--accent': '340 82% 52%',
  }),
  royal: composeThemeVariables({
    '--primary': '260 90% 55%',
    '--accent': '220 90% 60%',
  }),
  crimson: composeThemeVariables({
    '--primary': '0 84% 60%',
    '--accent': '340 82% 52%',
  }),
  forest: composeThemeVariables({
    '--primary': '125 55% 40%',
    '--accent': '45 95% 50%',
  }),
  ocean: composeThemeVariables({
    '--primary': '200 85% 50%',
    '--accent': '170 70% 45%',
  }),
  amber: composeThemeVariables({
    '--primary': '38 92% 55%',
    '--accent': '14 90% 55%',
  }),
  mono: composeThemeVariables({
    '--primary': '0 0% 85%',
    '--accent': '0 0% 60%',
  }),
  cyber: composeThemeVariables({
    '--primary': '285 80% 60%',
    '--accent': '162 85% 45%',
  }),
};

function resolveDivisionTheme(name: ThemeName): DivisionThemeId | null {
  const candidate = `theme-${name}` as DivisionThemeId;
  return (DIVISION_THEME_IDS as string[]).includes(candidate) ? candidate : null;
}

function getTokensForTheme(name: ThemeName): Record<string, string> {
  const divisionThemeId = resolveDivisionTheme(name);
  if (divisionThemeId) {
    return DIVISION_THEMES[divisionThemeId]?.tokens ?? BASE_THEME_TOKENS;
  }
  return LEGACY_THEME_TOKENS[name as keyof typeof LEGACY_THEME_TOKENS] ?? BASE_THEME_TOKENS;
}

export function applyThemePreferences(prefs: ThemePreferences): void {
  const root = document.documentElement;
  const body = document.body;

  // mode
  const mode = prefs.mode === 'system' ? getSystemMode() : prefs.mode;
  root.classList.remove('light', 'dark');
  root.classList.add(mode);

  const tokens = getTokensForTheme(prefs.name);
  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // radius
  root.style.setProperty('--radius', `${prefs.radius}px`);

  // high contrast
  if (prefs.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }

  // primary hue override (optional)
  if (prefs.useHueOverride && Number.isFinite(prefs.primaryHue)) {
    root.style.setProperty('--primary', `${prefs.primaryHue} 100% 50%`);
    root.style.setProperty('--primary-foreground', `${prefs.primaryHue} 10% 95%`);
  } else {
    // Ensure preset theme values are used by removing any prior inline overrides
    root.style.removeProperty('--primary');
    root.style.removeProperty('--primary-foreground');
  }

  // wallpaper
  if (prefs.wallpaperDataUrl) {
    const trimmed = prefs.wallpaperDataUrl.trim();
    const isGradient = trimmed.startsWith('linear-gradient') || trimmed.startsWith('radial-gradient');
    root.style.setProperty('--app-wallpaper', isGradient ? trimmed : `url('${trimmed}')`);
    root.style.setProperty('--wallpaper-opacity', `${prefs.wallpaperOpacity}`);
    root.style.setProperty('--wallpaper-blur', `${prefs.wallpaperBlur}px`);
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
  prefs.mode = mode;
  saveThemePreferences(prefs);
  applyThemePreferences(prefs);
}

export function setThemeName(name: ThemeName): void {
  const prefs = loadThemePreferences();
  prefs.name = name;
  // When switching theme presets, disable hue override so the preset is visible
  prefs.useHueOverride = false;
  saveThemePreferences(prefs);
  applyThemePreferences(prefs);
}

export function setPrimaryHue(hue: number): void {
  const prefs = loadThemePreferences();
  prefs.primaryHue = Math.max(0, Math.min(360, Math.round(hue)));
  // Moving the slider enables the hue override explicitly
  prefs.useHueOverride = true;
  saveThemePreferences(prefs);
  applyThemePreferences(prefs);
}

export function setRadius(px: number): void {
  const prefs = loadThemePreferences();
  prefs.radius = Math.max(0, Math.min(24, Math.round(px)));
  saveThemePreferences(prefs);
  applyThemePreferences(prefs);
}

export function setWallpaper(dataUrl: string): void {
  const prefs = loadThemePreferences();
  prefs.wallpaperDataUrl = dataUrl;
  saveThemePreferences(prefs);
  applyThemePreferences(prefs);
}

export function setWallpaperOpacity(opacity: number): void {
  const prefs = loadThemePreferences();
  prefs.wallpaperOpacity = Math.max(0, Math.min(1, opacity));
  saveThemePreferences(prefs);
  applyThemePreferences(prefs);
}

export function setWallpaperBlur(px: number): void {
  const prefs = loadThemePreferences();
  prefs.wallpaperBlur = Math.max(0, Math.min(30, Math.round(px)));
  saveThemePreferences(prefs);
  applyThemePreferences(prefs);
}

function getSystemMode(): 'light' | 'dark' {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}
