import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { logEvent } from '@/lib/logging';
import { invokeSupplierIntelligence } from '@/modules/estimate/supplier/api';
import type {
  SupplierIntelHookParams,
  SupplierIntelRequest,
  SupplierIntelResponse,
} from '@/modules/estimate/supplier/types';

function normalizeMaterials(materials: string[] | undefined): string[] {
  if (!materials) return [];
  const unique = new Set<string>();
  for (const entry of materials) {
    const normalized = entry?.trim();
    if (!normalized) continue;
    unique.add(normalized);
  }
  return Array.from(unique);
}

function buildRequest(params: SupplierIntelHookParams): SupplierIntelRequest {
  const materials = normalizeMaterials(params.materials);
  const radiusMiles =
    typeof params.radiusMiles === 'number' && Number.isFinite(params.radiusMiles)
      ? Math.max(0, params.radiusMiles)
      : undefined;
  const jobLocation =
    params.jobLocation &&
    Number.isFinite(params.jobLocation.lat) &&
    Number.isFinite(params.jobLocation.lng)
      ? params.jobLocation
      : undefined;

  return {
    materials: materials.length > 0 ? materials : undefined,
    radiusMiles,
    jobLocation,
    includeAiSummary: params.includeAiSummary,
  };
}

export function useSupplierIntelligence(params: SupplierIntelHookParams) {
  const { materials, radiusMiles, jobLocation, includeAiSummary, enabled = true } = params;

  const request = useMemo(
    () =>
      buildRequest({
        materials,
        radiusMiles,
        jobLocation,
        includeAiSummary,
      }),
    [materials, radiusMiles, jobLocation, includeAiSummary],
  );
  const key = useMemo(
    () => [
      'supplier-intelligence',
      request.materials?.slice().sort().join('|') ?? 'none',
      request.radiusMiles ?? 'default',
      request.jobLocation?.lat ?? 'lat:na',
      request.jobLocation?.lng ?? 'lng:na',
    ],
    [request.materials, request.radiusMiles, request.jobLocation?.lat, request.jobLocation?.lng],
  );

  const shouldFetch = enabled && Boolean(request.materials && request.materials.length > 0);

  return useQuery<SupplierIntelResponse, Error>({
    queryKey: key,
    queryFn: () => invokeSupplierIntelligence(request),
    enabled: shouldFetch,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    meta: { feature: 'supplier-intelligence' },
  });
}
