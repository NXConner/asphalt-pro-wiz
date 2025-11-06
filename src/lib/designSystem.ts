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

type StripPrefix<TValue extends string, Prefix extends string> = TValue extends `${Prefix}${infer Rest}`
  ? Rest
  : TValue;

type DivisionThemeName = StripPrefix<DivisionThemeId, 'theme-'>;

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

const LITURGICAL_THEME_IDS = ['advent-vigil', 'lent-refocus', 'easter-radiance', 'pentecost-flare'] as const;

const CAMPUS_THEME_IDS = ['chapel-stonework', 'family-life', 'youth-center', 'parking-strategy'] as const;

const SEASONAL_THEME_IDS = ['summer-outreach', 'autumn-renewal', 'winter-brilliance', 'storm-response'] as const;

const DIVISION_THEME_NAMES = DIVISION_THEME_IDS.map((id) => id.replace(/^theme-/, '')) as DivisionThemeName[];

export const THEME_NAMES: ThemeNameFromTokens[] = [
  ...LEGACY_THEME_IDS,
  ...DIVISION_THEME_NAMES,
  ...LITURGICAL_THEME_IDS,
  ...CAMPUS_THEME_IDS,
  ...SEASONAL_THEME_IDS,
];

export type ThemeNameFromTokens =
  | (typeof LEGACY_THEME_IDS)[number]
  | DivisionThemeName
  | (typeof LITURGICAL_THEME_IDS)[number]
  | (typeof CAMPUS_THEME_IDS)[number]
  | (typeof SEASONAL_THEME_IDS)[number];

export type ThemeCategory = 'legacy' | 'division' | 'liturgical' | 'campus' | 'seasonal';

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

interface CreatePresetInput {
  id: ThemeNameFromTokens;
  label: string;
  description: string;
  category: ThemeCategory;
  overrides: Partial<Record<string, string>>;
  recommendedWallpaperId?: string;
}

const createPreset = ({
  id,
  label,
  description,
  category,
  overrides,
  recommendedWallpaperId = DEFAULT_WALLPAPER_ID,
}: CreatePresetInput): ThemePresetMeta => {
  const tokens = composeThemeVariables(overrides);
  const primary = tokens['--primary'] ?? '25 100% 55%';
  const accentHue = Number.parseInt(primary.split(' ')[0] ?? '25', 10);
  return {
    id,
    label,
    description,
    category,
    accentHue,
    tokens,
    recommendedWallpaperId,
  };
};

const legacyTheme = (
  id: (typeof LEGACY_THEME_IDS)[number],
  label: string,
  description: string,
  overrides: Partial<Record<string, string>>,
  recommendedWallpaperId = DEFAULT_WALLPAPER_ID,
) =>
  createPreset({
    id,
    label,
    description,
    category: 'legacy',
    overrides,
    recommendedWallpaperId,
  });

const liturgicalTheme = (
  id: (typeof LITURGICAL_THEME_IDS)[number],
  label: string,
  description: string,
  overrides: Partial<Record<string, string>>,
  recommendedWallpaperId: string,
) =>
  createPreset({
    id,
    label,
    description,
    category: 'liturgical',
    overrides,
    recommendedWallpaperId,
  });

const campusTheme = (
  id: (typeof CAMPUS_THEME_IDS)[number],
  label: string,
  description: string,
  overrides: Partial<Record<string, string>>,
  recommendedWallpaperId: string,
) =>
  createPreset({
    id,
    label,
    description,
    category: 'campus',
    overrides,
    recommendedWallpaperId,
  });

const seasonalTheme = (
  id: (typeof SEASONAL_THEME_IDS)[number],
  label: string,
  description: string,
  overrides: Partial<Record<string, string>>,
  recommendedWallpaperId: string,
) =>
  createPreset({
    id,
    label,
    description,
    category: 'seasonal',
    overrides,
    recommendedWallpaperId,
  });

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

const LITURGICAL_THEME_PRESETS: ThemePresetMeta[] = [
  liturgicalTheme(
    'advent-vigil',
    'Advent Vigil',
    'Candlelight violets with brass highlights for Advent services.',
    {
      '--primary': '276 78% 58%',
      '--accent': '45 92% 64%',
      '--background': '250 58% 7%',
      '--card': '250 52% 12%',
      '--foreground': '44 72% 92%',
      '--ring': '45 92% 64%',
      '--hud-grid-opacity': '0.2',
    },
    'division-advent-lights',
  ),
  liturgicalTheme(
    'lent-refocus',
    'Lent Refocus',
    'Muted plum gradients supporting reflective planning.',
    {
      '--primary': '286 52% 52%',
      '--accent': '325 68% 55%',
      '--background': '280 44% 8%',
      '--muted': '280 32% 16%',
      '--foreground': '42 34% 92%',
      '--ring': '325 68% 55%',
      '--hud-grid-opacity': '0.24',
    },
    'division-lent-embers',
  ),
  liturgicalTheme(
    'easter-radiance',
    'Easter Radiance',
    'Brilliant gold and teal bloom for resurrection celebrations.',
    {
      '--primary': '48 100% 65%',
      '--accent': '154 70% 52%',
      '--background': '212 52% 12%',
      '--card': '210 46% 18%',
      '--foreground': '210 40% 98%',
      '--ring': '154 70% 58%',
    },
    'division-easter-bloom',
  ),
  liturgicalTheme(
    'pentecost-flare',
    'Pentecost Flare',
    'Fiery oranges with wind-swept amber for Pentecost missions.',
    {
      '--primary': '12 96% 58%',
      '--accent': '38 100% 58%',
      '--background': '225 60% 8%',
      '--card': '225 54% 12%',
      '--foreground': '28 68% 94%',
      '--ring': '12 96% 62%',
    },
    'division-pentecost-flare',
  ),
];

const CAMPUS_THEME_PRESETS: ThemePresetMeta[] = [
  campusTheme(
    'chapel-stonework',
    'Chapel Stonework',
    'Warm sandstone with teal accents for historic sanctuaries.',
    {
      '--primary': '28 65% 52%',
      '--accent': '182 42% 52%',
      '--background': '220 24% 10%',
      '--card': '220 20% 16%',
      '--foreground': '42 32% 94%',
      '--ring': '28 65% 56%',
    },
    'division-campus-heritage',
  ),
  campusTheme(
    'family-life',
    'Family Life Center',
    'Inviting corals and soft amber suited for community halls.',
    {
      '--primary': '12 78% 60%',
      '--accent': '48 92% 60%',
      '--background': '216 30% 12%',
      '--card': '214 24% 18%',
      '--foreground': '35 38% 95%',
      '--ring': '12 78% 62%',
    },
    'division-community-hub',
  ),
  campusTheme(
    'youth-center',
    'Youth Center Ramp',
    'Electric cyan and magenta energy for student nights.',
    {
      '--primary': '194 92% 58%',
      '--accent': '312 84% 60%',
      '--background': '222 52% 9%',
      '--card': '222 48% 14%',
      '--foreground': '210 24% 96%',
      '--ring': '312 84% 60%',
    },
    'division-youth-dynamo',
  ),
  campusTheme(
    'parking-strategy',
    'Parking Strategy',
    'High-contrast amber and cobalt for lot layout operations.',
    {
      '--primary': '42 96% 58%',
      '--accent': '207 92% 54%',
      '--background': '225 60% 9%',
      '--card': '224 54% 14%',
      '--foreground': '42 32% 94%',
      '--ring': '207 92% 58%',
    },
    'division-parking-grid',
  ),
];

const SEASONAL_THEME_PRESETS: ThemePresetMeta[] = [
  seasonalTheme(
    'summer-outreach',
    'Summer Outreach',
    'Citrus gradients for VBS and outreach blitz operations.',
    {
      '--primary': '38 100% 62%',
      '--accent': '164 82% 52%',
      '--background': '212 52% 12%',
      '--card': '212 48% 18%',
      '--foreground': '38 38% 96%',
      '--ring': '164 82% 56%',
    },
    'division-summer-outreach',
  ),
  seasonalTheme(
    'autumn-renewal',
    'Autumn Renewal',
    'Harvest ambers and forest greens for fall resurfacing.',
    {
      '--primary': '30 90% 50%',
      '--accent': '145 52% 44%',
      '--background': '216 36% 10%',
      '--card': '214 32% 16%',
      '--foreground': '30 42% 92%',
      '--ring': '30 90% 54%',
    },
    'division-autumn-harvest',
  ),
  seasonalTheme(
    'winter-brilliance',
    'Winter Brilliance',
    'Icy blues with frosted whites for cold-weather missions.',
    {
      '--primary': '204 88% 68%',
      '--accent': '228 76% 70%',
      '--background': '222 40% 12%',
      '--card': '222 30% 18%',
      '--foreground': '210 38% 98%',
      '--ring': '204 88% 68%',
    },
    'division-winter-brilliance',
  ),
  seasonalTheme(
    'storm-response',
    'Storm Response',
    'Emergency cyan and amber for rapid repair deployments.',
    {
      '--primary': '196 100% 56%',
      '--accent': '32 100% 56%',
      '--background': '215 66% 6%',
      '--card': '215 58% 12%',
      '--foreground': '204 28% 94%',
      '--ring': '196 100% 60%',
    },
    'division-storm-response',
  ),
];

export const THEME_CATALOG: ThemePresetMeta[] = [
  ...LEGACY_THEME_PRESETS,
  ...DIVISION_THEME_PRESETS,
  ...LITURGICAL_THEME_PRESETS,
  ...CAMPUS_THEME_PRESETS,
  ...SEASONAL_THEME_PRESETS,
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

const THEME_CATEGORY_METADATA: Record<ThemeCategory, { label: string; description: string; order: number }> = {
  division: {
    label: 'Division Protocol',
    description: 'Immersive SHD-grade palettes with tactical contrast and mission-ready readability.',
    order: 0,
  },
  legacy: {
    label: 'Legacy Palettes',
    description: 'Classic contractor-friendly colorways crews already know and love.',
    order: 1,
  },
  liturgical: {
    label: 'Liturgical Seasons',
    description: 'Sacred-season palettes tuned for Advent, Lent, Easter, and Pentecost programming.',
    order: 2,
  },
  campus: {
    label: 'Campus Contexts',
    description: 'Layouts tailored to sanctuary heritage, family life centers, youth spaces, and parking ops.',
    order: 3,
  },
  seasonal: {
    label: 'Seasonal Operations',
    description: 'Weather-aware themes aligned with outreach pushes, harvest prep, winterization, and storm response.',
    order: 4,
  },
};

export interface ThemePresetGroup {
  category: ThemeCategory;
  label: string;
  description: string;
  presets: ThemePresetMeta[];
}

export const groupThemePresets = (): ThemePresetGroup[] =>
  (Object.keys(THEME_CATEGORY_METADATA) as ThemeCategory[])
    .sort((a, b) => THEME_CATEGORY_METADATA[a].order - THEME_CATEGORY_METADATA[b].order)
    .map((category) => ({
      category,
      label: THEME_CATEGORY_METADATA[category].label,
      description: THEME_CATEGORY_METADATA[category].description,
      presets: listThemePresets(category),
    }))
    .filter((group) => group.presets.length > 0);
