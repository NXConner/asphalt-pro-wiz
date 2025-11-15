import type { CanvasTone } from './CanvasPanel';

import { DEFAULT_WALLPAPER_ID, DIVISION_WALLPAPERS, type WallpaperDefinition } from '@/design';

export interface CanvasWallpaper extends WallpaperDefinition {
  accentTone: CanvasTone;
}

const WALLPAPER_TONES: Record<string, CanvasTone> = {
  'division-twilight-ops': 'dusk',
  'division-sanctuary-grid': 'aurora',
  'division-dark-zone': 'ember',
  'division-cathedral-briefing': 'lagoon',
  'division-stealth-insertion': 'aurora',
  'division-sunrise-service': 'ember',
  'division-vespers-halo': 'dusk',
  'division-revival-rush': 'aurora',
  'division-celestial-dawn': 'lagoon',
  'division-advent-lights': 'dusk',
  'division-lent-embers': 'ember',
  'division-easter-bloom': 'aurora',
  'division-pentecost-flare': 'ember',
  'division-campus-heritage': 'dusk',
  'division-community-hub': 'ember',
  'division-youth-dynamo': 'aurora',
  'division-parking-grid': 'ember',
  'division-summer-outreach': 'aurora',
  'division-autumn-harvest': 'ember',
  'division-winter-brilliance': 'lagoon',
  'division-storm-response': 'aurora',
};

export const CANVAS_WALLPAPERS: CanvasWallpaper[] = DIVISION_WALLPAPERS.map((wallpaper) => ({
  ...wallpaper,
  accentTone: WALLPAPER_TONES[wallpaper.id] ?? 'dusk',
}));

export const DEFAULT_WALLPAPER = CANVAS_WALLPAPERS.find(
  (wallpaper) => wallpaper.id === DEFAULT_WALLPAPER_ID,
) ?? CANVAS_WALLPAPERS[0];

export function getWallpaperById(id: string): CanvasWallpaper {
  return CANVAS_WALLPAPERS.find((wallpaper) => wallpaper.id === id) ?? DEFAULT_WALLPAPER;
}

export function getNextWallpaper(currentId: string): CanvasWallpaper {
  const index = CANVAS_WALLPAPERS.findIndex((wallpaper) => wallpaper.id === currentId);
  if (index === -1) {
    return DEFAULT_WALLPAPER;
  }
  const nextIndex = (index + 1) % CANVAS_WALLPAPERS.length;
  return CANVAS_WALLPAPERS[nextIndex];
}
