import { describe, expect, it } from 'vitest';

import { extractWorshipBlackouts } from '@/modules/scheduler/ics';

const sampleCalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Pavement Performance Suite//Mission Scheduler//EN
BEGIN:VEVENT
UID:svc-001
SUMMARY:Sunday Worship Service
DTSTART:20250511T100000Z
DTEND:20250511T120000Z
DESCRIPTION:Primary worship gathering
LOCATION:Sanctuary
END:VEVENT
BEGIN:VEVENT
UID:mtg-001
SUMMARY:Operations Planning Meeting
DTSTART:20250512T150000Z
DTEND:20250512T160000Z
DESCRIPTION:Internal meeting - should not create a blackout
END:VEVENT
END:VCALENDAR`;

describe('extractWorshipBlackouts', () => {
  it('captures worship services as blackout windows with buffers applied', () => {
    const blackouts = extractWorshipBlackouts(sampleCalendar);
    expect(blackouts).toHaveLength(1);
    const blackout = blackouts[0];
    expect(blackout.title).toContain('Sunday Worship Service');
    expect(new Date(blackout.start).getTime()).toBeLessThan(new Date('2025-05-11T10:00:00Z').getTime());
    expect(new Date(blackout.end).getTime()).toBeGreaterThan(new Date('2025-05-11T12:00:00Z').getTime());
  });

  it('handles timezone-tagged events and custom buffers', () => {
    const calendar = `BEGIN:VCALENDAR\nBEGIN:VEVENT\nSUMMARY:Saturday Vigil\nDTSTART;TZID=America/New_York:20250510T190000\nDTEND;TZID=America/New_York:20250510T203000\nEND:VEVENT\nEND:VCALENDAR`;
    const blackouts = extractWorshipBlackouts(calendar, {
      keywords: ['vigil'],
      bufferMinutes: { before: 30, after: 30 },
      defaultDurationMinutes: 60,
    });
    expect(blackouts).toHaveLength(1);
    const blackout = blackouts[0];
    expect(blackout.title).toBe('Saturday Vigil');
    expect(new Date(blackout.start).toISOString()).toBeDefined();
    expect(new Date(blackout.end).getTime()).toBeGreaterThan(new Date(blackout.start).getTime());
  });
});
