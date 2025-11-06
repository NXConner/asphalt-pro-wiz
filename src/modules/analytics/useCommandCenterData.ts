import { useQuery } from '@tanstack/react-query';

import {
  calculateCommandCenterMetrics,
  type CommandCenterMetrics,
  type CrewAssignmentRecord,
  type EstimateRecord,
  type JobRecord,
} from './commandCenter';

import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/lib/logging';
import { useRealtime } from '@/hooks/useRealtime';

export interface CommandCenterQueryResult {
  status: 'disabled' | 'error' | 'ready' | 'loading';
  metrics: CommandCenterMetrics | null;
  errorMessage?: string;
  isRealtimeConnected: boolean;
  refetch: () => Promise<any>;
  isFetching: boolean;
}

  async function fetchCommandCenterData(): Promise<CommandCenterMetrics> {
    const [jobsRes, estimatesRes] = await Promise.all([
      supabase
        .from('jobs' as any)
        .select('id,status,quote_value,total_area_sqft,created_at,updated_at')
        .limit(500),
      supabase.from('estimates' as any).select('id,job_id,amount,created_at').limit(500),
    ]);

    const errors = [jobsRes.error, estimatesRes.error].filter(Boolean);
    if (errors.length) {
      throw errors[0]!;
    }

    return calculateCommandCenterMetrics(
      (jobsRes.data ?? []) as any as JobRecord[],
      (estimatesRes.data ?? []) as any as EstimateRecord[],
      [] as CrewAssignmentRecord[],
    );
}

export function useCommandCenterData(): CommandCenterQueryResult {
  const query = useQuery({
    queryKey: ['command-center-metrics'],
    queryFn: fetchCommandCenterData,
    staleTime: 1000 * 60 * 5,
  });

  const jobsRealtime = useRealtime({
    table: 'jobs',
    invalidateQueries: [['command-center-metrics']],
  });

  const estimatesRealtime = useRealtime({
    table: 'estimates',
    invalidateQueries: [['command-center-metrics']],
  });

  const isRealtimeConnected = jobsRealtime.isConnected && estimatesRealtime.isConnected;

  if (query.isLoading) {
    return { status: 'loading', metrics: null, isRealtimeConnected, refetch: query.refetch, isFetching: query.isFetching };
  }

  if (query.isError) {
    logError(query.error, { source: 'command_center' });
    return {
      status: 'error',
      metrics: null,
      errorMessage: query.error instanceof Error ? query.error.message : 'Unknown error',
      isRealtimeConnected,
      refetch: query.refetch,
      isFetching: query.isFetching,
    };
  }

  if (!query.data) {
    return {
      status: 'error',
      metrics: null,
      errorMessage: 'No metrics available.',
      isRealtimeConnected,
      refetch: query.refetch,
      isFetching: query.isFetching,
    };
  }

  return {
    status: 'ready',
    metrics: query.data,
    isRealtimeConnected,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
