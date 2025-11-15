import { act, render } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { MissionSchedulerProvider, useMissionSchedulerContext } from '@/modules/scheduler';

interface HarnessProps {
  onUpdate: (state: ReturnType<typeof useMissionSchedulerContext>) => void;
}

function SchedulerHarness({ onUpdate }: HarnessProps) {
  const scheduler = useMissionSchedulerContext();
  useEffect(() => {
    if (scheduler.ready) onUpdate(scheduler);
  }, [scheduler, onUpdate, scheduler.ready]);
  return null;
}

describe('useMissionScheduler', () => {
  let latest: ReturnType<typeof useMissionSchedulerContext> | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-05T12:00:00Z'));
    localStorage.clear();
    latest = null;
    render(
      <MissionSchedulerProvider>
        <SchedulerHarness
          onUpdate={(state) => {
            latest = state;
          }}
        />
      </MissionSchedulerProvider>,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('creates crew overlap conflict when missions share crew and time', () => {
    if (!latest) throw new Error('scheduler not ready');
    const scheduler = latest;

    let missionAId = '';
    act(() => {
      const crew = scheduler.addCrewMember({
        name: 'Lead',
        role: 'Supervisor',
        maxHoursPerDay: 10,
      });
      const missionA = scheduler.addTask({
        jobName: 'Sealcoat East Lot',
        site: 'East Lot',
        start: new Date('2025-01-06T12:00:00Z').toISOString(),
        end: new Date('2025-01-06T16:00:00Z').toISOString(),
        crewRequired: 2,
        crewAssignedIds: [crew.id],
        status: 'scheduled',
        priority: 'critical',
        accessibilityImpact: 'parking',
        notes: '',
      });
      missionAId = missionA.id;
      scheduler.addTask({
        jobName: 'Striping Chapel Lot',
        site: 'Chapel',
        start: new Date('2025-01-06T14:00:00Z').toISOString(),
        end: new Date('2025-01-06T18:00:00Z').toISOString(),
        crewRequired: 2,
        crewAssignedIds: [crew.id],
        status: 'scheduled',
        priority: 'standard',
        accessibilityImpact: 'parking',
        notes: '',
      });
    });

    expect(
      latest?.conflicts.some(
        (conflict) => conflict.type === 'crew-overlap' && conflict.taskIds.includes(missionAId),
      ),
    ).toBe(true);
  });

  test('detects blackout conflict when mission overlaps protected window', () => {
    if (!latest) throw new Error('scheduler not ready');
    const scheduler = latest;

    let blackoutStart = '';
    act(() => {
      const blackout = scheduler.addBlackout({
        title: 'Sunday Services',
        start: new Date('2025-01-05T13:00:00Z').toISOString(),
        end: new Date('2025-01-05T18:00:00Z').toISOString(),
      });
      blackoutStart = blackout.start;
      scheduler.addTask({
        jobName: 'Main Entrance Prep',
        site: 'Main Entrance',
        start: new Date('2025-01-05T14:00:00Z').toISOString(),
        end: new Date('2025-01-05T17:00:00Z').toISOString(),
        crewRequired: 3,
        crewAssignedIds: [],
        status: 'scheduled',
        priority: 'standard',
        accessibilityImpact: 'entrance',
        notes: '',
      });
    });

    expect(
      latest?.conflicts.some(
        (conflict) => conflict.type === 'blackout' && conflict.window.start === blackoutStart,
      ),
    ).toBe(true);
  });

  test('capacity adjustments persist and affect timeline insights', () => {
    if (!latest) throw new Error('scheduler not ready');
    const scheduler = latest;
    act(() => {
      scheduler.setCapacityPerShift(2);
      scheduler.addTask({
        jobName: 'Parking Lot Milling',
        site: 'West Lot',
        start: new Date('2025-01-07T12:00:00Z').toISOString(),
        end: new Date('2025-01-07T18:00:00Z').toISOString(),
        crewRequired: 4,
        crewAssignedIds: [],
        status: 'scheduled',
        priority: 'critical',
        accessibilityImpact: 'parking',
        notes: '',
      });
    });

    expect(latest?.capacityPerShift).toBe(2);
    expect(latest?.conflicts.some((conflict) => conflict.type === 'capacity')).toBe(true);
  });

    test('imports worship calendar merging overlaps and reporting conflicts', () => {
      if (!latest) throw new Error('scheduler not ready');
      let scheduler = latest;

      act(() => {
        scheduler.addBlackout({
          title: 'Existing Worship',
          start: new Date('2025-01-05T13:00:00Z').toISOString(),
          end: new Date('2025-01-05T17:00:00Z').toISOString(),
        });
        scheduler.addTask({
          jobName: 'Midweek Milling',
          site: 'North Lot',
          start: new Date('2025-01-07T12:30:00Z').toISOString(),
          end: new Date('2025-01-07T14:30:00Z').toISOString(),
          crewRequired: 2,
          crewAssignedIds: [],
          status: 'scheduled',
          priority: 'standard',
          accessibilityImpact: 'parking',
          notes: '',
        });
      });
      scheduler = latest!;

      const icsPayload = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'DTSTART:20250105T120000Z',
        'DTEND:20250105T180000Z',
        'SUMMARY:Sunday Worship Extended',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'DTSTART:20250107T120000Z',
        'DTEND:20250107T150000Z',
        'SUMMARY:Midweek Worship Gathering',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\n');

      let result: ReturnType<typeof scheduler.importBlackoutsFromICS> | null = null;
      act(() => {
        result = scheduler.importBlackoutsFromICS(icsPayload);
      });
      act(() => {});
      scheduler = latest!;

      expect(result).not.toBeNull();
      expect(result?.merged).toBe(1);
      expect(result?.created).toBe(1);
      expect(result?.conflicts.length).toBeGreaterThanOrEqual(1);
      expect(
        result?.conflicts.some((conflict) => conflict.type === 'blackout_overlap'),
      ).toBe(true);
      expect(result?.conflicts.some((conflict) => conflict.type === 'task_overlap')).toBe(true);
      expect(scheduler.blackouts.length).toBeGreaterThanOrEqual(2);

      const exportIcs = scheduler.exportBlackoutsToICS({
        calendarName: 'Exported',
        organization: 'Test Org',
      });
      expect(exportIcs).toContain('BEGIN:VEVENT');
      expect(exportIcs).toContain('SUMMARY:Existing Worship');
      expect(exportIcs).toContain('SUMMARY:Midweek Worship Gathering');
    });
});
