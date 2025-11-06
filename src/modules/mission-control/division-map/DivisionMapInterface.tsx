import { Loader2, RefreshCcw } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  DivisionCard,
  DivisionCardDivider,
  DivisionCardHeader,
  DivisionCardMetric,
} from '@/components/division';
import { Button } from '@/components/ui/button';

import { useDivisionMapData } from './useDivisionMapData';
const STATUS_COLORS: Record<string, string> = {
  need_estimate: '#fb923c',
  estimated: '#38bdf8',
  scheduled: '#a855f7',
  active: '#34d399',
  completed: '#94a3b8',
  lost: '#f87171',
};

function resolveStatusKey(status: string): string {
  const key = status.toLowerCase();
  if (STATUS_COLORS[key]) return key;
  if (key === 'in_progress') return 'active';
  return 'need_estimate';
}

export function DivisionMapInterface() {
  const { data, isLoading, isError, refetch } = useDivisionMapData();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);

  const statusKeys = useMemo(
    () => (data ? Object.keys(data.statusCounts).map(resolveStatusKey) : []),
    [data],
  );

  const [activeStatuses, setActiveStatuses] = useState<string[]>([]);

  useEffect(() => {
    if (statusKeys.length && !activeStatuses.length) setActiveStatuses(statusKeys);
  }, [statusKeys, activeStatuses.length]);

  useEffect(() => {
    if (!data || !mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
      minZoom: 4,
    }).setView(data.center, 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const layer = new L.LayerGroup();
    layer.addTo(map);
    mapRef.current = map;
    markerLayerRef.current = layer;
  }, [data]);

  useEffect(() => {
    if (!data || !mapRef.current || !markerLayerRef.current) return;

    markerLayerRef.current.clearLayers();
    const filteredPoints = data.points.filter((point) =>
      activeStatuses.includes(resolveStatusKey(point.status)),
    );

    filteredPoints.forEach((point) => {
      const tone = STATUS_COLORS[resolveStatusKey(point.status)] ?? '#38bdf8';
      const marker = L.circleMarker([point.lat, point.lng], {
        radius: 7,
        color: tone,
        weight: 2,
        fillColor: tone,
        fillOpacity: 0.75,
      }).addTo(markerLayerRef.current!);
      const popupContent = [
        `<strong>${point.address || 'Job #' + point.id.slice(0, 8)}</strong>`,
        `Status: ${point.status}`,
        point.value ? `Quote: $${point.value.toLocaleString()}` : null,
      ].filter(Boolean).join('<br/>');
      marker.bindPopup(popupContent);
    });

    if (filteredPoints.length) {
      const bounds = L.latLngBounds(filteredPoints.map((point) => [point.lat, point.lng]));
      mapRef.current.fitBounds(bounds.pad(0.2));
    }
  }, [data, activeStatuses]);

  const toggleStatus = (status: string) =>
    setActiveStatuses((prev) =>
      prev.includes(status) ? prev.filter((value) => value !== status) : [...prev, status],
    );
  const summaryMetrics = data
    ? { jobs: data.points.length, quote: data.totalQuoteValue, area: 0 }
    : null;
  return (
    <DivisionCard variant="intel">
      <DivisionCardHeader
        eyebrow="Division Map"
        title="Mission Footprint"
        subtitle="Geo distribution of active, scheduled, and completed jobs"
        actions={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="pointer-events-auto gap-2"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {statusKeys.map((status) => {
          const color = STATUS_COLORS[status] ?? '#38bdf8';
          const active = activeStatuses.includes(status);
          return (
            <Button
              key={status}
              type="button"
              size="sm"
              variant={active ? 'secondary' : 'ghost'}
              className="pointer-events-auto gap-2"
              style={active ? { boxShadow: `0 0 14px ${color}55` } : undefined}
              onClick={() => toggleStatus(status)}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: color,
                  boxShadow: active ? `0 0 12px ${color}88` : undefined,
                }}
              />
              {status.replace(/_/g, ' ')}
            </Button>
          );
        })}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="relative h-[320px] overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/35">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-200" />
            </div>
          ) : null}
          {isError ? (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-rose-200">
              Unable to load map telemetry.
            </div>
          ) : null}
          <div ref={mapContainerRef} className="h-full w-full" aria-label="Division mission map" />
        </div>

        <div className="space-y-3">
          {summaryMetrics ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <DivisionCardMetric label="Mapped Jobs" value={summaryMetrics.jobs.toString()} />
              <DivisionCardMetric
                label="Quote Pipeline"
                value={`$${summaryMetrics.quote.toLocaleString()}`}
              />
              <DivisionCardMetric
                label="Area Coverage"
                value={`${summaryMetrics.area.toLocaleString()} sq ft`}
              />
            </div>
          ) : null}
          <DivisionCardDivider />
          <div className="grid gap-2">
            {statusKeys.map((status) => {
              if (!data) return null;
              const count = data.statusCounts[status] ?? 0;
              const color = STATUS_COLORS[status] ?? '#38bdf8';
              return (
                <div
                  key={`legend-${status}`}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
                >
                  <span className="hud-mono text-xs text-slate-200/70">
                    <span
                      className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
                      style={{ backgroundColor: color }}
                    />
                    {status.replace(/_/g, ' ')}
                  </span>
                  <span className="hud-mono text-sm text-slate-100/85">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DivisionCard>
  );
}
