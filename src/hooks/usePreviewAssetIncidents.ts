import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';

import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/lib/logging';

export type PreviewIncidentSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface PreviewAssetIncident {
  id: string;
  org_id: string | null;
  user_id: string | null;
  created_by: string | null;
  session_id: string | null;
  device_id: string | null;
  event_type: string;
  severity: PreviewIncidentSeverity;
  asset_url: string | null;
  asset_tag: string | null;
  page_url: string | null;
  referrer: string | null;
  reason: string | null;
  message: string | null;
  environment: string | null;
  user_agent: string | null;
  incident_hash: string | null;
  occurred_at: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface PreviewAssetIncidentSummary {
  asset_url: string | null;
  page_url: string | null;
  event_type: string;
  severity: PreviewIncidentSeverity;
  total_events: number;
  last_occurred_at: string | null;
  first_occurred_at: string | null;
  events_last_hour: number;
  events_last_day: number;
}

export interface PreviewAssetIncidentStats {
  total: number;
  lastHour: number;
  lastDay: number;
  affectedAssets: number;
  mostRecentOccurredAt: string | null;
  severityCounts: Record<PreviewIncidentSeverity, number>;
}

export interface PreviewAssetIncidentsResult {
  incidents: PreviewAssetIncident[];
  summary: PreviewAssetIncidentSummary[];
  stats: PreviewAssetIncidentStats;
  hasActiveAlert: boolean;
}

const DEFAULT_STATS: PreviewAssetIncidentStats = {
  total: 0,
  lastHour: 0,
  lastDay: 0,
  affectedAssets: 0,
  mostRecentOccurredAt: null,
  severityCounts: {
    info: 0,
    warning: 0,
    error: 0,
    critical: 0,
  },
};

const QUERY_KEY = ['lovable-preview-asset-incidents'] as const;

interface FetchOptions {
  limit: number;
}

async function fetchPreviewAssetIncidents({ limit }: FetchOptions) {
  const [incidentsRes, summaryRes] = await Promise.all([
    supabase
      .from('preview_asset_incidents' as any)
      .select('*')
      .order('occurred_at', { ascending: false })
      .limit(limit),
    supabase
      .from('preview_asset_incident_summary' as any)
      .select('*')
      .order('last_occurred_at', { ascending: false }),
  ]);

  const errors = [incidentsRes.error, summaryRes.error].filter(Boolean);
  if (errors.length > 0) {
    throw errors[0]!;
  }

  const incidents = Array.isArray(incidentsRes.data) ? (incidentsRes.data as unknown as PreviewAssetIncident[]) : [];
  const summary = Array.isArray(summaryRes.data) ? (summaryRes.data as unknown as PreviewAssetIncidentSummary[]) : [];

  return {
    incidents,
    summary,
  };
}

function computeStats(incidents: PreviewAssetIncident[], summary: PreviewAssetIncidentSummary[]): PreviewAssetIncidentStats {
  if (!incidents.length && !summary.length) {
    return DEFAULT_STATS;
  }

  const severityCounts: Record<PreviewIncidentSeverity, number> = {
    info: 0,
    warning: 0,
    error: 0,
    critical: 0,
  };

  for (const row of incidents) {
    severityCounts[row.severity] = (severityCounts[row.severity] ?? 0) + 1;
  }

  let total = 0;
  let lastHour = 0;
  let lastDay = 0;

  for (const row of summary) {
    total += Number(row.total_events ?? 0);
    lastHour += Number(row.events_last_hour ?? 0);
    lastDay += Number(row.events_last_day ?? 0);
  }

  const uniqueAssets = new Set<string>();
  for (const row of summary) {
    if (row.asset_url) uniqueAssets.add(row.asset_url);
    else if (row.page_url) uniqueAssets.add(row.page_url);
  }

  const mostRecentOccurredAt = incidents[0]?.occurred_at ?? summary[0]?.last_occurred_at ?? null;

  return {
    total,
    lastHour,
    lastDay,
    affectedAssets: uniqueAssets.size,
    mostRecentOccurredAt,
    severityCounts,
  };
}

export interface UsePreviewAssetIncidentsOptions {
  enabled?: boolean;
  pollingIntervalMs?: number;
  limit?: number;
}

export function usePreviewAssetIncidents(
  options: UsePreviewAssetIncidentsOptions = {},
): UseQueryResult<PreviewAssetIncidentsResult> {
  const { enabled = true, pollingIntervalMs = 60_000, limit = 50 } = options;

  const query = useQuery({
    queryKey: QUERY_KEY,
    enabled,
    refetchInterval: enabled ? pollingIntervalMs : false,
    queryFn: async () => {
      try {
        return await fetchPreviewAssetIncidents({ limit });
      } catch (error) {
        logError(error, { source: 'observability.preview_incidents' });
        throw error;
      }
    },
  });

  const value: PreviewAssetIncidentsResult | undefined = useMemo(() => {
    if (!query.data) return undefined;
    const stats = computeStats(query.data.incidents, query.data.summary);
    const hasActiveAlert =
      stats.lastHour > 0 || stats.severityCounts.critical > 0 || stats.severityCounts.error > 0;

    return {
      incidents: query.data.incidents,
      summary: query.data.summary,
      stats,
      hasActiveAlert,
    };
  }, [query.data]);

  return {
    ...query,
    data: value,
  } as UseQueryResult<PreviewAssetIncidentsResult>;
}
