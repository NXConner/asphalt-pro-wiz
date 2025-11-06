import { OverlayView, Polygon } from '@react-google-maps/api';
import { memo, useEffect, useMemo } from 'react';

import { TacticalOverlay } from '@/components/hud/TacticalOverlay';
import { GoogleMap, type GoogleMapProps } from '@/components/map/GoogleMap';
import { isEnabled } from '@/lib/flags';
import { logEvent } from '@/lib/logging';
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

export interface TacticalHazard {
  id: string;
  coordinates: [number, number];
  severity: 'low' | 'medium' | 'high';
  label?: string;
  radiusMeters?: number;
}

interface TacticalMapProps extends GoogleMapProps {
  className?: string;
  mapHeight?: number;
  waypoints?: TacticalWaypoint[];
  zones?: TacticalZone[];
  showPulse?: boolean;
  hazards?: TacticalHazard[];
  onWaypointSelect?: (waypoint: TacticalWaypoint) => void;
}

const statusAccent: Record<Exclude<TacticalWaypoint['status'], undefined>, string> = {
  active: '#f97316',
  pending: '#22d3ee',
  hold: '#facc15',
};

const hazardAccent: Record<TacticalHazard['severity'], string> = {
  low: '#22c55e',
  medium: '#facc15',
  high: '#ef4444',
};

export const TacticalMap = memo(
  ({
    className,
    mapHeight = 480,
    waypoints = [],
    zones = [],
    showPulse = true,
    hazards = [],
    onWaypointSelect,
    ...mapProps
  }: TacticalMapProps) => {
    const enhancementsEnabled = isEnabled('tacticalMapV2');

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

    useEffect(() => {
      if (!enhancementsEnabled) return;
      logEvent('tactical_map_render', {
        waypointCount: waypoints.length,
        zoneCount: zones.length,
        hazardCount: hazards.length,
      });
    }, [enhancementsEnabled, waypoints.length, zones.length, hazards.length]);

    const handleWaypointSelect = (waypoint: TacticalWaypoint) => {
      if (!enhancementsEnabled) return;
      logEvent('tactical_map_waypoint_select', {
        waypointId: waypoint.id,
        status: waypoint.status ?? 'pending',
      });
      onWaypointSelect?.(waypoint);
    };

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
                <div
                  className={cn(
                    'flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1',
                    enhancementsEnabled ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none',
                  )}
                  onClick={() => handleWaypointSelect(marker)}
                >
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

        {enhancementsEnabled
          ? hazards.map((hazard) => (
              <OverlayView
                key={hazard.id}
                position={{ lat: hazard.coordinates[0], lng: hazard.coordinates[1] }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div className="pointer-events-none flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1">
                  <span
                    className="relative block rounded-full"
                    style={{
                      width: 18,
                      height: 18,
                      background: `${hazardAccent[hazard.severity]}55`,
                      boxShadow: `0 0 32px ${hazardAccent[hazard.severity]}88`,
                    }}
                  >
                    <span
                      className="absolute inset-0 animate-ping rounded-full"
                      style={{
                        background: `${hazardAccent[hazard.severity]}55`,
                      }}
                    />
                  </span>
                  {hazard.label ? (
                    <span className="rounded bg-slate-900/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-white">
                      {hazard.label}
                    </span>
                  ) : null}
                </div>
              </OverlayView>
            ))
          : null}
        </GoogleMap>

        {enhancementsEnabled ? (
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
        ) : null}

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: enhancementsEnabled
              ? 'radial-gradient(circle at 20% 20%, rgba(255,145,0,0.12), transparent 55%)'
              : 'radial-gradient(circle at 50% 50%, rgba(37,99,235,0.1), transparent 50%)',
          }}
        />
      </div>
    );
  },
);

TacticalMap.displayName = 'TacticalMap';

