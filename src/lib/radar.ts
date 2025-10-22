// RainViewer radar frame utilities with caching

export interface RadarFrame {
  time: number; // unix seconds
  path: string; // base path part used by RainViewer
}

export interface RadarData {
  frames: RadarFrame[];
}

const CACHE_KEY = 'pps.radar.frames.v1';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface Cached<T> {
  t: number;
  v: T;
}

export async function fetchRadarFrames(): Promise<RadarFrame[]> {
  const cached = loadCached<RadarFrame[]>(CACHE_KEY);
  if (cached) return cached;

  try {
    // Prefer v2 nowcast frames
    const resp = await fetch('https://tilecache.rainviewer.com/v2/radar/nowcast.json');
    if (resp.ok) {
      const json = (await resp.json()) as { timestamps: number[]; host: string };
      const frames: RadarFrame[] = json.timestamps.map((t) => ({ time: t, path: `${json.host}/v2/radar/${t}/256/{z}/{x}/{y}/2/1_1.png` }));
      saveCached(CACHE_KEY, frames);
      return frames;
    }
  } catch {}

  try {
    // Fallback older public API
    const resp2 = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    if (resp2.ok) {
      const json = await resp2.json();
      // json.radar.past and json.radar.nowcast arrays with time and path
      const frames: RadarFrame[] = [...(json?.radar?.past || []), ...(json?.radar?.nowcast || [])]
        .filter((f: any) => !!f?.time && !!f?.path)
        .map((f: any) => ({ time: f.time, path: `https://tilecache.rainviewer.com${f.path}/256/{z}/{x}/{y}/2/1_1.png` }));
      saveCached(CACHE_KEY, frames);
      return frames;
    }
  } catch {}

  return [];
}

export function getTileUrlForFrame(frame: RadarFrame): string {
  return frame.path;
}

function loadCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Cached<T>;
    if (Date.now() - parsed.t > CACHE_TTL_MS) return null;
    return parsed.v;
  } catch {
    return null;
  }
}

function saveCached<T>(key: string, value: T) {
  try {
    const payload: Cached<T> = { t: Date.now(), v: value };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {}
}
