import { composeThemeVariables, type DivisionThemeDefinition, type DivisionThemeId } from '../tokens';

type ThemeRegistry = Record<DivisionThemeId, DivisionThemeDefinition>;

const withPrimary = (primary: string, accent: string, extras: Record<string, string> = {}) =>
  composeThemeVariables({
    '--primary': primary,
    '--primary-hover': primary,
    '--accent': accent,
    '--accent-hover': accent,
    ...extras,
  });

export const DIVISION_THEMES: ThemeRegistry = {
  'theme-division-agent': {
    id: 'theme-division-agent',
    name: 'Division Agent',
    description: 'Signature SHD orange ambience with holographic tech blues.',
    tokens: withPrimary('25 100% 55%', '197 88% 56%', {
      '--background': '226 55% 5%',
      '--card': '225 50% 8%',
      '--ring': '25 100% 55%',
      '--hud-grid-opacity': '0.22',
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
      '--hud-grid-opacity': '0.28',
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
    'theme-division-sunrise': {
      id: 'theme-division-sunrise',
      name: 'Sunrise Service',
      description: 'Golden hour warmth for early-morning campus walkthroughs.',
      tokens: withPrimary('32 96% 58%', '12 88% 62%', {
        '--background': '215 62% 6%',
        '--card': '214 56% 10%',
        '--foreground': '38 28% 94%',
        '--hud-grid-opacity': '0.18',
        '--ring': '32 96% 64%',
      }),
    },
    'theme-division-evensong': {
      id: 'theme-division-evensong',
      name: 'Evensong Twilight',
      description: 'Indigo-lavender gradients with brass accents for evening briefings.',
      tokens: withPrimary('266 82% 64%', '38 96% 60%', {
        '--background': '232 64% 5%',
        '--card': '232 58% 10%',
        '--foreground': '230 24% 94%',
        '--hud-grid-opacity': '0.24',
        '--ring': '266 82% 60%',
      }),
    },
    'theme-division-revival': {
      id: 'theme-division-revival',
      name: 'Revival Energy',
      description: 'Teal and cobalt uplift for youth night rally planning.',
      tokens: withPrimary('168 82% 54%', '210 92% 60%', {
        '--background': '204 68% 6%',
        '--card': '204 60% 10%',
        '--foreground': '195 24% 94%',
        '--hud-grid-opacity': '0.2',
        '--ring': '210 92% 62%',
      }),
    },
    'theme-division-celestial': {
      id: 'theme-division-celestial',
      name: 'Celestial Chapel',
      description: 'Soft sky gradients with luminous whites for worship center dashboards.',
      tokens: withPrimary('198 88% 72%', '26 92% 72%', {
        '--background': '210 58% 12%',
        '--card': '210 34% 18%',
        '--foreground': '210 18% 98%',
        '--hud-grid-opacity': '0.12',
        '--ring': '198 88% 68%',
      }),
    },
};

export const DIVISION_THEME_IDS = Object.keys(DIVISION_THEMES) as DivisionThemeId[];

export function getDivisionTheme(id: DivisionThemeId) {
  return DIVISION_THEMES[id];
}

