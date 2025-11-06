import { useMemo } from 'react';

import type { TacticalHazard, TacticalWaypoint } from '@/components/map/TacticalMap';
import { useJobTelemetryStats, type JobTelemetryStats } from '@/hooks/useTelemetry';

export interface MissionTimelineEntry {
  id: string;
  name: string;
  status: string;
  quote: number;
  updatedAt: string;
  location?: {
    lat: number;
    lng: number;
    address?: string | null;
  };
}

export interface MissionActivityState {
  stats: JobTelemetryStats | null;
  timeline: MissionTimelineEntry[];
  hazards: TacticalHazard[];
  waypoints: TacticalWaypoint[];
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  isRealtimeConnected: boolean;
}

const STATUS_HAZARD_SEVERITY: Record<string, TacticalHazard['severity']> = {
  cancelled: 'high',
  on_hold: 'medium',
  pending: 'medium',
  scheduled: 'low',
  in_progress: 'low',
  completed: 'low',
};

const SQFT_TO_METERS = 0.092903;

export function deriveMissionActivity(stats: JobTelemetryStats | null): {
  timeline: MissionTimelineEntry[];
  hazards: TacticalHazard[];
  waypoints: TacticalWaypoint[];
} {
  if (!stats) {
    return { timeline: [], hazards: [], waypoints: [] };
  }

  const timeline: MissionTimelineEntry[] = stats.recentJobs.map((job) => ({
    id: job.job_id ?? job.created_at,
    name: job.customer_address ?? job.job_id ?? 'Unassigned Mission',
    status: (job.status ?? 'unknown').toLowerCase(),
    quote: Number(job.quote_value ?? 0),
    updatedAt: job.updated_at ?? job.created_at,
    location:
      job.location_lat !== null &&
      job.location_lat !== undefined &&
      job.location_lng !== null &&
      job.location_lng !== undefined
        ? {
            lat: Number(job.location_lat),
            lng: Number(job.location_lng),
            address: job.customer_address,
          }
        : undefined,
  }));

  const hazards: TacticalHazard[] = stats.jobsByLocation.map((job) => {
    const status = (job.status ?? 'unknown').toLowerCase();
    const severity = STATUS_HAZARD_SEVERITY[status] ?? 'low';
    const areaSqft = Number(job.area_sqft ?? 0);
    const areaMeters = areaSqft * SQFT_TO_METERS;
    const radius = areaMeters > 0 ? Math.sqrt(areaMeters / Math.PI) : 12;

    return {
      id: job.job_id ?? `hazard-${job.created_at}`,
      coordinates: [Number(job.location_lat), Number(job.location_lng)],
      severity,
      label: job.customer_address ?? status,
      radiusMeters: radius,
    } satisfies TacticalHazard;
  });

  const waypoints: TacticalWaypoint[] = stats.jobsByLocation.map((job) => ({
    id: job.job_id ?? `waypoint-${job.created_at}`,
    coordinates: [Number(job.location_lat), Number(job.location_lng)],
    label: job.customer_address ?? 'Mission Site',
    status: (job.status ?? 'pending') as TacticalWaypoint['status'],
  }));

  return { timeline, hazards, waypoints };
}

export function useMissionActivity(): MissionActivityState {
  const query = useJobTelemetryStats({ subscribe: true, staleTime: 1000 * 30 });

  const derived = useMemo(() => deriveMissionActivity(query.data ?? null), [query.data]);

  return {
    stats: query.data ?? null,
    timeline: derived.timeline,
    hazards: derived.hazards,
    waypoints: derived.waypoints,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isRealtimeConnected: query.isRealtimeConnected,
  };
}
