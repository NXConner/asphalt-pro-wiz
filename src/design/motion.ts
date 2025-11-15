import type { HudAnimationPresetId } from '@/lib/theme';

export const HUD_EASING = {
  glide: [0.22, 1, 0.36, 1] as const,
  tactical: [0.12, 0, 0.39, 0] as const,
  pulse: [0.34, 0, 0.69, 1] as const,
};

export const divisionEasing = {
  // Smooth tactical transitions
  tactical: 'cubic-bezier(0.22, 1, 0.36, 1)',
  // Quick, snappy interactions
  snappy: 'cubic-bezier(0.34, 0, 0.69, 1)',
  // Smooth, organic feel
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  // Glide effect
  glide: 'cubic-bezier(0.4, 0, 0.2, 1)',
  // Bouncy, energetic
  bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  // Linear for precise movements
  linear: 'linear',
} as const;

export const divisionDurations = {
  instant: 0,
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
  slower: 0.6,
  slowest: 1.0,
  standard: 1.8,
  deliberate: 2.4,
} as const;

export const divisionDelays = {
  none: '0ms',
  short: '100ms',
  medium: '200ms',
  long: '400ms',
} as const;

/**
 * Create animation configuration
 */
export function createAnimation(
  duration: keyof typeof divisionDurations = 'normal',
  easing: keyof typeof divisionEasing = 'tactical',
  delay: keyof typeof divisionDelays = 'none',
): string {
  const durationValue =
    typeof divisionDurations[duration] === 'number'
      ? `${divisionDurations[duration]}s`
      : divisionDurations[duration];
  return `${durationValue} ${divisionEasing[easing]} ${divisionDelays[delay]}`;
}

/**
 * Common animation presets
 */
export const animationPresets = {
  slideIn: createAnimation('normal', 'tactical'),
  slideOut: createAnimation('fast', 'snappy'),
  fadeIn: createAnimation('normal', 'smooth'),
  fadeOut: createAnimation('fast', 'smooth'),
  scaleIn: createAnimation('normal', 'bouncy'),
  scaleOut: createAnimation('fast', 'snappy'),
  pulse: createAnimation('slower', 'smooth'),
  glitch: createAnimation('fast', 'linear'),
} as const;

export type DivisionEasing = typeof divisionEasing;
export type DivisionDurations = typeof divisionDurations;
export type DivisionDelays = typeof divisionDelays;

// Export aliases expected by components
export const HUD_DURATIONS = {
  swift: 0.18,
  standard: 1.8,
  deliberate: 2.4,
} as const;

export const HUD_EASING = {
  glide: divisionEasing.smooth,
  tactical: divisionEasing.tactical,
  pulse: divisionEasing.snappy,
} as const;

// Particle presets
export const PARTICLE_PRESETS = {
  ember: {
    color: 'rgba(255,128,0,0.28)',
    secondary: 'rgba(255,195,90,0.22)',
    speed: 0.28,
    density: 28,
  },
  tech: {
    color: 'rgba(92,215,255,0.28)',
    secondary: 'rgba(0,178,255,0.24)',
    speed: 0.32,
    density: 36,
  },
  stealth: {
    color: 'rgba(88,255,161,0.24)',
    secondary: 'rgba(42,186,122,0.18)',
    speed: 0.24,
    density: 22,
  },
  command: {
    color: 'rgba(110,138,255,0.26)',
    secondary: 'rgba(56,105,255,0.2)',
    speed: 0.26,
    density: 30,
  },
  rogue: {
    color: 'rgba(227,57,70,0.3)',
    secondary: 'rgba(255,128,0,0.22)',
    speed: 0.34,
    density: 34,
  },
} as const;

export type ParticlePresetKey = keyof typeof PARTICLE_PRESETS;

export interface HudAnimationLayerConfig {
  initial: Record<string, unknown>;
  animate: Record<string, unknown>;
  exit?: Record<string, unknown>;
  transition?: Record<string, unknown>;
}

export interface HudAnimationPresetSpec {
  id: HudAnimationPresetId;
  label: string;
  description: string;
  container: HudAnimationLayerConfig;
  panel: HudAnimationLayerConfig;
  accent: HudAnimationLayerConfig;
  alert: HudAnimationLayerConfig;
}

export const HUD_ANIMATION_PRESETS: Record<HudAnimationPresetId, HudAnimationPresetSpec> = {
  deploy: {
    id: 'deploy',
    label: 'Mission Deploy',
    description: 'Heroic slide-in with tactical damping suited for high-urgency briefs.',
    container: {
      initial: { opacity: 0, scale: 0.94, y: -24 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.92, y: 16 },
      transition: { duration: HUD_DURATIONS.deliberate, ease: HUD_EASING.glide },
    },
    panel: {
      initial: { opacity: 0, x: 24 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: HUD_DURATIONS.standard, ease: HUD_EASING.glide },
    },
    accent: {
      initial: { opacity: 0, scaleX: 0.6 },
      animate: { opacity: 1, scaleX: 1 },
      transition: { duration: HUD_DURATIONS.swift, ease: HUD_EASING.tactical },
    },
    alert: {
      initial: { opacity: 0, y: -12 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
      transition: { duration: HUD_DURATIONS.swift, ease: HUD_EASING.pulse },
    },
  },
  patrol: {
    id: 'patrol',
    label: 'Perimeter Patrol',
    description: 'Slow orbiting motion ideal for prolonged monitoring shifts.',
    container: {
      initial: { opacity: 0, rotateX: -12, y: 20 },
      animate: { opacity: 1, rotateX: 0, y: 0 },
      exit: { opacity: 0, rotateX: 8, y: 16 },
      transition: { duration: HUD_DURATIONS.deliberate * 1.2, ease: HUD_EASING.tactical },
    },
    panel: {
      initial: { opacity: 0, x: -18, scale: 0.98 },
      animate: { opacity: 1, x: 0, scale: 1 },
      transition: { duration: HUD_DURATIONS.deliberate, ease: HUD_EASING.glide },
    },
    accent: {
      initial: { opacity: 0, scaleY: 0.4 },
      animate: { opacity: 1, scaleY: 1 },
      transition: { duration: HUD_DURATIONS.standard, ease: HUD_EASING.pulse },
    },
    alert: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: HUD_DURATIONS.swift, ease: HUD_EASING.glide },
    },
  },
  stealth: {
    id: 'stealth',
    label: 'Silent Stealth',
    description: 'Subtle fades respecting reduced-motion contexts, optimized for low-light ops.',
    container: {
      initial: { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.96 },
      transition: { duration: HUD_DURATIONS.standard, ease: HUD_EASING.tactical },
    },
    panel: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: HUD_DURATIONS.standard, ease: HUD_EASING.glide },
    },
    accent: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: HUD_DURATIONS.swift, ease: HUD_EASING.tactical },
    },
    alert: {
      initial: { opacity: 0, y: -6 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -4 },
      transition: { duration: HUD_DURATIONS.swift, ease: HUD_EASING.tactical },
    },
  },
  recon: {
    id: 'recon',
    label: 'Recon Sweep',
    description: 'Energetic pacing with lateral sweeps ideal for field reconnaissance overlays.',
    container: {
      initial: { opacity: 0, x: 32, y: -16 },
      animate: { opacity: 1, x: 0, y: 0 },
      exit: { opacity: 0, x: -24, y: 16 },
      transition: { duration: HUD_DURATIONS.standard, ease: HUD_EASING.glide },
    },
    panel: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: HUD_DURATIONS.swift, ease: HUD_EASING.pulse },
    },
    accent: {
      initial: { opacity: 0, scale: 0.7 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: HUD_DURATIONS.standard, ease: HUD_EASING.pulse },
    },
    alert: {
      initial: { opacity: 0, x: 12 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -10 },
      transition: { duration: HUD_DURATIONS.swift, ease: HUD_EASING.tactical },
    },
  },
  command: {
    id: 'command',
    label: 'Command Pulse',
    description: 'Authority-laden pulse with glow accent tailored for executive dashboards.',
    container: {
      initial: { opacity: 0, scale: 0.97 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: { duration: HUD_DURATIONS.deliberate, ease: HUD_EASING.pulse },
    },
    panel: {
      initial: { opacity: 0.2 },
      animate: { opacity: 1 },
      transition: { duration: HUD_DURATIONS.deliberate, ease: HUD_EASING.pulse },
    },
    accent: {
      initial: { opacity: 0, boxShadow: '0 0 0 rgba(99,102,241,0)' },
      animate: { opacity: 1, boxShadow: '0 0 24px rgba(99,102,241,0.45)' },
      transition: { duration: HUD_DURATIONS.deliberate, ease: HUD_EASING.tactical },
    },
    alert: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: HUD_DURATIONS.swift, ease: HUD_EASING.pulse },
    },
  },
};

export function resolveHudAnimationPreset(id: HudAnimationPresetId): HudAnimationPresetSpec {
  return HUD_ANIMATION_PRESETS[id] ?? HUD_ANIMATION_PRESETS.deploy;
}

