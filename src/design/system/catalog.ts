import {
  composeThemeVariables,
  DEFAULT_WALLPAPER_ID,
  DIVISION_THEMES,
  DIVISION_THEME_IDS,
  type DivisionThemeDefinition,
  type DivisionThemeId,
} from '@/design';

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

const OPERATIONS_THEME_IDS = [
  'night-watch',
  'dawn-patrol',
  'rain-shelter',
  'afterglow-service',
  'revival-night',
] as const;

const CAMPUS_THEME_IDS = ['chapel-stonework', 'family-life', 'youth-center', 'parking-strategy'] as const;

const SEASONAL_THEME_IDS = ['summer-outreach', 'autumn-renewal', 'winter-brilliance', 'storm-response'] as const;

const DIVISION_THEME_NAMES = DIVISION_THEME_IDS.map((id) => id.replace(/^theme-/, '')) as DivisionThemeName[];

export const THEME_NAMES: ThemeNameFromTokens[] = [
  ...LEGACY_THEME_IDS,
  ...DIVISION_THEME_NAMES,
  ...LITURGICAL_THEME_IDS,
  ...OPERATIONS_THEME_IDS,
  ...CAMPUS_THEME_IDS,
  ...SEASONAL_THEME_IDS,
];

export type ThemeNameFromTokens =
  | (typeof LEGACY_THEME_IDS)[number]
  | DivisionThemeName
  | (typeof LITURGICAL_THEME_IDS)[number]
  | (typeof OPERATIONS_THEME_IDS)[number]
  | (typeof CAMPUS_THEME_IDS)[number]
  | (typeof SEASONAL_THEME_IDS)[number];

export type ThemeCategory = 'legacy' | 'division' | 'operations' | 'liturgical' | 'campus' | 'seasonal';

export interface ThemePresetMeta {
  readonly id: ThemeNameFromTokens;
  readonly label: string;
  readonly description: string;
  readonly category: ThemeCategory;
  readonly accentHue: number;
  readonly tokens: Record<string, string>;
  readonly recommendedWallpaperId?: string;
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

const operationsTheme = (
  id: (typeof OPERATIONS_THEME_IDS)[number],
  label: string,
  description: string,
  overrides: Partial<Record<string, string>>,
  recommendedWallpaperId: string,
) =>
  createPreset({
    id,
    label,
    description,
    category: 'operations',
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

const OPERATIONS_THEME_PRESETS: ThemePresetMeta[] = [
  operationsTheme(
    'night-watch',
    'Night Watch',
    'Nocturnal patrol palette for after-hours campus monitoring.',
    {
      '--primary': '220 88% 58%',
      '--accent': '36 100% 56%',
      '--background': '220 64% 6%',
      '--card': '220 60% 11%',
      '--foreground': '216 18% 92%',
      '--ring': '220 88% 64%',
    },
    'division-dark-zone',
  ),
  operationsTheme(
    'dawn-patrol',
    'Dawn Patrol',
    'Warm morning gradients tuned for sunrise lot inspections.',
    {
      '--primary': '32 96% 62%',
      '--accent': '197 88% 58%',
      '--background': '216 52% 7%',
      '--card': '216 46% 12%',
      '--foreground': '32 22% 94%',
      '--ring': '32 96% 68%',
    },
    'division-sunrise-service',
  ),
  operationsTheme(
    'rain-shelter',
    'Rain Shelter',
    'Cool aqua and steel for wet-weather contingency planning.',
    {
      '--primary': '200 88% 60%',
      '--accent': '168 72% 52%',
      '--background': '210 58% 6%',
      '--card': '210 52% 11%',
      '--foreground': '200 18% 94%',
      '--ring': '200 88% 64%',
    },
    'division-storm-response',
  ),
  operationsTheme(
    'afterglow-service',
    'Afterglow Service',
    'Crimson and brass ambience for evening wrap-up briefings.',
    {
      '--primary': '12 94% 60%',
      '--accent': '45 100% 55%',
      '--background': '220 60% 5%',
      '--card': '220 54% 10%',
      '--foreground': '18 20% 93%',
      '--ring': '12 94% 64%',
    },
    'division-vespers-halo',
  ),
  operationsTheme(
    'revival-night',
    'Revival Night',
    'Electric violets and teals for high-energy youth rallies.',
    {
      '--primary': '282 82% 64%',
      '--accent': '167 82% 54%',
      '--background': '248 58% 6%',
      '--card': '248 52% 10%',
      '--foreground': '240 20% 94%',
      '--ring': '167 82% 58%',
    },
    'division-revival-rush',
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
  ...OPERATIONS_THEME_PRESETS,
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
  operations: {
    label: 'Mission Operations',
    description: 'Night watch, weather contingencies, and youth rally modes tuned for on-the-ground decisions.',
    order: 1,
  },
  legacy: {
    label: 'Legacy Palettes',
    description: 'Classic contractor-friendly colorways crews already know and love.',
    order: 2,
  },
  liturgical: {
    label: 'Liturgical Seasons',
    description: 'Sacred-season palettes tuned for Advent, Lent, Easter, and Pentecost programming.',
    order: 3,
  },
  campus: {
    label: 'Campus Contexts',
    description: 'Layouts tailored to sanctuary heritage, family life centers, youth spaces, and parking ops.',
    order: 4,
  },
  seasonal: {
    label: 'Seasonal Operations',
    description: 'Weather-aware themes aligned with outreach pushes, harvest prep, winterization, and storm response.',
    order: 5,
  },
};

export interface ThemePresetGroup {
  readonly category: ThemeCategory;
  readonly label: string;
  readonly description: string;
  readonly presets: ThemePresetMeta[];
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

