export type TacticalTone =
  | 'primary'
  | 'accent'
  | 'neutral'
  | 'ember'
  | 'aurora'
  | 'lagoon'
  | 'dusk'
  | 'intel'
  | 'alert'
  | 'success'
  | 'warning';

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export interface TacticalToneConfig {
  accent: string;
  background: string;
  gridOpacity: number;
  scanOpacity: number;
  cornerOpacity: number;
}

const createWithAlpha = (variable: string, alpha: number) => `hsla(var(${variable}) / ${alpha})`;

const TONE_PRESETS: Record<TacticalTone, TacticalToneConfig> = {
  primary: {
    accent: createWithAlpha('--primary', 0.88),
    background: createWithAlpha('--background', 0.82),
    gridOpacity: 0.26,
    scanOpacity: 0.32,
    cornerOpacity: 0.55,
  },
  accent: {
    accent: createWithAlpha('--accent', 0.88),
    background: createWithAlpha('--background', 0.78),
    gridOpacity: 0.24,
    scanOpacity: 0.42,
    cornerOpacity: 0.5,
  },
  neutral: {
    accent: 'rgba(148, 163, 184, 0.7)',
    background: 'rgba(15, 23, 42, 0.72)',
    gridOpacity: 0.18,
    scanOpacity: 0.28,
    cornerOpacity: 0.35,
  },
  ember: {
    accent: 'rgba(255,145,0,0.88)',
    background: 'rgba(24,18,8,0.84)',
    gridOpacity: 0.26,
    scanOpacity: 0.42,
    cornerOpacity: 0.65,
  },
  aurora: {
    accent: 'rgba(34,197,252,0.82)',
    background: 'rgba(6,24,26,0.8)',
    gridOpacity: 0.22,
    scanOpacity: 0.37,
    cornerOpacity: 0.55,
  },
  lagoon: {
    accent: 'rgba(114,159,255,0.86)',
    background: 'rgba(11,18,35,0.82)',
    gridOpacity: 0.24,
    scanOpacity: 0.34,
    cornerOpacity: 0.55,
  },
  dusk: {
    accent: 'rgba(255,176,72,0.86)',
    background: 'rgba(23,18,12,0.8)',
    gridOpacity: 0.25,
    scanOpacity: 0.38,
    cornerOpacity: 0.58,
  },
  intel: {
    accent: 'rgba(40,230,160,0.84)',
    background: 'rgba(6,24,16,0.78)',
    gridOpacity: 0.2,
    scanOpacity: 0.33,
    cornerOpacity: 0.52,
  },
  alert: {
    accent: 'rgba(248,113,113,0.88)',
    background: 'rgba(35,12,18,0.82)',
    gridOpacity: 0.22,
    scanOpacity: 0.45,
    cornerOpacity: 0.68,
  },
  success: {
    accent: 'rgba(74, 222, 128, 0.86)',
    background: 'rgba(8, 28, 18, 0.82)',
    gridOpacity: 0.2,
    scanOpacity: 0.28,
    cornerOpacity: 0.5,
  },
  warning: {
    accent: 'rgba(250, 204, 21, 0.88)',
    background: 'rgba(33, 26, 8, 0.82)',
    gridOpacity: 0.22,
    scanOpacity: 0.4,
    cornerOpacity: 0.58,
  },
};

const DEFAULT_TONE: TacticalToneConfig = {
  accent: TONE_PRESETS.primary.accent,
  background: TONE_PRESETS.primary.background,
  gridOpacity: TONE_PRESETS.primary.gridOpacity,
  scanOpacity: TONE_PRESETS.primary.scanOpacity,
  cornerOpacity: TONE_PRESETS.primary.cornerOpacity,
};

export interface ResolveToneOptions {
  tone?: TacticalTone;
  accentOverride?: string;
  backgroundOverride?: string;
  gridOpacity?: number;
  scanOpacity?: number;
  cornerOpacity?: number;
}

export function resolveTacticalTone({
  tone,
  accentOverride,
  backgroundOverride,
  gridOpacity,
  scanOpacity,
  cornerOpacity,
}: ResolveToneOptions = {}): TacticalToneConfig {
  const base = tone ? TONE_PRESETS[tone] ?? DEFAULT_TONE : DEFAULT_TONE;
  return {
    accent: accentOverride ?? base.accent,
    background: backgroundOverride ?? base.background,
    gridOpacity: clamp(typeof gridOpacity === 'number' ? gridOpacity : base.gridOpacity, 0, 1),
    scanOpacity: clamp(typeof scanOpacity === 'number' ? scanOpacity : base.scanOpacity, 0, 1),
    cornerOpacity: clamp(
      typeof cornerOpacity === 'number' ? cornerOpacity : base.cornerOpacity,
      0,
      1,
    ),
  };
}

