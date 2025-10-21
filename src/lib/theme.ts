export type ThemeMode = "light" | "dark" | "system";
export type ThemeName = "default" | "emerald" | "sunset" | "royal" | "crimson";

export interface ThemePreferences {
  mode: ThemeMode;
  name: ThemeName;
  primaryHue: number; // 0-360
  wallpaperDataUrl: string; // data URL or empty
  wallpaperOpacity: number; // 0-1
  wallpaperBlur: number; // px
  radius: number; // px
}

const STORAGE_KEY = "pps:theme";

export function getDefaultPreferences(): ThemePreferences {
  return {
    mode: "dark",
    name: "default",
    primaryHue: 210,
    wallpaperDataUrl: "",
    wallpaperOpacity: 0.25,
    wallpaperBlur: 0,
    radius: 8,
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

export function applyThemePreferences(prefs: ThemePreferences): void {
  const root = document.documentElement;
  const body = document.body;

  // mode
  const mode = prefs.mode === "system" ? getSystemMode() : prefs.mode;
  root.classList.remove("light", "dark");
  root.classList.add(mode);

  // theme name
  root.classList.remove("theme-default", "theme-emerald", "theme-sunset", "theme-royal", "theme-crimson");
  root.classList.add(`theme-${prefs.name}`);

  // radius
  root.style.setProperty("--radius", `${prefs.radius}px`);

  // primary hue override (optional)
  if (Number.isFinite(prefs.primaryHue)) {
    root.style.setProperty("--primary", `${prefs.primaryHue} 100% 50%`);
    root.style.setProperty("--primary-foreground", `${prefs.primaryHue} 10% 95%`);
  }

  // wallpaper
  if (prefs.wallpaperDataUrl) {
    root.style.setProperty("--app-wallpaper", `url('${prefs.wallpaperDataUrl}')`);
    root.style.setProperty("--wallpaper-opacity", `${prefs.wallpaperOpacity}`);
    root.style.setProperty("--wallpaper-blur", `${prefs.wallpaperBlur}px`);
    body.classList.add("has-wallpaper");
  } else {
    root.style.removeProperty("--app-wallpaper");
    root.style.removeProperty("--wallpaper-opacity");
    root.style.removeProperty("--wallpaper-blur");
    body.classList.remove("has-wallpaper");
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
  saveThemePreferences(prefs);
  applyThemePreferences(prefs);
}

export function setPrimaryHue(hue: number): void {
  const prefs = loadThemePreferences();
  prefs.primaryHue = Math.max(0, Math.min(360, Math.round(hue)));
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

function getSystemMode(): "light" | "dark" {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
}
