import type { DesignTokens } from '@/lib/designSystem';

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

const CLAMP = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

export const parseHsl = (value: string): HslColor => {
  const [rawH, rawS, rawL] = value
    .trim()
    .replace(/°/g, '')
    .replace(/[hsl()]/gi, '')
    .split(/[\s,]+/)
    .filter(Boolean);

  const h = Number.parseFloat(rawH ?? '0');
  const s = Number.parseFloat((rawS ?? '0').replace('%', '')) / 100;
  const l = Number.parseFloat((rawL ?? '0').replace('%', '')) / 100;

  return {
    h: Number.isFinite(h) ? ((h % 360) + 360) % 360 : 0,
    s: Number.isFinite(s) ? CLAMP(s) : 0,
    l: Number.isFinite(l) ? CLAMP(l) : 0.5,
  };
};

export const hslToRgb = ({ h, s, l }: HslColor): RgbColor => {
  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }

  const hueToRgb = (p: number, q: number, t: number) => {
    let channel = t;
    if (channel < 0) channel += 1;
    if (channel > 1) channel -= 1;
    if (channel < 1 / 6) return p + (q - p) * 6 * channel;
    if (channel < 1 / 2) return q;
    if (channel < 2 / 3) return p + (q - p) * (2 / 3 - channel) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = h / 360;

  const r = hueToRgb(p, q, hue + 1 / 3);
  const g = hueToRgb(p, q, hue);
  const b = hueToRgb(p, q, hue - 1 / 3);

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

export const relativeLuminance = ({ r, g, b }: RgbColor): number => {
  const normalize = (channel: number) => {
    const scaled = channel / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  };

  const lum = 0.2126 * normalize(r) + 0.7152 * normalize(g) + 0.0722 * normalize(b);
  return Number.isFinite(lum) ? lum : 0;
};

export const contrastRatio = (foreground: string, background: string): number => {
  const fgLum = relativeLuminance(hslToRgb(parseHsl(foreground)));
  const bgLum = relativeLuminance(hslToRgb(parseHsl(background)));
  const higher = Math.max(fgLum, bgLum);
  const lower = Math.min(fgLum, bgLum);
  const ratio = (higher + 0.05) / (lower + 0.05);
  return Math.round(ratio * 100) / 100;
};

export type ContrastLevel = 'AA' | 'AAA' | 'FAIL';

export interface ContrastAssessment {
  ratio: number;
  level: ContrastLevel;
  largeTextPass: boolean;
}

export const assessContrast = (foreground: string, background: string): ContrastAssessment => {
  const ratio = contrastRatio(foreground, background);
  if (ratio >= 7) {
    return { ratio, level: 'AAA', largeTextPass: true };
  }
  if (ratio >= 4.5) {
    return { ratio, level: 'AA', largeTextPass: true };
  }
  if (ratio >= 3) {
    return { ratio, level: 'FAIL', largeTextPass: true };
  }
  return { ratio, level: 'FAIL', largeTextPass: false };
};

export interface ThemeAccessibilitySummaryItem {
  id: string;
  label: string;
  ratio: number;
  level: ContrastLevel;
  largeTextPass: boolean;
}

export interface ThemeAccessibilitySummary {
  items: ThemeAccessibilitySummaryItem[];
  weakest: ThemeAccessibilitySummaryItem | null;
  strongest: ThemeAccessibilitySummaryItem | null;
  aaCompliant: boolean;
  aaaCompliant: boolean;
}

const CONTRAST_TARGETS: Array<{
  id: string;
  label: string;
  foreground: keyof DesignTokens;
  background: keyof DesignTokens;
}> = [
  {
    id: 'primary',
    label: 'Primary Buttons',
    foreground: 'primaryForeground',
    background: 'primary',
  },
  {
    id: 'secondary',
    label: 'Secondary Surfaces',
    foreground: 'secondaryForeground',
    background: 'secondary',
  },
  { id: 'accent', label: 'Accent Alerts', foreground: 'accentForeground', background: 'accent' },
  { id: 'card', label: 'Card Body Text', foreground: 'cardForeground', background: 'card' },
  { id: 'body', label: 'Body Copy', foreground: 'foreground', background: 'background' },
  { id: 'muted', label: 'Muted Badges', foreground: 'mutedForeground', background: 'muted' },
];

export const summarizeThemeAccessibility = (tokens: DesignTokens): ThemeAccessibilitySummary => {
  const items = CONTRAST_TARGETS.map(({ id, label, foreground, background }) => {
    const { ratio, level, largeTextPass } = assessContrast(
      String(tokens[foreground]),
      String(tokens[background])
    );
    return { id, label, ratio, level, largeTextPass };
  });

  const weakest = items.reduce<ThemeAccessibilitySummaryItem | null>((acc, item) => {
    if (!acc || item.ratio < acc.ratio) return item;
    return acc;
  }, null);

  const strongest = items.reduce<ThemeAccessibilitySummaryItem | null>((acc, item) => {
    if (!acc || item.ratio > acc.ratio) return item;
    return acc;
  }, null);

  const aaCompliant = items.every((item) => item.level !== 'FAIL' && item.ratio >= 4.5);
  const aaaCompliant = items.every((item) => item.level === 'AAA');

  return { items, weakest, strongest, aaCompliant, aaaCompliant };
};
