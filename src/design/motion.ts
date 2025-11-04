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

