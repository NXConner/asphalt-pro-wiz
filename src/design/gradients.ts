export interface WallpaperDefinition {
  id: string;
  name: string;
  description: string;
  gradient: string;
  particlePreset: 'ember' | 'tech' | 'stealth' | 'command' | 'rogue';
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
];

export const DEFAULT_WALLPAPER_ID = DIVISION_WALLPAPERS[0]?.id ?? 'division-twilight-ops';

