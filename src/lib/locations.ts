// Centralized locations and geocoding utilities

export type Coordinates = [number, number]; // [lat, lng]

export const BUSINESS_ADDRESS = '337 Ayers Orchard Rd, Stuart, VA';
export const SUPPLIER_ADDRESS = '703 West Decatur St, Madison, NC';

// Fallback coordinates if geocoding is unavailable
export const BUSINESS_COORDS_FALLBACK: Coordinates = [36.638, -80.269];
export const SUPPLIER_COORDS_FALLBACK: Coordinates = [36.3871, -79.9578];

type GeocodeCache = Record<string, Coordinates>;

function getCache(): GeocodeCache {
  try {
    const raw = localStorage.getItem('pps.geocodeCache');
    if (!raw) return {};
    return JSON.parse(raw) as GeocodeCache;
  } catch {
    return {};
  }
}

function setCache(cache: GeocodeCache) {
  try {
    localStorage.setItem('pps.geocodeCache', JSON.stringify(cache));
  } catch {}
}

export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  if (!address.trim()) return null;
  const cache = getCache();
  if (cache[address]) return cache[address];
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      const coords: Coordinates = [lat, lon];
      cache[address] = coords;
      setCache(cache);
      return coords;
    }
  } catch (err) {
    console.error('Geocode error:', err);
  }
  return null;
}

export async function getBusinessCoords(): Promise<Coordinates> {
  return (await geocodeAddress(BUSINESS_ADDRESS)) ?? BUSINESS_COORDS_FALLBACK;
}

export async function getSupplierCoords(): Promise<Coordinates> {
  return (await geocodeAddress(SUPPLIER_ADDRESS)) ?? SUPPLIER_COORDS_FALLBACK;
}
