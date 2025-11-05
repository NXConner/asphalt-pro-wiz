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
  // Return empty data since the jobs table schema doesn't have the required columns yet
  return {
    points: [],
    statusCounts: {},
    totalQuoteValue: 0,
    totalAreaSqFt: 0,
    center: [36.7783, -78.6569],
  };
}

export function useDivisionMapData() {
  return useQuery({
    queryKey: ['division-map-telemetry'],
    queryFn: fetchDivisionMapTelemetry,
    staleTime: 1000 * 60 * 5,
  });
}

