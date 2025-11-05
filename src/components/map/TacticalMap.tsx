import { OverlayView, Polygon } from '@react-google-maps/api';
import { memo, useMemo } from 'react';

import { TacticalOverlay } from '@/components/hud/TacticalOverlay';
import { GoogleMap, type GoogleMapProps } from '@/components/map/GoogleMap';
import { cn } from '@/lib/utils';

export interface TacticalWaypoint {
  id: string;
  coordinates: [number, number];
  label?: string;
  status?: 'active' | 'pending' | 'hold';
  color?: string;
}

export interface TacticalZone {
  id: string;
  points: [number, number][];
  label?: string;
  color?: string;
}

interface TacticalMapProps extends GoogleMapProps {
  className?: string;
  mapHeight?: number;
  waypoints?: TacticalWaypoint[];
  zones?: TacticalZone[];
  showPulse?: boolean;
}

const statusAccent: Record<Exclude<TacticalWaypoint['status'], undefined>, string> = {
  active: '#f97316',
  pending: '#22d3ee',
  hold: '#facc15',
};

export const TacticalMap = memo(
  ({
    className,
    mapHeight = 480,
    waypoints = [],
    zones = [],
    showPulse = true,
    ...mapProps
  }: TacticalMapProps) => {
    const zonePolygons = useMemo(
      () =>
        zones.map((zone) => ({
          id: zone.id,
          path: zone.points.map(([lat, lng]) => ({ lat, lng })),
          label: zone.label,
          color: zone.color ?? 'rgba(255,145,0,0.55)',
        })),
      [zones],
    );

    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 shadow-[0_30px_60px_rgba(8,12,24,0.55)] backdrop-blur-xl',
          className,
        )}
        style={{ minHeight: mapHeight }}
      >
        <GoogleMap {...mapProps}>
          {zonePolygons.map((zone) => (
            <Polygon
              key={zone.id}
              paths={zone.path}
              options={{
                fillColor: zone.color,
                fillOpacity: 0.22,
                strokeColor: zone.color,
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
            />
          ))}

          {waypoints.map((marker) => (
            <OverlayView
              key={marker.id}
              position={{ lat: marker.coordinates[0], lng: marker.coordinates[1] }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div className="pointer-events-none flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1">
                <div
                  className="h-3 w-3 rounded-full shadow-[0_0_16px_rgba(255,145,0,0.6)]"
                  style={{
                    background: marker.color || statusAccent[marker.status ?? 'pending'],
                  }}
                />
                {marker.label ? (
                  <span className="rounded bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/90">
                    {marker.label}
                  </span>
                ) : null}
              </div>
            </OverlayView>
          ))}
        </GoogleMap>

        <TacticalOverlay
          className="pointer-events-none absolute inset-0 rounded-2xl"
          accentColor="rgba(255,145,0,0.85)"
          backgroundTint="transparent"
          showGrid
          gridOpacity={0.2}
          gridDensity={96}
          showScanLines
          scanLinesProps={{ opacity: 0.28, speedMs: 4200 }}
          cornerProps={{ size: 32, thickness: 1.5, offset: 8, glow: false, animated: false }}
          pulse={false}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/30 to-slate-950/60" />
          {showPulse ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="tactical-pulse-ring" />
            </div>
          ) : null}
        </TacticalOverlay>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,145,0,0.12),transparent_55%)]" />
      </div>
    );
  },
);

TacticalMap.displayName = 'TacticalMap';

