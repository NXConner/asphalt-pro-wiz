import { useJsApiLoader, GoogleMap as GMap, DrawingManager, Circle } from '@react-google-maps/api';
import { memo, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { TacticalOverlay } from '@/components/hud/TacticalOverlay';
import { listJobs, type SavedJob } from '@/lib/idb';
import type { Coordinates } from '@/lib/locations';
import {
  getBusinessCoords,
  getSupplierCoords,
  BUSINESS_ADDRESS,
  SUPPLIER_ADDRESS,
  BUSINESS_COORDS_FALLBACK,
  SUPPLIER_COORDS_FALLBACK,
} from '@/lib/locations';
import { loadMapSettings, type TileOverlayConfig, type BaseLayerId } from '@/lib/mapSettings';
import { fetchRadarFrames, getTileUrlForFrame } from '@/lib/radar';
import { cn } from '@/lib/utils';

export interface GoogleMapProps {
  onAddressUpdate: (coords: [number, number], address: string) => void;
  onAreaDrawn: (area: number) => void;
  onCrackLengthDrawn: (length: number) => void;
  customerAddress: string;
  refreshKey?: number;
  children?: ReactNode;
  className?: string;
  showTacticalOverlay?: boolean;
}

// Division-inspired status colors with tactical aesthetic
const statusColor: Record<string, string> = {
  need_estimate: '#fb923c', // Orange - reconnaissance phase
  estimated: '#22d3ee', // Cyan - proposal ready
  active: '#34d399', // Green - deployment active
  completed: '#94a3b8', // Slate - mission complete
  lost: '#f87171', // Red - after action
};

const containerStyle: google.maps.MapOptions['styles'] | undefined = undefined;

export const GoogleMap = memo(
  ({
    onAddressUpdate,
    onAreaDrawn,
    onCrackLengthDrawn,
    customerAddress,
    refreshKey,
    children,
    className,
    showTacticalOverlay = true,
  }: GoogleMapProps) => {
    const settings = loadMapSettings();
    const apiKey = settings.googleApiKey || '';
    const { isLoaded } = useJsApiLoader({
      googleMapsApiKey: apiKey || 'invalid-key',
      libraries: ['places', 'drawing', 'geometry'],
      id: 'google-map-script-pps',
    });

    const mapRef = useRef<google.maps.Map | null>(null);
    const [center, setCenter] = useState<google.maps.LatLngLiteral>({
      lat: settings.center?.[0] ?? BUSINESS_COORDS_FALLBACK[0],
      lng: settings.center?.[1] ?? BUSINESS_COORDS_FALLBACK[1],
    });
    const [zoom, setZoom] = useState<number>(settings.zoom ?? 19);
    const [jobs, setJobs] = useState<SavedJob[]>([]);
    const radarIntervalRef = useRef<number | null>(null);
    const baseOverlayCountRef = useRef<number>(0);
    const userMarkerRef = useRef<google.maps.Marker | null>(null);
    const userCoordsRef = useRef<[number, number] | null>(null);
    const bizCoordsRef = useRef<[number, number] | null>(null);

    useEffect(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
            userCoordsRef.current = coords;
            setCenter({ lat: coords[0], lng: coords[1] });
            // Drop/update current location marker if map is ready
            if (mapRef.current) {
              if (userMarkerRef.current) userMarkerRef.current.setMap(null);
              userMarkerRef.current = new google.maps.Marker({
                position: { lat: coords[0], lng: coords[1] },
                map: mapRef.current,
                title: 'Your Location',
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 6,
                  fillColor: '#3b82f6',
                  fillOpacity: 0.95,
                  strokeColor: '#2563eb',
                  strokeWeight: 2,
                },
              });
              // If business coords known, fit both
              if (bizCoordsRef.current) {
                const bounds = new google.maps.LatLngBounds();
                bounds.extend(new google.maps.LatLng(coords[0], coords[1]));
                bounds.extend(
                  new google.maps.LatLng(bizCoordsRef.current[0], bizCoordsRef.current[1]),
                );
                mapRef.current.fitBounds(bounds, 20);
              }
            }
          },
          () => {},
          { timeout: 4000 },
        );
      }
    }, []);

    const getMapTypeId = (base: BaseLayerId): google.maps.MapTypeId | string => {
      switch (base) {
        case 'google_roadmap':
          return google.maps.MapTypeId.ROADMAP;
        case 'google_satellite':
          return google.maps.MapTypeId.SATELLITE;
        case 'google_terrain':
          return google.maps.MapTypeId.TERRAIN;
        case 'google_hybrid':
        default:
          return google.maps.MapTypeId.HYBRID;
      }
    };

    const onLoad = useCallback(
      (map: google.maps.Map) => {
        mapRef.current = map;
        map.setMapTypeId(getMapTypeId(settings.baseLayer));
        map.setZoom(zoom);
        map.setCenter(center);

        // Business / supplier markers
        (async () => {
          try {
            const [biz, sup] = await Promise.all([getBusinessCoords(), getSupplierCoords()]);
            bizCoordsRef.current = biz;
            const bizMarker = new google.maps.Marker({
              position: { lat: biz[0], lng: biz[1] },
              map,
              title: BUSINESS_ADDRESS,
            });
            new google.maps.Marker({
              position: { lat: sup[0], lng: sup[1] },
              map,
              title: SUPPLIER_ADDRESS,
            });

            // If user location known, fit to both; else center to business
            if (userCoordsRef.current) {
              const bounds = new google.maps.LatLngBounds();
              bounds.extend(
                new google.maps.LatLng(userCoordsRef.current[0], userCoordsRef.current[1]),
              );
              bounds.extend(new google.maps.LatLng(biz[0], biz[1]));
              map.fitBounds(bounds, 20);
            } else {
              map.setCenter({ lat: biz[0], lng: biz[1] });
              map.setZoom(Math.max(map.getZoom() || 0, 12));
            }
          } catch {}
        })();

        // Non-radar overlays first
        setupBaseOverlays(map);
        // Radar overlay frames (on top)
        setupRadar(map);
      },
      // settings.baseLayer is read-but non-critical; overlays/radar functions are defined within and stable for session
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [center, zoom],
    );

    const setupBaseOverlays = (map: google.maps.Map) => {
      // Clear all types, then add base ones (non-radar)
      while ((map.overlayMapTypes?.getLength?.() || 0) > 0) {
        map.overlayMapTypes?.pop();
      }
      const nonRadar = settings.overlays.filter((o) => o.visible && o.id !== 'radar');
      for (const o of nonRadar) {
        const type = createOverlayMapTypeFromConfig(o);
        if (type) map.overlayMapTypes.push(type);
      }
      baseOverlayCountRef.current = map.overlayMapTypes?.getLength?.() || 0;
    };

    const setupRadar = async (map: google.maps.Map) => {
      if (radarIntervalRef.current) {
        window.clearInterval(radarIntervalRef.current);
        radarIntervalRef.current = null;
      }
      const radarCfg = settings.overlays.find((o) => o.id === 'radar' && o.visible);
      if (!settings.radar.enabled || !radarCfg) return;
      const frames = await fetchRadarFrames();
      if (!frames.length) return;

      const layers = frames.map(
        (f) =>
          new google.maps.ImageMapType({
            getTileUrl: (coord, z) =>
              getTileUrlForFrame(f)
                .replace('{z}', String(z))
                .replace('{x}', String(coord.x))
                .replace('{y}', String(coord.y)),
            tileSize: new google.maps.Size(256, 256),
            opacity: radarCfg.opacity ?? settings.radar.opacity,
            name: `radar-${f.time}`,
          }),
      );

      let idx = layers.length - 1;
      map.overlayMapTypes.setAt(baseOverlayCountRef.current, layers[idx]);

      if (settings.radar.animate) {
        radarIntervalRef.current = window.setInterval(
          () => {
            map.overlayMapTypes.setAt(baseOverlayCountRef.current, layers[idx]);
            idx = (idx + 1) % layers.length;
          },
          Math.max(100, settings.radar.frameDelayMs),
        );
      }
    };

    const onUnmount = useCallback(() => {
      if (radarIntervalRef.current) window.clearInterval(radarIntervalRef.current);
      mapRef.current = null;
    }, []);

    useEffect(() => {
      (async () => {
        try {
          setJobs(await listJobs());
        } catch {}
      })();
      // listJobs is stable
    }, [refreshKey]);

    // Handle clicks -> reverse geocode with Google if available
    const handleClick = async (e: google.maps.MapMouseEvent) => {
      if (!e.latLng || !mapRef.current) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const gc = new google.maps.Geocoder();
      try {
        const res = await gc.geocode({ location: { lat, lng } });
        const name = res.results?.[0]?.formatted_address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        onAddressUpdate([lat, lng], name);
      } catch {
        onAddressUpdate([lat, lng], `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    };

    // Drawing finished handlers (area/length using geometry lib)
    const handleOverlayComplete = (e: google.maps.drawing.OverlayCompleteEvent) => {
      const overlay = e.overlay as any;
      const type = e.type;
      if (!overlay || !type) return;
      if (
        (type === google.maps.drawing.OverlayType.POLYGON ||
          type === google.maps.drawing.OverlayType.RECTANGLE) &&
        (google.maps.geometry as any)?.spherical?.computeArea
      ) {
        let areaMeters = 0;
        if (type === google.maps.drawing.OverlayType.RECTANGLE) {
          const path = (overlay as google.maps.Rectangle).getBounds()?.toJSON();
          if (path) {
            const rectPaths: google.maps.LatLngLiteral[] = [
              { lat: path.north, lng: path.west },
              { lat: path.north, lng: path.east },
              { lat: path.south, lng: path.east },
              { lat: path.south, lng: path.west },
            ];
            areaMeters = (google.maps.geometry.spherical as any).computeArea(rectPaths);
          }
        } else {
          const path = (overlay as google.maps.Polygon).getPath();
          const pts: google.maps.LatLngLiteral[] = [];
          for (let i = 0; i < path.getLength(); i++) pts.push(path.getAt(i).toJSON());
          areaMeters = (google.maps.geometry.spherical as any).computeArea(pts);
        }
        const feet2 = areaMeters * 10.7639;
        onAreaDrawn(feet2);
      }
      if (
        type === google.maps.drawing.OverlayType.POLYLINE &&
        (google.maps.geometry as any)?.spherical?.computeLength
      ) {
        const path = (overlay as google.maps.Polyline).getPath();
        const pts: google.maps.LatLngLiteral[] = [];
        for (let i = 0; i < path.getLength(); i++) pts.push(path.getAt(i).toJSON());
        const meters = (google.maps.geometry.spherical as any).computeLength(pts);
        const feet = meters * 3.28084;
        onCrackLengthDrawn(feet);
      }
    };

    // External address change -> forward geocode with Google
    useEffect(() => {
      const timer = setTimeout(async () => {
        if (!customerAddress || !mapRef.current) return;
        try {
          const gc = new google.maps.Geocoder();
          const res = await gc.geocode({ address: customerAddress });
          const r = res.results?.[0];
          if (r) {
            const loc = r.geometry.location;
            const coords: [number, number] = [loc.lat(), loc.lng()];
            onAddressUpdate(coords, r.formatted_address);
            mapRef.current?.setCenter({ lat: coords[0], lng: coords[1] });
            mapRef.current?.setZoom(19);
          }
        } catch {}
      }, 500);
      return () => clearTimeout(timer);
      // onAddressUpdate provided by parent; assume memoized
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerAddress]);

    if (!apiKey) {
      return (
        <div className="h-[450px] w-full rounded-lg border border-border flex items-center justify-center text-sm text-muted-foreground">
          Enter Google Maps API key in Map Settings to enable Google provider.
        </div>
      );
    }

    if (!isLoaded) {
      return (
        <div
          className={cn(
            'relative h-[450px] w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70',
            className,
          )}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-sm text-slate-200/70">Loading tactical map...</div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 shadow-[0_30px_60px_rgba(8,12,24,0.55)] backdrop-blur-xl',
          className,
        )}
      >
        <GMap
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleClick}
          mapContainerStyle={{ height: '450px', width: '100%', borderRadius: 8 }}
          options={{
            mapTypeId: getMapTypeId(settings.baseLayer),
            streetViewControl: false,
            fullscreenControl: true,
            styles: [
              {
                featureType: 'all',
                elementType: 'geometry',
                stylers: [{ saturation: -30 }, { lightness: 10 }],
              },
              {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#1e293b' }, { saturation: -50 }],
              },
              {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#334155' }, { lightness: -10 }],
              },
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          }}
        >
          {/* Drawing tools */}
          <DrawingManager
            onOverlayComplete={handleOverlayComplete}
            options={{
              drawingControl: true,
              drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_LEFT,
                drawingModes: [
                  google.maps.drawing.OverlayType.POLYGON,
                  google.maps.drawing.OverlayType.POLYLINE,
                  google.maps.drawing.OverlayType.RECTANGLE,
                ],
              },
            }}
          />

          {/* Job markers with Division styling */}
          {jobs.map((job) =>
            job.coords ? (
              <Circle
                key={job.id}
                center={{ lat: (job.coords as any)[0], lng: (job.coords as any)[1] }}
                radius={4}
                options={{
                  strokeColor: statusColor[job.status] || '#22d3ee',
                  strokeOpacity: 1,
                  strokeWeight: 2.5,
                  fillColor: statusColor[job.status] || '#22d3ee',
                  fillOpacity: 0.75,
                  zIndex: 1000,
                }}
              />
            ) : null,
          )}
          {children}
        </GMap>

        {/* Tactical HUD Overlay */}
        {showTacticalOverlay && (
          <TacticalOverlay
            className="pointer-events-none absolute inset-0 rounded-2xl"
            accentColor="rgba(251,146,60,0.85)"
            backgroundTint="transparent"
            showGrid
            gridOpacity={0.15}
            gridDensity={96}
            showScanLines
            scanLinesProps={{ opacity: 0.25, speedMs: 4200, accentColor: 'rgba(251,146,60,0.4)' }}
            cornerProps={{ size: 28, thickness: 1.5, offset: 6, glow: true, animated: false }}
            pulse={false}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-950/50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,146,60,0.08),transparent_55%)]" />
          </TacticalOverlay>
        )}

        {/* Status legend overlay */}
        {jobs.length > 0 && (
          <div className="pointer-events-auto absolute bottom-4 left-4 z-10 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 backdrop-blur-lg">
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-200/70">
                Mission Status
              </div>
              {Object.entries(statusColor).map(([status, color]) => {
                const count = jobs.filter((j) => j.status === status).length;
                if (count === 0) return null;
                return (
                  <div key={status} className="flex items-center gap-2 text-xs">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: color,
                        boxShadow: `0 0 8px ${color}88`,
                      }}
                    />
                    <span className="font-mono text-slate-200/80">
                      {status.replace(/_/g, ' ')}: {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  },
);

function createOverlayMapTypeFromConfig(o: TileOverlayConfig): google.maps.ImageMapType | null {
  if (!o.visible) return null;
  if (o.type === 'tile' && o.urlTemplate) {
    return new google.maps.ImageMapType({
      getTileUrl: (coord, z) =>
        o
          .urlTemplate!.replace('{z}', String(z))
          .replace('{x}', String(coord.x))
          .replace('{y}', String(coord.y)),
      tileSize: new google.maps.Size(256, 256),
      opacity: o.opacity ?? 1,
      name: o.name,
    });
  }
  if (o.type === 'wms' && o.urlTemplate && o.wmsParams?.layers) {
    return new google.maps.ImageMapType({
      getTileUrl: (coord, z) =>
        buildWmsUrl(o.urlTemplate!, o.wmsParams!.layers, z, coord.x, coord.y),
      tileSize: new google.maps.Size(256, 256),
      opacity: o.opacity ?? 1,
      name: o.name,
    });
  }
  return null;
}

function buildWmsUrl(baseUrl: string, layers: string, z: number, x: number, y: number): string {
  // Compute EPSG:3857 bbox from x,y,z tile
  const n = Math.pow(2, z);
  const lonLeft = (x / n) * 360 - 180;
  const lonRight = ((x + 1) / n) * 360 - 180;
  const latTop = radToDeg(Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))));
  const latBottom = radToDeg(Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))));
  const [minx, miny] = lonLatToMercator(lonLeft, latBottom);
  const [maxx, maxy] = lonLatToMercator(lonRight, latTop);
  const params = new URLSearchParams({
    service: 'WMS',
    request: 'GetMap',
    layers,
    styles: '',
    format: 'image/png',
    transparent: 'true',
    version: '1.3.0',
    crs: 'EPSG:3857',
    width: '256',
    height: '256',
    bbox: `${minx},${miny},${maxx},${maxy}`,
  });
  const sep = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${sep}${params.toString()}`;
}

function lonLatToMercator(lon: number, lat: number): [number, number] {
  const x = (lon * 20037508.34) / 180;
  let y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
  y = (y * 20037508.34) / 180;
  // clamp
  const max = 20037508.34;
  return [Math.max(-max, Math.min(max, x)), Math.max(-max, Math.min(max, y))];
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export default GoogleMap;
