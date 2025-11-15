/**
 * Division Theme Definitions
 * Theme configurations for all Division-inspired themes
 */

import { divisionColors } from '../tokens';

export interface DivisionTheme {
  name: string;
  id: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  border: string;
  description: string;
}

export const divisionThemes: DivisionTheme[] = [
  {
    name: 'Division Agent',
    id: 'theme-division-agent',
    primary: divisionColors.orange[400],
    secondary: divisionColors.tech[400],
    accent: divisionColors.orange[500],
    background: divisionColors.bg.dark,
    foreground: divisionColors.text.primary,
    border: divisionColors.border.accent,
    description: 'Signature SHD orange with tech blue accents - standard agent interface',
  },
  {
    name: 'Rogue Agent',
    id: 'theme-division-rogue',
    primary: divisionColors.rogue[400],
    secondary: divisionColors.rogue[600],
    accent: divisionColors.rogue[500],
    background: divisionColors.bg.overlay,
    foreground: divisionColors.text.primary,
    border: divisionColors.rogue[500],
    description: 'Rogue red with dark crimson - aggressive, hostile interface',
  },
  {
    name: 'Dark Zone',
    id: 'theme-division-darkzone',
    primary: divisionColors.rogue[500],
    secondary: divisionColors.orange[500],
    accent: divisionColors.rogue[400],
    background: divisionColors.bg.dark,
    foreground: divisionColors.text.primary,
    border: divisionColors.rogue[400],
    description: 'Dark Zone warning red with orange alerts - high-tension combat aesthetic',
  },
  {
    name: 'Tech Specialist',
    id: 'theme-division-tech',
    primary: divisionColors.tech[400],
    secondary: divisionColors.tech[300],
    accent: divisionColors.tech[500],
    background: divisionColors.bg.card,
    foreground: divisionColors.text.primary,
    border: divisionColors.tech[400],
    description: 'Cyan/teal tech colors - hacker/tech specialist feel',
  },
  {
    name: 'Stealth Operations',
    id: 'theme-division-stealth',
    primary: divisionColors.stealth[400],
    secondary: divisionColors.stealth[300],
    accent: divisionColors.stealth[500],
    background: divisionColors.bg.dark,
    foreground: divisionColors.text.primary,
    border: divisionColors.stealth[400],
    description: 'Tactical green with night vision lime - covert ops aesthetic',
  },
  {
    name: 'Combat Mode',
    id: 'theme-division-combat',
    primary: divisionColors.orange[500],
    secondary: 'hsl(45, 100%, 55%)', // Alert yellow
    accent: divisionColors.rogue[400],
    background: divisionColors.bg.dark,
    foreground: divisionColors.text.primary,
    border: divisionColors.orange[400],
    description: 'Combat orange-red with alert yellow - active firefight aesthetic',
  },
  {
    name: 'Tactical Command',
    id: 'theme-division-tactical',
    primary: divisionColors.tech[500],
    secondary: divisionColors.orange[400],
    accent: divisionColors.tech[400],
    background: divisionColors.bg.elevated,
    foreground: divisionColors.text.primary,
    border: divisionColors.tech[400],
    description: 'Strategic blue with SHD orange accents - command center feel',
  },
  {
    name: 'Hunter Protocol',
    id: 'theme-division-hunter',
    primary: divisionColors.hunter[400],
    secondary: divisionColors.stealth[300],
    accent: divisionColors.hunter[500],
    background: divisionColors.bg.overlay,
    foreground: divisionColors.text.primary,
    border: divisionColors.hunter[400],
    description: 'Hunter purple with pulse green accents - elite enemy aesthetic',
  },
];

/**
 * Get theme by ID
 */
export function getThemeById(id: string): DivisionTheme | undefined {
  return divisionThemes.find((theme) => theme.id === id);
}

/**
 * Get default theme
 */
export function getDefaultTheme(): DivisionTheme {
  return divisionThemes[0]; // Division Agent
}

// Export types expected by designSystem.ts
export type DivisionThemeId =
  | 'theme-division-agent'
  | 'theme-division-rogue'
  | 'theme-division-darkzone'
  | 'theme-division-tech'
  | 'theme-division-stealth'
  | 'theme-division-combat'
  | 'theme-division-tactical'
  | 'theme-division-hunter';

export interface DivisionThemeDefinition {
  id: DivisionThemeId;
  name: string;
  description: string;
  tokens: Record<string, string>;
}

// Export theme registry format expected by designSystem.ts
import { composeThemeVariables } from '../tokens';

const withPrimary = (primary: string, accent: string, extras: Record<string, string> = {}) =>
  composeThemeVariables({
    '--primary': primary,
    '--primary-hover': primary,
    '--accent': accent,
    '--accent-hover': accent,
    ...extras,
  });

export const DIVISION_THEMES: Record<DivisionThemeId, DivisionThemeDefinition> = {
  'theme-division-agent': {
    id: 'theme-division-agent',
    name: 'Division Agent',
    description: 'Signature SHD orange ambience with holographic tech blues.',
    tokens: withPrimary('25 100% 55%', '197 88% 56%', {
      '--background': '226 55% 5%',
      '--card': '225 50% 8%',
      '--ring': '25 100% 55%',
    }),
  },
  'theme-division-rogue': {
    id: 'theme-division-rogue',
    name: 'Rogue Agent',
    description: 'Crimson rogue signature with hostile pulses and deep noir background.',
    tokens: withPrimary('355 86% 54%', '12 88% 58%', {
      '--background': '350 66% 4%',
      '--card': '352 58% 8%',
      '--foreground': '6 28% 92%',
      '--ring': '355 86% 58%',
    }),
  },
  'theme-division-darkzone': {
    id: 'theme-division-darkzone',
    name: 'Dark Zone',
    description: 'High tension alert palette with emergency red gradients.',
    tokens: withPrimary('2 90% 58%', '33 92% 56%', {
      '--background': '0 60% 3%',
      '--muted': '0 60% 10%',
      '--ring': '33 92% 56%',
    }),
  },
  'theme-division-tech': {
    id: 'theme-division-tech',
    name: 'Tech Specialist',
    description: 'Cyan teal matrix aesthetic with glowing interfaces.',
    tokens: withPrimary('188 92% 58%', '168 82% 56%', {
      '--background': '208 65% 6%',
      '--card': '206 60% 9%',
      '--foreground': '180 22% 94%',
      '--ring': '188 92% 64%',
    }),
  },
  'theme-division-stealth': {
    id: 'theme-division-stealth',
    name: 'Stealth Operations',
    description: 'Night vision lime offsets with covert green primaries.',
    tokens: withPrimary('128 52% 44%', '82 88% 56%', {
      '--background': '160 40% 4%',
      '--card': '162 38% 8%',
      '--foreground': '120 14% 88%',
      '--ring': '82 88% 52%',
    }),
  },
  'theme-division-combat': {
    id: 'theme-division-combat',
    name: 'Combat Mode',
    description: 'Alert orange-red gradients for high intensity firefights.',
    tokens: withPrimary('18 98% 56%', '46 98% 54%', {
      '--background': '210 60% 5%',
      '--card': '209 58% 9%',
      '--ring': '18 98% 62%',
    }),
  },
  'theme-division-tactical': {
    id: 'theme-division-tactical',
    name: 'Tactical Command',
    description: 'Strategic blue primary with SHD accents for command briefings.',
    tokens: withPrimary('212 88% 56%', '25 100% 55%', {
      '--background': '215 64% 6%',
      '--card': '213 62% 10%',
      '--foreground': '210 18% 93%',
      '--ring': '212 88% 60%',
    }),
  },
  'theme-division-hunter': {
    id: 'theme-division-hunter',
    name: 'Hunter Protocol',
    description: 'Elite violet primary with pulse green enemy accents.',
    tokens: withPrimary('272 84% 58%', '152 86% 58%', {
      '--background': '260 60% 5%',
      '--card': '260 54% 9%',
      '--foreground': '260 20% 92%',
      '--ring': '152 86% 54%',
    }),
  },
};

export const DIVISION_THEME_IDS = Object.keys(DIVISION_THEMES) as DivisionThemeId[];

// Wallpaper definitions
export interface WallpaperDefinition {
  id: string;
  name: string;
  description: string;
  gradient: string;
  particlePreset?: string;
}

export const DIVISION_WALLPAPERS: WallpaperDefinition[] = [
  {
    id: 'division-twilight-ops',
    name: 'Twilight Ops',
    description: 'Warm dusk glow across a tactical grid',
    gradient: 'radial-gradient(circle at 20% 18%, rgba(255,128,0,0.45) 0%, rgba(9,13,25,0.95) 55%)',
  },
  {
    id: 'division-sanctuary-grid',
    name: 'Sanctuary Grid',
    description: 'Teal aurora bands reflecting sanctuary lighting',
    gradient:
      'radial-gradient(circle at 10% 35%, rgba(32,209,205,0.38) 0%, rgba(10,15,30,0.92) 55%)',
  },
];

export const DEFAULT_WALLPAPER_ID = 'division-twilight-ops';
