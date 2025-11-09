import {
  addMinutes,
  differenceInMinutes,
  formatISO,
  getDay,
  getHours,
  isSunday,
  parseISO,
} from 'date-fns';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { toast } from 'sonner';

import { logError, logEvent } from '@/lib/logging';
import { extractWorshipBlackouts } from '@/modules/scheduler/ics';
import {
  deleteBlackout,
  deleteCrewMember,
  deleteMissionTask,
  loadSchedulerSnapshot,
  schedulerSyncAvailable,
  upsertBlackout,
  upsertCrewMember,
  upsertMissionTask,
} from '@/modules/scheduler/persistence';
import type {
  AccessibilityImpact,
  BlackoutWindow,
  CrewMember,
  MissionTask,
  MissionTaskPriority,
  MissionTaskStatus,
  WorshipImportOptions,
  WorshipImportResult,
} from '@/modules/scheduler/types';

export type MissionConflictType =
  | 'crew-overlap'
  | 'time-overlap'
  | 'blackout'
  | 'capacity'
  | 'overtime';

export interface MissionConflict {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  type: MissionConflictType;
  taskIds: string[];
  description: string;
  window: { start: string; end: string };
}

export interface AccessibilityInsight {
  id: string;
  severity: 'info' | 'warning';
  taskId: string;
  description: string;
  recommendation: string;
}

export interface CapacitySnapshot {
  slot: string; // ISO timestamp representing the beginning of the slot
  crewScheduled: number;
  capacity: number;
}

export interface MissionSuggestion {
  id: string;
  message: string;
  relatedTaskIds: string[];
}

interface MissionSchedulerPersistentState {
  version: number;
  tasks: MissionTask[];
  crew: CrewMember[];
  blackouts: BlackoutWindow[];
  capacityPerShift: number;
  lastUpdated: number;
}

interface MissionSchedulerState {
  tasks: MissionTask[];
  crew: CrewMember[];
  blackouts: BlackoutWindow[];
  capacityPerShift: number;
  ready: boolean;
  lastUpdated: number;
}

type MissionSchedulerAction =
  | { type: 'hydrate'; payload: MissionSchedulerPersistentState }
  | { type: 'add-task'; payload: MissionTask }
  | { type: 'update-task'; payload: MissionTask }
  | { type: 'remove-task'; payload: string }
  | { type: 'set-task-status'; payload: { id: string; status: MissionTaskStatus } }
  | { type: 'set-tasks'; payload: MissionTask[] }
  | { type: 'set-crew'; payload: CrewMember[] }
  | { type: 'set-blackouts'; payload: BlackoutWindow[] }
  | { type: 'set-capacity'; payload: number }
  | { type: 'touch' };

const STORAGE_KEY = 'pps:scheduler/state@v2';
const LEGACY_CREW_KEY = 'pps:schedule:crew';
const LEGACY_BLACKOUT_KEY = 'pps:schedule:blackouts';
const STORAGE_VERSION = 2;
const SLOT_MINUTES = 30;
const DEFAULT_CAPACITY = 3; // Two full-time + one part-time crew members

function generateFallbackUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = (Math.random() * 16) | 0;
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}

function createId(): string {
  const globalCrypto = (globalThis as typeof globalThis & { crypto?: Crypto }).crypto;
  if (globalCrypto && typeof globalCrypto.randomUUID === 'function') {
    return globalCrypto.randomUUID();
  }
  return generateFallbackUuid();
}

const defaultState: MissionSchedulerState = {
  tasks: [],
  crew: [],
  blackouts: [],
  capacityPerShift: DEFAULT_CAPACITY,
  ready: false,
  lastUpdated: Date.now(),
};

function missionSchedulerReducer(
  state: MissionSchedulerState,
  action: MissionSchedulerAction,
): MissionSchedulerState {
  switch (action.type) {
    case 'hydrate':
      return {
        tasks: action.payload.tasks,
        crew: action.payload.crew,
        blackouts: action.payload.blackouts,
        capacityPerShift: action.payload.capacityPerShift || DEFAULT_CAPACITY,
        ready: true,
        lastUpdated: action.payload.lastUpdated ?? Date.now(),
      };
    case 'add-task':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        lastUpdated: Date.now(),
      };
    case 'update-task':
      return {
        ...state,
        tasks: state.tasks.map((task) => (task.id === action.payload.id ? action.payload : task)),
        lastUpdated: Date.now(),
      };
    case 'remove-task':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
        lastUpdated: Date.now(),
      };
    case 'set-task-status':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? { ...task, status: action.payload.status } : task,
        ),
        lastUpdated: Date.now(),
      };
    case 'set-tasks':
      return {
        ...state,
        tasks: action.payload,
        lastUpdated: Date.now(),
      };
    case 'set-crew':
      return {
        ...state,
        crew: action.payload,
        lastUpdated: Date.now(),
      };
    case 'set-blackouts':
      return {
        ...state,
        blackouts: action.payload,
        lastUpdated: Date.now(),
      };
    case 'set-capacity':
      return {
        ...state,
        capacityPerShift: Math.max(1, Math.round(action.payload)),
        lastUpdated: Date.now(),
      };
    case 'touch':
      return {
        ...state,
        lastUpdated: Date.now(),
      };
    default:
      return state;
  }
}

function loadFromStorage(): MissionSchedulerPersistentState | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MissionSchedulerPersistentState;
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch {
    // ignore parse errors and attempt legacy migration
  }

  // Attempt legacy migration for crew and blackout data
  try {
    const crewRaw = localStorage.getItem(LEGACY_CREW_KEY);
    const blackoutRaw = localStorage.getItem(LEGACY_BLACKOUT_KEY);
    const crew: CrewMember[] = crewRaw
      ? (JSON.parse(crewRaw) as Array<{ id?: string; name: string; role: string }>).map((item) => ({
          id: item.id ?? createId(),
          name: item.name,
          role: item.role || 'Crew',
          maxHoursPerDay: 10,
        }))
      : [];
    const blackouts: BlackoutWindow[] = blackoutRaw
      ? (
          JSON.parse(blackoutRaw) as Array<{
            id?: string;
            title: string;
            start: string;
            end: string;
          }>
        ).map((item) => ({
          id: item.id ?? createId(),
          title: item.title,
          start: item.start,
          end: item.end,
        }))
      : [];
    if (crew.length || blackouts.length) {
      return {
        version: STORAGE_VERSION,
        tasks: [],
        crew,
        blackouts,
        capacityPerShift: DEFAULT_CAPACITY,
        lastUpdated: Date.now(),
      };
    }
  } catch {
    // ignore migration errors
  }

  return null;
}

function persistState(state: MissionSchedulerState) {
  if (typeof window === 'undefined') return;
  const payload: MissionSchedulerPersistentState = {
    version: STORAGE_VERSION,
    tasks: state.tasks,
    crew: state.crew,
    blackouts: state.blackouts,
    capacityPerShift: state.capacityPerShift,
    lastUpdated: state.lastUpdated,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function intervalsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

function minutesBetween(start: Date, end: Date): number {
  return Math.max(0, differenceInMinutes(end, start));
}

function toSlotKey(date: Date): string {
  const flooredMs =
    Math.floor(date.getTime() / (SLOT_MINUTES * 60 * 1000)) * SLOT_MINUTES * 60 * 1000;
  return new Date(flooredMs).toISOString();
}

interface DerivedSchedulerState {
  conflicts: MissionConflict[];
  accessibilityInsights: AccessibilityInsight[];
  capacityTimeline: CapacitySnapshot[];
  suggestions: MissionSuggestion[];
}

function buildDerivedState(
  tasks: MissionTask[],
  crew: CrewMember[],
  blackouts: BlackoutWindow[],
  capacityPerShift: number,
): DerivedSchedulerState {
  const conflicts: MissionConflict[] = [];
  const accessibilityInsights: AccessibilityInsight[] = [];
  const suggestions: MissionSuggestion[] = [];
  const timelineMap = new Map<string, number>();

  const defaultAvailability: Array<'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'> = [
    'sun',
    'mon',
    'tue',
    'wed',
    'thu',
    'fri',
    'sat',
  ];
  const crewAvailability = new Map(
    crew.map((member) => [member.id, member.availability ?? defaultAvailability]),
  );
  const crewHours = new Map(crew.map((member) => [member.id, member.maxHoursPerDay]));

  for (let i = 0; i < tasks.length; i += 1) {
    const task = tasks[i];
    const start = parseISO(task.start);
    const end = parseISO(task.end);
    const duration = minutesBetween(start, end);

    // Capacity timeline aggregation
    const crewLoad = Math.max(task.crewRequired, task.crewAssignedIds.length || 0);
    if (crewLoad > 0 && duration > 0) {
      for (let cursor = new Date(start); cursor < end; cursor = addMinutes(cursor, SLOT_MINUTES)) {
        const key = toSlotKey(cursor);
        timelineMap.set(key, (timelineMap.get(key) ?? 0) + crewLoad);
      }
    }

    // Overtime conflict detection
    const assignedHourAllowance = task.crewAssignedIds.length
      ? task.crewAssignedIds
          .map((id) => crewHours.get(id) ?? 10)
          .reduce((max, value) => Math.max(max, value), 0)
      : 10;
    if (duration > assignedHourAllowance * 60) {
      conflicts.push({
        id: `${task.id}-overtime`,
        severity: 'warning',
        type: 'overtime',
        taskIds: [task.id],
        description: `${task.jobName} exceeds crew daily hours allowance`,
        window: { start: task.start, end: task.end },
      });
    }

    // Accessibility insights
    const startHour = getHours(start);
    const endHour = getHours(end);
    if (isSunday(start) && startHour < 13 && endHour > 7) {
      accessibilityInsights.push({
        id: `${task.id}-sunday`,
        severity: 'warning',
        taskId: task.id,
        description: 'Scheduled during typical Sunday services',
        recommendation:
          'Shift work window to Saturday afternoon or Sunday after 1 PM to respect worship schedules.',
      });
      suggestions.push({
        id: `${task.id}-suggest-sunday`,
        message: `Consider shifting ${task.jobName} to Sunday after 1 PM or a weekday evening to avoid service overlap.`,
        relatedTaskIds: [task.id],
      });
    }

    if (task.accessibilityImpact !== 'none' && startHour < 9) {
      accessibilityInsights.push({
        id: `${task.id}-early-access`,
        severity: 'info',
        taskId: task.id,
        description: 'Accessibility-critical area scheduled before 9 AM',
        recommendation:
          'Verify ADA alternate routes or shift start time after 9 AM to ensure safe arrivals.',
      });
    }

    if (endHour >= 20) {
      accessibilityInsights.push({
        id: `${task.id}-evening-lighting`,
        severity: 'info',
        taskId: task.id,
        description: 'Work extends after 8 PM',
        recommendation:
          'Confirm temporary lighting plan and notify congregation about limited visibility.',
      });
    }

    // Blackout overlaps
    for (const blackout of blackouts) {
      const blackoutStart = parseISO(blackout.start);
      const blackoutEnd = parseISO(blackout.end);
      if (intervalsOverlap(start, end, blackoutStart, blackoutEnd)) {
        conflicts.push({
          id: `${task.id}-blackout-${blackout.id}`,
          severity: 'critical',
          type: 'blackout',
          taskIds: [task.id],
          description: `${task.jobName} overlaps blackout window “${blackout.title}”`,
          window: { start: blackout.start, end: blackout.end },
        });
      }
    }

    for (let j = i + 1; j < tasks.length; j += 1) {
      const other = tasks[j];
      const otherStart = parseISO(other.start);
      const otherEnd = parseISO(other.end);
      if (!intervalsOverlap(start, end, otherStart, otherEnd)) continue;

      const sharedCrew = task.crewAssignedIds.filter((id) => other.crewAssignedIds.includes(id));
      if (sharedCrew.length > 0) {
        conflicts.push({
          id: `${task.id}-${other.id}-crew`,
          severity: 'critical',
          type: 'crew-overlap',
          taskIds: [task.id, other.id],
          description: `${task.jobName} and ${other.jobName} share crew members during overlapping times`,
          window: {
            start: formatISO(maxDate(start, otherStart)),
            end: formatISO(minDate(end, otherEnd)),
          },
        });
      } else {
        conflicts.push({
          id: `${task.id}-${other.id}-overlap`,
          severity: 'warning',
          type: 'time-overlap',
          taskIds: [task.id, other.id],
          description: `${task.jobName} overlaps ${other.jobName} for small crew — review resource load`,
          window: {
            start: formatISO(maxDate(start, otherStart)),
            end: formatISO(minDate(end, otherEnd)),
          },
        });
      }
    }

    // Crew availability hints
    for (const crewId of task.crewAssignedIds) {
      const availability = crewAvailability.get(crewId);
      const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][getDay(start)] as
        | 'sun'
        | 'mon'
        | 'tue'
        | 'wed'
        | 'thu'
        | 'fri'
        | 'sat';
      if (availability && !availability.includes(dayKey)) {
        conflicts.push({
          id: `${task.id}-${crewId}-availability`,
          severity: 'warning',
          type: 'crew-overlap',
          taskIds: [task.id],
          description: `Crew member ${crewId} is not available on scheduled day`,
          window: { start: task.start, end: task.end },
        });
      }
    }
  }

  const capacityTimeline: CapacitySnapshot[] = Array.from(timelineMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([slot, crewScheduled]) => ({ slot, crewScheduled, capacity: capacityPerShift }));

  for (const snapshot of capacityTimeline) {
    if (snapshot.crewScheduled > capacityPerShift) {
      conflicts.push({
        id: `${snapshot.slot}-capacity`,
        severity: 'critical',
        type: 'capacity',
        taskIds: tasks
          .filter((task) =>
            intervalsOverlap(
              parseISO(task.start),
              parseISO(task.end),
              parseISO(snapshot.slot),
              addMinutes(parseISO(snapshot.slot), SLOT_MINUTES),
            ),
          )
          .map((task) => task.id),
        description: `Crew demand ${snapshot.crewScheduled} exceeds available capacity ${capacityPerShift}`,
        window: {
          start: snapshot.slot,
          end: formatISO(addMinutes(parseISO(snapshot.slot), SLOT_MINUTES)),
        },
      });

      suggestions.push({
        id: `${snapshot.slot}-capacity-suggestion`,
        message: 'Split overlapping jobs or extend schedule to avoid crew overload.',
        relatedTaskIds: tasks
          .filter((task) =>
            intervalsOverlap(
              parseISO(task.start),
              parseISO(task.end),
              parseISO(snapshot.slot),
              addMinutes(parseISO(snapshot.slot), SLOT_MINUTES),
            ),
          )
          .map((task) => task.id),
      });
    }
  }

  return { conflicts, accessibilityInsights, capacityTimeline, suggestions };
}

function maxDate(a: Date, b: Date): Date {
  return a > b ? a : b;
}

function minDate(a: Date, b: Date): Date {
  return a < b ? a : b;
}

export interface MissionSchedulerHook {
  ready: boolean;
  tasks: MissionTask[];
  crewMembers: CrewMember[];
  blackouts: BlackoutWindow[];
  capacityPerShift: number;
  conflicts: MissionConflict[];
  accessibilityInsights: AccessibilityInsight[];
  capacityTimeline: CapacitySnapshot[];
  suggestions: MissionSuggestion[];
  persistError: Error | null;
  addTask: (task: Omit<MissionTask, 'id'>) => MissionTask;
  updateTask: (task: MissionTask) => void;
  removeTask: (taskId: string) => void;
  setTaskStatus: (taskId: string, status: MissionTaskStatus) => void;
  rescheduleTask: (taskId: string, start: Date, end: Date) => void;
  assignCrew: (taskId: string, crewIds: string[]) => void;
  addCrewMember: (member: Omit<CrewMember, 'id'>) => CrewMember;
  updateCrewMember: (member: CrewMember) => void;
  removeCrewMember: (crewId: string) => void;
  setCrewAvailability: (crewId: string, availability: CrewMember['availability']) => void;
  addBlackout: (window: Omit<BlackoutWindow, 'id'>) => BlackoutWindow;
  updateBlackout: (window: BlackoutWindow) => void;
  removeBlackout: (blackoutId: string) => void;
  setCapacityPerShift: (capacity: number) => void;
  importBlackoutsFromICS: (
    icsContent: string,
    options?: WorshipImportOptions,
  ) => WorshipImportResult;
}

export function useMissionScheduler(): MissionSchedulerHook {
  const [state, dispatch] = useReducer(missionSchedulerReducer, defaultState);
  const [persistError, setPersistError] = useState<Error | null>(null);
  const derived = useMemo(
    () => buildDerivedState(state.tasks, state.crew, state.blackouts, state.capacityPerShift),
    [state.tasks, state.crew, state.blackouts, state.capacityPerShift],
  );

  const hydratedRef = useRef(false);
  const supabaseEnabledRef = useRef(schedulerSyncAvailable());
  const remoteHydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    const persisted = loadFromStorage();
    if (persisted) {
      dispatch({ type: 'hydrate', payload: persisted });
    } else {
      dispatch({
        type: 'hydrate',
        payload: {
          version: STORAGE_VERSION,
          tasks: [],
          crew: [],
          blackouts: [],
          capacityPerShift: DEFAULT_CAPACITY,
          lastUpdated: Date.now(),
        },
      });
    }
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!state.ready) return;
    try {
      persistState(state);
      setPersistError(null);
    } catch (error) {
      setPersistError(error as Error);
    }
  }, [state]);

  useEffect(() => {
    if (!supabaseEnabledRef.current || !state.ready || remoteHydratedRef.current) return;
    (async () => {
      try {
        const snapshot = await loadSchedulerSnapshot();
        if (snapshot) {
          dispatch({ type: 'set-tasks', payload: snapshot.tasks });
          dispatch({ type: 'set-crew', payload: snapshot.crew });
          dispatch({ type: 'set-blackouts', payload: snapshot.blackouts });
        }
      } catch (error) {
        logError(error, { source: 'scheduler.loadSnapshot' });
        toast.error('Unable to sync scheduler from Supabase');
      } finally {
        remoteHydratedRef.current = true;
      }
    })();
  }, [state.ready]);

  const syncTaskToCloud = useCallback((task: MissionTask) => {
    if (!supabaseEnabledRef.current) return;
    void upsertMissionTask(task).catch(() => {
      toast.error('Failed to sync mission task to Supabase');
    });
  }, []);

  const deleteTaskFromCloud = useCallback((taskId: string) => {
    if (!supabaseEnabledRef.current) return;
    void deleteMissionTask(taskId).catch(() => {
      toast.error('Failed to remove mission task from Supabase');
    });
  }, []);

  const syncCrewToCloud = useCallback((member: CrewMember) => {
    if (!supabaseEnabledRef.current) return;
    void upsertCrewMember(member).catch(() => {
      toast.error('Failed to sync crew member to Supabase');
    });
  }, []);

  const deleteCrewFromCloud = useCallback((crewId: string) => {
    if (!supabaseEnabledRef.current) return;
    void deleteCrewMember(crewId).catch(() => {
      toast.error('Failed to remove crew member from Supabase');
    });
  }, []);

  const syncTasksBatch = useCallback((tasks: MissionTask[]) => {
    if (!supabaseEnabledRef.current || tasks.length === 0) return;
    let notified = false;
    tasks.forEach((task) => {
      void upsertMissionTask(task).catch(() => {
        if (!notified) {
          toast.error('Failed to sync mission tasks to Supabase');
          notified = true;
        }
      });
    });
  }, []);

  const syncBlackoutToCloud = useCallback((window: BlackoutWindow) => {
    if (!supabaseEnabledRef.current) return;
    void upsertBlackout(window).catch(() => {
      toast.error('Failed to sync blackout window to Supabase');
    });
  }, []);

  const deleteBlackoutFromCloud = useCallback((id: string) => {
    if (!supabaseEnabledRef.current) return;
    void deleteBlackout(id).catch(() => {
      toast.error('Failed to remove blackout window from Supabase');
    });
  }, []);

  const addTask = useCallback(
    (task: Omit<MissionTask, 'id'>): MissionTask => {
      const newTask: MissionTask = { id: createId(), ...task };
      dispatch({ type: 'add-task', payload: newTask });
      try {
        logEvent('scheduler.task_created', {
          taskId: newTask.id,
          jobName: newTask.jobName,
          start: newTask.start,
          end: newTask.end,
        });
      } catch {}
      syncTaskToCloud(newTask);
      return newTask;
    },
    [syncTaskToCloud],
  );

  const updateTask = useCallback(
    (task: MissionTask) => {
      dispatch({ type: 'update-task', payload: task });
      try {
        logEvent('scheduler.task_updated', { taskId: task.id });
      } catch {}
      syncTaskToCloud(task);
    },
    [syncTaskToCloud],
  );

  const removeTask = useCallback(
    (taskId: string) => {
      dispatch({ type: 'remove-task', payload: taskId });
      try {
        logEvent('scheduler.task_removed', { taskId });
      } catch {}
      deleteTaskFromCloud(taskId);
    },
    [deleteTaskFromCloud],
  );

  const setTaskStatus = useCallback(
    (taskId: string, status: MissionTaskStatus) => {
      const task = state.tasks.find((item) => item.id === taskId);
      const updated = task ? { ...task, status } : null;
      dispatch({ type: 'set-task-status', payload: { id: taskId, status } });
      try {
        logEvent('scheduler.task_status_changed', { taskId, status });
      } catch {}
      if (updated) {
        syncTaskToCloud(updated);
      }
    },
    [state.tasks, syncTaskToCloud],
  );

  const rescheduleTask = useCallback(
    (taskId: string, start: Date, end: Date) => {
      const task = state.tasks.find((item) => item.id === taskId);
      if (!task) return;
      const updated: MissionTask = {
        ...task,
        start: formatISO(start),
        end: formatISO(end),
      };
      dispatch({
        type: 'update-task',
        payload: updated,
      });
      try {
        logEvent('scheduler.task_rescheduled', {
          taskId,
          start: updated.start,
          end: updated.end,
        });
      } catch {}
      syncTaskToCloud(updated);
    },
    [state.tasks, syncTaskToCloud],
  );

  const assignCrew = useCallback(
    (taskId: string, crewIds: string[]) => {
      const task = state.tasks.find((item) => item.id === taskId);
      if (!task) return;
      const updated: MissionTask = { ...task, crewAssignedIds: Array.from(new Set(crewIds)) };
      dispatch({
        type: 'update-task',
        payload: updated,
      });
      try {
        logEvent('scheduler.task_crew_assigned', { taskId, crewCount: crewIds.length });
      } catch {}
      syncTaskToCloud(updated);
    },
    [state.tasks, syncTaskToCloud],
  );

  const addCrewMember = useCallback(
    (member: Omit<CrewMember, 'id'>): CrewMember => {
      const next: CrewMember = {
        id: createId(),
        availability: member.availability ?? ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
        ...member,
      };
      dispatch({ type: 'set-crew', payload: [...state.crew, next] });
      try {
        logEvent('scheduler.crew_added', { crewId: next.id, role: next.role });
      } catch {}
      syncCrewToCloud(next);
      return next;
    },
    [state.crew, syncCrewToCloud],
  );

  const updateCrewMember = useCallback(
    (member: CrewMember) => {
      dispatch({
        type: 'set-crew',
        payload: state.crew.map((item) => (item.id === member.id ? member : item)),
      });
      syncCrewToCloud(member);
    },
    [state.crew, syncCrewToCloud],
  );

  const removeCrewMember = useCallback(
    (crewId: string) => {
      const nextCrew = state.crew.filter((member) => member.id !== crewId);
      const nextTasks = state.tasks.map((task) =>
        task.crewAssignedIds.includes(crewId)
          ? { ...task, crewAssignedIds: task.crewAssignedIds.filter((id) => id !== crewId) }
          : task,
      );
      const tasksNeedingSync = nextTasks.filter((task) =>
        state.tasks.some(
          (previous) => previous.id === task.id && previous.crewAssignedIds.includes(crewId),
        ),
      );
      dispatch({ type: 'set-crew', payload: nextCrew });
      dispatch({ type: 'set-tasks', payload: nextTasks });
      deleteCrewFromCloud(crewId);
      syncTasksBatch(tasksNeedingSync);
    },
    [state.crew, state.tasks, deleteCrewFromCloud, syncTasksBatch],
  );

  const setCrewAvailability = useCallback(
    (crewId: string, availability: CrewMember['availability']) => {
      const member = state.crew.find((item) => item.id === crewId);
      if (!member) return;
      updateCrewMember({ ...member, availability });
    },
    [state.crew, updateCrewMember],
  );

  const addBlackout = useCallback(
    (window: Omit<BlackoutWindow, 'id'>): BlackoutWindow => {
      const next: BlackoutWindow = { id: createId(), ...window };
      dispatch({ type: 'set-blackouts', payload: [...state.blackouts, next] });
      try {
        logEvent('scheduler.blackout_added', { blackoutId: next.id });
      } catch {}
      syncBlackoutToCloud(next);
      return next;
    },
    [state.blackouts, syncBlackoutToCloud],
  );

  const updateBlackout = useCallback(
    (window: BlackoutWindow) => {
      dispatch({
        type: 'set-blackouts',
        payload: state.blackouts.map((item) => (item.id === window.id ? window : item)),
      });
      syncBlackoutToCloud(window);
    },
    [state.blackouts, syncBlackoutToCloud],
  );

  const removeBlackout = useCallback(
    (blackoutId: string) => {
      dispatch({
        type: 'set-blackouts',
        payload: state.blackouts.filter((item) => item.id !== blackoutId),
      });
      deleteBlackoutFromCloud(blackoutId);
    },
    [state.blackouts, deleteBlackoutFromCloud],
  );

  const importBlackoutsFromICS = useCallback(
    (icsContent: string, options?: WorshipImportOptions): WorshipImportResult => {
      const drafts = extractWorshipBlackouts(icsContent, options);
      if (drafts.length === 0) {
        toast.info('No worship services detected in uploaded calendar');
        return { totalEvents: 0, created: 0, updated: 0, skipped: 0 };
      }

      const existingByKey = new Map(
        state.blackouts.map((blackout) => [`${blackout.start}|${blackout.end}`, blackout]),
      );

      let created = 0;
      let updated = 0;
      drafts.forEach((draft) => {
        const key = `${draft.start}|${draft.end}`;
        const existing = existingByKey.get(key);
        if (existing) {
          updateBlackout({ ...existing, title: draft.title, reason: draft.reason });
          updated += 1;
        } else {
          addBlackout(draft);
          created += 1;
        }
      });

      const skipped = drafts.length - (created + updated);
      toast.success(`Worship calendar synced (${created} added, ${updated} refreshed)`);
      return {
        totalEvents: drafts.length,
        created,
        updated,
        skipped,
      };
    },
    [addBlackout, state.blackouts, updateBlackout],
  );

  const setCapacityPerShift = useCallback((capacity: number) => {
    dispatch({ type: 'set-capacity', payload: capacity });
    try {
      logEvent('scheduler.capacity_updated', { capacity });
    } catch {}
  }, []);

  return {
    ready: state.ready,
    tasks: state.tasks,
    crewMembers: state.crew,
    blackouts: state.blackouts,
    capacityPerShift: state.capacityPerShift,
    conflicts: derived.conflicts,
    accessibilityInsights: derived.accessibilityInsights,
    capacityTimeline: derived.capacityTimeline,
    suggestions: derived.suggestions,
    persistError,
    addTask,
    updateTask,
    removeTask,
    setTaskStatus,
    rescheduleTask,
    assignCrew,
    addCrewMember,
    updateCrewMember,
    removeCrewMember,
    setCrewAvailability,
    addBlackout,
    updateBlackout,
    removeBlackout,
    setCapacityPerShift,
    importBlackoutsFromICS,
  };
}
