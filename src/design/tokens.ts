import type { CSSProperties } from 'react';

/**
 * Division Design System Tokens
 * Centralized design tokens inspired by The Division 1/2 aesthetic
 */

export type DivisionThemeId =
  | 'theme-division-agent'
  | 'theme-division-rogue'
  | 'theme-division-darkzone'
  | 'theme-division-tech'
  | 'theme-division-stealth'
  | 'theme-division-combat'
  | 'theme-division-tactical'
  | 'theme-division-hunter'
  | 'theme-division-sunrise'
  | 'theme-division-evensong'
  | 'theme-division-revival'
  | 'theme-division-celestial';

export const divisionSpacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
} as const;

export const divisionBorderRadius = {
  none: '0',
  sm: '0.125rem', // 2px
  md: '0.25rem', // 4px
  lg: '0.5rem', // 8px
  xl: '1rem', // 16px
  full: '9999px',
} as const;

export const divisionShadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
  ember: '0 0 12px rgba(255, 145, 0, 0.65)',
  aurora: '0 0 12px rgba(56, 235, 214, 0.55)',
  lagoon: '0 0 14px rgba(114, 159, 255, 0.55)',
} as const;

export const divisionZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  hud: 1080,
} as const;

export const divisionColors = {
  orange: {
    300: '#fdba74',
    400: '#fb923c',
    500: '#ff8c00',
    600: '#ea580c',
  },
  tech: {
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#0ea5e9',
    600: '#0284c7',
  },
  rogue: {
    300: '#fecaca',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
  },
  stealth: {
    300: '#a8f3c4',
    400: '#4ade80',
    500: '#22c55e',
  },
  hunter: {
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
  },
  bg: {
    dark: 'hsl(220 50% 4%)',
    elevated: 'hsl(222 45% 7%)',
    overlay: 'rgba(2, 6, 23, 0.92)',
    card: 'hsl(222 45% 10%)',
  },
  text: {
    primary: 'hsl(220 22% 92%)',
    secondary: 'hsl(220 18% 70%)',
  },
  border: {
    base: 'hsl(215 32% 18%)',
    accent: 'hsl(25 100% 55%)',
  },
} as const;
export type DivisionSpacing = typeof divisionSpacing;
export type DivisionBorderRadius = typeof divisionBorderRadius;
export type DivisionShadows = typeof divisionShadows;

// Base tokens expected by designSystem.ts
export const BASE_COLOR_TOKENS: Record<string, string> = {
  '--background': '220 50% 4%',
  '--foreground': '220 22% 92%',
  '--muted': '226 42% 10%',
  '--muted-foreground': '226 20% 70%',
  '--accent': '206 92% 55%',
  '--accent-foreground': '0 0% 100%',
  '--accent-hover': '205 92% 61%',
  '--primary': '25 100% 55%',
  '--primary-foreground': '16 88% 95%',
  '--primary-hover': '25 100% 62%',
  '--secondary': '197 86% 48%',
  '--secondary-foreground': '210 100% 96%',
  '--secondary-hover': '197 86% 55%',
  '--destructive': '358 86% 54%',
  '--destructive-foreground': '0 0% 98%',
  '--success': '135 56% 45%',
  '--success-foreground': '120 44% 92%',
  '--warning': '45 100% 52%',
  '--warning-foreground': '40 85% 96%',
  '--info': '190 90% 58%',
  '--info-foreground': '189 100% 96%',
  '--border': '213 32% 22%',
  '--input': '215 32% 16%',
  '--ring': '206 92% 55%',
  '--card': '222 50% 6%',
  '--card-foreground': '222 18% 92%',
  '--popover': '222 50% 7%',
  '--popover-foreground': '222 22% 92%',
};

export const BASE_HUD_VARIABLES: Record<string, string> = {
  '--hud-font-heading': "'Rajdhani', 'Roboto Condensed', sans-serif",
  '--hud-font-display': "'Orbitron', 'Rajdhani', sans-serif",
  '--hud-font-body': "'Rajdhani', 'Inter', 'system-ui', sans-serif",
  '--hud-font-mono': "'Share Tech Mono', 'Roboto Mono', 'Menlo', monospace",
  '--hud-weight-display': '750',
  '--hud-weight-heading': '650',
  '--hud-weight-body': '500',
  '--hud-weight-mono': '550',
  '--hud-type-display-xxl': 'clamp(3.75rem, 2.6vw + 2.1rem, 5.85rem)',
  '--hud-type-display-xl': 'clamp(3.25rem, 2.3vw + 1.85rem, 4.75rem)',
  '--hud-type-display-lg': 'clamp(2.75rem, 2vw + 1.6rem, 3.9rem)',
  '--hud-type-title-lg': 'clamp(2.35rem, 1.6vw + 1.35rem, 3.2rem)',
  '--hud-type-title-md': 'clamp(2rem, 1.2vw + 1.2rem, 2.7rem)',
  '--hud-type-heading-lg': 'clamp(1.75rem, 1vw + 1.05rem, 2.3rem)',
  '--hud-type-heading-md': 'clamp(1.45rem, 0.8vw + 0.92rem, 1.75rem)',
  '--hud-type-heading-sm': 'clamp(1.18rem, 0.6vw + 0.78rem, 1.35rem)',
  '--hud-type-body-lg': '1.125rem',
  '--hud-type-body-md': '1rem',
  '--hud-type-body-sm': '0.92rem',
  '--hud-type-body-xs': '0.82rem',
  '--hud-type-mono-xs': '0.78rem',
  '--hud-type-eyebrow': '0.72rem',
};

export const BASE_SHADOW_TOKENS: Record<string, string> = {
  '--shadow-sm': '0 4px 16px rgba(15, 23, 42, 0.25)',
  '--shadow-md': '0 12px 32px rgba(8, 12, 24, 0.35)',
  '--shadow-lg': '0 22px 64px rgba(5, 8, 18, 0.45)',
  '--shadow-xl': '0 30px 120px rgba(11, 17, 35, 0.55)',
};

export const HUD_FONTS = {
  heading: "'Rajdhani', 'Roboto Condensed', sans-serif",
  display: "'Orbitron', 'Rajdhani', sans-serif",
  body: "'Rajdhani', 'Inter', 'system-ui', sans-serif",
  mono: "'Share Tech Mono', 'Roboto Mono', 'Menlo', monospace",
};

export function composeThemeVariables(
  overrides: Partial<Record<string, string>>,
): Record<string, string> {
  return {
    ...BASE_HUD_VARIABLES,
    ...BASE_COLOR_TOKENS,
    ...BASE_SHADOW_TOKENS,
    ...overrides,
  };
}

// Export utility functions expected by components
export function toCSSProperties(tokens: Record<string, string>): CSSProperties {
  return Object.entries(tokens).reduce<CSSProperties>((acc, [key, value]) => {
    const cssKey = key.startsWith('--') ? key : `--${key}`;
    (acc as any)[cssKey] = value;
    return acc;
  }, {});
}
