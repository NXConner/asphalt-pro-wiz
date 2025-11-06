import {
  BASE_COLOR_TOKENS,
  BASE_HUD_VARIABLES,
  BASE_SHADOW_TOKENS,
  HUD_FONTS,
} from '@/design';

export type DesignSpacingToken = '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type DesignRadiusToken = 'sm' | 'md' | 'lg' | 'xl';
export type DesignTransitionToken = 'fast' | 'base' | 'slow';

export interface DesignTokenMeta {
  readonly token: string;
  readonly cssVar: string;
  readonly value: string;
  readonly description: string;
}

export interface DesignSystemConfig {
  readonly colors: typeof BASE_COLOR_TOKENS;
  readonly fonts: typeof HUD_FONTS;
  readonly shadows: typeof BASE_SHADOW_TOKENS;
  readonly spacing: Record<DesignSpacingToken, number>;
  readonly radii: Record<DesignRadiusToken, string>;
  readonly typography: Record<string, string>;
  readonly transitions: Record<DesignTransitionToken, string>;
  readonly breakpoints: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl', number>;
}

export const DESIGN_BREAKPOINTS: DesignSystemConfig['breakpoints'] = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1440,
};

export const DESIGN_SPACING_SCALE: Record<DesignSpacingToken, number> = {
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

export const DESIGN_RADII: Record<DesignRadiusToken, string> = {
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

export const DESIGN_TRANSITIONS: Record<DesignTransitionToken, string> = {
  fast: '120ms cubic-bezier(0.32, 0.94, 0.6, 1)',
  base: '200ms cubic-bezier(0.24, 0.82, 0.4, 1)',
  slow: '360ms cubic-bezier(0.16, 0.84, 0.44, 1)',
};

const makeTokenMeta = (
  entries: Record<string, string>,
  descriptions: Partial<Record<string, string>>, 
): DesignTokenMeta[] =>
  Object.entries(entries).map(([cssVar, value]) => {
    const normalized = cssVar.startsWith('--') ? cssVar.slice(2) : cssVar;
    return {
      token: normalized,
      cssVar,
      value,
      description: descriptions[cssVar] ?? descriptions[normalized] ?? 'Canonical design token.',
    } satisfies DesignTokenMeta;
  });

const COLOR_TOKEN_DESCRIPTIONS: Partial<Record<string, string>> = {
  '--background': 'Global application background surface.',
  '--foreground': 'Primary foreground text color.',
  '--primary': 'Mission primary action color for critical CTAs.',
  '--primary-foreground': 'Foreground for primary surfaces.',
  '--secondary': 'Secondary action/background treatment.',
  '--muted': 'Muted surfaces such as side panels.',
  '--accent': 'Accent color for hover states and highlights.',
  '--ring': 'Focus ring color used for accessibility affordances.',
  '--border': 'Default border color for cards and panels.',
  '--card': 'Interactive card background base.',
  '--sidebar-background': 'Sidebar shell background.',
};

const TYPOGRAPHY_DESCRIPTIONS: Partial<Record<string, string>> = {
  '--hud-type-display-xxl': 'Hero display size for mission dashboards.',
  '--hud-type-title-lg': 'Primary title size for key panels.',
  '--hud-type-heading-lg': 'Section heading size for command views.',
  '--hud-type-body-md': 'Default body copy size.',
  '--hud-type-mono-xs': 'Metric mono sizing for telemetry readouts.',
};

const SHADOW_DESCRIPTIONS: Partial<Record<string, string>> = {
  '--shadow-sm': 'Low-elevation cards and chips.',
  '--shadow-md': 'Raised surfaces such as modals.',
  '--shadow-lg': 'High emphasis panels and drawers.',
  '--shadow-xl': 'Floating HUD elements and overlays.',
};

const RADIUS_DESCRIPTIONS: Record<DesignRadiusToken, string> = {
  sm: 'Inputs, secondary buttons.',
  md: 'Default interactive controls.',
  lg: 'Cards and modals.',
  xl: 'Hero surfaces and spotlight banners.',
};

const SPACING_DESCRIPTIONS: Record<DesignSpacingToken, string> = {
  '3xs': 'Tight element gutters and icon padding.',
  '2xs': 'Compact stack spacing for dense UIs.',
  xs: 'Default inline spacing between controls.',
  sm: 'Form group spacing.',
  md: 'Card body spacing.',
  lg: 'Section padding on medium screens.',
  xl: 'Page gutters on large screens.',
  '2xl': 'Hero section breathing room.',
  '3xl': 'Full-bleed layout margins on widescreen displays.',
};

export const CANONICAL_DESIGN_TOKENS: Record<
  'colors' | 'typography' | 'spacing' | 'radii' | 'shadows' | 'transitions',
  DesignTokenMeta[]
> = {
  colors: makeTokenMeta(BASE_COLOR_TOKENS, COLOR_TOKEN_DESCRIPTIONS),
  typography: makeTokenMeta(BASE_HUD_VARIABLES, TYPOGRAPHY_DESCRIPTIONS),
  spacing: Object.entries(DESIGN_SPACING_SCALE).map(([token, value]) => ({
    token,
    cssVar: `spacing-${token}`,
    value: `${value}px`,
    description: SPACING_DESCRIPTIONS[token as DesignSpacingToken],
  })),
  radii: Object.entries(DESIGN_RADII).map(([token, value]) => ({
    token,
    cssVar: `radius-${token}`,
    value,
    description: RADIUS_DESCRIPTIONS[token as DesignRadiusToken],
  })),
  shadows: makeTokenMeta(BASE_SHADOW_TOKENS, SHADOW_DESCRIPTIONS),
  transitions: Object.entries(DESIGN_TRANSITIONS).map(([token, value]) => ({
    token,
    cssVar: `transition-${token}`,
    value,
    description: `${token} animation timing curve`,
  })),
};

export const DESIGN_SYSTEM: DesignSystemConfig = {
  colors: BASE_COLOR_TOKENS,
  fonts: HUD_FONTS,
  shadows: BASE_SHADOW_TOKENS,
  spacing: DESIGN_SPACING_SCALE,
  radii: DESIGN_RADII,
  typography: DESIGN_TYPOGRAPHY_SCALE,
  transitions: DESIGN_TRANSITIONS,
  breakpoints: DESIGN_BREAKPOINTS,
};

