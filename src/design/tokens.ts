import type { CSSProperties } from 'react';

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

export interface ThemeCSSExport {
  selector: string;
  variables: Record<string, string>;
}

export const HUD_FONTS = {
  heading: "'Rajdhani', 'Roboto Condensed', sans-serif",
  display: "'Orbitron', 'Rajdhani', sans-serif",
  body: "'Rajdhani', 'Inter', 'system-ui', sans-serif",
  mono: "'Share Tech Mono', 'Roboto Mono', 'Menlo', monospace",
};

export const BASE_HUD_VARIABLES: Record<string, string> = {
  '--hud-font-heading': HUD_FONTS.heading,
  '--hud-font-display': HUD_FONTS.display,
  '--hud-font-body': HUD_FONTS.body,
  '--hud-font-mono': HUD_FONTS.mono,

  '--hud-weight-display': '750',
  '--hud-weight-heading': '650',
  '--hud-weight-body': '500',
  '--hud-weight-mono': '550',

  '--hud-radius-lg': '1.75rem',
  '--hud-radius-md': '1.25rem',
  '--hud-radius-sm': '0.85rem',

  '--hud-grid-opacity': '0.18',
  '--hud-card-opacity': '0.65',
  '--hud-panel-blur': '28px',

  '--hud-letter-spacing-body': '0.04em',
  '--hud-letter-spacing-tight': '0.08em',
  '--hud-letter-spacing-compact': '0.12em',
  '--hud-letter-spacing-wide': '0.24em',
  '--hud-letter-spacing-ultra': '0.46em',

  '--hud-line-height-display': '1.05',
  '--hud-line-height-title': '1.1',
  '--hud-line-height-heading': '1.2',
  '--hud-line-height-body': '1.65',
  '--hud-line-height-compact': '1.35',

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
  '--sidebar-background': '223 52% 7%',
  '--sidebar-foreground': '220 22% 88%',
  '--sidebar-border': '219 40% 18%',
  '--sidebar-ring': '208 82% 58%',
  '--sidebar-primary': '25 100% 55%',
  '--sidebar-primary-foreground': '20 80% 96%',
  '--sidebar-accent': '203 82% 48%',
  '--sidebar-accent-foreground': '0 0% 100%',
};

export const BASE_SHADOW_TOKENS: Record<string, string> = {
  '--shadow-sm': '0 4px 16px rgba(15, 23, 42, 0.25)',
  '--shadow-md': '0 12px 32px rgba(8, 12, 24, 0.35)',
  '--shadow-lg': '0 22px 64px rgba(5, 8, 18, 0.45)',
  '--shadow-xl': '0 30px 120px rgba(11, 17, 35, 0.55)',
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

export function formatThemeCSS(
  selector: string,
  variables: Record<string, string>,
): ThemeCSSExport {
  return {
    selector,
    variables,
  };
}

export function toCSSProperties(tokens: Record<string, string>): CSSProperties {
  return Object.entries(tokens).reduce<CSSProperties>((acc, [key, value]) => {
    const cssKey = key.startsWith('--') ? key : `--${key}`;
    (acc as any)[cssKey] = value;
    return acc;
  }, {});
}

