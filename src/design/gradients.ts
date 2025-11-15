/**
 * Division Gradient System
 * Gradient utilities for Division-inspired visual effects
 */

export const divisionGradients = {
  // Ember orange gradient (SHD signature)
  ember: 'linear-gradient(135deg, hsl(25, 100%, 55%) 0%, hsl(25, 100%, 35%) 100%)',
  // Aurora cyan gradient (tech specialist)
  aurora: 'linear-gradient(135deg, hsl(190, 90%, 55%) 0%, hsl(190, 90%, 35%) 100%)',
  // Lagoon blue gradient (tactical command)
  lagoon: 'linear-gradient(135deg, hsl(210, 90%, 55%) 0%, hsl(210, 90%, 35%) 100%)',
  // Rogue red gradient (danger/alert)
  rogue: 'linear-gradient(135deg, hsl(0, 85%, 55%) 0%, hsl(0, 85%, 35%) 100%)',
  // Stealth green gradient (covert ops)
  stealth: 'linear-gradient(135deg, hsl(120, 25%, 45%) 0%, hsl(120, 25%, 25%) 100%)',
  // Hunter purple gradient (elite)
  hunter: 'linear-gradient(135deg, hsl(270, 60%, 55%) 0%, hsl(270, 60%, 35%) 100%)',
  // Dark overlay gradient
  darkOverlay: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%)',
  // Light overlay gradient
  lightOverlay: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1) 100%)',
  // Radial glow (for highlights)
  radialGlow: 'radial-gradient(circle, rgba(255, 145, 0, 0.3) 0%, transparent 70%)',
  // Scan line effect
  scanline: 'linear-gradient(180deg, transparent 0%, rgba(255, 145, 0, 0.1) 50%, transparent 100%)',
} as const;

/**
 * Create custom gradient
 */
export function createGradient(startColor: string, endColor: string, angle = 135): string {
  return `linear-gradient(${angle}deg, ${startColor} 0%, ${endColor} 100%)`;
}

export const DIVISION_WALLPAPERS: WallpaperDefinition[] = [
  {
    id: 'division-twilight-ops',
    name: 'Twilight Ops',
    description: 'Warm dusk glow across a tactical grid inspired by post-operation debriefs.',
    gradient:
      "radial-gradient(circle at 20% 18%, rgba(255,128,0,0.45) 0%, rgba(9,13,25,0.95) 55%), radial-gradient(circle at 82% 0%, rgba(92,215,255,0.32) 0%, rgba(7,11,23,0.92) 62%)",
    particlePreset: 'ember',
  },
  {
    id: 'division-sanctuary-grid',
    name: 'Sanctuary Grid',
    description: 'Teal aurora bands reflecting sanctuary lighting over holo grids.',
    gradient:
      "radial-gradient(circle at 10% 35%, rgba(32,209,205,0.38) 0%, rgba(10,15,30,0.92) 55%), radial-gradient(circle at 88% 12%, rgba(108,185,255,0.28) 0%, rgba(6,11,23,0.94) 58%)",
    particlePreset: 'tech',
  },
  {
    id: 'division-dark-zone',
    name: 'Dark Zone Breach',
    description: 'Emergency crimson lattice with subtle smog layers for DZ incursions.',
    gradient:
      "radial-gradient(circle at 18% 82%, rgba(227,57,70,0.45) 0%, rgba(7,6,15,0.94) 58%), radial-gradient(circle at 92% 22%, rgba(255,140,0,0.32) 0%, rgba(10,8,18,0.95) 60%)",
    particlePreset: 'rogue',
  },
  {
    id: 'division-cathedral-briefing',
    name: 'Cathedral Briefing',
    description: 'Deep indigo conference glow for executive mission briefings.',
    gradient:
      "radial-gradient(circle at 52% 0%, rgba(123,140,255,0.36) 0%, rgba(8,10,23,0.94) 56%), radial-gradient(circle at 90% 80%, rgba(74,158,255,0.32) 0%, rgba(7,9,22,0.96) 62%)",
    particlePreset: 'command',
  },
  {
    id: 'division-stealth-insertion',
    name: 'Stealth Insertion',
    description: 'Night vision gradient with lime pulses for covert approach planning.',
    gradient:
      "radial-gradient(circle at 12% 66%, rgba(88,255,161,0.32) 0%, rgba(4,12,16,0.94) 53%), radial-gradient(circle at 88% 22%, rgba(28,184,120,0.28) 0%, rgba(3,10,16,0.95) 62%)",
    particlePreset: 'stealth',
  },
    {
      id: 'division-sunrise-service',
      name: 'Sunrise Service',
      description: 'Amber sunrise over a fresh sealcoat with subtle lens flares.',
      gradient:
        "radial-gradient(circle at 10% 28%, rgba(255,182,72,0.42) 0%, rgba(12,16,28,0.92) 56%), radial-gradient(circle at 88% 70%, rgba(255,112,67,0.32) 0%, rgba(12,14,24,0.95) 60%)",
      particlePreset: 'ember',
    },
    {
      id: 'division-vespers-halo',
      name: 'Vespers Halo',
      description: 'Evening violet haze across sanctuary glass reflections.',
      gradient:
        "radial-gradient(circle at 20% 20%, rgba(126,111,255,0.38) 0%, rgba(8,11,26,0.94) 60%), radial-gradient(circle at 80% 80%, rgba(255,198,94,0.28) 0%, rgba(10,12,25,0.95) 62%)",
      particlePreset: 'command',
    },
    {
      id: 'division-revival-rush',
      name: 'Revival Rush',
      description: 'Teal aurora bursts with cobalt streams for youth rallies.',
      gradient:
        "radial-gradient(circle at 18% 72%, rgba(72,222,255,0.36) 0%, rgba(6,14,24,0.93) 58%), radial-gradient(circle at 86% 18%, rgba(58,164,255,0.3) 0%, rgba(5,12,20,0.95) 62%)",
      particlePreset: 'tech',
    },
    {
      id: 'division-celestial-dawn',
      name: 'Celestial Dawn',
      description: 'Light sky bloom with chapel spotlights and soft mist.',
      gradient:
        "radial-gradient(circle at 12% 18%, rgba(162,213,255,0.42) 0%, rgba(12,20,32,0.9) 56%), radial-gradient(circle at 82% 88%, rgba(255,204,138,0.28) 0%, rgba(14,22,32,0.92) 60%)",
      particlePreset: 'command',
    },
  {
    id: 'division-advent-lights',
    name: 'Advent Lights',
    description: 'Violet sanctuary glow with candlelit gold bloom for Advent gatherings.',
    gradient:
      "radial-gradient(circle at 20% 80%, rgba(143,92,255,0.42) 0%, rgba(10,12,24,0.92) 60%), radial-gradient(circle at 82% 18%, rgba(255,198,114,0.28) 0%, rgba(12,10,24,0.94) 58%)",
    particlePreset: 'ember',
  },
  {
    id: 'division-lent-embers',
    name: 'Lent Embers',
    description: 'Muted plums and charcoal embers supporting reflective planning sessions.',
    gradient:
      "radial-gradient(circle at 24% 24%, rgba(96,74,140,0.36) 0%, rgba(8,8,18,0.94) 56%), radial-gradient(circle at 78% 80%, rgba(180,88,128,0.24) 0%, rgba(10,8,20,0.94) 60%)",
    particlePreset: 'rogue',
  },
  {
    id: 'division-easter-bloom',
    name: 'Easter Bloom',
    description: 'Resurrection gold and aqua bloom cascading through the HUD.',
    gradient:
      "radial-gradient(circle at 15% 30%, rgba(255,226,140,0.4) 0%, rgba(12,20,30,0.9) 55%), radial-gradient(circle at 85% 20%, rgba(126,220,210,0.32) 0%, rgba(14,24,32,0.92) 60%)",
    particlePreset: 'command',
  },
  {
    id: 'division-pentecost-flare',
    name: 'Pentecost Flare',
    description: 'Fiery orange ribbons with amber sparks for Pentecost deployments.',
    gradient:
      "radial-gradient(circle at 18% 82%, rgba(255,120,78,0.4) 0%, rgba(9,10,20,0.94) 58%), radial-gradient(circle at 80% 18%, rgba(255,186,78,0.32) 0%, rgba(12,10,20,0.95) 60%)",
    particlePreset: 'ember',
  },
  {
    id: 'division-campus-heritage',
    name: 'Campus Heritage',
    description: 'Warm sandstone gradients with teal reflections for historic chapels.',
    gradient:
      "radial-gradient(circle at 18% 28%, rgba(209,160,120,0.36) 0%, rgba(12,14,20,0.94) 55%), radial-gradient(circle at 82% 72%, rgba(94,171,190,0.24) 0%, rgba(10,14,20,0.94) 60%)",
    particlePreset: 'command',
  },
  {
    id: 'division-community-hub',
    name: 'Community Hub',
    description: 'Coral and amber ribbons for family life and fellowship halls.',
    gradient:
      "radial-gradient(circle at 12% 18%, rgba(255,148,120,0.38) 0%, rgba(12,16,26,0.92) 56%), radial-gradient(circle at 84% 80%, rgba(255,196,120,0.28) 0%, rgba(12,16,24,0.94) 62%)",
    particlePreset: 'ember',
  },
  {
    id: 'division-youth-dynamo',
    name: 'Youth Dynamo',
    description: 'Electric cyan and magenta pulses powering student rallies.',
    gradient:
      "radial-gradient(circle at 20% 75%, rgba(74,214,255,0.42) 0%, rgba(8,12,26,0.92) 58%), radial-gradient(circle at 82% 22%, rgba(220,132,255,0.32) 0%, rgba(8,12,24,0.94) 60%)",
    particlePreset: 'tech',
  },
  {
    id: 'division-parking-grid',
    name: 'Parking Grid',
    description: 'High-visibility amber and cobalt overlay for lot logistics.',
    gradient:
      "radial-gradient(circle at 28% 24%, rgba(255,196,94,0.38) 0%, rgba(12,14,22,0.92) 60%), radial-gradient(circle at 78% 76%, rgba(84,160,255,0.32) 0%, rgba(12,14,22,0.94) 60%)",
    particlePreset: 'command',
  },
  {
    id: 'division-summer-outreach',
    name: 'Summer Outreach',
    description: 'Citrus light bursts and teal mists for VBS mission weeks.',
    gradient:
      "radial-gradient(circle at 18% 24%, rgba(255,210,102,0.4) 0%, rgba(12,18,28,0.9) 56%), radial-gradient(circle at 82% 78%, rgba(82,226,206,0.28) 0%, rgba(12,20,30,0.92) 60%)",
    particlePreset: 'ember',
  },
  {
    id: 'division-autumn-harvest',
    name: 'Autumn Harvest',
    description: 'Harvest ambers and evergreen haze for fall resurfacing projects.',
    gradient:
      "radial-gradient(circle at 16% 74%, rgba(228,142,72,0.42) 0%, rgba(10,12,20,0.92) 58%), radial-gradient(circle at 84% 22%, rgba(120,186,124,0.3) 0%, rgba(10,12,20,0.94) 60%)",
    particlePreset: 'rogue',
  },
  {
    id: 'division-winter-brilliance',
    name: 'Winter Brilliance',
    description: 'Icy blue radiance with frosted overlays for cold-weather mobilization.',
    gradient:
      "radial-gradient(circle at 20% 20%, rgba(162,212,255,0.42) 0%, rgba(10,16,26,0.9) 58%), radial-gradient(circle at 86% 82%, rgba(212,234,255,0.28) 0%, rgba(12,18,28,0.92) 60%)",
    particlePreset: 'tech',
  },
  {
    id: 'division-storm-response',
    name: 'Storm Response',
    description: 'Emergency cyan and amber alerts primed for rapid response dashboards.',
    gradient:
      "radial-gradient(circle at 24% 18%, rgba(102,210,255,0.42) 0%, rgba(9,12,22,0.94) 55%), radial-gradient(circle at 84% 82%, rgba(255,156,72,0.32) 0%, rgba(10,12,22,0.94) 60%)",
    particlePreset: 'command',
  },
];

export const DEFAULT_WALLPAPER_ID = DIVISION_WALLPAPERS[0]?.id ?? 'division-twilight-ops';

export type DivisionGradients = typeof divisionGradients;
