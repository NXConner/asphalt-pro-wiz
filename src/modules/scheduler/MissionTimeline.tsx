import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { addDays, addMinutes, differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';
import type { Layout } from 'react-grid-layout';
import GridLayout, { WidthProvider } from 'react-grid-layout';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useMissionSchedulerContext } from './MissionSchedulerContext';

const TimelineGrid = WidthProvider(GridLayout);

const COLS = 48; // 30-minute increments
const ROW_HEIGHT = 88;
const MARGIN: [number, number] = [12, 12];

const statusTone: Record<string, string> = {
  planned: 'bg-slate-700/70 border-slate-400/40',
  scheduled: 'bg-slate-800/80 border-cyan-400/40',
  in_progress: 'bg-cyan-500/25 border-cyan-300/60',
  completed: 'bg-emerald-500/20 border-emerald-400/50',
  blocked: 'bg-red-500/20 border-red-400/50',
};

const statusLabel: Record<string, string> = {
  planned: 'Planned',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Complete',
  blocked: 'Blocked',
};

interface MissionTimelineProps {
  weekStart: Date;
  onShiftWeek: (nextStart: Date) => void;
}

export function MissionTimeline({ weekStart, onShiftWeek }: MissionTimelineProps) {
  const { tasks, conflicts, rescheduleTask, setTaskStatus } = useMissionSchedulerContext();

  const weekEnd = addDays(weekStart, 7);
  const weeklyTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const start = parseISO(task.start);
        const end = parseISO(task.end);
        return end > weekStart && start < weekEnd;
      }),
    [tasks, weekStart, weekEnd],
  );

  const conflictIds = useMemo(() => new Set(conflicts.flatMap((conflict) => conflict.taskIds)), [conflicts]);

  const layout: Layout[] = weeklyTasks.map((task) => {
    const start = parseISO(task.start);
    const end = parseISO(task.end);
    const clampedStart = start < weekStart ? weekStart : start;
    const dayIndex = Math.max(0, Math.min(6, differenceInCalendarDays(startOfDay(clampedStart), startOfDay(weekStart))));
    const minutesFromMidnight = Math.max(0, Math.round((clampedStart.getHours() * 60 + clampedStart.getMinutes()) / 30) * 30);
    const x = Math.min(COLS - 1, Math.floor(minutesFromMidnight / 30));
    const durationMinutes = Math.max(30, Math.round((end.getTime() - start.getTime()) / (1000 * 60)));
    const width = Math.min(COLS - x, Math.max(1, Math.round(durationMinutes / 30)));
    return {
      i: task.id,
      x,
      y: dayIndex,
      w: width,
      h: 1,
      minW: 1,
      maxW: COLS,
      isResizable: true,
      isDraggable: true,
    } satisfies Layout;
  });

  const handleDragStop: GridLayout.ItemCallback = (_layout, _oldItem, newItem) => {
    applyPosition(newItem);
  };

  const handleResizeStop: GridLayout.ItemCallback = (_layout, _oldItem, newItem) => {
    applyPosition(newItem);
  };

  const applyPosition = (item?: Layout) => {
    if (!item) return;
    const task = weeklyTasks.find((mission) => mission.id === item.i);
    if (!task) return;
    const clampedY = Math.max(0, Math.min(6, item.y ?? 0));
    const clampedX = Math.max(0, Math.min(COLS - 1, item.x ?? 0));
    const width = Math.max(1, Math.min(COLS - clampedX, item.w ?? 1));
    const dayStart = addDays(startOfDay(weekStart), clampedY);
    const startTime = addMinutes(dayStart, clampedX * 30);
    const endTime = addMinutes(startTime, width * 30);
    rescheduleTask(task.id, startTime, endTime);
  };

  const shiftWeek = (delta: number) => {
    onShiftWeek(addDays(weekStart, delta * 7));
  };

  return (
    <Card className="border-white/10 bg-slate-950/70">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-100">
              Mission Timeline
            </CardTitle>
            <p className="text-xs text-slate-300/80">
              Drag missions to reschedule. Resize to adjust duration. We capture conflicts live.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => shiftWeek(-1)}>
              ← Prev Week
            </Button>
            <Badge variant="outline" className="border-white/20 bg-white/5 text-[10px] uppercase tracking-[0.28em] text-slate-200">
              {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d')}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => shiftWeek(1)}>
              Next Week →
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <TimelineAxis />
        <div className="flex items-start gap-4 overflow-x-auto">
          <DayLabels weekStart={weekStart} />
          <div className="min-w-[1024px] flex-1">
            <TimelineGrid
              className="timeline-grid"
              cols={COLS}
              rowHeight={ROW_HEIGHT}
              margin={MARGIN}
              containerPadding={[0, 0]}
              compactType={null}
              preventCollision
              onDragStop={handleDragStop}
              onResizeStop={handleResizeStop}
              draggableCancel=".mission-timeline-actions"
              layout={layout}
              isResizable
              isDraggable
            >
              {weeklyTasks.map((task) => {
                const start = parseISO(task.start);
                const end = parseISO(task.end);
                const conflicting = conflictIds.has(task.id);
                const tone = statusTone[task.status] ?? statusTone.scheduled;
                return (
                  <div key={task.id} className={`mission-item relative h-full w-full overflow-hidden rounded-2xl border backdrop-blur ${tone}`} data-task-id={task.id}>
                    <div className="flex h-full w-full flex-col justify-between gap-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-50">
                            {task.jobName}
                          </p>
                          {task.site ? (
                            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-200/80">
                              {task.site}
                            </p>
                          ) : null}
                        </div>
                        <Badge
                          variant="outline"
                          className={`border-white/20 bg-white/10 text-[10px] uppercase tracking-[0.3em] text-slate-100 ${conflicting ? 'border-red-400/60 text-red-100' : ''}`}
                        >
                          {statusLabel[task.status] ?? task.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-slate-100/80">
                          {format(start, 'EEE h:mma')} → {format(end, 'h:mma')}
                        </p>
                        {task.notes ? (
                          <p className="line-clamp-2 text-[11px] text-slate-100/70">{task.notes}</p>
                        ) : null}
                      </div>
                      <div className="mission-timeline-actions flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.25em]">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-slate-100/80">
                          Crew {Math.max(task.crewRequired, task.crewAssignedIds.length)}
                        </span>
                        <div className="flex items-center gap-2">
                          {task.status !== 'completed' ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setTaskStatus(task.id, 'completed')}
                            >
                              Mark Complete
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setTaskStatus(task.id, 'scheduled')}
                            >
                              Reopen
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    {conflicting ? (
                      <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-red-500/60" />
                    ) : null}
                  </div>
                );
              })}
            </TimelineGrid>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DayLabels({ weekStart }: { weekStart: Date }) {
  return (
    <div className="sticky left-0 top-0 z-10 flex w-40 flex-col gap-[12px] pt-[124px]">
      {Array.from({ length: 7 }).map((_, index) => {
        const day = addDays(weekStart, index);
        return (
          <div
            key={index}
            className="h-[88px] rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.3em] text-slate-200 shadow-[0_10px_30px_rgba(15,23,42,0.45)]"
          >
            <p className="text-xs font-semibold text-slate-100">{format(day, 'EEE')}</p>
            <p className="text-[11px] text-slate-200/80">{format(day, 'MMM d')}</p>
          </div>
        );
      })}
    </div>
  );
}

function TimelineAxis() {
  const hours = Array.from({ length: 25 }).map((_, index) => index);
  return (
    <div className="ml-40 flex min-w-[1024px] items-center gap-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-slate-100/70">
      {hours.map((hour) => (
        <div key={hour} className="flex-1 border-l border-white/5 text-center first:border-l-0">
          {hour}:00
        </div>
      ))}
    </div>
  );
}

