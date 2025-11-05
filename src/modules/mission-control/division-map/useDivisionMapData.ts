import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/integrations/supabase/client';

export interface DivisionMapPoint {
  id: string;
  name: string;
  status: string;
  coordinates: [number, number];
  quoteValue: number;
  totalAreaSqFt: number;
  updatedAt?: string | null;
}

export interface DivisionMapTelemetry {
  points: DivisionMapPoint[];
  statusCounts: Record<string, number>;
  totalQuoteValue: number;
  totalAreaSqFt: number;
  center: [number, number];
}

function safeNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function computeCenter(points: DivisionMapPoint[]): [number, number] {
  if (points.length === 0) return [36.7783, -78.6569];
  const { latSum, lngSum } = points.reduce(
    (acc, point) => ({
      latSum: acc.latSum + point.coordinates[0],
      lngSum: acc.lngSum + point.coordinates[1],
    }),
    { latSum: 0, lngSum: 0 },
  );
  return [latSum / points.length, lngSum / points.length];
}

async function fetchDivisionMapTelemetry(): Promise<DivisionMapTelemetry> {
  const { data, error } = await supabase
    .from('jobs')
    .select('id,name,status,quote_value,total_area_sqft,customer_latitude,customer_longitude,updated_at')
    .limit(500);

  if (error) throw error;

  const points: DivisionMapPoint[] = [];
  const statusCounts: Record<string, number> = {};
  let totalQuoteValue = 0;
  let totalAreaSqFt = 0;

  for (const job of data ?? []) {
    const lat = job.customer_latitude;
    const lng = job.customer_longitude;
    if (typeof lat !== 'number' || typeof lng !== 'number') continue;

    const quoteValue = safeNumber(job.quote_value);
    const areaSqFt = safeNumber(job.total_area_sqft);

    points.push({
      id: job.id,
      name: job.name ?? 'Mission',
      status: job.status ?? 'unknown',
      coordinates: [lat, lng],
      quoteValue,
      totalAreaSqFt: areaSqFt,
      updatedAt: job.updated_at ?? null,
    });

    totalQuoteValue += quoteValue;
    totalAreaSqFt += areaSqFt;
    const key = (job.status ?? 'unknown').toLowerCase();
    statusCounts[key] = (statusCounts[key] ?? 0) + 1;
  }

  return {
    points,
    statusCounts,
    totalQuoteValue,
    totalAreaSqFt,
    center: computeCenter(points),
  };
}

export function useDivisionMapData() {
  return useQuery({
    queryKey: ['division-map-telemetry'],
    queryFn: fetchDivisionMapTelemetry,
    staleTime: 1000 * 60 * 5,
  });
}

