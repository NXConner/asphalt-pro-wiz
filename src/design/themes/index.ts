/**
 * Division Theme Definitions
 * Theme configurations for all Division-inspired themes
 */

import { divisionGradients } from '../gradients';
import { composeThemeVariables, divisionColors, type DivisionThemeId } from '../tokens';

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
    background: divisionColors.bg.dark,
    foreground: divisionColors.text.primary,
    border: divisionColors.rogue[500],
    description: 'Crimson rogue palette with hostile pulses and deep noir background.',
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

export interface DivisionThemeDefinition {
  id: DivisionThemeId;
  name: string;
  description: string;
  tokens: Record<string, string>;
}

const withPrimary = (primary: string, accent: string, extras: Record<string, string> = {}) =>
  composeThemeVariables({
    '--primary': primary,
    '--primary-hover': primary,
    '--accent': accent,
    '--accent-hover': accent,
    ...extras,
  });

export const DIVISION_THEMES: Partial<Record<DivisionThemeId, DivisionThemeDefinition>> = {
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
  'theme-division-celestial': {
    id: 'theme-division-celestial',
    name: 'Celestial Night',
    description: 'Deep indigo conference glow for executive mission briefings.',
    tokens: withPrimary('256 92% 70%', '242 76% 65%', {
      '--background': '260 60% 5%',
      '--card': '260 54% 9%',
      '--foreground': '260 20% 92%',
      '--ring': '250 92% 70%',
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
    gradient: `radial-gradient(circle at 20% 18%, rgba(255,128,0,0.45) 0%, rgba(9,13,25,0.95) 55%), ${divisionGradients.darkOverlay}`,
    particlePreset: 'ember',
  },
  {
    id: 'division-sanctuary-grid',
    name: 'Sanctuary Grid',
    description: 'Teal aurora bands reflecting sanctuary lighting',
    gradient: `radial-gradient(circle at 10% 35%, rgba(32,209,205,0.38) 0%, rgba(10,15,30,0.92) 55%), ${divisionGradients.lagoon}`,
    particlePreset: 'command',
  },
  {
    id: 'division-dark-zone',
    name: 'Dark Zone Beacon',
    description: 'Infrared hazard bloom for emergency deployments.',
    gradient: `${divisionGradients.rogue}, radial-gradient(circle at 70% 20%, rgba(255,72,72,0.35), transparent 65%)`,
    particlePreset: 'rogue',
  },
  {
    id: 'division-cathedral-briefing',
    name: 'Cathedral Briefing',
    description: 'Deep indigo vault lighting with brass reflections.',
    gradient: `${divisionGradients.lagoon}, radial-gradient(circle at 15% 80%, rgba(255,196,140,0.25), transparent 70%)`,
    particlePreset: 'command',
  },
  {
    id: 'division-stealth-insertion',
    name: 'Stealth Insertion',
    description: 'Night vision grid tuned for covert mapping.',
    gradient: `${divisionGradients.stealth}, radial-gradient(circle at 80% 30%, rgba(34,197,94,0.35), transparent 60%)`,
    particlePreset: 'stealth',
  },
  {
    id: 'division-sunrise-service',
    name: 'Sunrise Service',
    description: 'Amber flare breaking over sanctuary lots.',
    gradient: `${divisionGradients.ember}, radial-gradient(circle at 0% 100%, rgba(255,200,95,0.35), transparent 60%)`,
    particlePreset: 'ember',
  },
  {
    id: 'division-vespers-halo',
    name: 'Vespers Halo',
    description: 'Evening purple bloom for nightly briefings.',
    gradient: `${divisionGradients.hunter}, radial-gradient(circle at 85% 15%, rgba(255,176,124,0.25), transparent 60%)`,
    particlePreset: 'command',
  },
  {
    id: 'division-revival-rush',
    name: 'Revival Rush',
    description: 'Neon teal ribbons for youth rallies.',
    gradient: `${divisionGradients.aurora}, linear-gradient(135deg, rgba(59,130,246,0.25), transparent)`,
    particlePreset: 'tech',
  },
  {
    id: 'division-celestial-dawn',
    name: 'Celestial Dawn',
    description: 'Indigo atmosphere with subtle starlight.',
    gradient: `${divisionGradients.lagoon}, radial-gradient(circle at 70% 10%, rgba(147,197,253,0.2), transparent 70%)`,
    particlePreset: 'command',
  },
  {
    id: 'division-advent-lights',
    name: 'Advent Lights',
    description: 'Candlelit violets for Advent season planning.',
    gradient: `${divisionGradients.hunter}, radial-gradient(circle at 25% 25%, rgba(255,214,165,0.32), transparent 68%)`,
    particlePreset: 'command',
  },
  {
    id: 'division-lent-embers',
    name: 'Lent Embers',
    description: 'Muted plum to copper gradient for reflective prep.',
    gradient: `${divisionGradients.rogue}, radial-gradient(circle at 50% 90%, rgba(255,152,108,0.28), transparent 65%)`,
    particlePreset: 'ember',
  },
  {
    id: 'division-easter-bloom',
    name: 'Easter Bloom',
    description: 'Radiant teal and gold bloom celebrating resurrection.',
    gradient: `${divisionGradients.aurora}, radial-gradient(circle at 30% 40%, rgba(253,224,71,0.32), transparent 70%)`,
    particlePreset: 'tech',
  },
  {
    id: 'division-pentecost-flare',
    name: 'Pentecost Flare',
    description: 'Fiery orange atmosphere for Pentecost services.',
    gradient: `${divisionGradients.ember}, radial-gradient(circle at 80% 50%, rgba(255,111,97,0.35), transparent 70%)`,
    particlePreset: 'ember',
  },
  {
    id: 'division-campus-heritage',
    name: 'Campus Heritage',
    description: 'Sandstone warmth with cool teal edge lighting.',
    gradient: `${divisionGradients.ember}, radial-gradient(circle at 10% 80%, rgba(59,197,255,0.25), transparent 70%)`,
    particlePreset: 'command',
  },
  {
    id: 'division-community-hub',
    name: 'Community Hub',
    description: 'Coral and amber ribbons for multipurpose halls.',
    gradient: `${divisionGradients.ember}, radial-gradient(circle at 70% 70%, rgba(255,255,255,0.08), transparent 65%)`,
    particlePreset: 'ember',
  },
  {
    id: 'division-youth-dynamo',
    name: 'Youth Dynamo',
    description: 'Electric violets with cyan scan lines.',
    gradient: `${divisionGradients.hunter}, ${divisionGradients.scanline}`,
    particlePreset: 'tech',
  },
  {
    id: 'division-parking-grid',
    name: 'Parking Grid',
    description: 'Blueprint grid overlay for lot reconfiguration.',
    gradient: `${divisionGradients.lagoon}, repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 1px, transparent 1px, transparent 40px)`,
    particlePreset: 'command',
  },
  {
    id: 'division-summer-outreach',
    name: 'Summer Outreach',
    description: 'Citrus gradients built for VBS and outreach weeks.',
    gradient: `linear-gradient(145deg, rgba(255,204,112,0.45), rgba(59,216,255,0.4)), ${divisionGradients.aurora}`,
    particlePreset: 'ember',
  },
  {
    id: 'division-autumn-harvest',
    name: 'Autumn Harvest',
    description: 'Harvest amber fading into cool midnight blue.',
    gradient: `linear-gradient(145deg, rgba(245,158,11,0.45), rgba(14,116,144,0.45)), ${divisionGradients.ember}`,
    particlePreset: 'ember',
  },
  {
    id: 'division-winter-brilliance',
    name: 'Winter Brilliance',
    description: 'Frosted teal shimmer for snow-season planning.',
    gradient: `${divisionGradients.lagoon}, radial-gradient(circle at 15% 20%, rgba(255,255,255,0.35), transparent 60%)`,
    particlePreset: 'command',
  },
  {
    id: 'division-storm-response',
    name: 'Storm Response',
    description: 'Rain radar blues with emergency amber glint.',
    gradient: `linear-gradient(160deg, rgba(15,118,255,0.55), rgba(8,47,73,0.95)), radial-gradient(circle at 80% 30%, rgba(253,186,116,0.28), transparent 70%)`,
    particlePreset: 'tech',
  },
];

export const DEFAULT_WALLPAPER_ID = 'division-twilight-ops';
