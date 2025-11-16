import type { SupabaseClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';

export interface WorkflowMeasurementSegment {
  id?: string;
  label: string;
  squareFeet?: number | null;
}

export interface WorkflowMeasurementRun {
  id?: string;
  strategy: string;
  status: string;
  squareFeet?: number | null;
  crackLinearFeet?: number | null;
  confidence?: number | null;
  notes?: string | null;
  createdAt?: string;
  segments?: WorkflowMeasurementSegment[];
}

interface UseWorkflowTelemetryResult {
  measurementRuns: WorkflowMeasurementRun[];
  isLoading: boolean;
  error?: string;
  refresh: () => Promise<void>;
  isRemoteSourceActive: boolean;
}

const mapRowToMeasurementRun = (row: any): WorkflowMeasurementRun => ({
  id: row.id,
  strategy: row.strategy,
  status: row.status,
  squareFeet: row.square_feet,
  crackLinearFeet: row.crack_linear_feet,
  confidence: row.confidence,
  notes: row.notes,
  createdAt: row.created_at,
  segments: Array.isArray(row.workflow_measurement_segments)
    ? row.workflow_measurement_segments.map((segment: any) => ({
        id: segment.id,
        label: segment.label,
        squareFeet: segment.square_feet,
      }))
    : [],
});

export function useWorkflowTelemetry(
  jobId?: string | null,
  fallbackRuns: WorkflowMeasurementRun[] = [],
): UseWorkflowTelemetryResult {
  const [measurementRuns, setMeasurementRuns] = useState<WorkflowMeasurementRun[]>(fallbackRuns);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const supabaseClient = useMemo(() => supabase as SupabaseClient<any>, []);

  const normalizedFallback = useMemo(() => fallbackRuns.filter(Boolean), [fallbackRuns]);

  useEffect(() => {
    if (normalizedFallback.length) {
      setMeasurementRuns((existing) => (existing.length ? existing : normalizedFallback));
    }
  }, [normalizedFallback]);

  const fetchRemoteRuns = useCallback(async () => {
    if (!isSupabaseConfigured || !jobId) {
      setError(undefined);
      if (normalizedFallback.length) {
        setMeasurementRuns(normalizedFallback);
      }
      return;
    }

    setIsLoading(true);
    setError(undefined);
      try {
        const { data, error: queryError } = await supabaseClient
        .from('workflow_measurement_runs')
        .select('id, strategy, status, square_feet, crack_linear_feet, confidence, notes, created_at, workflow_measurement_segments ( id, label, square_feet )')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (queryError) {
        throw queryError;
      }

      const mapped = Array.isArray(data) ? data.map(mapRowToMeasurementRun) : [];
      if (mapped.length === 0 && normalizedFallback.length) {
        setMeasurementRuns(normalizedFallback);
      } else {
        setMeasurementRuns(mapped);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load measurement history.';
      setError(message);
      if (normalizedFallback.length) {
        setMeasurementRuns(normalizedFallback);
      }
    } finally {
      setIsLoading(false);
    }
  }, [jobId, normalizedFallback, supabaseClient]);

  useEffect(() => {
    fetchRemoteRuns();
  }, [fetchRemoteRuns]);

  return {
    measurementRuns,
    isLoading,
    error,
    refresh: fetchRemoteRuns,
    isRemoteSourceActive: Boolean(isSupabaseConfigured && jobId),
  };
}
