import type { HudAnimationPresetId } from '@/lib/theme';

export const HUD_EASING = {
  glide: [0.22, 1, 0.36, 1] as const,
  tactical: [0.12, 0, 0.39, 0] as const,
  pulse: [0.34, 0, 0.69, 1] as const,
};

export const HUD_DURATIONS = {
  swift: 0.18,
  standard: 0.32,
  deliberate: 0.6,
};

export const HUD_KEYFRAMES = {
  scanline: `
    0% { opacity: 0; transform: translateY(-30%); }
    20% { opacity: 0.4; }
    50% { opacity: 0.6; }
    100% { opacity: 0; transform: translateY(120%); }
  `,
  pulse: `
    0% { opacity: 0.35; transform: scale3d(0.92, 0.92, 1); }
    30% { opacity: 0.7; transform: scale3d(1.02, 1.02, 1); }
    60% { opacity: 0.45; transform: scale3d(0.98, 0.98, 1); }
    100% { opacity: 0.35; transform: scale3d(0.92, 0.92, 1); }
  `,
  glitch: `
    0% { clip-path: inset(10% 0 90% 0); transform: translate(-2px, -1px); }
    20% { clip-path: inset(30% 0 60% 0); transform: translate(2px, 1px); }
    40% { clip-path: inset(50% 0 30% 0); transform: translate(-1px, 0); }
    60% { clip-path: inset(80% 0 10% 0); transform: translate(1px, -1px); }
    80% { clip-path: inset(20% 0 70% 0); transform: translate(-2px, 0); }
    100% { clip-path: inset(0 0 0 0); transform: translate(0, 0); }
  `,
};

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
};

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

