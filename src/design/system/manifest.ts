import {
  THEME_PRESETS,
  type ThemeCategory,
  type ThemeNameFromTokens,
  type ThemePresetMeta,
} from '@/design/system/catalog';
import { DIVISION_WALLPAPERS } from '@/design/themes';
import type { CanvasTone, CanvasWallpaper } from '@/modules/layout/wallpapers';
import { CANVAS_WALLPAPERS, DEFAULT_WALLPAPER } from '@/modules/layout/wallpapers';

export interface ThemeGalleryEntry {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly badges: readonly string[];
  readonly tags: readonly string[];
  readonly category: ThemeCategory | 'liturgical';
  readonly themeName: ThemeNameFromTokens;
  readonly wallpaper: CanvasWallpaper;
  readonly accentHue: number;
  readonly accentTone: CanvasTone;
}

export interface ThemeGalleryCollection {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly entries: ThemeGalleryEntry[];
}

export interface DesignSystemManifest {
  readonly collections: ThemeGalleryCollection[];
  readonly wallpapers: CanvasWallpaper[];
}

const wallpaperMap = new Map(CANVAS_WALLPAPERS.map((wallpaper) => [wallpaper.id, wallpaper]));

const getWallpaper = (id?: string): CanvasWallpaper => {
  if (!id) return DEFAULT_WALLPAPER;
  return wallpaperMap.get(id) ?? DEFAULT_WALLPAPER;
};

const buildEntry = ({
  collectionId,
  themeName,
  wallpaperId,
  badges = [],
  tags = [],
  summary,
  category,
}: {
  collectionId: string;
  themeName: ThemeNameFromTokens;
  wallpaperId?: string;
  badges?: string[];
  tags?: string[];
  summary: string;
  category: ThemeCategory | 'liturgical';
}): ThemeGalleryEntry => {
  const preset = THEME_PRESETS[themeName] as ThemePresetMeta | undefined;
  const wallpaper = getWallpaper(wallpaperId ?? preset?.recommendedWallpaperId ?? DEFAULT_WALLPAPER.id);

  return {
    id: `${collectionId}-${themeName}`,
    title: preset?.label ?? themeName,
    summary,
    badges,
    tags,
    category,
    themeName,
    wallpaper,
    accentHue: preset?.accentHue ?? 210,
    accentTone: wallpaper.accentTone ?? 'dusk',
  };
};

const liturgicalCollection: ThemeGalleryCollection = {
  id: 'liturgical',
  title: 'Liturgical Seasons',
  description: 'Sacred-calendar palettes for Advent, Lent, Easter, and Pentecost mission planning.',
  entries: [
    buildEntry({
      collectionId: 'liturgical',
      themeName: 'advent-vigil',
      wallpaperId: 'division-advent-lights',
      badges: ['Advent', 'Candlelight'],
      tags: ['violet', 'brass', 'evening services'],
      summary: 'Violet + brass duo tuned for Advent vigils and choir rehearsals.',
      category: 'liturgical',
    }),
    buildEntry({
      collectionId: 'liturgical',
      themeName: 'lent-refocus',
      wallpaperId: 'division-lent-embers',
      badges: ['Lent'],
      tags: ['plum', 'reflective'],
      summary: 'Muted plum gradients with ember accents for Lent refocus moments.',
      category: 'liturgical',
    }),
    buildEntry({
      collectionId: 'liturgical',
      themeName: 'easter-radiance',
      wallpaperId: 'division-easter-bloom',
      badges: ['Easter'],
      tags: ['gold', 'teal', 'celebration'],
      summary: 'Gold + teal bloom for resurrection celebrations and family services.',
      category: 'liturgical',
    }),
    buildEntry({
      collectionId: 'liturgical',
      themeName: 'pentecost-flare',
      wallpaperId: 'division-pentecost-flare',
      badges: ['Pentecost'],
      tags: ['fire', 'wind'],
      summary: 'Fiery oranges with wind-swept amber for Pentecost missions.',
      category: 'liturgical',
    }),
  ],
};

const operationsCollection: ThemeGalleryCollection = {
  id: 'operations',
  title: 'Mission Operations',
  description: 'Night watch, weather, and youth rally palettes deployed during field execution.',
  entries: [
    buildEntry({
      collectionId: 'operations',
      themeName: 'night-watch',
      wallpaperId: 'division-dark-zone',
      badges: ['After Hours'],
      tags: ['nocturnal', 'surveillance'],
      summary: 'Deep cobalt + amber alerts for overnight patrols.',
      category: 'operations',
    }),
    buildEntry({
      collectionId: 'operations',
      themeName: 'dawn-patrol',
      wallpaperId: 'division-sunrise-service',
      badges: ['Sunrise'],
      tags: ['warm', 'inspection'],
      summary: 'Sunrise gradients for first-light inspections.',
      category: 'operations',
    }),
    buildEntry({
      collectionId: 'operations',
      themeName: 'rain-shelter',
      wallpaperId: 'division-storm-response',
      badges: ['Weather'],
      tags: ['rain', 'contingency'],
      summary: 'Cool aqua palette with storm-response overlays.',
      category: 'operations',
    }),
    buildEntry({
      collectionId: 'operations',
      themeName: 'afterglow-service',
      wallpaperId: 'division-vespers-halo',
      badges: ['Evening'],
      tags: ['crimson', 'wrap-up'],
      summary: 'Brass + crimson glow for post-service briefings.',
      category: 'operations',
    }),
    buildEntry({
      collectionId: 'operations',
      themeName: 'revival-night',
      wallpaperId: 'division-revival-rush',
      badges: ['Youth'],
      tags: ['electric', 'rally'],
      summary: 'Neon violets tuned for youth rallies and revival nights.',
      category: 'operations',
    }),
  ],
};

const campusCollection: ThemeGalleryCollection = {
  id: 'campus',
  title: 'Campus Contexts',
  description: 'Palettes tailored to sanctuaries, family life centers, youth spaces, and parking ops.',
  entries: [
    buildEntry({
      collectionId: 'campus',
      themeName: 'chapel-stonework',
      wallpaperId: 'division-campus-heritage',
      badges: ['Heritage'],
      tags: ['sandstone', 'historic'],
      summary: 'Warm sandstone with teal edges for heritage chapels.',
      category: 'campus',
    }),
    buildEntry({
      collectionId: 'campus',
      themeName: 'family-life',
      wallpaperId: 'division-community-hub',
      badges: ['Community'],
      tags: ['coral', 'hospitality'],
      summary: 'Inviting coral + amber for multi-use halls.',
      category: 'campus',
    }),
    buildEntry({
      collectionId: 'campus',
      themeName: 'youth-center',
      wallpaperId: 'division-youth-dynamo',
      badges: ['Youth'],
      tags: ['electric', 'violet'],
      summary: 'Electric cyan and magenta energy for youth centers.',
      category: 'campus',
    }),
    buildEntry({
      collectionId: 'campus',
      themeName: 'parking-strategy',
      wallpaperId: 'division-parking-grid',
      badges: ['Parking'],
      tags: ['blueprint', 'layout'],
      summary: 'High-contrast amber + cobalt for parking reconfiguration.',
      category: 'campus',
    }),
  ],
};

const seasonalCollection: ThemeGalleryCollection = {
  id: 'seasonal',
  title: 'Seasonal Operations',
  description: 'Outreach, harvest, winterization, and storm-response visuals.',
  entries: [
    buildEntry({
      collectionId: 'seasonal',
      themeName: 'summer-outreach',
      wallpaperId: 'division-summer-outreach',
      badges: ['Summer'],
      tags: ['citrus', 'outreach'],
      summary: 'Citrus gradients for VBS and outreach blitzes.',
      category: 'seasonal',
    }),
    buildEntry({
      collectionId: 'seasonal',
      themeName: 'autumn-renewal',
      wallpaperId: 'division-autumn-harvest',
      badges: ['Autumn'],
      tags: ['harvest', 'renewal'],
      summary: 'Harvest ambers paired with pine greens for fall resurfacing.',
      category: 'seasonal',
    }),
    buildEntry({
      collectionId: 'seasonal',
      themeName: 'winter-brilliance',
      wallpaperId: 'division-winter-brilliance',
      badges: ['Winter'],
      tags: ['frost', 'prep'],
      summary: 'Icy blues with frosted whites for cold-weather planning.',
      category: 'seasonal',
    }),
    buildEntry({
      collectionId: 'seasonal',
      themeName: 'storm-response',
      wallpaperId: 'division-storm-response',
      badges: ['Storm'],
      tags: ['radar', 'emergency'],
      summary: 'Emergency cyan + amber for storm-response deployments.',
      category: 'seasonal',
    }),
  ],
};

export const DESIGN_SYSTEM_MANIFEST: DesignSystemManifest = {
  collections: [liturgicalCollection, operationsCollection, campusCollection, seasonalCollection],
  wallpapers: CANVAS_WALLPAPERS,
};

