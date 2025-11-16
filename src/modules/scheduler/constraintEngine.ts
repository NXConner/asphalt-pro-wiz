import { addMinutes, differenceInMinutes, parseISO } from 'date-fns';

import type {
  BlackoutWindow,
  CrewMember,
  MissionConflict,
  MissionSuggestion,
  MissionTask,
} from '@/modules/scheduler/types';

interface ConstraintEngineInput {
  tasks: MissionTask[];
  crew: CrewMember[];
  blackouts: BlackoutWindow[];
  capacityPerShift: number;
}

interface ConstraintEngineOptions {
  slotMinutes?: number;
  minRestMinutes?: number;
  blackoutBufferMinutes?: number;
}

const DEFAULT_SLOT_MINUTES = 30;
const DEFAULT_MIN_REST_MINUTES = 60;
const DEFAULT_BLACKOUT_BUFFER_MINUTES = 60;

function toSlotKey(date: Date, slotMinutes: number): string {
  const millis = slotMinutes * 60 * 1000;
  const floored = Math.floor(date.getTime() / millis) * millis;
  return new Date(floored).toISOString();
}

function collectTimeline(
  tasks: MissionTask[],
  slotMinutes: number,
): Map<string, { load: number; taskIds: Set<string> }> {
  const timeline = new Map<string, { load: number; taskIds: Set<string> }>();
  tasks.forEach((task) => {
    const start = parseISO(task.start);
    const end = parseISO(task.end);
    if (!(start instanceof Date) || !(end instanceof Date) || start >= end) {
      return;
    }
    const crewLoad = Math.max(task.crewRequired, task.crewAssignedIds.length || 0, 1);
    for (let cursor = new Date(start); cursor < end; cursor = addMinutes(cursor, slotMinutes)) {
      const key = toSlotKey(cursor, slotMinutes);
      const entry = timeline.get(key) ?? { load: 0, taskIds: new Set<string>() };
      entry.load += crewLoad;
      entry.taskIds.add(task.id);
      timeline.set(key, entry);
    }
  });
  return timeline;
}

function evaluateCapacityConflicts(
  timeline: Map<string, { load: number; taskIds: Set<string> }>,
  capacityPerShift: number,
  slotMinutes: number,
): { conflicts: MissionConflict[]; suggestions: MissionSuggestion[] } {
  const conflicts: MissionConflict[] = [];
  const suggestions: MissionSuggestion[] = [];

  timeline.forEach((entry, slot) => {
    if (entry.load <= capacityPerShift) return;
    const overload = entry.load - capacityPerShift;
    const severity = overload >= 2 ? 'critical' : 'warning';
    const windowStart = slot;
    const windowEnd = addMinutes(parseISO(slot), slotMinutes).toISOString();
    const taskIds = Array.from(entry.taskIds);

    conflicts.push({
      id: `capacity-${slot}`,
      severity,
      type: 'capacity',
      taskIds,
      description: `Crew load ${entry.load} exceeds capacity ${capacityPerShift}.`,
      window: { start: windowStart, end: windowEnd },
    });

    suggestions.push({
      id: `capacity-suggestion-${slot}`,
      message: `Redistribute missions overlapping ${new Date(
        windowStart,
      ).toLocaleString()} to avoid overloading crews.`,
      relatedTaskIds: taskIds,
    });
  });

  return { conflicts, suggestions };
}

function evaluateCrewRestConflicts(
  tasks: MissionTask[],
  crew: CrewMember[],
  minRestMinutes: number,
): { conflicts: MissionConflict[]; suggestions: MissionSuggestion[] } {
  const conflicts: MissionConflict[] = [];
  const suggestions: MissionSuggestion[] = [];

  crew.forEach((member) => {
    const assignments = tasks
      .filter((task) => task.crewAssignedIds.includes(member.id))
      .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime());

    for (let i = 0; i < assignments.length - 1; i += 1) {
      const current = assignments[i];
      const next = assignments[i + 1];
      const restGap = differenceInMinutes(parseISO(next.start), parseISO(current.end));
      if (restGap >= minRestMinutes) {
        continue;
      }

      conflicts.push({
        id: `crew-rest-${member.id}-${current.id}-${next.id}`,
        severity: restGap <= minRestMinutes / 2 ? 'critical' : 'warning',
        type: 'crew-overlap',
        taskIds: [current.id, next.id],
        description: `${member.name} has only ${restGap} minutes between assignments.`,
        window: { start: current.end, end: next.start },
      });

      suggestions.push({
        id: `crew-rest-suggestion-${member.id}-${current.id}-${next.id}`,
        message: `Provide ${member.name} at least ${minRestMinutes} minutes between ${current.jobName} and ${next.jobName}.`,
        relatedTaskIds: [current.id, next.id],
      });
    }
  });

  return { conflicts, suggestions };
}

function evaluateBlackoutProximity(
  tasks: MissionTask[],
  blackouts: BlackoutWindow[],
  bufferMinutes: number,
): MissionSuggestion[] {
  const suggestions: MissionSuggestion[] = [];
  const bufferMs = bufferMinutes * 60 * 1000;

  tasks.forEach((task) => {
    const taskStart = parseISO(task.start).getTime();
    const taskEnd = parseISO(task.end).getTime();

    blackouts.forEach((blackout) => {
      const blackoutStart = parseISO(blackout.start).getTime();
      const blackoutEnd = parseISO(blackout.end).getTime();

      const startsSoonAfterBlackout =
        taskStart >= blackoutEnd && taskStart - blackoutEnd <= bufferMs;
      const endsCloseBeforeBlackout =
        taskEnd <= blackoutStart && blackoutStart - taskEnd <= bufferMs;

      if (startsSoonAfterBlackout || endsCloseBeforeBlackout) {
        suggestions.push({
          id: `blackout-buffer-${task.id}-${blackout.id}`,
          message: `Provide additional buffer between worship blackout "${blackout.title}" and ${task.jobName}.`,
          relatedTaskIds: [task.id],
        });
      }
    });
  });

  return suggestions;
}

export function evaluateSchedulerConstraints(
  input: ConstraintEngineInput,
  options?: ConstraintEngineOptions,
): { conflicts: MissionConflict[]; suggestions: MissionSuggestion[] } {
  const slotMinutes = options?.slotMinutes ?? DEFAULT_SLOT_MINUTES;
  const minRestMinutes = options?.minRestMinutes ?? DEFAULT_MIN_REST_MINUTES;
  const blackoutBufferMinutes = options?.blackoutBufferMinutes ?? DEFAULT_BLACKOUT_BUFFER_MINUTES;

  const timeline = collectTimeline(input.tasks, slotMinutes);
  const capacityInsights = evaluateCapacityConflicts(
    timeline,
    Math.max(1, input.capacityPerShift),
    slotMinutes,
  );
  const restInsights = evaluateCrewRestConflicts(input.tasks, input.crew, minRestMinutes);
  const blackoutSuggestions = evaluateBlackoutProximity(
    input.tasks,
    input.blackouts,
    blackoutBufferMinutes,
  );

  return {
    conflicts: [...capacityInsights.conflicts, ...restInsights.conflicts],
    suggestions: [
      ...capacityInsights.suggestions,
      ...restInsights.suggestions,
      ...blackoutSuggestions,
    ],
  };
}
