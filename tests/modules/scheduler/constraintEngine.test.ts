import { describe, expect, it } from 'vitest';

import { evaluateSchedulerConstraints } from '@/modules/scheduler/constraintEngine';
import type { BlackoutWindow, CrewMember, MissionTask } from '@/modules/scheduler/types';

function buildTask(overrides: Partial<MissionTask>): MissionTask {
  return {
    id: 'task-default',
    jobName: 'Default Job',
    start: '2025-01-01T08:00:00.000Z',
    end: '2025-01-01T10:00:00.000Z',
    crewRequired: 1,
    crewAssignedIds: [],
    status: 'planned',
    priority: 'standard',
    accessibilityImpact: 'none',
    ...overrides,
  };
}

const crew: CrewMember[] = [{ id: 'crew-1', name: 'Alpha', role: 'Lead', maxHoursPerDay: 8 }];

describe('evaluateSchedulerConstraints', () => {
  it('detects capacity overloads and produces suggestions', () => {
    const tasks: MissionTask[] = [
      buildTask({
        id: 'task-1',
        start: '2025-01-01T08:00:00.000Z',
        end: '2025-01-01T12:00:00.000Z',
        crewRequired: 2,
      }),
      buildTask({
        id: 'task-2',
        start: '2025-01-01T08:30:00.000Z',
        end: '2025-01-01T11:30:00.000Z',
        crewRequired: 2,
      }),
    ];

    const result = evaluateSchedulerConstraints({
      tasks,
      crew,
      blackouts: [],
      capacityPerShift: 2,
    });

    expect(result.conflicts.some((conflict) => conflict.type === 'capacity')).toBe(true);
    expect(result.suggestions.some((suggestion) => suggestion.id.includes('capacity'))).toBe(true);
  });

  it('flags insufficient rest between assignments for the same crew member', () => {
    const tasks: MissionTask[] = [
      buildTask({
        id: 'task-1',
        crewAssignedIds: ['crew-1'],
        start: '2025-01-02T08:00:00.000Z',
        end: '2025-01-02T11:00:00.000Z',
      }),
      buildTask({
        id: 'task-2',
        crewAssignedIds: ['crew-1'],
        start: '2025-01-02T11:15:00.000Z',
        end: '2025-01-02T13:00:00.000Z',
      }),
    ];

    const result = evaluateSchedulerConstraints({
      tasks,
      crew,
      blackouts: [],
      capacityPerShift: 4,
    });

    expect(result.conflicts.some((conflict) => conflict.id.includes('crew-rest'))).toBe(true);
  });

  it('suggests buffer when tasks abut blackout windows', () => {
    const tasks: MissionTask[] = [
      buildTask({
        id: 'task-1',
        start: '2025-01-03T14:00:00.000Z',
        end: '2025-01-03T16:00:00.000Z',
      }),
    ];
    const blackouts: BlackoutWindow[] = [
      {
        id: 'blackout-1',
        title: 'Worship Service',
        start: '2025-01-03T16:15:00.000Z',
        end: '2025-01-03T18:00:00.000Z',
      },
    ];

    const result = evaluateSchedulerConstraints({
      tasks,
      crew,
      blackouts,
      capacityPerShift: 3,
    });

    expect(result.suggestions.some((suggestion) => suggestion.id.includes('blackout-buffer'))).toBe(
      true,
    );
  });
});
