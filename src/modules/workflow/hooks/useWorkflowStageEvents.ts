import type { SupabaseClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';
import type { WorkflowStageId } from '../types';

export interface WorkflowStageEvent {
  id?: string;
  stageId: WorkflowStageId;
  status: string;
  notes?: string | null;
  createdAt?: string;
  performedBy?: string | null;
}

export interface UseWorkflowStageEventsResult {
  events: WorkflowStageEvent[];
  isLoading: boolean;
  error?: string;
  refresh: () => Promise<void>;
  isRemoteSourceActive: boolean;
}

const mapStageEvent = (row: any): WorkflowStageEvent => ({
  id: row.id,
  stageId: (row.stage_id ?? 'measure') as WorkflowStageId,
  status: row.status,
  notes: row.notes,
  createdAt: row.created_at,
  performedBy: row.performed_by,
});

export function useWorkflowStageEvents(jobId?: string | null): UseWorkflowStageEventsResult {
  const [events, setEvents] = useState<WorkflowStageEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const supabaseClient = useMemo(() => supabase as SupabaseClient<any>, []);

  const fetchEvents = useCallback(async () => {
    if (!isSupabaseConfigured || !jobId) {
      setEvents([]);
      setError(undefined);
      return;
    }

    setIsLoading(true);
    setError(undefined);
    try {
      const { data, error: queryError } = await supabaseClient
        .from('workflow_stage_events')
        .select('id, stage_id, status, notes, created_at, performed_by')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })
        .limit(8);

      if (queryError) throw queryError;
      setEvents(Array.isArray(data) ? data.map(mapStageEvent) : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load workflow activity.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [jobId, supabaseClient]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    isLoading,
    error,
    refresh: fetchEvents,
    isRemoteSourceActive: Boolean(isSupabaseConfigured && jobId),
  };
}
