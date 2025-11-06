import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';

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

export function useJobTelemetryStats() {
  return useQuery({
    queryKey: ['job-telemetry-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_telemetry')
        .select('status, quote_value, area_sqft, location_lat, location_lng, customer_address, created_at')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      // Calculate statistics
      const stats = {
        totalJobs: data.length,
        statusCounts: {} as Record<string, number>,
        totalQuoteValue: 0,
        totalAreaSqft: 0,
        recentJobs: data.slice(0, 10),
        jobsByLocation: data.filter(j => j.location_lat && j.location_lng),
      };

      data.forEach((job) => {
        if (job.status) {
          stats.statusCounts[job.status] = (stats.statusCounts[job.status] || 0) + 1;
        }
        if (job.quote_value) {
          stats.totalQuoteValue += Number(job.quote_value);
        }
        if (job.area_sqft) {
          stats.totalAreaSqft += Number(job.area_sqft);
        }
      });

      return stats;
    },
  });
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
