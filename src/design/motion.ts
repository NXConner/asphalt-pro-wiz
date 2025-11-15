/**
 * Division Motion System
 * Animation utilities and timing functions inspired by The Division
 */

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
