import type { SupabaseClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';

export interface WorkflowOutreachTouchpoint {
  id?: string;
  channel: string;
  status: string;
  subject?: string | null;
  body?: string | null;
  contact?: Record<string, unknown> | null;
  scheduledAt?: string | null;
  sentAt?: string | null;
  createdAt?: string | null;
}

export interface UseWorkflowOutreachResult {
  touchpoints: WorkflowOutreachTouchpoint[];
  isLoading: boolean;
  error?: string;
  refresh: () => Promise<void>;
  isRemoteSourceActive: boolean;
}

const mapTouchpoint = (row: any): WorkflowOutreachTouchpoint => ({
  id: row.id,
  channel: row.channel,
  status: row.status,
  subject: row.subject,
  body: row.body,
  contact: row.contact,
  scheduledAt: row.scheduled_at,
  sentAt: row.sent_at,
  createdAt: row.created_at,
});

export function useWorkflowOutreach(jobId?: string | null): UseWorkflowOutreachResult {
  const [touchpoints, setTouchpoints] = useState<WorkflowOutreachTouchpoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const supabaseClient = useMemo(() => supabase as SupabaseClient<any>, []);

  const fetchTouchpoints = useCallback(async () => {
    if (!isSupabaseConfigured || !jobId) {
      setTouchpoints([]);
      setError(undefined);
      return;
    }

    setIsLoading(true);
    setError(undefined);
    try {
      const { data, error: queryError } = await supabaseClient
        .from('workflow_outreach_touchpoints')
        .select('id, channel, status, subject, body, contact, scheduled_at, sent_at, created_at')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })
        .limit(6);

      if (queryError) throw queryError;
      setTouchpoints(Array.isArray(data) ? data.map(mapTouchpoint) : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load outreach log.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [jobId, supabaseClient]);

  useEffect(() => {
    fetchTouchpoints();
  }, [fetchTouchpoints]);

  return {
    touchpoints,
    isLoading,
    error,
    refresh: fetchTouchpoints,
    isRemoteSourceActive: Boolean(isSupabaseConfigured && jobId),
  };
}
