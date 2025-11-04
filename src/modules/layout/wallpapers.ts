import type { CanvasTone } from "./CanvasPanel";

export interface CanvasWallpaper {
  id: string;
  name: string;
  description: string;
  gradient: string;
  accentTone: CanvasTone;
}

export const CANVAS_WALLPAPERS: CanvasWallpaper[] = [
  {
    id: "twilight-glow",
    name: "Twilight Glow",
    description: "Warm dusk energy inspired by freshly sealed asphalt at golden hour.",
    gradient:
      "radial-gradient(circle at 20% 20%, rgba(249,115,22,0.35) 0%, rgba(17,24,39,0.95) 55%), radial-gradient(circle at 80% 0%, rgba(14,165,233,0.25) 0%, rgba(15,23,42,0.92) 60%)",
    accentTone: "dusk",
  },
  {
    id: "sanctuary-aurora",
    name: "Sanctuary Aurora",
    description: "Soft teal ribbons reflecting sanctuary lighting for overnight projects.",
    gradient:
      "radial-gradient(circle at 10% 35%, rgba(20,184,166,0.32) 0%, rgba(15,23,42,0.9) 50%), radial-gradient(circle at 90% 10%, rgba(129,140,248,0.22) 0%, rgba(15,23,42,0.92) 55%)",
    accentTone: "aurora",
  },
  {
    id: "ember-lanes",
    name: "Ember Lanes",
    description: "Fiery accent built for crew hustle and striping precision under lights.",
    gradient:
      "radial-gradient(circle at 0% 80%, rgba(248,113,113,0.32) 0%, rgba(12,10,25,0.9) 55%), radial-gradient(circle at 80% 20%, rgba(251,191,36,0.22) 0%, rgba(12,10,25,0.92) 60%)",
    accentTone: "ember",
  },
  {
    id: "cathedral-lagoon",
    name: "Cathedral Lagoon",
    description: "Deep indigo atmosphere suited for data-rich executive command briefings.",
    gradient:
      "radial-gradient(circle at 50% 0%, rgba(129,140,248,0.28) 0%, rgba(10,12,27,0.92) 55%), radial-gradient(circle at 90% 80%, rgba(59,130,246,0.24) 0%, rgba(10,12,27,0.95) 60%)",
    accentTone: "lagoon",
  },
];

export const DEFAULT_WALLPAPER = CANVAS_WALLPAPERS[0];

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
