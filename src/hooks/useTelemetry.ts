import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';

const JOB_TELEMETRY_STATS_QUERY_KEY = ['job-telemetry-stats'] as const;

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

function safeNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function resolveTimestamp(value?: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

// ============================================
// CREW TELEMETRY HOOKS
// ============================================

export interface CrewTelemetryEvent {
  crew_id: string;
  event_type: 'shift_start' | 'shift_end' | 'break' | 'job_assigned' | 'job_completed' | 'location_update' | 'status_change';
  status?: 'active' | 'inactive' | 'on_break' | 'off_duty';
  location_lat?: number;
  location_lng?: number;
  metadata?: Record<string, any>;
}

export function useCrewTelemetry(crewId?: string) {
  return useQuery({
    queryKey: ['crew-telemetry', crewId],
    queryFn: async () => {
      let query = supabase
        .from('crew_telemetry')
        .select('*')
        .order('created_at', { ascending: false });

      if (crewId) {
        query = query.eq('crew_id', crewId);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
    enabled: !!crewId,
  });
}

export function useInsertCrewTelemetry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: CrewTelemetryEvent) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('crew_telemetry')
        .insert({
          ...event,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-telemetry'] });
    },
    onError: (error) => {
      toast.error(`Failed to log crew telemetry: ${error.message}`);
    },
  });
}

// ============================================
// JOB TELEMETRY HOOKS
// ============================================

export interface JobTelemetryEvent {
  job_id: string;
  event_type: 'created' | 'status_changed' | 'assigned' | 'started' | 'paused' | 'completed' | 'cancelled' | 'estimate_generated';
  status?: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  quote_value?: number;
  area_sqft?: number;
  location_lat?: number;
  location_lng?: number;
  customer_address?: string;
  metadata?: Record<string, any>;
}

type JobTelemetryStatus = NonNullable<JobTelemetryEvent['status']>;

const ACTIVE_JOB_TELEMETRY_STATUSES: readonly JobTelemetryStatus[] = ['scheduled', 'in_progress'] as const;

export interface JobTelemetryDistributionEntry {
  status: JobTelemetryStatus | string;
  count: number;
  percentage: number;
}

interface JobTelemetryAggregateRow {
  job_id: string | null;
  status: JobTelemetryStatus | null;
  quote_value: number | string | null;
  area_sqft: number | string | null;
  location_lat: number | string | null;
  location_lng: number | string | null;
  customer_address: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface JobTelemetryStats {
  totalJobs: number;
  activeJobs: number;
  statusCounts: Record<string, number>;
  statusDistribution: JobTelemetryDistributionEntry[];
  totalQuoteValue: number;
  totalAreaSqft: number;
  recentJobs: JobTelemetryAggregateRow[];
  jobsByLocation: JobTelemetryAggregateRow[];
  mappedJobCount: number;
  lastEventAt: string | null;
}

export function useJobTelemetry(jobId?: string) {
  return useQuery({
    queryKey: ['job-telemetry', jobId],
    queryFn: async () => {
      let query = supabase
        .from('job_telemetry')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobId) {
        query = query.eq('job_id', jobId);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });
}

interface JobTelemetryStatsOptions {
  subscribe?: boolean;
  staleTime?: number;
}

export function useJobTelemetryStats(options: JobTelemetryStatsOptions = {}) {
  const { subscribe = true, staleTime } = options;
  const queryClient = useQueryClient();
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  const query = useQuery({
    queryKey: JOB_TELEMETRY_STATS_QUERY_KEY,
    staleTime: staleTime ?? 1000 * 15,
    gcTime: ONE_DAY_IN_MS,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_telemetry')
        .select('job_id, status, quote_value, area_sqft, location_lat, location_lng, customer_address, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      const stats: JobTelemetryStats = {
        totalJobs: 0,
        activeJobs: 0,
        statusCounts: {},
        statusDistribution: [],
        totalQuoteValue: 0,
        totalAreaSqft: 0,
        recentJobs: [],
        jobsByLocation: [],
        mappedJobCount: 0,
        lastEventAt: null,
      };

      if (!data || data.length === 0) {
        return stats;
      }

      const jobMap = new Map<string, JobTelemetryAggregateRow>();

      for (const jobRow of data) {
        const job = jobRow as JobTelemetryAggregateRow;
        const key = job.job_id ?? `__${job.created_at}`;
        const candidateTimestamp = resolveTimestamp(job.updated_at ?? job.created_at);

        if (!jobMap.has(key)) {
          jobMap.set(key, job);
          continue;
        }

        const existing = jobMap.get(key)!;
        const existingTimestamp = resolveTimestamp(existing.updated_at ?? existing.created_at) ?? 0;

        if (candidateTimestamp === null || candidateTimestamp >= existingTimestamp) {
          jobMap.set(key, job);
        }
      }

      const uniqueJobs = Array.from(jobMap.values());
      let mostRecentTimestamp = 0;

      for (const job of uniqueJobs) {
        const statusKey = (job.status ?? 'unknown').toLowerCase();
        stats.statusCounts[statusKey] = (stats.statusCounts[statusKey] ?? 0) + 1;

        stats.totalQuoteValue += safeNumber(job.quote_value);
        stats.totalAreaSqft += safeNumber(job.area_sqft);

        const timestamp = resolveTimestamp(job.updated_at ?? job.created_at);
        if (timestamp && timestamp > mostRecentTimestamp) {
          mostRecentTimestamp = timestamp;
        }

        if (
          job.location_lat !== null &&
          job.location_lat !== undefined &&
          job.location_lng !== null &&
          job.location_lng !== undefined
        ) {
          stats.jobsByLocation.push(job);
        }
      }

      stats.mappedJobCount = stats.jobsByLocation.length;
      stats.totalJobs = uniqueJobs.length;
      stats.activeJobs = ACTIVE_JOB_TELEMETRY_STATUSES.reduce(
        (count, status) => count + (stats.statusCounts[status] || 0),
        0,
      );

      stats.statusDistribution = Object.entries(stats.statusCounts)
        .map(([status, count]) => ({
          status,
          count,
          percentage: stats.totalJobs > 0 ? (count / stats.totalJobs) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);

      const recentSorted = [...uniqueJobs].sort((a, b) => {
        const aTime = resolveTimestamp(a.updated_at ?? a.created_at) ?? 0;
        const bTime = resolveTimestamp(b.updated_at ?? b.created_at) ?? 0;
        return bTime - aTime;
      });

      stats.recentJobs = recentSorted.slice(0, 10);
      stats.jobsByLocation = recentSorted.filter(
        (job) => job.location_lat !== null && job.location_lat !== undefined && job.location_lng !== null && job.location_lng !== undefined,
      );
      stats.mappedJobCount = stats.jobsByLocation.length;
      stats.lastEventAt = mostRecentTimestamp ? new Date(mostRecentTimestamp).toISOString() : null;

      return stats;
    },
  });

  useEffect(() => {
    if (!subscribe) {
      setIsRealtimeConnected(false);
      return;
    }

    let isMounted = true;

    const channel = supabase
      .channel('job_telemetry_stats_live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_telemetry',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: JOB_TELEMETRY_STATS_QUERY_KEY });
        },
      )
      .subscribe((status) => {
        if (!isMounted) {
          return;
        }

        if (status === 'SUBSCRIBED') {
          setIsRealtimeConnected(true);
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setIsRealtimeConnected(false);
        }
      });

    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, [queryClient, subscribe]);

  return {
    ...query,
    isRealtimeConnected,
  };
}

export function useInsertJobTelemetry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: JobTelemetryEvent) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('job_telemetry')
        .insert({
          ...event,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-telemetry'] });
      queryClient.invalidateQueries({ queryKey: ['job-telemetry-stats'] });
      queryClient.invalidateQueries({ queryKey: ['division-map-telemetry'] });
    },
    onError: (error) => {
      toast.error(`Failed to log job telemetry: ${error.message}`);
    },
  });
}

// ============================================
// EQUIPMENT TELEMETRY HOOKS
// ============================================

export interface EquipmentTelemetryEvent {
  equipment_id: string;
  event_type: 'usage_start' | 'usage_end' | 'maintenance' | 'repair' | 'status_change' | 'location_update';
  status?: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
  location_lat?: number;
  location_lng?: number;
  hours_used?: number;
  fuel_level?: number;
  metadata?: Record<string, any>;
}

export function useEquipmentTelemetry(equipmentId?: string) {
  return useQuery({
    queryKey: ['equipment-telemetry', equipmentId],
    queryFn: async () => {
      let query = supabase
        .from('equipment_telemetry')
        .select('*')
        .order('created_at', { ascending: false });

      if (equipmentId) {
        query = query.eq('equipment_id', equipmentId);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
    enabled: !!equipmentId,
  });
}

export function useInsertEquipmentTelemetry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: EquipmentTelemetryEvent) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('equipment_telemetry')
        .insert({
          ...event,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-telemetry'] });
    },
    onError: (error) => {
      toast.error(`Failed to log equipment telemetry: ${error.message}`);
    },
  });
}

// ============================================
// SYSTEM TELEMETRY HOOKS
// ============================================

export interface SystemTelemetryEvent {
  event_type: string;
  event_category?: 'system' | 'user_action' | 'error' | 'warning' | 'info' | 'audit';
  severity?: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  message?: string;
  metadata?: Record<string, any>;
}

export function useSystemTelemetry(category?: string) {
  return useQuery({
    queryKey: ['system-telemetry', category],
    queryFn: async () => {
      let query = supabase
        .from('system_telemetry')
        .select('*')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('event_category', category);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });
}

export function useInsertSystemTelemetry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: SystemTelemetryEvent) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('system_telemetry')
        .insert({
          ...event,
          user_id: user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-telemetry'] });
    },
  });
}
