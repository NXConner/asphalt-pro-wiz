import {
  BASE_COLOR_TOKENS,
  BASE_HUD_VARIABLES,
  BASE_SHADOW_TOKENS,
} from '@/design/tokens';

import {
  DESIGN_RADII,
  DESIGN_SPACING_SCALE,
  DESIGN_TYPOGRAPHY_SCALE,
  type DesignRadiusToken,
  type DesignSpacingToken,
} from './config';

export interface FoundationColorToken {
  token: string;
  label: string;
  usage: string;
  value: string;
}

export const FOUNDATION_COLORS: FoundationColorToken[] = [
  {
    token: '--primary',
    label: 'Primary',
    usage: 'Critical CTAs & hero metrics',
    value: BASE_COLOR_TOKENS['--primary'],
  },
  {
    token: '--accent',
    label: 'Accent',
    usage: 'Hover states, focus rings',
    value: BASE_COLOR_TOKENS['--accent'],
  },
  {
    token: '--secondary',
    label: 'Secondary',
    usage: 'Supporting buttons & cards',
    value: BASE_COLOR_TOKENS['--secondary'],
  },
  {
    token: '--background',
    label: 'Background',
    usage: 'Global shell surface',
    value: BASE_COLOR_TOKENS['--background'],
  },
  {
    token: '--foreground',
    label: 'Foreground',
    usage: 'Primary text color',
    value: BASE_COLOR_TOKENS['--foreground'],
  },
  {
    token: '--muted',
    label: 'Muted',
    usage: 'Sub panels & HUD chrome',
    value: BASE_COLOR_TOKENS['--muted'],
  },
] as const;

export const FOUNDATION_COLOR_ENTRIES = FOUNDATION_COLORS.map(
  ({ token, value }) => [token, value] as const,
);

export const FOUNDATION_SPACING_ENTRIES = Object.entries(
  DESIGN_SPACING_SCALE,
) as Array<[DesignSpacingToken, number]>;

export const FOUNDATION_TYPOGRAPHY_ENTRIES = Object.entries(DESIGN_TYPOGRAPHY_SCALE);

export const FOUNDATION_SHADOW_ENTRIES = Object.entries(
  BASE_SHADOW_TOKENS,
) as Array<[string, string]>;

export const FOUNDATION_RADII = DESIGN_RADII;
export const FOUNDATION_TYPE_STACK = BASE_HUD_VARIABLES;
export const FOUNDATION_FONT_META = {
  heading: BASE_HUD_VARIABLES['--hud-font-heading'],
  display: BASE_HUD_VARIABLES['--hud-font-display'],
  body: BASE_HUD_VARIABLES['--hud-font-body'],
  mono: BASE_HUD_VARIABLES['--hud-font-mono'],
};

export const FOUNDATION_RADIUS_ENTRIES = Object.entries(
  DESIGN_RADII,
) as Array<[DesignRadiusToken, string]>;

