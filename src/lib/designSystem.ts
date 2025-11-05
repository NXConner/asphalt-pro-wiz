import {
  BASE_COLOR_TOKENS,
  BASE_HUD_VARIABLES,
  BASE_SHADOW_TOKENS,
  HUD_FONTS,
  composeThemeVariables,
  DIVISION_THEMES,
  DIVISION_THEME_IDS,
  type DivisionThemeDefinition,
  DEFAULT_WALLPAPER_ID,
} from '@/design';

export type Hsl = `${number} ${number}% ${number}%`;

const LEGACY_THEME_IDS = [
  'default',
  'emerald',
  'sunset',
  'royal',
  'crimson',
  'forest',
  'ocean',
  'amber',
  'mono',
  'cyber',
] as const;

const DIVISION_THEME_NAMES = (
  DIVISION_THEME_IDS.map((id) => id.replace(/^theme-/, ''))
) as const;

export const THEME_NAMES = [...LEGACY_THEME_IDS, ...DIVISION_THEME_NAMES] as const;

export type ThemeNameFromTokens = (typeof THEME_NAMES)[number];

export type ThemeCategory = 'legacy' | 'division';

export interface ThemePresetMeta {
  id: ThemeNameFromTokens;
  label: string;
  description: string;
  category: ThemeCategory;
  /** Primary hue in degrees for quick previews */
  accentHue: number;
  tokens: Record<string, string>;
  recommendedWallpaperId?: string;
}

const legacyTheme = (
  id: (typeof LEGACY_THEME_IDS)[number],
  label: string,
  description: string,
  overrides: Partial<Record<string, string>>,
  recommendedWallpaperId = DEFAULT_WALLPAPER_ID,
): ThemePresetMeta => {
  const tokens = composeThemeVariables(overrides);
  const primary = tokens['--primary'] ?? '25 100% 55%';
  const accentHue = Number.parseInt(primary.split(' ')[0] ?? '25', 10);
  return {
    id,
    label,
    description,
    category: 'legacy',
    accentHue,
    tokens,
    recommendedWallpaperId,
  };
};

const LEGACY_THEME_PRESETS: ThemePresetMeta[] = [
  legacyTheme('default', 'Baseline Command', 'Balanced SHD palette for mission control surfaces.', {}),
  legacyTheme('emerald', 'Emerald Field', 'Cool contractor green for outdoor-focused briefs.', {
    '--primary': '142 76% 40%',
    '--accent': '142 76% 40%',
  }),
  legacyTheme('sunset', 'Sunset Ops', 'Warm orange-to-crimson gradient for end-of-day reviews.', {
    '--primary': '25 95% 55%',
    '--accent': '340 82% 52%',
  }),
  legacyTheme('royal', 'Royal Command', 'Executive purple and blue accents for board presentations.', {
    '--primary': '260 90% 55%',
    '--accent': '220 90% 60%',
  }),
  legacyTheme('crimson', 'Crimson Alert', 'High urgency palette for emergency patching deployments.', {
    '--primary': '0 84% 60%',
    '--accent': '340 82% 52%',
  }),
  legacyTheme('forest', 'Forest Patrol', 'Temperate greens tuned for suburban church campuses.', {
    '--primary': '125 55% 40%',
    '--accent': '45 95% 50%',
  }),
  legacyTheme('ocean', 'Ocean Recon', 'Blue-green blend for coastal or waterfront engagements.', {
    '--primary': '200 85% 50%',
    '--accent': '170 70% 45%',
  }),
  legacyTheme('amber', 'Amber Beacon', 'Safety-first amber glow for hazard communication.', {
    '--primary': '38 92% 55%',
    '--accent': '14 90% 55%',
  }),
  legacyTheme('mono', 'Monochrome Ops', 'Minimal grayscale for focus-mode dashboards.', {
    '--primary': '0 0% 85%',
    '--accent': '0 0% 60%',
  }),
  legacyTheme('cyber', 'Cyber Pulse', 'Neon violet and aqua for futuristic mission briefs.', {
    '--primary': '285 80% 60%',
    '--accent': '162 85% 45%',
  }),
];

const toDivisionPreset = (theme: DivisionThemeDefinition): ThemePresetMeta => {
  const id = theme.id.replace(/^theme-/, '') as ThemeNameFromTokens;
  const primary = theme.tokens['--primary'] ?? '212 88% 56%';
  const accentHue = Number.parseInt(primary.split(' ')[0] ?? '212', 10);
  return {
    id,
    label: theme.name,
    description: theme.description,
    category: 'division',
    accentHue,
    tokens: theme.tokens,
    recommendedWallpaperId: DEFAULT_WALLPAPER_ID,
  };
};

const DIVISION_THEME_PRESETS: ThemePresetMeta[] = Object.values(DIVISION_THEMES).map(toDivisionPreset);

export const THEME_CATALOG: ThemePresetMeta[] = [
  ...LEGACY_THEME_PRESETS,
  ...DIVISION_THEME_PRESETS,
];

export const THEME_PRESETS: Record<ThemeNameFromTokens, ThemePresetMeta> = THEME_CATALOG.reduce(
  (acc, preset) => {
    acc[preset.id] = preset;
    return acc;
  },
  {} as Record<ThemeNameFromTokens, ThemePresetMeta>,
);

export interface DesignTokens {
  background: Hsl;
  foreground: Hsl;
  primary: Hsl;
  primaryForeground: Hsl;
  secondary: Hsl;
  secondaryForeground: Hsl;
  accent: Hsl;
  accentForeground: Hsl;
  muted: Hsl;
  mutedForeground: Hsl;
  destructive: Hsl;
  destructiveForeground: Hsl;
  border: Hsl;
  input: Hsl;
  ring: Hsl;
  card: Hsl;
  cardForeground: Hsl;
  radiusPx: number;
}

const FALLBACK_DESIGN_TOKENS: DesignTokens = {
  background: BASE_COLOR_TOKENS['--background'] as Hsl,
  foreground: BASE_COLOR_TOKENS['--foreground'] as Hsl,
  primary: BASE_COLOR_TOKENS['--primary'] as Hsl,
  primaryForeground: BASE_COLOR_TOKENS['--primary-foreground'] as Hsl,
  secondary: BASE_COLOR_TOKENS['--secondary'] as Hsl,
  secondaryForeground: BASE_COLOR_TOKENS['--secondary-foreground'] as Hsl,
  accent: BASE_COLOR_TOKENS['--accent'] as Hsl,
  accentForeground: BASE_COLOR_TOKENS['--accent-foreground'] as Hsl,
  muted: BASE_COLOR_TOKENS['--muted'] as Hsl,
  mutedForeground: BASE_COLOR_TOKENS['--muted-foreground'] as Hsl,
  destructive: BASE_COLOR_TOKENS['--destructive'] as Hsl,
  destructiveForeground: BASE_COLOR_TOKENS['--destructive-foreground'] as Hsl,
  border: BASE_COLOR_TOKENS['--border'] as Hsl,
  input: BASE_COLOR_TOKENS['--input'] as Hsl,
  ring: BASE_COLOR_TOKENS['--ring'] as Hsl,
  card: BASE_COLOR_TOKENS['--card'] as Hsl,
  cardForeground: BASE_COLOR_TOKENS['--card-foreground'] as Hsl,
  radiusPx: 8,
};

const readVar = (style: CSSStyleDeclaration, name: string): string => style.getPropertyValue(name).trim();

export function getDesignTokens(): DesignTokens {
  if (typeof window === 'undefined' || !window.document?.documentElement) {
    return FALLBACK_DESIGN_TOKENS;
  }
  const style = getComputedStyle(window.document.documentElement);
  const parseHsl = (value: string): Hsl => (value || '0 0% 0%') as Hsl;
  const parsePx = (value: string): number => {
    const n = Number.parseInt(value || '0', 10);
    return Number.isFinite(n) ? n : 0;
  };
  return {
    background: parseHsl(readVar(style, '--background')),
    foreground: parseHsl(readVar(style, '--foreground')),
    primary: parseHsl(readVar(style, '--primary')),
    primaryForeground: parseHsl(readVar(style, '--primary-foreground')),
    secondary: parseHsl(readVar(style, '--secondary')),
    secondaryForeground: parseHsl(readVar(style, '--secondary-foreground')),
    accent: parseHsl(readVar(style, '--accent')),
    accentForeground: parseHsl(readVar(style, '--accent-foreground')),
    muted: parseHsl(readVar(style, '--muted')),
    mutedForeground: parseHsl(readVar(style, '--muted-foreground')),
    destructive: parseHsl(readVar(style, '--destructive')),
    destructiveForeground: parseHsl(readVar(style, '--destructive-foreground')),
    border: parseHsl(readVar(style, '--border')),
    input: parseHsl(readVar(style, '--input')),
    ring: parseHsl(readVar(style, '--ring')),
    card: parseHsl(readVar(style, '--card')),
    cardForeground: parseHsl(readVar(style, '--card-foreground')),
    radiusPx: parsePx(readVar(style, '--radius')),
  };
}

export interface DesignSystemConfig {
  colors: typeof BASE_COLOR_TOKENS;
  fonts: typeof HUD_FONTS;
  shadows: typeof BASE_SHADOW_TOKENS;
  spacing: Record<'3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl', number>;
  radii: Record<'sm' | 'md' | 'lg' | 'xl', string>;
  typography: Record<string, string>;
  transitions: Record<'fast' | 'base' | 'slow', string>;
}

export const DESIGN_SPACING_SCALE: DesignSystemConfig['spacing'] = {
  '3xs': 2,
  '2xs': 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const DESIGN_RADII = {
  sm: '6px',
  md: '10px',
  lg: '16px',
  xl: '24px',
};

export const DESIGN_TYPOGRAPHY_SCALE: Record<string, string> = {
  'display-xxl': BASE_HUD_VARIABLES['--hud-type-display-xxl'],
  'display-xl': BASE_HUD_VARIABLES['--hud-type-display-xl'],
  'display-lg': BASE_HUD_VARIABLES['--hud-type-display-lg'],
  'title-lg': BASE_HUD_VARIABLES['--hud-type-title-lg'],
  'title-md': BASE_HUD_VARIABLES['--hud-type-title-md'],
  'heading-lg': BASE_HUD_VARIABLES['--hud-type-heading-lg'],
  'heading-md': BASE_HUD_VARIABLES['--hud-type-heading-md'],
  'heading-sm': BASE_HUD_VARIABLES['--hud-type-heading-sm'],
  'body-lg': BASE_HUD_VARIABLES['--hud-type-body-lg'],
  'body-md': BASE_HUD_VARIABLES['--hud-type-body-md'],
  'body-sm': BASE_HUD_VARIABLES['--hud-type-body-sm'],
  'body-xs': BASE_HUD_VARIABLES['--hud-type-body-xs'],
  'metric-mono': BASE_HUD_VARIABLES['--hud-type-mono-xs'],
  eyebrow: BASE_HUD_VARIABLES['--hud-type-eyebrow'],
};

export const DESIGN_TRANSITIONS: DesignSystemConfig['transitions'] = {
  fast: '120ms cubic-bezier(0.32, 0.94, 0.6, 1)',
  base: '200ms cubic-bezier(0.24, 0.82, 0.4, 1)',
  slow: '360ms cubic-bezier(0.16, 0.84, 0.44, 1)',
};

export const DESIGN_SYSTEM: DesignSystemConfig = {
  colors: BASE_COLOR_TOKENS,
  fonts: HUD_FONTS,
  shadows: BASE_SHADOW_TOKENS,
  spacing: DESIGN_SPACING_SCALE,
  radii: DESIGN_RADII,
  typography: DESIGN_TYPOGRAPHY_SCALE,
  transitions: DESIGN_TRANSITIONS,
};

export const getThemePreset = (id: ThemeNameFromTokens): ThemePresetMeta =>
  THEME_PRESETS[id] ?? THEME_CATALOG[0];

export const listThemePresets = (category?: ThemeCategory): ThemePresetMeta[] =>
  category ? THEME_CATALOG.filter((preset) => preset.category === category) : THEME_CATALOG.slice();
