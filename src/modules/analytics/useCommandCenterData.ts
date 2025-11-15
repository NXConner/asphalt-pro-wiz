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

export interface CommandCenterQueryResult {
  status: 'disabled' | 'error' | 'ready' | 'loading';
  metrics: CommandCenterMetrics | null;
  errorMessage?: string;
}

async function fetchCommandCenterData(): Promise<CommandCenterMetrics> {
  const [jobsRes, estimatesRes] = await Promise.all([
    supabase
      .from('jobs')
      .select('id,status,quote_value,total_area_sqft,created_at,updated_at')
      .limit(500),
    supabase.from('estimates').select('id,job_id,amount,created_at').limit(500),
  ]);

  const errors = [jobsRes.error, estimatesRes.error].filter(Boolean);
  if (errors.length) {
    throw errors[0]!;
  }

  // Type assertions are safe here as we control the query structure
  return calculateCommandCenterMetrics(
    (jobsRes.data ?? []) as unknown as JobRecord[],
    (estimatesRes.data ?? []) as unknown as EstimateRecord[],
    [] as CrewAssignmentRecord[],
  );
}

export function useCommandCenterData(): CommandCenterQueryResult {
  const query = useQuery({
    queryKey: ['command-center-metrics'],
    queryFn: fetchCommandCenterData,
    staleTime: 1000 * 60 * 5,
  });

  if (query.isLoading) {
    return { status: 'loading', metrics: null };
  }

  if (query.isError) {
    logError(query.error, { source: 'command_center' });
    return {
      status: 'error',
      metrics: null,
      errorMessage: query.error instanceof Error ? query.error.message : 'Unknown error',
    };
  }

  if (!query.data) {
    return { status: 'error', metrics: null, errorMessage: 'No metrics available.' };
  }

  return { status: 'ready', metrics: query.data };
}
