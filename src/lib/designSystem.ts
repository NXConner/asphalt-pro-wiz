import { BASE_COLOR_TOKENS } from '@/design';
import {
  CANONICAL_DESIGN_TOKENS,
  CORE_COMPONENT_STYLES,
  DESIGN_BREAKPOINTS,
  DESIGN_RADII,
  DESIGN_SPACING_SCALE,
  DESIGN_SYSTEM,
  DESIGN_TRANSITIONS,
  DESIGN_TYPOGRAPHY_SCALE,
  flattenComponentTokenMeta,
  getComponentBaseClass,
  getComponentTokens,
  listCanonicalComponentTokens,
  type CoreComponentId,
  type DesignSystemConfig,
  type DesignTokenMeta,
} from '@/design/system';
import {
  THEME_CATALOG,
  THEME_NAMES,
  THEME_PRESETS,
  getThemePreset,
  groupThemePresets,
  listThemePresets,
  type ThemeCategory,
  type ThemeNameFromTokens,
  type ThemePresetGroup,
  type ThemePresetMeta,
} from '@/design/system';

export type Hsl = `${number} ${number}% ${number}%`;

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

export {
  CANONICAL_DESIGN_TOKENS,
  CORE_COMPONENT_STYLES,
  DESIGN_BREAKPOINTS,
  DESIGN_RADII,
  DESIGN_SPACING_SCALE,
  DESIGN_SYSTEM,
  DESIGN_TRANSITIONS,
  DESIGN_TYPOGRAPHY_SCALE,
  THEME_CATALOG,
  THEME_NAMES,
  THEME_PRESETS,
  flattenComponentTokenMeta,
  getComponentBaseClass,
  getComponentTokens,
  getThemePreset,
  groupThemePresets,
  listCanonicalComponentTokens,
  listThemePresets,
};

export type {
  DesignSystemConfig,
  DesignTokenMeta,
  CoreComponentId,
  ThemeCategory,
  ThemeNameFromTokens,
  ThemePresetGroup,
  ThemePresetMeta,
};
