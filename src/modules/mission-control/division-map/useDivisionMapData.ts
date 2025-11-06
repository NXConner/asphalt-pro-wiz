import { useQuery } from '@tanstack/react-query';

import { useRealtime } from '@/hooks/useRealtime';
import { supabase } from '@/integrations/supabase/client';

export interface DivisionMapPoint {
  id: string;
  lat: number;
  lng: number;
  status: string;
  value?: number;
  address?: string;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface DivisionMapTelemetry {
  points: DivisionMapPoint[];
  statusCounts: Record<string, number>;
  totalQuoteValue: number;
  center: [number, number];
}

function calculateCenter(points: DivisionMapPoint[]): [number, number] {
  if (points.length === 0) return [39.8283, -98.5795];
  const latSum = points.reduce((sum, p) => sum + p.lat, 0);
  const lngSum = points.reduce((sum, p) => sum + p.lng, 0);
  return [latSum / points.length, lngSum / points.length];
}

async function fetchDivisionMapTelemetry(): Promise<DivisionMapTelemetry> {
  // Query job_telemetry table for operational data
  const { data, error } = await supabase
    .from('job_telemetry')
    .select(
      'job_id, status, quote_value, area_sqft, location_lat, location_lng, customer_address, created_at, updated_at',
    )
    .not('location_lat', 'is', null)
    .not('location_lng', 'is', null)
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('Failed to fetch job telemetry:', error);
    return {
      points: [],
      statusCounts: {},
      totalQuoteValue: 0,
      center: [39.8283, -98.5795],
    };
  }

  if (!data || data.length === 0) {
    return {
      points: [],
      statusCounts: {},
      totalQuoteValue: 0,
      center: [39.8283, -98.5795],
    };
  }

  // Group by job_id and take the most recent entry for each job
  const jobMap = new Map<string, (typeof data)[0]>();
  data.forEach((entry) => {
    const existing = jobMap.get(entry.job_id);
    if (!existing || new Date(entry.created_at) > new Date(existing.created_at)) {
      jobMap.set(entry.job_id, entry);
    }
  });

  const uniqueJobs = Array.from(jobMap.values());

  const points: DivisionMapPoint[] = uniqueJobs.map((job) => ({
    id: job.job_id,
    lat: Number(job.location_lat),
    lng: Number(job.location_lng),
    status: job.status || 'pending',
    value: job.quote_value ? Number(job.quote_value) : undefined,
    address: job.customer_address || undefined,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
  }));

  const statusCounts: Record<string, number> = {};
  let totalQuoteValue = 0;

  uniqueJobs.forEach((job) => {
    if (job.status) {
      statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
    }
    if (job.quote_value) {
      totalQuoteValue += Number(job.quote_value);
    }
  });

  const center: [number, number] =
    points.length > 0 ? calculateCenter(points) : [39.8283, -98.5795];

  return {
    points,
    statusCounts,
    totalQuoteValue,
    center,
  };
}

export function useDivisionMapData() {
  const query = useQuery({
    queryKey: ['division-map-telemetry'],
    queryFn: fetchDivisionMapTelemetry,
    staleTime: 1000 * 60 * 5,
  });

  const { isConnected } = useRealtime({
    table: 'job_telemetry',
    invalidateQueries: [['division-map-telemetry']],
  });

  return {
    ...query,
    isRealtimeConnected: isConnected,
  };
}
