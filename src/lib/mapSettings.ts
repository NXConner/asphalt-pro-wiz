// Map settings and persistence utilities

export type MapProvider = 'leaflet' | 'google';

export type BaseLayerId =
  | 'esri_satellite'
  | 'osm_standard'
  | 'carto_voyager'
  | 'stamen_terrain'
  | 'google_hybrid';

export interface TileOverlayConfig {
  id: string; // unique key
  name: string;
  type: 'tile' | 'wms' | 'googleImageMapType' | 'googleTraffic' | 'radar';
  urlTemplate?: string; // for tile and wms
  attribution?: string;
  opacity?: number; // 0..1
  visible?: boolean;
  // WMS options
  wmsParams?: {
    layers: string;
    format?: string; // default image/png
    transparent?: boolean; // default true
    version?: string; // default 1.3.0
  };
}

export interface RadarSettings {
  enabled: boolean;
  opacity: number; // 0..1
  animate: boolean;
  frameDelayMs: number; // between frames
}

export interface MapSettings {
  provider: MapProvider;
  googleApiKey?: string;
  openWeatherApiKey?: string;
  baseLayer: BaseLayerId;
  overlays: TileOverlayConfig[]; // includes labels/roads/custom
  radar: RadarSettings;
  center?: [number, number];
  zoom?: number;
}

const STORAGE_KEY = 'pps.mapSettings.v1';

const defaultOverlays: TileOverlayConfig[] = [
  {
    id: 'labels',
    name: 'Labels',
    type: 'tile',
    urlTemplate:
      'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri',
    opacity: 1,
    visible: true,
  },
  {
    id: 'roads',
    name: 'Roads',
    type: 'tile',
    urlTemplate:
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    opacity: 0.35,
    visible: true,
  },
  {
    id: 'radar',
    name: 'Doppler Radar',
    type: 'radar',
    opacity: 0.7,
    visible: true,
  },
];

export function getDefaultMapSettings(): MapSettings {
  const s: MapSettings = {
    provider: 'leaflet',
    baseLayer: 'esri_satellite',
    overlays: defaultOverlays,
    radar: {
      enabled: true,
      opacity: 0.7,
      animate: true,
      frameDelayMs: 250,
    },
    zoom: 18,
  };
  return s;
}

export function loadMapSettings(): MapSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultMapSettings();
    const parsed = JSON.parse(raw) as MapSettings;
    // merge defaults with saved to ensure new keys present
    const def = getDefaultMapSettings();
    return {
      ...def,
      ...parsed,
      overlays: mergeOverlays(def.overlays, parsed.overlays || []),
      radar: { ...def.radar, ...(parsed.radar || {}) },
    };
  } catch {
    return getDefaultMapSettings();
  }
}

function mergeOverlays(defs: TileOverlayConfig[], saved: TileOverlayConfig[]): TileOverlayConfig[] {
  const byId: Record<string, TileOverlayConfig> = {};
  for (const d of defs) byId[d.id] = d;
  for (const s of saved) byId[s.id] = { ...byId[s.id], ...s };
  return Object.values(byId);
}

export function saveMapSettings(settings: MapSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

export function updateMapSettings(mutator: (prev: MapSettings) => MapSettings): MapSettings {
  const current = loadMapSettings();
  const next = mutator(current);
  saveMapSettings(next);
  return next;
}

export function setApiKeys(keys: { googleApiKey?: string; openWeatherApiKey?: string }) {
  updateMapSettings((prev) => ({ ...prev, ...keys }));
}

export function addCustomOverlay(config: TileOverlayConfig) {
  updateMapSettings((prev) => ({ ...prev, overlays: [...prev.overlays, config] }));
}

export function setProvider(provider: MapProvider) {
  updateMapSettings((prev) => ({ ...prev, provider }));
}

export function setBaseLayer(baseLayer: BaseLayerId) {
  updateMapSettings((prev) => ({ ...prev, baseLayer }));
}

export function setOverlayVisibility(id: string, visible: boolean) {
  updateMapSettings((prev) => ({
    ...prev,
    overlays: prev.overlays.map((o) => (o.id === id ? { ...o, visible } : o)),
  }));
}

export function setOverlayOpacity(id: string, opacity: number) {
  updateMapSettings((prev) => ({
    ...prev,
    overlays: prev.overlays.map((o) => (o.id === id ? { ...o, opacity } : o)),
  }));
}

export function setRadarSettings(radar: Partial<RadarSettings>) {
  updateMapSettings((prev) => ({ ...prev, radar: { ...prev.radar, ...radar } }));
}
