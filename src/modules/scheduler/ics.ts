import type { WorshipBlackoutDraft, WorshipImportOptions } from '@/modules/scheduler/types';

interface ParsedIcsEvent {
  summary: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
}

const DEFAULT_KEYWORDS = ['service', 'mass', 'worship', 'prayer', 'revival', 'church'];
const DEFAULT_BUFFER_BEFORE_MINUTES = 90;
const DEFAULT_BUFFER_AFTER_MINUTES = 45;
const DEFAULT_DURATION_MINUTES = 120;

function unfoldIcsLines(icsContent: string): string[] {
  const rawLines = icsContent.split(/\r?\n/);
  const lines: string[] = [];
  for (const rawLine of rawLines) {
    if (!rawLine) continue;
    if (rawLine.startsWith(' ')) {
      if (lines.length > 0) {
        lines[lines.length - 1] += rawLine.slice(1);
      }
    } else {
      lines.push(rawLine.trim());
    }
  }
  return lines;
}

function parseParams(token: string): { [key: string]: string } {
  const params: Record<string, string> = {};
  const segments = token.split(';');
  segments.slice(1).forEach((segment) => {
    const [key, value] = segment.split('=');
    if (key && value) {
      params[key.toUpperCase()] = value;
    }
  });
  return params;
}

interface DateComponents {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function extractDateComponents(value: string): DateComponents {
  const datePart = value.includes('T') ? value.split('T')[0] : value;
  const timePart = value.includes('T') ? value.split('T')[1].replace('Z', '') : '';

  return {
    year: Number.parseInt(datePart.slice(0, 4), 10),
    month: Number.parseInt(datePart.slice(4, 6), 10),
    day: Number.parseInt(datePart.slice(6, 8), 10),
    hour: timePart ? Number.parseInt(timePart.slice(0, 2), 10) : 0,
    minute: timePart ? Number.parseInt(timePart.slice(2, 4), 10) : 0,
    second: timePart ? Number.parseInt(timePart.slice(4, 6), 10) : 0,
  };
}

function constructUtcDate(components: DateComponents, timeZone?: string): Date {
  const baseUtc = new Date(
    Date.UTC(
      components.year,
      components.month - 1,
      components.day,
      components.hour,
      components.minute,
      components.second,
    ),
  );
  if (!timeZone) {
    return baseUtc;
  }

  const asInTimeZone = new Date(baseUtc.toLocaleString('en-US', { timeZone }));
  const diff = baseUtc.getTime() - asInTimeZone.getTime();
  return new Date(baseUtc.getTime() + diff);
}

function parseIcsDate(
  value: string,
  params: Record<string, string>,
  options?: WorshipImportOptions,
): string | null {
  if (!value) return null;
  const isDateOnly = params.VALUE === 'DATE' || value.length === 8;
  const components = extractDateComponents(value);
  const tz = value.endsWith('Z') ? 'UTC' : params.TZID || options?.timezone;
  const date = constructUtcDate(components, tz);

  if (isDateOnly) {
    return new Date(
      Date.UTC(components.year, components.month - 1, components.day, 0, 0, 0),
    ).toISOString();
  }

  return date.toISOString();
}

function parseIcsEvents(icsContent: string, options?: WorshipImportOptions): ParsedIcsEvent[] {
  const lines = unfoldIcsLines(icsContent);
  const events: ParsedIcsEvent[] = [];
  let current: Partial<ParsedIcsEvent & { params?: Record<string, string> }> | null = null;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = {};
      continue;
    }
    if (line === 'END:VEVENT') {
      if (current?.start && current.end && current.summary) {
        events.push({
          summary: current.summary,
          description: current.description,
          location: current.location,
          start: current.start,
          end: current.end,
        });
      }
      current = null;
      continue;
    }

    if (!current) continue;

    const [token, rawValue] = line.split(':');
    if (!rawValue) continue;
    const params = parseParams(token);
    const field = token.split(';')[0]?.toUpperCase();

    switch (field) {
      case 'SUMMARY':
        current.summary = rawValue;
        break;
      case 'DESCRIPTION':
        current.description = rawValue;
        break;
      case 'LOCATION':
        current.location = rawValue;
        break;
      case 'DTSTART': {
        const parsed = parseIcsDate(rawValue, params, options);
        if (parsed) current.start = parsed;
        break;
      }
      case 'DTEND': {
        const parsed = parseIcsDate(rawValue, params, options);
        if (parsed) current.end = parsed;
        break;
      }
      default:
        break;
    }
  }

  return events;
}

function applyBuffer(
  startIso: string,
  endIso: string,
  options?: WorshipImportOptions,
): { start: string; end: string } {
  const startDate = new Date(startIso);
  const endDate = new Date(endIso);
  const beforeMinutes = options?.bufferMinutes?.before ?? DEFAULT_BUFFER_BEFORE_MINUTES;
  const afterMinutes = options?.bufferMinutes?.after ?? DEFAULT_BUFFER_AFTER_MINUTES;

  const bufferedStart = new Date(startDate.getTime() - beforeMinutes * 60 * 1000);
  const bufferedEnd = new Date(endDate.getTime() + afterMinutes * 60 * 1000);

  if (bufferedEnd <= bufferedStart) {
    bufferedEnd.setTime(bufferedStart.getTime() + DEFAULT_DURATION_MINUTES * 60 * 1000);
  }

  return { start: bufferedStart.toISOString(), end: bufferedEnd.toISOString() };
}

export function extractWorshipBlackouts(
  icsContent: string,
  options?: WorshipImportOptions,
): WorshipBlackoutDraft[] {
  const events = parseIcsEvents(icsContent, options);
  if (events.length === 0) {
    return [];
  }

  const keywords = (options?.keywords ?? DEFAULT_KEYWORDS).map((keyword) => keyword.toLowerCase());
  const defaultReason = options?.defaultReason ?? 'Worship Service';
  const durationMinutes = options?.defaultDurationMinutes ?? DEFAULT_DURATION_MINUTES;

  const drafts: WorshipBlackoutDraft[] = [];

  events.forEach((event) => {
    const combinedText = `${event.summary ?? ''} ${event.description ?? ''}`.toLowerCase();
    const hasKeyword = keywords.some((keyword) => combinedText.includes(keyword));
    const startDate = new Date(event.start);
    const isWeekend = startDate.getUTCDay() === 0 || startDate.getUTCDay() === 6;

    if (!hasKeyword && !isWeekend) {
      return;
    }

    const reason = event.summary || defaultReason;
    const endIso =
      event.end ||
      new Date(new Date(event.start).getTime() + durationMinutes * 60 * 1000).toISOString();
    const { start, end } = applyBuffer(event.start, endIso, options);

    drafts.push({
      title: reason,
      reason,
      start,
      end,
    });
  });

  const deduped = new Map<string, WorshipBlackoutDraft>();
  drafts.forEach((draft) => {
    const key = `${draft.start}|${draft.end}`;
    if (!deduped.has(key)) {
      deduped.set(key, draft);
    }
  });

  return Array.from(deduped.values()).sort((a, b) => a.start.localeCompare(b.start));
}
