import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';
import type { MissionCrewMemberRow, MissionTaskRow } from '@/integrations/supabase/types-helpers';
import { logError, logEvent } from '@/lib/logging';
import { getCurrentUserId, resolveOrgId } from '@/lib/supabaseOrg';
import type { BlackoutWindow, CrewMember, MissionTask } from '@/modules/scheduler/types';

const DEFAULT_AVAILABILITY: CrewMember['availability'] = [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
];

interface SchedulerSnapshot {
  tasks: MissionTask[];
  crew: CrewMember[];
  blackouts: BlackoutWindow[];
}

export const schedulerSyncAvailable = () => isSupabaseConfigured;

export async function loadSchedulerSnapshot(): Promise<SchedulerSnapshot | null> {
  if (!isSupabaseConfigured) return null;

  const orgId = await resolveOrgId();
  if (!orgId) return null;

  const [{ data: taskRows, error: taskError }, { data: crewRows, error: crewError }, { data: blackoutRows, error: blackoutError }] =
    await Promise.all([
      (supabase as any)
        .from('mission_tasks')
        .select(
          'id, org_id, job_id, job_name, site, start_at, end_at, crew_required, crew_assigned_ids, status, priority, accessibility_impact, notes, color, metadata'
        )
        .eq('org_id', orgId)
        .order('start_at', { ascending: true }),
      (supabase as any)
        .from('mission_crew_members')
        .select(
          'id, org_id, name, role, color, max_hours_per_day, availability, metadata'
        )
        .eq('org_id', orgId)
        .order('name', { ascending: true }),
      (supabase as any)
        .from('crew_blackouts')
        .select('id, org_id, starts_at, ends_at, reason')
        .eq('org_id', orgId)
        .order('starts_at', { ascending: true }),
    ]);

  if (taskError) throw taskError;
  if (crewError) throw crewError;
  if (blackoutError) throw blackoutError;

  const tasks: MissionTask[] = ((taskRows as any) ?? []).map((row: any) => ({
    id: row.id,
    jobId: row.job_id ?? undefined,
    jobName: row.job_name ?? 'Mission',
    site: row.site ?? undefined,
    start: row.start_at,
    end: row.end_at,
    crewRequired: row.crew_required,
    crewAssignedIds: row.crew_assigned_ids ?? [],
    status: row.status,
    priority: row.priority,
    accessibilityImpact: row.accessibility_impact,
    notes: row.notes ?? undefined,
    color: row.color ?? undefined,
  }));

  const crew: CrewMember[] = ((crewRows as any) ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    role: row.role ?? 'Crew Member',
    color: row.color ?? undefined,
    maxHoursPerDay: row.max_hours_per_day,
    availability: (row.availability?.length ? row.availability : DEFAULT_AVAILABILITY) as CrewMember['availability'],
  }));

  const blackouts: BlackoutWindow[] = ((blackoutRows as any) ?? []).map((row: any) => ({
    id: row.id,
    title: row.reason ?? 'Blackout',
    reason: row.reason ?? 'Unavailable',
    start: row.starts_at,
    end: row.ends_at,
  }));

  return { tasks, crew, blackouts };
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function upsertMissionTask(task: MissionTask) {
  if (!isSupabaseConfigured) return;
  try {
    if (!UUID_REGEX.test(task.id)) {
      logEvent('scheduler.task_sync_skipped', { taskId: task.id, reason: 'invalid_task_id' });
      return;
    }
    const orgId = await resolveOrgId();
    const userId = await getCurrentUserId();
    if (!orgId) return;

    const payload: any = {
      id: task.id,
      org_id: orgId,
      job_id: task.jobId ?? null,
      job_name: task.jobName ?? null,
      site: task.site ?? null,
      start_at: task.start,
      end_at: task.end,
      crew_required: task.crewRequired,
      crew_assigned_ids: (task.crewAssignedIds ?? []).filter((id) => UUID_REGEX.test(id)),
      status: task.status,
      priority: task.priority,
      accessibility_impact: task.accessibilityImpact,
      notes: task.notes ?? null,
      color: task.color ?? null,
      metadata: { source: 'scheduler' },
      created_by: userId ?? undefined,
    };

    const { error } = await (supabase as any)
      .from('mission_tasks')
      .upsert(payload, { onConflict: 'id' });
    if (error) throw error;

    logEvent('scheduler.task_synced', { taskId: task.id, mode: 'upsert' });
  } catch (error) {
    logError(error, { source: 'scheduler.persist.task', taskId: task.id });
    throw error;
  }
}

export async function deleteMissionTask(taskId: string) {
  if (!isSupabaseConfigured) return;
  try {
    if (!UUID_REGEX.test(taskId)) {
      return;
    }
    const { error } = await (supabase as any).from('mission_tasks').delete().eq('id', taskId);
    if (error) throw error;
    logEvent('scheduler.task_deleted', { taskId });
  } catch (error) {
    logError(error, { source: 'scheduler.delete.task', taskId });
    throw error;
  }
}

export async function upsertCrewMember(member: CrewMember) {
  if (!isSupabaseConfigured) return;
  try {
    if (!UUID_REGEX.test(member.id)) {
      logEvent('scheduler.crew_sync_skipped', { crewId: member.id, reason: 'invalid_crew_id' });
      return;
    }
    const orgId = await resolveOrgId();
    const userId = await getCurrentUserId();
    if (!orgId) return;

    const payload: any = {
      id: member.id,
      org_id: orgId,
      name: member.name,
      role: member.role,
      color: member.color,
      max_hours_per_day: member.maxHoursPerDay,
      availability: member.availability ?? DEFAULT_AVAILABILITY,
      metadata: { source: 'scheduler' },
      created_by: userId ?? undefined,
    };

    const { error } = await (supabase as any)
      .from('mission_crew_members')
      .upsert(payload, { onConflict: 'id' });
    if (error) throw error;

    logEvent('scheduler.crew_synced', { crewId: member.id, mode: 'upsert' });
  } catch (error) {
    logError(error, { source: 'scheduler.persist.crew', crewId: member.id });
    throw error;
  }
}

export async function deleteCrewMember(crewId: string) {
  if (!isSupabaseConfigured) return;
  try {
    if (!UUID_REGEX.test(crewId)) {
      return;
    }
    const { error } = await (supabase as any).from('mission_crew_members').delete().eq('id', crewId);
    if (error) throw error;
    logEvent('scheduler.crew_deleted', { crewId });
  } catch (error) {
    logError(error, { source: 'scheduler.delete.crew', crewId });
    throw error;
  }
}

export async function upsertBlackout(window: BlackoutWindow) {
  if (!isSupabaseConfigured) return;
  try {
    if (!UUID_REGEX.test(window.id)) {
      logEvent('scheduler.blackout_sync_skipped', { blackoutId: window.id, reason: 'invalid_blackout_id' });
      return;
    }
    const orgId = await resolveOrgId();
    const userId = await getCurrentUserId();
    if (!orgId) return;

    const payload = {
      id: window.id,
      org_id: orgId,
      starts_at: window.start,
      ends_at: window.end,
      reason: window.title || window.reason || 'Blackout',
      created_by: userId ?? undefined,
    };

    const { error } = await (supabase as any).from('crew_blackouts').insert(payload);
    if (error) throw error;

    logEvent('scheduler.blackout_synced', { blackoutId: window.id, mode: 'upsert' });
  } catch (error) {
    logError(error, { source: 'scheduler.persist.blackout', blackoutId: window.id });
    throw error;
  }
}

export async function deleteBlackout(id: string) {
  if (!isSupabaseConfigured) return;
  try {
    if (!UUID_REGEX.test(id)) {
      return;
    }
    const { error } = await (supabase as any).from('crew_blackouts').delete().eq('id', id);
    if (error) throw error;
    logEvent('scheduler.blackout_deleted', { blackoutId: id });
  } catch (error) {
    logError(error, { source: 'scheduler.delete.blackout', blackoutId: id });
    throw error;
  }
}
