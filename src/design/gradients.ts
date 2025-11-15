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

/**
 * Create radial gradient
 */
export function createRadialGradient(
  centerColor: string,
  edgeColor: string = 'transparent',
): string {
  return `radial-gradient(circle, ${centerColor} 0%, ${edgeColor} 100%)`;
}

export type DivisionGradients = typeof divisionGradients;
